"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut, User, Menu, X, BookOpen, LayoutDashboard, Sun, Moon, Sparkles, ChevronRight } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/books", label: "Books" },
        { href: "#about", label: "About" },
        { href: "#contact", label: "Contact" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen
                    ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-[var(--border)]"
                    : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group"
                        onClick={closeMobileMenu}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-600)] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-800)] dark:from-[var(--primary-400)] dark:to-[var(--primary-300)]">
                                Hena Books (ብፅዕና)
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-wide hidden sm:block">
                                Biblical Resources
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Center */}
                    <div className="hidden md:flex items-center">
                        <div className="flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-[var(--muted)]/50 backdrop-blur-sm border border-[var(--border)]">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background hover:shadow-sm transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="relative p-2.5 rounded-full bg-[var(--muted)]/50 hover:bg-[var(--muted)] border border-[var(--border)] text-muted-foreground hover:text-foreground transition-all duration-200"
                                aria-label="Toggle theme"
                            >
                                <div className="relative w-5 h-5">
                                    <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${theme === "light" ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`} />
                                    <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`} />
                                </div>
                            </button>
                        )}

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-11 gap-2 pl-2 pr-3 rounded-full bg-[var(--muted)]/50 hover:bg-[var(--muted)] border border-[var(--border)] transition-all"
                                    >
                                        <Avatar className="h-7 w-7 border-2 border-[var(--primary-200)] dark:border-[var(--primary-700)]">
                                            <AvatarImage src="/avatars/01.png" alt={user.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white font-semibold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                                            {user.name.split(' ')[0]}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/profile" className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {user.role === "admin" && (
                                        <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href="/admin/dashboard" className="flex items-center">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2.5 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="group relative px-5 py-2.5 rounded-full text-sm font-semibold text-white overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] transition-all duration-300 group-hover:from-[var(--primary-600)] group-hover:to-[var(--primary-700)]" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-600)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4" />
                                        Get Started
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-[var(--muted)]/50 border border-[var(--border)] text-muted-foreground"
                                aria-label="Toggle theme"
                            >
                                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                        )}
                        <button
                            className="p-2 rounded-full bg-[var(--muted)]/50 border border-[var(--border)] text-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="py-4 space-y-2 border-t border-[var(--border)] bg-background rounded-b-2xl shadow-lg">
                        {/* Navigation Links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-[var(--muted)] transition-all"
                                onClick={closeMobileMenu}
                            >
                                {link.label}
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Link>
                        ))}

                        <div className="border-t border-[var(--border)] my-3" />

                        {user ? (
                            <>
                                {/* User Info Card */}
                                <div className="mx-2 p-4 rounded-2xl bg-gradient-to-br from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)] border border-[var(--primary-100)] dark:border-[var(--primary-800)]">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-[var(--primary-200)] dark:border-[var(--primary-700)]">
                                            <AvatarImage src="/avatars/01.png" alt={user.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground truncate">{user.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/profile"
                                    className="flex items-center justify-between mx-2 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-[var(--muted)] transition-all"
                                    onClick={closeMobileMenu}
                                >
                                    <span className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-[var(--primary-500)]" />
                                        My Profile
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </Link>

                                {user.role === "admin" && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="flex items-center justify-between mx-2 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-[var(--muted)] transition-all"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="flex items-center gap-3">
                                            <LayoutDashboard className="w-5 h-5 text-[var(--accent-500)]" />
                                            Admin Dashboard
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        logout();
                                        closeMobileMenu();
                                    }}
                                    className="flex items-center gap-3 w-full mx-2 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all text-left"
                                    style={{ width: 'calc(100% - 1rem)' }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 px-2 pt-2">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center px-4 py-3 rounded-xl text-base font-semibold text-foreground bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-all"
                                    onClick={closeMobileMenu}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] shadow-lg transition-all"
                                    onClick={closeMobileMenu}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
