import { useEffect, useState } from "react"
import { Link, useParams, Navigate } from "react-router-dom"
import { Building2, GraduationCap, Users, Briefcase, ArrowLeft } from "lucide-react"
import { Button, Badge } from "@/components/ui"
import { subscribeToParticipants, type Participant } from "@/lib/participants"
import { subscribeToTeams, type TeamRecord } from "@/lib/teams"

export function ProfileDetail() {
  const { userId } = useParams()
  const normalizedUserId = (userId ?? "").trim()
  const [user, setUser] = useState<Participant | null>(null)
  const [teamRecord, setTeamRecord] = useState<TeamRecord | null>(null)
  const [teamMembers, setTeamMembers] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!normalizedUserId) {
      setUser(null)
      setTeamRecord(null)
      setTeamMembers([])
      setIsLoading(false)
      return
    }

    let latestParticipants: Participant[] = []
    let latestTeams: TeamRecord[] = []
    let isParticipantsLoaded = false
    let isTeamsLoaded = false

    const updateLoadingState = () => {
      setIsLoading(!(isParticipantsLoaded && isTeamsLoaded))
    }

    const syncProfileState = () => {
      const loadedUser = latestParticipants.find((participant) => participant.id === normalizedUserId) ?? null
      setUser(loadedUser)

      if (!loadedUser) {
        setTeamRecord(null)
        setTeamMembers([])
        updateLoadingState()
        return
      }

      const participantTeamId =
        typeof loadedUser.team === "number" && Number.isFinite(loadedUser.team)
          ? loadedUser.team
          : null

      const resolvedTeam =
        participantTeamId === null
          ? null
          : latestTeams.find((team) => team.id === participantTeamId) ?? null

      setTeamRecord(resolvedTeam)

      const loadedMembers = resolvedTeam
        ? latestParticipants
            .filter((participant) => resolvedTeam.memberIds.includes(participant.id))
            .sort((firstMember, secondMember) =>
              firstMember.id.localeCompare(secondMember.id, undefined, { numeric: true }),
            )
        : []

      setTeamMembers(loadedMembers)

      updateLoadingState()
    }

    const unsubscribeParticipants = subscribeToParticipants(
      (participants) => {
        latestParticipants = participants
        isParticipantsLoaded = true
        syncProfileState()
      },
      () => {
        isParticipantsLoaded = true
        updateLoadingState()
      },
    )

    const unsubscribeTeams = subscribeToTeams(
      (teams) => {
        latestTeams = teams
        isTeamsLoaded = true
        syncProfileState()
      },
      () => {
        isTeamsLoaded = true
        updateLoadingState()
      },
    )

    return () => {
      unsubscribeParticipants()
      unsubscribeTeams()
    }
  }, [normalizedUserId])

  const team = teamRecord
    ? {
        name: teamRecord.name,
        description: teamRecord.description,
        case: teamRecord.case,
        skills: teamRecord.skills,
        leaderId: teamRecord.leaderId ?? user?.id ?? null,
        maxMembers: teamRecord.maxMembers,
      }
    : null

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-sm text-muted-foreground">Loading participant...</p>
      </div>
    )
  }
  
  // Redirect if user not found
  if (!user) {
    return <Navigate to="/participants" replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Link */}
      <div className="mb-8 animate-slide-up">
        <Link 
          to="/participants" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors press-effect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="link-hover">Back to participants</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-6 mb-8 animate-slide-up stagger-1">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {user.role}
            </p>
            
            {/* Affiliation */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-3">
              {user.affiliation.type === "university" ? (
                <GraduationCap className="w-4 h-4 text-muted-foreground/60" />
              ) : (
                <Building2 className="w-4 h-4 text-muted-foreground/60" />
              )}
              <span className="text-sm text-muted-foreground">
                {user.affiliation.name}
              </span>
            </div>
            
            {/* Bio */}
            <p className="text-sm text-foreground/80 mb-4">
              {user.bio}
            </p>
            
            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {user.skills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-2 py-0.5 text-xs bg-secondary/40 text-foreground/70 rounded-md border border-border/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Action */}
          <div className="shrink-0">
            {user.team ? (
              <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
                In a Team
              </Badge>
            ) : (
              <Button 
                size="sm"
                className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
              >
                Invite to Team
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative h-px mb-8">
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent blur-sm" />
      </div>

      {/* Team Section */}
      {team ? (
        <div className="animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-foreground">
              Team
            </h2>
            <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
              {teamMembers.length}/{team.maxMembers} members
            </Badge>
          </div>

          {/* Team Card */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {team.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {team.description}
              </p>
              
              {/* Meta */}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-brand-cyan">
                  <Briefcase className="w-4 h-4" />
                  {team.case}
                </span>
              </div>
            </div>

            {/* Team Skills */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Team Skills</p>
              {team.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {team.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2 py-0.5 text-xs bg-secondary/40 text-foreground/70 rounded-md border border-border/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No team skills available yet.</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border/30 mb-6" />

            {/* Team Members */}
            <div>
              <p className="text-xs text-muted-foreground mb-4">Team Members</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {teamMembers.map((member) => (
                  <Link 
                    key={member.id} 
                    to={`/profile/${member.id}`}
                    className="text-center group cursor-pointer"
                  >
                    <div className="relative mb-2">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto transition-transform duration-200 group-hover:scale-105"
                      />
                      {member.id === team.leaderId && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <Badge className="bg-brand-cyan text-background border-0 text-[10px] px-1.5 font-medium">
                            Leader
                          </Badge>
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-brand-cyan transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {member.affiliation.type === "university" ? (
                        <GraduationCap className="w-3 h-3 text-muted-foreground/60" />
                      ) : (
                        <Building2 className="w-3 h-3 text-muted-foreground/60" />
                      )}
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        {member.affiliation.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-slide-up stagger-2">
          <div className="glass-card rounded-xl p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground mb-1">
              Not in a Team Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              {user.name} is currently looking for a team to join.
            </p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative h-px my-10">
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent blur-sm" />
      </div>

      {/* Actions */}
      <div className="text-center animate-slide-up stagger-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="sm"
            className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
            asChild
          >
            <Link to="/participants">
              <Users className="w-4 h-4" />
              Browse Participants
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
            asChild
          >
            <Link to="/teams">
              View Teams
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

