import { Users, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui"

function formatTeamStatus(status: string) {
  if (status === "INITIAL") {
    return "Draft"
  }

  if (status === "APPLICATION_SUBMITTED") {
    return "Application submitted"
  }

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

type MyTeamCardProps = {
  teamName: string
  description: string
  caseLabel?: string
  maxMembers: number
  memberCount: number
  memberIds?: string[]
  memberNames?: string[]
  memberStatuses?: string[]
  leaderId?: string
  currentUserId?: string
  status?: string
  teamCode?: string
  showPendingMembers?: boolean
  pendingMemberIds?: string[]
  pendingMemberNames?: string[]
  onKickTeamMember?: (memberId: string) => void | Promise<void>
  isUpdatingTeamMembers?: boolean
  onApprovePendingMember?: (memberId: string) => void | Promise<void>
  onDeclinePendingMember?: (memberId: string) => void | Promise<void>
  isUpdatingPendingMembers?: boolean
  onLeaveTeam?: () => void | Promise<void>
  isLeavingTeam?: boolean
  showPendingApprovalRemark?: boolean
}

export function MyTeamCard({
  teamName,
  description,
  caseLabel,
  maxMembers,
  memberCount,
  memberIds = [],
  memberNames = [],
  memberStatuses = [],
  leaderId,
  currentUserId,
  status,
  teamCode,
  showPendingMembers = false,
  pendingMemberIds = [],
  pendingMemberNames = [],
  onKickTeamMember,
  isUpdatingTeamMembers = false,
  onApprovePendingMember,
  onDeclinePendingMember,
  isUpdatingPendingMembers = false,
  onLeaveTeam,
  isLeavingTeam = false,
  showPendingApprovalRemark = false,
}: MyTeamCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">My Team</h3>
        <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
          {memberCount}/{maxMembers} members
        </Badge>
      </div>

      <div className="glass-card rounded-xl p-6 relative">
        {onLeaveTeam && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              disabled={isLeavingTeam}
              onClick={() => onLeaveTeam()}
              className="px-3 py-1.5 text-xs rounded border border-red-400/40 text-red-300 hover:text-red-200 hover:border-red-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLeavingTeam
                ? showPendingApprovalRemark
                  ? "Canceling..."
                  : "Leaving..."
                : showPendingApprovalRemark
                  ? "Cancel Join Request"
                  : "Leave Team"}
            </button>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-foreground mb-2">{teamName}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          {showPendingApprovalRemark && (
            <p className="text-sm text-amber-300 mb-3 border border-amber-400/30 bg-amber-400/10 rounded-md px-3 py-2">
              Your join request is pending. You are waiting for approval by the team leader.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {caseLabel && (
              <span className="flex items-center gap-1.5 text-brand-cyan">
                <Briefcase className="w-4 h-4" />
                {caseLabel}
              </span>
            )}

            {status && (
              <Badge className="bg-secondary/40 text-foreground/70 border-border/20">
                {formatTeamStatus(status)}
              </Badge>
            )}

            {teamCode && (
              <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
                Code: {teamCode}
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t border-border/30 pt-4">
          <p className="text-xs text-muted-foreground mb-2">Team Members</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"} currently in team
              {memberCount > 0 && !showPendingApprovalRemark ? " (including you)" : ""}
            </span>
          </div>

          {memberNames.length > 0 && (
            <div className="mt-3 space-y-2">
              {memberNames.map((memberName, index) => {
                const memberId = memberIds[index]
                const memberStatus = memberStatuses[index] ?? "unknown"
                const isCurrentUserRow = !!currentUserId && memberId === currentUserId
                const isLeaderRow = !!leaderId && memberId === leaderId
                const canKick =
                  !!onKickTeamMember &&
                  !!leaderId &&
                  !!currentUserId &&
                  leaderId === currentUserId &&
                  !!memberId &&
                  memberId !== leaderId

                return (
                  <div
                    key={`${memberName}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-foreground truncate">
                        {memberName}
                        {isCurrentUserRow ? " (you)" : ""}
                      </span>
                      <Badge
                        className={
                          memberStatus === "submitted"
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : memberStatus === "started"
                              ? "bg-secondary/40 text-foreground/70 border-border/30"
                              : "bg-secondary/30 text-muted-foreground border-border/20"
                        }
                      >
                        {memberStatus}
                      </Badge>
                      {isLeaderRow && (
                        <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">Leader</Badge>
                      )}
                    </div>

                    {canKick && (
                      <button
                        type="button"
                        disabled={isUpdatingTeamMembers}
                        onClick={() => onKickTeamMember?.(memberId)}
                        className="px-3 py-1 text-xs rounded border border-red-400/40 text-red-300 hover:text-red-200 hover:border-red-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {showPendingMembers && (
          <div className="border-t border-border/30 pt-4 mt-4">
            <p className="text-xs text-muted-foreground mb-3">Pending Members</p>

            {pendingMemberIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending members right now.</p>
            ) : (
              <div className="space-y-2">
                {pendingMemberIds.map((memberId, index) => (
                  <div
                    key={memberId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-border/30 px-3 py-2"
                  >
                    <span className="text-sm text-foreground break-all">
                      {pendingMemberNames[index] ?? memberId}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUpdatingPendingMembers || !onDeclinePendingMember}
                        onClick={() => onDeclinePendingMember?.(memberId)}
                        className="px-3 py-1 text-xs rounded border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingPendingMembers || !onApprovePendingMember}
                        onClick={() => onApprovePendingMember?.(memberId)}
                        className="px-3 py-1 text-xs rounded bg-brand-cyan text-background hover:bg-brand-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
