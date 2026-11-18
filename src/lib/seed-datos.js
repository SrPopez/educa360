/**
 * Datos de prueba totalmente ficticios para Educa360.
 * Ejecutar solo contra emuladores locales. Ningún dato clínico es real.
 */

import { getUserUidsByEmail, USERS } from "./seed-usuarios.js";

const DOCS_EXCLUIDOS_DE_PERFIL = new Set([
    "adminsistema@educa360.test",
    "medico@educa360.test",
    "paciente@educa360.test",
    "alumno@educa360.test",
]);

function parseNombreCompleto(displayName) {
    const partes = (displayName || "").trim().split(/\s+/);
    if (partes.length <= 1) {
        return { nombre: displayName || "Usuario", apellidos: "Ficticio de Prueba" };
    }
    return { nombre: partes[0], apellidos: partes.slice(1).join(" ") };
}

function fechaNacimientoAleatoria(seed) {
    const base = new Date(1960, 0, 1);
    const dias = (seed * 997) % (55 * 365);
    base.setDate(base.getDate() + dias);
    return base.toISOString().split("T")[0];
}

const IDS = {
    sedeNorte: "seed-sede-norte",
    sedeSur: "seed-sede-sur",
    sedeCentro: "seed-sede-centro",

    servicioMedicinaGeneral: "seed-servicio-mg",
    servicioPediatria: "seed-servicio-ped",
    servicioFisioterapia: "seed-servicio-fisio",
    servicioOdontologia: "seed-servicio-odon",

    profesionalLaura: "seed-prof-laura",
    profesionalElio: "seed-prof-elio",

    pacienteMaria: "seed-paciente-maria",
    pacienteMariaJose: "seed-paciente-mariajose",
    pacienteAeroldo: "seed-paciente-aeroldo",
    pacienteSinCitas: "seed-paciente-sincitas",

    citaPendiente: "seed-cita-pendiente",
    citaConfirmada: "seed-cita-confirmada",
    citaCompletada: "seed-cita-completada",
    citaCancelada: "seed-cita-cancelada",
    citaFisioterapia: "seed-cita-fisio",
    citaOdontologia: "seed-cita-odon",

    actoBorrador1: "seed-acto-borrador-1",
    actoBorrador2: "seed-acto-borrador-2",
    actoFirmado: "seed-acto-firmado",

    solicitudAnalitica: "seed-solicitud-analitica",
    solicitudRadiografia: "seed-solicitud-rx",

    resultadoAnalitica: "seed-resultado-analitica",
    resultadoRadiografia: "seed-resultado-rx",

    casoFractura: "seed-caso-fractura",
    casoDermatitis: "seed-caso-dermatitis",

    asignacionFractura: "seed-asignacion-fractura",
    asignacionDermatitis: "seed-asignacion-dermatitis",

    contenidoBanner: "seed-contenido-banner",

    auditoriaLoginAdmin: "seed-audit-login-admin",
    auditoriaLoginPaciente: "seed-audit-login-paciente",
    auditoriaCitaCreada: "seed-audit-cita-creada",
};

const now = new Date();
const offset = (days, hours = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours, 0, 0, 0);
    return d.toISOString();
};

