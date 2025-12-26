import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Building2, GraduationCap } from "lucide-react"
import { Button, Badge, Input } from "@/components/ui"

const participants = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    role: "ML Engineer",
    skills: ["Python", "TensorFlow", "NLP", "Keras", "SQL"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "company", name: "Google" },
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "Full Stack Dev",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    lookingForTeam: false,
    team: "Code Crusaders",
    affiliation: { type: "university", name: "TU Munich" },
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "UX Designer",
    skills: ["Figma", "Research", "Prototyping", "CSS", "Framer"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "company", name: "Accenture" },
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "Data Scientist",
    skills: ["Python", "Pandas", "ML", "R", "Spark"],
    lookingForTeam: false,
    team: "Data Wizards",
    affiliation: { type: "university", name: "LMU Munich" },
  },
  {
    id: 5,
    name: "Aisha Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    role: "Product Manager",
    skills: ["Strategy", "Agile", "Analytics", "SQL"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "company", name: "McKinsey" },
  },
  {
    id: 6,
    name: "Tom Wilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "Backend Engineer",
    skills: ["Go", "AWS", "Docker", "K8s", "Terraform"],
    lookingForTeam: false,
    team: "Security Squad",
    affiliation: { type: "company", name: "Deutsche Bank" },
  },
  {
    id: 7,
    name: "Lisa Wang",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    role: "Frontend Dev",
    skills: ["React", "TypeScript", "Tailwind", "Next.js"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "university", name: "TU Berlin" },
  },
  {
    id: 8,
    name: "James Miller",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
    role: "DevOps Engineer",
    skills: ["Kubernetes", "CI/CD", "Terraform", "AWS"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "company", name: "BMW" },
  },
  {
    id: 9,
    name: "Nina Kowalski",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    role: "Business Analyst",
    skills: ["Excel", "SQL", "Tableau", "PowerBI"],
    lookingForTeam: false,
    team: "Pitch Perfect",
    affiliation: { type: "university", name: "WHU" },
  },
  {
    id: 10,
    name: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    role: "AI Researcher",
    skills: ["PyTorch", "CUDA", "Research", "Python", "C++"],
    lookingForTeam: false,
    team: "Neural Network",
    affiliation: { type: "university", name: "ETH Zürich" },
  },
  {
    id: 11,
    name: "Maya Singh",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
    role: "Mobile Dev",
    skills: ["React Native", "Swift", "Kotlin", "Flutter"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "company", name: "Siemens" },
  },
  {
    id: 12,
    name: "Chris Lee",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    role: "Security Engineer",
    skills: ["Pentesting", "Blockchain", "Rust", "Go"],
    lookingForTeam: true,
    team: null,
    affiliation: { type: "university", name: "KIT" },
  },
]

type FilterType = "all" | "searching" | "in-team"

export function Participants() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredParticipants = participants.filter(participant => {
    const matchesFilter = filter === "all" || 
      (filter === "searching" && participant.lookingForTeam) || 
      (filter === "in-team" && !participant.lookingForTeam)
    
    const matchesSearch = searchQuery === "" || 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-10 animate-slide-up">
        <div className="flex items-start justify-between gap-5 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 tracking-tight">
              Participants
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse participants and find your next teammate
            </p>
          </div>
          
          <Button 
            size="sm" 
            className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect font-medium"
            asChild
          >
            <Link to="/profile">
              My Profile
            </Link>
          </Button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up stagger-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, role, or skills..." 
            className="pl-10 bg-secondary/20 border-border/30 focus:border-brand-cyan/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
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
            variant={filter === "searching" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("searching")}
            className={filter === "searching" 
              ? "bg-brand-cyan text-background hover:bg-brand-cyan/90" 
              : "border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
            }
          >
            Looking for Team
          </Button>
          <Button 
            variant={filter === "in-team" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in-team")}
            className={filter === "in-team" 
              ? "bg-brand-cyan text-background hover:bg-brand-cyan/90" 
              : "border-border/50 hover:border-brand-cyan/30 hover:bg-brand-cyan/5"
            }
          >
            In a Team
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
        {filteredParticipants.length} {filteredParticipants.length === 1 ? 'participant' : 'participants'} found
      </p>

      {/* Participants Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredParticipants.map((participant, index) => (
          <Link 
            key={participant.id}
            to={`/profile/${participant.id}`}
            className="glass-card rounded-xl px-3 py-4 animate-slide-up group cursor-pointer hover:border-brand-cyan/20 transition-all"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {/* Avatar */}
            <div className="relative mb-3">
              <img 
                src={participant.avatar} 
                alt={participant.name}
                className="w-20 h-20 rounded-full mx-auto object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {participant.lookingForTeam && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <Badge className="bg-brand-cyan text-background border-0 text-[10px] px-1.5 font-medium">
                    Available
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-foreground group-hover:text-brand-cyan transition-colors truncate">
                {participant.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {participant.role}
              </p>
              
              {/* Affiliation */}
              <div className="flex items-center justify-center gap-1 mt-1 mb-2">
                {participant.affiliation.type === "university" ? (
                  <GraduationCap className="w-3 h-3 text-muted-foreground/60" />
                ) : (
                  <Building2 className="w-3 h-3 text-muted-foreground/60" />
                )}
                <span className="text-[10px] text-muted-foreground/80 truncate">
                  {participant.affiliation.name}
                </span>
              </div>

              {/* Skills - show up to 5 */}
              <div className="flex flex-wrap gap-1 justify-center">
                {participant.skills.slice(0, 5).map((skill) => (
                  <span 
                    key={skill} 
                    className="px-1.5 py-0.5 text-[10px] bg-secondary/40 text-foreground/60 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {participant.skills.length > 5 && (
                  <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    +{participant.skills.length - 5}
                  </span>
                )}
              </div>

              {/* Team */}
              {participant.team && (
                <p className="text-[10px] text-brand-cyan/70 mt-2 truncate">
                  {participant.team}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredParticipants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No participants found matching your criteria.</p>
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

          </div>
  )
}

