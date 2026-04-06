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
    booksService
      .getFeaturedBooks(6)
      .then(setBooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-6 w-32 mx-auto mb-3" />
            <Skeleton className="h-10 w-56 mx-auto mb-3" />
            <Skeleton className="h-5 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border bg-background">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-3 sm:p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
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
      <section className="py-12 sm:py-20 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-gradient flex items-center justify-center mx-auto mb-5 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Featured Books Yet</h3>
          <p className="text-muted-foreground mb-5">Check back soon for our handpicked recommendations</p>
          <Link href="/books" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-navy-500 text-white font-semibold">
            Browse All Books <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-100 to-gold-200 dark:from-gold-900/50 dark:to-gold-800/50 border border-gold-300 dark:border-gold-700 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            <span className="text-xs font-semibold text-gold-700 dark:text-gold-300">Editor&apos;s Picks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Featured Resources</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Handpicked biblical resources to strengthen your faith
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto mb-10">
          {books.slice(0, 6).map((book, idx) => (
            <div key={book.id} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/books"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-background border-2 border-border rounded-2xl font-semibold hover:border-navy-300 hover:bg-navy-50 dark:hover:bg-navy-950 transition-all active:scale-[0.97]"
          >
            Explore All Books
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
