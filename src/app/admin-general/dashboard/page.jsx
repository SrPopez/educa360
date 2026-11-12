"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function AdminGeneralDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para controlar el popup de confirmación de eliminación/cancelación
    const [citaAEliminar, setCitaAEliminar] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                cargarTodasLasCitas();
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const cargarTodasLasCitas = () => {
        try {
            const citasLocales = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            setCitas(citasLocales);
        } catch (error) {
            console.error("Error al cargar citas:", error);
            setCitas([]);
        }
    };

    const handleAceptarCita = (citaId) => {
        try {
            const citasLocales = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            const nuevasCitas = citasLocales.map((c) => {
                if (String(c.id) === String(citaId)) {
                    const medicoEmailAsignado = c.medicoEmail || "medico@educa360.test";
                    const medicoNombreAsignado = c.medicoAsignado || "Dra. Laura Martínez";
                    
                    return { 
                        ...c, 
                        estado: "Confirmada", 
                        medicoEmail: medicoEmailAsignado,
                        medicoAsignado: medicoNombreAsignado
                    };
                }
                return c;
            });
            localStorage.setItem("citas_educa360", JSON.stringify(nuevasCitas));
            setCitas(nuevasCitas);

            const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
            const nuevoLog = {
                id: Date.now(),
                accion: "ADMIN_ACEPTAR_CITA",
                userEmail: user?.email || "admin",
                descripcion: `El administrador aceptó la cita ID: ${citaId}`,
                fecha: new Date().toLocaleString(),
                tipo: "success"
            };
            localStorage.setItem("logs_educa360", JSON.stringify([nuevoLog, ...logsActuales]));
        } catch (error) {
            console.error("Error al aceptar cita:", error);
        }
    };

    const confirmarEliminacionCita = () => {
        if (!citaAEliminar) return;

        try {
            const citasLocales = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            const nuevasCitas = citasLocales.map((c) => {
                if (String(c.id) === String(citaAEliminar.id)) {
                    return { ...c, estado: "Cancelada" };
                }
                return c;
            });
            localStorage.setItem("citas_educa360", JSON.stringify(nuevasCitas));
            setCitas(nuevasCitas);

            const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
            const nuevoLog = {
                id: Date.now(),
                accion: "ADMIN_CANCELAR_CITA",
                userEmail: user?.email || "admin",
                descripcion: `El administrador canceló la cita de ${citaAEliminar.especialidad}`,
                fecha: new Date().toLocaleString(),
                tipo: "warning"
            };
            localStorage.setItem("logs_educa360", JSON.stringify([nuevoLog, ...logsActuales]));
        } catch (error) {
            console.error("Error al cancelar cita:", error);
        } finally {
            setCitaAEliminar(null);
        }
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando panel de administración...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950 pb-12 relative">
            <header className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            E
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-white tracking-wide">Educa360</h1>
                            <p className="text-[11px] text-slate-400">Panel de Administración General</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCerrarSesion}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700 shadow-sm"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* POPUP MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {citaAEliminar && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-200 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">¿Estás seguro de cancelar esta cita?</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Se cancelará la cita del paciente <strong>{citaAEliminar.userEmail}</strong> ({citaAEliminar.especialidad}) prevista para el {citaAEliminar.fecha}.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                onClick={() => setCitaAEliminar(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                            >
                                Volver
                            </button>
                            <button
                                onClick={confirmarEliminacionCita}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shadow-sm">
                            Rol: Administración General
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-2">Supervisión Global de Citas</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Control y gestión de todas las citas solicitadas en la plataforma.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                            {user?.email}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900">Listado General de Citas ({citas.length})</h3>
                    </div>

                    {citas.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">
                            No hay citas registradas en el sistema.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-5">Paciente (Correo)</th>
                                        <th className="py-3 px-5">Médico Asignado</th>
                                        <th className="py-3 px-5">Especialidad</th>
                                        <th className="py-3 px-5">Fecha / Hora</th>
                                        <th className="py-3 px-5">Estado</th>
                                        <th className="py-3 px-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                                    {citas.map((cita) => {
                                        const estadoLower = (cita.estado || "pendiente").toLowerCase();
                                        const esPendiente = estadoLower === "pendiente";
                                        const esActiva = estadoLower === "confirmada" || estadoLower === "aceptada";
                                        const esCompletada = estadoLower === "completada" || estadoLower === "atendida";
                                        const esCancelada = estadoLower === "cancelada" || estadoLower === "anulada";

                                        return (
                                            <tr key={cita.id} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3.5 px-5 font-mono text-slate-900">
                                                    {cita.userEmail || cita.nombrePaciente || "No especificado"}
                                                </td>
                                                <td className="py-3.5 px-5 text-slate-600">
                                                    {cita.medicoAsignado || cita.medicoEmail || "Sin asignar"}
                                                </td>
                                                <td className="py-3.5 px-5 text-slate-600">
                                                    {cita.especialidad}
                                                </td>
                                                <td className="py-3.5 px-5 text-slate-600">
                                                    {cita.fecha} a las {cita.hora}
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                                                        esActiva ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                        esCompletada ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                                        esCancelada ? "bg-red-50 text-red-700 border border-red-200" :
                                                        "bg-amber-50 text-amber-700 border border-amber-200"
                                                    }`}>
                                                        {cita.estado || "Pendiente"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right space-x-2">
                                                    {esPendiente ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleAceptarCita(cita.id)}
                                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition shadow-sm"
                                                            >
                                                                Aceptar
                                                            </button>
                                                            <button
                                                                onClick={() => setCitaAEliminar(cita)}
                                                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-semibold transition"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px] italic">Sin acciones</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}