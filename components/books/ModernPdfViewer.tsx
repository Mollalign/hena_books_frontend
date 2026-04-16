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
  Minus,
  Plus,
  NotebookPen,
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
// Percentage-based highlight area (device-independent, 0-100)
// ---------------------------------------------------------------------------

interface PercentRect {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}

// ---------------------------------------------------------------------------
// Text selection hook
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
  _containerRef: React.RefObject<HTMLDivElement | null>,
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

    const delayedCapture = () => setTimeout(tryCapture, 50);

    document.addEventListener("mouseup", delayedCapture);
    document.addEventListener("touchend", delayedCapture, { passive: true });
    document.addEventListener("pointerup", delayedCapture);
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

  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(2);
  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;

  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [isDeletingHighlight, setIsDeletingHighlight] = useState(false);

  const [pendingText, setPendingText] = useState<{
    text: string;
    pageIndex: number;
    areas: PercentRect[];
  } | null>(null);
  const [draftColor, setDraftColor] = useState<string>(HIGHLIGHT_COLORS[0].value);
  const [draftNote, setDraftNote] = useState("");
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);

  const { selection, clearSelection } = useTextSelection(
    scrollRef,
    !pendingText && !activeHighlightId
  );

  // Measure container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleDocumentLoad = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      onLoadComplete?.(n);
    },
    [onLoadComplete]
  );

  // On mobile: full-bleed pages. On desktop: slight padding, max 960px.
  const pageGap = isMobile ? 4 : 12;

  const pageWidth = useMemo(() => {
    if (containerWidth === 0) return 300;
    const maxW = isMobile
      ? containerWidth
      : Math.min(containerWidth - 48, 960);
    return Math.max(maxW * zoom, 200);
  }, [containerWidth, zoom, isMobile]);

  const estimatedPageHeight = useMemo(
    () => Math.round(pageWidth * A4_RATIO) + pageGap,
    [pageWidth, pageGap]
  );

  const virtualizer = useVirtualizer({
    count: numPages,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedPageHeight,
    overscan: 2,
  });

  // Use a ref-based callback so react-pdf's stale viewer closure
  // always invokes the latest handler with current virtualizer/numPages.
  const handleItemClickRef = useRef((_args: { pageNumber: number }) => {});
  handleItemClickRef.current = ({ pageNumber }: { pageNumber: number }) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      virtualizer.scrollToIndex(pageNumber - 1, { align: "start" });
    }
  };
  const handleItemClick = useCallback(
    (args: { pageNumber: number }) => handleItemClickRef.current(args),
    []
  );

  const hasScrolledToInitial = useRef(false);
  useEffect(() => {
    if (!hasScrolledToInitial.current && numPages > 0 && initialPage && initialPage > 1) {
      hasScrolledToInitial.current = true;
      virtualizer.scrollToIndex(initialPage - 1, { align: "start" });
    }
  }, [numPages, initialPage, virtualizer]);

  // Page tracking
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
      const dist = Math.abs(item.start + item.size / 2 - viewportMiddle);
      if (dist < minDist) { minDist = dist; closest = item; }
    }
    const page = closest.index + 1;
    if (page !== lastReportedPage.current) {
      lastReportedPage.current = page;
      setCurrentPage(page);
      if (pageChangeTimer.current) clearTimeout(pageChangeTimer.current);
      pageChangeTimer.current = setTimeout(() => onPageChangeRef.current?.(page), 150);
    }
  }, [virtualizer]);

  const zoomIn = useCallback(() => {
    setZoomIndex((i) => { const n = Math.min(i + 1, ZOOM_STEPS.length - 1); onScaleChange?.(ZOOM_STEPS[n]); return n; });
  }, [onScaleChange]);

  const zoomOut = useCallback(() => {
    setZoomIndex((i) => { const n = Math.max(i - 1, 0); onScaleChange?.(ZOOM_STEPS[n]); return n; });
  }, [onScaleChange]);

  const lastScrollY = useRef(0);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const y = el.scrollTop;
    if (isMobile) setShowControls(y < lastScrollY.current || y < 50);
    lastScrollY.current = y;
    computeCurrentPage();
  }, [isMobile, computeCurrentPage]);

  // External links → open in new tab. Internal links (TOC, cross-refs) are
  // handled by react-pdf's LinkService which calls our onItemClick prop.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as Element)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("http://") || href.startsWith("https://")) {
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }
    };

    container.addEventListener("click", handleLinkClick);
    return () => container.removeEventListener("click", handleLinkClick);
  }, []);

  // Highlights
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setIsLoadingHighlights(true);
        const items = await highlightsService.list(bookId);
        if (!ignore) setHighlights(sortHighlights(items));
      } catch { if (!ignore) toast.error("Failed to load highlights"); }
      finally { if (!ignore) setIsLoadingHighlights(false); }
    })();
    return () => { ignore = true; };
  }, [bookId]);

  const activeHighlight = activeHighlightId
    ? (highlights.find((h) => h.id === activeHighlightId) ?? null)
    : null;

  const openComposer = useCallback(() => {
    if (!selection) return;
    setPendingText({ text: selection.text, pageIndex: selection.pageIndex, areas: selection.areas });
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
          pageIndex: a.pageIndex, top: a.top, left: a.left, width: a.width, height: a.height,
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
        detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      }
      toast.error(detail ?? "Failed to save highlight");
    } finally { setIsSavingHighlight(false); }
  }, [bookId, closeComposer, draftColor, draftNote, pendingText]);

  const deleteHighlight = useCallback(async () => {
    if (!activeHighlight) return;
    try {
      setIsDeletingHighlight(true);
      await highlightsService.remove(bookId, activeHighlight.id);
      setHighlights((cur) => cur.filter((h) => h.id !== activeHighlight.id));
      setActiveHighlightId(null);
      toast.success("Highlight removed");
    } catch { toast.error("Failed to remove highlight"); }
    finally { setIsDeletingHighlight(false); }
  }, [activeHighlight, bookId]);

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

  const hasOverlay = !!pendingText || !!activeHighlight || showHighlightsPanel;
  const showToolbar = showControls && !hasOverlay && !selection;

  return (
    <div
      aria-label={`${title} PDF viewer`}
      className="relative flex h-full flex-col overflow-hidden bg-neutral-900"
    >
      {/* ====== PDF PAGES ====== */}
      <Document
        file={pdfUrl}
        onLoadSuccess={handleDocumentLoad}
        onItemClick={handleItemClick}
        loading={
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
            <p className="text-xs text-neutral-500">Loading document...</p>
          </div>
        }
        error={
          <div className="flex h-full items-center justify-center px-8">
            <div className="rounded-2xl bg-red-950/40 px-6 py-5 text-center">
              <p className="text-sm font-medium text-red-300">Unable to display PDF</p>
              <p className="mt-1 text-xs text-red-400/70">The file may be corrupted.</p>
            </div>
          </div>
        }
        options={documentOptions}
        className="h-full"
      >
        <div
          ref={scrollRef}
          className="h-full w-full overflow-auto overscroll-contain bg-neutral-900"
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
                  style={{ padding: `${pageGap / 2}px 0` }}
                >
                  <div className="relative">
                    <Page
                      pageNumber={vRow.index + 1}
                      width={pageWidth}
                      renderAnnotationLayer
                      renderTextLayer
                      loading={
                        <div
                          className="animate-pulse bg-neutral-800"
                          style={{
                            width: pageWidth,
                            height: pageWidth * A4_RATIO,
                            borderRadius: isMobile ? 0 : 6,
                          }}
                        />
                      }
                      className={isMobile ? "" : "rounded-md"}
                    />

                    {highlights
                      .filter((h) => h.page_index === vRow.index)
                      .map((h) =>
                        h.highlight_areas.map((area, ai) => (
                          <button
                            key={`${h.id}-${ai}`}
                            type="button"
                            title={h.note || h.quote}
                            onClick={() => setActiveHighlightId(h.id)}
                            className="absolute"
                            style={{
                              top: `${area.top}%`,
                              left: `${area.left}%`,
                              width: `${area.width}%`,
                              height: `${area.height}%`,
                              background: getHighlightTint(h.color),
                              border:
                                h.id === activeHighlightId
                                  ? `2px solid ${h.color}`
                                  : `1px solid ${h.color}50`,
                              borderRadius: 2,
                              cursor: "pointer",
                              pointerEvents: "auto",
                            }}
                          />
                        ))
                      )}
                  </div>
                </div>

                {/* Tiny page number between pages (mobile) */}
                {isMobile && (
                  <p className="pb-0.5 text-center text-[10px] tabular-nums text-neutral-600">
                    {vRow.index + 1}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Document>

      {/* ====== FLOATING TOOLBAR ====== */}
      <div
        className={`absolute left-1/2 z-30 -translate-x-1/2 transition-all duration-300 ease-out ${
          showToolbar
            ? "bottom-5 translate-y-0 opacity-100"
            : "bottom-0 translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-0.5 rounded-2xl border border-neutral-800 bg-neutral-950/95 px-1.5 py-1 shadow-2xl shadow-black/50">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomIndex <= 0}
            className="rounded-xl p-2.5 text-neutral-400 active:bg-neutral-800 disabled:opacity-25"
            aria-label="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <span className="min-w-[2.5rem] text-center text-[11px] font-medium tabular-nums text-neutral-400">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomIndex >= ZOOM_STEPS.length - 1}
            className="rounded-xl p-2.5 text-neutral-400 active:bg-neutral-800 disabled:opacity-25"
            aria-label="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          {highlights.length > 0 && !isLoadingHighlights && (
            <>
              <div className="mx-0.5 h-4 w-px bg-neutral-800" />
              <button
                type="button"
                onClick={() => setShowHighlightsPanel(true)}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-neutral-400 active:bg-neutral-800"
                aria-label="View highlights"
              >
                <NotebookPen className="h-3.5 w-3.5" />
                <span className="text-[11px] tabular-nums">{highlights.length}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ====== HIGHLIGHT FAB ====== */}
      {selection && !pendingText && !activeHighlightId && (
        <button
          type="button"
          onClick={openComposer}
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-[13px] font-semibold text-neutral-950 shadow-xl shadow-amber-500/25 transition-transform active:scale-95"
        >
          <Highlighter className="h-4 w-4" />
          Highlight
        </button>
      )}

      {/* ====== NEW HIGHLIGHT SHEET ====== */}
      {pendingText && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={closeComposer} />

          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2 animate-in slide-in-from-bottom duration-200">
            <div className="rounded-t-3xl bg-neutral-950 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] sm:rounded-3xl sm:p-6 sm:pb-6 border-t border-neutral-800 sm:border">
              <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-neutral-700 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-neutral-100">
                  New Highlight
                  <span className="ml-2 font-normal text-neutral-500">p.{pendingText.pageIndex + 1}</span>
                </p>
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded-full p-1.5 text-neutral-500 active:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Selected text */}
              <div className="mt-3 rounded-2xl bg-neutral-900 px-4 py-3">
                <p className="line-clamp-3 text-[13px] leading-relaxed text-neutral-300 italic">
                  &ldquo;{pendingText.text}&rdquo;
                </p>
              </div>

              {/* Color picker */}
              <div className="mt-4 flex items-center justify-center gap-4">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setDraftColor(c.value)}
                    aria-label={c.label}
                    className="relative flex items-center justify-center"
                  >
                    <span
                      className={`block h-7 w-7 rounded-full transition-all ${
                        draftColor === c.value
                          ? "scale-110 ring-[2.5px] ring-white/90 ring-offset-2 ring-offset-neutral-950"
                          : "opacity-70"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  </button>
                ))}
              </div>

              {/* Note input */}
              <textarea
                className="mt-4 h-16 w-full resize-none rounded-2xl bg-neutral-900 px-4 py-3 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                placeholder="Add a note (optional)..."
                maxLength={2000}
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
              />

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="flex-1 rounded-2xl bg-neutral-800/80 py-3 text-[13px] font-medium text-neutral-400 active:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveHighlight}
                  disabled={isSavingHighlight}
                  className="flex-1 rounded-2xl bg-amber-400 py-3 text-[13px] font-semibold text-neutral-950 active:bg-amber-300 disabled:opacity-50"
                >
                  {isSavingHighlight ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ====== SAVED HIGHLIGHT SHEET ====== */}
      {activeHighlight && !pendingText && !showHighlightsPanel && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setActiveHighlightId(null)} />

          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="rounded-t-3xl bg-neutral-950 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] sm:rounded-3xl sm:p-6 sm:pb-6 border-t border-neutral-800 sm:border">
              <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-neutral-700 sm:hidden" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeHighlight.color }}
                  />
                  <p className="text-[13px] font-semibold text-neutral-100">
                    Highlight
                    <span className="ml-2 font-normal text-neutral-500">p.{activeHighlight.page_index + 1}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHighlightId(null)}
                  className="rounded-full p-1.5 text-neutral-500 active:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-2xl bg-neutral-900 px-4 py-3">
                <p className="text-[13px] leading-relaxed text-neutral-300 italic">
                  &ldquo;{activeHighlight.quote}&rdquo;
                </p>
              </div>

              {activeHighlight.note && (
                <div className="mt-2.5 rounded-2xl bg-neutral-900 px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    <MessageSquareQuote className="h-3 w-3" />
                    Note
                  </div>
                  <p className="text-[13px] leading-relaxed text-neutral-200">
                    {activeHighlight.note}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-neutral-600">
                  {new Date(activeHighlight.created_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={deleteHighlight}
                  disabled={isDeletingHighlight}
                  className="flex items-center gap-1.5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-[12px] font-medium text-red-400 active:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeletingHighlight ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ====== HIGHLIGHTS & NOTES PANEL ====== */}
      {showHighlightsPanel && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowHighlightsPanel(false)} />

          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="flex max-h-[70dvh] flex-col rounded-t-3xl bg-neutral-950 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] sm:rounded-3xl sm:pt-5 border-t border-neutral-800 sm:border">
              <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-neutral-700 sm:hidden" />

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <div className="flex items-center gap-2">
                  <NotebookPen className="h-4 w-4 text-amber-400" />
                  <p className="text-[14px] font-semibold text-neutral-100">
                    Highlights & Notes
                  </p>
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium tabular-nums text-neutral-400">
                    {highlights.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHighlightsPanel(false)}
                  className="rounded-full p-1.5 text-neutral-500 active:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto px-4 pb-2">
                {highlights.length === 0 ? (
                  <div className="py-10 text-center">
                    <Highlighter className="mx-auto h-8 w-8 text-neutral-700" />
                    <p className="mt-3 text-[13px] text-neutral-500">No highlights yet</p>
                    <p className="mt-1 text-[11px] text-neutral-600">Select text in the book to create one</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {highlights.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setShowHighlightsPanel(false);
                          setActiveHighlightId(h.id);
                          virtualizer.scrollToIndex(h.page_index, { align: "start" });
                        }}
                        className="group w-full rounded-2xl bg-neutral-900/80 p-3.5 text-left transition active:bg-neutral-800"
                      >
                        {/* Color bar + quote */}
                        <div className="flex gap-3">
                          <div
                            className="mt-0.5 h-full w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: h.color, minHeight: 24 }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[13px] leading-relaxed text-neutral-300 italic">
                              &ldquo;{h.quote}&rdquo;
                            </p>

                            {h.note && (
                              <div className="mt-2 flex items-start gap-1.5">
                                <MessageSquareQuote className="mt-0.5 h-3 w-3 shrink-0 text-neutral-500" />
                                <p className="line-clamp-2 text-[12px] leading-relaxed text-neutral-400">
                                  {h.note}
                                </p>
                              </div>
                            )}

                            <p className="mt-2 text-[10px] text-neutral-600">
                              Page {h.page_index + 1} &middot; {new Date(h.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
