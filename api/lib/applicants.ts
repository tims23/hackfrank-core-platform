import { db } from "./firebase-admin.ts"
import { FieldValue } from "firebase-admin/firestore"

export type ApplicantStatus = "started" | "submitted"

export type ApplicantFormInput = {
  prename: string
  surname: string
  birthday: string
  gender: string
  phoneNumber: string
  nationality: string
  university: string
  currentCv: string
  motivation: string
  programmingSkillLevel: string
  generalSkills: string
  hackathonsAttended: string
  teamCode: string
  teamSelectionMode: "join" | "create" | "skip"
  newTeamName: string
  newTeamDescription: string
  newTeamMaxMembers: string
}

export async function submitApplicantForm(
  uid: string,
  applicant: ApplicantFormInput,
): Promise<void> {
  console.log("[api/lib/applicants] submitApplicantForm start", { uid })

  const skills = applicant.generalSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  const hackathonsAttended = Number.parseInt(applicant.hackathonsAttended, 10)
  const newTeamMaxMembers = Number.parseInt(applicant.newTeamMaxMembers || "2", 10)

  await db.collection("applicants").doc(uid).update({
    prename: applicant.prename,
    surname: applicant.surname,
    birthday: applicant.birthday,
    gender: applicant.gender,
    phoneNumber: applicant.phoneNumber,
    nationality: applicant.nationality,
    university: applicant.university,
    currentCv: applicant.currentCv,
    motivation: applicant.motivation,
    programmingSkillLevel: applicant.programmingSkillLevel,
    generalSkills: applicant.generalSkills,
    skills,
    hackathonsAttended: Number.isFinite(hackathonsAttended) ? hackathonsAttended : 0,
    teamCode: applicant.teamCode,
    teamSelectionMode: applicant.teamSelectionMode,
    newTeamName: applicant.newTeamName,
    newTeamDescription: applicant.newTeamDescription,
    newTeamMaxMembers: Math.max(2, Math.min(4, newTeamMaxMembers)),
    status: "submitted",
    submittedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/applicants] submitApplicantForm complete", {
    uid,
    skillCount: skills.length,
  })
}

export async function syncApplicantDraft(
  uid: string,
  updates: Partial<ApplicantFormInput>,
): Promise<void> {
  console.log("[api/lib/applicants] syncApplicantDraft start", {
    uid,
    updateKeys: Object.keys(updates),
  })

  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }

  for (const [key, value] of Object.entries(updates)) {
    if (key === "generalSkills" && typeof value === "string") {
      payload.generalSkills = value
      payload.skills = value
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
    } else if (key === "hackathonsAttended" && typeof value === "string") {
      payload[key] = value
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed)) {
        payload.hackathonsAttended = Math.max(0, parsed)
      }
    } else if (key === "newTeamMaxMembers" && typeof value === "string") {
      payload[key] = value
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed)) {
        payload.newTeamMaxMembers = Math.max(2, Math.min(4, parsed))
      }
    } else {
      payload[key] = value
    }
  }

  await db.collection("applicants").doc(uid).update(payload)

  console.log("[api/lib/applicants] syncApplicantDraft complete", {
    uid,
    payloadKeys: Object.keys(payload),
  })
}

export async function createApplicant(uid: string): Promise<void> {
  console.log("[api/lib/applicants] createApplicant start", { uid })

  await db.collection("applicants").doc(uid).set({
    userId: uid,
    status: "started",
    prename: "",
    surname: "",
    birthday: "",
    gender: "",
    phoneNumber: "",
    nationality: "",
    university: "",
    currentCv: "",
    motivation: "",
    programmingSkillLevel: "",
    generalSkills: "",
    hackathonsAttended: "",
    teamCode: "",
    teamSelectionMode: "join",
    newTeamName: "",
    newTeamDescription: "",
    newTeamMaxMembers: "",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log("[api/lib/applicants] createApplicant complete", { uid })
}
