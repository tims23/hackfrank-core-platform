import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Building2, GraduationCap, Users, Briefcase, X, ChevronDown, Crown, UserMinus, Eye, EyeOff, LogOut } from "lucide-react"
import { Button, Badge, Input } from "@/components/ui"

// Available skills to choose from
const availableSkills = [
  "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js",
  "TensorFlow", "PyTorch", "Keras", "NLP", "ML", "Data Analysis", "SQL",
  "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Go", "Rust",
  "Figma", "UX Design", "UI Design", "Prototyping", "Research",
  "Excel", "PowerPoint", "Tableau", "PowerBI", "Strategy", "Agile"
]


// Current user data
const initialUser = {
  id: "1",
  name: "Sarah Chen",
  email: "sarah.chen@google.com",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  role: "ML Engineer",
  skills: ["Python", "TensorFlow", "NLP", "Keras", "SQL"],
  affiliation: { type: "company" as "company" | "university", name: "Google" },
  bio: "Passionate about applying ML to real-world problems. Looking to build something impactful this hackathon!",
  isVisible: false,
}

// User's team data
const initialTeam = {
  id: 1,
  name: "Code Crusaders",
  description: "NLP-powered fraud detection. Let's go!",
  case: "AI & Data Intelligence",
  skills: ["React", "Python", "ML", "TensorFlow"],
  members: [
    {
      id: "1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      role: "ML Engineer",
      affiliation: { type: "company", name: "Google" },
      isLeader: true,
    },
    {
      id: "2",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Full Stack Dev",
      affiliation: { type: "university", name: "TU Munich" },
      isLeader: false,
    },
    {
      id: "4",
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      role: "Data Scientist",
      affiliation: { type: "university", name: "LMU Munich" },
      isLeader: false,
    },
    {
      id: "6",
      name: "Tom Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "Backend Engineer",
      affiliation: { type: "company", name: "Deutsche Bank" },
      isLeader: false,
    },
  ],
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState(initialUser)
  const [editName, setEditName] = useState(currentUser.name)
  const [editEmail, setEditEmail] = useState(currentUser.email)
  const [editRole, setEditRole] = useState(currentUser.role)
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar)
  const [editBio, setEditBio] = useState(currentUser.bio)
  const [editAffiliationType, setEditAffiliationType] = useState<"company" | "university">(currentUser.affiliation.type)
  const [editAffiliationName, setEditAffiliationName] = useState(currentUser.affiliation.name)
  const [editSkills, setEditSkills] = useState<string[]>(currentUser.skills)
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const skillDropdownRef = useRef<HTMLDivElement>(null)

  // Close skill dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false)
      }
    }
    if (showSkillDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSkillDropdown])
  
  // Team state
  const [team, setTeam] = useState(initialTeam)
  const [isEditingTeam, setIsEditingTeam] = useState(false)
  const [editTeamName, setEditTeamName] = useState(team.name)
  const [editTeamDescription, setEditTeamDescription] = useState(team.description)
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    type: "makeLeader" | "kick" | "leaveTeam" | null
    memberId: string | null
    memberName: string
  }>({ type: null, memberId: null, memberName: "" })
  
  // Visibility state
  const [editIsVisible, setEditIsVisible] = useState(currentUser.isVisible)
  const [showVisibilityConsent, setShowVisibilityConsent] = useState(false)

  const handleSave = () => {
    // Validate required fields
    if (!editName.trim() || !editEmail.trim()) {
      return
    }
    setCurrentUser({
      ...currentUser,
      name: editName,
      email: editEmail,
      role: editRole,
      avatar: editAvatar,
      bio: editBio,
      affiliation: { type: editAffiliationType, name: editAffiliationName },
      skills: editSkills,
      isVisible: editIsVisible,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditName(currentUser.name)
    setEditEmail(currentUser.email)
    setEditRole(currentUser.role)
    setEditAvatar(currentUser.avatar)
    setEditBio(currentUser.bio)
    setEditAffiliationType(currentUser.affiliation.type)
    setEditAffiliationName(currentUser.affiliation.name)
    setEditSkills(currentUser.skills)
    setEditIsVisible(currentUser.isVisible)
    setIsEditing(false)
  }

  const handleVisibilityToggle = () => {
    if (!editIsVisible) {
      // Activating visibility - show consent modal first
      setShowVisibilityConsent(true)
    } else {
      // Deactivating visibility - no consent needed
      setEditIsVisible(false)
    }
  }

  const confirmVisibilityConsent = () => {
    setEditIsVisible(true)
    setShowVisibilityConsent(false)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addSkill = (skill: string) => {
    if (editSkills.length < 5 && !editSkills.includes(skill)) {
      setEditSkills([...editSkills, skill])
    }
    setShowSkillDropdown(false)
  }

  const removeSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill))
  }

  const filteredSkills = availableSkills.filter(skill => !editSkills.includes(skill))

  // Team functions
  const handleSaveTeam = () => {
    // Validate required fields
    if (!editTeamName.trim()) {
      return
    }
    setTeam({
      ...team,
      name: editTeamName,
      description: editTeamDescription,
    })
    setIsEditingTeam(false)
  }

  const handleCancelTeam = () => {
    setEditTeamName(team.name)
    setEditTeamDescription(team.description)
    setIsEditingTeam(false)
  }

  const confirmMakeLeader = () => {
    if (confirmModal.memberId !== null) {
      setTeam({
        ...team,
        members: team.members.map(m => ({
          ...m,
          isLeader: m.id === confirmModal.memberId
        }))
      })
    }
    setConfirmModal({ type: null, memberId: null, memberName: "" })
  }

  const confirmKickMember = () => {
    if (confirmModal.memberId !== null) {
      setTeam({
        ...team,
        members: team.members.filter(m => m.id !== confirmModal.memberId)
      })
    }
    setConfirmModal({ type: null, memberId: null, memberName: "" })
  }

  const confirmLeaveTeam = () => {
    // Remove current user from team
    setTeam({
      ...team,
      members: team.members.filter(m => m.id !== currentUser.id)
    })
    setConfirmModal({ type: null, memberId: null, memberName: "" })
    setIsEditingTeam(false)
  }

  const openConfirmModal = (type: "makeLeader" | "kick" | "leaveTeam", memberId: string, memberName: string) => {
    setConfirmModal({ type, memberId, memberName })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-10 animate-slide-up">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and team
          </p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-6 mb-8 animate-slide-up stagger-1">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {isEditing ? (
              <div className="relative">
                <img 
                  src={editAvatar} 
                  alt={editName}
                  className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
                />
                <label
                  className="absolute bottom-0 right-0 w-7 h-7 bg-brand-cyan text-background rounded-full flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-brand-cyan/90 transition-colors"
                >
                  ✎
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
              />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <>
                {/* Edit Name */}
                <div className="mb-2">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={30}
                    className={`text-lg font-semibold bg-secondary/20 border-border/30 focus:border-brand-cyan/50 ${!editName.trim() ? 'border-red-400/50' : ''}`}
                    placeholder="Your name"
                  />
                </div>
                
                {/* Edit Email */}
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    maxLength={50}
                    className={`text-sm bg-secondary/20 border-border/30 focus:border-brand-cyan/50 ${!editEmail.trim() ? 'border-red-400/50' : ''}`}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                {/* Edit Role */}
                <Input
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  maxLength={30}
                  className="text-sm mb-3 bg-secondary/20 border-border/30 focus:border-brand-cyan/50"
                  placeholder="Your role (e.g. ML Engineer)"
                />
                
                {/* Edit Affiliation */}
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={editAffiliationType}
                    onChange={(e) => setEditAffiliationType(e.target.value as "company" | "university")}
                    className="px-3 py-1.5 text-sm bg-secondary/20 border border-border/30 rounded-md focus:border-brand-cyan/50 focus:outline-none text-foreground"
                  >
                    <option value="company">Company</option>
                    <option value="university">University</option>
                  </select>
                  <Input
                    value={editAffiliationName}
                    onChange={(e) => setEditAffiliationName(e.target.value)}
                    maxLength={30}
                    className="flex-1 bg-secondary/20 border-border/30 focus:border-brand-cyan/50"
                    placeholder={editAffiliationType === "company" ? "Company name (optional)" : "University name (optional)"}
                  />
                </div>
                
                {/* Edit Bio */}
                <div className="relative mb-4">
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={120}
                    className="w-full px-3 py-2 text-sm bg-secondary/20 border border-border/30 rounded-md focus:border-brand-cyan/50 focus:outline-none text-foreground/80 resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50">
                    {editBio.length}/120
                  </span>
                </div>
                
                {/* Edit Skills */}
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-2">Skills (max 5)</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editSkills.map((skill) => (
                      <span 
                        key={skill} 
                        className="flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary/40 text-foreground/70 rounded-md border border-border/20"
                      >
                        {skill}
                        <button 
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {editSkills.length < 5 && (
                    <div className="relative" ref={skillDropdownRef}>
                      <button
                        onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground bg-secondary/20 border border-border/30 rounded-md hover:border-brand-cyan/30 transition-colors cursor-pointer"
                      >
                        Add skill
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {showSkillDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 max-h-48 overflow-y-auto bg-card border border-border/50 rounded-lg shadow-lg z-10">
                          {filteredSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill)}
                              className="w-full px-3 py-2 text-xs text-left text-foreground/80 hover:bg-brand-cyan/10 hover:text-brand-cyan transition-colors cursor-pointer"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Visibility Toggle */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">Profile Visibility</p>
                      <p className="text-xs text-muted-foreground">
                        {editIsVisible 
                          ? "Your profile is visible to other participants and teams."
                          : "Your profile is hidden. Enable visibility to be discovered by teams."
                        }
                      </p>
                    </div>
                    <button
                      onClick={handleVisibilityToggle}
                      className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                        editIsVisible ? 'bg-brand-cyan' : 'bg-secondary/40'
                      }`}
                    >
                      <span 
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                          editIsVisible ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {editIsVisible ? (
                      <Eye className="w-3.5 h-3.5 text-brand-cyan" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground/60" />
                    )}
                    <span className={`text-xs ${editIsVisible ? 'text-brand-cyan' : 'text-muted-foreground/60'}`}>
                      {editIsVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  {currentUser.role}
                </p>
                
                {/* Email */}
                <p className="text-xs text-muted-foreground mb-2">
                  {currentUser.email}
                </p>
                
                {/* Affiliation - only show if name is set */}
                {currentUser.affiliation.name && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-3">
                    {currentUser.affiliation.type === "university" ? (
                      <GraduationCap className="w-4 h-4 text-muted-foreground/60" />
                    ) : (
                      <Building2 className="w-4 h-4 text-muted-foreground/60" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {currentUser.affiliation.name}
                    </span>
                  </div>
                )}
                
                {/* Bio */}
                <p className="text-sm text-foreground/80 mb-4">
                  {currentUser.bio}
                </p>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {currentUser.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2 py-0.5 text-xs bg-secondary/40 text-foreground/70 rounded-md border border-border/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                {/* Visibility Status */}
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border/20">
                  {currentUser.isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-brand-cyan" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground/60" />
                  )}
                  <span className={`text-xs ${currentUser.isVisible ? 'text-brand-cyan' : 'text-muted-foreground/60'}`}>
                    {currentUser.isVisible ? 'Profile visible to others' : 'Profile hidden'}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Edit Button */}
          <div className="shrink-0 flex flex-col gap-2">
            {isEditing ? (
              <>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
              >
                Edit Profile
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
      <div className="animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-foreground">
            My Team
          </h2>
          <Badge className="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
            {team.members.length}/4 members
          </Badge>
        </div>

        {/* Team Card */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              {isEditingTeam ? (
                <>
                  <div className="mb-2">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Team Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      maxLength={25}
                      className={`text-lg font-semibold bg-secondary/20 border-border/30 focus:border-brand-cyan/50 ${!editTeamName.trim() ? 'border-red-400/50' : ''}`}
                      placeholder="Team name"
                    />
                  </div>
                  <div className="relative mb-3">
                    <textarea
                      value={editTeamDescription}
                      onChange={(e) => setEditTeamDescription(e.target.value)}
                      maxLength={50}
                      className="w-full px-3 py-2 text-sm bg-secondary/20 border border-border/30 rounded-md focus:border-brand-cyan/50 focus:outline-none text-muted-foreground resize-none"
                      rows={2}
                      placeholder="Team description (max 50 chars)..."
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50">
                      {editTeamDescription.length}/50
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {team.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {team.description}
                  </p>
                </>
              )}
              
              {/* Meta */}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-brand-cyan">
                  <Briefcase className="w-4 h-4" />
                  {team.case}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col gap-2">
              {isEditingTeam ? (
                <>
                  <Button 
                    size="sm"
                    onClick={handleSaveTeam}
                    className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancelTeam}
                    className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openConfirmModal("leaveTeam", currentUser.id, currentUser.name)}
                    className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-400/10 press-effect mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Team
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingTeam(true)}
                  className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
                >
                  Edit Team
                </Button>
              )}
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
              {team.members.map((member) => (
                <div key={member.id} className="text-center group relative">
                  {/* Clickable profile link - only for other members */}
                  {member.id !== currentUser.id ? (
                    <Link to={`/profile/${member.id}`} className="block">
                      <div className="relative mb-2">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto transition-transform duration-200 group-hover:scale-105"
                        />
                        {member.isLeader && (
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
                    </Link>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto"
                        />
                        {member.isLeader && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <Badge className="bg-brand-cyan text-background border-0 text-[10px] px-1.5 font-medium">
                              Leader
                            </Badge>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {member.name} <span className="text-muted-foreground/60">(you)</span>
                      </h4>
                    </>
                  )}
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
                  
                  {/* Member Actions - only for others, not self */}
                  {member.id !== currentUser.id && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {!member.isLeader && (
                        <button
                          onClick={() => openConfirmModal("makeLeader", member.id, member.name)}
                          className="p-1.5 rounded-md text-muted-foreground/60 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-colors cursor-pointer"
                          title="Make Leader"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => openConfirmModal("kick", member.id, member.name)}
                        className="p-1.5 rounded-md text-muted-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                        title="Remove from team"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
        <h3 className="text-base font-semibold text-foreground mb-2">Quick Actions</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Browse other teams, find new teammates, or check out the cases.
        </p>
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
            <Link to="/cases">
              View Cases
            </Link>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setConfirmModal({ type: null, memberId: null, memberName: "" })}
          />
          
          {/* Modal */}
          <div className="relative glass-card rounded-xl p-6 max-w-sm mx-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {confirmModal.type === "makeLeader" && "Make Leader?"}
              {confirmModal.type === "kick" && "Remove Member?"}
              {confirmModal.type === "leaveTeam" && "Leave Team?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {confirmModal.type === "makeLeader" && `Are you sure you want to make ${confirmModal.memberName} the new team leader?`}
              {confirmModal.type === "kick" && `Are you sure you want to remove ${confirmModal.memberName} from the team?`}
              {confirmModal.type === "leaveTeam" && "Are you sure you want to leave this team? This action cannot be undone."}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal({ type: null, memberId: null, memberName: "" })}
                className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={
                  confirmModal.type === "makeLeader" 
                    ? confirmMakeLeader 
                    : confirmModal.type === "leaveTeam"
                    ? confirmLeaveTeam
                    : confirmKickMember
                }
                className={confirmModal.type === "makeLeader" 
                  ? "bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
                  : "bg-red-500 text-white hover:bg-red-500/90 press-effect"
                }
              >
                {confirmModal.type === "makeLeader" && "Make Leader"}
                {confirmModal.type === "kick" && "Remove"}
                {confirmModal.type === "leaveTeam" && "Leave Team"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Consent Modal */}
      {showVisibilityConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowVisibilityConsent(false)}
          />
          
          {/* Modal */}
          <div className="relative glass-card rounded-xl p-6 max-w-md mx-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand-cyan" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Make Profile Visible?
              </h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-foreground/80">
                By enabling profile visibility, you agree to the following:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan mt-1">•</span>
                  Your profile information (name, role, skills, bio) will be visible to all hackathon participants and teams.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan mt-1">•</span>
                  Teams can view your profile and send you invitations.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-cyan mt-1">•</span>
                  You can disable visibility at any time in your profile settings.
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVisibilityConsent(false)}
                className="border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 press-effect"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmVisibilityConsent}
                className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect"
              >
                <Eye className="w-4 h-4" />
                Enable Visibility
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

