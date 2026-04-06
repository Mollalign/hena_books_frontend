"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, User, BookText } from "lucide-react";
import { booksService, Book, getCategoryLabel } from "@/lib/services/books";
import { useLanguage } from "@/context/LanguageContext";

export default function BookSpotlight() {
  const { language } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksService
      .getBooks({ page: 1, per_page: 6 })
      .then((res) => setBooks(res.books))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="h-6 w-36 bg-muted rounded-lg animate-pulse mx-auto mb-6" />
            <div className="h-48 bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) return null;

  const isSingle = books.length === 1;

  return (
    <section className="py-4 sm:py-6 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-3 sm:mb-4">
          <p className="text-xs font-semibold text-navy-500 dark:text-navy-400 tracking-widest uppercase mb-1.5">
            {language === "am" ? "መጽሐፉን" : "From the Library"}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold">
            {language === "am" ? "አሁን ያንብቡ" : "Read Now"}
          </h2>
        </div>

        {isSingle ? (
          <SingleBookSpotlight book={books[0]} language={language} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto">
            {books.map((book) => (
              <BookSpotlightCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SingleBookSpotlight({ book, language }: { book: Book; language: string }) {
  return (
    <div className="max-w-sm sm:max-w-2xl mx-auto">
      <Link href={`/books/${book.id}`} className="group block">
        <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-5 rounded-2xl bg-background border border-border hover:border-navy-300 dark:hover:border-navy-600 transition-all duration-300 hover:shadow-lg">
          {/* Cover */}
          <div className="relative w-20 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden shadow-md shrink-0 group-hover:shadow-lg transition-shadow duration-300">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 80px, 144px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center">
                <BookText className="w-10 h-10 text-white/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-full bg-navy-100 dark:bg-navy-900 text-navy-600 dark:text-navy-300 text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
              {getCategoryLabel(book.category)}
            </span>

            <h3 className="text-sm sm:text-xl font-bold mb-1 group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors leading-snug line-clamp-2">
              {book.title}
            </h3>

            {book.author && (
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2 sm:mb-3">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{book.author}</span>
              </div>
            )}

            {book.description && (
              <p className="hidden sm:block text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                {book.description}
              </p>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-navy-gradient shadow group-hover:shadow-md transition-all">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {language === "am" ? "ማንበብ ይጀምሩ" : "Start Reading"}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function BookSpotlightCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-border bg-background hover:border-navy-300 transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-navy-400 to-navy-600">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookText className="w-12 h-12 text-white/50" />
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold line-clamp-2 group-hover:text-navy-500 transition-colors">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
