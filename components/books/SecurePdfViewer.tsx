"use client";

import { useEffect, useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";

export interface PdfViewerHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  getScale: () => number;
}

interface SecurePdfViewerProps {
  pdfUrl: string;
  title: string;
  isAdmin?: boolean;
  onPageChange?: (page: number) => void;
  onScaleChange?: (scale: number) => void;
  onLoadComplete?: (numPages: number) => void;
}

const SecurePdfViewer = forwardRef<PdfViewerHandle, SecurePdfViewerProps>(
  function SecurePdfViewer({ pdfUrl, title, isAdmin = false, onPageChange, onScaleChange, onLoadComplete }, ref) {
    const [isMounted, setIsMounted] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
    const renderTasksRef = useRef<Map<number, any>>(new Map());

    const calculateInitialScale = useCallback(() => {
      if (typeof window === "undefined") return 1.0;
      const width = window.innerWidth;
      if (width < 480) return 0.65;
      if (width < 640) return 0.8;
      if (width < 768) return 1.0;
      if (width < 1024) return 1.2;
      return 1.5;
    }, []);

    useImperativeHandle(ref, () => ({
      zoomIn: () => setScale((prev) => Math.min(prev + 0.25, 3)),
      zoomOut: () => setScale((prev) => Math.max(prev - 0.25, 0.5)),
      resetZoom: () => setScale(calculateInitialScale()),
      getScale: () => scale,
    }), [scale, calculateInitialScale]);

    useEffect(() => {
      onScaleChange?.(scale);
    }, [scale, onScaleChange]);

    useEffect(() => {
      const loadPdfJs = async () => {
        if (typeof window === "undefined") return;

        if ((window as any).pdfjsLib) {
          setIsMounted(true);
          setScale(calculateInitialScale());
          return;
        }

        try {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.async = true;
          script.onload = () => {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            setIsMounted(true);
            setScale(calculateInitialScale());
          };
          script.onerror = () => {
            setError("Failed to load PDF viewer");
            setLoading(false);
          };
          document.head.appendChild(script);
        } catch {
          setError("Failed to initialize PDF viewer");
          setLoading(false);
        }
      };

      loadPdfJs();
    }, [calculateInitialScale]);

    useEffect(() => {
      const handleResize = () => setScale(calculateInitialScale());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [calculateInitialScale]);

    useEffect(() => {
      if (!isMounted || !pdfUrl) return;

      const loadPdf = async () => {
        try {
          setLoading(true);
          setError(null);
          const pdfjsLib = (window as any).pdfjsLib;
          if (!pdfjsLib) throw new Error("PDF.js not loaded");

          const response = await fetch(pdfUrl);
          if (!response.ok) throw new Error("Failed to fetch PDF");

          const arrayBuffer = await response.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          onLoadComplete?.(pdf.numPages);
          setLoading(false);
        } catch (err: any) {
          console.error("Error loading PDF:", err);
          setError(err.message || "Failed to load PDF");
          setLoading(false);
        }
      };

      loadPdf();
    }, [isMounted, pdfUrl, onLoadComplete]);

    const renderPage = useCallback(async (pageNumber: number) => {
      if (!pdfDoc || renderedPages.has(pageNumber)) return;

      const canvas = canvasRefs.current.get(pageNumber);
      if (!canvas) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        const existingTask = renderTasksRef.current.get(pageNumber);
        if (existingTask) existingTask.cancel();

        const viewport = page.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(dpr, dpr);

        const renderTask = page.render({ canvasContext: context, viewport });
        renderTasksRef.current.set(pageNumber, renderTask);
        await renderTask.promise;

        setRenderedPages((prev) => new Set([...prev, pageNumber]));
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    }, [pdfDoc, scale, renderedPages]);

    useEffect(() => {
      if (!pdfDoc || numPages === 0) return;
      for (let i = 1; i <= numPages; i++) {
        if (!renderedPages.has(i)) renderPage(i);
      }
    }, [pdfDoc, numPages, scale, renderPage, renderedPages]);

    useEffect(() => {
      if (!pdfDoc || numPages === 0) return;
      setRenderedPages(new Set());
      renderTasksRef.current.clear();
      setTimeout(() => {
        for (let i = 1; i <= numPages; i++) renderPage(i);
      }, 100);
    }, [scale]);

    useEffect(() => {
      if (!pdfDoc || numPages === 0) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageNum = parseInt(entry.target.getAttribute("data-page") || "0");
              if (pageNum > 0 && !renderedPages.has(pageNum)) renderPage(pageNum);
            }
          });
        },
        { rootMargin: "200px" }
      );
      const pageElements = document.querySelectorAll("[data-page]");
      pageElements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, [pdfDoc, numPages, renderedPages, renderPage]);

    useEffect(() => {
      const handler = (e: MouseEvent) => { if (!isAdmin) { e.preventDefault(); return false; } };
      const keyHandler = (e: KeyboardEvent) => {
        if (!isAdmin && (e.ctrlKey || e.metaKey) && ["s", "S", "p", "P"].includes(e.key)) {
          e.preventDefault();
          return false;
        }
      };
      document.addEventListener("contextmenu", handler);
      document.addEventListener("keydown", keyHandler);
      return () => { document.removeEventListener("contextmenu", handler); document.removeEventListener("keydown", keyHandler); };
    }, [isAdmin]);

    useEffect(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setScale((prev) => Math.max(0.5, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
        }
      };
      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    useEffect(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      let initialDistance = 0;
      let initialScale = scale;
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          initialDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          initialScale = scale;
        }
      };
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          setScale(Math.max(0.5, Math.min(3, initialScale * (dist / initialDistance))));
        }
      };
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      return () => { el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchmove", onTouchMove); };
    }, [scale]);

    useEffect(() => {
      const el = scrollContainerRef.current;
      if (!el || !onPageChange || numPages === 0) return;
      const handleScroll = () => {
        const pageHeight = el.scrollHeight / numPages;
        const currentPage = Math.floor(el.scrollTop / pageHeight) + 1;
        if (currentPage >= 1 && currentPage <= numPages) onPageChange(currentPage);
      };
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }, [numPages, onPageChange]);

    if (loading && !pdfDoc) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5a4d42] border-t-[#c4a882] mx-auto mb-3" />
            <p className="text-[#8a7d72] text-sm">Loading PDF...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center max-w-sm">
            <p className="text-red-400 mb-4 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#3d342d] hover:bg-[#4d433b] text-[#e8ddd0] text-sm rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={scrollContainerRef}
        className={!isAdmin ? "secure-pdf-viewer--restricted" : ""}
        style={{
          height: "100%",
          width: "100%",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          userSelect: isAdmin ? "auto" : "none",
        }}
        onCopy={(e) => { if (!isAdmin) e.preventDefault(); }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 4px", gap: "8px" }}>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} data-page={pageNum} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <canvas
                ref={(el) => { if (el) canvasRefs.current.set(pageNum, el); else canvasRefs.current.delete(pageNum); }}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: "2px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  userSelect: isAdmin ? "auto" : "none",
                  touchAction: "pan-y pinch-zoom",
                }}
              />
            </div>
          ))}
        </div>

        <style jsx global>{`
          .secure-pdf-viewer--restricted {
            -webkit-user-select: none !important;
            user-select: none !important;
          }
          .secure-pdf-viewer--restricted canvas {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            pointer-events: auto;
          }
          canvas {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        `}</style>
      </div>
    );
  }
);

export default SecurePdfViewer;
