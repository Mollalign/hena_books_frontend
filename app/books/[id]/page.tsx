"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  BookText,
} from "lucide-react";
import { booksService, BookDetail } from "@/lib/services/books";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await booksService.getBookById(params.id as string);
        setBook(data);
      } catch (error: any) {
        console.error("Failed to fetch book:", error);
        toast.error("Failed to load book details");
        router.push("/books");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBook();
    }
  }, [params.id, router]);

  const handleReadNow = () => {
    if (!user) {
      toast.info("Please login to read books");
      router.push("/login");
      return;
    }
    router.push(`/books/${params.id}/read`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Books
          </Link>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 animate-fade-in">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-700)] rounded-2xl overflow-hidden shadow-2xl">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookText className="w-32 h-32 text-white/50" />
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {book.title}
                </h1>
                {book.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {book.page_count && (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pages</p>
                      <p className="text-xl font-bold">{book.page_count}</p>
                    </div>
                  </div>
                )}

                {book.published_date && (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Published
                      </p>
                      <p className="text-xl font-bold">
                        {new Date(book.published_date).getFullYear()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Readers</p>
                    <p className="text-xl font-bold">
                      {book.total_readers || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Reading Time
                    </p>
                    <p className="text-xl font-bold">
                      {book.total_reading_time_hours.toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Read Now Button */}
              <Button
                onClick={handleReadNow}
                size="lg"
                className="w-full text-lg py-6"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {user ? "Read Now" : "Login to Read"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

