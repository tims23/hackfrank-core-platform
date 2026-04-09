import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import {
  createApplicant,
  submitApplicantForm,
  syncApplicantDraft,
  type ApplicantFormInput,
} from "@/lib/applicants"
import { subscribeToParticipantAccess } from "@/lib/participants"
import { firebaseAuth, logFirebaseFetch, resetFirestoreLocalCache } from "@/lib/firebase"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  hasParticipantAccess: boolean
  isParticipantLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  apply: (email: string, password: string) => Promise<boolean>
  syncApplicationDraft: (application: Partial<ApplicantFormInput>) => Promise<boolean>
  submitApplication: (application: ApplicantFormInput) => Promise<boolean>
  logout: () => Promise<void>
}

interface User {
  id: string
  uid: string
  name: string
  email: string
  avatar: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  uid: firebaseUser.uid,
  name: firebaseUser.displayName || firebaseUser.email || "User",
  email: firebaseUser.email || "",
  avatar:
    firebaseUser.photoURL ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [hasParticipantAccess, setHasParticipantAccess] = useState(false)
  const [isParticipantLoading, setIsParticipantLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setHasParticipantAccess(false)

      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser))
        setIsAuthenticated(true)
        setIsParticipantLoading(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsParticipantLoading(false)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setHasParticipantAccess(false)
      setIsParticipantLoading(false)
      return
    }

    setIsParticipantLoading(true)

    const unsubscribe = subscribeToParticipantAccess(
      user.uid,
      (hasAccess) => {
        setHasParticipantAccess(hasAccess)
        setIsParticipantLoading(false)
      },
      () => {
        setHasParticipantAccess(false)
        setIsParticipantLoading(false)
      },
    )

    return () => unsubscribe()
  }, [isAuthenticated, user])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      return true
    } catch {
      setIsLoading(false)
      return false
    }
  }

  const apply = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    let createdUser: FirebaseUser | null = null

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      createdUser = credential.user

      await createApplicant(credential.user.uid)

      return true
    } catch (error) {
      logFirebaseFetch("firestore:write:error", {
        collection: "participants/details",
        operation: "setDoc",
        message: error instanceof Error ? error.message : String(error),
      })

      if (createdUser) {
        try {
          await deleteUser(createdUser)
        } catch (cleanupError) {
          logFirebaseFetch("auth:cleanup:delete-user-error", {
            message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          })
        }
      }

      setIsLoading(false)
      return false
    }
  }

  const submitApplication = async (application: ApplicantFormInput): Promise<boolean> => {
    const activeUser = firebaseAuth.currentUser
    if (!activeUser) {
      return false
    }

    try {
      await submitApplicantForm(activeUser.uid, application)

      const displayName = `${application.prename.trim()} ${application.surname.trim()}`.trim()
      await updateProfile(activeUser, {
        displayName,
      })

      return true
    } catch (error) {
      logFirebaseFetch("firestore:write:error", {
        collection: "participants/details",
        operation: "setDoc",
        message: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  }

  const syncApplicationDraft = async (application: Partial<ApplicantFormInput>): Promise<boolean> => {
    const activeUser = firebaseAuth.currentUser
    if (!activeUser) {
      return false
    }

    try {
      await syncApplicantDraft(activeUser.uid, application)
      return true
    } catch (error) {
      logFirebaseFetch("firestore:write:error", {
        collection: "participants/details",
        operation: "setDoc",
        mode: "draft-sync",
        message: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(firebaseAuth)
    } finally {
      await resetFirestoreLocalCache()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        hasParticipantAccess,
        isParticipantLoading,
        login,
        apply,
        syncApplicationDraft,
        submitApplication,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

