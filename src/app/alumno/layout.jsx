"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AlumnoLayout({ children }) {
    const router = useRouter();
    const [verificando, setVerificando] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                const rutaActual = window.location.pathname;
                router.push(`/login?sesionCaducada=true&redirect=${encodeURIComponent(rutaActual)}`);
                return;
            }

            try {
                const userDocRef = doc(db, "usuarios", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                let rol = "alumno_practicas";
                if (userDoc.exists()) {
                    rol = userDoc.data().role || "alumno_practicas";
                } else {
                    rol = localStorage.getItem(`rol_${user.email}`) || "alumno_practicas";
                }

                if (rol !== "alumno_practicas" && rol !== "admin_sistema") {
                    router.push("/access-denied");
                    return;
                }

            } catch (error) {
                console.error("Error al validar permisos:", error);
            } finally {
                setVerificando(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (verificando) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-medium">
                Verificando credenciales de alumno...
            </div>
        );
    }

    return <>{children}</>;
}