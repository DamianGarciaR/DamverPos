import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Crea una nueva empresa y un usuario administrador inicial.
 */
export const createCompanyAndAdmin = functions.https.onCall(async (data, context) => {
  const { companyName, userEmail, userPassword } = data;

  // 1. Crear la empresa en Firestore
  const companyRef = await admin.firestore().collection("companies").add({
    name: companyName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const companyId = companyRef.id;

  // 2. Crear el usuario en Firebase Auth
  const userRecord = await admin.auth().createUser({
    email: userEmail,
    password: userPassword,
    displayName: `Admin de ${companyName}`,
  });

  // 3. Asignar roles y empresa al usuario (Custom Claims)
  await admin.auth().setCustomUserClaims(userRecord.uid, {
    companyId: companyId,
    role: "admin",
  });

  // 4. Guardar información del usuario en Firestore
  await admin.firestore().collection("users").doc(userRecord.uid).set({
    email: userEmail,
    companyId: companyId,
    role: "admin",
    status: "active",
  });

  return { status: "success", userId: userRecord.uid, companyId: companyId };
});

/**
 * Crea un nuevo usuario (vendedor o supervisor) dentro de la misma empresa.
 * Solo un administrador puede llamar a esta función.
 */
export const createNewUser = functions.https.onCall(async (data, context) => {
  // 1. Verificar que quien llama es un administrador
  if (context.auth?.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Solo los administradores pueden crear nuevos usuarios."
    );
  }

  const { userEmail, userPassword, role, pointOfSaleId } = data;
  const companyId = context.auth.token.companyId;

  // 2. Crear el usuario en Firebase Auth
  const userRecord = await admin.auth().createUser({
    email: userEmail,
    password: userPassword,
    displayName: `${role} - ${companyId}`,
  });

  // 3. Asignar roles, empresa y punto de venta al usuario
  await admin.auth().setCustomUserClaims(userRecord.uid, {
    companyId: companyId,
    role: role, // "seller" o "supervisor"
    pointOfSaleId: pointOfSaleId, // ID del punto de venta asignado
  });

  // 4. Guardar información del usuario en Firestore
  await admin.firestore().collection("users").doc(userRecord.uid).set({
    email: userEmail,
    companyId: companyId,
    role: role,
    pointOfSaleId: pointOfSaleId,
    status: "active",
  });

  return { status: "success", userId: userRecord.uid };
});
