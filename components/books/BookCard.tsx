"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, User, Star, Clock } from "lucide-react";
import { Book, getCategoryLabel } from "@/lib/services/books";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="block h-full group">
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] h-full flex flex-col bg-background hover:border-[var(--primary-300)] transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--primary-500)]/10">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center overflow-hidden">
          {book.cover_url ? (
            <>
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <span className="text-white/70 text-sm font-medium text-center">
                {getCategoryLabel(book.category)}
              </span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-xs font-semibold text-[var(--primary-600)] dark:text-[var(--primary-300)] shadow-lg">
              {getCategoryLabel(book.category)}
            </span>
          </div>
          
          {/* Featured Badge */}
          {book.is_featured && (
            <div className="absolute top-4 right-4 z-10">
              <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-600)] text-white text-xs font-bold rounded-full shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            </div>
          )}

          {/* Quick Actions on Hover */}
          <div className="absolute bottom-4 left-4 right-4 z-10 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                View Details
              </span>
              {book.page_count && (
                <span className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {book.page_count} pages
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--primary-500)] transition-colors line-clamp-2 leading-tight">
            {book.title}
          </h3>
          
          {/* Author */}
          {book.author && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <div className="w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
              <span className="line-clamp-1 font-medium">{book.author}</span>
            </div>
          )}
          
          {/* Scripture Focus */}
          {book.scripture_focus && (
            <p className="text-xs text-[var(--accent-600)] dark:text-[var(--accent-400)] font-semibold mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {book.scripture_focus}
            </p>
          )}
          
          {/* Description */}
          {book.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
              {book.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
            {book.page_count ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-lg bg-[var(--primary-50)] dark:bg-[var(--primary-950)] flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--primary-500)]" />
                </div>
                <span className="font-medium">{book.page_count} pages</span>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5 text-[var(--primary-500)] font-semibold text-sm group-hover:gap-2.5 transition-all">
              <span>Read Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
