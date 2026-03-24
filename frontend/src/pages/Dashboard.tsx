import { 
  Sparkles,
  ArrowRight,
  ChevronRight
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui"

const cases = [
  {
    id: "ai-data",
    name: "AI & Data Intelligence",
    sponsor: "Deutsche Bank",
    shortDesc: "Apply ML and data analysis to extract actionable insights from real-world datasets.",
  },
  {
    id: "insight",
    name: "Insight Platform",
    sponsor: "Accenture",
    shortDesc: "Build user-facing tools that make data accessible and processes easier.",
  },
  {
    id: "business",
    name: "Business Innovation",
    sponsor: "McKinsey & Company",
    shortDesc: "Develop innovative business concepts with focus on feasibility and impact.",
  },
]

const timelineSteps = [
  { id: 1, title: "Apply", description: "Submit your application" },
  { id: 2, title: "Find Team", description: "Join or create a team" },
  { id: 3, title: "Kick-off", description: "Attend opening ceremony" },
  { id: 4, title: "Hack", description: "48 hours of building" },
  { id: 5, title: "Submit", description: "Present your solution" },
]

export function Dashboard() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-cyan/10 border border-brand-cyan/20 mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-xs font-medium text-brand-cyan">Phase 1: Submit Applications</span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              Build the Future
              <span className="text-gradient"> Together</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-10 animate-slide-up stagger-1">
              Join 200+ developers, designers, and innovators in creating solutions 
              that matter. 48 hours to hack, learn, and connect.
            </p>
            
            {/* Navigation Cards */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12 animate-slide-up stagger-2">
              {/* Teams Card */}
              <Link 
                to="/teams"
                className="glass-card rounded-xl px-5 py-4 text-left group hover:border-brand-cyan/20 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-brand-cyan transition-colors">
                    Teams
                  </h3>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Find a team or create your own. Collaborate with others on exciting cases.
                </p>
              </Link>

              {/* Participants Card */}
              <Link 
                to="/participants"
                className="glass-card rounded-xl px-5 py-4 text-left group hover:border-brand-cyan/20 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-brand-cyan transition-colors">
                    Participants
                  </h3>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Discover other participants and find potential teammates with matching skills.
                </p>
              </Link>
            </div>

            {/* Cases Section */}
            <div className="max-w-5xl mx-auto animate-slide-up stagger-3">
              {/* Top Divider */}
              <div className="relative h-px mb-8">
                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-transparent via-border/80 to-transparent" />
                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/25 to-transparent blur-sm" />
              </div>

              {/* Cases Header */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-2">Choose Your Challenge</h2>
                <p className="text-sm text-muted-foreground">Three unique tracks designed for different skills and interests. Pick the one that excites you most.</p>
              </div>
              
              {/* Cases Grid with Dividers */}
              <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8">
                {/* Case 1 */}
                <div className="text-center">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {cases[0].name}
                  </h3>
                  <p className="text-sm text-brand-cyan/70 mb-3">{cases[0].sponsor}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {cases[0].shortDesc}
                  </p>
                  <Button size="sm" asChild>
                    <Link to={`/cases/${cases[0].id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>

                {/* Divider 1 */}
                <div className="hidden md:block relative w-px">
                  <div className="absolute inset-y-0 inset-x-0 bg-gradient-to-b from-transparent via-border/80 to-transparent" />
                  <div className="absolute inset-y-0 inset-x-0 bg-gradient-to-b from-transparent via-brand-cyan/25 to-transparent blur-sm" />
                </div>

                {/* Case 2 */}
                <div className="text-center">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {cases[1].name}
                  </h3>
                  <p className="text-sm text-brand-cyan/70 mb-3">{cases[1].sponsor}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {cases[1].shortDesc}
                  </p>
                  <Button size="sm" asChild>
                    <Link to={`/cases/${cases[1].id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>

                {/* Divider 2 */}
                <div className="hidden md:block relative w-px">
                  <div className="absolute inset-y-0 inset-x-0 bg-gradient-to-b from-transparent via-border/80 to-transparent" />
                  <div className="absolute inset-y-0 inset-x-0 bg-gradient-to-b from-transparent via-brand-cyan/25 to-transparent blur-sm" />
                </div>

                {/* Case 3 */}
                <div className="text-center">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {cases[2].name}
                  </h3>
                  <p className="text-sm text-brand-cyan/70 mb-3">{cases[2].sponsor}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {cases[2].shortDesc}
                  </p>
                  <Button size="sm" asChild>
                    <Link to={`/cases/${cases[2].id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Bottom Divider */}
              <div className="relative h-px mt-10">
                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-transparent via-border/80 to-transparent" />
                <div className="absolute inset-x-0 inset-x-0 bg-gradient-to-r from-transparent via-brand-cyan/25 to-transparent blur-sm" />
              </div>
            </div>

            {/* Timeline Section */}
            <div className="max-w-5xl mx-auto mt-12 animate-slide-up stagger-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Start Hack Timeline</h2>
              <p className="text-sm text-muted-foreground mb-8">From application to final pitch — here's your journey through the hackathon.</p>
              
              {/* Timeline Steps */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    {/* Step Box */}
                    <div className="glass-card rounded-lg px-4 py-3 text-center min-w-[120px]">
                      <div className="text-xs text-brand-cyan font-medium mb-1">Step {step.id}</div>
                      <h4 className="text-sm font-semibold text-foreground mb-0.5">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    
                    {/* Arrow (not after last item) */}
                    {index < timelineSteps.length - 1 && (
                      <ChevronRight className="hidden md:block w-5 h-5 text-brand-cyan/50 mx-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

