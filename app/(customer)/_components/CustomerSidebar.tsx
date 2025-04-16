//app/(customer)/_components/CustomerSidebar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import ProfileSection from "./(sidebar)/ProfileSection";
import StatsSection from "./(sidebar)/StatsSection";
import NavigationLinks from "./(sidebar)/NavigationLinks";
import { SessionUser } from "@/app/SessionProvider";
import { User } from "./(sidebar)/types";

interface CustomerSidebarProps {
  user: SessionUser;
  orderCount: number;
  wishlistCount: number;
}

// Map SessionUser to User to ensure type compatibility
function mapSessionUserToUser(user: SessionUser): User {
  return {
    ...user,
    // Ensure tier is the expected type (optional, if SessionUser tier matches User tier values)
    tier: user.tier as User["tier"],
  };
}

export default function CustomerSidebar({
  user,
  orderCount,
  wishlistCount,
}: CustomerSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document
      .querySelector("main")
      ?.classList.remove(isCollapsed ? "ml-64" : "ml-16");
    document
      .querySelector("main")
      ?.classList.add(isCollapsed ? "ml-16" : "ml-64");
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="relative h-full">
      <aside
        className={`${isCollapsed ? "w-16" : "w-64"} bg-slate-700 text-white fixed top-0 left-0 h-full transition-all duration-300 overflow-hidden pt-16 z-10`}
      >
        {/* Profile Section */}
        <ProfileSection user={mapSessionUserToUser(user)} isCollapsed={isCollapsed} />

        {/* Stats Section */}
        {!isCollapsed && (
          <StatsSection orderCount={orderCount} wishlistCount={wishlistCount} />
        )}

        {/* Navigation Links */}
        <NavigationLinks isCollapsed={isCollapsed} currentPath={pathname} />
      </aside>

      {/* Toggle Button */}
      <div
        className={`fixed ${isCollapsed ? "left-16" : "left-64"} top-100 transition-all duration-300 z-20`}
      >
        <button
          onClick={toggleSidebar}
          className="bg-teal-500 text-white p-2 rounded-r-md w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}