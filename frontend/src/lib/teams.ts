import { collection, onSnapshot } from "firebase/firestore"
import { firestoreDb, logFirebaseFetch } from "@/lib/firebase"

export type TeamRecord = {
  id: number
  name: string
  maxMembers: number
  memberIds: string[]
  skills: string[]
  looking: boolean
  case: string
  description: string
  leaderId?: string | null
}

const sortTeams = (teams: TeamRecord[]) =>
  [...teams].sort((firstTeam, secondTeam) => firstTeam.id - secondTeam.id)

const parseTeamId = (documentId: string, explicitId?: number): number => {
  if (typeof explicitId === "number" && Number.isFinite(explicitId)) {
    return explicitId
  }

  const parsedId = Number(documentId)
  return Number.isFinite(parsedId) ? parsedId : 0
}

const normalizeTeam = (
  documentId: string,
  data: Omit<TeamRecord, "id"> & { id?: number },
): TeamRecord => ({
  ...data,
  id: parseTeamId(documentId, data.id),
  memberIds: Array.isArray(data.memberIds)
    ? data.memberIds
        .flatMap((memberId) => {
          if (typeof memberId === "string") {
            const normalized = memberId.trim()
            return normalized ? [normalized] : []
          }

          if (typeof memberId === "number" && Number.isFinite(memberId)) {
            return [String(memberId)]
          }

          return []
        })
    : [],
  leaderId:
    typeof data.leaderId === "string"
      ? data.leaderId.trim() || null
      : typeof data.leaderId === "number" && Number.isFinite(data.leaderId)
        ? String(data.leaderId)
        : null,
})

export const subscribeToTeams = (
  onTeamsUpdate: (teams: TeamRecord[]) => void,
  onError?: (error: Error) => void,
) => {
  logFirebaseFetch("onSnapshot:subscribe", {
    collection: "teams",
  })

  return onSnapshot(
    collection(firestoreDb, "teams"),
    (snapshot) => {
      const docChanges = snapshot.docChanges()

      logFirebaseFetch("onSnapshot:update", {
        collection: "teams",
        size: snapshot.size,
        changeCount: docChanges.length,
        changes: docChanges.map((change) => ({
          type: change.type,
          id: change.doc.id,
        })),
        fromCache: snapshot.metadata.fromCache,
      })

      const teams = sortTeams(
        snapshot.docs.map((teamDoc) => {
          const data = teamDoc.data() as Omit<TeamRecord, "id"> & { id?: number }
          return normalizeTeam(teamDoc.id, data)
        }),
      )

      onTeamsUpdate(teams)
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "teams",
        message: snapshotError.message,
      })

      if (onError) {
        onError(snapshotError)
      }
    },
  )
}
