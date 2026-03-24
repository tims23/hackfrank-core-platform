import { Users, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui"

type MyTeamCardProps = {
  teamName: string
  description: string
  caseLabel?: string
  maxMembers: number
  memberCount: number
  status?: string
  teamCode?: string
  showPendingMembers?: boolean
  pendingMemberIds?: string[]
  onApprovePendingMember?: (memberId: string) => void | Promise<void>
  onDeclinePendingMember?: (memberId: string) => void | Promise<void>
  isUpdatingPendingMembers?: boolean
}

export function MyTeamCard({
  teamName,
  description,
  caseLabel,
  maxMembers,
  memberCount,
  status,
  teamCode,
  showPendingMembers = false,
  pendingMemberIds = [],
  onApprovePendingMember,
  onDeclinePendingMember,
  isUpdatingPendingMembers = false,
}: MyTeamCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">My Team</h3>
        <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
          {memberCount}/{maxMembers} members
        </Badge>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-foreground mb-2">{teamName}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {caseLabel && (
              <span className="flex items-center gap-1.5 text-brand-cyan">
                <Briefcase className="w-4 h-4" />
                {caseLabel}
              </span>
            )}

            {status && (
              <Badge className="bg-secondary/40 text-foreground/70 border-border/20">
                {status}
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
              {memberCount > 0 ? " (including you)" : ""}
            </span>
          </div>
        </div>

        {showPendingMembers && (
          <div className="border-t border-border/30 pt-4 mt-4">
            <p className="text-xs text-muted-foreground mb-3">Pending Members</p>

            {pendingMemberIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending members right now.</p>
            ) : (
              <div className="space-y-2">
                {pendingMemberIds.map((memberId) => (
                  <div
                    key={memberId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-border/30 px-3 py-2"
                  >
                    <span className="text-sm text-foreground break-all">{memberId}</span>
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
