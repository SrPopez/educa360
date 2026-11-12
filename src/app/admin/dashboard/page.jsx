"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function AdminSistemaDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logsSistema, setLogsSistema] = useState([]);
    const [mensajeExito, setMensajeExito] = useState("");
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            router.push("/login");
        } else {
            setUser(currentUser);
            cargarLogs();
            setLoading(false);
        }
        });
        return () => unsubscribe();
    }, [router]);

    const cargarLogs = () => {
        const guardadas = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
        setLogsSistema(guardadas);
    };

    const confirmarLimpiarLogs = () => {
        localStorage.removeItem("logs_educa360");
        setLogsSistema([]);
        setMostrarConfirmacion(false);
        setMensajeExito("Se han eliminado todos los registros de auditoría del sistema.");
        setTimeout(() => setMensajeExito(""), 3000);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando consola del sistema...</p>
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
                <p className="text-[11px] text-slate-400">Consola de Auditoría y Seguridad</p>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700 shadow-sm"
            >
                Cerrar Sesión
            </button>
            </div>
        </header>

        {mostrarConfirmacion && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">¿Confirmar limpieza de registros?</h3>
                    <p className="text-xs text-slate-500">Esta acción eliminará permanentemente todo el historial de auditoría.</p>
                </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                <button
                    onClick={() => setMostrarConfirmacion(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                    Cancelar
                </button>
                <button
                    onClick={confirmarLimpiarLogs}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                    Aceptar
                </button>
                </div>
            </div>
            </div>
        )}

        <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Rol: Administrador del Sistema
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Auditoría y Trazabilidad del Sistema</h2>
                <p className="text-slate-500 text-xs mt-0.5">Supervisión de registros, accesos de usuarios y eventos críticos de seguridad.</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {user?.email}
                </span>
                {logsSistema.length > 0 && (
                <button
                    onClick={() => setMostrarConfirmacion(true)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                >
                    Limpiar Logs
                </button>
                )}
            </div>
            </div>

            {mensajeExito && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                {mensajeExito}
            </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Historial de Registros de Actividad (Logs)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Descripción del Evento</th>
                    <th className="py-3 px-4 text-right">Fecha y Hora</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                    {logsSistema.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-400">
                        No hay registros de auditoría en este momento.
                        </td>
                    </tr>
                    ) : (
                    logsSistema.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {log.accion}
                            </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{log.userEmail}</td>
                        <td className="py-3 px-4 text-slate-600">{log.descripcion}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{log.fecha}</td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </div>
        </section>
        </main>
    );
}