import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts"
import {
  fetchApplicantFormData,
  fetchApplicantProfilesByIds,
  type ApplicantStatus,
} from "@/lib/applicants"
import { subscribeToParticipants, type Participant } from "@/lib/participants"
import {
  approvePendingMember,
  createPendingTeamFromApplication,
  declinePendingMember,
  joinPendingTeamByCode,
  kickPendingTeamMember,
  leavePendingTeam,
  subscribeToPendingTeamByCode,
  type PendingTeamRecord,
} from "@/lib/teams"
import type {
  ApplicationFormState,
  CreateTeamDraft,
  Step2Field,
} from "./ApplicationForm.types"
import {
  initialFormState,
  step1Fields,
  step2Fields,
  step3TeamFields,
  lockedAfterSubmitFields,
  isNonEmpty,
  normalizeFormState,
} from "./ApplicationForm.types"

export function useApplicationForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<ApplicationFormState>(initialFormState)
  const [error, setError] = useState("")
  const [isSyncingStep, setIsSyncingStep] = useState(false)
  const [isFinalizingStep3, setIsFinalizingStep3] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicantStatus, setApplicantStatus] = useState<ApplicantStatus>("started")
  const [isFormDataLoading, setIsFormDataLoading] = useState(true)
  const [managedPendingTeam, setManagedPendingTeam] = useState<PendingTeamRecord | null>(null)
  const [participantsById, setParticipantsById] = useState<Record<string, Participant>>({})
  const [applicantNamesById, setApplicantNamesById] = useState<Record<string, string>>({})
  const [applicantStatusesById, setApplicantStatusesById] = useState<Record<string, ApplicantStatus>>({})
  const [isUpdatingPendingMembers, setIsUpdatingPendingMembers] = useState(false)
  const [isLeavingTeam, setIsLeavingTeam] = useState(false)
  const hasInitializedFromApplicant = useRef(false)
  const lastPersistedFormRef = useRef<ApplicationFormState>(normalizeFormState(initialFormState))
  const {
    isAuthenticated,
    hasParticipantAccess,
    isParticipantLoading,
    submitApplication,
    syncApplicationDraft,
    logout,
    user,
  } = useAuth()
  const navigate = useNavigate()

  const isStep1Complete =
    isNonEmpty(form.prename) &&
    isNonEmpty(form.surname) &&
    isNonEmpty(form.birthday) &&
    isNonEmpty(form.gender) &&
    isNonEmpty(form.phoneNumber) &&
    isNonEmpty(form.nationality) &&
    isNonEmpty(form.university)

  const parsedHackathonsAttended = Number.parseInt(form.hackathonsAttended, 10)
  const isApplicationSubmitted = applicantStatus === "submitted"
  const hasValidHackathonsAttended =
    Number.isFinite(parsedHackathonsAttended) && parsedHackathonsAttended >= 0

  const isStep2Complete =
    isNonEmpty(form.currentCv) &&
    isNonEmpty(form.motivation) &&
    isNonEmpty(form.programmingSkillLevel) &&
    isNonEmpty(form.generalSkills) &&
    isNonEmpty(form.hackathonsAttended) &&
    hasValidHackathonsAttended

  const hasCreatedPendingTeam =
    form.teamSelectionMode === "create" &&
    isNonEmpty(form.teamCode)
  const hasTeamCode = isNonEmpty(form.teamCode)
  const activeUserId = user?.uid ?? ""
  const isManagedTeamMember =
    !!managedPendingTeam &&
    !!activeUserId &&
    managedPendingTeam.memberIds.includes(activeUserId)
  const isManagedTeamPendingMember =
    !!managedPendingTeam &&
    !!activeUserId &&
    managedPendingTeam.pendingMemberIds.includes(activeUserId)
  const isManagedTeamLeader =
    !!managedPendingTeam &&
    !!activeUserId &&
    managedPendingTeam.leaderId === activeUserId
  const shouldShowTeamCard = hasCreatedPendingTeam || isManagedTeamMember || isManagedTeamPendingMember
  const canLeaveManagedTeam =
    (isManagedTeamMember || isManagedTeamPendingMember) &&
    !isManagedTeamLeader &&
    !isApplicationSubmitted
  const shouldShowJoinedMemberSubmitAction =
    (isManagedTeamMember || isManagedTeamLeader) && !isApplicationSubmitted
  const teamMemberIdsForCard = managedPendingTeam?.memberIds ?? (activeUserId ? [activeUserId] : [])
  const hasMultipleTeamMembers = teamMemberIdsForCard.length > 1
  const allOtherTeamMembersSubmitted = teamMemberIdsForCard
    .filter((memberId) => memberId !== activeUserId)
    .every((memberId) => applicantStatusesById[memberId] === "submitted")
  const canSubmitApplication = isManagedTeamLeader ? (hasMultipleTeamMembers && allOtherTeamMembersSubmitted) : true
  const pendingMemberIdsForCard = managedPendingTeam?.pendingMemberIds ?? []
  const fallbackOwnName = `${form.prename.trim()} ${form.surname.trim()}`.trim()
  
  const resolveMemberName = (memberId: string): string => {
    const participantName = participantsById[memberId]?.name?.trim()
    if (participantName) {
      return participantName
    }

    const applicantName = applicantNamesById[memberId]?.trim()
    if (applicantName) {
      return applicantName
    }

    if (memberId === activeUserId && fallbackOwnName) {
      return fallbackOwnName
    }

    return memberId
  }

  const teamMemberNamesForCard = teamMemberIdsForCard.map((memberId) => {
    return resolveMemberName(memberId)
  })
  const teamMemberStatusesForCard = teamMemberIdsForCard.map((memberId) => {
    return applicantStatusesById[memberId] ?? "unknown"
  })
  const pendingMemberNamesForCard = pendingMemberIdsForCard.map((memberId) => resolveMemberName(memberId))

  useEffect(() => {
    const unsubscribe = subscribeToParticipants(
      (participants) => {
        const mappedParticipants = participants.reduce<Record<string, Participant>>((accumulator, participant) => {
          accumulator[participant.id] = participant
          return accumulator
        }, {})

        setParticipantsById(mappedParticipants)
      },
      () => {
        setParticipantsById({})
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const idsToResolve = [...new Set([...teamMemberIdsForCard, ...pendingMemberIdsForCard])].filter((memberId) => {
      if (!memberId) {
        return false
      }

      if (participantsById[memberId]?.name?.trim()) {
        return false
      }

      return !applicantNamesById[memberId]?.trim() || !applicantStatusesById[memberId]
    })

    if (idsToResolve.length === 0) {
      return
    }

    let isMounted = true

    fetchApplicantProfilesByIds(idsToResolve)
      .then((fetchedProfiles) => {
        if (
          !isMounted ||
          (Object.keys(fetchedProfiles.namesById).length === 0
            && Object.keys(fetchedProfiles.statusesById).length === 0)
        ) {
          return
        }

        if (Object.keys(fetchedProfiles.namesById).length > 0) {
          setApplicantNamesById((currentNames) => ({
            ...currentNames,
            ...fetchedProfiles.namesById,
          }))
        }

        if (Object.keys(fetchedProfiles.statusesById).length > 0) {
          setApplicantStatusesById((currentStatuses) => ({
            ...currentStatuses,
            ...fetchedProfiles.statusesById,
          }))
        }
      })
      .catch(() => {
        // Name lookup failures should not break the form; IDs remain visible as fallback.
      })

    return () => {
      isMounted = false
    }
  }, [teamMemberIdsForCard, pendingMemberIdsForCard, participantsById, applicantNamesById, applicantStatusesById])

  useEffect(() => {
    if (!hasTeamCode) {
      setManagedPendingTeam(null)
      return
    }

    const unsubscribe = subscribeToPendingTeamByCode(
      form.teamCode,
      (team) => {
        setManagedPendingTeam(team)
      },
      () => {
        setManagedPendingTeam(null)
      },
    )

    return () => unsubscribe()
  }, [hasTeamCode, form.teamCode])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      hasInitializedFromApplicant.current = false
      lastPersistedFormRef.current = normalizeFormState(initialFormState)
      setIsFormDataLoading(false)
      return
    }

    hasInitializedFromApplicant.current = false
    setIsFormDataLoading(true)

    let isMounted = true

    void fetchApplicantFormData(user.uid)
      .then((applicantFormData) => {
        if (!isMounted || hasInitializedFromApplicant.current) {
          return
        }

        const { status, ...applicantDraft } = applicantFormData

        setApplicantStatus(status)
        setForm((currentForm) => {
          const mergedForm = {
            ...currentForm,
            ...applicantDraft,
          }
          lastPersistedFormRef.current = normalizeFormState(mergedForm)
          return mergedForm
        })
        hasInitializedFromApplicant.current = true
      })
      .catch(() => {
        // Keep the initial empty form when the read fails; writes still work once the user retries.
      })
      .finally(() => {
        if (isMounted) {
          setIsFormDataLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || isParticipantLoading) {
      return
    }

    if (hasParticipantAccess) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, isParticipantLoading, hasParticipantAccess, navigate])

  const updateField = (field: keyof ApplicationFormState, value: string) => {
    if (isApplicationSubmitted && lockedAfterSubmitFields.includes(field)) {
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const hasChangesForFields = (fields: Array<keyof ApplicationFormState>): boolean => {
    const normalizedCurrent = normalizeFormState(form)
    const normalizedPersisted = lastPersistedFormRef.current

    return fields.some((field) => normalizedCurrent[field] !== normalizedPersisted[field])
  }

  const handleStep2FieldBlur = async (field: Step2Field) => {
    if (isApplicationSubmitted) {
      return
    }

    const normalizedCurrent = normalizeFormState(form)
    const normalizedPersisted = lastPersistedFormRef.current

    if (normalizedCurrent[field] === normalizedPersisted[field]) {
      return
    }

    const synced = await syncApplicationDraft({
      [field]: form[field],
    })

    if (!synced) {
      setError("Could not auto-save your latest field change.")
      return
    }

    lastPersistedFormRef.current = normalizedCurrent
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const handleApprovePendingMember = async (memberId: string) => {
    if (!managedPendingTeam) {
      return
    }

    setError("")
    setIsUpdatingPendingMembers(true)

    try {
      await approvePendingMember(managedPendingTeam.docId, memberId)
    } catch {
      setError("Could not approve pending member. Please try again.")
    } finally {
      setIsUpdatingPendingMembers(false)
    }
  }

  const handleDeclinePendingMember = async (memberId: string) => {
    if (!managedPendingTeam) {
      return
    }

    setError("")
    setIsUpdatingPendingMembers(true)

    try {
      await declinePendingMember(managedPendingTeam.docId, memberId)
    } catch {
      setError("Could not decline pending member. Please try again.")
    } finally {
      setIsUpdatingPendingMembers(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!managedPendingTeam || !activeUserId || !canLeaveManagedTeam) {
      return
    }

    setError("")
    setIsLeavingTeam(true)

    try {
      await leavePendingTeam(managedPendingTeam.docId, activeUserId)

      const clearedStep3Values = {
        teamCode: "",
        teamSelectionMode: "join" as const,
      }

      setForm((currentForm) => ({
        ...currentForm,
        ...clearedStep3Values,
      }))

      const synced = await syncApplicationDraft({
        teamCode: clearedStep3Values.teamCode,
        teamSelectionMode: clearedStep3Values.teamSelectionMode,
      })
      if (!synced) {
        setError("You left the team, but we could not update your saved application draft.")
      }

      lastPersistedFormRef.current = normalizeFormState({
        ...form,
        ...clearedStep3Values,
      })
    } catch {
      setError("Could not leave team. Please try again.")
    } finally {
      setIsLeavingTeam(false)
    }
  }

  const handleKickTeamMember = async (memberId: string) => {
    if (!managedPendingTeam || !isManagedTeamLeader) {
      return
    }

    if (!memberId || memberId === activeUserId) {
      return
    }

    setError("")
    setIsUpdatingPendingMembers(true)

    try {
      await kickPendingTeamMember(managedPendingTeam.docId, memberId)
    } catch {
      setError("Could not remove team member. Please try again.")
    } finally {
      setIsUpdatingPendingMembers(false)
    }
  }

  const validateStep1 = (): boolean => {
    setError("")

    if (!form.prename.trim()) {
      setError("Please enter your prename")
      return false
    }

    if (!form.surname.trim()) {
      setError("Please enter your surname")
      return false
    }

    if (!form.birthday.trim()) {
      setError("Please enter your birthday")
      return false
    }

    if (!form.gender.trim()) {
      setError("Please enter your gender")
      return false
    }

    if (!form.phoneNumber.trim()) {
      setError("Please enter your phone number")
      return false
    }

    if (!form.nationality.trim()) {
      setError("Please enter your nationality")
      return false
    }

    if (!form.university.trim()) {
      setError("Please enter your university")
      return false
    }

    return true
  }

  const validateStep2 = (): boolean => {
    setError("")

    if (!form.currentCv.trim()) {
      setError("Please provide your current CV")
      return false
    }

    if (!form.motivation.trim()) {
      setError("Please provide your motivation")
      return false
    }

    if (!form.programmingSkillLevel.trim()) {
      setError("Please provide your programming skill level")
      return false
    }

    if (!form.generalSkills.trim()) {
      setError("Please provide your general skills")
      return false
    }

    if (!form.hackathonsAttended.trim()) {
      setError("Please provide number of hackathons attended")
      return false
    }

    const parsedHackathons = Number.parseInt(form.hackathonsAttended, 10)
    if (!Number.isFinite(parsedHackathons) || parsedHackathons < 0) {
      setError("Hackathons attended must be a number of 0 or greater")
      return false
    }

    return true
  }

  const handleNextFromStep1 = async () => {
    if (!validateStep1()) {
      return
    }

    if (!hasChangesForFields(step1Fields)) {
      setStep(2)
      return
    }

    setIsSyncingStep(true)
    const synced = await syncApplicationDraft({
      prename: form.prename,
      surname: form.surname,
      birthday: form.birthday,
      gender: form.gender,
      phoneNumber: form.phoneNumber,
      nationality: form.nationality,
      university: form.university,
    })
    setIsSyncingStep(false)

    if (!synced) {
      setError("Could not save step 1. Please try again.")
      return
    }

    lastPersistedFormRef.current = normalizeFormState(form)

    setStep(2)
  }

  const handleStepNavigation = async (targetStep: 1 | 2 | 3) => {
    if (targetStep === step) {
      return
    }

    if (targetStep === 1) {
      setStep(1)
      return
    }

    if (targetStep === 2) {
      if (step === 1) {
        await handleNextFromStep1()
        return
      }

      setStep(2)
      return
    }

    if (step === 2) {
      await handleSubmitStep2()
      return
    }

    if (step === 3) {
      setStep(3)
    }
  }

  const handleSubmitStep2 = async () => {
    if (!validateStep2()) {
      return
    }

    if (!hasChangesForFields(step2Fields)) {
      setStep(3)
      return
    }

    setIsSubmitting(true)
    const synced = await syncApplicationDraft({
      currentCv: form.currentCv,
      motivation: form.motivation,
      programmingSkillLevel: form.programmingSkillLevel,
      generalSkills: form.generalSkills,
      hackathonsAttended: form.hackathonsAttended,
    })
    setIsSubmitting(false)

    if (!synced) {
      setError("Could not save step 2. Please try again.")
      return
    }

    lastPersistedFormRef.current = normalizeFormState(form)

    setStep(3)
  }

  const handleSubmitApplicationAsTeamMember = async () => {
    setError("")
    setIsSubmitting(true)
    const submitted = await submitApplication(form)
    setIsSubmitting(false)

    if (!submitted) {
      setError("Could not submit application. Please try again.")
      return
    }

    setApplicantStatus("submitted")

    if (activeUserId) {
      setApplicantStatusesById((currentStatuses) => ({
        ...currentStatuses,
        [activeUserId]: "submitted",
      }))
    }
  }

  const handleCompleteStep3 = async (
    mode: "join" | "create" | "skip",
    createTeamDraft?: CreateTeamDraft,
  ) => {
    setError("")

    if (mode === "join" && !form.teamCode.trim()) {
      setError("Please enter a team code or proceed without a team.")
      return
    }

    if (mode === "create" && !createTeamDraft?.name.trim()) {
      setError("Please enter a team name or proceed without a team.")
      return
    }

    if (mode === "create" && !createTeamDraft?.description.trim()) {
      setError("Please enter a team description or proceed without a team.")
      return
    }

    if (mode === "create") {
      const parsedMaxMembers = Number.parseInt(createTeamDraft?.maxMembers ?? "", 10)
      if (!Number.isFinite(parsedMaxMembers) || parsedMaxMembers < 2 || parsedMaxMembers > 4) {
        setError("Max members must be a number between 2 and 4.")
        return
      }
    }

    const nextTeamCode = mode === "join" ? form.teamCode.trim() : ""
    const nextNewTeamName = mode === "create" ? (createTeamDraft?.name ?? "").trim() : ""
    const nextNewTeamDescription = mode === "create" ? (createTeamDraft?.description ?? "").trim() : ""
    const nextNewTeamMaxMembers = mode === "create" ? (createTeamDraft?.maxMembers ?? "").trim() : ""

    if (mode !== "join" && form.teamCode !== "") {
      setForm((currentForm) => ({
        ...currentForm,
        teamCode: "",
      }))
    }

    if (form.teamSelectionMode !== mode) {
      setForm((currentForm) => ({
        ...currentForm,
        teamSelectionMode: mode,
      }))
    }

    const normalizedCurrent = normalizeFormState({
      ...form,
      teamCode: nextTeamCode,
      teamSelectionMode: mode,
    })

    if (
      !hasChangesForFields(step3TeamFields) &&
      normalizedCurrent.teamCode === lastPersistedFormRef.current.teamCode &&
      normalizedCurrent.teamSelectionMode === lastPersistedFormRef.current.teamSelectionMode
    ) {
      return
    }

    setIsFinalizingStep3(true)

    if (mode === "join") {
      const activeUserId = user?.uid
      if (!activeUserId) {
        setIsFinalizingStep3(false)
        setError("Could not determine current user for team join.")
        return
      }

      try {
        const joined = await joinPendingTeamByCode(nextTeamCode, activeUserId)
        if (!joined) {
          setIsFinalizingStep3(false)
          setError("No pending team found for this team code.")
          return
        }
      } catch {
        setIsFinalizingStep3(false)
        setError("Could not join team. Please try again.")
        return
      }
    }

    if (mode === "create") {
      const activeUserId = user?.uid
      if (!activeUserId) {
        setIsFinalizingStep3(false)
        setError("Could not determine current user for team creation.")
        return
      }

      const parsedMaxMembers = Number.parseInt(nextNewTeamMaxMembers || "", 10)

      try {
        const result = await createPendingTeamFromApplication(
          activeUserId,
          nextNewTeamName,
          nextNewTeamDescription,
          parsedMaxMembers,
        )

        if (!nextTeamCode && result.teamCode) {
          normalizedCurrent.teamCode = result.teamCode
        }

        setForm((currentForm) => ({
          ...currentForm,
          teamSelectionMode: "create",
          teamCode: normalizedCurrent.teamCode,
        }))
      } catch {
        setIsFinalizingStep3(false)
        setError("Could not create team. Please try again.")
        return
      }
    }

    const synced = await syncApplicationDraft({
      teamCode: normalizedCurrent.teamCode,
      teamSelectionMode: mode,
    })
    setIsFinalizingStep3(false)

    if (!synced) {
      setError("Could not save step 3. Please try again.")
      return
    }

    lastPersistedFormRef.current = normalizedCurrent
  }

  return {
    step,
    setStep,
    form,
    setForm,
    error,
    setError,
    isSyncingStep,
    isFinalizingStep3,
    isLoggingOut,
    isSubmitting,
    applicantStatus,
    isFormDataLoading,
    managedPendingTeam,
    participantsById,
    applicantNamesById,
    applicantStatusesById,
    isUpdatingPendingMembers,
    isLeavingTeam,
    lastPersistedFormRef,
    
    // Derived values
    isStep1Complete,
    isStep2Complete,
    isApplicationSubmitted,
    hasCreatedPendingTeam,
    hasTeamCode,
    activeUserId,
    isManagedTeamMember,
    isManagedTeamPendingMember,
    isManagedTeamLeader,
    shouldShowTeamCard,
    canLeaveManagedTeam,
    shouldShowJoinedMemberSubmitAction,
    teamMemberIdsForCard,
    hasMultipleTeamMembers,
    allOtherTeamMembersSubmitted,
    canSubmitApplication,
    pendingMemberIdsForCard,
    teamMemberNamesForCard,
    teamMemberStatusesForCard,
    pendingMemberNamesForCard,
    
    // Handlers
    updateField,
    handleLogout,
    handleApprovePendingMember,
    handleDeclinePendingMember,
    handleLeaveTeam,
    handleKickTeamMember,
    validateStep1,
    validateStep2,
    handleNextFromStep1,
    handleStepNavigation,
    handleSubmitStep2,
    handleSubmitApplicationAsTeamMember,
    handleCompleteStep3,
    handleStep2FieldBlur,
  }
}
