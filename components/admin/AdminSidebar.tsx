"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    title: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Dashboard stats",
  },
  {
    title: "Books",
    href: "/admin/dashboard/books",
    icon: BookOpen,
    description: "Manage library",
  },
  {
    title: "Users",
    href: "/admin/dashboard/users",
    icon: Users,
    description: "User management",
  },
  {
    title: "Analytics",
    href: "/admin/dashboard/analytics",
    icon: BarChart3,
    description: "View insights",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-[4.5rem] sm:top-[5.5rem] left-0 right-0 z-30 bg-background border-b border-[var(--border)] px-4 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-all"
          aria-label="Toggle menu"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center">
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Admin Dashboard</p>
              <p className="text-xs text-muted-foreground">
                {menuItems.find(item => item.href === pathname)?.title || "Menu"}
              </p>
            </div>
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            isOpen && "rotate-90"
          )} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-background border-r border-[var(--border)] z-40 transition-all duration-300 ease-out",
          "w-72 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Hena Books Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Main Menu
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary-500)]/25"
                        : "text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    )}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isActive 
                        ? "bg-white/20" 
                        : "bg-[var(--muted)] group-hover:bg-[var(--primary-100)] dark:group-hover:bg-[var(--primary-900)]"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-transform",
                        !isActive && "group-hover:scale-110 group-hover:text-[var(--primary-500)]"
                      )} />
                    </div>
                    <div className="flex-1 relative">
                      <span className="font-medium block">{item.title}</span>
                      <span className={cn(
                        "text-xs",
                        isActive ? "text-white/70" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 bg-white/30 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Links */}
            <div className="mt-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Quick Links
              </p>
              <div className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-medium">View Site</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Help Center</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-[var(--muted)] text-muted-foreground hover:text-destructive transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
