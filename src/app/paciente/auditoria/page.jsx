"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function AuditoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        const idTokenResult = await currentUser.getIdTokenResult(true);
        if (idTokenResult.claims.role !== "admin") {
          router.push("/paciente/dashboard");
          return;
        }

        const logsGuardados = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
        setLogs(logsGuardados);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleConfirmarLimpieza = () => {
    localStorage.removeItem("logs_educa360");
    setLogs([]);
    setMostrarConfirmacion(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando auditoría...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              E
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide">
                Educa360
              </h1>
              <p className="text-[11px] text-slate-400">
                Trazabilidad y eventos del sistema institucional
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {logs.length > 0 && (
              <button
                onClick={() => setMostrarConfirmacion(true)}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition border border-red-200 shadow-sm"
              >
                Limpiar Registro
              </button>
            )}
            <button
              onClick={() => router.push("/paciente/dashboard")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700 shadow-sm"
            >
              ← Volver al Panel
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Módulo de Seguridad y Logs
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Historial de Eventos</h2>
          <p className="text-slate-500 text-xs mt-0.5">Visualización detallada de las acciones ejecutadas en la plataforma.</p>
        </div>

        {mostrarConfirmacion && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-red-900 font-medium">
              <strong>Advertencia:</strong> ¿Estás seguro de que deseas vaciar todo el registro de auditoría? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-2 shrink-0">
              <button
                onClick={handleConfirmarLimpieza}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition shadow-sm"
              >
                Sí, limpiar
              </button>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Logs del Sistema</h3>
              <p className="text-xs text-slate-500">Registro histórico de transacciones y accesos.</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md">
              {logs.length === 1 ? "1 evento registrado" : `${logs.length} eventos registrados`}
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No hay registros de auditoría en este momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Fecha y Hora</th>
                    <th className="py-3 px-5">Acción</th>
                    <th className="py-3 px-5">Usuario (Correo)</th>
                    <th className="py-3 px-5">Descripción del Suceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5 text-slate-500 text-[11px] font-mono">{log.fecha}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[11px] font-mono font-semibold">
                          {log.accion}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-900">
                        {log.userEmail || "Sistema / Anónimo"}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {log.descripcion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}