"use client";

import Link from "next/link";
import Image from "next/image";
import { Book } from "@/lib/services/books";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] group cursor-pointer h-full flex flex-col bg-background hover:border-[var(--primary-500)] hover:shadow-lg transition-all duration-300">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-700)] flex items-center justify-center overflow-hidden">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <span className="text-8xl group-hover:scale-110 transition-transform duration-300">
              📚
            </span>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          {/* Featured Badge */}
          {book.is_featured && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-[var(--accent-500)] text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Book Info */}
        <div className="p-6 flex-1 flex flex-col bg-background">
          <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary-600)] transition-colors line-clamp-2">
            {book.title}
          </h3>
          {book.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
              {book.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {book.page_count && (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span>{book.page_count} pages</span>
                </>
              )}
            </div>

            <span className="text-[var(--primary-600)] font-semibold text-sm">
              Read Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
