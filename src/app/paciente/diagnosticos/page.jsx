"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuthGuard } from "@/lib/useAuthGuard";
import PortalShell from "@/components/PortalShell";
import { Tarjeta } from "@/components/ComponentesUI";
import { EstadoCargando, EstadoVacio } from "@/components/EstadosUI";

export default function DiagnosticosPacientePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthGuard("paciente");
    const [citas, setCitas] = useState([]);
    const [leidos, setLeidos] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);

        try {
            const guardadas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            setCitas(guardadas);
            if (user) {
                const leidosGuardados = JSON.parse(localStorage.getItem(`leidos_${user.uid}`) || "{}");
                setLeidos(leidosGuardados);
            }
        } catch {
            setCitas([]);
        }

        if (!authLoading) {
            setLoading(false);
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [user, authLoading]);

    const marcarComoLeido = (citaId) => {
        if (!user) return;
        const nuevosLeidos = { ...leidos, [citaId]: true };
        setLeidos(nuevosLeidos);
        localStorage.setItem(`leidos_${user.uid}`, JSON.stringify(nuevosLeidos));
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><EstadoCargando mensaje="Cargando expedientes..." /></div>;
    }

    const completadas = citas.filter(
        (c) => c.userEmail === user?.email && (c.estado || "").toLowerCase().includes("completada")
    );

    return (
        <PortalShell rolLabel="Portal Paciente" rolTipo="paciente" usuarioNombre="Paciente Registrado" usuarioEmail={user?.email || "paciente@educa360.test"} onLogout={handleCerrarSesion}>
            <div className="space-y-6">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">Expedientes Oficiales</span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Diagnósticos y Veredictos Clínicos</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Consulta los informes emitidos por los facultativos y tratamientos prescritos</p>
                </div>

                <Tarjeta titulo="Historial de Informes Médicos" subtitulo="Relación de consultas finalizadas y validadas">
                    {completadas.length === 0 ? (
                        <EstadoVacio titulo="No hay diagnósticos disponibles" descripcion="Los informes aparecerán aquí una vez que el médico finalice y complete sus consultas" />
                    ) : (
                        <div className="space-y-4 pt-2">
                            {completadas.map((c) => {
                                const tieneDiagnostico = Boolean(c.diagnostico);
                                const esNuevo = tieneDiagnostico && !leidos[c.id];

                                return (
                                    <div key={c.id} className={`p-5 rounded-2xl border transition bg-white space-y-3 ${esNuevo ? "border-amber-400 shadow-sm" : "border-slate-200"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-bold text-slate-900">{c.especialidad}</span>
                                                <p className="text-[11px] font-mono text-slate-500">Fecha de consulta: {c.fecha} a las {c.hora}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {esNuevo && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md border border-amber-200">Nuevo</span>}
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Completada</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="font-semibold text-slate-900">Motivo inicial:</span> {c.motivo}
                                        </p>

                                        {tieneDiagnostico ? (
                                            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">Diagnóstico del Facultativo</span>
                                                    {esNuevo && (
                                                        <button onClick={() => marcarComoLeido(c.id)} className="text-[11px] font-semibold text-teal-700 bg-white border border-teal-300 px-3 py-1 rounded-lg hover:bg-teal-50 transition cursor-pointer">
                                                            Marcar como leído
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-800 leading-relaxed">{c.diagnostico}</p>
                                                
                                                {c.tratamiento && (
                                                    <div className="p-2.5 bg-white/80 border border-teal-100 rounded-lg text-xs text-slate-700 mt-2">
                                                        <strong className="text-teal-900">Tratamiento:</strong> {c.tratamiento}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-end pt-2 border-t border-teal-100 text-[11px] text-emerald-700 font-mono font-semibold">
                                                    ✓ Informe Firmado Digitalmente
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                                                El facultativo aún no ha registrado el dictamen diagnóstico.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Tarjeta>
            </div>
        </PortalShell>
    );
}