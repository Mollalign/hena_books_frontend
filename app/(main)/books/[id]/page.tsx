"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, Users, Clock, ArrowLeft, BookText, User, Tag } from "lucide-react";
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
    if (!params.id) return;
    setLoading(true);
    booksService
      .getBookById(params.id as string)
      .then(setBook)
      .catch(() => {
        toast.error("Failed to load book details");
        router.push("/books");
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleReadNow = () => {
    if (!user) {
      toast.info("Please login to read books");
      router.push(`/login?from=${encodeURIComponent(`/books/${params.id}/read`)}`);
      return;
    }
    router.push(`/books/${params.id}/read`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-6 w-24 mb-5" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="py-4 sm:py-6 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Books
          </Link>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-10 animate-fade-in">
            {/* Cover */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-navy-400 to-navy-600 rounded-2xl overflow-hidden shadow-2xl">
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
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <BookText className="w-20 h-20 text-white/50" />
                  <span className="text-white/60 font-medium">{getCategoryLabel(book.category)}</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="category-badge">{getCategoryLabel(book.category)}</span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 font-serif leading-tight">
                  {book.title}
                </h1>
                {book.author && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="w-4 h-4 text-navy-500" />
                    <span>
                      by <span className="font-medium text-foreground">{book.author}</span>
                    </span>
                  </div>
                )}
                {book.scripture_focus && (
                  <div className="scripture-quote py-2 mb-3 text-sm">
                    📖 Scripture Focus: {book.scripture_focus}
                  </div>
                )}
                {book.description && (
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {book.page_count && (
                  <StatCard icon={BookOpen} label="Pages" value={book.page_count} color="navy" />
                )}
                {book.published_date && (
                  <StatCard
                    icon={Calendar}
                    label="Published"
                    value={new Date(book.published_date).getFullYear()}
                    color="gold"
                  />
                )}
                <StatCard icon={Users} label="Readers" value={book.total_readers || 0} color="navy" />
                <StatCard
                  icon={Clock}
                  label="Reading Time"
                  value={`${book.total_reading_time_hours.toFixed(1)}h`}
                  color="gold"
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <Link
                  href={`/books?category=${book.category}`}
                  className="category-badge hover:bg-navy-100 transition-colors"
                >
                  {getCategoryLabel(book.category)}
                </Link>
              </div>

              <Button
                onClick={handleReadNow}
                size="lg"
                className="w-full text-base py-5 bg-navy-gradient text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {user ? "Read Now" : "Login to Read"}
              </Button>

              {!user && (
                <p className="text-sm text-center text-muted-foreground">
                  <Link href={`/register?from=${encodeURIComponent(`/books/${params.id}/read`)}`} className="text-navy-500 hover:underline font-medium">
                    Create an account
                  </Link>{" "}
                  to start reading
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "navy" | "gold";
}) {
  const bg =
    color === "navy"
      ? "bg-navy-100 dark:bg-navy-900"
      : "bg-gold-100 dark:bg-gold-900";
  const iconBg =
    color === "navy"
      ? "bg-navy-50 dark:bg-navy-950"
      : "bg-gold-50 dark:bg-gold-950";
  const iconColor =
    color === "navy"
      ? "text-navy-600 dark:text-navy-400"
      : "text-gold-600 dark:text-gold-400";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border border-border hover:border-navy-300 transition-colors`}>
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
