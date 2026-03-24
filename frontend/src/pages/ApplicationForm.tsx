import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Input, Textarea } from "@/components/ui"
import { MyTeamCard } from "@/components/team/MyTeamCard"
import { useAuth } from "@/contexts"
import { subscribeToApplicantFormData } from "@/lib/applicants"
import {
  approvePendingMember,
  createPendingTeamFromApplication,
  declinePendingMember,
  joinPendingTeamByCode,
  subscribeToPendingTeamByCode,
  type PendingTeamRecord,
} from "@/lib/teams"
import { Sparkles } from "lucide-react"

type ApplicationFormState = {
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

type Step2Field =
  | "currentCv"
  | "motivation"
  | "programmingSkillLevel"
  | "generalSkills"
  | "hackathonsAttended"

const initialFormState: ApplicationFormState = {
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
}

const steps = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Application Data" },
  { id: 3, label: "Team Selection" },
] as const

const isNonEmpty = (value: string) => value.trim().length > 0

const step1Fields: Array<keyof ApplicationFormState> = [
  "prename",
  "surname",
  "birthday",
  "gender",
  "phoneNumber",
  "nationality",
  "university",
]

const step2Fields: Array<keyof ApplicationFormState> = [
  "currentCv",
  "motivation",
  "programmingSkillLevel",
  "generalSkills",
  "hackathonsAttended",
]

const step3TeamFields: Array<keyof ApplicationFormState> = [
  "teamCode",
  "teamSelectionMode",
  "newTeamName",
  "newTeamDescription",
  "newTeamMaxMembers",
]

const normalizeFormState = (state: ApplicationFormState): ApplicationFormState => {
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
    newTeamName: state.newTeamName.trim(),
    newTeamDescription: state.newTeamDescription.trim(),
    newTeamMaxMembers:
      state.newTeamMaxMembers.trim().length === 0
        ? ""
        : Number.isFinite(Number.parseInt(state.newTeamMaxMembers, 10))
          ? String(Math.max(2, Math.min(4, Number.parseInt(state.newTeamMaxMembers, 10))))
          : state.newTeamMaxMembers.trim(),
  }
}

