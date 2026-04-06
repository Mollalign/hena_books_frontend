"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, BookOpen, User, Tag, AlertTriangle, Search, Filter, Upload, Grid3X3, List } from "lucide-react";
import { booksService, Book, BookCategory, BOOK_CATEGORIES, getCategoryLabel } from "@/lib/services/books";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "OTHER" as BookCategory,
    scripture_focus: "",
    page_count: "",
    published_date: "",
    is_featured: false,
    is_published: true,
    book_file: null as File | null,
    cover_file: null as File | null,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getCategoryLabel(book.category).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchQuery, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await booksService.getAllBooks();
      setBooks(data);
      setFilteredBooks(data);
    } catch (error: any) {
      console.error("Failed to fetch books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.book_file) {
      toast.error("Please select a PDF file");
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      
      uploadFormData.append("title", formData.title);
      uploadFormData.append("book_file", formData.book_file);
      
      if (formData.author) {
        uploadFormData.append("author", formData.author);
      }
      if (formData.description) {
        uploadFormData.append("description", formData.description);
      }
      if (formData.scripture_focus) {
        uploadFormData.append("scripture_focus", formData.scripture_focus);
      }
      if (formData.published_date) {
        uploadFormData.append("published_date", formData.published_date);
      }
      
      uploadFormData.append("category", formData.category);
      
      if (formData.page_count && parseInt(formData.page_count) > 0) {
        uploadFormData.append("page_count", formData.page_count);
      }
      
      uploadFormData.append("is_featured", formData.is_featured ? "true" : "false");
      uploadFormData.append("is_published", formData.is_published ? "true" : "false");
      
      if (formData.cover_file) {
        uploadFormData.append("cover_file", formData.cover_file);
      }

      await booksService.uploadBook(uploadFormData);
      toast.success("Book uploaded successfully");
      setUploadDialogOpen(false);
      setFormData({
        title: "",
        author: "",
        description: "",
        category: "OTHER",
        scripture_focus: "",
        page_count: "",
        published_date: "",
        is_featured: false,
        is_published: true,
        book_file: null,
        cover_file: null,
      });
      fetchBooks();
    } catch (error: any) {
      console.error("Failed to upload book:", error);
      
      let errorMessage = "Failed to upload book";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => {
            const field = err.loc?.slice(-1)[0] || "field";
            return `${field}: ${err.msg}`;
          }).join(", ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const openDeleteDialog = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      setDeleting(true);
      await booksService.deleteBook(bookToDelete.id);
      toast.success(`"${bookToDelete.title}" deleted successfully`);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      fetchBooks();
    } catch (error: any) {
      console.error("Failed to delete book:", error);
      toast.error("Failed to delete book");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-4 sm:mt-8 lg:mt-12 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--primary-50)] dark:bg-[var(--primary-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] mb-2 sm:mb-3">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary-500)]" />
              <span className="text-[10px] sm:text-xs font-medium text-[var(--primary-600)] dark:text-[var(--primary-400)]">
                Library Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Book Collection
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
              {books.length} {books.length === 1 ? "book" : "books"} in your library
            </p>
          </div>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white shadow-lg shadow-[var(--primary-500)]/25 hover:shadow-xl hover:shadow-[var(--primary-500)]/30 hover:-translate-y-0.5 transition-all">
                <Upload className="w-4 h-4 mr-2" />
                Upload Book
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1rem)] max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-lg">
              <DialogHeader>
                <div className="flex items-center gap-2.5 sm:gap-3 mb-1 sm:mb-2">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] shadow-lg">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl">Upload New Book</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      Add a biblical resource to your library
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
                {/* Title */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Book Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="እግዚአብሔር ፍቅር ነው"
                    required
                    className="h-10 sm:h-11"
                  />
                </div>
                
                {/* Author */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="author" className="text-sm font-semibold">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="henok tesfaye"
                    className="h-10 sm:h-11"
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the book's content and spiritual value..."
                    className="w-full min-h-[100px] sm:min-h-[120px] px-3 py-2.5 sm:py-3 border border-[var(--border)] rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent transition-all resize-y"
                  />
                </div>
                
                {/* Page Count & Published Date */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="page_count" className="text-sm font-semibold">Page Count</Label>
                    <Input
                      id="page_count"
                      type="number"
                      value={formData.page_count}
                      onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                      placeholder="e.g., 250"
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="published_date" className="text-sm font-semibold">Published Date</Label>
                    <Input
                      id="published_date"
                      type="date"
                      value={formData.published_date}
                      onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>
                
                {/* File Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="book_file" className="text-sm font-semibold">
                      PDF File <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="book_file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFormData({ ...formData, book_file: e.target.files?.[0] || null })}
                        required
                        className="h-10 sm:h-11 text-sm file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[var(--primary-50)] file:text-[var(--primary-600)] hover:file:bg-[var(--primary-100)] dark:file:bg-[var(--primary-950)] dark:file:text-[var(--primary-400)]"
                      />
                    </div>
                    {formData.book_file && (
                      <p className="text-xs text-muted-foreground truncate">
                        Selected: {formData.book_file.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="cover_file" className="text-sm font-semibold">Cover Image</Label>
                    <Input
                      id="cover_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, cover_file: e.target.files?.[0] || null })}
                      className="h-10 sm:h-11 text-sm file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[var(--accent-50)] file:text-[var(--accent-600)] hover:file:bg-[var(--accent-100)] dark:file:bg-[var(--accent-950)] dark:file:text-[var(--accent-400)]"
                    />
                    {formData.cover_file && (
                      <p className="text-xs text-muted-foreground truncate">
                        Selected: {formData.cover_file.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={uploading} 
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white font-semibold shadow-lg"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Book
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base bg-background/80 backdrop-blur-sm border-[var(--border)]"
            />
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-10 w-10 sm:h-12 sm:w-12"
            >
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-10 w-10 sm:h-12 sm:w-12"
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl sm:rounded-2xl border border-[var(--border)] overflow-hidden">
              <Skeleton className="h-32 sm:h-48 w-full" />
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-10 sm:py-16 px-4 border border-dashed border-[var(--border)] rounded-xl sm:rounded-2xl bg-[var(--muted)]/30">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[var(--primary-50)] dark:bg-[var(--primary-950)] mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <BookOpen className="w-7 h-7 sm:w-10 sm:h-10 text-[var(--primary-500)]" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 text-foreground">
            {searchQuery ? "No books found" : "Your library is empty"}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
            {searchQuery
              ? `No books match "${searchQuery}". Try a different search term.`
              : "Start building your collection by uploading your first book."
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Book
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="group rounded-xl sm:rounded-2xl border border-[var(--border)] bg-background overflow-hidden hover:shadow-xl hover:border-[var(--primary-200)] dark:hover:border-[var(--primary-800)] transition-all duration-300 hover:-translate-y-1"
            >
              {/* Cover */}
              <div className="relative h-32 sm:h-48 bg-gradient-to-br from-[var(--primary-100)] to-[var(--accent-100)] dark:from-[var(--primary-900)] dark:to-[var(--accent-900)]">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 sm:w-16 sm:h-16 text-[var(--primary-300)]" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
                  {book.is_featured && (
                    <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-[var(--accent-500)] text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-lg">
                      ⭐ Featured
                    </span>
                  )}
                  {!book.is_published && (
                    <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-gray-800/80 text-white text-[10px] sm:text-xs font-semibold rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                {/* Actions - always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 sm:pb-4 gap-1.5 sm:gap-2">
                  <Link href={`/books/${book.id}`}>
                    <Button size="sm" variant="secondary" className="h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 shadow-lg">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(book)}
                    className="h-7 sm:h-9 w-7 sm:w-auto px-0 sm:px-2 shadow-lg"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Details */}
              <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-3">
                <div>
                  <h3 className="text-xs sm:text-base font-semibold text-foreground line-clamp-1 group-hover:text-[var(--primary-600)] dark:group-hover:text-[var(--primary-400)] transition-colors">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-[10px] sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5 sm:mt-1">
                      <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">{book.author}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)] text-[10px] sm:text-xs font-medium rounded-full">
                    {getCategoryLabel(book.category)}
                  </span>
                  {book.page_count && (
                    <span className="hidden sm:inline-flex px-2.5 py-1 bg-[var(--muted)] text-muted-foreground text-xs rounded-full">
                      {book.page_count} pages
                    </span>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground pt-1.5 sm:pt-2 border-t border-[var(--border)]">
                  Added {new Date(book.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border border-[var(--border)] rounded-xl sm:rounded-2xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]/50">
                  <TableHead className="font-semibold text-xs sm:text-sm">Book</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Category</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Pages</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Added</TableHead>
                  <TableHead className="text-right font-semibold text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id} className="group hover:bg-[var(--muted)]/30">
                    <TableCell className="py-2 sm:py-4">
                      <div className="flex items-center gap-2.5 sm:gap-4">
                        <div className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-md sm:rounded-lg overflow-hidden bg-[var(--primary-50)] dark:bg-[var(--primary-950)] flex-shrink-0">
                          {book.cover_url ? (
                            <Image
                              src={book.cover_url}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-[var(--primary-400)]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-medium text-foreground line-clamp-1">{book.title}</p>
                          {book.author && (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{book.author}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                            <span className="px-1.5 py-0.5 bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)] text-[10px] font-medium rounded-full">
                              {getCategoryLabel(book.category)}
                            </span>
                            {book.is_published ? (
                              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] rounded font-medium">
                                Published
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] rounded font-medium">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="px-2.5 py-1 bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)] text-xs font-medium rounded-full">
                        {getCategoryLabel(book.category)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-2">
                        {book.is_published ? (
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded font-medium">
                            Draft
                          </span>
                        )}
                        {book.is_featured && (
                          <span className="px-2 py-1 bg-[var(--accent-100)] dark:bg-[var(--accent-900)] text-[var(--accent-700)] dark:text-[var(--accent-300)] text-xs rounded font-medium">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {book.page_count || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {new Date(book.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Link href={`/books/${book.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(book)}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-1rem)] max-w-md p-4 sm:p-6 rounded-xl sm:rounded-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-destructive/10">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg sm:text-xl">Delete Book</AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {bookToDelete && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--muted)]/50 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
              <div className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-md sm:rounded-lg overflow-hidden bg-[var(--primary-50)] dark:bg-[var(--primary-950)] flex-shrink-0">
                {bookToDelete.cover_url ? (
                  <Image
                    src={bookToDelete.cover_url}
                    alt={bookToDelete.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary-400)]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground truncate">{bookToDelete.title}</p>
                {bookToDelete.author && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">by {bookToDelete.author}</p>
                )}
              </div>
            </div>
          )}
          
          <p className="text-xs sm:text-sm text-muted-foreground">
            Are you sure you want to delete this book? All associated data including reading sessions and analytics will be permanently removed.
          </p>
          
          <AlertDialogFooter className="mt-4 sm:mt-6">
            <AlertDialogCancel disabled={deleting} className="h-10 sm:h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="h-10 sm:h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Book
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
