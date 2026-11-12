"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function MedicoDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamiento, setTratamiento] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                cargarCitasConfirmadas(currentUser);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const cargarCitasConfirmadas = (currentUser) => {
        setLoading(true);
        try {
            const citasLocales = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            
            const citasDelMedico = citasLocales.filter((c) => {
                // Se muestran si están confirmadas (aceptadas por admin o con estado correspondiente)
                const esConfirmadaOrPendiente = c.estado === "Confirmada" || c.estado === "Pendiente";
                const esSuCita = !c.medicoEmail || c.medicoEmail === currentUser?.email;
                return esConfirmadaOrPendiente && esSuCita;
            });

            setCitas(citasDelMedico);
        } catch (error) {
            console.error("Error al cargar citas del médico:", error);
            setCitas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAtenderCita = (cita) => {
        setCitaSeleccionada(cita);
        setDiagnostico(cita.diagnostico || "");
        setTratamiento(cita.tratamiento || "");
        setMensaje("");
    };

    const guardarDiagnosticoYCompletar = (e) => {
        e.preventDefault();
        if (!citaSeleccionada) return;

        setGuardando(true);
        setMensaje("");

        try {
            const citasGlobales = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            const nuevasCitasGlobales = citasGlobales.map((c) => {
                if (String(c.id) === String(citaSeleccionada.id)) {
                    return {
                        ...c,
                        diagnostico,
                        tratamiento,
                        estado: "Completada",
                        fechaAtencion: new Date().toLocaleString()
                    };
                }
                return c;
            });
            localStorage.setItem("citas_educa360", JSON.stringify(nuevasCitasGlobales));

            const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
            const nuevoLog = {
                id: Date.now(),
                accion: "REGISTRAR_DIAGNOSTICO",
                userEmail: user?.email || "medico@educa360.test",
                descripcion: `El profesional sanitario completó la cita de ${citaSeleccionada.especialidad || "General"}`,
                fecha: new Date().toLocaleString(),
                tipo: "success"
            };
            localStorage.setItem("logs_educa360", JSON.stringify([nuevoLog, ...logsActuales]));

            setCitas((prevCitas) => prevCitas.filter((c) => String(c.id) !== String(citaSeleccionada.id)));

            setMensaje("Cita atendida y marcada como Completada con éxito.");
            setCitaSeleccionada(null);
            setDiagnostico("");
            setTratamiento("");
        } catch (error) {
            console.error("Error al guardar el diagnóstico:", error);
            setMensaje("Error al procesar la cita.");
        } finally {
            setGuardando(false);
        }
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando panel médico...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950 pb-12">
            <header className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            E
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-white tracking-wide">Educa360</h1>
                            <p className="text-[11px] text-slate-400">Panel del Profesional Sanitario</p>
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

            <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shadow-sm">
                            Rol: Profesional Sanitario
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-2">Mis Citas Asignadas</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Atienda las citas confirmadas de sus pacientes asignados y emita su diagnóstico clínico.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                            {user?.email}
                        </span>
                    </div>
                </div>

                {mensaje && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold shadow-sm">
                        {mensaje}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h3 className="text-sm font-bold text-slate-900">
                                Citas Asignadas ({citas.length})
                            </h3>
                        </div>

                        {citas.length === 0 ? (
                            <div className="text-center py-12 space-y-2">
                                <p className="text-sm font-semibold text-slate-700">No tienes citas asignadas pendientes</p>
                                <p className="text-xs text-slate-400">Las citas de otros médicos o no confirmadas no se muestran aquí.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {citas.map((cita) => (
                                    <div
                                        key={cita.id}
                                        className={`p-4 rounded-xl border transition flex justify-between items-center ${
                                            citaSeleccionada?.id === cita.id
                                                ? "bg-blue-50/50 border-blue-500 shadow-sm"
                                                : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-900">
                                                Paciente: {cita.userEmail || cita.nombrePaciente || "Anónimo"}
                                            </p>
                                            <p className="text-[11px] text-slate-600">
                                                Especialidad: <span className="font-semibold">{cita.especialidad || "Medicina General"}</span>
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Fecha/Hora: {cita.fecha} a las {cita.hora}
                                            </p>
                                            <p className="text-[11px] text-slate-500 max-w-[280px] truncate" title={cita.motivo}>
                                                Motivo: {cita.motivo || "Consulta General"}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleAtenderCita(cita)}
                                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition shrink-0"
                                        >
                                            Atender Cita
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 h-fit">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">
                            Atención Médica
                        </h3>

                        {citaSeleccionada ? (
                            <form onSubmit={guardarDiagnosticoYCompletar} className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Atendiendo a:</p>
                                    <p className="text-xs font-semibold text-blue-700 font-mono">
                                        {citaSeleccionada.userEmail || citaSeleccionada.nombrePaciente}
                                    </p>
                                    <p className="text-[11px] text-slate-600">
                                        {citaSeleccionada.especialidad} ({citaSeleccionada.fecha} a las {citaSeleccionada.hora})
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Diagnóstico Clínico
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Escribe la evaluación clínica o diagnóstico..."
                                        value={diagnostico}
                                        onChange={(e) => setDiagnostico(e.target.value)}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-600 transition resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Tratamiento / Indicaciones
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Indicaciones médicas o medicamentos prescritos..."
                                        value={tratamiento}
                                        onChange={(e) => setTratamiento(e.target.value)}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-600 transition resize-none"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCitaSeleccionada(null)}
                                        className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
                                    >
                                        {guardando ? "Guardando..." : "Completar Cita"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12">
                                Selecciona una cita de la lista para atender al paciente.
                            </p>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
}