import { useEffect, useState } from "react"
import { Link, useParams, Navigate } from "react-router-dom"
import { Building2, GraduationCap, Users, Briefcase, ArrowLeft } from "lucide-react"
import { Button, Badge } from "@/components/ui"
import { subscribeToParticipants, type Participant } from "@/lib/participants"
import { subscribeToTeams, type TeamRecord } from "@/lib/teams"

export function TeamDetail() {
  const { teamId } = useParams()
  const normalizedTeamId = (teamId ?? "").trim()
  const [team, setTeam] = useState<TeamRecord | null>(null)
  const [members, setMembers] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const parsedTeamId = Number(normalizedTeamId)

    if (!Number.isFinite(parsedTeamId) || parsedTeamId <= 0) {
      setTeam(null)
      setMembers([])
      setIsLoading(false)
      return
    }

    let currentTeamMemberIds: string[] | null = null
    let latestParticipants: Participant[] = []

    const updateMembers = (allParticipants: Participant[]) => {
      latestParticipants = allParticipants

      const teamMemberIds = currentTeamMemberIds

      const loadedMembers = teamMemberIds
        ? allParticipants
            .filter((participant) => teamMemberIds.includes(participant.id))
            .sort((firstMember, secondMember) =>
              firstMember.id.localeCompare(secondMember.id, undefined, { numeric: true }),
            )
        : []

      setMembers(loadedMembers)
    }

    let unsubscribeParticipants: (() => void) | undefined

    const unsubscribeTeams = subscribeToTeams(
      (allTeams) => {
        const loadedTeam = allTeams.find((currentTeam) => currentTeam.id === parsedTeamId) ?? null
        setTeam(loadedTeam)
        currentTeamMemberIds = loadedTeam?.memberIds ?? null

        updateMembers(latestParticipants)

        setIsLoading(false)
      },
      () => {
        setIsLoading(false)
      },
    )

    unsubscribeParticipants = subscribeToParticipants(
      (allParticipants) => {
        updateMembers(allParticipants)
      },
      () => {
        setIsLoading(false)
      },
    )

    return () => {
      unsubscribeTeams()
      if (unsubscribeParticipants) {
        unsubscribeParticipants()
      }
    }
  }, [normalizedTeamId])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <p className="text-sm text-muted-foreground">Loading team...</p>
      </div>
    )
  }
  
  // Redirect if team not found
  if (!team) {
    return <Navigate to="/teams" replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Link */}
      <div className="mb-8 animate-slide-up">
        <Link 
          to="/teams" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors press-effect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="link-hover">Back to teams</span>
        </Link>
      </div>

      {/* Team Header */}
      <div className="animate-slide-up stagger-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
              {team.name}
            </h1>
            <div className="flex items-center gap-2">
              {team.looking ? (
                <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
                  Open
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Full
                </Badge>
              )}
              <Badge className="bg-secondary/40 text-foreground/70 border-border/20">
                {members.length}/{team.maxMembers} members
              </Badge>
            </div>
          </div>
          {team.looking && (
            <Button 
              size="sm"
              className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
            >
              Request to Join
            </Button>
          )}
        </div>
      </div>

      {/* Team Card */}
      <div className="glass-card rounded-xl p-6 mb-6 animate-slide-up stagger-2">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-4">
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
        </div>

        {/* Divider */}
        <div className="border-t border-border/30 mb-6" />

        {/* Team Members */}
        <div>
          <p className="text-xs text-muted-foreground mb-4">Team Members</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {members.map((member) => (
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
            <Link to="/teams">
              <Users className="w-4 h-4" />
              Browse Teams
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
            asChild
          >
            <Link to="/participants">
              View Participants
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

