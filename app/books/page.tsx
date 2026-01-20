"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BookOpen, ChevronLeft, ChevronRight, Sparkles, Filter, X, Home, ArrowLeft } from "lucide-react";
import { booksService, Book, BookCategory, BOOK_CATEGORIES, getCategoryLabel } from "@/lib/services/books";
import BookCard from "@/components/books/BookCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  const fetchBooks = async (page: number = 1, search: string = "", category: BookCategory | "" = "") => {
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
    } catch (error: any) {
      console.error("Failed to fetch books:", error);
      toast.error("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage, searchQuery, selectedCategory);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks(1, searchQuery, selectedCategory);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setCurrentPage(1);
      fetchBooks(1, "", selectedCategory);
    }
  };

  const handleCategoryChange = (category: BookCategory | "") => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchBooks(1, searchQuery, category);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
    fetchBooks(1, "", "");
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 sm:pb-20 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--primary-500)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--accent-500)]/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back to Home Button */}
          <div className="pt-4 sm:pt-6 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
              <span className="text-xs sm:text-sm font-medium text-[var(--primary-700)] dark:text-[var(--primary-300)]">
                Biblical Resources
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2 font-serif">
              Explore Our{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)]">
                Book Collection
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Discover biblical teachings, devotionals, and resources to deepen your walk with Christ.
            </p>
          </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 sm:mb-10 max-w-4xl mx-auto space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)]/20 to-[var(--accent-500)]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex gap-3 bg-background border border-[var(--border)] rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search by title, author, or description..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-12 pr-4 h-12 sm:h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-12 sm:h-14 px-4 ${showFilters ? 'bg-[var(--primary-50)] border-[var(--primary-300)]' : ''}`}
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-6 sm:px-8 h-12 sm:h-14 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Category Filter */}
          {showFilters && (
            <div className="bg-background border border-[var(--border)] rounded-xl p-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Filter by Category</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === ""
                      ? "bg-[var(--primary-500)] text-white"
                      : "bg-[var(--muted)] hover:bg-[var(--primary-100)] text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {BOOK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat.value
                        ? "bg-[var(--primary-500)] text-white"
                        : "bg-[var(--muted)] hover:bg-[var(--primary-100)] text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 sm:mb-8 flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <div className="w-2 h-2 rounded-full bg-[var(--primary-500)] animate-pulse" />
              <span className="text-muted-foreground">
                Found <span className="font-semibold text-foreground">{total}</span> {total === 1 ? "book" : "books"}
                {searchQuery && (
                  <span className="ml-1">
                    for "<span className="font-semibold text-foreground">{searchQuery}</span>"
                  </span>
                )}
                {selectedCategory && (
                  <span className="ml-1">
                    in <span className="font-semibold text-[var(--primary-600)]">{getCategoryLabel(selectedCategory)}</span>
                  </span>
                )}
              </span>
            </div>
            {totalPages > 1 && (
              <div className="text-sm sm:text-base text-muted-foreground">
                Page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
              </div>
            )}
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)] bg-background">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <div className="p-4 sm:p-6 space-y-3">
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 sm:gap-4 mt-12 sm:mt-16">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-4 sm:px-6 border-[var(--border)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-10 w-10 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white border-0"
                            : "border-[var(--border)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)]"
                        } transition-all`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-10 px-4 sm:px-6 border-[var(--border)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)] transition-all"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 sm:py-24 max-w-md mx-auto">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[var(--primary-500)]/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground font-serif">
              No books found
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-6">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Check back later for new books"}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-[var(--border)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-950)]"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
}
