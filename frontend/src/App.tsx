import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout"
import { ProtectedRoute } from "@/components/auth"
import { AuthProvider } from "@/contexts"
import { Dashboard, Teams, TeamDetail, Participants, Cases, CaseDetail, Profile, ProfileDetail, Login, Register } from "@/pages"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="teams" element={<Teams />} />
            <Route path="teams/:teamId" element={<TeamDetail />} />
            <Route path="participants" element={<Participants />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/:caseId" element={<CaseDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:userId" element={<ProfileDetail />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
