"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

export default function RegisterPage() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const telefonoLimpio = telefono.replace(/\s+/g, '');
        const telefonoRegex = /^\+\d{1,3}\d{9}$/;
        
        if (!telefonoRegex.test(telefonoLimpio)) {
            setError("El teléfono debe incluir el prefijo internacional (ej. +34) y exactamente 9 dígitos.");
            return;
        }

        setLoading(true);

        try {
            // 1. Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: nombre });

            // 2. Determinar el rol institucional según el correo
            const emailLower = email.toLowerCase();
            let roleDeterminado = "paciente";

            if (emailLower.includes("adminsistema")) {
                roleDeterminado = "admin_sistema";
            } else if (emailLower.includes("medico")) {
                roleDeterminado = "profesional_sanitario";
            } else if (emailLower.includes("administracion")) {
                roleDeterminado = "admin";
            } else if (emailLower.includes("alumno")) {
                roleDeterminado = "alumno_practicas";
            } else if (emailLower.includes("editor")) {
                roleDeterminado = "editor_contenidos";
            }

            // 3. Guardar en Firestore (Fuente de verdad de la app)
            await setDoc(doc(db, "usuarios", user.uid), {
                uid: user.uid,
                nombre,
                email,
                telefono: telefonoLimpio,
                role: roleDeterminado,
                createdAt: new Date().toISOString()
            });

            // Guardar también en localStorage para respaldar el flujo de autenticación y 2FA
            localStorage.setItem(`rol_${email.trim().toLowerCase()}`, roleDeterminado);
            localStorage.removeItem(`totp_configurado_${email.trim().toLowerCase()}`);

            // 4. Enviar los datos al backend (API) para que inyecte el teléfono en el Auth del servidor
            try {
                await fetch("/api/set-claims", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        uid: user.uid, 
                        email: user.email, 
                        telefono: telefonoLimpio 
                    }),
                });
            } catch (claimErr) {
                console.warn("Aviso: No se pudo actualizar Auth en el servidor local, pero los datos están en Firestore.");
            }

            // 5. Redirigir al login
            router.push("/login");
        } catch (err) {
            console.error("Error detallado en el registro:", err);
            
            let mensajeAmigable = "No se pudo completar el registro.";
            if (err.code === "auth/email-already-in-use") {
                mensajeAmigable = "Este correo ya está registrado en el sistema.";
            } else if (err.code === "auth/invalid-email") {
                mensajeAmigable = "El formato del correo electrónico no es válido.";
            } else if (err.message) {
                mensajeAmigable = err.message;
            }

            setError(mensajeAmigable);
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

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Juan Pérez"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition shadow-sm"
                        />
                    </div>

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
                            Teléfono
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="+34 600 000 000"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
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
                        {loading ? "Creando cuenta..." : "Crear Cuenta"}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-xs text-slate-500">
                        ¿Ya tienes una cuenta?{" "}
                        <button onClick={() => router.push("/login")} className="text-blue-600 font-bold hover:underline">
                            Inicia sesión aquí
                        </button>
                    </p>
                    <p className="text-[11px] text-slate-400">
                        Control de acceso con segundo factor obligatorio para perfiles sanitarios.
                    </p>
                </div>
            </div>
        </main>
    );
}