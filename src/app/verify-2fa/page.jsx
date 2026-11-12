"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Verify2faContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [codigoSimulado] = useState("389204");
    const [inputCodigo, setInputCodigo] = useState("");
    const [error, setError] = useState("");
    const [mostrarPopupExito, setMostrarPopupExito] = useState(false);

    const handleConfirmarTotp = (e) => {
        e.preventDefault();
        setError("");

        if (inputCodigo.trim() !== codigoSimulado) {
            setError("El código introducido no es válido. Prueba con 389204.");
            return;
        }

        const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
        localStorage.setItem("logs_educa360", JSON.stringify([
            {
                id: Date.now(),
                accion: "VERIFICACION_2FA",
                userEmail: emailParam || "medico",
                descripcion: "Autenticación en dos pasos (TOTP) superada correctamente por el profesional sanitario.",
                fecha: new Date().toLocaleString(),
                tipo: "success"
            },
            ...logsActuales
        ]));

        setMostrarPopupExito(true);
    };

    const handleAceptarPopup = () => {
        setMostrarPopupExito(false);
        router.push("/medico/dashboard");
    };

    return (
        <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-slate-900 relative">
            
            {mostrarPopupExito && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-sm w-full p-8 text-center space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-slate-900">¡Verificación 2FA Exitosa!</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Código validado correctamente. Redirigiendo al panel médico...
                            </p>
                        </div>
                        <button
                            onClick={handleAceptarPopup}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition"
                        >
                            Acceder al Panel
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-[440px] w-full p-10 space-y-6 text-center">
                
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center border border-indigo-100 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Autenticación en Dos Pasos (2FA)</h2>
                    <p className="text-xs text-slate-500 leading-relaxed px-2">
                        Como profesional sanitario (<strong className="text-slate-700">{emailParam}</strong>), debes introducir el código de verificación de seguridad.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                    <p className="text-[11px] font-bold text-slate-600 uppercase">Clave secreta simulada:</p>
                    <p className="font-mono text-sm font-bold text-indigo-600 tracking-wider">JBSWY3DPEHPK3PXP</p>
                    <p className="text-[10px] text-slate-400">Código de prueba sugerido: <span className="font-bold text-slate-700">389204</span></p>
                </div>

                {error && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleConfirmarTotp} className="space-y-4 text-xs text-left">
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Código de verificación (6 dígitos)
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            required
                            value={inputCodigo}
                            onChange={(e) => setInputCodigo(e.target.value)}
                            placeholder="Ej. 389204"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 text-center tracking-widest font-mono text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition"
                    >
                        Verificar Código
                    </button>
                </form>
            </div>
        </main>
    );
}

export default function Verify2faPage() {
    return (
        <Suspense fallback={<div className="text-center p-12 text-xs text-slate-400">Cargando...</div>}>
            <Verify2faContent/>
        </Suspense>
    );
}