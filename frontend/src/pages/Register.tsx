import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Input } from "@/components/ui"
import { useAuth } from "@/contexts"
import { Sparkles } from "lucide-react"

export function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }
    if (!password.trim()) {
      setError("Please enter a password")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    // Mock registration - in production, this would call an API
    const success = await login(email, password)
    setIsLoading(false)

    if (success) {
      navigate("/")
    } else {
      setError("Registration failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">
            Hack<span className="text-brand-cyan">Frank</span>
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-cyan/10 border border-brand-cyan/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-xs font-medium text-brand-cyan">Hackathon 2026</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-xl p-8 animate-slide-up stagger-1">
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Create Account</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Join the hackathon and start building
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-brand-cyan hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6 animate-slide-up stagger-2">
          48 hours to hack, learn, and connect.
        </p>
      </div>
    </div>
  )
}

