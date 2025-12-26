import { Link, useParams, Navigate } from "react-router-dom"
import { Building2, GraduationCap, Users, Briefcase, ArrowLeft, UserPlus } from "lucide-react"
import { Button, Badge } from "@/components/ui"

// All participants data
const allParticipants = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    role: "ML Engineer",
    skills: ["Python", "TensorFlow", "NLP", "Keras", "SQL"],
    bio: "Passionate about applying ML to real-world problems. Looking to build something impactful this hackathon!",
    affiliation: { type: "company" as const, name: "Google" },
    teamId: 1,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "Full Stack Dev",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    bio: "Building scalable web applications. Always learning new technologies.",
    affiliation: { type: "university" as const, name: "TU Munich" },
    teamId: 1,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "UX Designer",
    skills: ["Figma", "Research", "Prototyping", "CSS", "Framer"],
    bio: "Creating intuitive user experiences. Design thinking enthusiast.",
    affiliation: { type: "company" as const, name: "Accenture" },
    teamId: null,
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "Data Scientist",
    skills: ["Python", "Pandas", "ML", "R", "Spark"],
    bio: "Turning data into actionable insights. Stats nerd and coffee addict.",
    affiliation: { type: "university" as const, name: "LMU Munich" },
    teamId: 1,
  },
  {
    id: 5,
    name: "Aisha Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    role: "Product Manager",
    skills: ["Strategy", "Agile", "Analytics", "SQL"],
    bio: "Bridging tech and business. Love solving complex problems.",
    affiliation: { type: "company" as const, name: "McKinsey" },
    teamId: null,
  },
  {
    id: 6,
    name: "Tom Wilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "Backend Engineer",
    skills: ["Go", "AWS", "Docker", "K8s", "Terraform"],
    bio: "Cloud infrastructure specialist. Building reliable systems at scale.",
    affiliation: { type: "company" as const, name: "Deutsche Bank" },
    teamId: 1,
  },
  {
    id: 7,
    name: "Lisa Wang",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    role: "Frontend Dev",
    skills: ["React", "TypeScript", "Tailwind", "Next.js"],
    bio: "Crafting beautiful and performant UIs. Open source contributor.",
    affiliation: { type: "university" as const, name: "TU Berlin" },
    teamId: null,
  },
  {
    id: 8,
    name: "James Miller",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
    role: "DevOps Engineer",
    skills: ["Kubernetes", "CI/CD", "Terraform", "AWS"],
    bio: "Automating everything. Making deployments boring (in a good way).",
    affiliation: { type: "company" as const, name: "BMW" },
    teamId: null,
  },
  {
    id: 9,
    name: "Nina Kowalski",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    role: "Business Analyst",
    skills: ["Excel", "SQL", "Tableau", "PowerBI"],
    bio: "Data-driven decision making. Visualizing insights that matter.",
    affiliation: { type: "university" as const, name: "WHU" },
    teamId: 2,
  },
  {
    id: 10,
    name: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    role: "AI Researcher",
    skills: ["PyTorch", "CUDA", "Research", "Python", "C++"],
    bio: "Pushing the boundaries of AI. PhD candidate focused on NLP.",
    affiliation: { type: "university" as const, name: "ETH Zürich" },
    teamId: 3,
  },
  {
    id: 11,
    name: "Maya Singh",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
    role: "Mobile Dev",
    skills: ["React Native", "Swift", "Kotlin", "Flutter"],
    bio: "Mobile-first mindset. Building apps that users love.",
    affiliation: { type: "company" as const, name: "Siemens" },
    teamId: null,
  },
  {
    id: 12,
    name: "Chris Lee",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    role: "Security Engineer",
    skills: ["Pentesting", "Blockchain", "Rust", "Go"],
    bio: "Breaking things to make them stronger. Security researcher.",
    affiliation: { type: "university" as const, name: "KIT" },
    teamId: null,
  },
]

// Teams data
const allTeams = [
  {
    id: 1,
    name: "Code Crusaders",
    description: "NLP-powered fraud detection. Let's go!",
    case: "AI & Data Intelligence",
    skills: ["React", "Python", "ML", "TensorFlow"],
    leaderId: 1,
  },
  {
    id: 2,
    name: "Pitch Perfect",
    description: "Crafting the perfect investor pitch.",
    case: "Business Innovation",
    skills: ["Strategy", "Analytics", "Presentation"],
    leaderId: 9,
  },
  {
    id: 3,
    name: "Neural Network",
    description: "Deep learning for market predictions.",
    case: "AI & Data Intelligence",
    skills: ["PyTorch", "ML", "Research", "Python"],
    leaderId: 10,
  },
]

export function ProfileDetail() {
  const { userId } = useParams()
  const numericUserId = parseInt(userId || "0", 10)
  
  // Find the user
  const user = allParticipants.find(p => p.id === numericUserId)
  
  // Redirect if user not found
  if (!user) {
    return <Navigate to="/participants" replace />
  }
  
  // Find user's team and team members
  const team = user.teamId ? allTeams.find(t => t.id === user.teamId) : null
  const teamMembers = team 
    ? allParticipants.filter(p => p.teamId === team.id)
    : []

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
            {user.teamId ? (
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
              {teamMembers.length}/4 members
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

