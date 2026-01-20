"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, BookOpen, User, Tag, AlertTriangle } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await booksService.getAllBooks();
      setBooks(data);
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
      
      // Required fields
      uploadFormData.append("title", formData.title);
      uploadFormData.append("book_file", formData.book_file);
      
      // Optional string fields - only append if not empty
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
      
      // Category - always send
      uploadFormData.append("category", formData.category);
      
      // Page count - only if valid number
      if (formData.page_count && parseInt(formData.page_count) > 0) {
        uploadFormData.append("page_count", formData.page_count);
      }
      
      // Boolean fields
      uploadFormData.append("is_featured", formData.is_featured ? "true" : "false");
      uploadFormData.append("is_published", formData.is_published ? "true" : "false");
      
      // Cover file - only if selected
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
      
      // Handle FastAPI validation errors (422)
      let errorMessage = "Failed to upload book";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          // FastAPI validation error format: [{loc: [...], msg: "...", type: "..."}]
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
    <div className="space-y-6 sm:space-y-8 mt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-foreground font-serif">
            Book Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage all biblical resources in the platform
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Upload Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-serif">Upload New Book</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Upload a biblical resource with PDF file and optional cover image
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., The Purpose Driven Life"
                  required
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author" className="text-sm font-medium">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="e.g., Rick Warren"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as BookCategory })
                    }
                    className="w-full mt-1 px-3 py-2 border border-[var(--border)] rounded-md bg-background text-foreground"
                    required
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="scripture_focus" className="text-sm font-medium">Scripture Focus</Label>
                <Input
                  id="scripture_focus"
                  value={formData.scripture_focus}
                  onChange={(e) =>
                    setFormData({ ...formData, scripture_focus: e.target.value })
                  }
                  placeholder="e.g., Romans 8:28, Philippians 4:13"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Key Bible verses this book focuses on
                </p>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the book's content and spiritual value..."
                  className="w-full min-h-[100px] px-3 py-2 border border-[var(--border)] rounded-md bg-background text-foreground mt-1 resize-y"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page_count" className="text-sm font-medium">Page Count</Label>
                  <Input
                    id="page_count"
                    type="number"
                    value={formData.page_count}
                    onChange={(e) =>
                      setFormData({ ...formData, page_count: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="published_date" className="text-sm font-medium">Published Date</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        published_date: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_published: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <span className="text-sm">Published</span>
                </label>
              </div>
              
              <div>
                <Label htmlFor="book_file" className="text-sm font-medium">PDF File *</Label>
                <Input
                  id="book_file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      book_file: e.target.files?.[0] || null,
                    })
                  }
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cover_file" className="text-sm font-medium">Cover Image</Label>
                <Input
                  id="cover_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cover_file: e.target.files?.[0] || null,
                    })
                  }
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={uploading} 
                className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white"
              >
                {uploading ? "Uploading..." : "Upload Book"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 border border-[var(--border)] rounded-lg bg-background">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground font-serif">No books found</h3>
          <p className="text-muted-foreground mb-4">Upload your first biblical resource to get started</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        {book.cover_url ? (
                          <Image
                            src={book.cover_url}
                            alt={book.title}
                            width={50}
                            height={75}
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-[50px] h-[75px] bg-[var(--primary-100)] dark:bg-[var(--primary-900)] rounded flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium font-serif">{book.title}</TableCell>
                      <TableCell>
                        {book.author ? (
                          <span className="flex items-center gap-1 text-sm">
                            <User className="w-3 h-3" />
                            {book.author}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="category-badge">
                          {getCategoryLabel(book.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {book.is_published && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded font-medium">
                              Published
                            </span>
                          )}
                          {book.is_featured && (
                            <span className="px-2 py-1 bg-[var(--accent-100)] dark:bg-[var(--accent-900)] text-[var(--accent-700)] dark:text-[var(--accent-300)] text-xs rounded font-medium">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{book.page_count || "-"}</TableCell>
                      <TableCell>
                        {new Date(book.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/books/${book.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(book)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="border border-[var(--border)] rounded-lg p-4 bg-background space-y-4"
              >
                <div className="flex gap-4">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      width={60}
                      height={90}
                      className="object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-[60px] h-[90px] bg-[var(--primary-100)] dark:bg-[var(--primary-900)] rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 text-foreground line-clamp-2 font-serif">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <User className="w-3 h-3" />
                        {book.author}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="category-badge text-xs">
                        {getCategoryLabel(book.category)}
                      </span>
                      {book.is_published && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded font-medium">
                          Published
                        </span>
                      )}
                      {book.is_featured && (
                        <span className="px-2 py-1 bg-[var(--accent-100)] dark:bg-[var(--accent-900)] text-[var(--accent-700)] dark:text-[var(--accent-300)] text-xs rounded font-medium">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Pages: {book.page_count || "-"}</p>
                      <p>Created: {new Date(book.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  <Link href={`/books/${book.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(book)}
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-serif">Delete Book</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{bookToDelete?.title}&quot;
              </span>
              ? This action cannot be undone and will permanently remove the book
              and all associated data from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {bookToDelete && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg my-2">
              {bookToDelete.cover_url ? (
                <Image
                  src={bookToDelete.cover_url}
                  alt={bookToDelete.title}
                  width={40}
                  height={60}
                  className="object-cover rounded"
                />
              ) : (
                <div className="w-[40px] h-[60px] bg-[var(--primary-100)] dark:bg-[var(--primary-900)] rounded flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[var(--primary-600)] dark:text-[var(--primary-400)]" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{bookToDelete.title}</p>
                {bookToDelete.author && (
                  <p className="text-xs text-muted-foreground">by {bookToDelete.author}</p>
                )}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
