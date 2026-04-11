import { doc, onSnapshot } from "firebase/firestore"
import { firestoreDb, logFirebaseFetch } from "@/lib/firebase"
import { apiCall, apiGet } from "@/lib/api"

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
  teamSelectionMode?: "join" | "create" | "INDIVIDUAL"
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
  teamSelectionMode: "join" | "create" | "INDIVIDUAL"
}

export type ApplicantFormResponse = {
  success: boolean
  application: (Partial<ApplicantFormInput> & { status: ApplicantStatus; skills?: string[] }) | null
}

export type ApplicantProfileLookupResult = {
  namesById: Record<string, string>
  statusesById: Record<string, ApplicantStatus>
}

export const fetchApplicantFormData = async (
  uid: string,
): Promise<Partial<ApplicantFormInput> & { status: ApplicantStatus }> => {
  logFirebaseFetch("api:read:start", {
    endpoint: "/api/applicants",
    action: "fetch",
    id: uid,
  })

  const result = await apiGet<ApplicantFormResponse>("/api/applicants")

  logFirebaseFetch("api:read:success", {
    endpoint: "/api/applicants",
    action: "fetch",
    id: uid,
    hasApplication: result.application !== null,
  })

  const application = result.application ?? null

  return {
    status: application?.status === "submitted" ? "submitted" : "started",
    prename: application?.prename ?? "",
    surname: application?.surname ?? "",
    birthday: application?.birthday ?? "",
    gender: application?.gender ?? "",
    phoneNumber: application?.phoneNumber ?? "",
    nationality: application?.nationality ?? "",
    university: application?.university ?? "",
    currentCv: application?.currentCv ?? "",
    motivation: application?.motivation ?? "",
    programmingSkillLevel: application?.programmingSkillLevel ?? "",
    generalSkills: application?.generalSkills ?? application?.skills?.join(", ") ?? "",
    hackathonsAttended:
      application?.hackathonsAttended !== undefined ? String(application.hackathonsAttended) : "",
    teamCode: application?.teamCode ?? "",
    teamSelectionMode: normalizeTeamSelectionMode(application?.teamSelectionMode),
  }
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

const getParticipantApplicationDocRef = (uid: string) =>
  doc(firestoreDb, "participants", uid, "details", "application")

const normalizeTeamSelectionMode = (value: unknown): "join" | "create" | "INDIVIDUAL" => {
  if (value === "create") {
    return "create"
  }

  if (value === "INDIVIDUAL") {
    return "INDIVIDUAL"
  }

  return "join"
}

type SharedParticipantProfileResponse = {
  success: boolean
  profile: {
    uid: string
    prename: string
    surname: string
    status: ApplicantStatus
  }
}

type ApplicantProfileData = {
  prename?: string
  surname?: string
}

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
    logFirebaseFetch("api:read:start", {
      endpoint: "/api/participants",
      idCount: idsChunk.length,
      mode: "member-name-lookup",
    })

    const profileResults = await Promise.allSettled(
      idsChunk.map(async (applicantId) => {
        logFirebaseFetch("api:read:start", {
          endpoint: "/api/participants",
          id: applicantId,
          mode: "member-name-lookup",
        })

        const result = await apiGet<SharedParticipantProfileResponse>(
          `/api/participants?uid=${encodeURIComponent(applicantId)}`,
        )

        logFirebaseFetch("api:read:success", {
          endpoint: "/api/participants",
          id: applicantId,
          hasProfile: Boolean(result.profile),
          mode: "member-name-lookup",
        })

        const profileData: ApplicantProfileData | undefined = result.profile
          ? {
              prename: result.profile.prename,
              surname: result.profile.surname,
            }
          : undefined
        const applicationData: Partial<ApplicantRecord> | undefined = result.profile
          ? {
              status: result.profile.status,
            }
          : undefined

        return {
          applicantId,
          profileData,
          applicationData,
        }
      }),
    )

    for (const profileResult of profileResults) {
      if (profileResult.status === "rejected") {
        logFirebaseFetch("getDoc:error", {
          collection: "participants/details",
          mode: "member-name-lookup",
          message: profileResult.reason instanceof Error ? profileResult.reason.message : String(profileResult.reason),
        })
        continue
      }

      const value = profileResult.value
      if (!value) {
        continue
      }

      const { applicantId, profileData, applicationData } = value
      const prename = readApplicantString(profileData?.prename ?? applicationData?.prename).trim()
      const surname = readApplicantString(profileData?.surname ?? applicationData?.surname).trim()
      const fullName = `${prename} ${surname}`.trim()
      const applicantStatus: ApplicantStatus =
        applicationData?.status === "submitted" ? "submitted" : "started"

      if (fullName.length > 0) {
        namesById[applicantId] = fullName
      }

      statusesById[applicantId] = applicantStatus
    }

    logFirebaseFetch("api:read:success", {
      endpoint: "/api/participants",
      idCount: idsChunk.length,
      mode: "member-name-lookup",
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
    collection: "participants/details",
    id: uid,
  })

  return onSnapshot(
    getParticipantApplicationDocRef(uid),
    (snapshot) => {
      const data = snapshot.data() as Partial<ApplicantRecord> | undefined

      logFirebaseFetch("onSnapshot:update", {
        collection: "participants/details",
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
        teamSelectionMode: normalizeTeamSelectionMode(data.teamSelectionMode),
      })
    },
    (snapshotError) => {
      logFirebaseFetch("onSnapshot:error", {
        collection: "participants/details",
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
  logFirebaseFetch("api:write:start", {
    endpoint: "/api/applicants",
    action: "create",
    id: uid,
  })

  const result = await apiCall<{ success: boolean }>("/api/applicants", "create", {})

  logFirebaseFetch("api:write:success", {
    endpoint: "/api/applicants",
    action: "create",
    id: uid,
    success: result.success,
  })
}

export const syncApplicantDraft = async (
  uid: string,
  applicationDraft: Partial<ApplicantFormInput>,
): Promise<void> => {
  const payload: Record<string, unknown> = {}

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
    payload.generalSkills = (applicationDraft.generalSkills ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
      .join(", ")
  }
  if ("hackathonsAttended" in applicationDraft) {
    const parsedHackathonsAttended = Number.parseInt(applicationDraft.hackathonsAttended ?? "", 10)
    payload.hackathonsAttended = Number.isFinite(parsedHackathonsAttended)
      ? String(Math.max(0, parsedHackathonsAttended))
      : ""
  }
  if ("teamCode" in applicationDraft) {
    payload.teamCode = (applicationDraft.teamCode ?? "").trim()
  }
  if ("teamSelectionMode" in applicationDraft) {
    payload.teamSelectionMode = applicationDraft.teamSelectionMode ?? "join"
  }

  logFirebaseFetch("api:write:start", {
    endpoint: "/api/applicants",
    action: "sync-draft",
    id: uid,
  })

  await apiCall<{ success: boolean }>("/api/applicants", "sync-draft", payload)

  logFirebaseFetch("api:write:success", {
    endpoint: "/api/applicants",
    action: "sync-draft",
    id: uid,
  })
}

export const submitApplicantForm = async (uid: string, applicant: ApplicantFormInput): Promise<void> => {
  const normalizedApplicant = {
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
    generalSkills: applicant.generalSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
      .join(", "),
    hackathonsAttended: applicant.hackathonsAttended.trim(),
    teamCode: applicant.teamCode.trim(),
    teamSelectionMode: applicant.teamSelectionMode,
  }

  logFirebaseFetch("api:write:start", {
    endpoint: "/api/applicants",
    action: "submit",
    id: uid,
  })

  await apiCall<{ success: boolean }>("/api/applicants", "submit", normalizedApplicant)

  logFirebaseFetch("api:write:success", {
    endpoint: "/api/applicants",
    action: "submit",
    id: uid,
  })
}
