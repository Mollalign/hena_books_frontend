"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut, User, Menu, X, BookOpen, Settings, LayoutDashboard, Sun, Moon } from "lucide-react";

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
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on escape key
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

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md border-b border-[var(--border)] transition-all duration-300"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 sm:gap-2.5 group"
                        onClick={closeMobileMenu}
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl md:text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                            Hena Books
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link 
                            href="/" 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all duration-200"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/books" 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all duration-200"
                        >
                            Books
                        </Link>
                        <Link 
                            href="#about" 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all duration-200"
                        >
                            About
                        </Link>
                        <Link 
                            href="#contact" 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all duration-200"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Dark Mode Toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all"
                                aria-label="Toggle theme"
                            >
                                {theme === "light" ? (
                                    <Moon className="w-5 h-5" />
                                ) : (
                                    <Sun className="w-5 h-5" />
                                )}
                            </button>
                        )}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="relative h-10 w-10 rounded-full hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                            <AvatarImage src="/avatars/01.png" alt={user.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] text-white font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
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
                            <>
                                <Link 
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground hover:text-[var(--primary-600)] transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    href="/register"
                                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)] transition-all shadow-md hover:shadow-lg"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 top-16 md:top-20 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobileMenu}
                    />
                )}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out mobile-menu-content relative z-50 ${
                        isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="py-3 border-t border-[var(--border)] bg-background overflow-y-auto max-h-[calc(100vh-5rem)] shadow-lg">
                        <div className="flex flex-col gap-1 px-2">
                            {/* Navigation Links */}
                            <Link 
                                href="/" 
                                className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all"
                                onClick={closeMobileMenu}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/books" 
                                className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all"
                                onClick={closeMobileMenu}
                            >
                                Books
                            </Link>
                            <Link 
                                href="#about" 
                                className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all"
                                onClick={closeMobileMenu}
                            >
                                About
                            </Link>
                            <Link 
                                href="#contact" 
                                className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all"
                                onClick={closeMobileMenu}
                            >
                                Contact
                            </Link>
                            
                            <div className="border-t border-[var(--border)] my-2" />
                            
                            {/* Dark Mode Toggle - Mobile */}
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all flex items-center gap-2"
                                >
                                    {theme === "light" ? (
                                        <>
                                            <Moon className="w-4 h-4" />
                                            Dark Mode
                                        </>
                                    ) : (
                                        <>
                                            <Sun className="w-4 h-4" />
                                            Light Mode
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {user ? (
                                <>
                                    <div className="border-t border-[var(--border)] my-2" />
                                    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-[var(--primary-300)] dark:border-[var(--primary-700)]">
                                                <AvatarImage src="/avatars/01.png" alt={user.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] text-white font-semibold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {user.role === "admin" && (
                                        <Link
                                            href="/admin/dashboard"
                                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all flex items-center gap-2"
                                            onClick={closeMobileMenu}
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeMobileMenu();
                                        }}
                                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all flex items-center gap-2 text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="border-t border-[var(--border)] my-2" />
                                    <div className="flex flex-col gap-2 px-2">
                                        <Link 
                                            href="/login" 
                                            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] hover:text-[var(--primary-600)] transition-all text-center border border-[var(--border)] hover:border-[var(--primary-300)]"
                                            onClick={closeMobileMenu}
                                        >
                                            Sign In
                                        </Link>
                                        <Link 
                                            href="/register" 
                                            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)] transition-all shadow-md text-center"
                                            onClick={closeMobileMenu}
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
