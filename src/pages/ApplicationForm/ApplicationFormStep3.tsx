import { useState } from "react"
import { Button, Input, Textarea } from "@/components/ui"
import { MyTeamCard } from "@/components/team/MyTeamCard"
import type { ApplicationFormState, CreateTeamDraft } from "./ApplicationForm.types"
import { isNonEmpty } from "./ApplicationForm.types"
import { TEAM_MAX_MEMBERS, type PendingTeamRecord } from "@/lib/teams"
import type { ApplicantStatus } from "@/lib/applicants"
import {
  TEAM_SELECTION_MODE_CREATE,
  TEAM_SELECTION_MODE_INDIVIDUAL,
  TEAM_SELECTION_MODE_JOIN,
  TEAM_STATUS_INITIAL,
} from "../../../shared/types"

interface Step3Props {
  form: ApplicationFormState
  isApplicationSubmitted: boolean
  isFinalizingStep3: boolean
  isSubmitting: boolean
  error: string
  shouldShowTeamCard: boolean
  hasCreatedPendingTeam: boolean
  isManagedTeamLeader: boolean
  canLeaveManagedTeam: boolean
  shouldShowJoinedMemberSubmitAction: boolean
  canSubmitApplication: boolean
  shouldShowLeaderTeamSubmitAction: boolean
  canSubmitTeamApplication: boolean
  
  managedPendingTeam: PendingTeamRecord | null
  activeUserId: string
  teamMemberNamesForCard: string[]
  teamMemberStatusesForCard: ApplicantStatus[]
  teamMemberIdsForCard: string[]
  
  onUpdateField: (field: keyof ApplicationFormState, value: string) => void
  onPrevStep: () => void
  onProceedWithoutTeam: () => Promise<void>
  onJoinTeam: () => void
  onCreateTeam: (createTeamDraft: CreateTeamDraft) => void
  onSubmitAsTeamMember: () => void
  onSubmitAsTeamLeader: () => void
  onSubmitTeamAsTeamLeader: () => void
  onKickMember?: (memberId: string) => Promise<void>
  onLeaveTeam?: () => Promise<void>
  isUpdatingTeamMembers: boolean
  isLeavingTeam: boolean
}

