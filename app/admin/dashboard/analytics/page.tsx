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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into book performance and reader activity
        </p>
      </div>

      {/* Book Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Book Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg">
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
                  {bookStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No statistics available
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookStats.map((book) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reader Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reader Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg">
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
                  {readerActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No reader activity yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    readerActivity.map((reader) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

