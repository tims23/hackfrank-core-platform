import { collection, doc, documentId, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore"
import { firestoreDb, logFirebaseFetch } from "@/lib/firebase"

export type ApplicantStatus = "started" | "submitted"

export type ApplicantRecord = {
  uid: string
  status: ApplicantStatus
  prename?: string
  surname?: string
  birthday?: string
  gender?: string
  phoneNumber?: string
  nationality?: string
  university?: string
  currentCv?: string
  motivation?: string
  programmingSkillLevel?: string
  skills?: string[]
  hackathonsAttended?: number
  teamCode?: string
  teamSelectionMode?: "join" | "create" | "skip"
  newTeamName?: string
  newTeamDescription?: string
  newTeamMaxMembers?: number
}

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

export type ApplicantProfileLookupResult = {
  namesById: Record<string, string>
  statusesById: Record<string, ApplicantStatus>
}

const readApplicantString = (value: unknown): string => (typeof value === "string" ? value : "")
const readApplicantStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .flatMap((entry) => (typeof entry === "string" ? [entry.trim()] : []))
        .filter((entry) => entry.length > 0)
    : []

const readApplicantNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null

const chunkIds = (ids: string[], chunkSize: number): string[][] => {
  const chunks: string[][] = []

  for (let index = 0; index < ids.length; index += chunkSize) {
    chunks.push(ids.slice(index, index + chunkSize))
  }

  return chunks
}

export const fetchApplicantProfilesByIds = async (
  applicantIds: string[],
): Promise<ApplicantProfileLookupResult> => {
  const normalizedIds = [...new Set(applicantIds.map((id) => id.trim()).filter((id) => id.length > 0))]

  if (normalizedIds.length === 0) {
    return {
      namesById: {},
      statusesById: {},
    }
  }

  const idChunks = chunkIds(normalizedIds, 30)
  const namesById: Record<string, string> = {}
  const statusesById: Record<string, ApplicantStatus> = {}

  for (const idsChunk of idChunks) {
    logFirebaseFetch("getDocs:start", {
      collection: "applicants",
      idCount: idsChunk.length,
      mode: "member-name-lookup",
    })

    const applicantQuery = query(
      collection(firestoreDb, "applicants"),
      where(documentId(), "in", idsChunk),
    )

    const applicantsSnapshot = await getDocs(applicantQuery)

    logFirebaseFetch("getDocs:success", {
      collection: "applicants",
      idCount: idsChunk.length,
      size: applicantsSnapshot.size,
      mode: "member-name-lookup",
    })

    applicantsSnapshot.forEach((applicantDoc) => {
      const data = applicantDoc.data() as Partial<ApplicantRecord>
      const prename = readApplicantString(data.prename).trim()
      const surname = readApplicantString(data.surname).trim()
      const fullName = `${prename} ${surname}`.trim()
      const applicantStatus: ApplicantStatus = data.status === "submitted" ? "submitted" : "started"

      if (fullName.length > 0) {
        namesById[applicantDoc.id] = fullName
      }

      statusesById[applicantDoc.id] = applicantStatus
    })
  }

  return {
    namesById,
    statusesById,
  }
}

export const fetchApplicantNamesByIds = async (applicantIds: string[]): Promise<Record<string, string>> => {
  const { namesById } = await fetchApplicantProfilesByIds(applicantIds)
  return namesById
}

export const subscribeToApplicantFormData = (
  uid: string,
  onApplicantFormData: (applicantFormData: Partial<ApplicantFormInput>) => void,
  onError?: (error: Error) => void,
  onStatusUpdate?: (status: ApplicantStatus) => void,
) => {
  logFirebaseFetch("onSnapshot:subscribe", {
    collection: "applicants",
    id: uid,
  })

  return onSnapshot(
    doc(firestoreDb, "applicants", uid),
    (snapshot) => {
      const data = snapshot.data() as Partial<ApplicantRecord> | undefined

      logFirebaseFetch("onSnapshot:update", {
        collection: "applicants",
        id: uid,
        exists: snapshot.exists(),
        fromCache: snapshot.metadata.fromCache,
      })

      if (!data) {
        onApplicantFormData({})
        if (onStatusUpdate) {
          onStatusUpdate("started")
        }
        return
      }

      const applicantStatus: ApplicantStatus = data.status === "submitted" ? "submitted" : "started"

      if (onStatusUpdate) {
        onStatusUpdate(applicantStatus)
      }

      onApplicantFormData({
        prename: readApplicantString(data.prename),
        surname: readApplicantString(data.surname),
        birthday: readApplicantString(data.birthday),
        gender: readApplicantString(data.gender),
        phoneNumber: readApplicantString(data.phoneNumber),
        nationality: readApplicantString(data.nationality),
        university: readApplicantString(data.university),
        currentCv: readApplicantString(data.currentCv),
        motivation: readApplicantString(data.motivation),
        programmingSkillLevel: readApplicantString(data.programmingSkillLevel),
        generalSkills: readApplicantStringArray(data.skills).join(", "),
        hackathonsAttended:
          readApplicantNumber(data.hackathonsAttended) !== null
            ? String(readApplicantNumber(data.hackathonsAttended))
            : "",
        teamCode: readApplicantString(data.teamCode),
        teamSelectionMode:
          data.teamSelectionMode === "create" || data.teamSelectionMode === "skip"
            ? data.teamSelectionMode
            : "join",
        newTeamName: readApplicantString(data.newTeamName),
        newTeamDescription: readApplicantString(data.newTeamDescription),
        newTeamMaxMembers:
          readApplicantNumber(data.newTeamMaxMembers) !== null
            ? String(readApplicantNumber(data.newTeamMaxMembers))
            : "",
      })
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "applicants",
        id: uid,
        message: snapshotError.message,
      })

      if (onError) {
        onError(snapshotError)
      }
    },
  )
}

