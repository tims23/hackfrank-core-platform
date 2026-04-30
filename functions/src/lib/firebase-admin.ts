import { initializeApp, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Cloud Functions automatically provides credentials via ADC.
// No manual FIREBASE_CONFIG parsing needed.
if (getApps().length === 0) {
  initializeApp()
}

export const db = getFirestore()
export const auth = getAuth()
