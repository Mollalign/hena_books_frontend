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
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Books", href: "/admin/dashboard/books", icon: BookOpen },
  { title: "Users", href: "/admin/dashboard/users", icon: Users },
  { title: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
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
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Hena Admin</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--primary-500)] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {item.title}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border/50">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-[18px] h-[18px] shrink-0" />
            View Site
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-border/50 shrink-0">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-none">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-background border-b border-border px-4 py-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {navItems.find(item => isActive(item.href))?.title || "Menu"}
          </span>
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-16 h-[calc(100dvh-4rem)] bg-background border-r border-border z-50 transition-transform duration-200 shadow-xl lg:shadow-none",
          "w-60",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
