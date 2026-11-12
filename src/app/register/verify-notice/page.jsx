"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function VerifyNoticeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";
    const roleParam = searchParams.get("role") || "";

    const [user, setUser] = useState(null);
    const [verificado, setVerificado] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.emailVerified) {
                    setVerificado(true);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const comprobarVerificacion = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                router.push("/login");
                return;
            }

            try {
                await currentUser.reload();
            } catch (reloadErr) {
                console.warn("No se pudo recargar el token, continuando con la sesión actual:", reloadErr);
            }

            const refreshedUser = auth.currentUser || currentUser;

            if (refreshedUser.emailVerified) {
                setVerificado(true);
                setMensaje("¡Correo verificado con éxito! Redirigiendo a tu panel...");

                let rolFinal = roleParam || localStorage.getItem(`rol_${refreshedUser.email}`);

                if (!rolFinal) {
                    try {
                        const userDocRef = doc(db, "usuarios", refreshedUser.uid);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            rolFinal = userDoc.data().role;
                        }
                    } catch (e) {
                        console.error("Error leyendo Firestore:", e);
                    }
                }

                rolFinal = rolFinal || "paciente";
                localStorage.setItem(`rol_${refreshedUser.email}`, rolFinal);

                setTimeout(() => {
                    if (rolFinal === "profesional_sanitario") {
                        const totpConfigurado = localStorage.getItem(`totp_configurado_${refreshedUser.email}`);
                        if (!totpConfigurado) {
                            router.push(`/api/verify-2fa?email=${encodeURIComponent(refreshedUser.email)}`);
                            return;
                        }
                        router.push("/medico/dashboard");
                    } else if (rolFinal === "admin_general") {
                        router.push("/admin-general/dashboard");
                    } else {
                        router.push("/paciente/dashboard");
                    }
                }, 1500);

            } else {
                setMensaje("El correo aún no ha sido verificado. Por favor, haz clic en el enlace que te hemos enviado.");
            }
        } catch (error) {
            console.error("Error al comprobar verificación:", error);
            router.push("/login");
        }
    };

    const reenviarCorreo = async () => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await sendEmailVerification(currentUser);
                setMensaje("Correo de verificación reenviado con éxito. Revisa tu bandeja de entrada.");
            } else {
                router.push("/login");
            }
        } catch (e) {
            setMensaje("Error al reenviar el correo. Por favor, inicia sesión de nuevo.");
            setTimeout(() => router.push("/login"), 2000);
        }
    };

    return (
        <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-slate-900">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-[440px] w-full p-10 space-y-6 text-center">
                
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center border border-blue-100 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verifica tu correo electrónico</h2>
                    <p className="text-xs text-slate-500 leading-relaxed px-2">
                        Hemos enviado un enlace de verificación a <strong className="text-slate-700">{emailParam || user?.email}</strong>. Por favor, haz clic en él para continuar.
                    </p>
                </div>

                {mensaje && (
                    <div className={`p-3.5 text-xs rounded-xl font-medium ${verificado ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        {mensaje}
                    </div>
                )}

                <div className="space-y-3 pt-2">
                    <button
                        onClick={comprobarVerificacion}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition"
                    >
                        Ya he verificado mi correo
                    </button>

                    <button
                        onClick={reenviarCorreo}
                        className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200"
                    >
                        Reenviar correo de verificación
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function VerifyNoticePage() {
    return (
        <Suspense fallback={<div className="text-center p-12 text-xs text-slate-400">Cargando...</div>}>
            <VerifyNoticeContent />
        </Suspense>
    );
}