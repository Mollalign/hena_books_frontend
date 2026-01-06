"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      <section className="section bg-[var(--surface-light)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] text-sm font-semibold mb-4 dark:bg-[var(--primary-900)]/30 dark:text-[var(--primary-300)]">
              📖 Featured Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore <span className="gradient-text">Featured Books</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
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
        <section className="section bg-[var(--surface-light)]">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] text-sm font-semibold mb-4 dark:bg-[var(--primary-900)]/30 dark:text-[var(--primary-300)]">
                        📖 Featured Collection
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Explore <span className="gradient-text">Featured Books</span>
                    </h2>
                    <p className="text-[var(--muted)] max-w-2xl mx-auto">
                        Discover handpicked stories that will take you on unforgettable journeys.
                        Each book is crafted with care and passion.
                    </p>
                </div>

                {/* Books Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link href="/books" className="btn-primary text-lg px-8 py-4">
                        View All Books
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
