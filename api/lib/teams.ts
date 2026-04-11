import { db } from "./firebase-admin.ts"
import { FieldValue } from "firebase-admin/firestore"

export type TeamStatus = "INITIAL" | "APPLICATION_SUBMITTED"

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

const generateTeamCode = (): string => Math.random().toString(36).slice(2, 8).toUpperCase()

export class SubmittedApplicationLeaveError extends Error {
  constructor() {
    super("Submitted team members cannot leave the team")
    this.name = "SubmittedApplicationLeaveError"
  }
}

export class SubmittedTeamMutationError extends Error {
  constructor() {
    super("Team membership cannot be changed after team application submission")
    this.name = "SubmittedTeamMutationError"
  }
}

export async function createPendingTeamFromApplication(
  leaderId: string,
  name: string,
  description: string,
  maxMembers: number,
): Promise<{ teamCode: string }> {
  console.log("[api/lib/teams] createPendingTeamFromApplication start", {
    leaderId,
    requestedMaxMembers: maxMembers,
  })

  const normalizedName = name.trim()
  const normalizedDescription = description.trim()
  const normalizedMaxMembers = Math.max(2, Math.min(4, maxMembers))
  const teamCode = generateTeamCode()

  await db.collection("teams").add({
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
    status: "INITIAL",
    pendingMemberIds: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/teams] createPendingTeamFromApplication complete", {
    leaderId,
    teamCode,
    normalizedMaxMembers,
  })

  return { teamCode }
}

export async function joinPendingTeamByCode(
  teamCode: string,
  applicantId: string,
): Promise<boolean> {
  console.log("[api/lib/teams] joinPendingTeamByCode start", {
    applicantId,
    teamCode,
  })

  const normalizedTeamCode = teamCode.trim().toUpperCase()
  const normalizedApplicantId = applicantId.trim()

  if (!normalizedTeamCode || !normalizedApplicantId) {
    console.warn("[api/lib/teams] joinPendingTeamByCode rejected invalid input", {
      applicantId,
      teamCode,
    })
    return false
  }

  const teamsSnapshot = await db
    .collection("teams")
    .where("teamCode", "==", normalizedTeamCode)
    .where("status", "==", "INITIAL")
    .limit(1)
    .get()

  const matchedTeamDoc = teamsSnapshot.docs[0]
  if (!matchedTeamDoc) {
    console.log("[api/lib/teams] joinPendingTeamByCode no matching team", {
      applicantId: normalizedApplicantId,
      teamCode: normalizedTeamCode,
    })
    return false
  }

  await matchedTeamDoc.ref.update({
    pendingMemberIds: FieldValue.arrayUnion(normalizedApplicantId),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/teams] joinPendingTeamByCode complete", {
    applicantId: normalizedApplicantId,
    teamCode: normalizedTeamCode,
    teamDocId: matchedTeamDoc.id,
  })

  return true
}

export async function approvePendingMember(
  teamDocId: string,
  pendingMemberId: string,
): Promise<void> {
  console.log("[api/lib/teams] approvePendingMember start", { teamDocId, pendingMemberId })

  const normalizedPendingMemberId = pendingMemberId.trim()

  await db.collection("teams").doc(teamDocId).update({
    pendingMemberIds: FieldValue.arrayRemove(normalizedPendingMemberId),
    memberIds: FieldValue.arrayUnion(normalizedPendingMemberId),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/teams] approvePendingMember complete", {
    teamDocId,
    pendingMemberId: normalizedPendingMemberId,
  })
}

