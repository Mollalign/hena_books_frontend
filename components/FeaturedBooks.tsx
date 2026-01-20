"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { booksService, Book } from "@/lib/services/books";
import BookCard from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await booksService.getFeaturedBooks(6);
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch featured books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-serif">
              Featured Resources
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)]">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-6 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--primary-50)]/30 dark:bg-[var(--primary-950)]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-100)] dark:bg-[var(--primary-900)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mb-4">
            <Sparkles className="w-4 h-4 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
            <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
              Recommended Reading
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-serif">
            Featured Resources
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Handpicked biblical resources to strengthen your faith and deepen your understanding of God's Word.
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto mb-8 sm:mb-12 px-2 sm:px-0">
          {books.slice(0, 6).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center px-4">
          <Link 
            href="/books" 
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-background border-2 border-[var(--border)] rounded-lg font-semibold text-sm sm:text-base hover:border-[var(--primary-500)] hover:text-[var(--primary-600)] transition-all"
          >
            <span>Explore All Books</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
