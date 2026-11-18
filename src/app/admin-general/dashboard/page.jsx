"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuthGuard } from "@/lib/useAuthGuard";
import PortalShell from "@/components/PortalShell";
import { Tarjeta } from "@/components/ComponentesUI";
import { EstadoCargando } from "@/components/EstadosUI";

export default function AdminGeneralDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthGuard("admin-general");

    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("info");

    const [modalAbierto, setModalAbierto] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [accionPendiente, setAccionPendiente] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);

        try {
            const guardadas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            setCitas(guardadas);
        } catch {
            setCitas([]);
        }

        if (!authLoading) {
            setLoading(false);
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [authLoading]);

    const solicitarConfirmacion = (cita, nuevoEstado) => {
        setCitaSeleccionada(cita);
        setAccionPendiente(nuevoEstado);
        setModalAbierto(true);
    };

    const confirmarAccion = () => {
        if (!citaSeleccionada || !accionPendiente) return;

        const actualizadas = citas.map((c) => {
            if (c.id === citaSeleccionada.id) {
                return { ...c, estado: accionPendiente };
            }
            return c;
        });

        setCitas(actualizadas);
        localStorage.setItem("citas_educa360", JSON.stringify(actualizadas));
        
        setMensaje(`La cita de ${citaSeleccionada.userEmail} ha sido marcada como: ${accionPendiente}`);
        setTipoMensaje(accionPendiente === "Aceptada" ? "success" : "error");
        
        setModalAbierto(false);
        setCitaSeleccionada(null);
        setAccionPendiente(null);

        setTimeout(() => setMensaje(""), 4000);
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <EstadoCargando mensaje="Cargando panel de administración general..." />
            </div>
        );
    }

    const esCancelacion = accionPendiente === "Cancelada";

    return (
        <PortalShell
            rolLabel="Administración General"
            rolTipo="admin-general"
            usuarioNombre="Administrador General"
            usuarioEmail={user?.email || "administracion@educa360.test"}
            onLogout={handleCerrarSesion}
        >
            <div className="space-y-6 relative">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                        Control Institucional
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                        Panel de Validación y Auditoría de Citas
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Supervise, acepte o cancele las solicitudes de citas médicas de los pacientes
                    </p>
                </div>

                {mensaje && (
                    <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center space-x-3 transition-all shadow-xs ${
                        tipoMensaje === "success" 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                        <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${
                            tipoMensaje === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                            {tipoMensaje === "success" ? "✓" : "!"}
                        </div>
                        <div>
                            <strong className="font-bold block text-[11px] uppercase tracking-wider">Notificación del Sistema</strong>
                            <span>{mensaje}</span>
                        </div>
                    </div>
                )}

                <Tarjeta
                    titulo="Listado General de Citas del Sistema"
                    subtitulo="Gestión de solicitudes pendientes, confirmadas, completadas y canceladas"
                >
                    <div className="overflow-x-auto pt-2">
                        {citas.length === 0 ? (
                            <p className="text-xs text-slate-500 py-6 text-center">
                                No hay citas registradas en el sistema actualmente
                            </p>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                                        <th className="pb-3 font-semibold">Paciente</th>
                                        <th className="pb-3 font-semibold">Especialidad / Médico</th>
                                        <th className="pb-3 font-semibold">Fecha y Hora</th>
                                        <th className="pb-3 font-semibold">Motivo</th>
                                        <th className="pb-3 font-semibold">Estado Actual</th>
                                        <th className="pb-3 font-semibold text-right">Acciones de Validación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {citas.map((cita) => {
                                        const estadoLower = (cita.estado || "pendiente").toLowerCase();
                                        const esPendiente = estadoLower.includes("pendiente");
                                        const esAceptada = estadoLower.includes("aceptada") || estadoLower.includes("confirmada");
                                        
                                        const esFinalizadaOCancelada = 
                                            estadoLower.includes("cancelada") || 
                                            estadoLower.includes("anulada") || 
                                            estadoLower.includes("completada");

                                        return (
                                            <tr key={cita.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3.5 pr-3 font-medium text-slate-900">
                                                    {cita.userEmail}
                                                </td>
                                                <td className="py-3.5 pr-3 text-slate-600">
                                                    <div className="font-semibold text-slate-900">{cita.especialidad}</div>
                                                    <div className="text-[11px] text-slate-500">{cita.medico}</div>
                                                </td>
                                                <td className="py-3.5 pr-3 text-slate-600 whitespace-nowrap">
                                                    <div className="font-medium text-slate-900">{cita.fecha}</div>
                                                    <div className="text-[11px] font-mono text-teal-700">{cita.hora}</div>
                                                </td>
                                                <td className="py-3.5 pr-3 text-slate-500 max-w-[180px] truncate">
                                                    {cita.motivo || "Sin observaciones"}
                                                </td>
                                                <td className="py-3.5 pr-3">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide border ${
                                                            esPendiente
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : esAceptada
                                                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                                                : estadoLower.includes("completada")
                                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : "bg-rose-50 text-rose-700 border-rose-200"
                                                        }`}
                                                    >
                                                        {cita.estado || "Pendiente"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right whitespace-nowrap">
                                                    {esFinalizadaOCancelada ? (
                                                        <span className="text-[11px] font-mono text-slate-300">
                                                            —
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {(esPendiente || !esAceptada) && (
                                                                <button
                                                                    onClick={() => solicitarConfirmacion(cita, "Aceptada")}
                                                                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] rounded-lg shadow-xs transition cursor-pointer"
                                                                >
                                                                    Aceptar
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => solicitarConfirmacion(cita, "Cancelada")}
                                                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] rounded-lg border border-rose-200 transition cursor-pointer"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Tarjeta>

                {modalAbierto && citaSeleccionada && (
                    <div className="fixed inset-0 bg-[#090d16]/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className={`bg-white rounded-[28px] shadow-2xl border max-w-[440px] w-full p-8 sm:p-10 space-y-6 text-center relative z-10 ${
                            esCancelacion ? "border-rose-100" : "border-teal-100"
                        }`}>
                            
                            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-sm shrink-0 ${
                                esCancelacion 
                                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                                    : "bg-teal-50 text-teal-600 border-teal-200"
                            }`}>
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    {esCancelacion ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    )}
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <span className={`inline-block text-[10px] font-mono uppercase tracking-wider px-3 py-0.5 rounded-md font-bold border ${
                                    esCancelacion
                                        ? "text-rose-700 bg-rose-50 border-rose-200"
                                        : "text-teal-700 bg-teal-50 border-teal-200"
                                }`}>
                                    {esCancelacion ? "Acción Crítica · Registro Institucional" : "Validación Administrativa"}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
                                    {esCancelacion ? "¿Desea cancelar esta cita médica?" : "¿Desea aceptar esta cita médica?"}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed px-2">
                                    Está a punto de {esCancelacion ? "cancelar" : "validar y confirmar"} la cita del paciente <strong className="text-slate-800">{citaSeleccionada.userEmail}</strong> ({citaSeleccionada.especialidad}) programada para el <strong className="text-slate-800">{citaSeleccionada.fecha}</strong> a las <strong className="text-slate-800">{citaSeleccionada.hora}</strong>.
                                </p>
                                <p className={`text-[11px] font-medium pt-1 ${
                                    esCancelacion ? "text-rose-600/90" : "text-teal-700/90"
                                }`}>
                                    {esCancelacion 
                                        ? "Esta acción quedará registrada en la auditoría y bloqueará la consulta." 
                                        : "La consulta pasará a estar activa en la agenda del facultativo asignado."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setModalAbierto(false);
                                        setCitaSeleccionada(null);
                                        setAccionPendiente(null);
                                    }}
                                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200/80 shadow-xs cursor-pointer"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={confirmarAccion}
                                    className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer ${
                                        esCancelacion
                                            ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/25"
                                            : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/25"
                                    }`}
                                >
                                    {esCancelacion ? "Sí, cancelar cita" : "Sí, aceptar cita"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PortalShell>
    );
}