export const PROFESIONALES_MEDICOS = [
    {
        email: "medico@educa360.test",
        publico: {
            nombre: "Dra. Laura Martínez",
            especialidad: "Medicina General",
            sede: "Centro Sanitario Centro · Madrid",
            bio: "Especialista en atención primaria, medicina preventiva y seguimiento clínico integral de pacientes.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812341",
            telefonoPrivado: "+34600111002",
            especialidad: "Medicina General",
            sede: "Centro Sanitario Centro · Madrid",
            notasAdministrativas: "Horario de 09:00 a 13:00 y de 16:00 a 21:00. Reunión clínica los martes a las 14:00.",
        }
    },
    {
        email: "medico2@educa360.test",
        publico: {
            nombre: "Dr. Fernando José Martínez de la Torre y Gálvez",
            especialidad: "Cardiología",
            sede: "Centro Sanitario Centro · Madrid",
            bio: "Diagnóstico cardiovascular no invasivo, ecocardiografía avanzada y prevención de riesgo coronario.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812342",
            telefonoPrivado: "+34600111011",
            especialidad: "Cardiología",
            sede: "Centro Sanitario Centro · Madrid",
            notasAdministrativas: "Consultas de cardiología y pruebas de esfuerzo los lunes y jueves.",
        }
    },
    {
        email: "medico3@educa360.test",
        publico: {
            nombre: "Dra. Elena Ruiz-Sánchez",
            especialidad: "Dermatología",
            sede: "Sede Norte · Madrid",
            bio: "Dermatología clínica, detección precoz de lesiones cutáneas y tratamientos dermatológicos avanzados.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812341",
            telefonoPrivado: "+34600111002",
            especialidad: "Medicina General",
            sede: "Centro Sanitario Centro · Madrid",
            notasAdministrativas: "Horario de 09:00 a 13:00 y de 16:00 a 21:00. Reunión clínica los martes.",
        }
    },
    {
        email: "medico4@educa360.test",
        publico: {
            nombre: "Dr. Mario Gómez-Ñuñez",
            especialidad: "Pediatría",
            sede: "Sede Oeste · Madrid",
            bio: "Pediatría general, control de desarrollo infantil, vacunación y seguimiento del lactante.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812344",
            telefonoPrivado: "+34600111013",
            especialidad: "Pediatría",
            sede: "Sede Oeste · Madrid",
            notasAdministrativas: "Atención pediátrica continuada en turno de mañana.",
        }
    },
    {
        email: "medico5@educa360.test",
        publico: {
            nombre: "Dra. Isabel O'Brien",
            especialidad: "Ginecología",
            sede: "Centro Sanitario Centro · Madrid",
            bio: "Salud de la mujer, obstetricia, control gestacional y prevención ginecológica integral.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812345",
            telefonoPrivado: "+34600111014",
            especialidad: "Ginecología",
            sede: "Centro Sanitario Centro · Madrid",
            notasAdministrativas: "Coordinación de ecografía obstétrica los viernes.",
        }
    },
    {
        email: "medico6@educa360.test",
        publico: {
            nombre: "Dr. Hugo Váldez",
            especialidad: "Traumatología",
            sede: "Sede Norte · Madrid",
            bio: "Cirugía ortopédica, lesiones deportivas, artroscopia y rehabilitación traumatológica.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812346",
            telefonoPrivado: "+34600111015",
            especialidad: "Traumatología",
            sede: "Sede Norte · Madrid",
            notasAdministrativas: "Quirófano programado martes y viernes por la tarde.",
        }
    },
    {
        email: "medico7@educa360.test",
        publico: {
            nombre: "Dra. Sara Pérez-López",
            especialidad: "Oftalmología",
            sede: "Sede Oeste · Madrid",
            bio: "Salud ocular, graduación avanzada, fondo de ojo y diagnóstico de patologías de la visión.",
            disponible: true,
        },
        interno: {
            numeroColegiado: "282812347",
            telefonoPrivado: "+34600111016",
            especialidad: "Oftalmología",
            sede: "Sede Oeste · Madrid",
            notasAdministrativas: "Consulta monográfica de glaucoma los miércoles.",
        }
    }
];

export async function seedProfesionalesMedicos(services) {
    const { firestoreAdmin } = services;

    for (const prof of PROFESIONALES_MEDICOS) {
        const docId = prof.email.split("@")[0];

        await firestoreAdmin.collection("profesionales_publicos").doc(docId).set(prof.publico, { merge: true });
        await firestoreAdmin.collection("profesionales_internos").doc(docId).set(prof.interno, { merge: true });

        console.info(`[seed] Profesional sincronizado: ${prof.publico.nombre} (${prof.email})`);
    }

    console.info("[seed] Todos los perfiles profesionales (públicos e internos) han sido inyectados correctamente.");
}

