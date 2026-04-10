import type { ApplicantStatus } from "@/lib/applicants"
import type { Participant } from "@/lib/participants"
import type { PendingTeamRecord } from "@/lib/teams"

export type ApplicationFormState = {
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

export type CreateTeamDraft = {
  name: string
  description: string
  maxMembers: string
}

export type Step2Field =
  | "currentCv"
  | "motivation"
  | "programmingSkillLevel"
  | "generalSkills"
  | "hackathonsAttended"

export const initialFormState: ApplicationFormState = {
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
}

export const steps = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Application Data" },
  { id: 3, label: "Team Selection" },
] as const

export const isNonEmpty = (value: string) => value.trim().length > 0

export const step1Fields: Array<keyof ApplicationFormState> = [
  "prename",
  "surname",
  "birthday",
  "gender",
  "phoneNumber",
  "nationality",
  "university",
]

export const step2Fields: Array<keyof ApplicationFormState> = [
  "currentCv",
  "motivation",
  "programmingSkillLevel",
  "generalSkills",
  "hackathonsAttended",
]

export const lockedAfterSubmitFields: Array<keyof ApplicationFormState> = [...step1Fields, ...step2Fields]

export const step3TeamFields: Array<keyof ApplicationFormState> = [
  "teamCode",
  "teamSelectionMode",
]

export const normalizeFormState = (state: ApplicationFormState): ApplicationFormState => {
  const parsedHackathons = Number.parseInt(state.hackathonsAttended, 10)

  return {
    prename: state.prename.trim(),
    surname: state.surname.trim(),
    birthday: state.birthday.trim(),
    gender: state.gender.trim(),
    phoneNumber: state.phoneNumber.trim(),
    nationality: state.nationality.trim(),
    university: state.university.trim(),
    currentCv: state.currentCv.trim(),
    motivation: state.motivation.trim(),
    programmingSkillLevel: state.programmingSkillLevel.trim(),
    generalSkills: state.generalSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
      .join(", "),
    hackathonsAttended:
      state.hackathonsAttended.trim().length === 0
        ? ""
        : Number.isFinite(parsedHackathons)
          ? String(parsedHackathons)
          : state.hackathonsAttended.trim(),
    teamCode: state.teamCode.trim(),
    teamSelectionMode: state.teamSelectionMode,
  }
}

export type ApplicationFormContextType = {
  step: 1 | 2 | 3
  setStep: (step: 1 | 2 | 3) => void
  form: ApplicationFormState
  setForm: (form: ApplicationFormState | ((prev: ApplicationFormState) => ApplicationFormState)) => void
  error: string
  setError: (error: string) => void
  isSyncingStep: boolean
  isFinalizingStep3: boolean
  isLoggingOut: boolean
  isSubmitting: boolean
  applicantStatus: ApplicantStatus
  isFormDataLoading: boolean
  managedPendingTeam: PendingTeamRecord | null
  participantsById: Record<string, Participant>
  applicantNamesById: Record<string, string>
  applicantStatusesById: Record<string, ApplicantStatus>
  isUpdatingPendingMembers: boolean
  isLeavingTeam: boolean
  lastPersistedFormRef: React.MutableRefObject<ApplicationFormState>
  
  // Derived values
  isStep1Complete: boolean
  isStep2Complete: boolean
  isApplicationSubmitted: boolean
  hasCreatedPendingTeam: boolean
  hasTeamCode: boolean
  activeUserId: string
  isManagedTeamMember: boolean
  isManagedTeamLeader: boolean
  shouldShowTeamCard: boolean
  canLeaveManagedTeam: boolean
  shouldShowJoinedMemberSubmitAction: boolean
  teamMemberIdsForCard: string[]
  hasMultipleTeamMembers: boolean
  allOtherTeamMembersSubmitted: boolean
  canSubmitApplication: boolean
  pendingMemberIdsForCard: string[]
  teamMemberNamesForCard: string[]
  teamMemberStatusesForCard: ApplicantStatus[]
  pendingMemberNamesForCard: string[]
  
  // Handlers
  updateField: (field: keyof ApplicationFormState, value: string) => void
  handleLogout: () => Promise<void>
  handleApprovePendingMember: (memberId: string) => Promise<void>
  handleDeclinePendingMember: (memberId: string) => Promise<void>
  handleLeaveTeam: () => Promise<void>
  handleKickTeamMember: (memberId: string) => Promise<void>
  validateStep1: () => boolean
  validateStep2: () => boolean
  handleNextFromStep1: () => Promise<void>
  handleStepNavigation: (targetStep: 1 | 2 | 3) => Promise<void>
  handleSubmitStep2: () => Promise<void>
  handleSubmitApplicationAsTeamMember: () => Promise<void>
  handleCompleteStep3: (mode: "join" | "create" | "skip", createTeamDraft?: CreateTeamDraft) => Promise<void>
  handleStep2FieldBlur: (field: Step2Field) => Promise<void>
}
