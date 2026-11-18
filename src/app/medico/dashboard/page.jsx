"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuthGuard } from "@/lib/useAuthGuard";
import PortalShell from "@/components/PortalShell";
import { EstadoCargando } from "@/components/EstadosUI";
import { registrarLogSistema } from "@/app/admin/dashboard/page";

export default function MedicoDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthGuard("profesional_sanitario, medico");

    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "success" });

    const [modalAnularAbierto, setModalAnularAbierto] = useState(false);
    const [citaParaAnular, setCitaParaAnular] = useState(null);

    const [citasDiagnosticando, setCitasDiagnosticando] = useState({});
    const [textosDiagnostico, setTextosDiagnostico] = useState({});
    const [textosTratamiento, setTextosTratamiento] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);

        try {
            const guardadas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            setCitas(guardadas);
            
            const borradoresDiag = {};
            const borradoresTrat = {};
            guardadas.forEach(c => {
                const borradorDiag = localStorage.getItem(`borrador_diag_${c.id}`);
                const borradorTrat = localStorage.getItem(`borrador_trat_${c.id}`);
                if (borradorDiag) borradoresDiag[c.id] = borradorDiag;
                if (borradorTrat) borradoresTrat[c.id] = borradorTrat;
            });
            setTextosDiagnostico(borradoresDiag);
            setTextosTratamiento(borradoresTrat);
        } catch {
            setCitas([]);
        }

        if (!authLoading) {
            setLoading(false);
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [authLoading]);

    const actualizarEstadoCita = (citaId, nuevoEstado) => {
        const actualizadas = citas.map((c) => c.id === citaId ? { ...c, estado: nuevoEstado } : c);
        setCitas(actualizadas);
        localStorage.setItem("citas_educa360", JSON.stringify(actualizadas));

        registrarLogSistema("VALIDACIÓN", user?.email || "medico@educa360.test", `Consulta marcada como "${nuevoEstado}".`);
        setMensaje({ texto: `La cita ha sido marcada como: ${nuevoEstado}`, tipo: nuevoEstado === "Cancelada" ? "error" : "success" });
        setTimeout(() => setMensaje({ texto: "", tipo: "success" }), 4000);
    };

    const toggleDesplegableDiagnostico = (citaId) => {
        setCitasDiagnosticando(prev => ({ ...prev, [citaId]: !prev[citaId] }));
    };

    const guardarBorrador = (cita) => {
        const diag = textosDiagnostico[cita.id] || "";
        const trat = textosTratamiento[cita.id] || "";

        localStorage.setItem(`borrador_diag_${cita.id}`, diag);
        localStorage.setItem(`borrador_trat_${cita.id}`, trat);

        registrarLogSistema("BORRADOR", user?.email || "medico@educa360.test", `Acto clínico guardado en borrador para ${cita.userEmail}`);
        setMensaje({ texto: "Borrador del acto clínico guardado correctamente (Privado).", tipo: "success" });
        
        setCitasDiagnosticando(prev => ({ ...prev, [cita.id]: false }));
        
        setTimeout(() => setMensaje({ texto: "", tipo: "success" }), 4000);
    };

    const guardarDiagnostico = (cita) => {
        const diag = textosDiagnostico[cita.id] || "";
        const trat = textosTratamiento[cita.id] || "";
        if (!diag.trim()) return;

        const actualizadas = citas.map((c) => {
            if (c.id === cita.id) {
                return { 
                    ...c, 
                    diagnostico: diag.trim(),
                    tratamiento: trat.trim(),
                    estado: "Completada" 
                };
            }
            return c;
        });

        setCitas(actualizadas);
        localStorage.setItem("citas_educa360", JSON.stringify(actualizadas));
        localStorage.removeItem(`borrador_diag_${cita.id}`);
        localStorage.removeItem(`borrador_trat_${cita.id}`);

        const historialesPaciente = JSON.parse(localStorage.getItem(`diagnosticos_${cita.userEmail}`) || "[]");
        const nuevoRegistro = {
            id: Date.now(),
            fecha: new Date().toISOString().split("T")[0],
            especialidad: cita.especialidad,
            medico: user?.email || cita.medico,
            diagnostico: diag.trim(),
            tratamiento: trat.trim()
        };
        localStorage.setItem(`diagnosticos_${cita.userEmail}`, JSON.stringify([nuevoRegistro, ...historialesPaciente]));

        registrarLogSistema("DIAGNÓSTICO", user?.email || "medico@educa360.test", `Diagnóstico firmado y publicado para ${cita.userEmail}`);
        setMensaje({ texto: "Acto clínico firmado y publicado correctamente en el expediente del paciente.", tipo: "success" });

        setCitasDiagnosticando(prev => ({ ...prev, [cita.id]: false }));
        setTimeout(() => setMensaje({ texto: "", tipo: "success" }), 4000);
    };

    const abrirModalAnular = (cita) => {
        setCitaParaAnular(cita);
        setModalAnularAbierto(true);
    };

    const confirmarAnulacion = () => {
        if (!citaParaAnular) return;
        actualizarEstadoCita(citaParaAnular.id, "Cancelada");
        setModalAnularAbierto(false);
        setCitaParaAnular(null);
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading || authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><EstadoCargando mensaje="Cargando panel médico..." /></div>;
    }

    const emailMedicoActual = (user?.email || "").toLowerCase();
    const citasDelMedicoAceptadas = citas.filter((c) => {
        const medicoCita = (c.medico || "").toLowerCase();
        const estadoCita = (c.estado || "").toLowerCase();
        return (!medicoCita || medicoCita === emailMedicoActual || medicoCita.includes("medico")) && (estadoCita === "aceptada" || estadoCita === "confirmada");
    });

    return (
        <PortalShell rolLabel="Portal Médico" rolTipo="medico" usuarioNombre="Personal Sanitario" usuarioEmail={user?.email || "medico@educa360.test"} onLogout={handleCerrarSesion}>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">Área Clínica Asistencial</span>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 pt-1">Panel de Consultas y Pacientes</h1>
                        <p className="text-xs text-slate-500">Gestión de agenda activa, actos clínicos en borrador y emisión de diagnósticos certificados.</p>
                    </div>
                    <Link href="/medico/profile" className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer">
                        Mi Ficha Profesional
                    </Link>
                </div>

                {mensaje.texto && (
                    <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center space-x-3 shadow-xs ${mensaje.tipo === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Agenda Activa · Consultas Confirmadas</h2>
                    </div>

                    <div className="overflow-x-auto">
                        {citasDelMedicoAceptadas.length === 0 ? (
                            <div className="py-16 text-center space-y-2">
                                <p className="text-xs font-bold text-slate-700">No hay consultas confirmadas pendientes</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-200/70 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                                        <th className="py-3 px-6 font-semibold">Paciente</th>
                                        <th className="py-3 px-4 font-semibold">Especialidad</th>
                                        <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
                                        <th className="py-3 px-4 font-semibold">Motivo</th>
                                        <th className="py-3 px-4 font-semibold">Estado</th>
                                        <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {citasDelMedicoAceptadas.map((cita) => {
                                        const estaDiagnosticando = citasDiagnosticando[cita.id];
                                        const tieneBorrador = Boolean(localStorage.getItem(`borrador_diag_${cita.id}`));

                                        return (
                                            <Fragment key={cita.id}>
                                                <tr className="hover:bg-slate-50/50 transition align-top">
                                                    <td className="py-4 px-6 font-bold text-slate-900">{cita.userEmail}</td>
                                                    <td className="py-4 px-4 text-slate-700">{cita.especialidad}</td>
                                                    <td className="py-4 px-4 font-mono">{cita.fecha} {cita.hora}</td>
                                                    <td className="py-4 px-4 text-slate-600">
                                                        {cita.motivo}
                                                        {tieneBorrador && <span className="block mt-1 text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold w-fit">Borrador Guardado</span>}
                                                    </td>
                                                    <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">CONFIRMADA</span></td>
                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        <button onClick={() => toggleDesplegableDiagnostico(cita.id)} className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition cursor-pointer">
                                                            {estaDiagnosticando ? "Cerrar Panel" : "Atender"}
                                                        </button>
                                                        <button onClick={() => abrirModalAnular(cita)} className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer">Anular</button>
                                                    </td>
                                                </tr>

                                                {estaDiagnosticando && (
                                                    <tr className="bg-teal-50/40 border-b border-teal-100">
                                                        <td colSpan={6} className="p-5 px-6">
                                                            <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-4">
                                                                <span className="text-xs font-bold text-teal-900 block">Registro de Acto Clínico (Borrador Privado)</span>
                                                                
                                                                <div className="space-y-1">
                                                                    <label className="text-[11px] font-bold text-slate-700">Motivo, Exploración y Valoración Clínica</label>
                                                                    <textarea
                                                                        rows={3}
                                                                        placeholder="Escriba la exploración y valoración..."
                                                                        value={textosDiagnostico[cita.id] || ""}
                                                                        onChange={(e) => setTextosDiagnostico({ ...textosDiagnostico, [cita.id]: e.target.value })}
                                                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-teal-600"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[11px] font-bold text-slate-700">Plan / Tratamiento Prescrito</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ej: Paracetamol 1g cada 8h durante 5 días"
                                                                        value={textosTratamiento[cita.id] || ""}
                                                                        onChange={(e) => setTextosTratamiento({ ...textosTratamiento, [cita.id]: e.target.value })}
                                                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-teal-600"
                                                                    />
                                                                </div>

                                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                                    <span className="text-[11px] text-slate-500 font-mono">Los borradores solo son visibles para el profesional sanitario.</span>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => guardarBorrador(cita)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200 cursor-pointer">
                                                                            Guardar Borrador
                                                                        </button>
                                                                        <button onClick={() => guardarDiagnostico(cita)} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer">
                                                                            Firmar y Publicar al Paciente
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {modalAnularAbierto && citaParaAnular && (
                    <div className="fixed inset-0 bg-[#090d16]/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-[28px] shadow-2xl border border-rose-100 max-w-[440px] w-full p-8 sm:p-10 space-y-6 text-center relative z-10">
                            
                            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-sm shrink-0 bg-rose-50 text-rose-600 border-rose-200">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-md font-bold">
                                    Acción Crítica · Registro Clínico
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
                                    ¿Desea anular esta consulta médica confirmada?
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed px-2">
                                    Está a punto de cancelar la cita del paciente <strong className="text-slate-800">{citaParaAnular.userEmail}</strong> ({citaParaAnular.especialidad}) programada para el <strong className="text-slate-800">{citaParaAnular.fecha}</strong> a las <strong className="text-slate-800">{citaParaAnular.hora}</strong>.
                                </p>
                                <p className="text-[11px] text-rose-600/90 font-medium pt-1">
                                    Esta acción quedará registrada en la auditoría y eliminará cualquier borrador pendiente.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setModalAnularAbierto(false);
                                        setCitaParaAnular(null);
                                    }}
                                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200/80 shadow-xs cursor-pointer"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={confirmarAnulacion}
                                    className="w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                                >
                                    Sí, anular cita
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PortalShell>
    );
}