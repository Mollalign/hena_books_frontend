"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  BookText,
} from "lucide-react";
import { analyticsService, OverviewStats } from "@/lib/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Books",
      value: stats?.total_books || 0,
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Reading Sessions",
      value: stats?.total_reading_sessions || 0,
      icon: BookText,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Reading Time",
      value: `${stats?.total_reading_time_hours.toFixed(1) || 0}h`,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Active Readers (Today)",
      value: stats?.active_readers_today || 0,
      icon: TrendingUp,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Active Readers (Week)",
      value: stats?.active_readers_week || 0,
      icon: TrendingUp,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Platform statistics and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Most Popular Book */}
      {stats?.most_popular_book && (
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Book</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {stats.most_popular_book.cover_url && (
                <img
                  src={stats.most_popular_book.cover_url}
                  alt={stats.most_popular_book.title}
                  className="w-24 h-32 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {stats.most_popular_book.title}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Readers</p>
                    <p className="text-lg font-semibold">
                      {stats.most_popular_book.total_readers}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sessions</p>
                    <p className="text-lg font-semibold">
                      {stats.most_popular_book.total_sessions}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reading Time</p>
                    <p className="text-lg font-semibold">
                      {stats.most_popular_book.total_reading_time_hours.toFixed(
                        1
                      )}
                      h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

