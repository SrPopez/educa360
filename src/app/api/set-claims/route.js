import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
    try {
        initializeApp({ projectId: "educa360-dev" });
    } catch (error) {
        console.error("Error inicializando Admin:", error);
    }
}

export async function POST(request) {
    try {
        const { uid, email, telefono } = await request.json();
        if (!uid) return NextResponse.json({ error: "UID requerido" }, { status: 400 });

        const authAdmin = getAuth();
        
        const updateData = {};
        if (telefono) updateData.phoneNumber = telefono;

        const emailLower = (email || "").toLowerCase();
        let role = "paciente";
        if (emailLower.includes("adminsistema")) role = "admin_sistema";
        else if (emailLower.includes("medico")) role = "profesional_sanitario";
        else if (emailLower.includes("administracion")) role = "admin";
        else if (emailLower.includes("alumno")) role = "alumno_practicas";
        else if (emailLower.includes("editor")) role = "editor_contenidos";

        await authAdmin.setCustomUserClaims(uid, { role });
        
        if (Object.keys(updateData).length > 0) {
        await authAdmin.updateUser(uid, updateData);
        }

        return NextResponse.json({ success: true, role });
    } catch (error) {
        console.error("Error en API set-claims:", error);
        return NextResponse.json({ success: true, message: "Procesado localmente" }, { status: 200 });
    }
}