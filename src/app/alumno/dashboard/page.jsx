"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function AlumnoDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [citasAsignadas, setCitasAsignadas] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            router.push("/login");
        } else {
            setUser(currentUser);
            cargarCitas();
            setLoading(false);
        }
        });

        const handleStorageChange = (e) => {
        if (e.key === "citas_educa360") {
            cargarCitas();
        }
        };
        window.addEventListener("storage", handleStorageChange);

        return () => {
        unsubscribe();
        window.removeEventListener("storage", handleStorageChange);
        };
    }, [router]);

    const cargarCitas = () => {
        const guardadas = JSON.parse(localStorage.getItem("citas_educa360") || "[]");
        setCitasAsignadas(guardadas);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando consulta tutelada...</p>
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
                <h1 className="text-sm font-semibold text-white tracking-wide">Educa360</h1>
                <p className="text-[11px] text-slate-400">Entorno Académico y Clínico</p>
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

        <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Rol: Alumno en Prácticas (Supervisado)
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Consulta Tutelada de Casos</h2>
                <p className="text-slate-500 text-xs mt-0.5">Acceso exclusivo de lectura para formación clínica. Las operaciones de escritura están bloqueadas.</p>
            </div>
            <div className="text-right">
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {user?.email}
                </span>
            </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-3">
            <span className="text-base">⚠️</span>
            <p><strong>Aviso de supervisión:</strong> Este perfil se encuentra bajo un entorno de solo lectura formativa. No dispone de permisos para modificar datos ni emitir diagnósticos oficiales.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Historial de Casos y Citas Asignadas para Consulta</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Paciente (Anónimo/Ref)</th>
                    <th className="py-3 px-4">Especialidad</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Estado Clínico</th>
                    <th className="py-3 px-4 text-right">Modo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                    {citasAsignadas.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-400">
                        No hay casos clínicos asignados en este momento.
                        </td>
                    </tr>
                    ) : (
                    citasAsignadas.map((cita) => (
                        <tr key={cita.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-medium text-slate-800">
                            Ref-{cita.id ? cita.id.toString().slice(-6) : "General"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{cita.especialidad}</td>
                        <td className="py-3 px-4 text-slate-600">{cita.fecha} - {cita.hora}</td>
                        <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                            cita.estado === "Cancelada"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : cita.estado === "Completada" || cita.estado === "Confirmada"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                            {cita.estado || "Pendiente"}
                            </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Solo Lectura
                            </span>
                        </td>
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