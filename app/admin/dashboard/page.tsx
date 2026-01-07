"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  BookText,
  Sparkles,
} from "lucide-react";
import { analyticsService, OverviewStats } from "@/lib/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

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
      gradient: "from-[var(--primary-500)] to-[var(--primary-700)]",
      bgGradient: "from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)]",
    },
    {
      title: "Total Books",
      value: stats?.total_books || 0,
      icon: BookOpen,
      gradient: "from-[var(--accent-500)] to-[var(--accent-600)]",
      bgGradient: "from-[var(--accent-50)] to-[var(--accent-100)] dark:from-[var(--accent-950)] dark:to-[var(--accent-900)]",
    },
    {
      title: "Reading Sessions",
      value: stats?.total_reading_sessions || 0,
      icon: BookText,
      gradient: "from-[var(--primary-400)] to-[var(--accent-500)]",
      bgGradient: "from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--accent-950)]",
    },
    {
      title: "Total Reading Time",
      value: `${stats?.total_reading_time_hours.toFixed(1) || 0}h`,
      icon: Clock,
      gradient: "from-[var(--primary-600)] to-[var(--accent-500)]",
      bgGradient: "from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--accent-950)]",
    },
    {
      title: "Active Readers (Today)",
      value: stats?.active_readers_today || 0,
      icon: TrendingUp,
      gradient: "from-[var(--primary-500)] to-[var(--primary-600)]",
      bgGradient: "from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)]",
    },
    {
      title: "Active Readers (Week)",
      value: stats?.active_readers_week || 0,
      icon: TrendingUp,
      gradient: "from-[var(--accent-500)] to-[var(--primary-600)]",
      bgGradient: "from-[var(--accent-50)] to-[var(--primary-50)] dark:from-[var(--accent-950)] dark:to-[var(--primary-950)]",
    },
  ];

  return (
    <div className="relative min-h-screen pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--primary-500)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--accent-500)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8 pt-4">
        {/* Header */}
        <div className="space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
            <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
              Platform Insights
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-foreground">
              Dashboard{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)]">
                Overview
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Platform statistics and insights at a glance
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading
            ? [...Array(6)].map((_, i) => (
                <Card key={i} className="border border-[var(--border)] bg-background/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.title}
                    className="group border border-[var(--border)] bg-background/80 backdrop-blur-sm hover:shadow-xl hover:border-[var(--primary-300)] dark:hover:border-[var(--primary-700)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Most Popular Book */}
        {stats?.most_popular_book && (
          <Card className="border border-[var(--border)] bg-background/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Most Popular Book
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-xl bg-gradient-to-br from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--accent-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                {stats.most_popular_book.cover_url && (
                  <div className="relative w-full sm:w-32 sm:h-48 rounded-xl overflow-hidden shadow-xl ring-2 ring-[var(--primary-200)] dark:ring-[var(--primary-800)]">
                    <Image
                      src={stats.most_popular_book.cover_url}
                      alt={stats.most_popular_book.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 128px"
                    />
                  </div>
                )}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                      {stats.most_popular_book.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center p-3 rounded-lg bg-background/60 border border-[var(--border)]">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Readers</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {stats.most_popular_book.total_readers}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/60 border border-[var(--border)]">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sessions</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {stats.most_popular_book.total_sessions}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/60 border border-[var(--border)]">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Reading Time</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {stats.most_popular_book.total_reading_time_hours.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

