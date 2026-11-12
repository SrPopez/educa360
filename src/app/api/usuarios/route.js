import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (process.env.NODE_ENV === "development") {
            process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
        }

        if (!getApps().length) {
            if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
                initializeApp({
                    credential: cert({
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    }),
                });
            } else {
                initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "educa360-dev"
                });
            }
        }

        const authAdmin = getAuth();
        
        const listUsersResult = await authAdmin.listUsers(1000);
        
        const usuarios = listUsersResult.users.map((userRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email || "Sin correo",
            autorizado: userRecord.emailVerified,
            role: userRecord.customClaims?.role || (userRecord.email?.includes("admin") ? "admin" : "paciente"),
            fuente: "Emulador Local Firebase Auth"
        }));

        return NextResponse.json({ 
            success: true, 
            usuarios 
        }, { 
            status: 200,
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });

    } catch (error) {
        console.error("Error al conectar con el emulador de Firebase:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}