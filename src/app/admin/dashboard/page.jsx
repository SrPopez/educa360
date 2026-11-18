"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useAuthGuard } from "@/lib/useAuthGuard";
import PortalShell from "@/components/PortalShell";
import { Tarjeta } from "@/components/ComponentesUI";
import { EstadoCargando } from "@/components/EstadosUI";

export function registrarLogSistema(tipo, usuario, detalle) {
    try {
        const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
        
        const ahora = new Date();
        const fechaFormateada = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;

        const nuevoLog = {
            id: Date.now(),
            fecha: fechaFormateada,
            tipo: tipo.toUpperCase(),
            usuario: usuario || "sistema@educa360.test",
            detalle: detalle
        };

        const logsActualizados = [nuevoLog, ...logsActuales];
        localStorage.setItem("logs_educa360", JSON.stringify(logsActualizados));
    } catch (error) {
        console.error("Error al registrar el log del sistema:", error);
    }
}

export default function AdminLogsDashboardPage() {
    const router = useRouter();
    const { user, loading: authGuardLoading } = useAuthGuard("admin");

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas las categorías");

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);

        try {
            const logsGuardados = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
            setLogs(Array.isArray(logsGuardados) ? logsGuardados : []);
        } catch (error) {
            console.error("Error cargando logs:", error);
            setLogs([]);
        }

        if (!authGuardLoading) {
            setLoading(false);
            clearTimeout(timer);
        }

        return () => clearTimeout(timer);
    }, [authGuardLoading]);

    const handleCerrarSesion = async () => {
        registrarLogSistema("AUTENTICACIÓN", user?.email || "adminsistema@educa360.test", "Cierre de sesión seguro realizado desde el panel de administración");
        await signOut(auth);
        router.push("/login");
    };

    const logsFiltrados = logs.filter((log) => {
        const tipoLog = (log?.tipo || "").trim().toLowerCase();
        const catFiltro = categoriaSeleccionada.trim().toLowerCase();

        const categoriaMatch = 
            categoriaSeleccionada === "Todas las categorías" || 
            tipoLog === catFiltro;

        const textoBusqueda = busqueda.trim().toLowerCase();
        const textoMatch = 
            textoBusqueda === "" ||
            tipoLog.includes(textoBusqueda) ||
            (log?.usuario || "").toLowerCase().includes(textoBusqueda) ||
            (log?.detalle || "").toLowerCase().includes(textoBusqueda);

        return categoriaMatch && textoMatch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <EstadoCargando mensaje="Cargando registro de auditoría del sistema..." />
            </div>
        );
    }

    return (
        <PortalShell
            rolLabel="Administración del Sistema"
            rolTipo="admin"
            usuarioNombre="Administrador de Sistemas"
            usuarioEmail={user?.email || "adminsistema@educa360.test"}
            onLogout={handleCerrarSesion}
        >
            <div className="space-y-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                            Trazabilidad y Seguridad
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                            Registro de Logs del Sistema
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Auditoría en tiempo real de eventos de acceso, validaciones clínicas y seguridad institucional
                        </p>
                    </div>
                </div>

                <Tarjeta>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Historial de Eventos Registrados
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Mostrando {logsFiltrados.length} de {logs.length} registros protegidos bajo cifrado institucional
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Buscar por tipo, usuario o detalle..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 transition shadow-xs"
                                />
                            </div>

                            <div className="w-full sm:w-56">
                                <select
                                    value={categoriaSeleccionada}
                                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-600 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/10 transition cursor-pointer shadow-xs"
                                >
                                    <option value="Todas las categorías">Todas las categorías</option>
                                    <option value="Autenticación">Autenticación</option>
                                    <option value="Validación">Validación</option>
                                    <option value="Seguridad">Seguridad</option>
                                    <option value="Registro">Registro</option>
                                    <option value="Diagnóstico">Diagnóstico</option>
                                    <option value="Borrador">Borrador</option>
                                    <option value="Gestión Documental">Gestión Documental</option>
                                    <option value="Sistema">Sistema</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto pt-4">
                        {logsFiltrados.length === 0 ? (
                            <div className="py-12 px-4 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#009688] border border-teal-100 flex items-center justify-center mx-auto text-sm font-bold shadow-xs">
                                    i
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-800">No hay registros de auditoría disponibles</p>
                                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                        Actualmente el sistema no registra eventos bajo este criterio de búsqueda.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                                        <th className="pb-3.5 font-semibold w-[160px]">Marca Temporal</th>
                                        <th className="pb-3.5 font-semibold w-[190px]">Tipo de Evento</th>
                                        <th className="pb-3.5 font-semibold w-[260px]">Usuario / Entidad</th>
                                        <th className="pb-3.5 font-semibold">Detalle de la Operación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                    {logsFiltrados.map((log, index) => {
                                        const tipoLower = (log?.tipo || "").toLowerCase();
                                        
                                        let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                                        if (tipoLower.includes("seguridad")) {
                                            badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
                                        } else if (tipoLower.includes("validación")) {
                                            badgeColor = "bg-teal-50 text-teal-700 border-teal-200";
                                        } else if (tipoLower.includes("autenticación")) {
                                            badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                                        } else if (tipoLower.includes("registro")) {
                                            badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
                                        } else if (tipoLower.includes("diagnóstico")) {
                                            badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                        } else if (tipoLower.includes("borrador")) {
                                            badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                                        } else if (tipoLower.includes("gestión documental")) {
                                            badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                                        } else if (tipoLower.includes("sistema")) {
                                            badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                                        }

                                        return (
                                            <tr key={log?.id || index} className="hover:bg-slate-50/80 transition">
                                                <td className="py-5 pr-4 text-slate-500 whitespace-nowrap">
                                                    {log?.fecha || "—"}
                                                </td>
                                                <td className="py-5 pr-8">
                                                    <span className={`inline-flex items-center justify-center w-[155px] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap border ${badgeColor}`}>
                                                        {log?.tipo || "GENERAL"}
                                                    </span>
                                                </td>
                                                <td className="py-5 pr-6 font-semibold text-slate-800 break-words max-w-[260px]">
                                                    {log?.usuario || "sistema@educa360.test"}
                                                </td>
                                                <td className="py-5 text-slate-600 font-sans text-xs">
                                                    {log?.detalle || "Sin detalles registrados"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Tarjeta>
            </div>
        </PortalShell>
    );
}