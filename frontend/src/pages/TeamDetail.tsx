import { Link, useParams, Navigate } from "react-router-dom"
import { Building2, GraduationCap, Users, Briefcase, ArrowLeft } from "lucide-react"
import { Button, Badge } from "@/components/ui"

// All teams data with full member info
const allTeams = [
  {
    id: 1,
    name: "Code Crusaders",
    description: "NLP-powered fraud detection. Let's go!",
    case: "AI & Data Intelligence",
    skills: ["React", "Python", "ML", "TensorFlow"],
    looking: false,
    members: [
      {
        id: 1,
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        role: "ML Engineer",
        affiliation: { type: "company" as const, name: "Google" },
        isLeader: true,
      },
      {
        id: 2,
        name: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "Full Stack Dev",
        affiliation: { type: "university" as const, name: "TU Munich" },
        isLeader: false,
      },
      {
        id: 4,
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        role: "Data Scientist",
        affiliation: { type: "university" as const, name: "LMU Munich" },
        isLeader: false,
      },
      {
        id: 6,
        name: "Tom Wilson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        role: "Backend Engineer",
        affiliation: { type: "company" as const, name: "Deutsche Bank" },
        isLeader: false,
      },
    ],
  },
  {
    id: 2,
    name: "Green Hackers",
    description: "Real-time energy dashboards for smart buildings.",
    case: "Insight Platform",
    skills: ["IoT", "Node.js", "PostgreSQL"],
    looking: true,
    members: [
      {
        id: 7,
        name: "Lisa Wang",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        role: "Frontend Dev",
        affiliation: { type: "university" as const, name: "TU Berlin" },
        isLeader: true,
      },
      {
        id: 8,
        name: "James Miller",
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
        role: "DevOps Engineer",
        affiliation: { type: "company" as const, name: "BMW" },
        isLeader: false,
      },
      {
        id: 11,
        name: "Maya Singh",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
        role: "Mobile Dev",
        affiliation: { type: "company" as const, name: "Siemens" },
        isLeader: false,
      },
    ],
  },
  {
    id: 3,
    name: "Security Squad",
    description: "Enterprise-grade anomaly detection at scale.",
    case: "AI & Data Intelligence",
    skills: ["Security", "Blockchain", "Go", "AWS"],
    looking: false,
    members: [
      {
        id: 12,
        name: "Chris Lee",
        avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        role: "Security Engineer",
        affiliation: { type: "university" as const, name: "KIT" },
        isLeader: true,
      },
      {
        id: 6,
        name: "Tom Wilson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        role: "Backend Engineer",
        affiliation: { type: "company" as const, name: "Deutsche Bank" },
        isLeader: false,
      },
      {
        id: 10,
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        role: "AI Researcher",
        affiliation: { type: "university" as const, name: "ETH Zürich" },
        isLeader: false,
      },
      {
        id: 8,
        name: "James Miller",
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
        role: "DevOps Engineer",
        affiliation: { type: "company" as const, name: "BMW" },
        isLeader: false,
      },
    ],
  },
  {
    id: 4,
    name: "Innovation Lab",
    description: "Disrupting fintech. Need bold thinkers!",
    case: "Business Innovation",
    skills: ["Figma", "React", "TypeScript"],
    looking: true,
    members: [
      {
        id: 3,
        name: "Elena Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        role: "UX Designer",
        affiliation: { type: "company" as const, name: "Accenture" },
        isLeader: true,
      },
      {
        id: 5,
        name: "Aisha Patel",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        role: "Product Manager",
        affiliation: { type: "company" as const, name: "McKinsey" },
        isLeader: false,
      },
    ],
  },
  {
    id: 5,
    name: "Data Wizards",
    description: "Predictive analytics for risk assessment.",
    case: "AI & Data Intelligence",
    skills: ["Python", "Pandas", "Scikit-learn"],
    looking: true,
    members: [
      {
        id: 4,
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        role: "Data Scientist",
        affiliation: { type: "university" as const, name: "LMU Munich" },
        isLeader: true,
      },
      {
        id: 9,
        name: "Nina Kowalski",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        role: "Business Analyst",
        affiliation: { type: "university" as const, name: "WHU" },
        isLeader: false,
      },
      {
        id: 10,
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        role: "AI Researcher",
        affiliation: { type: "university" as const, name: "ETH Zürich" },
        isLeader: false,
      },
    ],
  },
  {
    id: 6,
    name: "UX Pirates",
    description: "Beautiful interfaces that users actually love.",
    case: "Insight Platform",
    skills: ["Figma", "React", "Tailwind", "Framer"],
    looking: true,
    members: [
      {
        id: 3,
        name: "Elena Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        role: "UX Designer",
        affiliation: { type: "company" as const, name: "Accenture" },
        isLeader: true,
      },
      {
        id: 7,
        name: "Lisa Wang",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        role: "Frontend Dev",
        affiliation: { type: "university" as const, name: "TU Berlin" },
        isLeader: false,
      },
      {
        id: 11,
        name: "Maya Singh",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
        role: "Mobile Dev",
        affiliation: { type: "company" as const, name: "Siemens" },
        isLeader: false,
      },
    ],
  },
  {
    id: 7,
    name: "Pitch Perfect",
    description: "McKinsey-level decks. Killer pitches.",
    case: "Business Innovation",
    skills: ["Strategy", "PowerPoint", "Excel"],
    looking: true,
    members: [
      {
        id: 5,
        name: "Aisha Patel",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        role: "Product Manager",
        affiliation: { type: "company" as const, name: "McKinsey" },
        isLeader: true,
      },
      {
        id: 9,
        name: "Nina Kowalski",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        role: "Business Analyst",
        affiliation: { type: "university" as const, name: "WHU" },
        isLeader: false,
      },
    ],
  },
  {
    id: 8,
    name: "Neural Network",
    description: "Deep learning research meets real-world impact.",
    case: "AI & Data Intelligence",
    skills: ["PyTorch", "Python", "CUDA"],
    looking: true,
    members: [
      {
        id: 10,
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        role: "AI Researcher",
        affiliation: { type: "university" as const, name: "ETH Zürich" },
        isLeader: true,
      },
      {
        id: 1,
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        role: "ML Engineer",
        affiliation: { type: "company" as const, name: "Google" },
        isLeader: false,
      },
      {
        id: 4,
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        role: "Data Scientist",
        affiliation: { type: "university" as const, name: "LMU Munich" },
        isLeader: false,
      },
    ],
  },
]

export function TeamDetail() {
  const { teamId } = useParams()
  const numericTeamId = parseInt(teamId || "0", 10)
  
  // Find the team
  const team = allTeams.find(t => t.id === numericTeamId)
  
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
                {team.members.length}/4 members
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
            {team.members.map((member) => (
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

