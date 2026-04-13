"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SpecialZoomLevel,
  Viewer,
  Worker,
  type DocumentLoadEvent,
  type PageChangeEvent,
  type ZoomEvent,
} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
  Trigger,
  highlightPlugin,
  type HighlightArea as ViewerHighlightArea,
  type RenderHighlightTargetProps,
  type RenderHighlightsProps,
} from "@react-pdf-viewer/highlight";
import { Highlighter, Loader2, MessageSquareQuote, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { highlightsService, type BookHighlight } from "@/lib/services/highlights";

interface ModernPdfViewerProps {
  bookId: string;
  pdfUrl: string;
  title: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onScaleChange?: (scale: number) => void;
  onLoadComplete?: (numPages: number) => void;
}

interface PendingHighlight {
  pageIndex: number;
  quote: string;
  highlightAreas: ViewerHighlightArea[];
}

const HIGHLIGHT_COLORS = [
  { value: "#FACC15", label: "Yellow", tint: "rgba(250, 204, 21, 0.35)" },
  { value: "#4ADE80", label: "Green", tint: "rgba(74, 222, 128, 0.3)" },
  { value: "#60A5FA", label: "Blue", tint: "rgba(96, 165, 250, 0.3)" },
  { value: "#F472B6", label: "Pink", tint: "rgba(244, 114, 182, 0.28)" },
  { value: "#FB923C", label: "Orange", tint: "rgba(251, 146, 60, 0.3)" },
] as const;

const WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function sortHighlights(highlights: BookHighlight[]) {
  return [...highlights].sort((a, b) => {
    if (a.page_index !== b.page_index) return a.page_index - b.page_index;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getHighlightTint(color: string) {
  return HIGHLIGHT_COLORS.find((item) => item.value === color)?.tint || "rgba(250, 204, 21, 0.35)";
}

export default function ModernPdfViewer({
  bookId,
  pdfUrl,
  title,
  initialPage,
  onPageChange,
  onScaleChange,
  onLoadComplete,
}: ModernPdfViewerProps) {
  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [pendingHighlight, setPendingHighlight] = useState<PendingHighlight | null>(null);
  const [draftColor, setDraftColor] = useState<string>(HIGHLIGHT_COLORS[0].value);
  const [draftNote, setDraftNote] = useState("");
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);
  const [isDeletingHighlight, setIsDeletingHighlight] = useState(false);
  const highlightsRef = useRef<BookHighlight[]>([]);
  const activeHighlightIdRef = useRef<string | null>(null);

  useEffect(() => {
    highlightsRef.current = highlights;
  }, [highlights]);

  useEffect(() => {
    activeHighlightIdRef.current = activeHighlightId;
  }, [activeHighlightId]);

  useEffect(() => {
    let ignore = false;

    const loadHighlights = async () => {
      try {
        setIsLoadingHighlights(true);
        const items = await highlightsService.list(bookId);
        if (!ignore) {
          setHighlights(sortHighlights(items));
        }
      } catch {
        if (!ignore) {
          toast.error("Failed to load saved highlights");
        }
      } finally {
        if (!ignore) {
          setIsLoadingHighlights(false);
        }
      }
    };

    loadHighlights();

    return () => {
      ignore = true;
    };
  }, [bookId]);

  const activeHighlight = activeHighlightId
    ? highlights.find((highlight) => highlight.id === activeHighlightId) ?? null
    : null;

  const closeComposer = useCallback(() => {
    setPendingHighlight(null);
    setDraftNote("");
    setDraftColor(HIGHLIGHT_COLORS[0].value);
  }, []);

  const handleDocumentLoad = useCallback(
    (event: DocumentLoadEvent) => {
      onLoadComplete?.(event.doc.numPages);
    },
    [onLoadComplete]
  );

  const handlePageChange = useCallback(
    (event: PageChangeEvent) => {
      onPageChange?.(event.currentPage + 1);
    },
    [onPageChange]
  );

  const handleZoom = useCallback(
    (event: ZoomEvent) => {
      onScaleChange?.(event.scale);
    },
    [onScaleChange]
  );

  const saveHighlight = useCallback(async () => {
    if (!pendingHighlight) return;

    try {
      setIsSavingHighlight(true);

      const payload = {
        page_index: pendingHighlight.pageIndex,
        color: draftColor,
        quote: pendingHighlight.quote,
        note: draftNote.trim() || undefined,
        highlight_areas: pendingHighlight.highlightAreas,
      };

      const created = await highlightsService.create(bookId, payload);

      setHighlights((current) => sortHighlights([...current, created]));
      setActiveHighlightId(created.id);
      closeComposer();
      toast.success("Highlight saved");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
        const detail = axiosErr.response?.data?.detail;
        if (axiosErr.response?.status === 503 && detail) {
          toast.error(detail);
        } else {
          toast.error(detail || "Failed to save highlight");
        }
      } else {
        toast.error("Failed to save highlight");
      }
    } finally {
      setIsSavingHighlight(false);
    }
  }, [bookId, closeComposer, draftColor, draftNote, pendingHighlight]);

  const deleteHighlight = useCallback(async () => {
    if (!activeHighlight) return;

    try {
      setIsDeletingHighlight(true);
      await highlightsService.remove(bookId, activeHighlight.id);
      setHighlights((current) => current.filter((item) => item.id !== activeHighlight.id));
      setActiveHighlightId(null);
      toast.success("Highlight removed");
    } catch {
      toast.error("Failed to remove highlight");
    } finally {
      setIsDeletingHighlight(false);
    }
  }, [activeHighlight, bookId]);

  // --- Stable render callbacks via refs --------------------------------
  // IMPORTANT: highlightPlugin() and defaultLayoutPlugin() internally call
  // React.useMemo, making them hooks. They MUST be called at the top level
  // of this component — never inside useMemo/useCallback/useEffect.
  // We use refs so the render functions always see the latest closure values.

  const renderHighlightTargetRef = useRef<(props: RenderHighlightTargetProps) => React.ReactElement>(() => <></>);
  renderHighlightTargetRef.current = (props: RenderHighlightTargetProps) => (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full bg-stone-950/95 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg ring-1 ring-white/10 transition hover:bg-stone-900"
      style={{
        left: `${props.selectionRegion.left}%`,
        top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
        position: "absolute",
        transform: "translateY(8px)",
        zIndex: 30,
      }}
      onClick={() => {
        setPendingHighlight({
          pageIndex: props.highlightAreas[0]?.pageIndex ?? props.selectionRegion.pageIndex,
          quote: props.selectedText,
          highlightAreas: props.highlightAreas,
        });
        setDraftNote("");
        setDraftColor(HIGHLIGHT_COLORS[0].value);
        props.cancel();
      }}
    >
      <Highlighter className="h-3.5 w-3.5" />
      Highlight
    </button>
  );

  const renderHighlightsRef2 = useRef<(props: RenderHighlightsProps) => React.ReactElement>(() => <></>);
  renderHighlightsRef2.current = (props: RenderHighlightsProps) => (
    <>
      {highlightsRef.current
        .filter((highlight) => highlight.page_index === props.pageIndex)
        .map((highlight) =>
          highlight.highlight_areas.map((area, index) => {
            const isActive = highlight.id === activeHighlightIdRef.current;
            return (
              <button
                key={`${highlight.id}-${index}`}
                type="button"
                title={highlight.note || highlight.quote}
                onClick={() => setActiveHighlightId(highlight.id)}
                style={{
                  ...props.getCssProperties(area, props.rotation),
                  background: getHighlightTint(highlight.color),
                  border: isActive ? `2px solid ${highlight.color}` : `1px solid ${highlight.color}80`,
                  borderRadius: "0.2rem",
                  cursor: "pointer",
                  position: "absolute",
                }}
              />
            );
          })
        )}
    </>
  );

  // Called at top level — these are effectively hooks (they use React.useMemo internally)
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => defaultTabs.slice(0, 2),
  });

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget: (props: RenderHighlightTargetProps) =>
      renderHighlightTargetRef.current(props),
    renderHighlights: (props: RenderHighlightsProps) =>
      renderHighlightsRef2.current(props),
    trigger: Trigger.TextSelection,
  });

  return (
    <div aria-label={`${title} PDF viewer`} className="relative h-full overflow-hidden bg-slate-950">
      <Worker workerUrl={WORKER_URL}>
        <div className="modern-pdf-viewer h-full">
          <Viewer
            defaultScale={SpecialZoomLevel.PageWidth}
            enableSmoothScroll
            fileUrl={pdfUrl}
            initialPage={Math.max((initialPage ?? 1) - 1, 0)}
            plugins={[defaultLayoutPluginInstance, highlightPluginInstance]}
            renderError={(error) => (
              <div className="flex h-full items-center justify-center p-6">
                <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-red-100">
                  <p className="font-semibold">Unable to display this PDF</p>
                  <p className="mt-2 text-sm text-red-100/80">{error.message}</p>
                </div>
              </div>
            )}
            renderLoader={(percentages) => (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-stone-300">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                <p className="text-sm">{percentages}% loaded</p>
              </div>
            )}
            theme="dark"
            withCredentials
            onDocumentLoad={handleDocumentLoad}
            onPageChange={handlePageChange}
            onZoom={handleZoom}
          />
        </div>
      </Worker>

      {pendingHighlight && (
        <div className="absolute bottom-4 right-4 z-40 w-[22rem] max-w-[calc(100%-2rem)] rounded-2xl border border-stone-700 bg-stone-950/95 p-4 text-stone-100 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">New highlight</p>
              <p className="text-xs text-stone-400">Page {pendingHighlight.pageIndex + 1}</p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-stone-400 transition hover:bg-stone-800 hover:text-stone-200"
              onClick={closeComposer}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 line-clamp-4 rounded-xl border border-stone-800 bg-stone-900/70 p-3 text-sm text-stone-200">
            {pendingHighlight.quote}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${draftColor === color.value
                  ? "border-white/60 bg-stone-800 text-white"
                  : "border-stone-700 bg-stone-900 text-stone-300 hover:border-stone-500"
                  }`}
                onClick={() => setDraftColor(color.value)}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.value }} />
                {color.label}
              </button>
            ))}
          </div>

          <textarea
            className="mt-4 min-h-24 w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-400"
            maxLength={2000}
            placeholder="Add a note for this passage (optional)"
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
          />

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm text-stone-300 transition hover:bg-stone-800"
              onClick={closeComposer}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSavingHighlight}
              onClick={saveHighlight}
            >
              {isSavingHighlight ? "Saving..." : "Save highlight"}
            </button>
          </div>
        </div>
      )}

      {activeHighlight && !pendingHighlight && (
        <div className="absolute bottom-4 right-4 z-40 w-[22rem] max-w-[calc(100%-2rem)] rounded-2xl border border-stone-700 bg-stone-950/95 p-4 text-stone-100 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activeHighlight.color }} />
              <div>
                <p className="text-sm font-semibold">Saved highlight</p>
                <p className="text-xs text-stone-400">Page {activeHighlight.page_index + 1}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-stone-400 transition hover:bg-stone-800 hover:text-stone-200"
              onClick={() => setActiveHighlightId(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 rounded-xl border border-stone-800 bg-stone-900/70 p-3 text-sm text-stone-200">
            {activeHighlight.quote}
          </p>

          {activeHighlight.note && (
            <div className="mt-3 rounded-xl border border-stone-800 bg-stone-900/70 p-3 text-sm text-stone-200">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                Note
              </div>
              <p>{activeHighlight.note}</p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {new Date(activeHighlight.created_at).toLocaleDateString()}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isDeletingHighlight}
              onClick={deleteHighlight}
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingHighlight ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      )}

      {!pendingHighlight && !activeHighlight && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-30 rounded-full border border-white/10 bg-stone-950/80 px-4 py-2 text-xs text-stone-300 shadow-lg backdrop-blur">
          {isLoadingHighlights
            ? "Loading highlights..."
            : highlights.length > 0
              ? `${highlights.length} highlight${highlights.length === 1 ? "" : "s"} saved`
              : "Select text to create a highlight"}
        </div>
      )}

      <style jsx global>{`
        .modern-pdf-viewer .rpv-core__viewer {
          background: #020617;
        }
        .modern-pdf-viewer .rpv-default-layout__body,
        .modern-pdf-viewer .rpv-default-layout__main,
        .modern-pdf-viewer .rpv-core__inner-page {
          background: #020617;
        }
        .modern-pdf-viewer .rpv-default-layout__toolbar {
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
        }
        .modern-pdf-viewer .rpv-default-layout__sidebar {
          border-right: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(15, 23, 42, 0.9);
        }
        .modern-pdf-viewer .rpv-core__page-layer {
          box-shadow: 0 24px 50px rgba(2, 6, 23, 0.45);
        }
      `}</style>
    </div>
  );
}
