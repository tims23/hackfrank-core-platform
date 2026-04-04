import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { firestoreDb, logFirebaseFetch } from "@/lib/firebase"

export type TeamStatus = "APPLICATION_PENDING" | "ACTIVE"

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
  status?: TeamStatus
  teamCode?: string
  pendingMemberIds?: string[]
}

export type PendingTeamRecord = {
  docId: string
  name: string
  description: string
  maxMembers: number
  memberIds: string[]
  pendingMemberIds: string[]
  status: TeamStatus
  teamCode?: string
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
  status: data.status === "APPLICATION_PENDING" ? "APPLICATION_PENDING" : "ACTIVE",
  teamCode: typeof data.teamCode === "string" ? data.teamCode.trim() : undefined,
  pendingMemberIds: Array.isArray(data.pendingMemberIds)
    ? data.pendingMemberIds
        .flatMap((pendingId) => {
          if (typeof pendingId === "string") {
            const normalized = pendingId.trim()
            return normalized ? [normalized] : []
          }

          if (typeof pendingId === "number" && Number.isFinite(pendingId)) {
            return [String(pendingId)]
          }

          return []
        })
    : [],
})

const generateTeamCode = (): string =>
  Math.random().toString(36).slice(2, 8).toUpperCase()

export const createPendingTeamFromApplication = async (
  leaderId: string,
  name: string,
  description: string,
  maxMembers: number,
): Promise<{ teamCode: string }> => {
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()
  const normalizedMaxMembers = Math.max(2, Math.min(4, maxMembers))
  const teamCode = generateTeamCode()

  logFirebaseFetch("firestore:write:start", {
    collection: "teams",
    operation: "addDoc",
    leaderId,
    mode: "application-create-team",
  })

  await addDoc(collection(firestoreDb, "teams"), {
    id: Date.now(),
    name: normalizedName,
    maxMembers: normalizedMaxMembers,
    memberIds: [leaderId],
    skills: [],
    looking: true,
    case: "",
    description: normalizedDescription,
    leaderId,
    teamCode,
    status: "APPLICATION_PENDING",
    pendingMemberIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  logFirebaseFetch("firestore:write:success", {
    collection: "teams",
    operation: "addDoc",
    leaderId,
    mode: "application-create-team",
  })

  return { teamCode }
}

export const joinPendingTeamByCode = async (teamCode: string, applicantId: string): Promise<boolean> => {
  const normalizedTeamCode = teamCode.trim().toUpperCase()
  const normalizedApplicantId = applicantId.trim()

  if (!normalizedTeamCode || !normalizedApplicantId) {
    return false
  }

  logFirebaseFetch("getDocs:start", {
    collection: "teams",
    teamCode: normalizedTeamCode,
    mode: "application-join-team",
  })

  const teamsQuery = query(
    collection(firestoreDb, "teams"),
    where("teamCode", "==", normalizedTeamCode),
    where("status", "==", "APPLICATION_PENDING"),
  )

  const teamsSnapshot = await getDocs(teamsQuery)

  logFirebaseFetch("getDocs:success", {
    collection: "teams",
    teamCode: normalizedTeamCode,
    size: teamsSnapshot.size,
    mode: "application-join-team",
  })

  const matchedTeamDoc = teamsSnapshot.docs[0]
  if (!matchedTeamDoc) {
    return false
  }

  logFirebaseFetch("firestore:write:start", {
    collection: "teams",
    operation: "updateDoc",
    id: matchedTeamDoc.id,
    mode: "application-join-team",
  })

  await updateDoc(matchedTeamDoc.ref, {
    pendingMemberIds: arrayUnion(normalizedApplicantId),
    updatedAt: serverTimestamp(),
  })

  logFirebaseFetch("firestore:write:success", {
    collection: "teams",
    operation: "updateDoc",
    id: matchedTeamDoc.id,
    mode: "application-join-team",
  })

  return true
}

export const subscribeToPendingTeamByCode = (
  teamCode: string,
  onTeamUpdate: (team: PendingTeamRecord | null) => void,
  onError?: (error: Error) => void,
) => {
  const normalizedTeamCode = teamCode.trim().toUpperCase()

  logFirebaseFetch("onSnapshot:subscribe", {
    collection: "teams",
    teamCode: normalizedTeamCode,
    mode: "application-pending-team",
  })

  const teamsQuery = query(
    collection(firestoreDb, "teams"),
    where("teamCode", "==", normalizedTeamCode),
    where("status", "==", "APPLICATION_PENDING"),
  )

  return onSnapshot(
    teamsQuery,
    (snapshot) => {
      const matchedTeamDoc = snapshot.docs[0]

      logFirebaseFetch("onSnapshot:update", {
        collection: "teams",
        teamCode: normalizedTeamCode,
        size: snapshot.size,
        fromCache: snapshot.metadata.fromCache,
        mode: "application-pending-team",
      })

      if (!matchedTeamDoc) {
        onTeamUpdate(null)
        return
      }

      const data = matchedTeamDoc.data() as Omit<TeamRecord, "id"> & { id?: number }
      const normalizedTeam = normalizeTeam(matchedTeamDoc.id, data)

      onTeamUpdate({
        docId: matchedTeamDoc.id,
        name: normalizedTeam.name,
        description: normalizedTeam.description,
        maxMembers: normalizedTeam.maxMembers,
        memberIds: normalizedTeam.memberIds,
        pendingMemberIds: normalizedTeam.pendingMemberIds ?? [],
        status: normalizedTeam.status ?? "APPLICATION_PENDING",
        teamCode: normalizedTeam.teamCode,
        leaderId: normalizedTeam.leaderId,
      })
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "teams",
        teamCode: normalizedTeamCode,
        mode: "application-pending-team",
        message: snapshotError.message,
      })

      if (onError) {
        onError(snapshotError)
      }
    },
  )
}

