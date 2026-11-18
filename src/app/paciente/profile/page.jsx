"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuthGuard } from "@/lib/useAuthGuard";
import PortalShell from "@/components/PortalShell";
import { Tarjeta } from "@/components/ComponentesUI";
import { EstadoCargando } from "@/components/EstadosUI";

export default function PacienteProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthGuard("paciente");

    const [loading, setLoading] = useState(true);
    const [mensajeFeedback, setMensajeFeedback] = useState("");
    
    const [perfil, setPerfil] = useState({
        nombreCompleto: "Paciente Registrado",
        telefono: "+34 600 000 000",
        direccion: "Calle Salud 123, Madrid",
        contactoEmergencia: "Familiar (600 111 222)",
        grupoSanguineo: "A+"
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);

        try {
        if (user) {
            const perfilGuardado = JSON.parse(localStorage.getItem(`perfil_${user.uid}`) || "null");
            if (perfilGuardado) {
            setPerfil(perfilGuardado);
            }
        }
        } catch {
        // Valor por defecto si falla
        }

        if (!authLoading) {
        setLoading(false);
        clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [user, authLoading]);

    const handleGuardarCambios = (e) => {
        e.preventDefault();
        setMensajeFeedback("");

        try {
        if (user) {
            localStorage.setItem(`perfil_${user.uid}`, JSON.stringify(perfil));
        }
        setMensajeFeedback("Los datos de contacto y perfil han sido actualizados correctamente.");
        setTimeout(() => setMensajeFeedback(""), 4000);
        } catch (err) {
        console.error("Error al guardar perfil:", err);
        }
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading || authLoading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <EstadoCargando mensaje="Cargando perfil institucional del paciente..." />
        </div>
        );
    }

    return (
        <PortalShell
        rolLabel="Portal Paciente"
        rolTipo="paciente"
        usuarioNombre={perfil.nombreCompleto}
        usuarioEmail={user?.email || "paciente@educa360.test"}
        onLogout={handleCerrarSesion}
        >
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                Gestión de Identidad y Contacto
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Perfil del Paciente</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                Actualice sus datos personales y de contacto para las comunicaciones institucionales.
                </p>
            </div>
            </div>

            {mensajeFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-medium shadow-sm">
                {mensajeFeedback}
            </div>
            )}

            <Tarjeta titulo="Datos Personales y de Contacto" subtitulo="Información sujeta a verificación de seguridad clínica.">
            <form onSubmit={handleGuardarCambios} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nombre Completo</label>
                    <input
                    type="text"
                    value={perfil.nombreCompleto}
                    onChange={(e) => setPerfil({ ...perfil, nombreCompleto: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-teal-600"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Correo Electrónico (No modificable)</label>
                    <input
                    type="email"
                    disabled
                    value={user?.email || "paciente@educa360.test"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-100 cursor-not-allowed"
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Teléfono de Contacto</label>
                    <input
                    type="text"
                    value={perfil.telefono}
                    onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-teal-600"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Contacto de Emergencia</label>
                    <input
                    type="text"
                    value={perfil.contactoEmergencia}
                    onChange={(e) => setPerfil({ ...perfil, contactoEmergencia: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-teal-600"
                    />
                </div>
                </div>

                <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Dirección Postal</label>
                <input
                    type="text"
                    value={perfil.direccion}
                    onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-teal-600"
                />
                </div>

                <div className="pt-3 flex justify-end">
                <button
                    type="submit"
                    className="py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-900/20 transition cursor-pointer"
                >
                    Guardar Cambios del Perfil
                </button>
                </div>
            </form>
            </Tarjeta>
        </div>
        </PortalShell>
  );
}