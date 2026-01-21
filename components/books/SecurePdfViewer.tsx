"use client";

import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Menu } from "lucide-react";
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
 * - Mobile-first responsive design
 * - Uses PDF.js from CDN (no webpack/Turbopack issues)
 * - Download/print disabled for non-admin users
 * - Context menu disabled to prevent right-click save
 * - Custom toolbar with reading-focused controls
 * - Optimized rendering to prevent blinking/flickering
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
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const currentPageRef = useRef<number>(1);
  const currentScaleRef = useRef<number>(1.0);

  // Calculate responsive scale based on screen size (mobile-first)
  const calculateInitialScale = useCallback(() => {
    if (typeof window === "undefined") return 1.0;
    const width = window.innerWidth;
    if (width < 640) return 0.8; // Mobile
    if (width < 768) return 1.0; // Small tablet
    if (width < 1024) return 1.2; // Tablet
    return 1.5; // Desktop
  }, []);

  // Load PDF.js from CDN
  useEffect(() => {
    const loadPdfJs = async () => {
      if (typeof window === "undefined") return;

      // Check if PDF.js is already loaded
      if ((window as any).pdfjsLib) {
        setIsMounted(true);
        setScale(calculateInitialScale());
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
          setScale(calculateInitialScale());
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
  }, [calculateInitialScale]);

  // Handle window resize for responsive scale
  useEffect(() => {
    const handleResize = () => {
      const newScale = calculateInitialScale();
      setScale(newScale);
      currentScaleRef.current = newScale;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateInitialScale]);

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
        currentPageRef.current = 1;
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading PDF:", err);
        setError(err.message || "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();
  }, [isMounted, pdfUrl]);

  // Optimized render function to prevent blinking
  const renderPage = useCallback(async (pageNumber: number, scaleValue: number) => {
    if (!pdfDoc || !canvasRef.current || isRendering) return;

    // Cancel previous render task if exists
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setIsRendering(true);

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsRendering(false);
        return;
      }

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        setIsRendering(false);
        return;
      }

      // Clear canvas first
      context.clearRect(0, 0, canvas.width, canvas.height);

      const viewport = page.getViewport({ scale: scaleValue });
      
      // Set canvas dimensions (use device pixel ratio for crisp rendering)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Scale context for high DPI displays
      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      
      currentPageRef.current = pageNumber;
      currentScaleRef.current = scaleValue;
      
      if (onPageChange) {
        onPageChange(pageNumber);
      }
    } catch (err: any) {
      // Ignore cancellation errors
      if (err.name !== "RenderingCancelledException") {
        console.error("Error rendering page:", err);
      }
    } finally {
      setIsRendering(false);
      renderTaskRef.current = null;
    }
  }, [pdfDoc, isRendering, onPageChange]);

  // Render PDF page - optimized to prevent blinking
  useEffect(() => {
    if (!pdfDoc || pageNum < 1) return;

    // Only render if page or scale actually changed
    if (currentPageRef.current === pageNum && currentScaleRef.current === scale) {
      return;
    }

    renderPage(pageNum, scale);
  }, [pdfDoc, pageNum, scale, renderPage]);

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

  const goToPrevPage = useCallback(() => {
    if (pageNum > 1) {
      setPageNum((prev) => prev - 1);
    }
  }, [pageNum]);

  const goToNextPage = useCallback(() => {
    if (pageNum < numPages) {
      setPageNum((prev) => prev + 1);
    }
  }, [pageNum, numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.min(prev + 0.25, 3);
      currentScaleRef.current = newScale;
      return newScale;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.25, 0.5);
      currentScaleRef.current = newScale;
      return newScale;
    });
  }, []);

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

  // Mobile swipe gestures
  useEffect(() => {
    if (!canvasRef.current) return;

    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 50;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && pageNum > 1) {
          // Swipe right - previous page
          goToPrevPage();
        } else if (deltaX < 0 && pageNum < numPages) {
          // Swipe left - next page
          goToNextPage();
        }
      }

      touchStartX = 0;
      touchStartY = 0;
    };

    const canvas = canvasRef.current;
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pageNum, numPages, goToPrevPage, goToNextPage]);

  if (loading && !pdfDoc) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2d2520] min-h-[50vh]">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-400)] mx-auto mb-4"></div>
          <p className="text-[#a89a8e] text-sm sm:text-base">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2d2520] min-h-[50vh] px-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-sm sm:text-base"
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
      {/* Mobile-First Responsive Toolbar */}
      <div
        className="bg-[#1a1614] border-b border-[#3d342d] flex items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3"
        style={{ flexShrink: 0 }}
      >
        {/* Mobile: Menu button, Desktop: Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-[#f5f1eb] hover:bg-[#3d342d] sm:hidden p-2"
            aria-label="Menu"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNum <= 1}
              className="text-[#f5f1eb] hover:bg-[#3d342d] disabled:opacity-50 p-2 sm:p-2"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <span className="text-xs sm:text-sm text-[#a89a8e] px-1 sm:px-3 whitespace-nowrap">
              <span className="hidden sm:inline">Page </span>
              {pageNum}<span className="hidden sm:inline"> of {numPages}</span>
              <span className="sm:hidden">/{numPages}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNum >= numPages}
              className="text-[#f5f1eb] hover:bg-[#3d342d] disabled:opacity-50 p-2 sm:p-2"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Zoom and Fullscreen - Hidden on mobile, shown in menu */}
        <div className={`${showMobileMenu ? "flex" : "hidden"} sm:flex items-center gap-1 sm:gap-2 flex-col sm:flex-row absolute sm:relative top-full sm:top-auto left-0 right-0 sm:left-auto sm:right-auto bg-[#1a1614] sm:bg-transparent border-b sm:border-b-0 border-[#3d342d] p-2 sm:p-0 z-10`}>
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="text-[#f5f1eb] hover:bg-[#3d342d] p-2 sm:p-2 flex-1 sm:flex-none"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs sm:text-sm text-[#a89a8e] px-2 whitespace-nowrap min-w-[3rem] sm:min-w-0 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="text-[#f5f1eb] hover:bg-[#3d342d] p-2 sm:p-2 flex-1 sm:flex-none"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-[#f5f1eb] hover:bg-[#3d342d] p-2 sm:p-2 w-full sm:w-auto"
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas - Mobile Optimized */}
      <div
        className="flex-1 overflow-auto bg-[#2d2520]"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "8px",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        }}
      >
        <canvas
          ref={canvasRef}
          className="shadow-2xl"
          style={{
            maxWidth: "100%",
            height: "auto",
            userSelect: isAdmin ? "auto" : "none",
            touchAction: "pan-y", // Allow vertical scrolling, handle horizontal swipes
            display: "block",
          }}
        />
      </div>

      {/* Security styles */}
      <style jsx global>{`
        .secure-pdf-viewer--restricted canvas {
          pointer-events: auto; /* Allow swipes but prevent selection */
        }
        
        .secure-pdf-viewer--restricted {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        /* Prevent text selection on canvas */
        .secure-pdf-viewer--restricted canvas {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Smooth rendering */
        canvas {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
}