export const approvePendingMember = async (teamDocId: string, pendingMemberId: string) => {
  const normalizedPendingMemberId = pendingMemberId.trim()

  logFirebaseFetch("firestore:write:start", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "approve-pending-member",
    pendingMemberId: normalizedPendingMemberId,
  })

  await updateDoc(doc(firestoreDb, "teams", teamDocId), {
    pendingMemberIds: arrayRemove(normalizedPendingMemberId),
    memberIds: arrayUnion(normalizedPendingMemberId),
    updatedAt: serverTimestamp(),
  })

  logFirebaseFetch("firestore:write:success", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "approve-pending-member",
    pendingMemberId: normalizedPendingMemberId,
  })
}

export const declinePendingMember = async (teamDocId: string, pendingMemberId: string) => {
  const normalizedPendingMemberId = pendingMemberId.trim()

  logFirebaseFetch("firestore:write:start", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "decline-pending-member",
    pendingMemberId: normalizedPendingMemberId,
  })

  await updateDoc(doc(firestoreDb, "teams", teamDocId), {
    pendingMemberIds: arrayRemove(normalizedPendingMemberId),
    updatedAt: serverTimestamp(),
  })

  logFirebaseFetch("firestore:write:success", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "decline-pending-member",
    pendingMemberId: normalizedPendingMemberId,
  })
}

export const leavePendingTeam = async (teamDocId: string, memberId: string) => {
  const normalizedMemberId = memberId.trim()

  logFirebaseFetch("firestore:write:start", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "leave-pending-team",
    memberId: normalizedMemberId,
  })

  await updateDoc(doc(firestoreDb, "teams", teamDocId), {
    memberIds: arrayRemove(normalizedMemberId),
    pendingMemberIds: arrayRemove(normalizedMemberId),
    updatedAt: serverTimestamp(),
  })

  logFirebaseFetch("firestore:write:success", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "leave-pending-team",
    memberId: normalizedMemberId,
  })
}

export const kickPendingTeamMember = async (teamDocId: string, memberId: string) => {
  const normalizedMemberId = memberId.trim()

  logFirebaseFetch("firestore:write:start", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "kick-team-member",
    memberId: normalizedMemberId,
  })

  await updateDoc(doc(firestoreDb, "teams", teamDocId), {
    memberIds: arrayRemove(normalizedMemberId),
    pendingMemberIds: arrayRemove(normalizedMemberId),
    updatedAt: serverTimestamp(),
  })

  logFirebaseFetch("firestore:write:success", {
    collection: "teams",
    operation: "updateDoc",
    id: teamDocId,
    mode: "kick-team-member",
    memberId: normalizedMemberId,
  })
}

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
