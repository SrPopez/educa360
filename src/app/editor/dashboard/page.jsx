"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function EditorContenidosDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contenido, setContenido] = useState("");
    const [mensajeExito, setMensajeExito] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            router.push("/login");
        } else {
            setUser(currentUser);
            const guardado = localStorage.getItem("portal_contenido_educa360");
            if (guardado) setContenido(guardado);
            setLoading(false);
        }
        });
        return () => unsubscribe();
    }, [router]);

    const handleGuardarContenido = (e) => {
        e.preventDefault();
        localStorage.setItem("portal_contenido_educa360", contenido);

        const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
        const nuevoLog = {
        id: Date.now(),
        accion: "ACTUALIZAR_CONTENIDO",
        userEmail: user.email,
        descripcion: "El editor de contenidos modificó los avisos del portal web.",
        fecha: new Date().toLocaleString(),
        tipo: "success"
        };
        localStorage.setItem("logs_educa360", JSON.stringify([nuevoLog, ...logsActuales]));

        setMensajeExito(true);
        setTimeout(() => setMensajeExito(false), 3000);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">Cargando gestor de contenidos...</p>
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
                <p className="text-[11px] text-slate-400">Gestor de Contenidos del Portal</p>
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shadow-sm">
                Rol: Editor de Contenidos
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Administración del Portal Web</h2>
                <p className="text-slate-500 text-xs mt-0.5">Gestión de textos informativos y avisos institucionales (Sin acceso a datos de usuarios o citas).</p>
            </div>
            <div className="text-right">
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {user?.email}
                </span>
            </div>
            </div>

            {mensajeExito && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                ¡Contenido del portal actualizado y publicado con éxito!
            </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Editor de Anuncios y Avisos Institucionales</h3>
            
            <form onSubmit={handleGuardarContenido} className="space-y-4">
                <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Texto Principal del Banner / Aviso
                </label>
                <textarea
                    rows="5"
                    required
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Bienvenido al portal institucional de Educa360. Aquí puede actualizar los avisos y banners informativos visibles para los pacientes."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition"
                />
                </div>

                <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                >
                    Publicar Cambios en el Portal
                </button>
                </div>
            </form>
            </div>
        </section>
        </main>
    );
}