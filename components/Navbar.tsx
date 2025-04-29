//components/Navbar.tsx

//components/Navbar.tsx


"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/app/SessionProvider";
import { usePathname } from "next/navigation";
import UserButton from "@/components/UserButton";

// Static nav items
const NAV_ITEMS = [
  { name: "Home", path: "/" },
  { name: "Headwear", path: "/headwear" },
  { name: "Apparel", path: "/apparel" },
  { name: "All Collections", path: "/all-collections" },
];

// Only allow known roles
const dashboardRouteByRole: Record<string, string> = {
  EDITOR: "/editor",
  CUSTOMER: "/customer",
  PROCUSTOMER: "/pro",
  ADMIN: "/admin",
  SUPERADMIN: "/super-admin/routing-hub",
};

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const { user } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Determine dashboard path based on user role, only if role is recognized
  const dashboardPath =
    user && typeof user.role === "string" && dashboardRouteByRole[user.role]
      ? dashboardRouteByRole[user.role]
      : null;

  // Handles dashboard navigation with a hard refresh for extra security
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!dashboardPath) return;
    if (pathname === dashboardPath) {
      window.location.reload();
    } else {
      window.location.href = dashboardPath;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-b from-gray-900 to-black shadow-lg border-b border-red-700"
          : "bg-gradient-to-b from-gray-900 to-black"
      }`}
    >
      <nav className="container mx-auto px-7 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo_gh.png"
            alt="Genius Humans Logo"
            width={250}
            height={45}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="px-4 py-2 rounded-md text-gray-300 transition-all duration-300 
                hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 
                hover:scale-105 font-medium"
            >
              {item.name}
            </Link>
          ))}
          {user && dashboardPath && (
            <a
              href={dashboardPath}
              onClick={handleDashboardClick}
              className="px-4 py-2 rounded-md text-gray-300 transition-all duration-300 
                hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 
                hover:scale-105 font-medium"
            >
              My Dashboard
            </a>
          )}
          <div className="ml-2 text-gray-300 flex items-center gap-2">
            <UserButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <div className="text-gray-300 flex items-center gap-2">
            <UserButton />
          </div>
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-red-600/20"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span className="sr-only">Toggle menu</span>
          </button>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="absolute top-20 right-4 bg-black border border-red-700 rounded-md shadow-lg p-4 flex flex-col gap-2 z-50"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:scale-105 font-medium"
                >
                  {item.name}
                </Link>
              ))}
              {user && dashboardPath && (
                <a
                  href={dashboardPath}
                  onClick={handleDashboardClick}
                  className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:scale-105 font-medium"
                >
                  My Dashboard
                </a>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}


