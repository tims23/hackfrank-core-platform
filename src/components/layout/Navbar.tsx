import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts"

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/teams", label: "Teams" },
  { href: "/participants", label: "Participants" },
  { href: "/cases", label: "Cases" },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-xl font-bold">
              Hack<span className="text-brand-cyan">Frank</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-brand-cyan/10 text-brand-cyan"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/profile"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
                location.pathname === "/profile"
                  ? "ring-1 ring-brand-cyan text-brand-cyan"
                  : "hover:bg-surface"
              )}
            >
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{user?.name?.split(" ")[0] || "Profile"}</span>
            </Link>
            <button
              onClick={() => {
                void handleLogout()
              }}
              className="p-2 rounded-md text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-cyan/10 text-brand-cyan"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <div className="mt-4 pt-4 border-t border-border">
                <Link 
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200",
                    location.pathname === "/profile"
                      ? "bg-brand-cyan/10 text-brand-cyan"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  )}
                >
                  <img 
                    src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    void handleLogout()
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all w-full cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

