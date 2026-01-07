"use client";

import Link from "next/link";
import { BookOpen, Users, Clock, ArrowRight } from "lucide-react";

interface HeroProps {
  stats?: {
    totalBooks: number;
    totalUsers: number;
    totalSessions: number;
  } | null;
}

export default function Hero({ stats }: HeroProps) {
    return (
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center py-12 sm:py-16 lg:py-24">
            {/* Simple Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--primary-500)]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--accent-500)]/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                        <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                            Welcome to Hena Books
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight px-2">
                        Discover Stories That{" "}
                        <span className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                            Inspire
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                        Explore a collection of captivating books written with passion.
                        Dive into worlds of imagination, knowledge, and inspiration.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
                        <Link 
                            href="/books" 
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] text-white rounded-lg font-semibold text-sm sm:text-base hover:from-[var(--primary-700)] hover:to-[var(--primary-800)] transition-all shadow-lg hover:shadow-xl"
                        >
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                            Explore Books
                        </Link>
                        <Link 
                            href="/register" 
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-background border-2 border-[var(--border)] text-foreground rounded-lg font-semibold text-sm sm:text-base hover:border-[var(--primary-500)] hover:text-[var(--primary-600)] transition-all"
                        >
                            Create Account
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12 lg:pt-16 max-w-2xl mx-auto px-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] mx-auto mb-2 sm:mb-3">
                                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                                    {stats.totalBooks}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Books</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] mx-auto mb-2 sm:mb-3">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                                    {stats.totalUsers}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Readers</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--primary-400)] to-[var(--accent-500)] mx-auto mb-2 sm:mb-3">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                                    {stats.totalSessions}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Sessions</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