export function ApplicationForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<ApplicationFormState>(initialFormState)
  const [error, setError] = useState("")
  const [isSyncingStep, setIsSyncingStep] = useState(false)
  const [isFinalizingStep3, setIsFinalizingStep3] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormDataLoading, setIsFormDataLoading] = useState(true)
  const [managedPendingTeam, setManagedPendingTeam] = useState<PendingTeamRecord | null>(null)
  const [isUpdatingPendingMembers, setIsUpdatingPendingMembers] = useState(false)
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
  const hasValidHackathonsAttended =
    Number.isFinite(parsedHackathonsAttended) && parsedHackathonsAttended >= 0

  const isStep2Complete =
    isNonEmpty(form.currentCv) &&
    isNonEmpty(form.motivation) &&
    isNonEmpty(form.programmingSkillLevel) &&
    isNonEmpty(form.generalSkills) &&
    isNonEmpty(form.hackathonsAttended) &&
    hasValidHackathonsAttended

  const parsedNewTeamMaxMembers = Number.parseInt(form.newTeamMaxMembers, 10)
  const hasCreatedPendingTeam =
    form.teamSelectionMode === "create" &&
    isNonEmpty(form.newTeamName) &&
    isNonEmpty(form.teamCode) &&
    Number.isFinite(parsedNewTeamMaxMembers)
  const hasTeamCode = isNonEmpty(form.teamCode)
  const activeUserId = user?.uid ?? ""
  const isManagedTeamMember =
    !!managedPendingTeam &&
    !!activeUserId &&
    managedPendingTeam.memberIds.includes(activeUserId)
  const isManagedTeamLeader =
    !!managedPendingTeam &&
    !!activeUserId &&
    managedPendingTeam.leaderId === activeUserId
  const shouldShowTeamCard = hasCreatedPendingTeam || isManagedTeamMember

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

    const unsubscribe = subscribeToApplicantFormData(
      user.uid,
      (applicantFormData) => {
        if (!hasInitializedFromApplicant.current) {
          setForm((currentForm) => {
            const mergedForm = {
              ...currentForm,
              ...applicantFormData,
            }
            lastPersistedFormRef.current = normalizeFormState(mergedForm)
            return mergedForm
          })
          hasInitializedFromApplicant.current = true
        }

        setIsFormDataLoading(false)
      },
      () => {
        setIsFormDataLoading(false)
      },
    )

    return () => unsubscribe()
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
    const submitted = await submitApplication(form)
    setIsSubmitting(false)

    if (!submitted) {
      setError("Could not submit application form. Please try again.")
      return
    }

    lastPersistedFormRef.current = normalizeFormState(form)

    setStep(3)
  }

  const handleCompleteStep3 = async (mode: "join" | "create" | "skip") => {
    setError("")

    if (mode === "join" && !form.teamCode.trim()) {
      setError("Please enter a team code or proceed without a team.")
      return
    }

    if (mode === "create" && !form.newTeamName.trim()) {
      setError("Please enter a team name or proceed without a team.")
      return
    }

    if (mode === "create" && !form.newTeamDescription.trim()) {
      setError("Please enter a team description or proceed without a team.")
      return
    }

    if (mode === "create") {
      const parsedMaxMembers = Number.parseInt(form.newTeamMaxMembers, 10)
      if (!Number.isFinite(parsedMaxMembers) || parsedMaxMembers < 2 || parsedMaxMembers > 4) {
        setError("Max members must be a number between 2 and 4.")
        return
      }
    }

    const nextTeamCode = mode === "join" ? form.teamCode.trim() : ""
    const nextNewTeamName = mode === "create" ? form.newTeamName.trim() : ""
    const nextNewTeamDescription = mode === "create" ? form.newTeamDescription.trim() : ""
    const nextNewTeamMaxMembers = mode === "create" ? form.newTeamMaxMembers.trim() : ""

    if (mode !== "join" && form.teamCode !== "") {
      setForm((currentForm) => ({
        ...currentForm,
        teamCode: "",
      }))
    }

    if (mode !== "create" && form.newTeamName !== "") {
      setForm((currentForm) => ({
        ...currentForm,
        newTeamName: "",
        newTeamDescription: "",
        newTeamMaxMembers: "",
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
      newTeamName: nextNewTeamName,
      newTeamDescription: nextNewTeamDescription,
      newTeamMaxMembers: nextNewTeamMaxMembers,
      teamSelectionMode: mode,
    })

    if (
      !hasChangesForFields(step3TeamFields) &&
      normalizedCurrent.teamCode === lastPersistedFormRef.current.teamCode &&
      normalizedCurrent.newTeamName === lastPersistedFormRef.current.newTeamName &&
      normalizedCurrent.newTeamDescription === lastPersistedFormRef.current.newTeamDescription &&
      normalizedCurrent.newTeamMaxMembers === lastPersistedFormRef.current.newTeamMaxMembers &&
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
          newTeamName: nextNewTeamName,
          newTeamDescription: nextNewTeamDescription,
          newTeamMaxMembers: nextNewTeamMaxMembers,
        }))
      } catch {
        setIsFinalizingStep3(false)
        setError("Could not create team. Please try again.")
        return
      }
    }

    const synced = await syncApplicationDraft({
      teamCode: normalizedCurrent.teamCode,
      newTeamName: nextNewTeamName,
      newTeamDescription: nextNewTeamDescription,
      newTeamMaxMembers: nextNewTeamMaxMembers,
      teamSelectionMode: mode,
    })
    setIsFinalizingStep3(false)

    if (!synced) {
      setError("Could not save step 3. Please try again.")
      return
    }

    lastPersistedFormRef.current = normalizedCurrent
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">
            Hack<span className="text-brand-cyan">Frank</span>
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-cyan/10 border border-brand-cyan/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-xs font-medium text-brand-cyan">Hackathon 2026</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-8 animate-slide-up stagger-1">
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Application Form</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Complete your details to submit your application.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {steps.map((currentStep) => {
              const isActive = step === currentStep.id
              const isCompleted = step > currentStep.id
              const canNavigateToStep2 = step >= 2 || isStep1Complete
              const canNavigateToStep3 = step >= 3 || (step === 2 && isStep2Complete)
              const isDisabled =
                isSyncingStep ||
                isSubmitting ||
                (currentStep.id === 2 && !canNavigateToStep2) ||
                (currentStep.id === 3 && !canNavigateToStep3)

              return (
                <button
                  key={currentStep.id}
                  type="button"
                  onClick={() => handleStepNavigation(currentStep.id)}
                  disabled={isDisabled}
                  className={`text-xs px-3 py-2 rounded border whitespace-normal leading-tight ${
                    isActive
                      ? "border-brand-cyan text-brand-cyan"
                      : isCompleted
                        ? "border-green-500 text-green-400"
                        : "border-border text-muted-foreground"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Step {currentStep.id}: {currentStep.label}
                </button>
              )
            })}
          </div>

          <div className="mb-4 text-center">
            <Button type="button" variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Log Out to Login"}
            </Button>
          </div>

          {isFormDataLoading && (
            <p className="text-xs text-muted-foreground mb-4 text-center">Loading your saved data...</p>
          )}

          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Prename</label>
                  <Input
                    type="text"
                    value={form.prename}
                    onChange={(event) => updateField("prename", event.target.value)}
                    placeholder="Your first name"
                    className="w-full"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Surname</label>
                  <Input
                    type="text"
                    value={form.surname}
                    onChange={(event) => updateField("surname", event.target.value)}
                    placeholder="Your last name"
                    className="w-full"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Birthday</label>
                  <Input
                    type="date"
                    value={form.birthday}
                    onChange={(event) => updateField("birthday", event.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                  <Input
                    type="text"
                    value={form.gender}
                    onChange={(event) => updateField("gender", event.target.value)}
                    placeholder="Your gender"
                    className="w-full"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                  <Input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(event) => updateField("phoneNumber", event.target.value)}
                    placeholder="+49 ..."
                    className="w-full"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nationality</label>
                  <Input
                    type="text"
                    value={form.nationality}
                    onChange={(event) => updateField("nationality", event.target.value)}
                    placeholder="Your nationality"
                    className="w-full"
                    maxLength={60}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">University</label>
                  <Input
                    type="text"
                    value={form.university}
                    onChange={(event) => updateField("university", event.target.value)}
                    placeholder="Your university"
                    className="w-full"
                    maxLength={120}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Current CV</label>
                  <Input
                    type="text"
                    value={form.currentCv}
                    onChange={(event) => updateField("currentCv", event.target.value)}
                    onBlur={() => handleStep2FieldBlur("currentCv")}
                    placeholder="Link or reference to your CV"
                    className="w-full"
                    maxLength={250}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Motivation</label>
                  <Textarea
                    value={form.motivation}
                    onChange={(event) => updateField("motivation", event.target.value)}
                    onBlur={() => handleStep2FieldBlur("motivation")}
                    placeholder="Tell us why you want to join"
                    className="w-full"
                    maxLength={1500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Programming Skill Level
                  </label>
                  <Input
                    type="text"
                    value={form.programmingSkillLevel}
                    onChange={(event) => updateField("programmingSkillLevel", event.target.value)}
                    onBlur={() => handleStep2FieldBlur("programmingSkillLevel")}
                    placeholder="Beginner, Intermediate, Advanced"
                    className="w-full"
                    maxLength={80}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">General Skills</label>
                  <Input
                    type="text"
                    value={form.generalSkills}
                    onChange={(event) => updateField("generalSkills", event.target.value)}
                    onBlur={() => handleStep2FieldBlur("generalSkills")}
                    placeholder="React, Python, Design Thinking"
                    className="w-full"
                    maxLength={300}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Hackathons Attended So Far
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.hackathonsAttended}
                    onChange={(event) => updateField("hackathonsAttended", event.target.value)}
                    onBlur={() => handleStep2FieldBlur("hackathonsAttended")}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {shouldShowTeamCard ? (
                  <MyTeamCard
                    teamName={managedPendingTeam?.name || form.newTeamName}
                    description={managedPendingTeam?.description || form.newTeamDescription}
                    maxMembers={managedPendingTeam?.maxMembers || Math.max(2, Math.min(4, parsedNewTeamMaxMembers || 2))}
                    memberCount={managedPendingTeam?.memberIds.length || 1}
                    status={managedPendingTeam?.status || "APPLICATION_PENDING"}
                    teamCode={managedPendingTeam?.teamCode || form.teamCode}
                    showPendingMembers={isManagedTeamLeader || (hasCreatedPendingTeam && !managedPendingTeam)}
                    pendingMemberIds={managedPendingTeam?.pendingMemberIds || []}
                    onApprovePendingMember={handleApprovePendingMember}
                    onDeclinePendingMember={handleDeclinePendingMember}
                    isUpdatingPendingMembers={isUpdatingPendingMembers}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Team Code (Optional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <Button
                        type="button"
                        variant={form.teamSelectionMode === "join" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => updateField("teamSelectionMode", "join")}
                      >
                        Join Existing Team
                      </Button>
                      <Button
                        type="button"
                        variant={form.teamSelectionMode === "create" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => updateField("teamSelectionMode", "create")}
                      >
                        Create New Team
                      </Button>
                    </div>

                    {form.teamSelectionMode === "join" && (
                      <Input
                        type="text"
                        value={form.teamCode}
                        onChange={(event) => updateField("teamCode", event.target.value)}
                        placeholder="Enter team code"
                        className="w-full"
                        maxLength={40}
                      />
                    )}

                    {form.teamSelectionMode === "create" && (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          value={form.newTeamName}
                          onChange={(event) => updateField("newTeamName", event.target.value)}
                          placeholder="Enter new team name"
                          className="w-full"
                          maxLength={80}
                        />

                        <Textarea
                          value={form.newTeamDescription}
                          onChange={(event) => updateField("newTeamDescription", event.target.value)}
                          placeholder="Describe your team focus"
                          className="w-full"
                          maxLength={600}
                        />

                        <Input
                          type="number"
                          min={2}
                          max={4}
                          value={form.newTeamMaxMembers}
                          onChange={(event) => updateField("newTeamMaxMembers", event.target.value)}
                          placeholder="Max members (2-4)"
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {step > 1 && (
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
                  Back
                </Button>
              )}

              {step === 1 && (
                <Button
                  type="button"
                  className="w-full md:col-span-2"
                  disabled={!isStep1Complete || isSyncingStep}
                  onClick={handleNextFromStep1}
                >
                  {isSyncingStep ? "Saving step 1..." : "Continue to Step 2"}
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="button"
                  className="w-full md:col-span-2"
                  disabled={isSubmitting || !isStep2Complete}
                  onClick={handleSubmitStep2}
                >
                  {isSubmitting ? "Saving application..." : "Continue to Step 3"}
                </Button>
              )}

              {step === 3 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isFinalizingStep3 || hasCreatedPendingTeam}
                    onClick={() => handleCompleteStep3("skip")}
                  >
                    {isFinalizingStep3 ? "Saving..." : "Proceed Without Team"}
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    disabled={
                      hasCreatedPendingTeam ||
                      isFinalizingStep3 ||
                      (form.teamSelectionMode === "join" && !isNonEmpty(form.teamCode)) ||
                      (form.teamSelectionMode === "create" &&
                        (!isNonEmpty(form.newTeamName) ||
                          !isNonEmpty(form.newTeamDescription) ||
                          !Number.isFinite(Number.parseInt(form.newTeamMaxMembers, 10)) ||
                          Number.parseInt(form.newTeamMaxMembers, 10) < 2 ||
                          Number.parseInt(form.newTeamMaxMembers, 10) > 4))
                    }
                    onClick={() => handleCompleteStep3(form.teamSelectionMode)}
                  >
                    {isFinalizingStep3
                      ? "Saving..."
                      : form.teamSelectionMode === "create"
                        ? "Create New Team"
                        : "Join Team with Code"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
