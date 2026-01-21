"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecurePdfViewerProps {
  pdfUrl: string;
  title: string;
  isAdmin?: boolean;
  onPageChange?: (page: number) => void;
}

/**
 * Secure PDF Viewer Component using PDF.js directly
 * 
 * Features:
 * - Uses PDF.js from CDN (no webpack/Turbopack issues)
 * - Download/print disabled for non-admin users
 * - Context menu disabled to prevent right-click save
 * - Custom toolbar with reading-focused controls
 * - Full control over rendering and security
 */
export default function SecurePdfViewer({
  pdfUrl,
  title,
  isAdmin = false,
  onPageChange,
}: SecurePdfViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF.js from CDN
  useEffect(() => {
    const loadPdfJs = async () => {
      if (typeof window === "undefined") return;

      // Check if PDF.js is already loaded
      if ((window as any).pdfjsLib) {
        setIsMounted(true);
        return;
      }

      try {
        // Load PDF.js from CDN
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.async = true;
        script.onload = () => {
          // Set worker source
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          setIsMounted(true);
        };
        script.onerror = () => {
          setError("Failed to load PDF.js library");
          setLoading(false);
        };
        document.head.appendChild(script);
      } catch (err) {
        setError("Failed to initialize PDF viewer");
        setLoading(false);
      }
    };

    loadPdfJs();
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!isMounted || !pdfUrl) return;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF.js not loaded");
        }

        // Fetch PDF as array buffer
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error("Failed to fetch PDF");
        
        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNum(1);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading PDF:", err);
        setError(err.message || "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();
  }, [isMounted, pdfUrl]);

  // Render PDF page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || pageNum < 1) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        if (onPageChange) {
          onPageChange(pageNum);
        }
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };

    renderPage();
  }, [pdfDoc, pageNum, scale, onPageChange]);

  // Prevent context menu (right-click) for non-admin users
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      if (!isAdmin) {
        e.preventDefault();
        return false;
      }
    },
    [isAdmin]
  );

  // Prevent keyboard shortcuts for download/print
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isAdmin) {
        // Prevent Ctrl+S (save), Ctrl+P (print)
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")
        ) {
          e.preventDefault();
          return false;
        }
      }

      // Navigation with arrow keys
      if (e.key === "ArrowLeft" && pageNum > 1) {
        e.preventDefault();
        setPageNum((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && pageNum < numPages) {
        e.preventDefault();
        setPageNum((prev) => prev + 1);
      }
    },
    [isAdmin, pageNum, numPages]
  );

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleContextMenu, handleKeyDown]);

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNum < numPages) {
      setPageNum((prev) => prev + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  if (loading && !pdfDoc) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2d2520]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-400)] mx-auto mb-4"></div>
          <p className="text-[#a89a8e]">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2d2520]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`secure-pdf-viewer ${!isAdmin ? "secure-pdf-viewer--restricted" : ""}`}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#2d2520",
        userSelect: isAdmin ? "auto" : "none",
      }}
      onCopy={(e) => {
        if (!isAdmin) {
          e.preventDefault();
        }
      }}
    >
      {/* Toolbar */}
      <div
        className="bg-[#1a1614] border-b border-[#3d342d] p-3 flex items-center justify-between gap-4"
        style={{ flexShrink: 0 }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNum <= 1}
            className="text-[#f5f1eb] hover:bg-[#3d342d] disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-[#a89a8e] px-3">
            Page {pageNum} of {numPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNum >= numPages}
            className="text-[#f5f1eb] hover:bg-[#3d342d] disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="text-[#f5f1eb] hover:bg-[#3d342d]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-[#a89a8e] px-2">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="text-[#f5f1eb] hover:bg-[#3d342d]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-[#f5f1eb] hover:bg-[#3d342d]"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        className="flex-1 overflow-auto bg-[#2d2520]"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "20px",
        }}
      >
        <canvas
          ref={canvasRef}
          className="shadow-2xl"
          style={{
            maxWidth: "100%",
            height: "auto",
            userSelect: isAdmin ? "auto" : "none",
          }}
        />
      </div>

      {/* Security styles */}
      <style jsx global>{`
        .secure-pdf-viewer--restricted canvas {
          pointer-events: none;
        }
        
        .secure-pdf-viewer--restricted {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `}</style>
    </div>
  );
}
