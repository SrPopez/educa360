import { db, auth } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Registra un acceso en la auditoría de forma transparente desde el frontend
 * @param {string} pacienteId - ID del paciente consultado
 * @param {string} tipoEntidad - Ej: 'ACTO_CLINICO', 'RESULTADO', 'SOLICITUD_PRUEBA'
 * @param {string} entidadId - ID opcional del documento específico
 */
export async function registrarAccesoAuditoria(pacienteId, tipoEntidad, entidadId = null) {
  try {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) return;

    await addDoc(collection(db, 'auditoria'), {
      usuario_id: usuarioActual.uid,
      usuario_rol: 'PROFESIONAL',
      paciente_id: pacienteId,
      entidad_id: entidadId,
      tipo_entidad: tipoEntidad,
      fecha_hora: serverTimestamp(),
      resultado: 'EXITO'
    });
  } catch (error) {
    console.error("Error al registrar la auditoría en Firestore:", error);
  }
}