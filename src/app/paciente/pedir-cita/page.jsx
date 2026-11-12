"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export default function PedirCitaPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [especialidad, setEspecialidad] = useState("Medicina General");
    const [medicosDisponibles, setMedicosDisponibles] = useState([]);
    const [medicoSeleccionado, setMedicoSeleccionado] = useState("");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");
    const [motivo, setMotivo] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [error, setError] = useState("");
    const [noLeidasCount, setNoLeidasCount] = useState(0);

    const [mostrarPopupFinDeSemana, setMostrarPopupFinDeSemana] = useState(false);

    const fechaMinima = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                await cargarMedicosFirestore();
                calcularNotificaciones(currentUser);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const cargarMedicosFirestore = async () => {
        const medicosPorDefecto = [
            { nombre: "Dra. Laura Martínez", email: "medico@educa360.test" },
            { nombre: "Dr. Carlos Sanitario", email: "medico2@educa360.test" }
        ];

        try {
            const usuariosRef = collection(db, "usuarios");
            const querySnapshot = await getDocs(usuariosRef);
            const listaMedicos = [];

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (!data) return;
                const emailLower = (data.email || "").toLowerCase();
                const rolLower = (data.role || "").toLowerCase();

                if (emailLower.includes("medico") || rolLower.includes("profesional_sanitario") || rolLower.includes("medico")) {
                    listaMedicos.push({
                        uid: data.uid || docSnap.id,
                        nombre: data.nombre || data.email,
                        email: data.email
                    });
                }
            });

            if (listaMedicos.length === 0) {
                setMedicosDisponibles(medicosPorDefecto);
                setMedicoSeleccionado(medicosPorDefecto[0].email);
            } else {
                setMedicosDisponibles(listaMedicos);
                setMedicoSeleccionado(listaMedicos[0]?.email || medicosPorDefecto[0].email);
            }
        } catch (err) {
            console.error("Error al cargar médicos desde Firestore:", err);
            setMedicosDisponibles(medicosPorDefecto);
            setMedicoSeleccionado(medicosPorDefecto[0].email);
        }
    };

    const calcularNotificaciones = (currentUser) => {
        try {
            const citasGuardadas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
            const citasUsuario = citasGuardadas.filter(
                (cita) => cita && (cita.userId === currentUser.uid || cita.userEmail === currentUser.email)
            );
            const citasCompletadas = citasUsuario.filter(
                (cita) => cita && (cita.estado?.toLowerCase() === "completada" || cita.estado?.toLowerCase() === "atendida") && cita.diagnostico
            );
            const leidosGuardados = JSON.parse(localStorage.getItem(`diagnosticos_leidos_${currentUser.uid}`) || "[]");
            const noLeidas = citasCompletadas.filter((c) => !leidosGuardados.includes(c.id)).length;
            setNoLeidasCount(noLeidas);
        } catch (e) {
            console.error("Error calculando notificaciones:", e);
        }
    };

    const handleFechaChange = (e) => {
        const selectedDateStr = e.target.value;
        if (!selectedDateStr) {
            setFecha("");
            return;
        }

        const [year, month, day] = selectedDateStr.split("-");
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            setMostrarPopupFinDeSemana(true);
            setFecha("");
            setHora("");
        } else {
            setFecha(selectedDateStr);
            setHora("");
        }
    };

    const horasDisponibles = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "16:00",
        "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
    ];
    
    const obtenerHorasValidas = () => {
        if (!fecha || !medicoSeleccionado) return horasDisponibles;

        const todasLasCitas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
        const horasOcupadas = todasLasCitas
            .filter((c) => {
                if (!c) return false;
                const esDelMedico = c.medicoEmail === medicoSeleccionado;
                const esMismaFecha = c.fecha === fecha;
                const estadoLower = (c.estado || "").toLowerCase();
                const estaActiva = estadoLower === "pendiente" || estadoLower === "confirmada" || estadoLower === "aceptada";
                return esDelMedico && esMismaFecha && estaActiva;
            })
            .map((c) => c.hora);

        const hoyStr = new Date().toISOString().split("T")[0];
        const tiempoActualEnMinutos = fecha === hoyStr ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

        return horasDisponibles.filter((h) => {
            if (horasOcupadas.includes(h)) return false;

            if (fecha === hoyStr) {
                const [hStr, mStr] = h.split(":");
                const tiempoHoraEnMinutos = parseInt(hStr) * 60 + parseInt(mStr);
                if (tiempoHoraEnMinutos <= tiempoActualEnMinutos) return false;
            }

            return true;
        });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const handleSubmitCita = (e) => {
        e.preventDefault();
        setError("");

        if (!fecha || !hora || !medicoSeleccionado) {
            setError("Por favor, complete todos los campos obligatorios.");
            return;
        }

        const todasLasCitas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
        const ocupada = todasLasCitas.some((c) => {
            if (!c) return false;
            const estadoLower = (c.estado || "").toLowerCase();
            const estaActiva = estadoLower === "pendiente" || estadoLower === "confirmada" || estadoLower === "aceptada";
            return c.medicoEmail === medicoSeleccionado && c.fecha === fecha && c.hora === hora && estaActiva;
        });

        if (ocupada) {
            setError("Lo sentimos, este médico ya tiene una cita pendiente o confirmada a esta misma hora.");
            return;
        }

        const medicoObj = medicosDisponibles.find((m) => m.email === medicoSeleccionado);

        const nuevaCita = {
            id: Date.now(),
            userId: user.uid,
            userEmail: user.email,
            nombrePaciente: user.displayName || user.email,
            especialidad,
            medicoAsignado: medicoObj?.nombre || medicoSeleccionado,
            medicoEmail: medicoSeleccionado,
            fecha,
            hora,
            motivo: motivo || "Sin observaciones",
            estado: "Pendiente",
            createdAt: new Date().toISOString()
        };

        localStorage.setItem("citas_educa360", JSON.stringify([nuevaCita, ...todasLasCitas]));

        const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
        const nuevoLog = {
            id: Date.now(),
            accion: "SOLICITAR_CITA",
            userEmail: user.email,
            descripcion: `Cita solicitada con ${nuevaCita.medicoAsignado} (${especialidad})`,
            fecha: new Date().toLocaleString(),
            tipo: "info"
        };
        localStorage.setItem("logs_educa360", JSON.stringify([nuevoLog, ...logsActuales]));

        setMensajeExito("¡Cita solicitada con éxito! Redirigiendo...");
        setTimeout(() => router.push("/paciente/dashboard"), 1500);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando formulario...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-12 relative">
            <header className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            E
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-white tracking-wide">Educa360</h1>
                            <p className="text-[11px] text-slate-400">Gestión de servicios médicos y académicos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/paciente/dashboard")}
                            className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 shadow-sm flex items-center justify-center"
                            title="Notificaciones y Diagnósticos"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {noLeidasCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                                    {noLeidasCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700 shadow-sm"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {mostrarPopupFinDeSemana && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-amber-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Aviso: Fin de semana no disponible</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    No se pueden coger citas los fines de semana (sábados y domingos). Por favor, seleccione un día laborable.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setMostrarPopupFinDeSemana(false)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="max-w-3xl mx-auto px-6 pt-8 space-y-6">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.push("/paciente/dashboard")}
                        className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition shadow-sm flex items-center gap-1.5"
                    >
                        ← Volver a Mis Citas
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 space-y-1">
                        <h2 className="text-lg font-bold text-slate-900">Formulario de Nueva Cita</h2>
                        <p className="text-xs text-slate-500">Seleccione la especialidad, el profesional y el horario deseado (De 09:00 a 13:00 y de 16:00 a 21:00).</p>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium text-center">
                            {error}
                        </div>
                    )}

                    {mensajeExito && (
                        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold text-center">
                            {mensajeExito}
                        </div>
                    )}

                    <form onSubmit={handleSubmitCita} className="p-6 space-y-5 text-xs">
                        <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Especialidad / Servicio
                            </label>
                            <select
                                value={especialidad}
                                onChange={(e) => setEspecialidad(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm font-medium"
                            >
                                <option value="Medicina General">Medicina General</option>
                                <option value="Pediatría">Pediatría</option>
                                <option value="Fisioterapia">Fisioterapia</option>
                                <option value="Odontología">Odontología</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Médico Asignado
                            </label>
                            <select
                                value={medicoSeleccionado}
                                onChange={(e) => {
                                    setMedicoSeleccionado(e.target.value);
                                    setHora("");
                                }}
                                required
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm font-medium"
                            >
                                {Array.isArray(medicosDisponibles) && medicosDisponibles.map((med) => (
                                    <option key={med.email} value={med.email}>
                                        {med.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Fecha Prevista
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={fechaMinima}
                                    value={fecha}
                                    onChange={(e) => {
                                        handleFechaChange(e);
                                        setHora("");
                                    }}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Hora
                                </label>
                                <select
                                    value={hora}
                                    onChange={(e) => setHora(e.target.value)}
                                    required
                                    disabled={!fecha || !medicoSeleccionado}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm font-medium disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">{fecha ? "-- Selecciona una hora --" : "Primero seleccione una fecha"}</option>
                                    {Array.isArray(obtenerHorasValidas()) && obtenerHorasValidas().map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Motivo
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Detalles relevantes..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                            >
                                Confirmar y Solicitar Cita
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}