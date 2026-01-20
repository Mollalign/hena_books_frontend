"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  BookText,
  User,
  Tag,
} from "lucide-react";
import { booksService, BookDetail, getCategoryLabel } from "@/lib/services/books";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
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
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--primary-500)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--accent-500)]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Books
          </Link>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12 animate-fade-in">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] rounded-2xl overflow-hidden shadow-2xl">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <BookText className="w-24 h-24 sm:w-32 sm:h-32 text-white/50" />
                  <span className="text-white/60 text-lg font-medium">
                    {getCategoryLabel(book.category)}
                  </span>
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="category-badge">
                  {getCategoryLabel(book.category)}
                </span>
              </div>
            </div>

            {/* Book Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 font-serif leading-tight">
                  {book.title}
                </h1>
                
                {/* Author */}
                {book.author && (
                  <div className="flex items-center gap-2 text-lg text-muted-foreground mb-3">
                    <User className="w-5 h-5 text-[var(--primary-500)]" />
                    <span>by <span className="font-medium text-foreground">{book.author}</span></span>
                  </div>
                )}
                
                {/* Scripture Focus */}
                {book.scripture_focus && (
                  <div className="scripture-quote py-3 mb-4">
                    <p className="text-lg">📖 Scripture Focus: {book.scripture_focus}</p>
                  </div>
                )}
                
                {/* Description */}
                {book.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {book.page_count && (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-[var(--border)] hover:border-[var(--primary-300)] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-100)] dark:bg-[var(--primary-900)] flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pages</p>
                      <p className="text-xl font-bold">{book.page_count}</p>
                    </div>
                  </div>
                )}

                {book.published_date && (
                  <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-[var(--border)] hover:border-[var(--primary-300)] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-100)] dark:bg-[var(--accent-900)] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[var(--accent-600)] dark:text-[var(--accent-400)]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Published</p>
                      <p className="text-xl font-bold">
                        {new Date(book.published_date).getFullYear()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-[var(--border)] hover:border-[var(--primary-300)] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary-100)] dark:bg-[var(--primary-900)] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Readers</p>
                    <p className="text-xl font-bold">
                      {book.total_readers || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-[var(--border)] hover:border-[var(--primary-300)] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-100)] dark:bg-[var(--accent-900)] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--accent-600)] dark:text-[var(--accent-400)]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reading Time</p>
                    <p className="text-xl font-bold">
                      {book.total_reading_time_hours.toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Tag */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                <Link 
                  href={`/books?category=${book.category}`}
                  className="category-badge hover:bg-[var(--primary-100)] transition-colors"
                >
                  {getCategoryLabel(book.category)}
                </Link>
              </div>

              {/* Read Now Button */}
              <Button
                onClick={handleReadNow}
                size="lg"
                className="w-full text-lg py-6 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white shadow-lg hover:shadow-xl transition-all"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {user ? "Read Now" : "Login to Read"}
              </Button>
              
              {!user && (
                <p className="text-sm text-center text-muted-foreground">
                  <Link href="/register" className="text-[var(--primary-600)] hover:underline font-medium">
                    Create an account
                  </Link>
                  {" "}to start reading
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
