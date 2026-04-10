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
}

export type ApplicantRecord = ApplicantFormInput & {
  uid: string
  status: ApplicantStatus
  skills?: string[]
}

export type ApplicantProfileRecord = {
  prename?: string
  surname?: string
  nationality?: string
  university?: string
  generalSkills?: string
  skills?: string[]
}

const getParticipantApplicationDocRef = (uid: string) =>
  db.collection("participants").doc(uid).collection("details").doc("application")

const getParticipantProfileDocRef = (uid: string) =>
  db.collection("participants").doc(uid).collection("details").doc("profile")

const parseSkills = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : []

const parseHackathonsAttended = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.max(0, Math.trunc(value)))
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return String(Math.max(0, parsed))
    }
    return ""
  }

  return ""
}

export async function fetchApplicantFormData(uid: string): Promise<ApplicantRecord | null> {
  console.log("[api/lib/applicants] fetchApplicantFormData start", { uid })

  const [applicationSnapshot, profileSnapshot] = await Promise.all([
    getParticipantApplicationDocRef(uid).get(),
    getParticipantProfileDocRef(uid).get(),
  ])

  if (!applicationSnapshot.exists) {
    console.log("[api/lib/applicants] fetchApplicantFormData missing", { uid })
    return null
  }

  const applicationData = applicationSnapshot.data() as Partial<ApplicantRecord> | undefined
  const profileData = profileSnapshot.data() as ApplicantProfileRecord | undefined
  const status: ApplicantStatus = applicationData?.status === "submitted" ? "submitted" : "started"
  const skillsFromProfile = parseSkills(profileData?.skills)
  const skillsFromApplication = parseSkills(applicationData?.skills)
  const skills = skillsFromProfile.length > 0 ? skillsFromProfile : skillsFromApplication
  const generalSkills =
    typeof profileData?.generalSkills === "string"
      ? profileData.generalSkills
      : typeof applicationData?.generalSkills === "string"
        ? applicationData.generalSkills
        : skills.join(", ")

  const result: ApplicantRecord = {
    uid,
    status,
    prename:
      typeof profileData?.prename === "string"
        ? profileData.prename
        : typeof applicationData?.prename === "string"
          ? applicationData.prename
          : "",
    surname:
      typeof profileData?.surname === "string"
        ? profileData.surname
        : typeof applicationData?.surname === "string"
          ? applicationData.surname
          : "",
    birthday: typeof applicationData?.birthday === "string" ? applicationData.birthday : "",
    gender: typeof applicationData?.gender === "string" ? applicationData.gender : "",
    phoneNumber: typeof applicationData?.phoneNumber === "string" ? applicationData.phoneNumber : "",
    nationality:
      typeof profileData?.nationality === "string"
        ? profileData.nationality
        : typeof applicationData?.nationality === "string"
          ? applicationData.nationality
          : "",
    university:
      typeof profileData?.university === "string"
        ? profileData.university
        : typeof applicationData?.university === "string"
          ? applicationData.university
          : "",
    currentCv: typeof applicationData?.currentCv === "string" ? applicationData.currentCv : "",
    motivation: typeof applicationData?.motivation === "string" ? applicationData.motivation : "",
    programmingSkillLevel:
      typeof applicationData?.programmingSkillLevel === "string"
        ? applicationData.programmingSkillLevel
        : "",
    generalSkills,
    hackathonsAttended: parseHackathonsAttended(applicationData?.hackathonsAttended),
    teamCode: typeof applicationData?.teamCode === "string" ? applicationData.teamCode : "",
    teamSelectionMode:
      applicationData?.teamSelectionMode === "create" || applicationData?.teamSelectionMode === "skip"
        ? applicationData.teamSelectionMode
        : "join",
    skills,
  }

  console.log("[api/lib/applicants] fetchApplicantFormData complete", {
    uid,
    status,
    hasData: true,
  })

  return result
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
  await Promise.all([
    getParticipantApplicationDocRef(uid).set({
      birthday: applicant.birthday,
      gender: applicant.gender,
      phoneNumber: applicant.phoneNumber,
      currentCv: applicant.currentCv,
      motivation: applicant.motivation,
      programmingSkillLevel: applicant.programmingSkillLevel,
      hackathonsAttended: Number.isFinite(hackathonsAttended) ? hackathonsAttended : 0,
      teamCode: applicant.teamCode,
      teamSelectionMode: applicant.teamSelectionMode,
      status: "submitted",
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    getParticipantProfileDocRef(uid).set({
      prename: applicant.prename,
      surname: applicant.surname,
      nationality: applicant.nationality,
      university: applicant.university,
      generalSkills: applicant.generalSkills,
      skills,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
  ])

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

  let profilePayload: Record<string, unknown> | null = null
  const ensureProfilePayload = (): Record<string, unknown> => {
    if (!profilePayload) {
      profilePayload = {
        updatedAt: FieldValue.serverTimestamp(),
      }
    }

    return profilePayload
  }

  for (const [key, value] of Object.entries(updates)) {
    if (key === "prename" || key === "surname" || key === "nationality" || key === "university") {
      ensureProfilePayload()[key] = value
    } else if (key === "generalSkills" && typeof value === "string") {
      const skills = value
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      ensureProfilePayload().generalSkills = value
      ensureProfilePayload().skills = skills
    } else if (key === "hackathonsAttended" && typeof value === "string") {
      payload[key] = value
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed)) {
        payload.hackathonsAttended = Math.max(0, parsed)
      }
    } else {
      payload[key] = value
    }
  }

  await Promise.all([
    getParticipantApplicationDocRef(uid).set(payload, { merge: true }),
    profilePayload ? getParticipantProfileDocRef(uid).set(profilePayload, { merge: true }) : Promise.resolve(),
  ])

  console.log("[api/lib/applicants] syncApplicantDraft complete", {
    uid,
    payloadKeys: Object.keys(payload),
  })
}

export async function createApplicant(uid: string): Promise<void> {
  console.log("[api/lib/applicants] createApplicant start", { uid })

  await Promise.all([
    getParticipantApplicationDocRef(uid).set({
      userId: uid,
      status: "started",
      birthday: "",
      gender: "",
      phoneNumber: "",
      currentCv: "",
      motivation: "",
      programmingSkillLevel: "",
      hackathonsAttended: "",
      teamCode: "",
      teamSelectionMode: "join",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    getParticipantProfileDocRef(uid).set({
      prename: "",
      surname: "",
      nationality: "",
      university: "",
      generalSkills: "",
      skills: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
  ])

  console.log("[api/lib/applicants] createApplicant complete", { uid })
}
