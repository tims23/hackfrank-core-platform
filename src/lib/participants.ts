import { collection, doc, onSnapshot } from "firebase/firestore"
import { firestoreDb, logFirebaseFetch } from "@/lib/firebase"

export type Participant = {
  id: string
  status?: string
   // TODO: Make `status` mandatory in Participant once the database schema is migrated.
  name: string
  avatar: string
  role: string
  skills: string[]
  bio?: string
  lookingForTeam: boolean
  team: number | null
  affiliation: {
    type: "company" | "university"
    name: string
  }
}

const sortParticipants = (participants: Participant[]) =>
  [...participants].sort((firstParticipant, secondParticipant) =>
    firstParticipant.id.localeCompare(secondParticipant.id, undefined, { numeric: true }),
  )

const parseParticipantId = (documentId: string, explicitId?: unknown): string => {
  if (typeof explicitId === "string") {
    const normalized = explicitId.trim()
    if (normalized.length > 0) {
      return normalized
    }
  }

  if (typeof explicitId === "number" && Number.isFinite(explicitId)) {
    return String(explicitId)
  }

  const normalizedDocumentId = documentId.trim()
  return normalizedDocumentId.length > 0 ? normalizedDocumentId : "unknown"
}

const parseParticipantTeam = (explicitTeamId?: unknown): number | null => {
  if (typeof explicitTeamId === "number" && Number.isFinite(explicitTeamId)) {
    return explicitTeamId
  }

  return null
}

const parseParticipantStatus = (value: unknown): string => {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

const normalizeParticipant = (
  documentId: string,
  data: Omit<Participant, "id"> & { id?: unknown },
): Participant => ({
  ...data,
  id: parseParticipantId(documentId, data.id),
  team: parseParticipantTeam(data.team),
})

export const subscribeToParticipants = (
  onParticipantsUpdate: (participants: Participant[]) => void,
  onError?: (error: Error) => void,
) => {
  logFirebaseFetch("onSnapshot:subscribe", {
    collection: "participants",
  })

  return onSnapshot(
    collection(firestoreDb, "participants"),
    (snapshot) => {
      const docChanges = snapshot.docChanges()

      logFirebaseFetch("onSnapshot:update", {
        collection: "participants",
        size: snapshot.size,
        changeCount: docChanges.length,
        changes: docChanges.map((change) => ({
          type: change.type,
          id: change.doc.id,
        })),
        fromCache: snapshot.metadata.fromCache,
      })

      const participants = sortParticipants(
        snapshot.docs.map((participantDoc) => {
          const data = participantDoc.data() as Omit<Participant, "id"> & { id?: unknown }
          return normalizeParticipant(participantDoc.id, data)
        }),
      )

      onParticipantsUpdate(participants)
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "participants",
        message: snapshotError.message,
      })

      if (onError) {
        onError(snapshotError)
      }
    },
  )
}

export const subscribeToParticipantAccess = (
  uid: string,
  onAccessUpdate: (hasParticipantAccess: boolean) => void,
  onError?: (error: Error) => void,
) => {
  const normalizedUid = uid.trim()
  const participantAccessDocRef = doc(firestoreDb, "participants", normalizedUid)

  logFirebaseFetch("onSnapshot:subscribe", {
    collection: "participants",
    targetUid: normalizedUid,
    mode: "participant-access",
  })

  return onSnapshot(
    participantAccessDocRef,
    (snapshot) => {
      if (snapshot.metadata.fromCache) {
        logFirebaseFetch("onSnapshot:update", {
          collection: "participants",
          targetUid: normalizedUid,
          mode: "participant-access",
          exists: snapshot.exists(),
          hasParticipantAccess: false,
          fromCache: true,
          cachePolicy: "deny",
        })

        onAccessUpdate(false)
        return
      }
      const matchedParticipantData = snapshot.data() as
        | { id?: unknown; status?: unknown }
        | undefined
      const participantUid = snapshot.id
      const participantStatus = parseParticipantStatus(matchedParticipantData?.status)
      const hasParticipantAccess = participantUid === normalizedUid && participantStatus === "APPROVED"

      logFirebaseFetch("onSnapshot:update", {
        collection: "participants",
        targetUid: normalizedUid,
        mode: "participant-access",
        exists: snapshot.exists(),
        matchedParticipantDocId: snapshot.id,
        participantStatus,
        hasParticipantAccess,
        fromCache: snapshot.metadata.fromCache,
      })

      onAccessUpdate(hasParticipantAccess)
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "participants",
        targetUid: normalizedUid,
        mode: "participant-access",
        message: snapshotError.message,
      })

      if (onError) {
        onError(snapshotError)
      }
    },
  )
}
