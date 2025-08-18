/**
 * UserAvatar component - Single Responsibility Principle
 * Focused solely on displaying user avatars consistently
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@shared/schema"

interface UserAvatarProps {
  user?: User | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showName?: boolean
  namePosition?: "right" | "below"
  "data-testid"?: string
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10",
  xl: "h-12 w-12"
}

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg"
}

export function UserAvatar({ 
  user, 
  size = "md", 
  className = "", 
  showName = false,
  namePosition = "right",
  "data-testid": testId
}: UserAvatarProps) {
  const getUserInitials = (user?: User | null): string => {
    if (!user) return "?"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getDisplayName = (user?: User | null): string => {
    if (!user) return "Unassigned"
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Unknown User"
  }

  const avatarElement = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={user?.profileImageUrl || ""} alt={getDisplayName(user)} />
      <AvatarFallback className={textSizes[size]}>
        {getUserInitials(user)}
      </AvatarFallback>
    </Avatar>
  )

  if (!showName) {
    return <div data-testid={testId}>{avatarElement}</div>
  }

  if (namePosition === "below") {
    return (
      <div className="flex flex-col items-center space-y-1" data-testid={testId}>
        {avatarElement}
        <div className={`text-center ${textSizes[size]} text-slate-900`}>
          {getDisplayName(user)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2" data-testid={testId}>
      {avatarElement}
      <div className={`${textSizes[size]} text-slate-900`}>
        {getDisplayName(user)}
      </div>
    </div>
  )
}