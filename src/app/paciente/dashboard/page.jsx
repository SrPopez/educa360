"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function DashboardPacientePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState([]);
  const [warningMessage, setWarningMessage] = useState(null);
  const [citaACancelar, setCitaACancelar] = useState(null);
  
  const [vistaActual, setVistaActual] = useState("citas");
  const [citaSeleccionadaModal, setCitaSeleccionadaModal] = useState(null);
  const [leidos, setLeidos] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        
        const citasGuardadas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
        const citasUsuario = citasGuardadas.filter(
          (cita) => cita.userId === currentUser.uid || cita.userEmail === currentUser.email
        );
        setCitas(citasUsuario);

        const leidosGuardados = JSON.parse(localStorage.getItem(`diagnosticos_leidos_${currentUser.uid}`) || "[]");
        setLeidos(leidosGuardados);
        
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleSolicitarCancelacion = (cita) => {
    setWarningMessage(null);
    setCitaACancelar(cita);
  };

  const handleConfirmarEliminacion = () => {
    if (!citaACancelar) return;

    const citasGlobales = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
    
    const nuevasCitasGlobales = citasGlobales.map(cita => 
      String(cita.id) === String(citaACancelar.id) ? { ...cita, estado: "Cancelada" } : cita
    );
    localStorage.setItem("citas_educa360", JSON.stringify(nuevasCitasGlobales));

    setCitas(nuevasCitasGlobales.filter(c => c.userId === user?.uid || c.userEmail === user?.email));

    const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
    const nuevoLog = {
      id: Date.now(),
      accion: "PACIENTE_ELIMINAR_CITA",
      userEmail: user?.email || "Usuario",
      descripcion: `Se canceló la cita de ${citaACancelar?.especialidad || "Desconocida"}`,
      fecha: new Date().toLocaleString(),
      tipo: "warning"
    };
    localStorage.setItem("logs_educa360", JSON.stringify([nuevoLog, ...logsActuales]));

    setCitaACancelar(null);
  };

  const formatEstado = (estado) => {
    if (!estado) return "Pendiente";
    const est = estado.toLowerCase();
    if (est === "completada" || est === "atendida") return "Completada";
    if (est === "confirmada") return "Confirmada";
    if (est === "cancelada" || est === "anulada") return "Cancelada";
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  const getBadgeStyle = (estado) => {
    const est = (estado || "").toLowerCase();
    if (est === "confirmada") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (est === "completada" || est === "atendida") return "bg-blue-50 text-blue-700 border border-blue-200";
    if (est === "cancelada" || est === "anulada") return "bg-red-50 text-red-700 border border-red-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  const citasCompletadas = citas.filter(
    (cita) => (cita.estado?.toLowerCase() === "completada" || cita.estado?.toLowerCase() === "atendida") && cita.diagnostico
  );

  const noLeidasCount = citasCompletadas.filter((c) => !leidos.includes(c.id)).length;

  const marcarComoLeido = (citaId, e) => {
    e.stopPropagation();
    if (!leidos.includes(citaId)) {
      const nuevosLeidos = [...leidos, citaId];
      setLeidos(nuevosLeidos);
      if (user) {
        localStorage.setItem(`diagnosticos_leidos_${user.uid}`, JSON.stringify(nuevosLeidos));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando sistema...</p>
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
              onClick={() => setVistaActual(vistaActual === "diagnosticos" ? "citas" : "diagnosticos")}
              className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 shadow-sm flex items-center justify-center"
              title="Ver Diagnósticos Médicos"
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

      {citaACancelar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-200 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">¿Confirmar cancelación de cita?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ¿Estás seguro de que deseas cancelar tu cita de <strong>{citaACancelar.especialidad}</strong> para el <strong>{citaACancelar.fecha}</strong> a las <strong>{citaACancelar.hora}</strong>?
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCitaACancelar(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmarEliminacion}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {citaSeleccionadaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {citaSeleccionadaModal.especialidad}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Detalle del Diagnóstico Clínico</h3>
              </div>
              <button
                onClick={() => setCitaSeleccionadaModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="text-slate-500 font-semibold">Médico asignado: <span className="text-slate-800 font-normal">{citaSeleccionadaModal.medicoAsignado || "No especificado"}</span></p>
                <p className="text-slate-500 font-semibold">Fecha de la cita: <span className="text-slate-800 font-normal">{citaSeleccionadaModal.fecha} a las {citaSeleccionadaModal.hora}</span></p>
                <p className="text-slate-500 font-semibold">Atendido el: <span className="text-slate-800 font-normal">{citaSeleccionadaModal.fechaAtencion || "N/D"}</span></p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Diagnóstico del Profesional:</label>
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                  {citaSeleccionadaModal.diagnostico}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Tratamiento e Indicaciones:</label>
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                  {citaSeleccionadaModal.tratamiento || "Sin indicaciones específicas registradas."}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCitaSeleccionadaModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shadow-sm">
              Rol: Paciente
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Bienvenido, {user?.displayName || "Usuario"}</h2>
            <p className="text-slate-500 text-xs mt-0.5">Gestione sus citas médicas y consulte sus diagnósticos clínicos.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
              {user?.email}
            </span>
            <button onClick={() => router.push("/paciente/pedir-cita")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition">
              + Solicitar Nueva Cita
            </button>
          </div>
        </div>

        {vistaActual === "diagnosticos" ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden space-y-4 animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historial de Diagnósticos Médicos</h3>
                <p className="text-xs text-slate-500">Citas completadas con valoraciones y tratamientos emitidos.</p>
              </div>
              <button
                onClick={() => setVistaActual("citas")}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                ← Volver a Mis Citas
              </button>
            </div>

            {citasCompletadas.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No tienes ningún diagnóstico médico completado todavía.
              </div>
            ) : (
              <div className="overflow-x-auto px-5 pb-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Especialidad</th>
                      <th className="py-3 px-4">Médico</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {citasCompletadas.map((cita) => {
                      const isLeido = leidos.includes(cita.id);
                      return (
                        <tr key={cita.id} className={`hover:bg-slate-50/60 transition ${!isLeido ? "bg-amber-50/30" : ""}`}>
                          <td className="py-3.5 px-4 text-slate-900 font-medium flex items-center gap-2">
                            {cita.especialidad}
                            {!isLeido && (
                              <span className="w-2 h-2 rounded-full bg-amber-500" title="Nuevo diagnóstico pendiente de leer"></span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{cita.medicoAsignado || "No especificado"}</td>
                          <td className="py-3.5 px-4 text-slate-600">{cita.fecha} ({cita.hora})</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getBadgeStyle(cita.estado)}`}>
                              {formatEstado(cita.estado)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {!isLeido && (
                              <button
                                onClick={(e) => marcarComoLeido(cita.id, e)}
                                title="Marcar como visto / quitar aviso"
                                className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition inline-flex items-center justify-center shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                marcarComoLeido(cita.id, { stopPropagation: () => {} });
                                setCitaSeleccionadaModal(cita);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition"
                            >
                              Ver Diagnóstico
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            {warningMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex justify-between items-center">
                <span>{warningMessage}</span>
                <button onClick={() => setWarningMessage(null)} className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition">
                  Cerrar
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Mis Citas Solicitadas</h3>
                <span className="text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md">
                  {citas.length === 1 ? "1 cita registrada" : `${citas.length} citas registradas`}
                </span>
              </div>

              {citas.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No tienes ninguna cita registrada.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-5">Especialidad</th>
                        <th className="py-3 px-5">Médico</th>
                        <th className="py-3 px-5">Fecha</th>
                        <th className="py-3 px-5">Hora</th>
                        <th className="py-3 px-5">Estado</th>
                        <th className="py-3 px-5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                      {citas.map((cita) => (
                        <tr key={cita.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-5 text-slate-900 font-medium">{cita.especialidad}</td>
                          <td className="py-3.5 px-5 text-slate-600">{cita.medicoAsignado || "No especificado"}</td>
                          <td className="py-3.5 px-5 text-slate-600">{cita.fecha}</td>
                          <td className="py-3.5 px-5 text-slate-600">{cita.hora}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getBadgeStyle(cita.estado)}`}>
                              {formatEstado(cita.estado)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {cita.estado?.toLowerCase() !== "cancelada" && cita.estado?.toLowerCase() !== "completada" && (
                              <button onClick={() => handleSolicitarCancelacion(cita)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold rounded transition">
                                Anular
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}