import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react"
import { MobileSidebarTrigger } from "./Sidebar"
import { cn } from "@/lib/utils"

export function TopNavigation() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useIsMobile()
  
  const handleLogout = () => {
    window.location.href = "/api/logout"
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Menu */}
            <MobileSidebarTrigger />
            
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white" data-testid="text-app-title">
                Demand-IT
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Global Search - Responsive */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={isMobile ? "Search..." : "Search portfolios, projects..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "bg-slate-800 text-white placeholder-slate-400 pl-10 pr-4 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none",
                  isMobile ? "w-32 sm:w-48" : "w-64 lg:w-80"
                )}
                data-testid="input-global-search"
              />
            </div>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                3
              </span>
            </Button>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center text-white hover:bg-slate-800 rounded-lg",
                    isMobile ? "space-x-1 px-2 py-2" : "space-x-3 px-3 py-2"
                  )}
                  data-testid="button-user-menu"
                >
                  <Avatar className={cn("flex-shrink-0", isMobile ? "h-7 w-7" : "h-8 w-8")}>
                    <AvatarImage src={user?.profileImageUrl || ""} alt="User profile" />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <div className="text-left min-w-0">
                      <div className="text-sm font-medium truncate" data-testid="text-user-name">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-slate-400 capitalize truncate" data-testid="text-user-role">
                        {user?.role?.replace("_", " ")}
                      </div>
                    </div>
                  )}
                  <ChevronDown className={cn("text-slate-400 flex-shrink-0", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="button-profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