export function ApplicationFormStep3({
  form,
  isApplicationSubmitted,
  isFinalizingStep3,
  isSubmitting,
  error,
  shouldShowTeamCard,
  hasCreatedPendingTeam,
  isManagedTeamLeader,
  canLeaveManagedTeam,
  shouldShowJoinedMemberSubmitAction,
  canSubmitApplication,
  shouldShowLeaderTeamSubmitAction,
  canSubmitTeamApplication,
  
  managedPendingTeam,
  activeUserId,
  teamMemberNamesForCard,
  teamMemberStatusesForCard,
  teamMemberIdsForCard,
  
  onUpdateField,
  onPrevStep,
  onProceedWithoutTeam,
  onJoinTeam,
  onCreateTeam,
  onSubmitAsTeamMember,
  onSubmitAsTeamLeader,
  onSubmitTeamAsTeamLeader,
  onKickMember,
  onLeaveTeam,
  isUpdatingTeamMembers,
  isLeavingTeam,
}: Step3Props) {
  const [createTeamName, setCreateTeamName] = useState("")
  const [createTeamDescription, setCreateTeamDescription] = useState("")
  const shouldHideTeamSelectionAfterIndividualSubmit =
    isApplicationSubmitted && form.teamSelectionMode === TEAM_SELECTION_MODE_INDIVIDUAL && !shouldShowTeamCard

  return (
    <>
      {shouldShowTeamCard ? (
        <MyTeamCard
          teamName={managedPendingTeam?.name || createTeamName}
          description={managedPendingTeam?.description || createTeamDescription}
          maxMembers={TEAM_MAX_MEMBERS}
          memberCount={managedPendingTeam?.memberIds.length || 1}
          memberIds={teamMemberIdsForCard}
          memberNames={teamMemberNamesForCard}
          memberStatuses={teamMemberStatusesForCard}
          leaderId={managedPendingTeam?.leaderId ?? undefined}
          currentUserId={activeUserId}
          status={managedPendingTeam?.status || TEAM_STATUS_INITIAL}
          teamCode={managedPendingTeam?.teamCode || form.teamCode}
          onKickTeamMember={isManagedTeamLeader ? onKickMember : undefined}
          isUpdatingTeamMembers={isUpdatingTeamMembers}
          onLeaveTeam={canLeaveManagedTeam ? onLeaveTeam : undefined}
          isLeavingTeam={isLeavingTeam}
        />
      ) : shouldHideTeamSelectionAfterIndividualSubmit ? (
        <p className="text-sm text-muted-foreground text-center">
          You submitted as an individual participant.
        </p>
      ) : (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Team Code (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <Button
              type="button"
              variant={form.teamSelectionMode === TEAM_SELECTION_MODE_JOIN ? "default" : "outline"}
              className="w-full"
              onClick={() => onUpdateField("teamSelectionMode", TEAM_SELECTION_MODE_JOIN)}
            >
              Join Existing Team
            </Button>
            <Button
              type="button"
              variant={form.teamSelectionMode === TEAM_SELECTION_MODE_CREATE ? "default" : "outline"}
              className="w-full"
              onClick={() => onUpdateField("teamSelectionMode", TEAM_SELECTION_MODE_CREATE)}
            >
              Create New Team
            </Button>
          </div>

          {form.teamSelectionMode === TEAM_SELECTION_MODE_JOIN && (
            <Input
              type="text"
              value={form.teamCode}
              onChange={(event) => onUpdateField("teamCode", event.target.value)}
              placeholder="Enter team code"
              className="w-full"
              maxLength={40}
            />
          )}

          {form.teamSelectionMode === TEAM_SELECTION_MODE_CREATE && (
            <div className="space-y-3">
              <Input
                type="text"
                value={createTeamName}
                onChange={(event) => setCreateTeamName(event.target.value)}
                placeholder="Enter new team name"
                className="w-full"
                maxLength={80}
              />

              <Textarea
                value={createTeamDescription}
                onChange={(event) => setCreateTeamDescription(event.target.value)}
                placeholder="Describe your team focus"
                className="w-full"
                maxLength={600}
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button type="button" variant="outline" className="w-full" onClick={onPrevStep}>
          Back
        </Button>

        {shouldShowLeaderTeamSubmitAction ? (
          <>
            {!isApplicationSubmitted && (
              <Button
                type="button"
                className="w-full"
                disabled={isFinalizingStep3 || isSubmitting || !canSubmitApplication}
                onClick={onSubmitAsTeamLeader}
              >
                {isFinalizingStep3 || isSubmitting ? "Saving..." : "Submit Personal Application"}
              </Button>
            )}
            <Button
              type="button"
              className="w-full md:col-span-2"
              disabled={isFinalizingStep3 || isSubmitting || !canSubmitTeamApplication}
              onClick={onSubmitTeamAsTeamLeader}
            >
              {isFinalizingStep3 || isSubmitting ? "Saving..." : "Submit Team Application"}
            </Button>
          </>
        ) : !isApplicationSubmitted ? (
          <>
            {shouldShowJoinedMemberSubmitAction ? (
              <Button
                type="button"
                className="w-full md:col-span-2"
                disabled={isFinalizingStep3 || isSubmitting || !canSubmitApplication}
                onClick={isManagedTeamLeader ? onSubmitAsTeamLeader : onSubmitAsTeamMember}
              >
                {isFinalizingStep3 || isSubmitting ? "Saving..." : "Submit Application"}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isFinalizingStep3 || hasCreatedPendingTeam}
                  onClick={onProceedWithoutTeam}
                >
                  {isFinalizingStep3 || isSubmitting ? "Saving..." : "Submit Without Team"}
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  disabled={
                    hasCreatedPendingTeam ||
                    isFinalizingStep3 ||
                    (form.teamSelectionMode === TEAM_SELECTION_MODE_JOIN && !isNonEmpty(form.teamCode)) ||
                    (form.teamSelectionMode === TEAM_SELECTION_MODE_CREATE &&
                      (!isNonEmpty(createTeamName) ||
                        !isNonEmpty(createTeamDescription)))
                  }
                  onClick={
                    form.teamSelectionMode === TEAM_SELECTION_MODE_CREATE
                      ? () => onCreateTeam({
                        name: createTeamName,
                        description: createTeamDescription,
                      })
                      : onJoinTeam
                  }
                >
                  {isFinalizingStep3
                    ? "Saving..."
                    : form.teamSelectionMode === TEAM_SELECTION_MODE_CREATE
                      ? "Create New Team"
                      : "Join Team with Code"}
                </Button>
              </>
            )}
          </>
        ) : null}
      </div>
    </>
  )
}
