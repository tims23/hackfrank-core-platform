export type ApplicantStatus = "STARTED" | "SUBMITTED"

export const APPLICANT_STATUS_STARTED: ApplicantStatus = "STARTED"
export const APPLICANT_STATUS_SUBMITTED: ApplicantStatus = "SUBMITTED"

export const DEFAULT_APPLICANT_STATUS: ApplicantStatus = APPLICANT_STATUS_STARTED

const applicantStatuses = [APPLICANT_STATUS_STARTED, APPLICANT_STATUS_SUBMITTED] as const

export const isApplicantStatus = (value: unknown): value is ApplicantStatus =>
  typeof value === "string" && (applicantStatuses as readonly string[]).includes(value)

export const normalizeApplicantStatus = (
  value: unknown,
  fallback: ApplicantStatus = DEFAULT_APPLICANT_STATUS,
): ApplicantStatus => (isApplicantStatus(value) ? value : fallback)

export type TeamSelectionMode = "JOIN" | "CREATE" | "INDIVIDUAL"

export const TEAM_SELECTION_MODE_JOIN: TeamSelectionMode = "JOIN"
export const TEAM_SELECTION_MODE_CREATE: TeamSelectionMode = "CREATE"
export const TEAM_SELECTION_MODE_INDIVIDUAL: TeamSelectionMode = "INDIVIDUAL"

export const DEFAULT_TEAM_SELECTION_MODE: TeamSelectionMode = TEAM_SELECTION_MODE_JOIN

const teamSelectionModes = [
  TEAM_SELECTION_MODE_JOIN,
  TEAM_SELECTION_MODE_CREATE,
  TEAM_SELECTION_MODE_INDIVIDUAL,
] as const

export const isTeamSelectionMode = (value: unknown): value is TeamSelectionMode =>
  typeof value === "string" && (teamSelectionModes as readonly string[]).includes(value)

export const normalizeTeamSelectionMode = (
  value: unknown,
  fallback: TeamSelectionMode = DEFAULT_TEAM_SELECTION_MODE,
): TeamSelectionMode => (isTeamSelectionMode(value) ? value : fallback)

export type TeamStatus = "INITIAL" | "APPLICATION_SUBMITTED"

export const TEAM_STATUS_INITIAL: TeamStatus = "INITIAL"
export const TEAM_STATUS_APPLICATION_SUBMITTED: TeamStatus = "APPLICATION_SUBMITTED"

export const DEFAULT_TEAM_STATUS: TeamStatus = TEAM_STATUS_INITIAL

const teamStatuses = [TEAM_STATUS_INITIAL, TEAM_STATUS_APPLICATION_SUBMITTED] as const

export const isTeamStatus = (value: unknown): value is TeamStatus =>
  typeof value === "string" && (teamStatuses as readonly string[]).includes(value)

export const normalizeTeamStatus = (
  value: unknown,
  fallback: TeamStatus = DEFAULT_TEAM_STATUS,
): TeamStatus => (isTeamStatus(value) ? value : fallback)

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
  teamSelectionMode: TeamSelectionMode
}

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
  generalSkills?: string
  skills?: string[]
  hackathonsAttended?: number | string
  teamCode?: string
  teamSelectionMode?: TeamSelectionMode
}

export type ApplicantProfileRecord = {
  prename?: string
  surname?: string
  nationality?: string
  university?: string
  generalSkills?: string
  skills?: string[]
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

export type SharedParticipantProfile = {
  uid: string
  prename: string
  surname: string
  fullName: string
  nationality: string
  university: string
  generalSkills: string
  status: ApplicantStatus
}