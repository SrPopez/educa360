"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import { dashboardParaRol, inferirRolDesdeEmail } from "@/lib/roles";

export default function AccessDeniedPage() {
    const router = useRouter();

    const handleVolverPanel = () => {
        const currentUser = auth.currentUser;
        let rolDestino = "paciente";

        if (currentUser && currentUser.email) {
            rolDestino = inferirRolDesdeEmail(currentUser.email);
        } else {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("rol_")) {
                    rolDestino = localStorage.getItem(key) || "paciente";
                    break;
                }
            }
        }

        router.push(dashboardParaRol(rolDestino));
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden antialiased selection:bg-teal-600 selection:text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 p-8 space-y-6 text-center">
            
            <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-teal-900/30">
                E
            </div>
            </div>

            <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Restricción de Acceso 403
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Credenciales Insuficientes</h1>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
                El módulo o recurso solicitado requiere privilegios específicos que no están asociados a su rol actual en el sistema clínico.
            </p>
            </div>

            <div className="bg-slate-50/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-6 text-center shadow-xs max-w-xl mx-auto my-6 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 block">
                    PROTOCOLO DE SEGURIDAD
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Por normativas de privacidad y cumplimiento ISO-27001, los intentos de acceso no autorizados quedan registrados en el sistema de auditoría global.
                </p>
            </div>

            <div className="space-y-2.5 pt-2">
            <button
                onClick={() => router.push("/login")}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-900/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
                <span>Iniciar sesión con otra cuenta</span>
            </button>
            
            <button
                onClick={handleVolverPanel}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
                Volver a mi panel principal
            </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-mono">
                Educa360 Health Systems • Entorno Seguro Protegido
            </p>
            </div>
        </div>
        </div>
    );
}