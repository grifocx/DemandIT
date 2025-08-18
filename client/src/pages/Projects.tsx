import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { TopNavigation } from "@/components/layout/TopNavigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { ProjectTable } from "@/components/project/ProjectTable"

export default function Projects() {
  const { isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "/api/login"
      }, 500)
      return
    }
  }, [isAuthenticated, isLoading, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      
      <div className="flex h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="p-4 sm:p-6">
            <ProjectTable />
          </div>
        </main>
      </div>
    </div>
  )
}
