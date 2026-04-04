import { Button, Input, Textarea } from "@/components/ui"
import { MyTeamCard } from "@/components/team/MyTeamCard"
import type { ApplicationFormState } from "./ApplicationForm.types"
import { isNonEmpty } from "./ApplicationForm.types"
import type { PendingTeamRecord } from "@/lib/teams"
import type { ApplicantStatus } from "@/lib/applicants"

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
  
  managedPendingTeam: PendingTeamRecord | null
  activeUserId: string
  teamMemberNamesForCard: string[]
  teamMemberStatusesForCard: ApplicantStatus[]
  teamMemberIdsForCard: string[]
  pendingMemberNamesForCard: string[]
  
  onUpdateField: (field: keyof ApplicationFormState, value: string) => void
  onPrevStep: () => void
  onProceedWithoutTeam: () => void
  onJoinTeam: () => void
  onCreateTeam: () => void
  onSubmitAsTeamMember: () => void
  onSubmitAsTeamLeader: () => void
  onKickMember?: (memberId: string) => Promise<void>
  onApproveMember: (memberId: string) => Promise<void>
  onDeclineMember: (memberId: string) => Promise<void>
  onLeaveTeam?: () => Promise<void>
  isUpdatingPendingMembers: boolean
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
  
  managedPendingTeam,
  activeUserId,
  teamMemberNamesForCard,
  teamMemberStatusesForCard,
  teamMemberIdsForCard,
  pendingMemberNamesForCard,
  
  onUpdateField,
  onPrevStep,
  onProceedWithoutTeam,
  onJoinTeam,
  onCreateTeam,
  onSubmitAsTeamMember,
  onSubmitAsTeamLeader,
  onKickMember,
  onApproveMember,
  onDeclineMember,
  onLeaveTeam,
  isUpdatingPendingMembers,
  isLeavingTeam,
}: Step3Props) {
  const parsedNewTeamMaxMembers = Number.parseInt(form.newTeamMaxMembers, 10)

  return (
    <>
      {shouldShowTeamCard ? (
        <MyTeamCard
          teamName={managedPendingTeam?.name || form.newTeamName}
          description={managedPendingTeam?.description || form.newTeamDescription}
          maxMembers={managedPendingTeam?.maxMembers || Math.max(2, Math.min(4, parsedNewTeamMaxMembers || 2))}
          memberCount={managedPendingTeam?.memberIds.length || 1}
          memberIds={teamMemberIdsForCard}
          memberNames={teamMemberNamesForCard}
          memberStatuses={teamMemberStatusesForCard}
          leaderId={managedPendingTeam?.leaderId ?? undefined}
          currentUserId={activeUserId}
          status={managedPendingTeam?.status || "APPLICATION_PENDING"}
          teamCode={managedPendingTeam?.teamCode || form.teamCode}
          showPendingMembers={isManagedTeamLeader || (hasCreatedPendingTeam && !managedPendingTeam)}
          pendingMemberIds={managedPendingTeam?.pendingMemberIds || []}
          pendingMemberNames={pendingMemberNamesForCard}
          onKickTeamMember={isManagedTeamLeader ? onKickMember : undefined}
          isUpdatingTeamMembers={isUpdatingPendingMembers}
          onApprovePendingMember={onApproveMember}
          onDeclinePendingMember={onDeclineMember}
          isUpdatingPendingMembers={isUpdatingPendingMembers}
          onLeaveTeam={canLeaveManagedTeam ? onLeaveTeam : undefined}
          isLeavingTeam={isLeavingTeam}
        />
      ) : (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Team Code (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <Button
              type="button"
              variant={form.teamSelectionMode === "join" ? "default" : "outline"}
              className="w-full"
              onClick={() => onUpdateField("teamSelectionMode", "join")}
            >
              Join Existing Team
            </Button>
            <Button
              type="button"
              variant={form.teamSelectionMode === "create" ? "default" : "outline"}
              className="w-full"
              onClick={() => onUpdateField("teamSelectionMode", "create")}
            >
              Create New Team
            </Button>
          </div>

          {form.teamSelectionMode === "join" && (
            <Input
              type="text"
              value={form.teamCode}
              onChange={(event) => onUpdateField("teamCode", event.target.value)}
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
                onChange={(event) => onUpdateField("newTeamName", event.target.value)}
                placeholder="Enter new team name"
                className="w-full"
                maxLength={80}
              />

              <Textarea
                value={form.newTeamDescription}
                onChange={(event) => onUpdateField("newTeamDescription", event.target.value)}
                placeholder="Describe your team focus"
                className="w-full"
                maxLength={600}
              />

              <Input
                type="number"
                min={2}
                max={4}
                value={form.newTeamMaxMembers}
                onChange={(event) => onUpdateField("newTeamMaxMembers", event.target.value)}
                placeholder="Max members (2-4)"
                className="w-full"
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

        {!isApplicationSubmitted && (
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
                  onClick={form.teamSelectionMode === "create" ? onCreateTeam : onJoinTeam}
                >
                  {isFinalizingStep3
                    ? "Saving..."
                    : form.teamSelectionMode === "create"
                      ? "Create New Team"
                      : "Join Team with Code"}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
