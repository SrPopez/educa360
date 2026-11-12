"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function SecurityRolePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [busqueda, setBusqueda] = useState("");

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

            setCurrentUserData({
            email: currentUser.email,
            uid: currentUser.uid,
            role: idTokenResult.claims.role || "paciente",
            });

            try {
                const res = await fetch("/api/usuarios");
                const contentType = res.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.success) {
                        setUsuariosSistema(data.usuarios);
                    }
                } else {
                    console.error("La API no devolvió un JSON válido (se recibió HTML).");
                }
            } catch (err) {
                console.error("Error al cargar usuarios desde la API:", err);
            }

            setLoading(false);
        }
        });

        return () => unsubscribe();
    }, [router]);

    const usuariosFiltrados = usuariosSistema.filter((u) => {
        const termino = busqueda.toLowerCase();
        return (
        u.email.toLowerCase().includes(termino) ||
        u.role.toLowerCase().includes(termino) ||
        u.fuente.toLowerCase().includes(termino)
        );
    });

    if (loading) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando credenciales de base de datos...</p>
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
                    Gestión avanzada de sesiones y control de acceso institucional
                </p>
                </div>
            </div>
            <button
                onClick={() => router.push("/paciente/dashboard")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700 shadow-sm"
            >
                ← Volver al Dashboard
            </button>
            </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Centro de Integridad de Sesión
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Control de Privilegios y Credenciales</h2>
            <p className="text-slate-500 text-xs mt-0.5">Supervisión en tiempo real del estado de autenticación y roles globales de usuarios en Firebase.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rol de Usuario Actual</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                    Verificado por Servidor
                </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                {currentUserData?.role} (ADMINISTRADOR)
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">UID: {currentUserData?.uid}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Estado del Canal</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold">
                    Sincronizado
                </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Tokens Criptográficos Activos</h3>
                <p className="text-[11px] text-slate-500 font-mono">Autenticación vía Firebase Auth Claims.</p>
            </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                <h3 className="text-sm font-bold text-slate-900">Directorio de Usuarios de Firebase</h3>
                <p className="text-xs text-slate-500">Listado extraído directamente desde la base de datos de autenticación.</p>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="Buscar por correo o rol..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full sm:w-64 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-600 transition"
                />
                <span className="text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md shrink-0">
                    {usuariosFiltrados.length === 1 ? "1 usuario" : `${usuariosFiltrados.length} usuarios`}
                </span>
                </div>
            </div>

            {usuariosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                No se encontraron usuarios en la base de datos.
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-5">Correo Electrónico (Usuario)</th>
                        <th className="py-3 px-5">Rol Asignado</th>
                        <th className="py-3 px-5">Origen</th>
                        <th className="py-3 px-5 text-right">Estado de Acceso</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {usuariosFiltrados.map((u, index) => (
                        <tr key={index} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-5 font-mono text-slate-900">{u.email}</td>
                        <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                            u.role === "admin" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                            {u.role}
                            </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">{u.fuente}</td>
                        <td className="py-3.5 px-5 text-right">
                            {u.autorizado ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                                Autorizado
                            </span>
                            ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-semibold">
                                No Autorizado
                            </span>
                            )}
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