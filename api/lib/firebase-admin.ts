import admin from "firebase-admin"

function getFirebaseAdminOptions(): admin.AppOptions {
  const rawConfig = process.env.FIREBASE_CONFIG

  if (!rawConfig) {
    // No explicit config provided: fall back to ADC (e.g. Vercel/GCP runtime identity).
    return {}
  }

  try {
    const parsed = JSON.parse(rawConfig) as {
      project_id?: string
      client_email?: string
      private_key?: string
    }

    if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
      throw new Error(
        "FIREBASE_CONFIG is missing one or more required fields: project_id, client_email, private_key",
      )
    }

    const serviceAccount: admin.ServiceAccount = {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      // Allow .env values to store literal \n characters.
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    }

    return {
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Invalid FIREBASE_CONFIG. Expected a JSON stringified Firebase service account object. Details: ${message}`,
    )
  }
}

// Initialize Firebase Admin SDK if not already initialized.
if (!admin.apps.length) {
  admin.initializeApp(getFirebaseAdminOptions())
}

export const db = admin.firestore()
export const auth = admin.auth()

// Type helpers
export type FirestoreWriteResult = admin.firestore.WriteResult
export type FirestoreDocumentSnapshot = admin.firestore.DocumentSnapshot
export type FirestoreQuerySnapshot = admin.firestore.QuerySnapshot
