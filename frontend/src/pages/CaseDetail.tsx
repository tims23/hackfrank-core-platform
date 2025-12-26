import { useParams, Link, Navigate } from "react-router-dom"
import { useState } from "react"
import { 
  Brain, 
  Lightbulb, 
  Monitor, 
  ArrowLeft, 
  Users, 
  Clock, 
  Target,
  Github,
  Info
} from "lucide-react"
import { 
  Button, 
  Badge,
} from "@/components/ui"

// Case data - 4 members, 24 hours for all
const casesData = {
  "ai-data": {
    id: "ai-data",
    name: "AI & Data Intelligence",
    sponsor: "Deutsche Bank",
    icon: Brain,
    githubUrl: "https://github.com",
    shortDescription: "A data-centered case on the use of real-world datasets to extract actionable insights.",
    fullDescription: "Teams should apply machine learning, and statistical methods to analyze, predict, and visualize data, drive smarter decision-making. This track is ideal for participants with a strong background in data science, statistics, or machine learning who want to tackle complex analytical challenges.",
    skills: ["Machine Learning", "Data Analysis", "Python", "Pandas", "Numpy", "TensorFlow", "PyTorch"],
    deliverables: [
      "Working ML model or data pipeline",
      "Technical documentation",
      "Presentation of insights and methodology",
      "Source code repository"
    ],
    inputs: [
      { 
        name: "Datasets", 
        items: [
          { title: "Transaction Data", description: "10M+ anonymized banking transactions with timestamps, amounts, and categories." },
          { title: "Customer Segments", description: "Pre-classified customer demographics and behavioral patterns." },
        ]
      },
      { 
        name: "APIs", 
        items: [
          { title: "Data Access API", description: "RESTful API for querying and filtering the provided datasets." },
          { title: "Model Submission API", description: "Endpoint for submitting and validating your ML models." },
        ]
      },
      { 
        name: "Documentation", 
        items: [
          { title: "Data Dictionary", description: "Complete schema documentation for all provided datasets." },
          { title: "API Reference", description: "Full API documentation with examples and authentication details." },
          { title: "Evaluation Metrics", description: "Detailed explanation of how submissions will be scored." },
        ]
      },
    ],
    criteria: [
      { name: "Model Accuracy", weight: 25, description: "How well does the model perform on test data? Measured by relevant metrics like precision, recall, F1-score, or RMSE." },
      { name: "Data Pipeline Quality", weight: 20, description: "Robustness and efficiency of data preprocessing, feature engineering, and ETL processes." },
      { name: "Innovation & Approach", weight: 15, description: "Creativity in problem-solving, novel use of algorithms, or unique analytical perspectives." },
      { name: "Code Quality", weight: 15, description: "Clean, readable, well-documented code with proper version control and reproducibility." },
      { name: "Insight Depth", weight: 15, description: "Quality and actionability of insights derived from the analysis. Business relevance of findings." },
      { name: "Presentation", weight: 10, description: "Clarity of technical communication, visualization quality, and ability to explain complex concepts." },
    ],
    difficulty: "Advanced",
    teamSize: "4 members",
    duration: "24 hours",
  },
  "insight": {
    id: "insight",
    name: "Insight Platform",
    sponsor: "Accenture",
    icon: Monitor,
    githubUrl: "https://github.com",
    shortDescription: "User-facing tool creation case — participants decide on the type of solution between web or mobile apps, or other.",
    fullDescription: "The goal is to make data accessible and actionable or ease processes within an organization, creating a user-friendly, high-impact product. This track combines technical skills with UX thinking to build tools that real users would love.",
    skills: ["Frontend Development", "UX/UI Design", "API Integration", "Prototyping", "React/Vue", "TypeScript", "Figma"],
    deliverables: [
      "Working web or mobile application",
      "User interface designs",
      "Technical architecture documentation",
      "Demo video or live presentation"
    ],
    inputs: [
      { 
        name: "APIs", 
        items: [
          { title: "Enterprise Data API", description: "Access to sample enterprise data for building dashboards and visualizations." },
          { title: "Authentication API", description: "OAuth 2.0 based authentication service for user management." },
          { title: "Notification Service", description: "Push notification and email delivery API." },
        ]
      },
      { 
        name: "Design Assets", 
        items: [
          { title: "UI Component Library", description: "Pre-built React/Vue components following the design system." },
          { title: "Icon Pack", description: "500+ custom icons in SVG format." },
          { title: "Brand Guidelines", description: "Colors, typography, and spacing specifications." },
        ]
      },
      { 
        name: "Documentation", 
        items: [
          { title: "API Reference", description: "Complete API documentation with code examples." },
          { title: "Design System Docs", description: "Guidelines for using the component library effectively." },
        ]
      },
    ],
    criteria: [
      { name: "User Experience", weight: 25, description: "Intuitive navigation, accessibility, and overall usability. How easy is it for users to accomplish their goals?" },
      { name: "Visual Design", weight: 15, description: "Aesthetic quality, consistency, and adherence to modern design principles and brand guidelines." },
      { name: "Technical Implementation", weight: 20, description: "Code architecture, performance optimization, and proper use of frameworks and best practices." },
      { name: "Feature Completeness", weight: 15, description: "Does the solution deliver on its core promises? Are key features fully functional?" },
      { name: "Innovation", weight: 15, description: "Creative solutions to user problems, unique features, or novel approaches to common challenges." },
      { name: "Demo & Documentation", weight: 10, description: "Quality of live demo, clarity of documentation, and ability to onboard new users or developers." },
    ],
    difficulty: "Intermediate",
    teamSize: "4 members",
    duration: "24 hours",
  },
  "business": {
    id: "business",
    name: "Business Innovation",
    sponsor: "McKinsey & Company",
    icon: Lightbulb,
    githubUrl: "https://github.com",
    shortDescription: "Strategic, low-technical-barrier case designed to be accessible to participants from less-technical backgrounds.",
    fullDescription: "The focus is on developing innovative business concepts and showing feasibility and impact via an MVP, over coding depth. This track encourages creative thinking about business models, market opportunities, and sustainable value creation.",
    skills: ["Business Strategy", "Market Analysis", "Pitching", "Design Thinking", "Excel", "PowerPoint", "No-Code Tools"],
    deliverables: [
      "Business model canvas",
      "Market analysis and validation",
      "MVP or prototype concept",
      "Pitch deck presentation"
    ],
    inputs: [
      { 
        name: "Market Data", 
        items: [
          { title: "Industry Reports", description: "Market size, growth rates, and trend analysis for key sectors." },
          { title: "Competitor Analysis", description: "Overview of existing players and their positioning." },
          { title: "Customer Surveys", description: "Anonymized survey data on customer preferences and pain points." },
        ]
      },
      { 
        name: "Templates", 
        items: [
          { title: "Business Model Canvas", description: "Editable template for structuring your business concept." },
          { title: "Financial Projection Sheet", description: "Excel template for revenue and cost modeling." },
          { title: "Pitch Deck Template", description: "PowerPoint template with recommended slide structure." },
        ]
      },
      { 
        name: "Tools", 
        items: [
          { title: "No-Code Builder Access", description: "Free access to Bubble.io or similar for MVP creation." },
          { title: "Survey Tool", description: "Typeform account for customer validation surveys." },
        ]
      },
    ],
    criteria: [
      { name: "Market Opportunity", weight: 20, description: "Size and attractiveness of the target market. Evidence of real customer need and willingness to pay." },
      { name: "Business Model", weight: 20, description: "Clarity of revenue streams, cost structure, and path to profitability. Sustainability of the model." },
      { name: "Competitive Advantage", weight: 15, description: "What makes this solution unique? Defensibility against competitors and barriers to entry." },
      { name: "Feasibility", weight: 15, description: "Realistic assessment of resources needed, timeline, and key risks. Credible execution plan." },
      { name: "Impact Potential", weight: 15, description: "Scalability of the solution and potential for significant positive impact on users or society." },
      { name: "Pitch Quality", weight: 15, description: "Compelling storytelling, clear value proposition, and professional presentation delivery." },
    ],
    difficulty: "Beginner-Friendly",
    teamSize: "4 members",
    duration: "24 hours",
  },
}

