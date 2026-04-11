import { Button } from "@/components/ui"
import { Sparkles } from "lucide-react"
import { useApplicationForm } from "./useApplicationForm"
import { steps } from "./ApplicationForm.types"
import { ApplicationFormStep1 } from "./ApplicationFormStep1"
import { ApplicationFormStep2 } from "./ApplicationFormStep2"
import { ApplicationFormStep3 } from "./ApplicationFormStep3"
import {
  TEAM_SELECTION_MODE_CREATE,
  TEAM_SELECTION_MODE_INDIVIDUAL,
  TEAM_SELECTION_MODE_JOIN,
  TEAM_STATUS_INITIAL,
} from "../../../shared/types"

export function ApplicationForm() {
  const form = useApplicationForm()
  const shouldShowReviewBanner = form.isApplicationSubmitted
  const shouldShowTeamMemberWaitingBanner =
    form.isApplicationSubmitted &&
    form.isManagedTeamMember &&
    !form.isManagedTeamLeader &&
    form.managedPendingTeam?.status === TEAM_STATUS_INITIAL
  const reviewBannerMessage = shouldShowTeamMemberWaitingBanner
    ? "You have finished your part. Your team leader still needs to submit the team application."
    : form.form.teamSelectionMode === TEAM_SELECTION_MODE_INDIVIDUAL
      ? "Your individual application was submitted and is currently under review."
      : "Your team application was submitted and is currently under review."

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

          {shouldShowReviewBanner && (
            <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3">
              <p className="text-sm text-amber-100 text-center">{reviewBannerMessage}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {steps.map((currentStep) => {
              const isActive = form.step === currentStep.id
              const isCompleted = form.step > currentStep.id
              const canNavigateToStep2 = form.step >= 2 || form.isStep1Complete
              const canNavigateToStep3 = form.step >= 3 || (form.step === 2 && form.isStep2Complete)
              const isDisabled =
                form.isSyncingStep ||
                form.isSubmitting ||
                (currentStep.id === 2 && !canNavigateToStep2) ||
                (currentStep.id === 3 && !canNavigateToStep3)

              return (
                <button
                  key={currentStep.id}
                  type="button"
                  onClick={() => form.handleStepNavigation(currentStep.id)}
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
            <Button type="button" variant="outline" onClick={form.handleLogout} disabled={form.isLoggingOut}>
              {form.isLoggingOut ? "Logging out..." : "Log Out to Login"}
            </Button>
          </div>

          {form.isFormDataLoading && (
            <p className="text-xs text-muted-foreground mb-4 text-center">Loading your saved data...</p>
          )}

          <div className="space-y-4">
            {form.step === 1 && (
              <ApplicationFormStep1
                form={form.form}
                isApplicationSubmitted={form.isApplicationSubmitted}
                isStep1Complete={form.isStep1Complete}
                isSyncingStep={form.isSyncingStep}
                error={form.error}
                onUpdateField={form.updateField}
                onNextStep={form.handleNextFromStep1}
              />
            )}

            {form.step === 2 && (
              <ApplicationFormStep2
                form={form.form}
                isApplicationSubmitted={form.isApplicationSubmitted}
                isStep2Complete={form.isStep2Complete}
                isSubmitting={form.isSubmitting}
                error={form.error}
                onUpdateField={form.updateField}
                onFieldBlur={form.handleStep2FieldBlur}
                onNextStep={form.handleSubmitStep2}
                onPrevStep={() => form.setStep(1)}
              />
            )}

            {form.step === 3 && (
              <ApplicationFormStep3
                form={form.form}
                isApplicationSubmitted={form.isApplicationSubmitted}
                isFinalizingStep3={form.isFinalizingStep3}
                isSubmitting={form.isSubmitting}
                error={form.error}
                shouldShowTeamCard={form.shouldShowTeamCard}
                hasCreatedPendingTeam={form.hasCreatedPendingTeam}
                isManagedTeamLeader={form.isManagedTeamLeader}
                canLeaveManagedTeam={form.canLeaveManagedTeam}
                shouldShowJoinedMemberSubmitAction={form.shouldShowJoinedMemberSubmitAction}
                canSubmitApplication={form.canSubmitApplication}
                
                managedPendingTeam={form.managedPendingTeam}
                activeUserId={form.activeUserId}
                teamMemberNamesForCard={form.teamMemberNamesForCard}
                teamMemberStatusesForCard={form.teamMemberStatusesForCard}
                teamMemberIdsForCard={form.teamMemberIdsForCard}
                
                onUpdateField={form.updateField}
                onPrevStep={() => form.setStep(2)}
                onProceedWithoutTeam={form.handleProceedWithoutTeam}
                onJoinTeam={() => form.handleCompleteStep3(TEAM_SELECTION_MODE_JOIN)}
                onCreateTeam={(createTeamDraft) => form.handleCompleteStep3(TEAM_SELECTION_MODE_CREATE, createTeamDraft)}
                onSubmitAsTeamMember={form.handleSubmitApplicationAsTeamMember}
                onSubmitAsTeamLeader={form.handleSubmitApplicationAsTeamLeader}
                onKickMember={
                  form.isManagedTeamLeader && form.managedPendingTeam?.status === TEAM_STATUS_INITIAL
                    ? form.handleKickTeamMember
                    : undefined
                }
                onLeaveTeam={form.handleLeaveTeam}
                isUpdatingTeamMembers={form.isUpdatingTeamMembers}
                isLeavingTeam={form.isLeavingTeam}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
