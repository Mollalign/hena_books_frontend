"use client";

import Link from "next/link";
import { BookOpen, Users, Clock, ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  stats?: {
    totalBooks: number;
    totalUsers: number;
    totalSessions: number;
  } | null;
}

export default function Hero({ stats }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center py-12 sm:py-16 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* Navy gradient orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--primary-600)]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 sm:w-[400px] sm:h-[400px] bg-gradient-to-tr from-[var(--accent-500)]/10 to-[var(--accent-400)]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--primary-500)]/5 rounded-full blur-3xl" />
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15v30M20 30h20' stroke='%231e3a5f' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)] border border-[var(--primary-200)] dark:border-[var(--primary-700)] shadow-sm">
            <Sparkles className="w-4 h-4 text-[var(--accent-500)]" />
            <span className="text-xs sm:text-sm font-medium text-[var(--primary-600)] dark:text-[var(--primary-300)]">
              Biblical Resources for Spiritual Growth
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight px-2 font-serif">
            Grow in{" "}
            <span className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-500)] via-[var(--primary-600)] to-[var(--accent-500)]">
              Faith & Wisdom
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Discover biblical teachings, devotionals, and resources to deepen your walk with Christ and transform your life.
          </p>

          {/* Scripture Quote */}
          <div className="max-w-xl mx-auto px-4">
            <div className="relative py-4 px-6 rounded-xl bg-gradient-to-r from-[var(--primary-50)]/50 to-[var(--accent-50)]/50 dark:from-[var(--primary-950)]/50 dark:to-[var(--primary-900)]/50 border border-[var(--primary-100)] dark:border-[var(--primary-800)]">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--primary-500)] to-[var(--accent-500)] rounded-l-xl" />
              <p className="text-sm sm:text-base italic text-muted-foreground font-serif">
                "Your word is a lamp to my feet and a light to my path."
              </p>
              <span className="block mt-2 text-sm font-semibold text-[var(--accent-600)] dark:text-[var(--accent-400)]">
                — Psalm 119:105
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
            <Link 
              href="/books" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl font-semibold text-sm sm:text-base hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] transition-all shadow-lg hover:shadow-xl hover:shadow-[var(--primary-500)]/20 hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Explore Books
            </Link>
            <Link 
              href="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-background border-2 border-[var(--border)] text-foreground rounded-xl font-semibold text-sm sm:text-base hover:border-[var(--accent-500)] hover:bg-[var(--accent-50)] dark:hover:bg-[var(--accent-950)] transition-all group"
            >
              Join Our Community
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12 lg:pt-16 max-w-2xl mx-auto px-4">
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] mx-auto mb-2 sm:mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 font-serif">
                  {stats.totalBooks}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Books</div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] mx-auto mb-2 sm:mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 font-serif">
                  {stats.totalUsers}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Readers</div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-400)] to-[var(--accent-500)] mx-auto mb-2 sm:mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 font-serif">
                  {stats.totalSessions}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Sessions</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