export function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>()
  const [selectedInput, setSelectedInput] = useState(0)
  
  const caseData = caseId ? casesData[caseId as keyof typeof casesData] : null
  
  if (!caseData) {
    return <Navigate to="/cases" replace />
  }

  const Icon = caseData.icon

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Link */}
      <div className="mb-8 animate-slide-up stagger-1">
        <Link 
          to="/cases" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors press-effect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="link-hover">Back to cases</span>
        </Link>
      </div>

      {/* Hero Section */}
      <header className="mb-10 animate-slide-up stagger-2">
        {/* Icon, Title & Buttons Row */}
        <div className="flex items-start justify-between gap-5 mb-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-cyan/20 rounded-xl blur-xl" />
              <div className="relative w-16 h-16 rounded-xl glass-card flex items-center justify-center icon-hover">
                <Icon className="w-8 h-8 text-brand-cyan icon-glow" />
              </div>
            </div>
            <div className="pt-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1.5 tracking-tight">
                {caseData.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Sponsored by <span className="text-white font-medium">{caseData.sponsor}</span>
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              size="sm" 
              className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect font-medium" 
              asChild
            >
              <a href={caseData.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Meta Pills */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal gap-1.5 glass-subtle text-xs px-3 py-1.5">
            <Target className="w-3 h-3 text-brand-cyan/70" />
            {caseData.difficulty}
          </Badge>
          <Badge variant="secondary" className="font-normal gap-1.5 glass-subtle text-xs px-3 py-1.5">
            <Users className="w-3 h-3 text-brand-cyan/70" />
            {caseData.teamSize}
          </Badge>
          <Badge variant="secondary" className="font-normal gap-1.5 glass-subtle text-xs px-3 py-1.5">
            <Clock className="w-3 h-3 text-brand-cyan/70" />
            {caseData.duration}
          </Badge>
        </div>
      </header>

      {/* Description Card */}
      <div className="glass-card rounded-xl p-6 mb-8 animate-slide-up stagger-3">
        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-4">
          {caseData.shortDescription}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {caseData.fullDescription}
        </p>
      </div>

      {/* Skills & Deliverables */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 py-6 animate-slide-up stagger-4">
        {/* Skills */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            Skills
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            These technical, conceptual, and programming skills will help you excel:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {caseData.skills.map((skill) => (
              <span 
                key={skill} 
                className="px-2.5 py-1 text-xs bg-secondary/40 text-foreground/70 rounded-md border border-border/20 transition-colors hover:border-brand-cyan/20 hover:text-foreground/90"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block relative w-px">
          <div className="absolute -inset-y-2 inset-x-0 bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="absolute -inset-y-2 inset-x-0 bg-gradient-to-b from-transparent via-brand-cyan/30 to-transparent blur-sm" />
        </div>

        {/* Deliverables */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            Deliverables
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Your team should submit the following by the end of the hackathon:
          </p>
          <ul className="space-y-2">
            {caseData.deliverables.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground group">
                <span className="w-1 h-1 rounded-full bg-brand-cyan/40 mt-2 shrink-0 group-hover:bg-brand-cyan transition-colors" />
                <span className="group-hover:text-foreground/70 transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider with reflection */}
      <div className="relative h-px my-4">
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent blur-sm" />
      </div>

      {/* Inputs */}
      <div className="py-6 animate-slide-up stagger-5">
        <h3 className="text-base font-semibold text-foreground mb-5">
          Inputs
        </h3>
        <div className="flex gap-6">
          {/* Input Tabs - Left Side */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {caseData.inputs.map((input, index) => (
              <button
                key={index}
                onClick={() => setSelectedInput(index)}
                className={`px-4 py-2.5 text-sm text-left rounded-lg transition-all cursor-pointer ${
                  selectedInput === index
                    ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30 border border-transparent'
                }`}
              >
                {input.name}
              </button>
            ))}
          </div>
          
          {/* Input Content - Right Side */}
          <div className="flex-1 rounded-lg bg-secondary/10 border border-border/20 p-5 h-[220px] overflow-y-auto">
            <div className="space-y-4">
              {caseData.inputs[selectedInput]?.items.map((item, index) => (
                <div key={index} className="group">
                  <h4 className="text-sm font-medium text-foreground mb-1 group-hover:text-brand-cyan transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider with reflection */}
      <div className="relative h-px my-4">
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent blur-sm" />
      </div>

      {/* Judging Criteria */}
      <div className="py-6 mb-4 animate-slide-up stagger-6">
        <h3 className="text-base font-semibold text-foreground mb-5">
          Judging Criteria
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {caseData.criteria.map((criterion, index) => (
            <div 
              key={index} 
              className="relative flex flex-col justify-between px-4 py-4 min-h-[88px] rounded-lg bg-secondary/20 border border-border/10 transition-all hover:border-brand-cyan/15 hover:bg-secondary/30 group"
            >
              {/* Info Icon - top right */}
              <div className="absolute top-3 right-3">
                <button
                  className="text-muted-foreground/40 hover:text-brand-cyan transition-colors p-0.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    const tooltip = e.currentTarget.nextElementSibling
                    if (tooltip) {
                      tooltip.classList.toggle('opacity-0')
                      tooltip.classList.toggle('opacity-100')
                      tooltip.classList.toggle('invisible')
                      tooltip.classList.toggle('visible')
                    }
                  }}
                  onBlur={(e) => {
                    const tooltip = e.currentTarget.nextElementSibling
                    if (tooltip) {
                      tooltip.classList.add('opacity-0', 'invisible')
                      tooltip.classList.remove('opacity-100', 'visible')
                    }
                  }}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 rounded-lg bg-card border border-border/50 shadow-lg text-xs text-muted-foreground opacity-0 invisible transition-all duration-200 z-50">
                  {criterion.description}
                  <div className="absolute right-3 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border/50" />
                </div>
              </div>
              
              {/* Weight - top left, large */}
              <span className="text-2xl font-semibold text-brand-cyan">
                {criterion.weight}%
              </span>
              
              {/* Criterion Name - bottom left */}
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors pr-6">
                {criterion.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider with reflection */}
      <div className="relative h-px my-10">
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -inset-x-8 inset-y-0 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent blur-sm" />
      </div>

      {/* CTA */}
      <footer className="text-center animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <p className="text-muted-foreground mb-6 text-sm">
          Ready to take on this challenge?
        </p>
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="bg-brand-cyan text-background hover:bg-brand-cyan/90 press-effect glow-sm hover:glow" 
            asChild
          >
            <Link to="/teams">
              <Users className="w-4 h-4" />
              Find a Team
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  )
}
