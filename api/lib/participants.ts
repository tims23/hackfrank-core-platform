import { db } from "./firebase-admin.ts"

type TeamMembershipRecord = {
  memberIds?: unknown
}

export type SharedParticipantProfile = {
  uid: string
  prename: string
  surname: string
  fullName: string
  nationality: string
  university: string
  generalSkills: string
  status: "started" | "submitted"
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .flatMap((entry) => {
      if (typeof entry === "string") {
        const normalized = entry.trim()
        return normalized ? [normalized] : []
      }

      if (typeof entry === "number" && Number.isFinite(entry)) {
        return [String(entry)]
      }

      return []
    })
}

const hasSharedTeamAccess = async (requesterUid: string, targetUid: string): Promise<boolean> => {
  if (requesterUid === targetUid) {
    return true
  }

  const requesterTeamSnapshots = await Promise.all([
    db.collection("teams").where("memberIds", "array-contains", requesterUid).get(),
  ])

  for (const snapshot of requesterTeamSnapshots) {
    for (const teamDoc of snapshot.docs) {
      const data = teamDoc.data() as TeamMembershipRecord
      const memberIds = toStringArray(data.memberIds)

      if (memberIds.includes(targetUid)) {
        return true
      }
    }
  }

  return false
}

const readString = (value: unknown): string => (typeof value === "string" ? value.trim() : "")

export async function fetchParticipantProfileForSharedTeam(
  requesterUid: string,
  targetUid: string,
): Promise<SharedParticipantProfile | null> {
  const normalizedRequesterUid = requesterUid.trim()
  const normalizedTargetUid = targetUid.trim()

  if (!normalizedRequesterUid || !normalizedTargetUid) {
    return null
  }

  const allowed = await hasSharedTeamAccess(normalizedRequesterUid, normalizedTargetUid)
  if (!allowed) {
    return null
  }

  const [profileSnapshot, applicationSnapshot] = await Promise.all([
    db.collection("participants").doc(normalizedTargetUid).collection("details").doc("profile").get(),
    db.collection("participants").doc(normalizedTargetUid).collection("details").doc("application").get(),
  ])

  const profileData = profileSnapshot.data() as
    | { prename?: unknown; surname?: unknown; nationality?: unknown; university?: unknown; generalSkills?: unknown }
    | undefined
  const applicationData = applicationSnapshot.data() as
    | { prename?: unknown; surname?: unknown; status?: unknown }
    | undefined

  const prename = readString(profileData?.prename ?? applicationData?.prename)
  const surname = readString(profileData?.surname ?? applicationData?.surname)

  return {
    uid: normalizedTargetUid,
    prename,
    surname,
    fullName: `${prename} ${surname}`.trim(),
    nationality: readString(profileData?.nationality),
    university: readString(profileData?.university),
    generalSkills: readString(profileData?.generalSkills),
    status: applicationData?.status === "submitted" ? "submitted" : "started",
  }
}