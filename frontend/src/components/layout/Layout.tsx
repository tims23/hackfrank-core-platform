import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function Layout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

