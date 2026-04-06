"use client";

import { useState, useEffect } from "react";
import {
  Users, BookOpen, Clock, TrendingUp, BookText,
  Sparkles, Activity, Eye, BarChart3,
} from "lucide-react";
import { analyticsService, OverviewStats } from "@/lib/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getOverviewStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard statistics"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Users", value: stats?.total_users || 0, icon: Users, color: "navy" },
    { title: "Books", value: stats?.total_books || 0, icon: BookOpen, color: "gold" },
    { title: "Sessions", value: stats?.total_reading_sessions || 0, icon: BookText, color: "emerald" },
    { title: "Hours", value: `${stats?.total_reading_time_hours?.toFixed(1) || 0}h`, icon: Clock, color: "violet" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 w-fit">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-xs font-medium text-navy-600 dark:text-navy-400">Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back 👋</h1>
            <p className="text-sm text-muted-foreground">Platform overview</p>
          </div>
          <Link
            href="/admin/dashboard/books"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-gradient text-white text-sm font-medium shadow-lg active:scale-[0.97] transition-transform self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" /> Manage Books
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? [...Array(4)].map((_, i) => (
              <Card key={i} className="bg-background/50">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-3" />
                  <Skeleton className="h-8 w-14" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              const colors: Record<string, { icon: string; bg: string }> = {
                navy: { icon: "text-navy-500", bg: "bg-navy-50 dark:bg-navy-950" },
                gold: { icon: "text-gold-500", bg: "bg-gold-50 dark:bg-gold-950" },
                emerald: { icon: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
                violet: { icon: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950" },
              };
              const c = colors[stat.color];
              return (
                <Card key={stat.title} className="bg-background/80 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${c.bg}`}>
                        <Icon className={`w-4 h-4 ${c.icon}`} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Activity & Popular Book */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-navy-500" /> Reader Activity
          </h2>
          {loading ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : (
            <>
              <Card className="bg-background/80">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-navy-gradient">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold">{stats?.active_readers_today || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background/80">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-navy-gradient">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active This Week</p>
                    <p className="text-2xl font-bold">{stats?.active_readers_week || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-gold-500" /> Most Popular
          </h2>
          {loading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : stats?.most_popular_book ? (
            <Card className="bg-background/80 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-36 h-40 sm:h-auto bg-gradient-to-br from-navy-100 to-gold-100 dark:from-navy-900 dark:to-gold-900 shrink-0">
                    {stats.most_popular_book.cover_url ? (
                      <Image src={stats.most_popular_book.cover_url} alt={stats.most_popular_book.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 144px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-navy-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-full bg-gold-500 text-white text-[10px] font-bold shadow">🏆 #1</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold">{stats.most_popular_book.title}</h3>
                      <p className="text-xs text-muted-foreground">Most read book</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniStat icon={Users} label="Readers" value={stats.most_popular_book.total_readers} />
                      <MiniStat icon={Eye} label="Sessions" value={stats.most_popular_book.total_sessions} />
                      <MiniStat icon={Clock} label="Hours" value={stats.most_popular_book.total_reading_time_hours.toFixed(1)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-background/80">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No Data Yet</h3>
                <p className="text-sm text-muted-foreground">Upload books to start tracking</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/admin/dashboard/books", icon: BookOpen, title: "Books", sub: "Upload & organize", color: "navy" },
          { href: "/admin/dashboard/users", icon: Users, title: "Users", sub: "Manage accounts", color: "gold" },
          { href: "/admin/dashboard/analytics", icon: BarChart3, title: "Analytics", sub: "Detailed insights", color: "emerald" },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/80 hover:shadow-lg transition-all active:scale-[0.98]">
            <div className={`p-2 rounded-lg ${action.color === "navy" ? "bg-navy-50 dark:bg-navy-950" : action.color === "gold" ? "bg-gold-50 dark:bg-gold-950" : "bg-emerald-50 dark:bg-emerald-950"}`}>
              <action.icon className={`w-5 h-5 ${action.color === "navy" ? "text-navy-500" : action.color === "gold" ? "text-gold-500" : "text-emerald-500"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="p-2 rounded-lg bg-muted/50 text-center">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
