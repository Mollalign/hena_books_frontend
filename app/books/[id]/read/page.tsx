"use client";

import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  X,
  AlertCircle,
  Maximize,
  Minimize,
  Download,
  BookOpen,
  Loader2,
} from "lucide-react";
import { booksService } from "@/lib/services/books";
import { analyticsService } from "@/lib/services/analytics";
import { getApiBaseUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Lazy load the PDF viewer to reduce initial bundle size
const SecurePdfViewer = lazy(() => import("@/components/books/SecurePdfViewer"));

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bookData, setBookData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | number | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadBook = async () => {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token || !user) {
        toast.error("Please login to read books");
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get book data
        const data = await booksService.getBookForReading(params.id as string);
        console.log("Book data loaded:", data);

        if (!data.file_url) {
          throw new Error("Book file URL is missing");
        }

        setBookData(data);

        // Create PDF URL via backend proxy (handles auth and CORS)
        const apiBaseUrl = getApiBaseUrl();
        const proxyUrl = `${apiBaseUrl}/api/v1/books/${params.id}/read/file`;

        // Fetch the PDF as a blob and create an object URL
        const response = await fetch(proxyUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("PDF fetch error:", response.status, errorText);
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log("PDF loaded, size:", arrayBuffer.byteLength, "bytes");

        // Create blob with explicit PDF MIME type
        const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
        const objectUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(objectUrl);
        console.log("PDF blob URL created:", objectUrl);

        // Start reading session
        try {
          const session = await analyticsService.startSession({
            book_id: params.id as string,
          });
          setSessionId(session.id);
          startTimeRef.current = Date.now();

          // Start timer
          timerRef.current = setInterval(() => {
            setReadingTime((prev) => prev + 1);
          }, 1000);
        } catch (sessionError: any) {
          console.error("Failed to start session:", sessionError);
        }
      } catch (err: any) {
        console.error("Failed to load book:", err);
        setError(err.message || "Failed to load book");
        toast.error("Failed to load book");
      } finally {
        setLoading(false);
      }
    };

    loadBook();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      if (sessionId) {
        analyticsService.endSession(sessionId).catch(console.error);
        if (readingTime > 0) {
          analyticsService
            .updateProgress(sessionId, {
              last_page_read: currentPage,
              time_spent_seconds: readingTime,
            })
            .catch(console.error);
        }
      }
    };
  }, [params.id, user, router]);

  // Update reading progress periodically
  useEffect(() => {
    if (sessionId && readingTime > 0 && readingTime % 30 === 0) {
      analyticsService
        .updateProgress(sessionId, {
          last_page_read: currentPage,
          time_spent_seconds: 30,
        })
        .catch(console.error);
    }
  }, [sessionId, readingTime, currentPage]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Admin-only download handler
  const handleDownload = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can download books");
      return;
    }
    
    if (pdfUrl && bookData) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${bookData.title}.pdf`;
      link.click();
      toast.success("Download started");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page + 1); // react-pdf-viewer uses 0-indexed pages
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1614] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--primary-400)] mx-auto mb-4" />
          <p className="text-[#a89a8e]">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen bg-[#1a1614] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-2">{error || "Book not found"}</p>
          <Button
            onClick={() => router.push("/books")}
            className="mt-4 bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
          >
            Back to Books
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#1a1614] text-[#f5f1eb] flex flex-col"
    >
      {/* Header Controls */}
      <div className="bg-[#1a1614]/95 backdrop-blur-sm z-50 p-3 border-b border-[#3d342d]">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/books/${params.id}`)}
              className="text-[#f5f1eb] hover:bg-[#3d342d]"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--primary-400)]" />
              <div>
                <h2 className="text-lg font-semibold truncate max-w-md font-serif">
                  {bookData.title}
                </h2>
                {bookData.author && (
                  <p className="text-sm text-[#a89a8e]">by {bookData.author}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#a89a8e] mr-2">
              Reading: {formatTime(readingTime)}
            </span>
            
            {/* Only show download button for admin users */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-[#f5f1eb] hover:bg-[#3d342d]"
                title="Download PDF (Admin only)"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-[#f5f1eb] hover:bg-[#3d342d]"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-[#2d2520]" style={{ height: "calc(100vh - 64px)" }}>
        {pdfUrl ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-[var(--primary-400)] mx-auto mb-4" />
                  <p className="text-[#a89a8e]">Loading PDF viewer...</p>
                </div>
              </div>
            }
          >
            <SecurePdfViewer
              pdfUrl={pdfUrl}
              title={bookData.title}
              isAdmin={isAdmin}
              onPageChange={handlePageChange}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-[#a89a8e] mx-auto mb-4" />
              <p className="text-[#a89a8e]">PDF not available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
