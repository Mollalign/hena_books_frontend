"use client";

import { useState, useEffect } from "react";
import { analyticsService, BookStats, ReaderActivity } from "@/lib/services/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  BookText,
  Eye,
  FileText,
  Mail,
  Calendar
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [bookStats, setBookStats] = useState<BookStats[]>([]);
  const [readerActivity, setReaderActivity] = useState<ReaderActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [books, readers] = await Promise.all([
        analyticsService.getBookStats(),
        analyticsService.getReaderActivity(),
      ]);
      setBookStats(books);
      setReaderActivity(readers);
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = {
    totalReaders: bookStats.reduce((sum, book) => sum + book.total_readers, 0),
    totalSessions: bookStats.reduce((sum, book) => sum + book.total_sessions, 0),
    totalHours: bookStats.reduce((sum, book) => sum + book.total_reading_time_hours, 0),
    avgPagesPerBook: bookStats.length > 0 
      ? bookStats.reduce((sum, book) => sum + book.average_pages_read, 0) / bookStats.length 
      : 0,
  };

  return (
    <div className="space-y-8 mt-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Analytics Dashboard
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Platform Insights
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Detailed insights into book performance and reader engagement across your platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Readers", 
            value: totals.totalReaders, 
            icon: Users, 
            color: "primary",
            suffix: ""
          },
          { 
            label: "Total Sessions", 
            value: totals.totalSessions, 
            icon: Eye, 
            color: "accent",
            suffix: ""
          },
          { 
            label: "Reading Time", 
            value: totals.totalHours.toFixed(1), 
            icon: Clock, 
            color: "emerald",
            suffix: "h"
          },
          { 
            label: "Avg Pages/Book", 
            value: totals.avgPagesPerBook.toFixed(1), 
            icon: FileText, 
            color: "violet",
            suffix: ""
          },
        ].map((stat) => {
          const Icon = stat.icon;
          const colorMap = {
            primary: {
              bg: "bg-[var(--primary-50)] dark:bg-[var(--primary-950)]",
              icon: "bg-[var(--primary-500)]",
              text: "text-[var(--primary-500)]",
            },
            accent: {
              bg: "bg-[var(--accent-50)] dark:bg-[var(--accent-950)]",
              icon: "bg-[var(--accent-500)]",
              text: "text-[var(--accent-500)]",
            },
            emerald: {
              bg: "bg-emerald-50 dark:bg-emerald-950",
              icon: "bg-emerald-500",
              text: "text-emerald-500",
            },
            violet: {
              bg: "bg-violet-50 dark:bg-violet-950",
              icon: "bg-violet-500",
              text: "text-violet-500",
            },
          }[stat.color];

          return (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl border border-[var(--border)] ${colorMap?.bg} hover:shadow-lg transition-all`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${colorMap?.icon}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {loading ? "-" : stat.value}{stat.suffix}
              </p>
            </div>
          );
        })}
      </div>

      {/* Book Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--primary-500)]" />
            Book Performance
          </h2>
          <span className="text-sm text-muted-foreground">
            {bookStats.length} books tracked
          </span>
        </div>
        
        <Card className="border border-[var(--border)] bg-background/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : bookStats.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary-50)] dark:bg-[var(--primary-950)] mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[var(--primary-500)]" />
                </div>
                <h3 className="font-semibold mb-2">No Reading Data</h3>
                <p className="text-muted-foreground text-sm">
                  Statistics will appear once users start reading
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--muted)]/50">
                        <TableHead className="font-semibold">Book</TableHead>
                        <TableHead className="font-semibold text-center">Readers</TableHead>
                        <TableHead className="font-semibold text-center">Sessions</TableHead>
                        <TableHead className="font-semibold text-center">Reading Time</TableHead>
                        <TableHead className="font-semibold text-center">Avg Pages</TableHead>
                        <TableHead className="font-semibold">Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookStats.map((book, index) => {
                        const maxReaders = Math.max(...bookStats.map(b => b.total_readers));
                        const performancePercent = maxReaders > 0 ? (book.total_readers / maxReaders) * 100 : 0;
                        
                        return (
                          <TableRow key={book.book_id} className="hover:bg-[var(--muted)]/30">
                            <TableCell>
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  {index < 3 && (
                                    <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${
                                      index === 0 ? "bg-[var(--accent-500)]" :
                                      index === 1 ? "bg-gray-400" :
                                      "bg-amber-600"
                                    }`}>
                                      {index + 1}
                                    </div>
                                  )}
                                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-[var(--primary-50)] dark:bg-[var(--primary-950)] flex-shrink-0">
                                    {book.cover_url ? (
                                      <Image
                                        src={book.cover_url}
                                        alt={book.title}
                                        width={48}
                                        height={64}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-[var(--primary-400)]" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="font-medium text-foreground line-clamp-2">{book.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1 text-sm font-medium">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {book.total_readers}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1 text-sm font-medium">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                                {book.total_sessions}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1 text-sm font-medium">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                {book.total_reading_time_hours.toFixed(1)}h
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1 text-sm font-medium">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                {book.average_pages_read.toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="w-32">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] rounded-full transition-all"
                                      style={{ width: `${performancePercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-10">
                                    {performancePercent.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {bookStats.map((book, index) => (
                    <div
                      key={book.book_id}
                      className="border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="relative">
                          {index < 3 && (
                            <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${
                              index === 0 ? "bg-[var(--accent-500)]" :
                              index === 1 ? "bg-gray-400" :
                              "bg-amber-600"
                            }`}>
                              {index + 1}
                            </div>
                          )}
                          <div className="w-14 h-20 rounded-lg overflow-hidden bg-[var(--primary-50)] dark:bg-[var(--primary-950)] flex-shrink-0">
                            {book.cover_url ? (
                              <Image
                                src={book.cover_url}
                                alt={book.title}
                                width={56}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-[var(--primary-400)]" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                            {book.title}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span className="font-medium text-foreground">{book.total_readers}</span>
                              <span className="text-xs">readers</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium text-foreground">{book.total_sessions}</span>
                              <span className="text-xs">sessions</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium text-foreground">{book.total_reading_time_hours.toFixed(1)}h</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium text-foreground">{book.average_pages_read.toFixed(1)}</span>
                              <span className="text-xs">avg pages</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reader Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--accent-500)]" />
            Reader Activity
          </h2>
          <span className="text-sm text-muted-foreground">
            {readerActivity.length} active readers
          </span>
        </div>

        <Card className="border border-[var(--border)] bg-background/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : readerActivity.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-50)] dark:bg-[var(--accent-950)] mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-[var(--accent-500)]" />
                </div>
                <h3 className="font-semibold mb-2">No Reader Activity</h3>
                <p className="text-muted-foreground text-sm">
                  Activity will be tracked as users read books
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--muted)]/50">
                        <TableHead className="font-semibold">Reader</TableHead>
                        <TableHead className="font-semibold text-center">Books Read</TableHead>
                        <TableHead className="font-semibold text-center">Reading Time</TableHead>
                        <TableHead className="font-semibold">Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readerActivity.map((reader) => (
                        <TableRow key={reader.user_id} className="hover:bg-[var(--muted)]/30">
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-bold flex-shrink-0">
                                {reader.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{reader.user_name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {reader.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)] text-sm font-medium">
                              <BookText className="w-4 h-4" />
                              {reader.books_read}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              {reader.total_reading_time_hours.toFixed(1)}h
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(reader.last_active).toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {readerActivity.map((reader) => (
                    <div
                      key={reader.user_id}
                      className="border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {reader.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {reader.user_name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {reader.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)] text-sm font-medium">
                          <BookText className="w-4 h-4" />
                          {reader.books_read} books
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          {reader.total_reading_time_hours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5 pt-3 border-t border-[var(--border)]">
                        <Calendar className="w-4 h-4" />
                        Last active: {new Date(reader.last_active).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
