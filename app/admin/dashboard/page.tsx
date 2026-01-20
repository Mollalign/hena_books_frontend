"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  BookText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  BarChart3,
} from "lucide-react";
import { analyticsService, OverviewStats } from "@/lib/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getOverviewStats();
        setStats(data);
      } catch (error: any) {
        console.error("Failed to fetch stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: Users,
      change: "+12%",
      changeType: "increase",
      color: "primary",
    },
    {
      title: "Total Books",
      value: stats?.total_books || 0,
      icon: BookOpen,
      change: "+5%",
      changeType: "increase",
      color: "accent",
    },
    {
      title: "Reading Sessions",
      value: stats?.total_reading_sessions || 0,
      icon: BookText,
      change: "+23%",
      changeType: "increase",
      color: "emerald",
    },
    {
      title: "Total Reading Time",
      value: `${stats?.total_reading_time_hours.toFixed(1) || 0}h`,
      icon: Clock,
      change: "+8%",
      changeType: "increase",
      color: "violet",
    },
  ];

  const activityCards = [
    {
      title: "Active Today",
      value: stats?.active_readers_today || 0,
      icon: Activity,
      description: "Readers currently engaged",
    },
    {
      title: "Active This Week",
      value: stats?.active_readers_week || 0,
      icon: TrendingUp,
      description: "Weekly active readers",
    },
  ];

  return (
    <div className="relative min-h-screen pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--primary-500)]/5 via-[var(--primary-400)]/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--accent-500)]/5 via-[var(--accent-400)]/3 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 pt-4">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--accent-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] shadow-sm">
            <Sparkles className="w-4 h-4 text-[var(--accent-500)]" />
            <span className="text-sm font-medium bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)] bg-clip-text text-transparent">
              Platform Analytics
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                Welcome back{" "}
                <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Here&apos;s what&apos;s happening with your platform
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/dashboard/books"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary-500)] text-white font-medium hover:bg-[var(--primary-600)] transition-all shadow-lg shadow-[var(--primary-500)]/25 hover:shadow-xl hover:shadow-[var(--primary-500)]/30 hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Manage Books</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? [...Array(4)].map((_, i) => (
                <Card key={i} className="border border-[var(--border)] bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-10 w-20 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = {
                  primary: {
                    bg: "bg-[var(--primary-500)]",
                    light: "bg-[var(--primary-50)] dark:bg-[var(--primary-950)]",
                    text: "text-[var(--primary-500)]",
                  },
                  accent: {
                    bg: "bg-[var(--accent-500)]",
                    light: "bg-[var(--accent-50)] dark:bg-[var(--accent-950)]",
                    text: "text-[var(--accent-500)]",
                  },
                  emerald: {
                    bg: "bg-emerald-500",
                    light: "bg-emerald-50 dark:bg-emerald-950",
                    text: "text-emerald-500",
                  },
                  violet: {
                    bg: "bg-violet-500",
                    light: "bg-violet-50 dark:bg-violet-950",
                    text: "text-violet-500",
                  },
                }[stat.color];

                return (
                  <Card
                    key={stat.title}
                    className="group border border-[var(--border)] bg-background/80 backdrop-blur-sm hover:shadow-xl hover:border-[var(--primary-200)] dark:hover:border-[var(--primary-800)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 relative">
                      {/* Background decoration */}
                      <div className={`absolute -top-12 -right-12 w-32 h-32 ${colorClasses?.light} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${colorClasses?.light}`}>
                            <Icon className={`w-6 h-6 ${colorClasses?.text}`} />
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>{stat.change}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold text-foreground tracking-tight">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Cards */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--primary-500)]" />
              Reader Activity
            </h2>
            {loading ? (
              <>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </>
            ) : (
              activityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.title}
                    className="border border-[var(--border)] bg-background/80 backdrop-blur-sm hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] shadow-lg">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                          <p className="text-4xl font-bold text-foreground">{card.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Most Popular Book */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[var(--accent-500)]" />
              Most Popular Book
            </h2>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : stats?.most_popular_book ? (
              <Card className="border border-[var(--border)] bg-background/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Book Cover */}
                    <div className="relative w-full md:w-48 h-64 md:h-auto bg-gradient-to-br from-[var(--primary-100)] to-[var(--accent-100)] dark:from-[var(--primary-900)] dark:to-[var(--accent-900)]">
                      {stats.most_popular_book.cover_url ? (
                        <Image
                          src={stats.most_popular_book.cover_url}
                          alt={stats.most_popular_book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 192px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-[var(--primary-300)]" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--accent-500)] text-white text-xs font-semibold shadow-lg">
                          🏆 #1 Popular
                        </span>
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 p-6 space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                          {stats.most_popular_book.title}
                        </h3>
                        <p className="text-muted-foreground">
                          The most read book on your platform
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-[var(--primary-500)]" />
                            <span className="text-xs text-muted-foreground">Readers</span>
                          </div>
                          <p className="text-2xl font-bold text-foreground">
                            {stats.most_popular_book.total_readers}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-50)] to-[var(--accent-100)] dark:from-[var(--accent-950)] dark:to-[var(--accent-900)] border border-[var(--accent-200)] dark:border-[var(--accent-800)]">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-[var(--accent-500)]" />
                            <span className="text-xs text-muted-foreground">Sessions</span>
                          </div>
                          <p className="text-2xl font-bold text-foreground">
                            {stats.most_popular_book.total_sessions}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">Hours</span>
                          </div>
                          <p className="text-2xl font-bold text-foreground">
                            {stats.most_popular_book.total_reading_time_hours.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <Link
                        href={`/books/${stats.most_popular_book.id}`}
                        className="inline-flex items-center gap-2 text-[var(--primary-500)] hover:text-[var(--primary-600)] font-medium transition-colors"
                      >
                        <span>View Book Details</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-[var(--border)] bg-background/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reading Data Yet</h3>
                  <p className="text-muted-foreground">
                    Upload books and start tracking reader engagement
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/dashboard/books"
            className="group p-6 rounded-2xl border border-[var(--border)] bg-background/80 backdrop-blur-sm hover:shadow-xl hover:border-[var(--primary-300)] dark:hover:border-[var(--primary-700)] transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--primary-50)] dark:bg-[var(--primary-950)] group-hover:bg-[var(--primary-100)] dark:group-hover:bg-[var(--primary-900)] transition-colors">
                <BookOpen className="w-6 h-6 text-[var(--primary-500)]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Manage Books</h3>
                <p className="text-sm text-muted-foreground">Upload & organize</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/users"
            className="group p-6 rounded-2xl border border-[var(--border)] bg-background/80 backdrop-blur-sm hover:shadow-xl hover:border-[var(--accent-300)] dark:hover:border-[var(--accent-700)] transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--accent-50)] dark:bg-[var(--accent-950)] group-hover:bg-[var(--accent-100)] dark:group-hover:bg-[var(--accent-900)] transition-colors">
                <Users className="w-6 h-6 text-[var(--accent-500)]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">User Management</h3>
                <p className="text-sm text-muted-foreground">View & manage users</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/analytics"
            className="group p-6 rounded-2xl border border-[var(--border)] bg-background/80 backdrop-blur-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors">
                <BarChart3 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Detailed insights</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
}
