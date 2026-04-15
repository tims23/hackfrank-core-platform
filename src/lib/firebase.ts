import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import {
  clearIndexedDbPersistence,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDiUqm6AfvO43-1F6XSxffWprcj7jSJL1A',
  authDomain: 'hf-participant-plattform.firebaseapp.com',
  projectId: 'hf-participant-plattform',
  storageBucket: 'hf-participant-plattform.firebasestorage.app',
  messagingSenderId: '266719910548',
  appId: '1:266719910548:web:bcecaca13b66356c0af281',
  measurementId: 'G-27W9W16Y0S',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const firebaseStorage = getStorage(firebaseApp)

const firebaseDebugLogsEnabled =
  import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG_LOGS === 'true'

export const logFirebaseFetch = (event: string, details?: Record<string, unknown>) => {
  if (!firebaseDebugLogsEnabled) {
    return
  }

  const timestamp = new Date().toISOString()
  if (details) {
    console.info(`[Firebase Debug] ${timestamp} ${event}`, details)
    return
  }

  console.info(`[Firebase Debug] ${timestamp} ${event}`)
}

const createFirestoreDb = () => {
  try {
    const database = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })

    logFirebaseFetch('firestore:init:persistent-cache-enabled')
    return database
  } catch (error) {
    logFirebaseFetch('firestore:init:fallback-default-cache', {
      reason: error instanceof Error ? error.message : String(error),
    })

    return getFirestore(firebaseApp)
  }
}

export const firestoreDb = createFirestoreDb()

export const resetFirestoreLocalCache = async () => {
  logFirebaseFetch('firestore:cache-reset:start')

  try {
    await terminate(firestoreDb)
    logFirebaseFetch('firestore:cache-reset:terminated')

    await clearIndexedDbPersistence(firestoreDb)
    logFirebaseFetch('firestore:cache-reset:cleared')
  } catch (error) {
    logFirebaseFetch('firestore:cache-reset:failed', {
      reason: error instanceof Error ? error.message : String(error),
    })
  }

  // Reload to ensure a fresh Firestore instance is created after cache reset.
  if (typeof window !== 'undefined') {
    window.location.assign('/login')
  }
}

export const analyticsPromise = isSupported().then((supported) => {
  if (!supported) {
    return null
  }

  return getAnalytics(firebaseApp)
})
