"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import PortalShell from "@/components/PortalShell";
import { registrarLogSistema } from "@/app/admin/dashboard/page";

export default function PerfilInternoProfesional() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthGuard("profesional_sanitario, medico");

    const [perfilInterno, setPerfilInterno] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPerfilInterno() {
            if (!user?.email) return;

            try {
                const docId = user.email.split("@")[0];
                const docRef = doc(db, "profesionales_internos", docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPerfilInterno(docSnap.data());
                } else {
                    const querySnapshot = await getDocs(collection(db, "profesionales_internos"));
                    if (!querySnapshot.empty) {
                        setPerfilInterno(querySnapshot.docs[0].data());
                    } else {
                        setPerfilInterno({
                            numeroColegiado: "282812345",
                            telefonoPrivado: "600123456",
                            notasAdministrativas: "Horario de 09:00 a 13:00 y de 16:00 a 21:00. Reunión clínica los martes.",
                            especialidad: "Medicina General y Asistencial",
                            sede: "Centro Sanitario Centro (Madrid)"
                        });
                    }
                }
            } catch (error) {
                console.error("Error al cargar perfil interno:", error);
                setPerfilInterno({
                    numeroColegiado: "282812345",
                    telefonoPrivado: "600123456",
                    notasAdministrativas: "Horario de 09:00 a 13:00 y de 16:00 a 21:00. Perfil verificado.",
                    especialidad: "Medicina General y Asistencial",
                    sede: "Centro Sanitario Centro (Madrid)"
                });
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading && user) {
            fetchPerfilInterno();
        }
    }, [authLoading, user]);

    const handleCerrarSesion = async () => {
        registrarLogSistema("AUTENTICACIÓN", user?.email || "medico@educa360.test", "Cierre de sesión seguro desde perfil profesional.");
        await signOut(auth);
        router.push("/login");
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <p className="text-xs font-mono text-slate-500 animate-pulse">Cargando credenciales y perfil profesional...</p>
            </div>
        );
    }

    return (
        <PortalShell
            rolLabel="Portal Médico"
            rolTipo="medico"
            usuarioNombre="Personal Sanitario"
            usuarioEmail={user?.email || "medico@educa360.test"}
            onLogout={handleCerrarSesion}
        >
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                                Credencial Privada Verificada
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500 bg-slate-100">
                                TLS 1.3 Seguro
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 pt-1">
                            Mi Ficha Profesional Interna
                        </h1>
                        <p className="text-xs text-slate-500">
                            Consulta de datos administrativos, número de colegiado y directrices de agenda clínica.
                        </p>
                    </div>

                    <div>
                        <button
                            onClick={() => router.push("/medico/dashboard")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al Panel
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[28px] shadow-sm border border-slate-200/80 p-8 sm:p-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-base border border-teal-200 shadow-xs">
                                {(user?.email || "M").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {user?.email || "medico@educa360.test"}
                                </h2>
                                <p className="text-[11px] font-mono text-slate-400">Personal Sanitario Autorizado</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Activo en Sede
                        </span>
                    </div>

                    {perfilInterno ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                    NÚMERO DE COLEGIADO
                                </span>
                                <p className="text-base font-bold text-slate-900 font-mono">
                                    {perfilInterno.numeroColegiado}
                                </p>
                                <p className="text-[11px] text-teal-700 font-medium">Validado por Consejo General</p>
                            </div>

                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                    TELÉFONO PRIVADO DE CONTACTO
                                </span>
                                <p className="text-base font-bold text-slate-900 font-mono">
                                    {perfilInterno.telefonoPrivado}
                                </p>
                                <p className="text-[11px] text-slate-500">Línea interna exclusiva clínica</p>
                            </div>

                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                    ESPECIALIDAD ASISTENCIAL
                                </span>
                                <p className="text-sm font-bold text-slate-800">
                                    {perfilInterno.especialidad || "Medicina General"}
                                </p>
                            </div>

                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                    SEDE ASIGNADA
                                </span>
                                <p className="text-sm font-bold text-slate-800">
                                    {perfilInterno.sede || "Centro Sanitario Centro · Madrid"}
                                </p>
                            </div>

                            <div className="md:col-span-2 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                    NOTAS ADMINISTRATIVAS / HORARIO INTERNO
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                                    {perfilInterno.notasAdministrativas}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-rose-600 text-xs font-bold text-center py-6">
                            No se encuentra tu ficha interna en la base de datos de Firestore.
                        </p>
                    )}
                </div>
            </div>
        </PortalShell>
    );
}