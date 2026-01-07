"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { booksService, Book } from "@/lib/services/books";
import BookCard from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await booksService.getFeaturedBooks(3);
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
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Featured Books
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
    <section className="py-20 lg:py-32 bg-[var(--primary-50)]/30 dark:bg-[var(--primary-950)]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Featured Books
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover handpicked stories that will take you on unforgettable journeys.
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            href="/books" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-background border-2 border-[var(--border)] rounded-lg font-semibold hover:border-[var(--primary-500)] hover:text-[var(--primary-600)] transition-all"
          >
            <span>View All Books</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
