"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, BookOpen, ChevronLeft, ChevronRight, Sparkles, Filter, X, ArrowLeft } from "lucide-react";
import { booksService, Book, BookCategory, BOOK_CATEGORIES, getCategoryLabel } from "@/lib/services/books";
import BookCard from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 12;

  const fetchBooks = useCallback(
    async (page: number, search: string, category: BookCategory | "") => {
      try {
        setLoading(true);
        const response = await booksService.getBooks({
          page,
          per_page: perPage,
          search: search || undefined,
          category: category || undefined,
        });
        setBooks(response.books);
        setTotalPages(Math.ceil(response.total / perPage));
        setTotal(response.total);
      } catch {
        toast.error("Failed to load books. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchBooks(currentPage, searchQuery, selectedCategory);
  }, [currentPage, fetchBooks, searchQuery, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: BookCategory | "") => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="pb-12 sm:pb-16 relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-navy-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Back */}
        <div className="pt-4 mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-navy-50 dark:hover:bg-navy-950 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-navy-600 dark:text-navy-400" />
            <span className="text-xs font-medium text-navy-700 dark:text-navy-300">Biblical Resources</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-serif">
            Explore Our{" "}
            <span className="gradient-text-hero">
              Book Collection
            </span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Discover biblical teachings, devotionals, and resources to deepen your walk with Christ.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 max-w-3xl mx-auto space-y-3">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 bg-background border border-border rounded-xl p-1.5 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder="Search by title, author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 sm:h-12 text-base border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 sm:h-12 px-3 ${showFilters ? "bg-navy-50 border-navy-300" : ""}`}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                size="lg"
                className="px-5 h-11 sm:h-12 bg-navy-gradient text-white font-semibold"
              >
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </form>

          {showFilters && (
            <div className="bg-background border border-border rounded-xl p-3 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Filter by Category</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                    <X className="w-3 h-3 mr-1" /> Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    selectedCategory === "" ? "bg-navy-500 text-white" : "bg-muted hover:bg-navy-100 text-foreground"
                  }`}
                >
                  All
                </button>
                {BOOK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      selectedCategory === cat.value ? "bg-navy-500 text-white" : "bg-muted hover:bg-navy-100 text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {!loading && (
          <div className="mb-5 flex items-center justify-between max-w-3xl mx-auto text-sm">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{total}</span> {total === 1 ? "book" : "books"}
              {searchQuery && <> for &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo;</>}
              {selectedCategory && <> in <span className="font-semibold text-navy-600 dark:text-navy-400">{getCategoryLabel(selectedCategory)}</span></>}
            </span>
            {totalPages > 1 && (
              <span className="text-muted-foreground">
                Page {currentPage}/{totalPages}
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => (
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
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-10 w-10 ${currentPage === pageNum ? "bg-navy-gradient text-white border-0" : ""}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto bg-navy-gradient rounded-2xl flex items-center justify-center shadow-lg mb-5">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-serif">No books found</h3>
            <p className="text-muted-foreground mb-5">
              {hasActiveFilters ? "Try adjusting your search or filters" : "Check back later for new books"}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
