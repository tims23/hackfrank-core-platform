import { Brain, Lightbulb, Monitor, Github } from "lucide-react"
import { Button } from "@/components/ui"
import { Link } from "react-router-dom"

// Case Categories - all in cyan
const cases = [
  {
    id: "ai-data",
    name: "AI & Data Intelligence",
    sponsor: "Deutsche Bank",
    icon: Brain,
    githubUrl: "https://github.com",
    description: "A data-centered case on the use of real-world datasets to extract actionable insights. Teams should apply machine learning, and statistical methods to analyze, predict, and visualize data, drive smarter decision-making.",
  },
  {
    id: "insight",
    name: "Insight Platform",
    sponsor: "Accenture",
    icon: Monitor,
    githubUrl: "https://github.com",
    description: "User-facing tool creation case — participants decide on the type of solution between web or mobile apps, or other — the goal is to make data accessible and actionable or ease processes within an organization, creating a user-friendly, high-impact product.",
  },
  {
    id: "business",
    name: "Business Innovation",
    sponsor: "McKinsey & Company",
    icon: Lightbulb,
    githubUrl: "https://github.com",
    description: "Strategic, low-technical-barrier case designed to be accessible to participants from less-technical backgrounds. The focus is on developing innovative business concepts and showing feasibility and impact via an MVP, over coding depth.",
  },
]

export function Cases() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-14 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight">
          About the <span className="text-brand-cyan">Cases</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Choose from three distinct challenge tracks designed for different skills and interests.
        </p>
      </div>

      {/* Cases Grid */}
      <div className="space-y-4">
        {cases.map((caseItem, index) => {
          const Icon = caseItem.icon
          return (
            <div 
              key={caseItem.id}
              className="glass-card rounded-xl p-5 sm:p-6 card-hover animate-slide-up group"
              style={{ animationDelay: `${(index + 1) * 0.08}s` }}
            >
              {/* Header Row */}
              <div className="flex items-start gap-4 mb-4">
                {/* Icon */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-brand-cyan/15 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-11 h-11 rounded-lg bg-brand-cyan/10 flex items-center justify-center icon-hover border border-brand-cyan/10">
                    <Icon className="w-5 h-5 text-brand-cyan" />
                  </div>
                </div>
                
                {/* Title & Sponsor */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-lg font-medium text-brand-cyan mb-0.5 tracking-tight">
                    {caseItem.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sponsored by <span className="text-foreground/60">{caseItem.sponsor}</span>
                  </p>
                </div>

                {/* GitHub Button */}
                <Button 
                  size="sm" 
                  className="shrink-0 bg-brand-cyan text-background hover:bg-brand-cyan/90 text-xs press-effect font-medium"
                  asChild
                >
                  <a href={caseItem.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                </Button>
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {caseItem.description}
              </p>
              
              {/* Footer */}
              <div className="pt-4 border-t border-border/20">
                <Link 
                  to={`/cases/${caseItem.id}`}
                  className="inline-flex items-center gap-1 text-sm text-brand-cyan/70 hover:text-brand-cyan transition-colors link-hover press-effect"
                >
                  View case details
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
