"use client";

import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, AlertCircle, Maximize, Minimize, Download, BookOpen, Loader2 } from "lucide-react";
import { booksService } from "@/lib/services/books";
import { analyticsService } from "@/lib/services/analytics";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin";

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

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      if (sessionId) {
        analyticsService.endSession(sessionId).catch(() => {});
        if (readingTime > 0) {
          analyticsService.updateProgress(sessionId, { last_page_read: currentPage, time_spent_seconds: readingTime }).catch(() => {});
        }
      }
    };
  }, [pdfUrl, sessionId, readingTime, currentPage]);

  useEffect(() => {
    if (sessionId && readingTime > 0 && readingTime % 30 === 0) {
      analyticsService.updateProgress(sessionId, { last_page_read: currentPage, time_spent_seconds: 30 }).catch(() => {});
    }
  }, [sessionId, readingTime, currentPage]);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (authLoading || loading) {
    return (
      <div className="min-h-dvh bg-[#1a1614] flex items-center justify-center -mt-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-navy-400 mx-auto mb-3" />
          <p className="text-[#a89a8e] text-sm">{authLoading ? "Verifying..." : "Loading book..."}</p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-dvh bg-[#1a1614] flex items-center justify-center -mt-16">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 mb-4">{error || "Book not found"}</p>
          <Button onClick={() => router.push("/books")} className="bg-navy-500 hover:bg-navy-600">Back to Books</Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-dvh bg-[#1a1614] text-[#f5f1eb] flex flex-col -mt-16">
      {/* Header */}
      <div className="bg-[#1a1614]/95 backdrop-blur-sm z-50 p-3 border-b border-[#3d342d]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/books/${params.id}`)} className="text-[#f5f1eb] hover:bg-[#3d342d] shrink-0">
              <X className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold truncate font-serif">{bookData.title}</h2>
              {bookData.author && <p className="text-xs text-[#a89a8e] truncate">by {bookData.author}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => { if (pdfUrl && bookData) { const a = document.createElement("a"); a.href = pdfUrl; a.download = `${bookData.title}.pdf`; a.click(); } }} className="text-[#f5f1eb] hover:bg-[#3d342d]">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-[#f5f1eb] hover:bg-[#3d342d]">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="fixed bottom-2 right-2 z-40 pointer-events-none">
        <div className="bg-[#1a1614]/80 backdrop-blur-sm border border-[#3d342d]/50 rounded-lg px-2 py-1">
          <span className="text-[10px] text-[#a89a8e] font-medium">{formatTime(readingTime)}</span>
        </div>
      </div>

      {/* PDF */}
      <div className="flex-1 bg-[#2d2520]" style={{ height: "calc(100dvh - 60px)" }}>
        {pdfUrl ? (
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-navy-400" /></div>}>
            <SecurePdfViewer pdfUrl={pdfUrl} title={bookData.title} isAdmin={isAdmin} onPageChange={(p: number) => setCurrentPage(p + 1)} />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <AlertCircle className="w-12 h-12 text-[#a89a8e]" />
          </div>
        )}
      </div>
    </div>
  );
}
