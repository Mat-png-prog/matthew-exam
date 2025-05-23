//app/(customer)/SessionProvider.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Session as LuciaSession } from "lucia"

// Define the UserRole enum to match Prisma
export type UserRole = "USER" | "CUSTOMER" | "PROCUSTOMER" | "EDITOR" | "ADMIN" | "SUPERADMIN"

export type UserTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  postcode: string;
  country: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  tier: UserTier;
}

// ...rest of your SessionProvider logic

// Extend Lucia's Session type with our user type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser
}

// Define the context interface with both update functions
interface SessionContext {
  user: SessionUser
  session: SessionWithUser
  status: "loading" | "authenticated" | "unauthenticated"
  updateAvatar: (newAvatarUrl: string) => void
  updateBackground: (newBackgroundUrl: string) => void
}

const SessionContext = createContext<SessionContext | null>(null)

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: {
    user: SessionUser
    session: LuciaSession
  }
}) {
  // Use state to store the user data so we can update it
  const [userData, setUserData] = useState<SessionUser>(value.user)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    value.session ? "authenticated" : "unauthenticated",
  )

  // Function to update avatar URL in the session context
  const updateAvatar = (newAvatarUrl: string) => {
    setUserData((prevUser) => ({
      ...prevUser,
      avatarUrl: newAvatarUrl,
    }))
  }

  // Function to update background URL in the session context
  const updateBackground = (newBackgroundUrl: string) => {
    setUserData((prevUser) => ({
      ...prevUser,
      backgroundUrl: newBackgroundUrl,
    }))
  }

  // Transform the value to match our SessionContext type
  const sessionValue: SessionContext = {
    user: userData,
    session: {
      ...value.session,
      user: userData,
    },
    status,
    updateAvatar,
    updateBackground,
  }

  return <SessionContext.Provider value={sessionValue}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
