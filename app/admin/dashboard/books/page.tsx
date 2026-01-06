"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { booksService, Book } from "@/lib/services/books";
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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
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
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("page_count", formData.page_count);
      uploadFormData.append("published_date", formData.published_date);
      uploadFormData.append("is_featured", String(formData.is_featured));
      uploadFormData.append("is_published", String(formData.is_published));
      uploadFormData.append("book_file", formData.book_file);
      if (formData.cover_file) {
        uploadFormData.append("cover_file", formData.cover_file);
      }

      await booksService.uploadBook(uploadFormData);
      toast.success("Book uploaded successfully");
      setUploadDialogOpen(false);
      setFormData({
        title: "",
        description: "",
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
      toast.error(error.response?.data?.detail || "Failed to upload book");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await booksService.deleteBook(id);
      toast.success("Book deleted successfully");
      fetchBooks();
    } catch (error: any) {
      console.error("Failed to delete book:", error);
      toast.error("Failed to delete book");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Book Management</h1>
          <p className="text-muted-foreground">
            Manage all books in the platform
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Book</DialogTitle>
              <DialogDescription>
                Upload a PDF book file with optional cover image
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page_count">Page Count</Label>
                  <Input
                    id="page_count"
                    type="number"
                    value={formData.page_count}
                    onChange={(e) =>
                      setFormData({ ...formData, page_count: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="published_date">Published Date</Label>
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
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_published: e.target.checked,
                      })
                    }
                  />
                  <span>Published</span>
                </label>
              </div>
              <div>
                <Label htmlFor="book_file">PDF File *</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="cover_file">Cover Image</Label>
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
                />
              </div>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload Book"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No books found. Upload your first book!
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
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
                        <div className="w-[50px] h-[75px] bg-muted rounded flex items-center justify-center">
                          📚
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {book.is_published && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Published
                          </span>
                        )}
                        {book.is_featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Featured
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
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

