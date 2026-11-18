"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function PortalShell({
    rolLabel = "Portal Institucional",
    rolTipo = "paciente",
    usuarioNombre = "Usuario Autorizado",
    usuarioEmail = "usuario@educa360.test",
    onLogout,
    children,
}) {
    const pathname = usePathname();
    const [menuAbierto, setMenuAbierto] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const emailLower = (usuarioEmail || "").toLowerCase();
    const roleLower = (rolTipo || "").toLowerCase();

    const esAdminSistema = emailLower.includes("adminsistema") || roleLower === "admin";
    const esAdminGeneral = emailLower.includes("administracion") || roleLower === "admin-general";
    const esAdmin = esAdminSistema || esAdminGeneral || roleLower.includes("admin");

    const esEditor = roleLower.includes("editor") || emailLower.includes("editor");
    const esMedico = roleLower.includes("medico") || roleLower.includes("profesional") || emailLower.includes("medico");
    const esAlumno = roleLower.includes("alumno") || emailLower.includes("alumno");

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row antialiased selection:bg-teal-600 selection:text-white">
            
            <div className="flex md:hidden items-center justify-between bg-[#090d16] text-white px-4 py-3 border-b border-slate-800 sticky top-0 z-40 shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-teal-900/50">
                        E
                    </div>
                    <div>
                        <h1 className="text-xs font-semibold text-white tracking-wide">Educa360</h1>
                        <p className="text-[11px] text-slate-400">Portal Clínico y Docente</p>
                    </div>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-800/80 text-teal-400 hover:bg-slate-700 transition focus:outline-none cursor-pointer"
                    aria-label="Menú de navegación"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out
                md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-30
                ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-12 -left-12 w-56 h-56 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="overflow-y-auto flex-1 relative z-10">
                    <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-transparent">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-teal-900/50">
                                E
                            </div>
                            <div>
                                <h1 className="text-xs font-semibold text-white tracking-wide">Educa360</h1>
                                <p className="text-[11px] text-slate-400">Portal Clínico y Docente</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="p-3 space-y-1">
                        <div className="px-3 py-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                Rol: {esAdminSistema ? "Administrador de Sistemas" : esAdminGeneral ? "Administrador General" : rolLabel}
                            </span>
                        </div>

                        {esAdmin && (
                            <div className="space-y-4 pt-1">
                                <div className="space-y-1">
                                    <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                                        Administración Central
                                    </span>
                                    
                                    <a
                                        href="/admin/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            pathname === "/admin/dashboard"
                                                ? "bg-teal-600/20 text-teal-300 border border-teal-500/30"
                                                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                        }`}
                                    >
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span>Registro de Logs (Admin)</span>
                                    </a>

                                    <a
                                        href="/admin-general/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            pathname === "/admin-general/dashboard"
                                                ? "bg-teal-600/20 text-teal-300 border border-teal-500/30"
                                                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                        }`}
                                    >
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Validación de Citas (General)</span>
                                    </a>

                                    <a
                                        href="/admin/disponibilidad"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            pathname === "/admin/disponibilidad"
                                                ? "bg-teal-600/20 text-teal-300 border border-teal-500/30"
                                                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                        }`}
                                    >
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Disponibilidad y Sede</span>
                                    </a>
                                </div>

                                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                                    <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                        Supervisión de Portales
                                    </span>
                                    <a href="/medico/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                                        <span>• Portal Médico (Consultas)</span>
                                    </a>
                                    <a href="/paciente/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                                        <span>• Portal Paciente (Historial)</span>
                                    </a>
                                    <a href="/editor/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                                        <span>• Gestión Documental (Editor)</span>
                                    </a>
                                    <a href="/alumno/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition">
                                        <span>• Formación Clínica (Alumno)</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {esAlumno && !esAdmin && (
                            <div className="space-y-1 pt-1">
                                <button
                                    onClick={() => setMenuAbierto(!menuAbierto)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span>Formación Clínica</span>
                                    </div>
                                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {menuAbierto && (
                                    <div className="pl-7 space-y-1 border-l border-slate-800 ml-4 my-1">
                                        <a href="/alumno/dashboard" onClick={() => setMobileMenuOpen(false)} className={`block py-2 px-3 rounded-lg text-xs transition leading-relaxed ${pathname?.includes("/alumno") ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}>
                                            • Casos Clínicos de Estudio
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {esEditor && !esAdmin && (
                            <div className="space-y-1 pt-1">
                                <button
                                    onClick={() => setMenuAbierto(!menuAbierto)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                        <span>Gestión Documental</span>
                                    </div>
                                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {menuAbierto && (
                                    <div className="pl-7 space-y-1 border-l border-slate-800 ml-4 my-1">
                                        <a 
                                            href="/editor/dashboard" 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block py-2 px-3 rounded-lg text-xs transition leading-relaxed ${pathname === "/editor/dashboard" ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                                        >
                                            • Editor de Guías y Recursos
                                        </a>
                                        <a 
                                            href="/editor/historial" 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block py-2 px-3 rounded-lg text-xs transition leading-relaxed ${pathname === "/editor/historial" ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                                        >
                                            • Historial de Publicaciones
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {rolTipo === "paciente" && !esEditor && !esAdmin && !esMedico && !esAlumno && (
                            <div className="space-y-1 pt-1">
                                <button
                                    onClick={() => setMenuAbierto(!menuAbierto)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Portal Paciente</span>
                                    </div>
                                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {menuAbierto && (
                                    <div className="pl-7 space-y-1 border-l border-slate-800 ml-4 my-1">
                                        <a href="/paciente/dashboard" onClick={() => setMobileMenuOpen(false)} className={`block py-1.5 px-3 rounded-lg text-xs transition ${pathname === "/paciente/dashboard" ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}>
                                            • Historial de Citas
                                        </a>
                                        <a href="/paciente/pedir-cita" onClick={() => setMobileMenuOpen(false)} className={`block py-1.5 px-3 rounded-lg text-xs transition ${pathname === "/paciente/pedir-cita" ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}>
                                            • Pedir Cita Médica
                                        </a>
                                        <a href="/paciente/diagnosticos" onClick={() => setMobileMenuOpen(false)} className={`block py-1.5 px-3 rounded-lg text-xs transition ${pathname === "/paciente/diagnosticos" ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}>
                                            • Ver Diagnósticos
                                        </a>
                                        <a href="/paciente/profile" onClick={() => setMobileMenuOpen(false)} className={`block py-1.5 px-3 rounded-lg text-xs transition ${pathname === "/paciente/profile" ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}>
                                            • Mi Perfil
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {esMedico && !esAdmin && (
                            <a href="/medico/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${pathname?.includes("/medico") ? "bg-teal-600/20 text-teal-300 border border-teal-500/30" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}>
                                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Portal Médico</span>
                            </a>
                        )}
                    </nav>
                </div>

                <div className="p-3 border-t border-slate-800/80 bg-[#06090f] shrink-0 relative z-10">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {usuarioNombre.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{usuarioNombre}</p>
                                <p className="text-[10px] font-mono text-slate-400 truncate">{usuarioEmail}</p>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="w-full py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold rounded-lg transition border border-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 bg-[#f8fafc] md:min-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}