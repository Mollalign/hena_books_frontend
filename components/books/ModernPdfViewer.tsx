"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Highlighter,
  Loader2,
  MessageSquareQuote,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  highlightsService,
  type BookHighlight,
} from "@/lib/services/highlights";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ---------------------------------------------------------------------------

interface ModernPdfViewerProps {
  bookId: string;
  pdfUrl: string;
  title: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onScaleChange?: (scale: number) => void;
  onLoadComplete?: (numPages: number) => void;
}

const HIGHLIGHT_COLORS = [
  { value: "#FACC15", label: "Yellow", tint: "rgba(250, 204, 21, 0.35)" },
  { value: "#4ADE80", label: "Green", tint: "rgba(74, 222, 128, 0.30)" },
  { value: "#60A5FA", label: "Blue", tint: "rgba(96, 165, 250, 0.30)" },
  { value: "#F472B6", label: "Pink", tint: "rgba(244, 114, 182, 0.28)" },
  { value: "#FB923C", label: "Orange", tint: "rgba(251, 146, 60, 0.30)" },
] as const;

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const PAGE_GAP = 12;
const A4_RATIO = 1.4142;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortHighlights(highlights: BookHighlight[]) {
  return [...highlights].sort((a, b) => {
    if (a.page_index !== b.page_index) return a.page_index - b.page_index;
    return (
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });
}

function getHighlightTint(color: string) {
  return (
    HIGHLIGHT_COLORS.find((c) => c.value === color)?.tint ??
    "rgba(250, 204, 21, 0.35)"
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ---------------------------------------------------------------------------
// Percentage-based highlight area (device-independent)
// All values are 0-100 representing % of the page dimensions.
// Compatible with the old @react-pdf-viewer/highlight format.
// ---------------------------------------------------------------------------

interface PercentRect {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}

// ---------------------------------------------------------------------------
// Text selection hook — captures selection as % of page dimensions.
// Uses multiple event sources for cross-platform reliability:
//   Desktop: mouseup
//   Mobile:  touchend + pointerup + selectionchange (fallback)
// ---------------------------------------------------------------------------

interface TextSelection {
  text: string;
  pageIndex: number;
  areas: PercentRect[];
}

function captureSelection(): TextSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const text = sel.toString().trim();
  if (!text) return null;

  const range = sel.getRangeAt(0);

  // Walk up from the selection start to find the react-pdf page wrapper
  let node: Node | null = range.startContainer;
  let pageEl: Element | null = null;
  while (node) {
    if (node instanceof Element) {
      pageEl = node.closest("[data-page-number]");
      if (pageEl) break;
    }
    node = node.parentNode;
  }
  if (!pageEl) return null;

  const pageIndex =
    parseInt(pageEl.getAttribute("data-page-number") || "1", 10) - 1;
  const pageRect = pageEl.getBoundingClientRect();
  if (pageRect.width === 0 || pageRect.height === 0) return null;

  const clientRects = Array.from(range.getClientRects());
  const areas: PercentRect[] = clientRects
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => ({
      top: ((r.top - pageRect.top) / pageRect.height) * 100,
      left: ((r.left - pageRect.left) / pageRect.width) * 100,
      width: (r.width / pageRect.width) * 100,
      height: (r.height / pageRect.height) * 100,
      pageIndex,
    }))
    .filter(
      (a) => a.top >= -1 && a.top <= 101 && a.left >= -1 && a.left <= 101
    );

  if (areas.length === 0) return null;
  return { text, pageIndex, areas };
}

function useTextSelection(
  containerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return;
    }

    const tryCapture = () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);

      const result = captureSelection();
      if (result) {
        setSelection(result);
      } else {
        clearTimer.current = setTimeout(() => {
          if (!captureSelection()) setSelection(null);
        }, 400);
      }
    };

    // Delayed capture — gives mobile browsers time to finalize selection
    const delayedCapture = () => setTimeout(tryCapture, 50);

    // mouseup: primary trigger on desktop
    document.addEventListener("mouseup", delayedCapture);
    // touchend: primary trigger on mobile (long-press → select → lift finger)
    document.addEventListener("touchend", delayedCapture, { passive: true });
    // pointerup: unified event, covers stylus/touch/mouse
    document.addEventListener("pointerup", delayedCapture);
    // selectionchange: fallback for when user adjusts selection handles on mobile
    document.addEventListener("selectionchange", tryCapture);

    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      document.removeEventListener("mouseup", delayedCapture);
      document.removeEventListener("touchend", delayedCapture);
      document.removeEventListener("pointerup", delayedCapture);
      document.removeEventListener("selectionchange", tryCapture);
    };
  }, [enabled]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return { selection, clearSelection };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ModernPdfViewer({
  bookId,
  pdfUrl,
  title,
  initialPage,
  onPageChange,
  onScaleChange,
  onLoadComplete,
}: ModernPdfViewerProps) {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  // PDF state
  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(2); // default 1x
  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;

  // Highlights
  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    null
  );
  const [isDeletingHighlight, setIsDeletingHighlight] = useState(false);

  // Highlight composer
  const [pendingText, setPendingText] = useState<{
    text: string;
    pageIndex: number;
    areas: PercentRect[];
  } | null>(null);
  const [draftColor, setDraftColor] = useState<string>(
    HIGHLIGHT_COLORS[0].value
  );
  const [draftNote, setDraftNote] = useState("");
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  // Bottom bar visibility
  const [showControls, setShowControls] = useState(true);

  // Current page (tracked via scroll, not re-render)
  const [currentPage, setCurrentPage] = useState(1);

  // -----------------------------------------------------------------------
  // Text selection (works on touch + mouse)
  // -----------------------------------------------------------------------
  const { selection, clearSelection } = useTextSelection(
    scrollRef,
    !pendingText && !activeHighlightId
  );

  // -----------------------------------------------------------------------
  // Measure container
  // -----------------------------------------------------------------------
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // -----------------------------------------------------------------------
  // Document load
  // -----------------------------------------------------------------------
  const handleDocumentLoad = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      onLoadComplete?.(n);
    },
    [onLoadComplete]
  );

  // -----------------------------------------------------------------------
  // Page dimensions
  // -----------------------------------------------------------------------
  const pageWidth = useMemo(() => {
    if (containerWidth === 0) return 300;
    const maxW = isMobile
      ? containerWidth
      : Math.min(containerWidth - 48, 960);
    return Math.max(maxW * zoom, 200);
  }, [containerWidth, zoom, isMobile]);

  const estimatedPageHeight = useMemo(
    () => Math.round(pageWidth * A4_RATIO) + PAGE_GAP,
    [pageWidth]
  );

  // -----------------------------------------------------------------------
  // Virtualizer
  // -----------------------------------------------------------------------
  const virtualizer = useVirtualizer({
    count: numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedPageHeight,
    overscan: 2,
  });

  // Scroll to initial page once we know dimensions
  const hasScrolledToInitial = useRef(false);
  useEffect(() => {
    if (
      !hasScrolledToInitial.current &&
      numPages > 0 &&
      initialPage &&
      initialPage > 1
    ) {
      hasScrolledToInitial.current = true;
      virtualizer.scrollToIndex(initialPage - 1, { align: "start" });
    }
  }, [numPages, initialPage, virtualizer]);

  // -----------------------------------------------------------------------
  // Page tracking via scroll event
  // -----------------------------------------------------------------------
  const pageChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReportedPage = useRef(0);
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const computeCurrentPage = useCallback(() => {
    const items = virtualizer.getVirtualItems();
    if (items.length === 0) return;

    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const viewportMiddle = scrollEl.scrollTop + scrollEl.clientHeight / 2;
    let closest = items[0];
    let minDist = Infinity;
    for (const item of items) {
      const mid = item.start + item.size / 2;
      const dist = Math.abs(mid - viewportMiddle);
      if (dist < minDist) {
        minDist = dist;
        closest = item;
      }
    }

    const page = closest.index + 1;
    if (page !== lastReportedPage.current) {
      lastReportedPage.current = page;
      setCurrentPage(page);
      if (pageChangeTimer.current) clearTimeout(pageChangeTimer.current);
      pageChangeTimer.current = setTimeout(() => {
        onPageChangeRef.current?.(page);
      }, 150);
    }
  }, [virtualizer]);

  // -----------------------------------------------------------------------
  // Zoom
  // -----------------------------------------------------------------------
  const zoomIn = useCallback(() => {
    setZoomIndex((i) => {
      const next = Math.min(i + 1, ZOOM_STEPS.length - 1);
      onScaleChange?.(ZOOM_STEPS[next]);
      return next;
    });
  }, [onScaleChange]);

  const zoomOut = useCallback(() => {
    setZoomIndex((i) => {
      const next = Math.max(i - 1, 0);
      onScaleChange?.(ZOOM_STEPS[next]);
      return next;
    });
  }, [onScaleChange]);

  // -----------------------------------------------------------------------
  // Auto-hide controls on scroll (mobile only) + page tracking
  // -----------------------------------------------------------------------
  const lastScrollY = useRef(0);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const y = el.scrollTop;

    if (isMobile) {
      setShowControls(y < lastScrollY.current || y < 50);
    }
    lastScrollY.current = y;

    computeCurrentPage();
  }, [isMobile, computeCurrentPage]);

  // -----------------------------------------------------------------------
  // Load highlights
  // -----------------------------------------------------------------------
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setIsLoadingHighlights(true);
        const items = await highlightsService.list(bookId);
        if (!ignore) setHighlights(sortHighlights(items));
      } catch {
        if (!ignore) toast.error("Failed to load highlights");
      } finally {
        if (!ignore) setIsLoadingHighlights(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [bookId]);

  const activeHighlight = activeHighlightId
    ? (highlights.find((h) => h.id === activeHighlightId) ?? null)
    : null;

  // -----------------------------------------------------------------------
  // Save highlight
  // -----------------------------------------------------------------------
  const openComposer = useCallback(() => {
    if (!selection) return;
    setPendingText({
      text: selection.text,
      pageIndex: selection.pageIndex,
      areas: selection.areas,
    });
    setDraftColor(HIGHLIGHT_COLORS[0].value);
    setDraftNote("");
    clearSelection();
  }, [selection, clearSelection]);

  const closeComposer = useCallback(() => {
    setPendingText(null);
    setDraftNote("");
    setDraftColor(HIGHLIGHT_COLORS[0].value);
  }, []);

  const saveHighlight = useCallback(async () => {
    if (!pendingText) return;
    try {
      setIsSavingHighlight(true);
      const payload = {
        page_index: pendingText.pageIndex,
        color: draftColor,
        quote: pendingText.text,
        note: draftNote.trim() || undefined,
        highlight_areas: pendingText.areas.map((a) => ({
          pageIndex: a.pageIndex,
          top: a.top,
          left: a.left,
          width: a.width,
          height: a.height,
        })),
      };
      const created = await highlightsService.create(bookId, payload);
      setHighlights((cur) => sortHighlights([...cur, created]));
      setActiveHighlightId(created.id);
      closeComposer();
      toast.success("Highlight saved");
    } catch (err: unknown) {
      let detail: string | undefined;
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { detail?: string } };
        };
        detail = axiosErr.response?.data?.detail;
      }
      toast.error(detail ?? "Failed to save highlight");
    } finally {
      setIsSavingHighlight(false);
    }
  }, [bookId, closeComposer, draftColor, draftNote, pendingText]);

  // -----------------------------------------------------------------------
  // Delete highlight
  // -----------------------------------------------------------------------
  const deleteHighlight = useCallback(async () => {
    if (!activeHighlight) return;
    try {
      setIsDeletingHighlight(true);
      await highlightsService.remove(bookId, activeHighlight.id);
      setHighlights((cur) =>
        cur.filter((h) => h.id !== activeHighlight.id)
      );
      setActiveHighlightId(null);
      toast.success("Highlight removed");
    } catch {
      toast.error("Failed to remove highlight");
    } finally {
      setIsDeletingHighlight(false);
    }
  }, [activeHighlight, bookId]);

  // -----------------------------------------------------------------------
  // Memoize document options to avoid re-creating on every render
  // -----------------------------------------------------------------------
  const documentOptions = useMemo(
    () => ({
      withCredentials: true,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    []
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div
      aria-label={`${title} PDF viewer`}
      className="relative flex h-full flex-col overflow-hidden bg-stone-950"
    >
      {/* Floating zoom bar */}
      <div
        className={`absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-stone-800 bg-stone-950/90 px-2 py-1 shadow-xl transition-all duration-200 ${
          showControls
            ? "bottom-4 opacity-100"
            : "-bottom-16 opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoomIndex <= 0}
          className="rounded-full p-2 text-stone-400 transition active:bg-stone-800 disabled:opacity-30"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-stone-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoomIndex >= ZOOM_STEPS.length - 1}
          className="rounded-full p-2 text-stone-400 transition active:bg-stone-800 disabled:opacity-30"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-stone-800" />

        <span className="px-1 text-xs tabular-nums text-stone-500">
          {isLoadingHighlights ? (
            <Loader2 className="inline h-3 w-3 animate-spin" />
          ) : highlights.length > 0 ? (
            `${highlights.length} highlight${highlights.length !== 1 ? "s" : ""}`
          ) : (
            <BookOpen className="inline h-3 w-3" />
          )}
        </span>
      </div>

      {/* PDF Document + virtualised scroll container */}
      <Document
        file={pdfUrl}
        onLoadSuccess={handleDocumentLoad}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        }
        error={
          <div className="flex h-full items-center justify-center p-6">
            <div className="max-w-sm rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-red-100">
              <p className="font-semibold">Unable to display this PDF</p>
              <p className="mt-2 text-sm text-red-100/70">
                The file may be corrupted or unsupported.
              </p>
            </div>
          </div>
        }
        options={documentOptions}
        className="h-full"
      >
        <div
          ref={scrollRef}
          className="h-full w-full overflow-auto overscroll-contain"
          onScroll={handleScroll}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((vRow) => (
              <div
                key={vRow.index}
                data-index={vRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vRow.start}px)`,
                }}
              >
                <div
                  className="flex justify-center"
                  style={{ padding: `${PAGE_GAP / 2}px 0` }}
                >
                  {/* Page wrapper — highlight overlays are positioned inside */}
                  <div className="relative">
                    <Page
                      pageNumber={vRow.index + 1}
                      width={pageWidth}
                      renderAnnotationLayer={!isMobile}
                      renderTextLayer
                      loading={
                        <div
                          className="animate-pulse rounded-lg bg-stone-900"
                          style={{
                            width: pageWidth,
                            height: pageWidth * A4_RATIO,
                          }}
                        />
                      }
                      className="shadow-xl shadow-black/30"
                    />

                    {/* Highlight overlays — percentage positioned relative to page */}
                    {highlights
                      .filter((h) => h.page_index === vRow.index)
                      .map((h) =>
                        h.highlight_areas.map((area, ai) => {
                          const isActive = h.id === activeHighlightId;
                          return (
                            <button
                              key={`${h.id}-${ai}`}
                              type="button"
                              title={h.note || h.quote}
                              onClick={() => setActiveHighlightId(h.id)}
                              className="absolute transition-colors"
                              style={{
                                top: `${area.top}%`,
                                left: `${area.left}%`,
                                width: `${area.width}%`,
                                height: `${area.height}%`,
                                background: getHighlightTint(h.color),
                                border: isActive
                                  ? `2px solid ${h.color}`
                                  : `1px solid ${h.color}80`,
                                borderRadius: "2px",
                                cursor: "pointer",
                                pointerEvents: "auto",
                              }}
                            />
                          );
                        })
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Document>

      {/* Selection floating action button — appears after text selection */}
      {selection && !pendingText && !activeHighlightId && (
        <button
          type="button"
          onClick={openComposer}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-amber-400 px-4 py-3 text-sm font-medium text-stone-950 shadow-2xl shadow-amber-400/20 transition active:scale-95 sm:bottom-20 sm:right-6"
        >
          <Highlighter className="h-4 w-4" />
          Highlight
        </button>
      )}

      {/* ============ COMPOSER BOTTOM SHEET ============ */}
      {pendingText && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeComposer}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="rounded-t-2xl border border-stone-800 bg-stone-950 p-5 shadow-2xl sm:rounded-2xl sm:pb-5 pb-[env(safe-area-inset-bottom,16px)]">
              {/* Drag handle (mobile) */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-700 sm:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-100">
                    New highlight
                  </p>
                  <p className="text-xs text-stone-500">
                    Page {pendingText.pageIndex + 1}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded-full p-1.5 text-stone-400 transition active:bg-stone-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 line-clamp-3 rounded-xl bg-stone-900 p-3 text-sm leading-relaxed text-stone-300">
                &ldquo;{pendingText.text}&rdquo;
              </p>

              {/* Color picker — big touch targets */}
              <div className="mt-4 flex gap-3">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setDraftColor(c.value)}
                    className={`h-10 w-10 rounded-full transition-transform ${
                      draftColor === c.value
                        ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-stone-950"
                        : "ring-1 ring-stone-700"
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.label}
                  />
                ))}
              </div>

              <textarea
                className="mt-4 h-20 w-full resize-none rounded-xl border border-stone-800 bg-stone-900 px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:outline-none"
                placeholder="Add a note (optional)"
                maxLength={2000}
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="flex-1 rounded-xl bg-stone-800 py-3 text-sm font-medium text-stone-300 transition active:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveHighlight}
                  disabled={isSavingHighlight}
                  className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-medium text-stone-950 transition active:bg-amber-300 disabled:opacity-60"
                >
                  {isSavingHighlight ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============ ACTIVE HIGHLIGHT DETAIL ============ */}
      {activeHighlight && !pendingText && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setActiveHighlightId(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="rounded-t-2xl border border-stone-800 bg-stone-950 p-5 shadow-2xl sm:rounded-2xl sm:pb-5 pb-[env(safe-area-inset-bottom,16px)]">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-700 sm:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: activeHighlight.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-100">
                      Saved highlight
                    </p>
                    <p className="text-xs text-stone-500">
                      Page {activeHighlight.page_index + 1}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHighlightId(null)}
                  className="rounded-full p-1.5 text-stone-400 transition active:bg-stone-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 rounded-xl bg-stone-900 p-3 text-sm leading-relaxed text-stone-200">
                &ldquo;{activeHighlight.quote}&rdquo;
              </p>

              {activeHighlight.note && (
                <div className="mt-3 rounded-xl bg-stone-900 p-3 text-sm text-stone-200">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                    Note
                  </div>
                  <p>{activeHighlight.note}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-stone-600">
                  {new Date(
                    activeHighlight.created_at
                  ).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={deleteHighlight}
                  disabled={isDeletingHighlight}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2.5 text-sm text-red-300 transition active:bg-red-500/10 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingHighlight ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Page navigation mini-buttons (mobile) */}
      {isMobile && numPages > 0 && showControls && (
        <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              if (currentPage > 1)
                virtualizer.scrollToIndex(currentPage - 2, {
                  align: "start",
                });
            }}
            className="rounded-full bg-stone-900/80 p-1.5 text-stone-400 active:bg-stone-800"
            aria-label="Previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentPage < numPages)
                virtualizer.scrollToIndex(currentPage, { align: "start" });
            }}
            className="rounded-full bg-stone-900/80 p-1.5 text-stone-400 active:bg-stone-800"
            aria-label="Next page"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
