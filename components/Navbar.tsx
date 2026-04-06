"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
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
  { href: "/", label: language === "am" ? "መነሻ" : "Home" },
  { href: "/books", label: language === "am" ? "መጽሐፍት" : "Books" },
  { href: "#about", label: language === "am" ? "ስለ እኛ" : "About" },
  { href: "#contact", label: language === "am" ? "ግንኙነት" : "Contact" },
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

  const close = () => setIsMobileMenuOpen(false);
  const isDark = resolvedTheme === "dark";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-x-hidden ${isScrolled || isMobileMenuOpen
        ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 max-w-full overflow-hidden">
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

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 flex items-center gap-1.5 text-xs font-bold rounded-full bg-muted/50 border border-border text-foreground uppercase"
                >
                  <span className="text-sm leading-none">{language === "am" ? "🇺🇸" : "🇪🇹"}</span>
                  <span>{language === "am" ? "EN" : "AM"}</span>
                </button>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="p-2 rounded-full bg-muted/50 border border-border text-muted-foreground"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </>
            )}
            <button
              className="p-2 rounded-full bg-muted/50 border border-border text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="py-3 space-y-1 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-all active:scale-[0.98]"
                onClick={close}
              >
                {link.label}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}

            <div className="border-t border-border my-2" />

            {user ? (
              <>
                <div className="mx-2 p-4 rounded-2xl bg-gradient-to-br from-navy-50 to-gold-50 dark:from-navy-950 dark:to-navy-900 border border-navy-100 dark:border-navy-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-navy-200 dark:border-navy-700">
                      <AvatarFallback className="bg-navy-gradient text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center justify-between mx-2 px-4 py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-all active:scale-[0.98]"
                  onClick={close}
                >
                  <span className="flex items-center gap-3">
                    <User className="w-5 h-5 text-navy-500" /> {language === "am" ? "መገለጫ" : "Profile"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>

                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center justify-between mx-2 px-4 py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-all active:scale-[0.98]"
                    onClick={close}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 text-gold-500" /> {language === "am" ? "ዳሽቦርድ" : "Dashboard"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                )}

                <button
                  onClick={() => { logout(); close(); }}
                  className="flex items-center gap-3 w-[calc(100%-1rem)] mx-2 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all active:scale-[0.98] text-left"
                >
                  <LogOut className="w-5 h-5" /> {language === "am" ? "ውጣ" : "Logout"}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-2 pt-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center px-4 py-3.5 rounded-xl text-base font-semibold bg-muted hover:bg-muted/80 transition-all active:scale-[0.98]"
                  onClick={close}
                >
                  {language === "am" ? "ግባ" : "Login"}
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-semibold text-white bg-navy-gradient shadow-lg transition-all active:scale-[0.98]"
                  onClick={close}
                >
                  <Sparkles className="w-4 h-4" /> {language === "am" ? "ተመዝገብ" : "Register"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
