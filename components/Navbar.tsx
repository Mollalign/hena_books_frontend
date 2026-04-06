"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  BookOpen,
  Home,
  Info,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const getNavLinks = (language: string) => [
  { href: "/", label: language === "am" ? "መነሻ" : "Home", icon: Home },
  { href: "/books", label: language === "am" ? "መጽሐፍት" : "Books", icon: BookOpen },
  { href: "#about", label: language === "am" ? "ስለ እኛ" : "About", icon: Info },
  { href: "#contact", label: language === "am" ? "ግንኙነት" : "Contact", icon: MessageCircle },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navLinks = getNavLinks(language);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const close = useCallback(() => setIsMobileMenuOpen(false), []);
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
          ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border"
          : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" onClick={close}>
              <Image
                src="/logo.jpeg"
                alt="ብፅዕና"
                width={40}
                height={40}
                className="rounded-full shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-lg font-bold tracking-tight text-navy-700 dark:text-navy-400">
                ብፅዕና
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-muted/50 backdrop-blur-sm border border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background hover:shadow-sm transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {mounted && (
                <>
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-2 flex items-center gap-1.5 text-xs font-bold rounded-full bg-muted/50 hover:bg-muted border border-border text-foreground transition-all uppercase"
                  >
                    <span className="text-sm leading-none">{language === "am" ? "🇺🇸" : "🇪🇹"}</span>
                    <span>{language === "am" ? "EN" : "AM"}</span>
                  </button>
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="p-2.5 rounded-full bg-muted/50 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Toggle theme"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-11 gap-2 pl-2 pr-3 rounded-full bg-muted/50 hover:bg-muted border border-border"
                    >
                      <Avatar className="h-7 w-7 border-2 border-navy-200 dark:border-navy-700">
                        <AvatarFallback className="bg-navy-gradient text-white font-semibold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[100px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" /> {language === "am" ? "መገለጫ" : "Profile"}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/admin/dashboard" className="flex items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> {language === "am" ? "ዳሽቦርድ" : "Dashboard"}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> {language === "am" ? "ውጣ" : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {language === "am" ? "ግባ" : "Login"}
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-gradient"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> {language === "am" ? "ተመዝገብ" : "Register"}
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: toggles + hamburger */}
            <div className="flex md:hidden items-center gap-1.5">
              {mounted && (
                <>
                  <button
                    onClick={toggleLanguage}
                    className="h-8 px-2 flex items-center gap-1 text-[10px] font-bold rounded-md bg-muted/50 border border-border text-foreground uppercase active:scale-95 transition-transform"
                  >
                    <span className="text-xs leading-none">{language === "am" ? "🇺🇸" : "🇪🇹"}</span>
                    <span>{language === "am" ? "EN" : "AM"}</span>
                  </button>
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="h-8 w-8 rounded-md bg-muted/50 border border-border text-muted-foreground flex items-center justify-center active:scale-95 transition-transform"
                    aria-label="Toggle theme"
                  >
                    {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
              <button
                className="relative w-9 h-9 rounded-lg bg-muted/50 border border-border text-foreground flex items-center justify-center active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`absolute transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"}`}>
                  <X className="w-4.5 h-4.5" />
                </span>
                <span className={`absolute transition-all duration-300 ${isMobileMenuOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"}`}>
                  <Menu className="w-4.5 h-4.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={close} />

        {/* Compact sheet panel */}
        <div
          className={`absolute top-16 left-0 right-0 bg-background border-b border-border shadow-xl overflow-y-auto max-h-[calc(100dvh-4rem)] transition-all duration-250 ease-out ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
        >
          <div className="px-4 py-3">
            {/* Nav links — compact row style */}
            <div className="space-y-0.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                    onClick={close}
                  >
                    <Icon className="w-4 h-4 text-navy-500 dark:text-navy-400 shrink-0" />
                    <span className="flex-1">{link.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-border my-2.5" />

            {/* User section */}
            {user ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-8 w-8 border-2 border-navy-200 dark:border-navy-700">
                    <AvatarFallback className="bg-navy-gradient text-white font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  onClick={close}
                >
                  <User className="w-4 h-4 text-navy-500 dark:text-navy-400" />
                  <span className="flex-1">{language === "am" ? "መገለጫ" : "Profile"}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                </Link>

                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    onClick={close}
                  >
                    <LayoutDashboard className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                    <span className="flex-1">{language === "am" ? "ዳሽቦርድ" : "Dashboard"}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </Link>
                )}

                <button
                  onClick={() => { logout(); close(); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === "am" ? "ውጣ" : "Logout"}</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors active:scale-[0.98]"
                  onClick={close}
                >
                  {language === "am" ? "ግባ" : "Login"}
                </Link>
                <Link
                  href="/register"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-navy-gradient shadow-md active:scale-[0.98] transition-transform"
                  onClick={close}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === "am" ? "ተመዝገብ" : "Register"}
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
