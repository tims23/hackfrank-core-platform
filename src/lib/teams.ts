import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { firestoreDb, logFirebaseFetch } from "@/lib/firebase"
import { apiCall } from "@/lib/api"

export type TeamStatus = "INITIAL" | "APPLICATION_SUBMITTED"
export const TEAM_MAX_MEMBERS = 4

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
}

export type PendingTeamRecord = {
  docId: string
  name: string
  description: string
  maxMembers: number
  memberIds: string[]
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
  maxMembers: TEAM_MAX_MEMBERS,
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
  status: data.status === "INITIAL" ? "INITIAL" : "APPLICATION_SUBMITTED",
  teamCode: typeof data.teamCode === "string" ? data.teamCode.trim() : undefined,
})

export const createPendingTeamFromApplication = async (
  leaderId: string,
  name: string,
  description: string,
): Promise<{ teamCode: string }> => {
  logFirebaseFetch("api:write:start", {
    endpoint: "/api/teams",
    action: "create",
    leaderId,
  })

  try {
    const result = await apiCall<{ teamCode: string }>("/api/teams", "create", {
      name,
      description,
    })

    logFirebaseFetch("api:write:success", {
      endpoint: "/api/teams",
      action: "create",
      leaderId,
    })

    return result
  } catch (error) {
    logFirebaseFetch("api:write:error", {
      endpoint: "/api/teams",
      action: "create",
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export const joinPendingTeamByCode = async (teamCode: string, applicantId: string): Promise<boolean> => {
  const normalizedTeamCode = teamCode.trim().toUpperCase()

  logFirebaseFetch("api:write:start", {
    endpoint: "/api/teams",
    action: "join",
    teamCode: normalizedTeamCode,
    applicantId,
  })

  try {
    const result = await apiCall<{ joined: boolean }>("/api/teams", "join", {
      teamCode: normalizedTeamCode,
    })

    logFirebaseFetch("api:write:success", {
      endpoint: "/api/teams",
      action: "join",
      teamCode: normalizedTeamCode,
      applicantId,
    })

    return result.joined
  } catch (error) {
    logFirebaseFetch("api:write:error", {
      endpoint: "/api/teams",
      action: "join",
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
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
    mode: "application-team",
  })

  const teamsQuery = query(
    collection(firestoreDb, "teams"),
    where("teamCode", "==", normalizedTeamCode),
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
        mode: "application-team",
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
        status: normalizedTeam.status ?? "INITIAL",
        teamCode: normalizedTeam.teamCode,
        leaderId: normalizedTeam.leaderId,
      })
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "teams",
        teamCode: normalizedTeamCode,
        mode: "application-team",
        message: snapshotError.message,
      })

      if (onError) {
        onError(snapshotError)
      }
    },
  )
}

export const leavePendingTeam = async (teamDocId: string, memberId: string) => {
  logFirebaseFetch("api:write:start", {
    endpoint: "/api/teams",
    action: "leave",
    teamDocId,
    memberId,
  })

  try {
    await apiCall<{ success: boolean }>("/api/teams", "leave", {
      teamDocId,
    })

    logFirebaseFetch("api:write:success", {
      endpoint: "/api/teams",
      action: "leave",
      teamDocId,
      memberId,
    })
  } catch (error) {
    logFirebaseFetch("api:write:error", {
      endpoint: "/api/teams",
      action: "leave",
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export const kickPendingTeamMember = async (teamDocId: string, memberId: string) => {
  logFirebaseFetch("api:write:start", {
    endpoint: "/api/teams",
    action: "kick",
    teamDocId,
  })

  try {
    await apiCall<{ success: boolean }>("/api/teams", "kick", {
      teamDocId,
      memberId,
    })

    logFirebaseFetch("api:write:success", {
      endpoint: "/api/teams",
      action: "kick",
      teamDocId,
    })
  } catch (error) {
    logFirebaseFetch("api:write:error", {
      endpoint: "/api/teams",
      action: "kick",
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export const submitPendingTeamApplication = async (teamDocId: string) => {
  logFirebaseFetch("api:write:start", {
    endpoint: "/api/teams",
    action: "submit-application",
    teamDocId,
  })

  try {
    await apiCall<{ success: boolean }>("/api/teams", "submit-application", {
      teamDocId,
    })

    logFirebaseFetch("api:write:success", {
      endpoint: "/api/teams",
      action: "submit-application",
      teamDocId,
    })
  } catch (error) {
    logFirebaseFetch("api:write:error", {
      endpoint: "/api/teams",
      action: "submit-application",
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
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
