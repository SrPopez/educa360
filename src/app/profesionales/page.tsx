"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function CuadroMedicoPublico() {
    const [profesionales, setProfesionales] = useState<any[]>([]);
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todas");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfesionales() {
            try {
                const querySnapshot = await getDocs(collection(db, "profesionales_publicos"));
                if (!querySnapshot.empty) {
                    const lista = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setProfesionales(lista);
                } else {
                    setProfesionales([]);
                }
            } catch (error) {
                console.error("Error al cargar el cuadro médico:", error);
                setProfesionales([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProfesionales();
    }, []);

    const especialidades = ["Todas", ...new Set(profesionales.map((p) => p.especialidad).filter(Boolean))];

    const profesionalesFiltrados =
        filtroEspecialidad === "Todas"
            ? profesionales
            : profesionales.filter((p) => p.especialidad === filtroEspecialidad);

    return (
        <div className="min-h-screen bg-[#f8fafc] antialiased">
            <header className="bg-[#090d16] text-white relative overflow-hidden border-b border-slate-800">
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#009688] text-white font-bold text-base flex items-center justify-center shadow-lg shadow-teal-900/40">
                                E
                            </div>
                            <div>
                                <span className="font-bold text-base tracking-tight block">Educa360 Salud</span>
                                <span className="text-[10px] font-mono text-slate-400">Cuadro Médico Oficial</span>
                            </div>
                        </Link>

                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#009688] hover:bg-[#00796b] text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-700/25 transition"
                        >
                            Acceder al Portal / Pedir Cita
                        </Link>
                    </div>

                    <div className="max-w-2xl space-y-2">
                        <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1 rounded-md font-bold">
                            Equipo Asistencial Verificado
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight pt-1">
                            Nuestros Profesionales Sanitarios
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Consulte las especialidades disponibles, sedes de atención y perfiles clínicos acreditados de nuestra red.
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
                {profesionales.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {especialidades.map((esp) => (
                            <button
                                key={esp}
                                onClick={() => setFiltroEspecialidad(esp)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    filtroEspecialidad === esp
                                        ? "bg-[#009688] text-white shadow-sm shadow-teal-700/20"
                                        : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                                }`}
                            >
                                {esp}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center">
                        <p className="text-xs font-mono text-slate-500 animate-pulse">
                            Cargando cuadro médico acreditado...
                        </p>
                    </div>
                ) : profesionalesFiltrados.length === 0 ? (
                    <div className="bg-white rounded-[28px] border border-slate-200/80 p-16 text-center space-y-3 shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-700">No hay profesionales sanitarios registrados</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Actualmente la base de datos de profesionales públicos se encuentra vacía o sin registros activos.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profesionalesFiltrados.map((prof) => (
                            <div
                                key={prof.id}
                                className="bg-white rounded-[28px] border border-slate-200/80 p-7 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#009688] border border-teal-200 font-bold text-base flex items-center justify-center shrink-0">
                                            {(prof.nombre || "P").replace(/^Dr\.?\s|^Dra\.?\s/i, "").charAt(0).toUpperCase()}
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                            Disponible
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#009688]">
                                            {prof.especialidad}
                                        </span>
                                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                                            {prof.nombre}
                                        </h2>
                                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                                            {prof.sede}
                                        </p>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {prof.bio}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <Link
                                        href="/login"
                                        className="w-full py-3 bg-slate-900 hover:bg-[#009688] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        Solicitar Consulta
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}