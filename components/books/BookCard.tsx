"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, User, Star } from "lucide-react";
import { Book, getCategoryLabel } from "@/lib/services/books";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="block h-full group">
      <div className="relative rounded-2xl overflow-hidden border border-border h-full flex flex-col bg-background hover:border-navy-300 transition-all duration-300 hover:shadow-xl active:scale-[0.98]">
        {/* Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center overflow-hidden">
          {book.cover_url ? (
            <>
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <span className="text-white/70 text-xs font-medium text-center">
                {getCategoryLabel(book.category)}
              </span>
            </div>
          )}

          {/* Category */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-navy-600 dark:text-navy-300 shadow">
              {getCategoryLabel(book.category)}
            </span>
          </div>

          {/* Featured */}
          {book.is_featured && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="flex items-center gap-0.5 px-2 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[10px] font-bold rounded-full shadow">
                <Star className="w-2.5 h-2.5 fill-current" /> Featured
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="text-sm sm:text-base font-bold mb-1 group-hover:text-navy-500 transition-colors line-clamp-2 leading-snug">
            {book.title}
          </h3>

          {book.author && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <User className="w-3 h-3" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
          )}

          {book.description && (
            <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1 hidden sm:block">
              {book.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
            {book.page_count ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="w-3 h-3" /> {book.page_count}p
              </span>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-1 text-navy-500 font-semibold text-xs">
              Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