export async function declinePendingMember(
  teamDocId: string,
  pendingMemberId: string,
): Promise<void> {
  console.log("[api/lib/teams] declinePendingMember start", { teamDocId, pendingMemberId })

  const normalizedPendingMemberId = pendingMemberId.trim()

  await Promise.all([
    db.collection("teams").doc(teamDocId).update({
      pendingMemberIds: FieldValue.arrayRemove(normalizedPendingMemberId),
      updatedAt: FieldValue.serverTimestamp(),
    }),
    db
      .collection("participants")
      .doc(normalizedPendingMemberId)
      .collection("details")
      .doc("application")
      .set(
        {
          status: "started",
          teamCode: "",
          teamSelectionMode: "join",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
  ])

  console.log("[api/lib/teams] declinePendingMember complete", {
    teamDocId,
    pendingMemberId: normalizedPendingMemberId,
    applicationStatus: "started",
    teamCode: "",
    teamSelectionMode: "join",
  })
}

export async function leavePendingTeam(teamDocId: string, memberId: string): Promise<void> {
  console.log("[api/lib/teams] leavePendingTeam start", { teamDocId, memberId })

  const normalizedMemberId = memberId.trim()

  const applicationSnapshot = await db
    .collection("participants")
    .doc(normalizedMemberId)
    .collection("details")
    .doc("application")
    .get()

  const applicationData = applicationSnapshot.data() as { status?: unknown } | undefined
  const applicationStatus = applicationData?.status === "submitted" ? "submitted" : "started"

  if (applicationStatus === "submitted") {
    console.warn("[api/lib/teams] leavePendingTeam blocked for submitted applicant", {
      teamDocId,
      memberId: normalizedMemberId,
      applicationStatus,
    })
    throw new SubmittedApplicationLeaveError()
  }

  await db.collection("teams").doc(teamDocId).update({
    memberIds: FieldValue.arrayRemove(normalizedMemberId),
    pendingMemberIds: FieldValue.arrayRemove(normalizedMemberId),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/teams] leavePendingTeam complete", {
    teamDocId,
    memberId: normalizedMemberId,
  })
}

export async function kickPendingTeamMember(teamDocId: string, memberId: string): Promise<void> {
  console.log("[api/lib/teams] kickPendingTeamMember start", { teamDocId, memberId })

  const normalizedMemberId = memberId.trim()

  const teamSnapshot = await db.collection("teams").doc(teamDocId).get()
  const teamData = teamSnapshot.data() as { status?: unknown } | undefined
  const teamStatus = teamData?.status === "INITIAL" ? "INITIAL" : "APPLICATION_SUBMITTED"

  if (teamStatus === "APPLICATION_SUBMITTED") {
    console.warn("[api/lib/teams] kickPendingTeamMember blocked for submitted team", {
      teamDocId,
      memberId: normalizedMemberId,
      teamStatus,
    })
    throw new SubmittedTeamMutationError()
  }

  await Promise.all([
    db.collection("teams").doc(teamDocId).update({
      memberIds: FieldValue.arrayRemove(normalizedMemberId),
      pendingMemberIds: FieldValue.arrayRemove(normalizedMemberId),
      updatedAt: FieldValue.serverTimestamp(),
    }),
    db
      .collection("participants")
      .doc(normalizedMemberId)
      .collection("details")
      .doc("application")
      .set(
        {
          status: "started",
          teamCode: "",
          teamSelectionMode: "join",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
  ])

  console.log("[api/lib/teams] kickPendingTeamMember complete", {
    teamDocId,
    memberId: normalizedMemberId,
    applicationStatus: "started",
    teamCode: "",
    teamSelectionMode: "join",
  })
}

export async function submitPendingTeamApplication(teamDocId: string, leaderId: string): Promise<void> {
  console.log("[api/lib/teams] submitPendingTeamApplication start", { teamDocId, leaderId })

  const normalizedLeaderId = leaderId.trim()
  const teamDocRef = db.collection("teams").doc(teamDocId)

  await db.runTransaction(async (transaction) => {
    const teamSnapshot = await transaction.get(teamDocRef)

    if (!teamSnapshot.exists) {
      throw new Error("Team not found")
    }

    const teamData = teamSnapshot.data() as {
      leaderId?: unknown
      memberIds?: unknown
      pendingMemberIds?: unknown
      status?: unknown
    }

    const currentStatus = teamData?.status === "INITIAL" ? "INITIAL" : "APPLICATION_SUBMITTED"
    if (currentStatus === "APPLICATION_SUBMITTED") {
      return
    }

    const currentLeaderId = typeof teamData?.leaderId === "string" ? teamData.leaderId.trim() : ""
    if (!currentLeaderId || currentLeaderId !== normalizedLeaderId) {
      throw new Error("Only the team leader can submit the team application")
    }

    const memberIds = Array.isArray(teamData?.memberIds)
      ? [...new Set(teamData.memberIds.flatMap((memberId) => {
        if (typeof memberId === "string") {
          const normalizedMemberId = memberId.trim()
          return normalizedMemberId.length > 0 ? [normalizedMemberId] : []
        }

        if (typeof memberId === "number" && Number.isFinite(memberId)) {
          return [String(memberId)]
        }

        return []
      }))]
      : []

    const pendingMemberIds = Array.isArray(teamData?.pendingMemberIds)
      ? [...new Set(teamData.pendingMemberIds.flatMap((memberId) => {
        if (typeof memberId === "string") {
          const normalizedMemberId = memberId.trim()
          return normalizedMemberId.length > 0 ? [normalizedMemberId] : []
        }

        if (typeof memberId === "number" && Number.isFinite(memberId)) {
          return [String(memberId)]
        }

        return []
      }))]
      : []

    if (pendingMemberIds.length > 0) {
      throw new Error("All pending team members must be approved or declined before team submission")
    }

    for (const memberId of memberIds) {
      const applicationDocRef = db
        .collection("participants")
        .doc(memberId)
        .collection("details")
        .doc("application")

      const applicationSnapshot = await transaction.get(applicationDocRef)
      const applicationData = applicationSnapshot.data() as { status?: unknown } | undefined
      const applicationStatus = applicationData?.status === "submitted" ? "submitted" : "started"

      if (memberId !== normalizedLeaderId && applicationStatus !== "submitted") {
        throw new Error("All team members must submit their applications before team submission")
      }
    }

    transaction.update(teamDocRef, {
      status: "APPLICATION_SUBMITTED",
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    const leaderApplicationDocRef = db
      .collection("participants")
      .doc(normalizedLeaderId)
      .collection("details")
      .doc("application")

    transaction.set(
      leaderApplicationDocRef,
      {
        status: "submitted",
        submittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  })

  console.log("[api/lib/teams] submitPendingTeamApplication complete", {
    teamDocId,
    leaderId: normalizedLeaderId,
    status: "APPLICATION_SUBMITTED",
    applicationStatus: "submitted",
  })
}
