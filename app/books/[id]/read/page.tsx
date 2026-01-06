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
} from "lucide-react";
import { booksService } from "@/lib/services/books";
import { analyticsService } from "@/lib/services/analytics";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const [sessionId, setSessionId] = useState<number | null>(null);
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
        const data = await booksService.getBookForReading(params.id as string);
        setBookData(data);

        // Start reading session
        // Note: Sending UUID string - backend should handle conversion
        const session = await analyticsService.startSession({
          book_id: params.id as string,
        });
        setSessionId(session.id);
        startTimeRef.current = Date.now();

        // Start timer
        timerRef.current = setInterval(() => {
          setReadingTime((prev) => prev + 1);
        }, 1000);
      } catch (error: any) {
        console.error("Failed to load book:", error);
        toast.error("Failed to load book");
        router.push(`/books/${params.id}`);
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
          <Document
            file={bookData.file_url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading page...</p>
              </div>
            }
            error={
              <div className="text-center text-red-400">
                <p>Failed to load PDF</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-2xl"
            />
          </Document>
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

