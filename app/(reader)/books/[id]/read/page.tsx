"use client";

import { useState, useEffect, useRef, Suspense, lazy, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Maximize, Minimize, Loader2 } from "lucide-react";
import { booksService, type BookReadResponse } from "@/lib/services/books";
import { analyticsService } from "@/lib/services/analytics";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ModernPdfViewer = lazy(() => import("@/components/books/ModernPdfViewer"));

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookData, setBookData] = useState<BookReadResponse | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | number | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [initialPage, setInitialPage] = useState<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readingTimeRef = useRef(0);
  const currentPageRef = useRef(1);
  const sessionIdRef = useRef<string | number | null>(null);

  // Auto-hide header on scroll down (mobile)
  const [headerVisible, setHeaderVisible] = useState(true);

  const handlePageChangeFromViewer = useCallback((page: number) => {
    setCurrentPage(page);
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
        setPdfUrl(`/api/v1/books/${params.id}/read/file`);

        try {
          const progressRes = await fetch(`/api/v1/books/${params.id}/read/progress`, { credentials: "include" });
          if (progressRes.ok) {
            const { last_page_read } = await progressRes.json();
            if (last_page_read > 1) setInitialPage(last_page_read);
          }
        } catch { /* non-critical */ }

        try {
          const session = await analyticsService.startSession({ book_id: params.id as string });
          setSessionId(session.id);
          timerRef.current = setInterval(() => setReadingTime((p) => p + 1), 1000);
        } catch { /* session tracking is non-critical */ }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load book");
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
    } catch { /* ignored */ }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Progress percentage
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  if (authLoading || loading) {
    return (
      <div className="h-dvh bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">{authLoading ? "Verifying..." : "Loading book..."}</p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="h-dvh bg-stone-950 flex items-center justify-center">
        <div className="text-center px-6 max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-red-300 text-sm font-medium mb-2">
            {error || "Book not found"}
          </p>
          <p className="text-stone-500 text-xs mb-6">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => router.push("/books")}
            className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 text-sm rounded-xl transition-colors"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-dvh bg-stone-950 text-stone-200 flex flex-col overflow-hidden">
      {/* Header — auto-hides on mobile scroll */}
      <header
        className={`flex items-center justify-between gap-2 px-3 sm:px-4 h-12 sm:h-13 bg-stone-950/95 border-b border-stone-800/50 shrink-0 z-50 transition-transform duration-200 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Left: Back + Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => router.push(`/books/${params.id}`)}
            className="p-2 -ml-1 rounded-xl hover:bg-stone-800 active:bg-stone-700 transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-medium truncate text-stone-200">
              {bookData.title}
            </h1>
            {bookData.author && (
              <p className="text-[10px] sm:text-xs text-stone-500 truncate hidden sm:block">
                by {bookData.author}
              </p>
            )}
          </div>
        </div>

        {/* Right: Page info + Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {totalPages > 0 && (
            <span className="text-[10px] sm:text-xs text-stone-500 tabular-nums px-1.5">
              {currentPage}/{totalPages}
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl hover:bg-stone-800 active:bg-stone-700 transition-colors"
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <Maximize className="w-3.5 h-3.5 text-stone-400" />
            )}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      {totalPages > 0 && (
        <div className="h-0.5 w-full bg-stone-900 shrink-0">
          <div
            className="h-full bg-amber-500/80 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* PDF Viewer */}
      <div className="flex-1 min-h-0">
        {pdfUrl ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            }
          >
            <ModernPdfViewer
              bookId={params.id as string}
              pdfUrl={pdfUrl}
              title={bookData.title}
              initialPage={initialPage}
              onPageChange={handlePageChangeFromViewer}
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
