"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
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
      <section className="py-16 sm:py-24 bg-[var(--muted)]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)] bg-background">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
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
    return (
      <section className="py-16 sm:py-24 bg-[var(--muted)]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Featured Books Yet</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for our handpicked recommendations
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary-500)] text-white font-semibold hover:bg-[var(--primary-600)] transition-all"
            >
              Browse All Books
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[var(--muted)]/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary-500)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-500)]/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-100)] to-[var(--accent-200)] dark:from-[var(--accent-900)]/50 dark:to-[var(--accent-800)]/50 border border-[var(--accent-300)] dark:border-[var(--accent-700)] mb-6">
            <Sparkles className="w-4 h-4 text-[var(--accent-600)] dark:text-[var(--accent-400)]" />
            <span className="text-sm font-semibold text-[var(--accent-700)] dark:text-[var(--accent-300)]">
              Editor's Picks
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Featured Resources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked biblical resources to strengthen your faith and deepen your understanding of God's Word
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12">
          {books.slice(0, 6).map((book, idx) => (
            <div 
              key={book.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            href="/books" 
            className="group inline-flex items-center gap-3 px-8 py-4 bg-background border-2 border-[var(--border)] rounded-2xl font-semibold text-base hover:border-[var(--primary-300)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all hover:shadow-lg"
          >
            <span>Explore All Books</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
