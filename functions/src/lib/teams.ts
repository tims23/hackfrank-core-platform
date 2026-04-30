import { db } from "./firebase-admin.js"
import { FieldValue } from "firebase-admin/firestore"
import type { PendingTeamRecord, TeamStatus } from "../shared/types.js"
import {
  APPLICANT_STATUS_STARTED,
  APPLICANT_STATUS_SUBMITTED,
  DEFAULT_TEAM_SELECTION_MODE,
  normalizeApplicantStatus,
  normalizeTeamStatus,
  normalizeTeamSelectionMode,
  TEAM_SELECTION_MODE_INDIVIDUAL,
  TEAM_STATUS_APPLICATION_SUBMITTED,
  TEAM_STATUS_INITIAL,
} from "../shared/types.js"

export type { PendingTeamRecord, TeamStatus } from "../shared/types.js"

const TEAM_MAX_MEMBERS = 4

const generateTeamCode = (): string => Math.random().toString(36).slice(2, 8).toUpperCase()

export class SubmittedTeamMutationError extends Error {
  constructor() {
    super("Team membership cannot be changed after team application submission")
    this.name = "SubmittedTeamMutationError"
  }
}

export class TeamSelectionLockedError extends Error {
  constructor() {
    super("Team creation/join is not allowed for applicants who submitted individually or already submitted")
    this.name = "TeamSelectionLockedError"
  }
}

const getParticipantApplicationDocRef = (uid: string) =>
  db.collection("participants").doc(uid).collection("details").doc("application")

const assertTeamSelectionOpen = async (applicantId: string): Promise<void> => {
  const normalizedApplicantId = applicantId.trim()

  const applicationSnapshot = await getParticipantApplicationDocRef(normalizedApplicantId).get()
  const applicationData = applicationSnapshot.data() as {
    status?: unknown
    teamSelectionMode?: unknown
  } | undefined

  const applicationStatus = normalizeApplicantStatus(applicationData?.status)
  const teamSelectionMode = normalizeTeamSelectionMode(applicationData?.teamSelectionMode)

  if (applicationStatus === APPLICANT_STATUS_SUBMITTED || teamSelectionMode === TEAM_SELECTION_MODE_INDIVIDUAL) {
    throw new TeamSelectionLockedError()
  }
}

export async function createPendingTeamFromApplication(
  leaderId: string,
  name: string,
  description: string,
): Promise<{ teamCode: string }> {
  console.log("[functions/lib/teams] createPendingTeamFromApplication start", {
    leaderId,
    maxMembers: TEAM_MAX_MEMBERS,
  })

  const normalizedName = name.trim()
  const normalizedDescription = description.trim()
  const teamCode = generateTeamCode()

  await assertTeamSelectionOpen(leaderId)

  await db.collection("teams").add({
    id: Date.now(),
    name: normalizedName,
    memberIds: [leaderId],
    skills: [],
    looking: true,
    case: "",
    description: normalizedDescription,
    leaderId,
    teamCode,
    status: TEAM_STATUS_INITIAL,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[functions/lib/teams] createPendingTeamFromApplication complete", {
    leaderId,
    teamCode,
    maxMembers: TEAM_MAX_MEMBERS,
  })

  return { teamCode }
}

