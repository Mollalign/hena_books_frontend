"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";
import { Book } from "@/lib/services/books";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="block h-full">
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] group cursor-pointer h-full flex flex-col bg-background hover:border-[var(--primary-500)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-700)] flex items-center justify-center overflow-hidden">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center">
              <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-white/80 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Featured Badge */}
          {book.is_featured && (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-3 py-1.5 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-600)] text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                ⭐ Featured
              </span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col bg-background">
          <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[var(--primary-600)] dark:group-hover:text-[var(--primary-400)] transition-colors line-clamp-2 min-h-[3.5rem]">
            {book.title}
          </h3>
          {book.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
              {book.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              {book.page_count && (
                <>
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-[var(--primary-100)] dark:bg-[var(--primary-900)]">
                    <BookOpen className="w-3 h-3 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                  </div>
                  <span className="font-medium">{book.page_count} pages</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-[var(--primary-600)] dark:text-[var(--primary-400)] font-semibold text-sm group-hover:gap-2 transition-all">
              <span>Read</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
