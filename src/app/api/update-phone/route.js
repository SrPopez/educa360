import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

if (!getApps().length) {
    initializeApp({
        projectId: "educa360-dev",
    });
}

export async function POST(request) {
    try {
        const { uid, telefono, role } = await request.json();

        if (!uid || !telefono) {
        return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        const rawPhone = String(telefono).replace(/\s+/g, "");

        if (!rawPhone.startsWith("+")) {
        return NextResponse.json(
            { error: "El número de teléfono debe incluir el prefijo internacional (ej. +34)." },
            { status: 400 }
        );
        }

        const updateData = { phoneNumber: rawPhone };
        if (role) {
        updateData.customClaims = { role };
        }

        await getAuth().updateUser(uid, updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}