export async function seedDisponibilidadProfesionales(services) {
    const { firestoreAdmin } = services;

    const disponibilidades = [
        {
            id: "disp-medico-centro",
            profesionalId: "medico",
            sedeId: IDS.sedeCentro,
            horarios: [
                {
                    dia: "Lunes",
                    franjas: [
                        { inicio: "09:00", fin: "13:00", duracionCitaMinutos: 20 },
                        { inicio: "16:00", fin: "21:00", duracionCitaMinutos: 20 }
                    ]
                },
                {
                    dia: "Martes",
                    franjas: [
                        { inicio: "09:00", fin: "13:00", duracionCitaMinutos: 20 },
                        { inicio: "16:00", fin: "21:00", duracionCitaMinutos: 20 }
                    ]
                },
                {
                    dia: "Miércoles",
                    franjas: [
                        { inicio: "09:00", fin: "13:00", duracionCitaMinutos: 20 },
                        { inicio: "16:00", fin: "21:00", duracionCitaMinutos: 20 }
                    ]
                },
                {
                    dia: "Jueves",
                    franjas: [
                        { inicio: "09:00", fin: "13:00", duracionCitaMinutos: 20 },
                        { inicio: "16:00", fin: "21:00", duracionCitaMinutos: 20 }
                    ]
                },
                {
                    dia: "Viernes",
                    franjas: [
                        { inicio: "09:00", fin: "13:00", duracionCitaMinutos: 20 }
                    ]
                }
            ]
        }
    ];

    for (const disp of disponibilidades) {
        await firestoreAdmin.collection("disponibilidad_sedes").doc(disp.id).set(disp, { merge: true });
    }
    console.info("[seed] Plantillas de disponibilidad por profesional y sede cargadas correctamente.");
}