export async function joinPendingTeamByCode(
  teamCode: string,
  applicantId: string,
): Promise<boolean> {
  console.log("[functions/lib/teams] joinPendingTeamByCode start", {
    applicantId,
    teamCode,
  })

  const normalizedTeamCode = teamCode.trim().toUpperCase()
  const normalizedApplicantId = applicantId.trim()

  await assertTeamSelectionOpen(normalizedApplicantId)

  if (!normalizedTeamCode || !normalizedApplicantId) {
    console.warn("[functions/lib/teams] joinPendingTeamByCode rejected invalid input", {
      applicantId,
      teamCode,
    })
    return false
  }

  const teamsSnapshot = await db
    .collection("teams")
    .where("teamCode", "==", normalizedTeamCode)
    .where("status", "==", TEAM_STATUS_INITIAL)
    .limit(1)
    .get()

  const matchedTeamDoc = teamsSnapshot.docs[0]
  if (!matchedTeamDoc) {
    console.log("[functions/lib/teams] joinPendingTeamByCode no matching team", {
      applicantId: normalizedApplicantId,
      teamCode: normalizedTeamCode,
    })
    return false
  }

  const joined = await db.runTransaction(async (transaction) => {
    const freshTeamSnapshot = await transaction.get(matchedTeamDoc.ref)
    if (!freshTeamSnapshot.exists) {
      return false
    }

    const teamData = freshTeamSnapshot.data() as { memberIds?: unknown; status?: unknown } | undefined
    const teamStatus = normalizeTeamStatus(teamData?.status)
    if (teamStatus !== TEAM_STATUS_INITIAL) {
      return false
    }

    const memberIds = Array.isArray(teamData?.memberIds)
      ? [...new Set(teamData.memberIds.flatMap((memberId: unknown) => {
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

    if (memberIds.includes(normalizedApplicantId)) {
      return true
    }

    if (memberIds.length >= TEAM_MAX_MEMBERS) {
      return false
    }

    transaction.update(matchedTeamDoc.ref, {
      memberIds: FieldValue.arrayUnion(normalizedApplicantId),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return true
  })

  if (!joined) {
    return false
  }

  console.log("[functions/lib/teams] joinPendingTeamByCode complete", {
    applicantId: normalizedApplicantId,
    teamCode: normalizedTeamCode,
    teamDocId: matchedTeamDoc.id,
  })

  return true
}

export async function leavePendingTeam(teamDocId: string, memberId: string): Promise<void> {
  console.log("[functions/lib/teams] leavePendingTeam start", { teamDocId, memberId })

  const normalizedMemberId = memberId.trim()

  await Promise.all([
    db.collection("teams").doc(teamDocId).update({
      memberIds: FieldValue.arrayRemove(normalizedMemberId),
      updatedAt: FieldValue.serverTimestamp(),
    }),
    db
      .collection("participants")
      .doc(normalizedMemberId)
      .collection("details")
      .doc("application")
      .set(
        {
          status: APPLICANT_STATUS_STARTED,
          submittedAt: FieldValue.delete(),
          teamCode: "",
          teamSelectionMode: DEFAULT_TEAM_SELECTION_MODE,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
  ])

  console.log("[functions/lib/teams] leavePendingTeam complete", {
    teamDocId,
    memberId: normalizedMemberId,
    applicationStatus: APPLICANT_STATUS_STARTED,
    teamCode: "",
    teamSelectionMode: DEFAULT_TEAM_SELECTION_MODE,
  })
}

export async function kickPendingTeamMember(teamDocId: string, memberId: string): Promise<void> {
  console.log("[functions/lib/teams] kickPendingTeamMember start", { teamDocId, memberId })

  const normalizedMemberId = memberId.trim()

  const teamSnapshot = await db.collection("teams").doc(teamDocId).get()
  const teamData = teamSnapshot.data() as { status?: unknown } | undefined
  const teamStatus = normalizeTeamStatus(teamData?.status)

  if (teamStatus === TEAM_STATUS_APPLICATION_SUBMITTED) {
    console.warn("[functions/lib/teams] kickPendingTeamMember blocked for submitted team", {
      teamDocId,
      memberId: normalizedMemberId,
      teamStatus,
    })
    throw new SubmittedTeamMutationError()
  }

  await Promise.all([
    db.collection("teams").doc(teamDocId).update({
      memberIds: FieldValue.arrayRemove(normalizedMemberId),
      updatedAt: FieldValue.serverTimestamp(),
    }),
    db
      .collection("participants")
      .doc(normalizedMemberId)
      .collection("details")
      .doc("application")
      .set(
        {
          status: APPLICANT_STATUS_STARTED,
          teamCode: "",
          teamSelectionMode: DEFAULT_TEAM_SELECTION_MODE,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
  ])

  console.log("[functions/lib/teams] kickPendingTeamMember complete", {
    teamDocId,
    memberId: normalizedMemberId,
    applicationStatus: APPLICANT_STATUS_STARTED,
    teamCode: "",
    teamSelectionMode: DEFAULT_TEAM_SELECTION_MODE,
  })
}

export async function submitPendingTeamApplication(teamDocId: string, leaderId: string): Promise<void> {
  console.log("[functions/lib/teams] submitPendingTeamApplication start", { teamDocId, leaderId })

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
      status?: unknown
    }

    const currentStatus = normalizeTeamStatus(teamData?.status)
    if (currentStatus === TEAM_STATUS_APPLICATION_SUBMITTED) {
      return
    }

    const currentLeaderId = typeof teamData?.leaderId === "string" ? teamData.leaderId.trim() : ""
    if (!currentLeaderId || currentLeaderId !== normalizedLeaderId) {
      throw new Error("Only the team leader can submit the team application")
    }

    const memberIds = Array.isArray(teamData?.memberIds)
      ? [...new Set(teamData.memberIds.flatMap((memberId: unknown) => {
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

    for (const memberId of memberIds) {
      const applicationDocRef = db
        .collection("participants")
        .doc(memberId)
        .collection("details")
        .doc("application")

      const applicationSnapshot = await transaction.get(applicationDocRef)
      const applicationData = applicationSnapshot.data() as { status?: unknown } | undefined
      const applicationStatus = normalizeApplicantStatus(applicationData?.status)

      if (memberId !== normalizedLeaderId && applicationStatus !== APPLICANT_STATUS_SUBMITTED) {
        throw new Error("All team members must submit their applications before team submission")
      }
    }

    transaction.update(teamDocRef, {
      status: TEAM_STATUS_APPLICATION_SUBMITTED,
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
        status: APPLICANT_STATUS_SUBMITTED,
        submittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  })

  console.log("[functions/lib/teams] submitPendingTeamApplication complete", {
    teamDocId,
    leaderId: normalizedLeaderId,
    status: TEAM_STATUS_APPLICATION_SUBMITTED,
    applicationStatus: APPLICANT_STATUS_SUBMITTED,
  })
}
