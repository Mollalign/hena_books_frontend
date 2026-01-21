"use client";

import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Menu, RotateCcw } from "lucide-react";
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
 * - Continuous scrollable PDF (all pages rendered)
 * - Zoom with mouse wheel and pinch gestures
 * - Mobile-first responsive design
 * - Uses PDF.js from CDN (no webpack/Turbopack issues)
 * - Download/print disabled for non-admin users
 * - Context menu disabled to prevent right-click save
 */
export default function SecurePdfViewer({
  pdfUrl,
  title,
  isAdmin = false,
  onPageChange,
}: SecurePdfViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, any>>(new Map());

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
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading PDF:", err);
        setError(err.message || "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();
  }, [isMounted, pdfUrl]);

  // Render a single page
  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDoc || renderedPages.has(pageNumber)) return;

    const canvas = canvasRefs.current.get(pageNumber);
    if (!canvas) return;

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      // Cancel previous render if exists
      const existingTask = renderTasksRef.current.get(pageNumber);
      if (existingTask) {
        existingTask.cancel();
      }

      const viewport = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTasksRef.current.set(pageNumber, renderTask);
      
      await renderTask.promise;
      
      setRenderedPages((prev) => new Set([...prev, pageNumber]));
      
      // Track current page for analytics
      if (onPageChange && containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const pageHeight = viewport.height;
        const currentPage = Math.floor(scrollTop / pageHeight) + 1;
        if (currentPage !== pageNumber) {
          onPageChange(currentPage);
        }
      }
    } catch (err: any) {
      if (err.name !== "RenderingCancelledException") {
        console.error(`Error rendering page ${pageNumber}:`, err);
      }
    }
  }, [pdfDoc, scale, renderedPages, onPageChange]);

  // Render all pages when PDF loads or scale changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    // Render all pages
    for (let i = 1; i <= numPages; i++) {
      if (!renderedPages.has(i)) {
        renderPage(i);
      }
    }
  }, [pdfDoc, numPages, scale, renderPage, renderedPages]);

  // Re-render all pages when scale changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;
    
    // Clear rendered pages and re-render with new scale
    setRenderedPages(new Set());
    renderTasksRef.current.clear();
    
    // Small delay to ensure canvas refs are ready
    setTimeout(() => {
      for (let i = 1; i <= numPages; i++) {
        renderPage(i);
      }
    }, 100);
  }, [scale]);

  // Intersection Observer for lazy loading pages
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page") || "0");
            if (pageNum > 0 && !renderedPages.has(pageNum)) {
              renderPage(pageNum);
            }
          }
        });
      },
      { rootMargin: "200px" }
    );

    const pageElements = document.querySelectorAll("[data-page]");
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pdfDoc, numPages, renderedPages, renderPage]);

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
    },
    [isAdmin]
  );

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleContextMenu, handleKeyDown]);

  // Zoom with mouse wheel
  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => {
          const newScale = Math.max(0.5, Math.min(3, prev + delta));
          return newScale;
        });
      }
    };

    containerRef.current.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      containerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Pinch zoom for touch devices
  useEffect(() => {
    if (!containerRef.current) return;

    let initialDistance = 0;
    let initialScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleChange = currentDistance / initialDistance;
        const newScale = Math.max(0.5, Math.min(3, initialScale * scaleChange));
        setScale(newScale);
      }
    };

    containerRef.current.addEventListener("touchstart", handleTouchStart, { passive: true });
    containerRef.current.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      containerRef.current?.removeEventListener("touchstart", handleTouchStart);
      containerRef.current?.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scale]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(calculateInitialScale());
  }, [calculateInitialScale]);

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

  // Track scroll position for page change
  useEffect(() => {
    if (!containerRef.current || !onPageChange || numPages === 0) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const pageHeight = container.scrollHeight / numPages;
      const currentPage = Math.floor(scrollTop / pageHeight) + 1;
      
      if (currentPage >= 1 && currentPage <= numPages) {
        onPageChange(currentPage);
      }
    };

    containerRef.current.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [numPages, onPageChange]);

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
        overflow: "auto",
        position: "relative",
      }}
      onCopy={(e) => {
        if (!isAdmin) {
          e.preventDefault();
        }
      }}
    >
      {/* Mobile-First Responsive Toolbar */}
      <div
        className="bg-[#1a1614] border-b border-[#3d342d] flex items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3 sticky top-0 z-10"
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
        </div>

        {/* Zoom and Fullscreen - Hidden on mobile, shown in menu */}
        <div className={`${showMobileMenu ? "flex" : "hidden"} sm:flex items-center gap-1 sm:gap-2 flex-col sm:flex-row absolute sm:relative top-full sm:top-auto left-0 right-0 sm:left-auto sm:right-auto bg-[#1a1614] sm:bg-transparent border-b sm:border-b-0 border-[#3d342d] p-2 sm:p-0 z-10`}>
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="text-[#f5f1eb] hover:bg-[#3d342d] p-2 sm:p-2 flex-1 sm:flex-none"
              title="Zoom Out (Ctrl+Scroll)"
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
              title="Zoom In (Ctrl+Scroll)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-[#f5f1eb] hover:bg-[#3d342d] p-2 sm:p-2"
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
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

      {/* Scrollable PDF Pages Container */}
      <div
        className="flex-1 overflow-auto bg-[#2d2520]"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 8px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            data-page={pageNum}
            className="mb-4"
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <canvas
              ref={(el) => {
                if (el) {
                  canvasRefs.current.set(pageNum, el);
                } else {
                  canvasRefs.current.delete(pageNum);
                }
              }}
              className="shadow-2xl"
              style={{
                maxWidth: "100%",
                height: "auto",
                userSelect: isAdmin ? "auto" : "none",
                touchAction: "pan-y pinch-zoom",
                display: "block",
              }}
            />
          </div>
        ))}
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
