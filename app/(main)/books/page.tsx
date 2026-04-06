"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { booksService, Book } from "@/lib/services/books";
import BookCard from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksService
      .getBooks({ page: 1, per_page: 50 })
      .then((res) => setBooks(res.books))
      .catch(() => toast.error("መጽሐፍትን መጫን አልተቻለም ።"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12 sm:pb-16 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="pt-4 mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-navy-50 dark:hover:bg-navy-950 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            መነሻ
          </Link>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            መጽሐፉን እዚህ ያገኙታል
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border bg-background">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <div className="p-3 sm:p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto bg-navy-gradient rounded-2xl flex items-center justify-center shadow-lg mb-5">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">መጽሐፉ አልተገኘም</h3>
            <p className="text-muted-foreground">በቅርብ ይመለሱ</p>
          </div>
        )}
      </div>
    </div>
  );
}