export async function seedTestData({ authAdmin, firestoreAdmin }) {
    const services = { authAdmin, firestoreAdmin };
    const uids = await getUserUidsByEmail(authAdmin);

    const uid = (email) => {
        const value = uids[email];
        if (!value) throw new Error(`[seed] No se encontró uid para ${email}`);
        return value;
    };

    const uidAdmin = uid("adminsistema@educa360.test");
    const uidMedico = uid("medico@educa360.test");
    const uidPaciente = uid("paciente@educa360.test");
    const uidAlumno = uid("alumno@educa360.test");

    const sedes = [
        { id: IDS.sedeNorte, nombre: "Centro Sanitario Educa360 Norte", direccion: "Calle Ficticia, 123, 28001 Madrid", telefono: "+34900111001" },
        { id: IDS.sedeSur, nombre: "Centro Sanitario Educa360 Sur", direccion: "Avenida del Prado, 45, 28014 Madrid", telefono: "+34900111002" },
        { id: IDS.sedeCentro, nombre: "Centro Sanitario Educa360 Centro", direccion: "Plaza de la Constitución, 1, 28013 Madrid", telefono: "+34900111003" },
    ];
    for (const s of sedes) {
        await firestoreAdmin.collection("sedes").doc(s.id).set(s);
    }
    console.info(`[seed] ${sedes.length} sedes creadas.`);

    const servicios = [
        { id: IDS.servicioMedicinaGeneral, nombre: "Medicina General", descripcion: "Atención primaria y revisiones generales.", sedeId: IDS.sedeCentro },
        { id: IDS.servicioPediatria, nombre: "Pediatría", descripcion: "Consulta infantil y control de crecimiento.", sedeId: IDS.sedeNorte },
        { id: IDS.servicioFisioterapia, nombre: "Fisioterapia", descripcion: "Rehabilitación y tratamiento del dolor.", sedeId: IDS.sedeSur },
        { id: IDS.servicioOdontologia, nombre: "Odontología", descripcion: "Revisión dental y limpiezas.", sedeId: IDS.sedeCentro },
    ];
    for (const s of servicios) {
        await firestoreAdmin.collection("servicios").doc(s.id).set(s);
    }
    console.info(`[seed] ${servicios.length} servicios creados.`);

    await seedProfesionalesMedicos(services);
    await seedDisponibilidadProfesionales(services);

    const profesionales = [
        {
            id: IDS.profesionalLaura,
            usuario_id: uidMedico,
            nombre: "Dra. Laura Martínez",
            especialidad: "Medicina General",
            numero_colegiado: "M-12345",
            telefono: "+34600111002",
            email: "medico@educa360.test",
            sedeId: IDS.sedeCentro,
            servicioId: IDS.servicioMedicinaGeneral,
        },
        {
            id: IDS.profesionalElio,
            usuario_id: null,
            nombre: "Dr. Elio Vega-Ruiz",
            especialidad: "Fisioterapia",
            numero_colegiado: "F-98765",
            telefono: "+34600999001",
            email: "elio.vega@educa360.test",
            sedeId: IDS.sedeSur,
            servicioId: IDS.servicioFisioterapia,
        },
    ];
    for (const p of profesionales) {
        await firestoreAdmin.collection("profesionales").doc(p.id).set(p);
    }
    console.info(`[seed] ${profesionales.length} profesionales base creados.`);

    const pacientes = [
        {
            id: IDS.pacienteMaria,
            ownerId: uidPaciente,
            nombre: "María",
            apellidos: "López García",
            email: "paciente@educa360.test",
            telefono: "+34600111004",
            fecha_nacimiento: "1985-03-12",
            direccion: "Calle del Lago, 10, 28001 Madrid",
            contactoEmergencia: "Familiar Autorizado (600 111 222)",
            grupoSanguineo: "A+",
            notas: "Alergia al látex.",
        },
        {
            id: IDS.pacienteMariaJose,
            ownerId: null,
            nombre: "María José",
            apellidos: "Álvarez-Méndez Ñuñez de la Fuente-Ochoa",
            email: "mariajose.ejemplo@educa360.test",
            telefono: "+34600222002",
            fecha_nacimiento: "1990-07-23",
            direccion: "Avenida de la Constitución, 88, 28004 Madrid",
            contactoEmergencia: "Familiar Autorizado (600 111 222)",
            grupoSanguineo: "0+",
            notas: "Nombre largo con acentos y eñe para pruebas de interfaz.",
        },
        {
            id: IDS.pacienteAeroldo,
            ownerId: null,
            nombre: "Æroldo",
            apellidos: "O'Brien-Sánchez III",
            email: "aeroldo.ejemplo@educa360.test",
            telefono: "+34600333003",
            fecha_nacimiento: "1978-11-05",
            direccion: "Paseo del Príncipe, 21, 28008 Madrid",
            contactoEmergencia: "Familiar Autorizado (600 111 222)",
            grupoSanguineo: "B+",
            notas: "Apellido con apóstrofo y carácter especial (Æ).",
        },
        {
            id: IDS.pacienteSinCitas,
            ownerId: null,
            nombre: "Esteban",
            apellidos: "Nunca-Cita Roldán",
            email: "estebancita.ejemplo@educa360.test",
            telefono: "+34600444004",
            fecha_nacimiento: "1995-01-30",
            direccion: "Calle Ancha, 5, 28012 Madrid",
            contactoEmergencia: "Familiar Autorizado (600 111 222)",
            grupoSanguineo: "AB+",
            notas: "Paciente registrado sin citas previas.",
        },
    ];
    for (const p of pacientes) {
        await firestoreAdmin.collection("pacientes").doc(p.id).set(p);
    }
    console.info(`[seed] ${pacientes.length} pacientes creados.`);

    const citas = [
        {
            id: IDS.citaPendiente,
            pacienteId: IDS.pacienteMaria,
            profesionalId: IDS.profesionalLaura,
            sedeId: IDS.sedeCentro,
            servicioId: IDS.servicioMedicinaGeneral,
            fecha: offset(2, 10),
            estado: "Pendiente",
            motivo: "Revisión anual.",
        },
        {
            id: IDS.citaConfirmada,
            pacienteId: IDS.pacienteMariaJose,
            profesionalId: IDS.profesionalLaura,
            sedeId: IDS.sedeCentro,
            servicioId: IDS.servicioMedicinaGeneral,
            fecha: offset(3, 9),
            estado: "Confirmada",
            motivo: "Dolor de cabeza recurrente.",
        },
        {
            id: IDS.citaCompletada,
            pacienteId: IDS.pacienteAeroldo,
            profesionalId: IDS.profesionalLaura,
            sedeId: IDS.sedeCentro,
            servicioId: IDS.servicioMedicinaGeneral,
            fecha: offset(-2, 11),
            estado: "Completada",
            motivo: "Control de tensión arterial.",
        },
        {
            id: IDS.citaCancelada,
            pacienteId: IDS.pacienteMariaJose,
            profesionalId: IDS.profesionalLaura,
            sedeId: IDS.sedeCentro,
            servicioId: IDS.servicioMedicinaGeneral,
            fecha: offset(-1, 10),
            estado: "Cancelada",
            motivo: "Consulta cancelada por el paciente.",
        },
        {
            id: IDS.citaFisioterapia,
            pacienteId: IDS.pacienteAeroldo,
            profesionalId: IDS.profesionalElio,
            sedeId: IDS.sedeSur,
            servicioId: IDS.servicioFisioterapia,
            fecha: offset(4, 12),
            estado: "Confirmada",
            motivo: "Rehabilitación de hombro.",
        },
        {
            id: IDS.citaOdontologia,
            pacienteId: IDS.pacienteMaria,
            profesionalId: IDS.profesionalLaura,
            sedeId: IDS.sedeCentro,
            servicioId: IDS.servicioOdontologia,
            fecha: offset(5, 16),
            estado: "Pendiente",
            motivo: "Revisión dental de rutina.",
        },
    ];
    for (const c of citas) {
        await firestoreAdmin.collection("citas").doc(c.id).set(c);
    }
    console.info(`[seed] ${citas.length} citas creadas.`);

    const actos = [
        {
            id: IDS.actoBorrador1,
            professional_id: uidMedico,
            paciente_id: IDS.pacienteMaria,
            cita_id: IDS.citaCompletada,
            estado: "Borrador",
            diagnostico: "Hipertensión arterial leve.",
            tratamiento: "Dieta baja en sodio + control en 3 meses.",
            notas: "Borrador pendiente de firmar.",
        },
        {
            id: IDS.actoBorrador2,
            professional_id: uidMedico,
            paciente_id: IDS.pacienteAeroldo,
            cita_id: IDS.citaCompletada,
            estado: "Borrador",
            diagnostico: "Tendinitis de hombro derecho.",
            tratamiento: "Fisioterapia 2 veces por semana.",
            notas: "Segundo borrador de prueba.",
        },
        {
            id: IDS.actoFirmado,
            professional_id: uidMedico,
            paciente_id: IDS.pacienteMariaJose,
            cita_id: IDS.citaConfirmada,
            estado: "Firmado",
            diagnostico: "Cefalea tensional.",
            tratamiento: "Hidratación, descanso y paracetamol si es necesario.",
            notas: "Acto clínico firmado.",
        },
    ];
    for (const a of actos) {
        await firestoreAdmin.collection("actos_clinicos").doc(a.id).set(a);
    }
    console.info(`[seed] ${actos.length} actos clínicos creados.`);

    const solicitudes = [
        {
            id: IDS.solicitudAnalitica,
            pacienteId: IDS.pacienteMaria,
            profesionalId: IDS.profesionalLaura,
            tipo: "Analítica sanguínea",
            estado: "Completada",
            fecha_solicitud: offset(-3, 9),
            notas: "Control de colesterol y glucosa.",
        },
        {
            id: IDS.solicitudRadiografia,
            pacienteId: IDS.pacienteAeroldo,
            profesionalId: IDS.profesionalElio,
            tipo: "Radiografía de hombro",
            estado: "Pendiente",
            fecha_solicitud: offset(1, 10),
            notas: "Dolor post-traumático.",
        },
    ];
    for (const s of solicitudes) {
        await firestoreAdmin.collection("solicitudes_prueba").doc(s.id).set(s);
    }
    console.info(`[seed] ${solicitudes.length} solicitudes de prueba creadas.`);

    const resultados = [
        {
            id: IDS.resultadoAnalitica,
            solicitudId: IDS.solicitudAnalitica,
            pacienteId: IDS.pacienteMaria,
            tipo: "Analítica sanguínea",
            resultado: "Colesterol total: 195 mg/dL. Glucosa: 92 mg/dL. Todo dentro de rango.",
            fecha_resultado: offset(-1, 11),
            estado: "Normal",
        },
        {
            id: IDS.resultadoRadiografia,
            solicitudId: IDS.solicitudRadiografia,
            pacienteId: IDS.pacienteAeroldo,
            tipo: "Radiografía de hombro",
            resultado: "Sin fracturas. Signos de tendinitis supraespinosa.",
            fecha_resultado: offset(2, 11),
            estado: "Patológico leve",
        },
    ];
    for (const r of resultados) {
        await firestoreAdmin.collection("resultados").doc(r.id).set(r);
    }
    console.info(`[seed] ${resultados.length} resultados creados.`);

    const casos = [
        {
            id: IDS.casoFractura,
            titulo: "Caso clínico: fractura de radio distal",
            descripcion:
                "Paciente de 67 años presenta caída con mano en extensión. Se sospecha fractura de radio distal tipo Colles.",
            especialidad: "Traumatología",
            nivel_dificultad: "Intermedio",
        },
        {
            id: IDS.casoDermatitis,
            titulo: "Caso clínico: dermatitis atópica",
            descripcion:
                "Paciente pediátrico de 5 años con lesiones eczematosas en pliegues. Se pide valoración y plan de cuidados.",
            especialidad: "Dermatología",
            nivel_dificultad: "Básico",
        },
    ];
    for (const c of casos) {
        await firestoreAdmin.collection("casos_practica").doc(c.id).set(c);
    }
    console.info(`[seed] ${casos.length} casos de práctica creados.`);

    const asignaciones = [
        {
            id: IDS.asignacionFractura,
            alumno_id: uidAlumno,
            caso_id: IDS.casoFractura,
            profesor_id: uidMedico,
            fecha_asignacion: now.toISOString(),
            estado: "Pendiente",
            notas: "Resolver historia clínica y plan de tratamiento.",
        },
        {
            id: IDS.asignacionDermatitis,
            alumno_id: uidAlumno,
            caso_id: IDS.casoDermatitis,
            profesor_id: uidMedico,
            fecha_asignacion: now.toISOString(),
            estado: "En progreso",
            notas: "Incluir recomendaciones de higiene y tratamiento tópico.",
        },
    ];
    for (const a of asignaciones) {
        await firestoreAdmin.collection("asignaciones_docentes").doc(a.id).set(a);
    }
    console.info(`[seed] ${asignaciones.length} asignaciones docentes creadas.`);

    await firestoreAdmin.collection("contenido_portal").doc(IDS.contenidoBanner).set({
        titulo: "Entorno de pruebas Educa360",
        cuerpo: "Este es un entorno local con datos ficticios. Ningún dato clínico es real.",
        autor_id: uidAdmin,
        fecha_publicacion: now.toISOString(),
        activo: true,
    });
    console.info("[seed] 1 contenido del portal creado.");

    const auditoria = [
        {
            id: IDS.auditoriaLoginAdmin,
            usuario_id: uidAdmin,
            paciente_id: uidAdmin,
            tipo_entidad: "login",
            accion: "inicio_sesion",
            fecha: offset(-5, 8),
            detalles: "Inicio de sesión del administrador en entorno local.",
        },
        {
            id: IDS.auditoriaLoginPaciente,
            usuario_id: uidPaciente,
            paciente_id: uidPaciente,
            tipo_entidad: "login",
            accion: "inicio_sesion",
            fecha: offset(-4, 9),
            detalles: "Inicio de sesión del paciente de prueba.",
        },
        {
            id: IDS.auditoriaCitaCreada,
            usuario_id: uidPaciente,
            paciente_id: IDS.pacienteMaria,
            tipo_entidad: "cita",
            accion: "creacion",
            fecha: offset(-3, 10),
            detalles: "Cita creada desde el entorno local.",
        },
    ];
    for (const a of auditoria) {
        await firestoreAdmin.collection("auditoria").doc(a.id).set(a);
    }
    console.info(`[seed] ${auditoria.length} registros de auditoría creados.`);

    let perfilesCreados = 0;
    const usuariosConPerfil = USERS.filter((u) => !DOCS_EXCLUIDOS_DE_PERFIL.has(u.email));

    for (let i = 0; i < usuariosConPerfil.length; i++) {
        const u = usuariosConPerfil[i];
        const userUid = uids[u.email];
        if (!userUid) continue;

        if (u.role === "paciente") {
            const { nombre, apellidos } = parseNombreCompleto(u.name);
            await firestoreAdmin.collection("pacientes").doc(`seed-paciente-extra-${i}`).set({
                ownerId: userUid,
                nombre,
                apellidos,
                email: u.email,
                telefono: u.phone || "+34600000000",
                fecha_nacimiento: fechaNacimientoAleatoria(i),
                direccion: `Calle Ficticia de Prueba ${100 + i}, 280${(10 + (i % 90)).toString().padStart(2, "0")} Madrid`,
                contactoEmergencia: "Familiar Autorizado (600 111 222)",
                grupoSanguineo: i % 2 === 0 ? "A+" : "0+",
                notas: i === 0 ? "Paciente adicional sin citas previas." : `Nota de prueba ${i + 1}.`,
            }, { merge: true });
            perfilesCreados++;
        }
    }

    console.info(`[seed] ${perfilesCreados} perfiles extendidos adicionales creados.`);
}