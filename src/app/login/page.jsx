"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const sesionCaducada = searchParams.get("sesionCaducada");
    const redirectPath = searchParams.get("redirect") || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            try {
                await user.reload();
            } catch (err) {
                console.warn("Aviso: No se pudo recargar el usuario:", err);
            }

            const currentUser = auth.currentUser || user;

            if (!currentUser.emailVerified) {
                await sendEmailVerification(currentUser);
                router.push(`/register/verify-notice?email=${encodeURIComponent(currentUser.email)}&role=profesional_sanitario`);
                return;
            }

            let rolLimpio = "paciente";
            try {
                const userDocRef = doc(db, "usuarios", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    rolLimpio = userDoc.data().role || "paciente";
                }
            } catch (e) {
                console.error("Error leyendo Firestore:", e);
                rolLimpio = localStorage.getItem(`rol_${currentUser.email}`) || "paciente";
            }

            localStorage.setItem(`rol_${currentUser.email}`, rolLimpio);

            if (
                rolLimpio === "profesional_sanitario" || 
                rolLimpio.includes("medico") || 
                currentUser.email.toLowerCase().includes("medico")
            ) {
                router.push(`/verify-2fa?email=${encodeURIComponent(currentUser.email)}`);
                return;
            }

            const logsActuales = JSON.parse(localStorage.getItem("logs_educa360") || "[]");
            localStorage.setItem("logs_educa360", JSON.stringify([
                {
                    id: Date.now(),
                    accion: "LOGIN_EXITOSO",
                    userEmail: currentUser.email,
                    descripcion: `Inicio de sesión correcto con rol: ${rolLimpio}`,
                    fecha: new Date().toLocaleString(),
                    tipo: "success"
                },
                ...logsActuales
            ]));

            if (redirectPath) {
                router.push(redirectPath);
                return;
            }

            if (rolLimpio === "admin_sistema") {
                router.push("/admin/dashboard");
            } else if (rolLimpio === "admin") {
                router.push("/admin-general/dashboard");
            } else if (rolLimpio === "alumno_practicas") {
                router.push("/alumno/dashboard");
            } else if (rolLimpio === "editor_contenidos") {
                router.push("/editor/dashboard");
            } else {
                router.push("/paciente/dashboard");
            }

        } catch (err) {
            console.error("Error en el login:", err);
            setError("Correo o contraseña incorrectos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-slate-800">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
                        E
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Educa360
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Plataforma Segura de Gestión Institucional y Sanitaria
                    </p>
                </div>

                {sesionCaducada && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg text-center font-medium">
                        Tu sesión ha caducado. Por favor, vuelve a iniciar sesión para continuar.
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="usuario@dominio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-md transition disabled:opacity-50"
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-xs text-slate-500">
                        ¿No tienes una cuenta?{" "}
                        <button onClick={() => router.push("/register")} className="text-blue-600 font-bold hover:underline">
                            Regístrate aquí
                        </button>
                    </p>
                    <p className="text-[11px] text-slate-400">
                        Control de acceso con verificación de correo y doble factor obligatorio para sanitarios.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">Cargando...</div>}>
            <LoginContent />
        </Suspense>
    );
}