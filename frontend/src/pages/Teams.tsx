import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, X, Check, UserPlus, Plus } from "lucide-react"
import { Button, Badge, Input } from "@/components/ui"
import { subscribeToParticipants, type Participant } from "@/lib/participants"
import { subscribeToTeams, type TeamRecord } from "@/lib/teams"

type FilterType = "all" | "ai-data" | "insight" | "business"

interface InvitedMember {
  id: string
  name: string
  avatar: string
  role: string
}

export function Teams() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [teams, setTeams] = useState<TeamRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Create Team Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [showMemberResults, setShowMemberResults] = useState(false)

  useEffect(() => {
    let isParticipantsLoaded = false
    let isTeamsLoaded = false

    const setLoadingState = () => {
      setIsLoading(!(isParticipantsLoaded && isTeamsLoaded))
    }

    const unsubscribeParticipants = subscribeToParticipants(
      (loadedParticipants) => {
        setParticipants(loadedParticipants)
        isParticipantsLoaded = true
        setLoadingState()
      },
      () => {
        isParticipantsLoaded = true
        setLoadingState()
      },
    )

    const unsubscribeTeams = subscribeToTeams(
      (loadedTeams) => {
        setTeams(loadedTeams)
        isTeamsLoaded = true
        setLoadingState()
      },
      () => {
        isTeamsLoaded = true
        setLoadingState()
      },
    )

    return () => {
      unsubscribeParticipants()
      unsubscribeTeams()
    }
  }, [])

  const teamMemberIds = new Set(teams.flatMap((team) => team.memberIds))
  const availableParticipants = participants.filter((participant) => !teamMemberIds.has(participant.id))

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showCreateModal || showSuccessModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showCreateModal, showSuccessModal])

  // Filter available participants based on search
  const filteredParticipants = availableParticipants.filter(p => 
    !invitedMembers.some(m => m.id === p.id) &&
    (p.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
     p.role.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
     p.skills.some(s => s.toLowerCase().includes(memberSearchQuery.toLowerCase())))
  )

  const handleCreateTeam = () => {
    if (!teamName.trim()) return
    // Here you would normally send to backend
    setShowCreateModal(false)
    setShowSuccessModal(true)
    // Reset form
    setTeamName("")
    setTeamDescription("")
    setInvitedMembers([])
  }

  const inviteMember = (participant: typeof availableParticipants[0]) => {
    if (invitedMembers.length < 3) { // Max 3 invites (+ yourself = 4)
      setInvitedMembers([...invitedMembers, {
        id: participant.id,
        name: participant.name,
        avatar: participant.avatar,
        role: participant.role
      }])
    }
    setMemberSearchQuery("")
    setShowMemberResults(false)
  }

  const removeInvite = (id: string) => {
    setInvitedMembers(invitedMembers.filter(m => m.id !== id))
  }

  const filteredTeams = teams.filter(team => {
    const matchesFilter = filter === "all" || 
      (filter === "ai-data" && team.case === "AI & Data Intelligence") || 
      (filter === "insight" && team.case === "Insight Platform") ||
      (filter === "business" && team.case === "Business Innovation")
    
    const matchesSearch = searchQuery === "" || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.case && team.case.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-10 animate-slide-up">
        <div className="flex items-start justify-between gap-5 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 tracking-tight">
              Teams
            </h1>
            <p className="text-sm text-muted-foreground">
              Find your perfect team or create your own
            </p>
          </div>
          
          <Button 
            size="sm" 
            className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect font-medium"
            onClick={() => setShowCreateModal(true)}
          >
            Create Team
          </Button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up stagger-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, skills, or case..." 
            className="pl-10 bg-secondary/20 border-border/30 focus:border-brand-cyan/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" 
              ? "bg-brand-cyan text-background hover:bg-brand-cyan/90" 
              : "border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
            }
          >
            All
          </Button>
          <Button 
            variant={filter === "ai-data" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ai-data")}
            className={filter === "ai-data" 
              ? "bg-brand-cyan text-background hover:bg-brand-cyan/90" 
              : "border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
            }
          >
            AI & Data
          </Button>
          <Button 
            variant={filter === "insight" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("insight")}
            className={filter === "insight" 
              ? "bg-brand-cyan text-background hover:bg-brand-cyan/90" 
              : "border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
            }
          >
            Insight Platform
          </Button>
          <Button 
            variant={filter === "business" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("business")}
            className={filter === "business" 
              ? "bg-brand-cyan text-background hover:bg-brand-cyan/90" 
              : "border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
            }
          >
            Business Innovation
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative h-px mb-6">
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent blur-sm" />
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground mb-4">
        {isLoading ? "Loading teams..." : `${filteredTeams.length} ${filteredTeams.length === 1 ? "team" : "teams"} found`}
      </p>

      {/* Teams List */}
      <div className="space-y-4">
        {filteredTeams.map((team, index) => (
          <Link 
            key={team.id}
            to={`/teams/${team.id}`}
            className="glass-card rounded-xl p-5 animate-slide-up group block cursor-pointer hover:border-brand-cyan/20 transition-all"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Team Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-brand-cyan transition-colors">
                    {team.name}
                  </h3>
                  {team.looking ? (
                    <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 text-xs">
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Full
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {team.description}
                </p>

                {/* Skills */}
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

              {/* Right Side - Members, Case */}
              <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                <div className="text-right">
                  <p className="text-xs text-white mb-1">
                    {team.memberIds.length}/{team.maxMembers} members
                  </p>
                  {team.case && (
                    <p className="text-sm font-medium text-brand-cyan">
                      {team.case}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No teams found matching your criteria.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => { setFilter("all"); setSearchQuery(""); }}
            className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative glass-card rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Create New Team</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  maxLength={30}
                  className={!teamName.trim() ? "border-red-400/50" : ""}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <Input
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Short team description (max 50 chars)"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">{teamDescription.length}/50</p>
              </div>

              {/* Divider */}
              <div className="relative h-px">
                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Invite Members */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <UserPlus className="w-4 h-4 inline mr-1.5" />
                  Invite Team Members (max 3)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Search for participants who are looking for a team
                </p>

                {/* Invited Members */}
                {invitedMembers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {invitedMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeInvite(member.id)}
                          className="p-1 text-muted-foreground hover:text-red-400 cursor-pointer"
                          title="Remove invite"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search */}
                {invitedMembers.length < 3 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value)
                        setShowMemberResults(e.target.value.length > 0)
                      }}
                      onFocus={() => memberSearchQuery && setShowMemberResults(true)}
                      placeholder="Search by name, role, or skills..."
                      className="pl-10"
                    />
                    
                    {/* Search Results */}
                    {showMemberResults && memberSearchQuery && (
                      <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg border border-border/50 max-h-48 overflow-y-auto z-10">
                        {filteredParticipants.length > 0 ? (
                          filteredParticipants.slice(0, 5).map(participant => (
                            <button
                              key={participant.id}
                              onClick={() => inviteMember(participant)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-brand-cyan/10 transition-colors cursor-pointer"
                            >
                              <img 
                                src={participant.avatar} 
                                alt={participant.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-foreground">{participant.name}</p>
                                <p className="text-xs text-muted-foreground">{participant.role}</p>
                                <div className="flex gap-1 mt-1">
                                  {participant.skills.slice(0, 3).map(s => (
                                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-secondary/40 rounded">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-brand-cyan" />
                            </button>
                          ))
                        ) : (
                          <p className="p-3 text-sm text-muted-foreground text-center">
                            No participants found
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-brand-cyan text-background hover:bg-brand-cyan/90"
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim()}
                >
                  Create Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative glass-card rounded-xl p-8 w-full max-w-sm text-center animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-cyan/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-brand-cyan" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Team Created!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your team has been successfully created. Invitations have been sent to the selected members.
            </p>
            <Button
              className="w-full bg-brand-cyan text-background hover:bg-brand-cyan/90"
              onClick={() => setShowSuccessModal(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

