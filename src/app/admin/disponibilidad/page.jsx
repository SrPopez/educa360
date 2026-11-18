"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import PortalShell from "@/components/PortalShell";

export default function AdminDisponibilidadPage() {
    const router = useRouter();
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [bloqueos, setBloqueos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [profesionalId, setProfesionalId] = useState("medico-1");
    const [sedeId, setSedeId] = useState("seed-sede-centro");
    const [dia, setDia] = useState("Lunes");
    const [inicio, setInicio] = useState("09:00");
    const [fin, setFin] = useState("13:00");
    const [duracion, setDuracion] = useState(20);

    const [alcanceBloqueo, setAlcanceBloqueo] = useState("profesional");
    const [profBloqueoId, setProfBloqueoId] = useState("medico-1");
    const [fechaInicioBloqueo, setFechaInicioBloqueo] = useState("");
    const [fechaFinBloqueo, setFechaFinBloqueo] = useState("");
    const [tipoBloqueo, setTipoBloqueo] = useState("completo");
    const [horaInicioBloqueo, setHoraInicioBloqueo] = useState("09:00");
    const [horaFinBloqueo, setHoraFinBloqueo] = useState("13:00");
    const [motivoBloqueo, setMotivoBloqueo] = useState("");

    const fechaHoy = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function fetchDatosAgendaSeguro() {
            setLoading(true);
            setError("");
            let listaDisp = [];
            let listaBloq = [];

            try {
                const snapDisp = await getDocs(collection(db, "disponibilidad_sedes"));
                listaDisp = snapDisp.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(item => item.profesionalId && item.profesionalId.toLowerCase() !== "medico");
            } catch (err) {
                console.warn("Aviso: No se pudo leer 'disponibilidad_sedes':", err.message);
            }

            try {
                const snapBloq = await getDocs(collection(db, "bloqueos_agenda"));
                listaBloq = snapBloq.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => (a.fechaInicio || "").localeCompare(b.fechaInicio || ""));
            } catch (err) {
                console.warn("Aviso: No se pudo leer 'bloqueos_agenda':", err.message);
            }

            setDisponibilidades(listaDisp);
            setBloqueos(listaBloq);
            setLoading(false);
        }

        fetchDatosAgendaSeguro();
    }, []);

    const handleGuardarDisponibilidad = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        try {
            const docId = `disp-${profesionalId}-${sedeId}`;
            const existente = disponibilidades.find(d => d.id === docId);
            let horariosActuales = existente ? JSON.parse(JSON.stringify(existente.horarios)) : [];

            const nuevaFranjaObjeto = {
                inicio,
                fin,
                duracionCitaMinutos: Number(duracion)
            };

            let indexDia = horariosActuales.findIndex(h => h.dia === dia);
            
            if (indexDia >= 0) {
                const franjasDelDia = horariosActuales[indexDia].franjas || [];
                const yaExiste = franjasDelDia.some(f => f.inicio === inicio && f.fin === fin);
                
                if (yaExiste) {
                    setError("Ya existe una franja horaria idéntica registrada para este día.");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                
                horariosActuales[indexDia].franjas.push(nuevaFranjaObjeto);
            } else {
                horariosActuales.push({
                    dia,
                    franjas: [nuevaFranjaObjeto]
                });
            }

            const payload = {
                profesionalId,
                sedeId,
                horarios: horariosActuales
            };

            await setDoc(doc(db, "disponibilidad_sedes", docId), payload, { merge: true });

            setMensaje("Plantilla de disponibilidad guardada correctamente.");
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setDisponibilidades(prev => {
                const filtrado = prev.filter(p => p.id !== docId);
                return [...filtrado, { id: docId, ...payload }];
            });
        } catch (err) {
            console.error("Error al guardar disponibilidad:", err);
            setError(`Error al guardar en la base de datos: ${err.message}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleGuardarBloqueo = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        try {
            if (!fechaInicioBloqueo) {
                throw new Error("Debe seleccionar al menos una fecha de inicio para el bloqueo.");
            }

            if (fechaInicioBloqueo < fechaHoy) {
                throw new Error("No se pueden programar bloqueos en fechas anteriores a la actual.");
            }

            const fFin = fechaFinBloqueo || fechaInicioBloqueo;
            if (fFin < fechaInicioBloqueo) {
                throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
            }

            const profIdEval = alcanceBloqueo === "profesional" ? profBloqueoId.toLowerCase().trim() : "todos";
            const motivoLimpio = motivoBloqueo.trim() || "Bloqueo / Vacaciones";

            const yaExisteBloqueo = bloqueos.some(b => 
                b.alcance === alcanceBloqueo &&
                b.profesionalId === profIdEval &&
                b.fechaInicio === fechaInicioBloqueo &&
                b.fechaFin === fFin &&
                b.motivo.toLowerCase() === motivoLimpio.toLowerCase()
            );

            if (yaExisteBloqueo) {
                setError("Ya existe un bloqueo o periodo de vacaciones idéntico registrado con estos datos.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const bloqueoId = `bloq-${Date.now()}`;
            const payload = {
                alcance: alcanceBloqueo,
                profesionalId: profIdEval,
                fechaInicio: fechaInicioBloqueo,
                fechaFin: fFin,
                tipoBloqueo,
                horaInicio: tipoBloqueo === "parcial" ? horaInicioBloqueo : "00:00",
                horaFin: tipoBloqueo === "parcial" ? horaFinBloqueo : "23:59",
                motivo: motivoLimpio
            };

            await setDoc(doc(db, "bloqueos_agenda", bloqueoId), payload);

            setBloqueos(prev => [...prev, { id: bloqueoId, ...payload }].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)));
            setMensaje("Bloqueo registrado correctamente en la base de datos.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMotivoBloqueo("");
        } catch (err) {
            console.error("Error al guardar bloqueo:", err);
            setError(`Error al registrar bloqueo: ${err.message}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleEliminarBloqueo = async (idBloqueo) => {
        setMensaje("");
        setError("");
        try {
            await deleteDoc(doc(db, "bloqueos_agenda", idBloqueo));
            setBloqueos(prev => prev.filter(b => b.id !== idBloqueo));
            setMensaje("Bloqueo eliminado correctamente.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError("No se pudo eliminar el bloqueo seleccionado.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCerrarSesion = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <PortalShell
            rolLabel="Administración de Sistemas"
            rolTipo="admin"
            usuarioNombre="Administrador"
            usuarioEmail="adminsistema@educa360.test"
            onLogout={handleCerrarSesion}
        >
            <div className="max-w-6xl mx-auto space-y-8 antialiased pb-12">
                <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-teal-50 text-[#009688] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-teal-200/60 font-mono">
                                ÁREA CLÍNICA ASISTENCIAL
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Plantillas de Disponibilidad y Bloqueos</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Gestión de turnos base, vacaciones, festivos y bloqueos puntuales de agenda</p>
                        </div>
                    </div>
                </div>

                {mensaje && (
                    <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-2xl font-medium shadow-sm">
                        {mensaje}
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium shadow-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-bold text-slate-900">Añadir Franja Horaria Base</h2>
                            <p className="text-[11px] text-slate-500">Configura un nuevo bloque institucional</p>
                        </div>

                        <form onSubmit={handleGuardarDisponibilidad} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">ID Profesional</label>
                                <input
                                    type="text"
                                    value={profesionalId}
                                    onChange={(e) => setProfesionalId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">ID Sede</label>
                                <input
                                    type="text"
                                    value={sedeId}
                                    onChange={(e) => setSedeId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Día de la Semana</label>
                                <select
                                    value={dia}
                                    onChange={(e) => setDia(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                >
                                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Inicio</label>
                                    <input
                                        type="time"
                                        value={inicio}
                                        onChange={(e) => setInicio(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Fin</label>
                                    <input
                                        type="time"
                                        value={fin}
                                        onChange={(e) => setFin(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Duración Cita (minutos)</label>
                                <input
                                    type="number"
                                    value={duracion}
                                    onChange={(e) => setDuracion(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                    min="5"
                                    max="120"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#009688] hover:bg-[#00796b] text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                            >
                                Guardar y Validar Franja
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-[24px] px-6 py-3.5 border border-slate-200/80 shadow-sm flex justify-between items-center">
                            <div>
                                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Plantillas Registradas</h2>
                                <p className="text-[11px] text-slate-500">Control y visualización de franjas institucionales.</p>
                            </div>
                            <span className="px-3 py-1 bg-teal-50 text-[#009688] border border-teal-200 text-[11px] font-mono font-bold rounded-lg">
                                {disponibilidades.length} Activa(s)
                            </span>
                        </div>

                        {loading ? (
                            <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 text-center text-xs text-slate-500 shadow-sm">
                                Cargando plantillas...
                            </div>
                        ) : disponibilidades.length === 0 ? (
                            <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 text-center text-xs text-slate-500 shadow-sm">
                                No hay plantillas de disponibilidad registradas todavía.
                            </div>
                        ) : (
                            disponibilidades.map(item => (
                                <div key={item.id} className="bg-white border border-slate-200/80 rounded-[28px] p-6 space-y-4 shadow-sm">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-xs font-bold text-slate-900 uppercase">
                                            Profesional: <span className="text-[#009688]">{item.profesionalId}</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {item.horarios.map((h, idx) => (
                                            <div key={idx} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 space-y-2">
                                                <span className="text-xs font-bold text-slate-800 block border-b pb-1.5">{h.dia}</span>
                                                <div className="space-y-1.5">
                                                    {h.franjas.map((f, fIdx) => (
                                                        <div key={fIdx} className="flex justify-between items-center text-[11px] font-mono bg-white px-3 py-1.5 rounded-xl border">
                                                            <span>{f.inicio} - {f.fin}</span>
                                                            <span className="text-[#009688] font-bold">{f.duracionCitaMinutos} min</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-4 border-t border-slate-200/80">
                    <div className="lg:col-span-5 bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-sm font-bold text-slate-900">Registrar Bloqueo, Vacaciones o Festivo</h2>
                        </div>

                        <form onSubmit={handleGuardarBloqueo} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Alcance</label>
                                <select
                                    value={alcanceBloqueo}
                                    onChange={(e) => setAlcanceBloqueo(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition cursor-pointer"
                                >
                                    <option value="profesional">Profesional Concreto</option>
                                    <option value="global">Toda la Sede / Sistema</option>
                                </select>
                            </div>

                            {alcanceBloqueo === "profesional" && (
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">ID Profesional Afectado</label>
                                    <input
                                        type="text"
                                        value={profBloqueoId}
                                        onChange={(e) => setProfBloqueoId(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={fechaInicioBloqueo}
                                        min={fechaHoy}
                                        onChange={(e) => setFechaInicioBloqueo(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={fechaFinBloqueo}
                                        min={fechaInicioBloqueo || fechaHoy}
                                        onChange={(e) => setFechaFinBloqueo(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#009688]">Motivo</label>
                                <input
                                    type="text"
                                    value={motivoBloqueo}
                                    onChange={(e) => setMotivoBloqueo(e.target.value)}
                                    placeholder="Ej: Vacaciones"
                                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#009688] focus:outline-none transition"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#009688] hover:bg-[#00796b] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                            >
                                Aplicar Bloqueo en Agenda
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-[24px] px-6 py-3.5 border border-slate-200/80 shadow-sm flex justify-between items-center">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bloqueos Activos</h2>
                            <span className="px-3 py-1 bg-teal-50 text-[#009688] border border-teal-200 text-[11px] font-mono font-bold rounded-lg">
                                {bloqueos.length} Excepción(es)
                            </span>
                        </div>

                        {bloqueos.length === 0 ? (
                            <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 text-center text-xs text-slate-500 shadow-sm">
                                No hay vacaciones ni bloqueos registrados.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bloqueos.map(b => (
                                    <div key={b.id} className="bg-white border rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{b.motivo} ({b.fechaInicio})</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarBloqueo(b.id)}
                                            className="px-3.5 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PortalShell>
    );
}