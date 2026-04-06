"use client";

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Maximize, Minimize, Download, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { booksService } from "@/lib/services/books";
import { analyticsService } from "@/lib/services/analytics";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PdfViewerHandle } from "@/components/books/SecurePdfViewer";

const SecurePdfViewer = lazy(() => import("@/components/books/SecurePdfViewer"));

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookData, setBookData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | number | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentScale, setCurrentScale] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<PdfViewerHandle>(null);
  const readingTimeRef = useRef(0);
  const currentPageRef = useRef(1);
  const sessionIdRef = useRef<string | number | null>(null);

  const isAdmin = user?.role === "admin";

  const handleScaleChange = useCallback((s: number) => {
    setCurrentScale(Math.round(s * 100));
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please login to read books");
      router.push("/login");
      return;
    }

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await booksService.getBookForReading(params.id as string);
        if (!data.file_url) throw new Error("Book file URL is missing");
        setBookData(data);

        const proxyUrl = `/api/v1/books/${params.id}/read/file`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(proxyUrl, {
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Session expired. Please login again.");
            router.push("/login");
            return;
          }
          throw new Error(`Failed to load PDF (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(blob));

        try {
          const session = await analyticsService.startSession({ book_id: params.id as string });
          setSessionId(session.id);
          timerRef.current = setInterval(() => setReadingTime((p) => p + 1), 1000);
        } catch {
          // session tracking is non-critical
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else {
          setError(err.message || "Failed to load book");
        }
      } finally {
        setLoading(false);
      }
    };

    loadBook();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [params.id, user, router, authLoading]);

  useEffect(() => { readingTimeRef.current = readingTime; }, [readingTime]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  useEffect(() => {
    return () => {
      const sid = sessionIdRef.current;
      const time = readingTimeRef.current;
      const page = currentPageRef.current;
      if (sid) {
        analyticsService.endSession(sid).catch(() => { });
        if (time > 0) {
          analyticsService.updateProgress(sid, { last_page_read: page, time_spent_seconds: time }).catch(() => { });
        }
      }
    };
  }, []);

  useEffect(() => {
    if (sessionId && readingTime > 0 && readingTime % 30 === 0) {
      analyticsService.updateProgress(sessionId, { last_page_read: currentPage, time_spent_seconds: 30 }).catch(() => { });
    }
  }, [sessionId, readingTime, currentPage]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch { }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (authLoading || loading) {
    return (
      <div className="h-dvh bg-[#1c1917] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">{authLoading ? "Verifying..." : "Loading book..."}</p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="h-dvh bg-[#1c1917] flex items-center justify-center">
        <div className="text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm mb-4">{error || "Book not found"}</p>
          <button
            onClick={() => router.push("/books")}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm rounded-lg transition-colors"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-dvh bg-[#1c1917] text-stone-200 flex flex-col overflow-hidden">
      {/* Unified Header */}
      <header className="flex items-center justify-between gap-2 px-2 sm:px-4 h-12 sm:h-14 bg-[#1c1917] border-b border-stone-800 shrink-0 z-50">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => router.push(`/books/${params.id}`)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-stone-800 transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-medium truncate text-stone-200">{bookData.title}</h1>
            {bookData.author && (
              <p className="text-[10px] sm:text-xs text-stone-500 truncate hidden sm:block">by {bookData.author}</p>
            )}
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-stone-800/60 rounded-lg px-1 py-0.5">
          <button
            onClick={() => pdfViewerRef.current?.zoomOut()}
            className="p-1.5 rounded hover:bg-stone-700 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-stone-400" />
          </button>
          <span className="text-[11px] text-stone-400 w-10 text-center tabular-nums">{currentScale}%</span>
          <button
            onClick={() => pdfViewerRef.current?.zoomIn()}
            className="p-1.5 rounded hover:bg-stone-700 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5 text-stone-400" />
          </button>
          <button
            onClick={() => pdfViewerRef.current?.resetZoom()}
            className="p-1.5 rounded hover:bg-stone-700 transition-colors"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3 h-3 text-stone-500" />
          </button>
        </div>

        {/* Right: Page info + Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {totalPages > 0 && (
            <span className="text-[10px] sm:text-xs text-stone-500 tabular-nums px-1.5 sm:px-2">
              {currentPage}/{totalPages}
            </span>
          )}
          <span className="text-[10px] text-stone-600 tabular-nums px-1 hidden sm:inline">
            {formatTime(readingTime)}
          </span>
          {isAdmin && (
            <button
              onClick={() => {
                if (pdfUrl && bookData) {
                  const a = document.createElement("a");
                  a.href = pdfUrl;
                  a.download = `${bookData.title}.pdf`;
                  a.click();
                }
              }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-stone-800 transition-colors"
              aria-label="Download"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            ) : (
              <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            )}
          </button>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 min-h-0 bg-stone-900">
        {pdfUrl ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            }
          >
            <SecurePdfViewer
              ref={pdfViewerRef}
              pdfUrl={pdfUrl}
              title={bookData.title}
              isAdmin={isAdmin}
              onPageChange={setCurrentPage}
              onScaleChange={handleScaleChange}
              onLoadComplete={setTotalPages}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <AlertCircle className="w-10 h-10 text-stone-700" />
          </div>
        )}
      </div>
    </div>
  );
}
