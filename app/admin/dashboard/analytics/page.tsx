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

  return (
    <div className="space-y-6 sm:space-y-8 mt-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-foreground">
          Analytics
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Detailed insights into book performance and reader activity
        </p>
      </div>

      {/* Book Statistics */}
      <Card className="border border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold">Book Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : bookStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No statistics available</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Readers</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Reading Time</TableHead>
                        <TableHead>Avg Pages</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookStats.map((book) => (
                        <TableRow key={book.book_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {book.cover_url && (
                                <Image
                                  src={book.cover_url}
                                  alt={book.title}
                                  width={40}
                                  height={60}
                                  className="object-cover rounded"
                                />
                              )}
                              <span className="font-medium">{book.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{book.total_readers}</TableCell>
                          <TableCell>{book.total_sessions}</TableCell>
                          <TableCell>
                            {book.total_reading_time_hours.toFixed(1)}h
                          </TableCell>
                          <TableCell>
                            {book.average_pages_read.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {bookStats.map((book) => (
                  <div
                    key={book.book_id}
                    className="border border-[var(--border)] rounded-lg p-4 bg-background space-y-3"
                  >
                    <div className="flex gap-3">
                      {book.cover_url && (
                        <Image
                          src={book.cover_url}
                          alt={book.title}
                          width={50}
                          height={75}
                          className="object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-2 text-foreground line-clamp-2">
                          {book.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Readers</p>
                            <p className="font-semibold text-foreground">{book.total_readers}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sessions</p>
                            <p className="font-semibold text-foreground">{book.total_sessions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reading Time</p>
                            <p className="font-semibold text-foreground">
                              {book.total_reading_time_hours.toFixed(1)}h
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Pages</p>
                            <p className="font-semibold text-foreground">
                              {book.average_pages_read.toFixed(1)}
                            </p>
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

      {/* Reader Activity */}
      <Card className="border border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold">Recent Reader Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : readerActivity.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reader activity yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Books Read</TableHead>
                        <TableHead>Reading Time</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readerActivity.map((reader) => (
                        <TableRow key={reader.user_id}>
                          <TableCell className="font-medium">
                            {reader.user_name}
                          </TableCell>
                          <TableCell>{reader.email}</TableCell>
                          <TableCell>{reader.books_read}</TableCell>
                          <TableCell>
                            {reader.total_reading_time_hours.toFixed(1)}h
                          </TableCell>
                          <TableCell>
                            {new Date(reader.last_active).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {readerActivity.map((reader) => (
                  <div
                    key={reader.user_id}
                    className="border border-[var(--border)] rounded-lg p-4 bg-background space-y-2"
                  >
                    <div>
                      <h3 className="font-semibold text-base text-foreground">
                        {reader.user_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{reader.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-[var(--border)]">
                      <div>
                        <p className="text-muted-foreground">Books Read</p>
                        <p className="font-semibold text-foreground">{reader.books_read}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reading Time</p>
                        <p className="font-semibold text-foreground">
                          {reader.total_reading_time_hours.toFixed(1)}h
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Active: {new Date(reader.last_active).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

