"use client";

import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function AccesoDenegadoPage() {
    const router = useRouter();
    const [rutaDestino, setRutaDestino] = useState("/login");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setRutaDestino("/login");
                return;
            }

            try {
                const userDocRef = doc(db, "usuarios", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                let rol = "paciente";
                if (userDoc.exists()) {
                    rol = userDoc.data().role || "paciente";
                } else {
                    rol = localStorage.getItem(`rol_${user.email}`) || "paciente";
                }

                const rolLower = rol.toLowerCase();
                const emailLower = user.email.toLowerCase();

                if (
                    rolLower.includes("administración") || 
                    rolLower.includes("administracion") || 
                    emailLower.includes("administracion@") ||
                    emailLower.includes("gestion")
                ) {
                    setRutaDestino("/admin-general/dashboard");
                } 
                else if (rolLower.includes("profesional") || rolLower.includes("medico") || emailLower.includes("medico")) {
                    setRutaDestino("/medico/dashboard");
                } 
                else if (rolLower.includes("admin_sistema") || rolLower === "admin") {
                    setRutaDestino("/admin/dashboard");
                } 
                else if (rolLower.includes("alumno") || rolLower.includes("practicas")) {
                    setRutaDestino("/alumno/dashboard");
                } 
                else if (rolLower.includes("editor")) {
                    setRutaDestino("/editor/dashboard");
                } 
                else {
                    setRutaDestino("/paciente/dashboard");
                }
            } catch (error) {
                console.error("Error al determinar la ruta de retorno:", error);
                setRutaDestino("/login");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-slate-900">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-10 space-y-6 text-center">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center border border-rose-100 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acceso No Disponible</h2>
                    <p className="text-xs text-slate-500 leading-relaxed px-2">
                        Lo sentimos, este contenido no está disponible para tu cuenta o el recurso solicitado no existe.
                    </p>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => router.push(rutaDestino)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                        Volver a mi panel principal
                    </button>
                </div>
            </div>
        </main>
    );
}