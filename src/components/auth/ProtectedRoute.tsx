import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireParticipant?: boolean
}

export function ProtectedRoute({ children, requireParticipant = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasParticipantAccess, isParticipantLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!requireParticipant) {
    return <>{children}</>
  }

  if (isParticipantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking participant access...</p>
      </div>
    )
  }

  if (!hasParticipantAccess) {
    return <Navigate to="/application/form" replace />
  }

  return <>{children}</>
}

