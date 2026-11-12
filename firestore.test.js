const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const fs = require("fs");

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "educa360-dev",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Pruebas Completas de Reglas de Seguridad - educa360", () => {
  
  describe("Colección /actos_clinicos", () => {
    
    it("DEBE PERMITIR a un profesional crear un acto clínico", async () => {
      const db = testEnv.authenticatedContext("profesional_1", { rol: "profesional" }).firestore();
      await assertSucceeds(
        db.collection("actos_clinicos").add({
          professional_id: "profesional_1",
          paciente_id: "paciente_1",
          estado: "Borrador"
        })
      );
    });

    it("DEBE DENEGAR a un paciente crear un acto clínico", async () => {
      const db = testEnv.authenticatedContext("paciente_1", { rol: "paciente" }).firestore();
      await assertFails(
        db.collection("actos_clinicos").add({
          professional_id: "paciente_1",
          paciente_id: "paciente_1",
          estado: "Borrador"
        })
      );
    });

    it("DEBE PERMITIR acceso directo por ID a un profesional para leer un acto clínico", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc("actos_clinicos/acto_123").set({
          professional_id: "profesional_1",
          paciente_id: "paciente_1",
          estado: "Borrador"
        });
      });

      const dbProf = testEnv.authenticatedContext("profesional_2", { rol: "profesional" }).firestore();
      await assertSucceeds(dbProf.doc("actos_clinicos/acto_123").get());
    });

  });

  describe("Colección /contenido_portal", () => {

    it("DEBE PERMITIR al editor de contenidos escribir en el portal", async () => {
      const db = testEnv.authenticatedContext("editor_1", { rol: "editor" }).firestore();
      await assertSucceeds(db.doc("contenido_portal/aviso_1").set({ titulo: "Nuevo comunicado" }));
    });

    it("DEBE PERMITIR al administrador escribir en el contenido del portal", async () => {
      const db = testEnv.authenticatedContext("admin_1", { rol: "admin" }).firestore();
      await assertSucceeds(db.doc("contenido_portal/aviso_2").set({ titulo: "Aviso admin" }));
    });

    it("DEBE DENEGAR a un profesional escribir en el contenido del portal", async () => {
      const db = testEnv.authenticatedContext("profesional_1", { rol: "profesional" }).firestore();
      await assertFails(db.doc("contenido_portal/aviso_3").set({ titulo: "Intento no autorizado" }));
    });

  });

  describe("Colección /auditoria", () => {

    it("DEBE PERMITIR al paciente leer su propio registro de auditoría", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc("auditoria/log_1").set({
          paciente_id: "paciente_1",
          usuario_id: "paciente_1",
          tipo_entidad: "ACTO_CLINICO"
        });
      });

      const dbPaciente = testEnv.authenticatedContext("paciente_1", { rol: "paciente" }).firestore();
      await assertSucceeds(dbPaciente.doc("auditoria/log_1").get());
    });

    it("DEBE DENEGAR al paciente leer el registro de auditoría de otro usuario", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc("auditoria/log_2").set({
          paciente_id: "paciente_ajeno",
          usuario_id: "paciente_ajeno",
          tipo_entidad: "ACTO_CLINICO"
        });
      });

      const dbPaciente = testEnv.authenticatedContext("paciente_1", { rol: "paciente" }).firestore();
      await assertFails(dbPaciente.doc("auditoria/log_2").get());
    });

    it("DEBE DENEGAR la modificación o borrado de auditoría (Inmutabilidad estricta)", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc("auditoria/log_1").set({
          paciente_id: "paciente_1",
          usuario_id: "paciente_1"
        });
      });

      const dbAdmin = testEnv.authenticatedContext("admin_1", { rol: "admin" }).firestore();
      
      await assertFails(dbAdmin.doc("auditoria/log_1").update({ tipo_entidad: "MODIFICADO" }));
      
      await assertFails(dbAdmin.doc("auditoria/log_1").delete());
    });

  });

});