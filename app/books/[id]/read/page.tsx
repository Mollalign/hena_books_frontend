"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  X,
  AlertCircle,
} from "lucide-react";
import { booksService } from "@/lib/services/books";
import { analyticsService } from "@/lib/services/analytics";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Set up PDF.js worker - use unpkg for better reliability
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bookData, setBookData] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

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
        setPdfError(null);
        const data = await booksService.getBookForReading(params.id as string);
        console.log("Book data loaded:", data);
        
        // Validate file URL
        if (!data.file_url) {
          throw new Error("Book file URL is missing");
        }
        
        // Check if URL is valid
        try {
          new URL(data.file_url);
        } catch (urlError) {
          throw new Error("Invalid file URL format");
        }
        
        setBookData(data);

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
          // Don't block reading if session fails
        }
      } catch (error: any) {
        console.error("Failed to load book:", error);
        toast.error(error.response?.data?.detail || "Failed to load book");
        setPdfError("Failed to load book. Please try again.");
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
      if (sessionId) {
        analyticsService.endSession(sessionId).catch(console.error);
        // Update progress
        if (readingTime > 0) {
          analyticsService
            .updateProgress(sessionId, {
              last_page_read: pageNumber,
              time_spent_seconds: readingTime,
            })
            .catch(console.error);
        }
      }
    };
  }, [params.id, user, router]);

  useEffect(() => {
    // Update reading progress periodically
    if (sessionId && readingTime > 0 && readingTime % 30 === 0) {
      analyticsService
        .updateProgress(sessionId, {
          last_page_read: pageNumber,
          time_spent_seconds: 30,
        })
        .catch(console.error);
    }
  }, [sessionId, pageNumber, readingTime]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(3, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !bookData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/books/${params.id}`)}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <h2 className="text-lg font-semibold truncate max-w-md">
              {bookData.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {formatTime(readingTime)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-400 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10"
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
      <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
        <div className="max-w-5xl w-full px-4">
          {pdfError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-2">{pdfError}</p>
              <Button
                onClick={() => {
                  setPdfError(null);
                  setPdfLoading(true);
                  window.location.reload();
                }}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <Document
              file={bookData.file_url}
              onLoadSuccess={({ numPages }) => {
                console.log("PDF loaded successfully, pages:", numPages);
                setNumPages(numPages);
                setPdfLoading(false);
                setPdfError(null);
              }}
              onLoadError={(error) => {
                console.error("PDF load error:", error);
                setPdfError("Failed to load PDF. The file may be corrupted or inaccessible.");
                setPdfLoading(false);
                toast.error("Failed to load PDF file");
              }}
              loading={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading PDF...</p>
                  <p className="text-gray-500 text-sm mt-2 break-all">{bookData.file_url}</p>
                </div>
              }
              options={{
                cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                cMapPacked: true,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                httpHeaders: {},
              }}
            >
              {pdfLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Rendering page...</p>
                </div>
              )}
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-2xl"
                onLoadSuccess={() => {
                  setPdfLoading(false);
                }}
                onRenderError={(error) => {
                  console.error("Page render error:", error);
                  setPdfError("Failed to render page. Please try again.");
                }}
                loading={
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <span className="text-sm text-gray-400">
            Page {pageNumber} of {numPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="text-white hover:bg-white/10 disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