export const createApplicant = async (uid: string): Promise<void> => {

  logFirebaseFetch("firestore:write:start", {
    collection: "applicants",
    operation: "setDoc",
    id: uid,
  })

  await setDoc(
    doc(firestoreDb, "applicants", uid),
    {
      uid,
      status: "started",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  logFirebaseFetch("firestore:write:success", {
    collection: "applicants",
    operation: "setDoc",
    id: uid,
  })
}

export const syncApplicantDraft = async (
  uid: string,
  applicationDraft: Partial<ApplicantFormInput>,
): Promise<void> => {
  const payload: Record<string, unknown> = {
    uid,
    updatedAt: serverTimestamp(),
  }

  if ("prename" in applicationDraft) {
    payload.prename = (applicationDraft.prename ?? "").trim()
  }
  if ("surname" in applicationDraft) {
    payload.surname = (applicationDraft.surname ?? "").trim()
  }
  if ("birthday" in applicationDraft) {
    payload.birthday = (applicationDraft.birthday ?? "").trim()
  }
  if ("gender" in applicationDraft) {
    payload.gender = (applicationDraft.gender ?? "").trim()
  }
  if ("phoneNumber" in applicationDraft) {
    payload.phoneNumber = (applicationDraft.phoneNumber ?? "").trim()
  }
  if ("nationality" in applicationDraft) {
    payload.nationality = (applicationDraft.nationality ?? "").trim()
  }
  if ("university" in applicationDraft) {
    payload.university = (applicationDraft.university ?? "").trim()
  }
  if ("currentCv" in applicationDraft) {
    payload.currentCv = (applicationDraft.currentCv ?? "").trim()
  }
  if ("motivation" in applicationDraft) {
    payload.motivation = (applicationDraft.motivation ?? "").trim()
  }
  if ("programmingSkillLevel" in applicationDraft) {
    payload.programmingSkillLevel = (applicationDraft.programmingSkillLevel ?? "").trim()
  }
  if ("generalSkills" in applicationDraft) {
    payload.skills = (applicationDraft.generalSkills ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
  }
  if ("hackathonsAttended" in applicationDraft) {
    const parsedHackathonsAttended = Number.parseInt(applicationDraft.hackathonsAttended ?? "", 10)
    payload.hackathonsAttended = Number.isFinite(parsedHackathonsAttended)
      ? Math.max(0, parsedHackathonsAttended)
      : 0
  }
  if ("teamCode" in applicationDraft) {
    payload.teamCode = (applicationDraft.teamCode ?? "").trim()
  }
  if ("teamSelectionMode" in applicationDraft) {
    payload.teamSelectionMode = applicationDraft.teamSelectionMode ?? "join"
  }
  if ("newTeamName" in applicationDraft) {
    payload.newTeamName = (applicationDraft.newTeamName ?? "").trim()
  }
  if ("newTeamDescription" in applicationDraft) {
    payload.newTeamDescription = (applicationDraft.newTeamDescription ?? "").trim()
  }
  if ("newTeamMaxMembers" in applicationDraft) {
    const parsedNewTeamMaxMembers = Number.parseInt(applicationDraft.newTeamMaxMembers ?? "", 10)
    payload.newTeamMaxMembers = Number.isFinite(parsedNewTeamMaxMembers)
      ? Math.max(2, Math.min(4, parsedNewTeamMaxMembers))
      : 2
  }

  logFirebaseFetch("firestore:write:start", {
    collection: "applicants",
    operation: "setDoc",
    id: uid,
    mode: "draft-sync",
  })

  await setDoc(doc(firestoreDb, "applicants", uid), payload, { merge: true })

  logFirebaseFetch("firestore:write:success", {
    collection: "applicants",
    operation: "setDoc",
    id: uid,
    mode: "draft-sync",
  })
}

export const submitApplicantForm = async (uid: string, applicant: ApplicantFormInput): Promise<void> => {
  const normalizedGeneralSkills = applicant.generalSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  const parsedHackathonsAttended = Number.parseInt(applicant.hackathonsAttended, 10)

  const normalizedApplicant: ApplicantFormInput = {
    prename: applicant.prename.trim(),
    surname: applicant.surname.trim(),
    birthday: applicant.birthday.trim(),
    gender: applicant.gender.trim(),
    phoneNumber: applicant.phoneNumber.trim(),
    nationality: applicant.nationality.trim(),
    university: applicant.university.trim(),
    currentCv: applicant.currentCv.trim(),
    motivation: applicant.motivation.trim(),
    programmingSkillLevel: applicant.programmingSkillLevel.trim(),
    generalSkills: normalizedGeneralSkills.join(", "),
    hackathonsAttended: Number.isFinite(parsedHackathonsAttended)
      ? String(parsedHackathonsAttended)
      : "0",
    teamCode: applicant.teamCode.trim(),
    teamSelectionMode: applicant.teamSelectionMode,
    newTeamName: applicant.newTeamName.trim(),
    newTeamDescription: applicant.newTeamDescription.trim(),
    newTeamMaxMembers: applicant.newTeamMaxMembers.trim(),
  }

  logFirebaseFetch("firestore:write:start", {
    collection: "applicants",
    operation: "setDoc",
    id: uid,
  })

  await setDoc(
    doc(firestoreDb, "applicants", uid),
    {
      uid,
      prename: normalizedApplicant.prename,
      surname: normalizedApplicant.surname,
      birthday: normalizedApplicant.birthday,
      gender: normalizedApplicant.gender,
      phoneNumber: normalizedApplicant.phoneNumber,
      nationality: normalizedApplicant.nationality,
      university: normalizedApplicant.university,
      currentCv: normalizedApplicant.currentCv,
      motivation: normalizedApplicant.motivation,
      programmingSkillLevel: normalizedApplicant.programmingSkillLevel,
      skills: normalizedGeneralSkills,
      hackathonsAttended: Number.parseInt(normalizedApplicant.hackathonsAttended, 10),
      teamCode: normalizedApplicant.teamCode,
      teamSelectionMode: normalizedApplicant.teamSelectionMode,
      newTeamName: normalizedApplicant.newTeamName,
      newTeamDescription: normalizedApplicant.newTeamDescription,
      newTeamMaxMembers: Number.parseInt(normalizedApplicant.newTeamMaxMembers || "2", 10),
      status: "submitted",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  logFirebaseFetch("firestore:write:success", {
    collection: "applicants",
    operation: "setDoc",
    id: uid,
  })
}
