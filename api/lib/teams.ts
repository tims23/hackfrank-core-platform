import { db } from "./firebase-admin.ts"
import { FieldValue } from "firebase-admin/firestore"

export type TeamStatus = "APPLICATION_PENDING" | "ACTIVE"

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
    status: "APPLICATION_PENDING",
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
    .where("status", "==", "APPLICATION_PENDING")
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

  await db.collection("teams").doc(teamDocId).update({
    pendingMemberIds: FieldValue.arrayRemove(normalizedPendingMemberId),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/teams] declinePendingMember complete", {
    teamDocId,
    pendingMemberId: normalizedPendingMemberId,
  })
}

export async function leavePendingTeam(teamDocId: string, memberId: string): Promise<void> {
  console.log("[api/lib/teams] leavePendingTeam start", { teamDocId, memberId })

  const normalizedMemberId = memberId.trim()

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

  await db.collection("teams").doc(teamDocId).update({
    memberIds: FieldValue.arrayRemove(normalizedMemberId),
    pendingMemberIds: FieldValue.arrayRemove(normalizedMemberId),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/teams] kickPendingTeamMember complete", {
    teamDocId,
    memberId: normalizedMemberId,
  })
}
