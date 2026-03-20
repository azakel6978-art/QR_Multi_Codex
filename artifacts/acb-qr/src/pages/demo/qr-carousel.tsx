import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, Download, Timer,
  Music, Globe, BookOpen, Headphones, Users, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CarouselPage {
  num: number;
  source: string;
  type: string;
  url: string;
  color: string;
  synopsis: string;
}

const PAGES: CarouselPage[] = [
  { num: 1, source: "Linktree", type: "Link Hub", url: "https://linktr.ee/azakels", color: "#43E660", synopsis: "Central link hub — all AZAKELS digital destinations" },
  { num: 2, source: "SoundBetter", type: "Pro Profile", url: "https://soundbetter.com/profiles/652441-azakels", color: "#00E5FF", synopsis: "Professional profile — vocals, A&R, networking" },
  { num: 3, source: "Amazon", type: "Commit Poker", url: "https://www.amazon.com/gp/product/B0CKRFH8XX", color: "#FF9900", synopsis: "Kindle book — extends brand beyond music to writing" },
  { num: 4, source: "Songwhip", type: "All Streaming", url: "https://songwhip.com/azakels", color: "#9B59B6", synopsis: "Universal music link — auto-routes to preferred platform" },
  { num: 5, source: "Facebook", type: "Community", url: "https://www.facebook.com/azakels", color: "#4267B2", synopsis: "Fan engagement, events, and community updates" },
  { num: 6, source: "Instagram", type: "Visual Feed", url: "https://www.instagram.com/azakels", color: "#E1306C", synopsis: "Visual storytelling — art, behind-the-scenes, reels" },
  { num: 7, source: "AllPoetry", type: "Poetry Page", url: "https://allpoetry.com/azakels", color: "#8B5CF6", synopsis: "Published poetry — literary side of the AZAKELS brand" },
  { num: 8, source: "SoundCloud", type: "Audio Tracks", url: "https://soundcloud.com/azakels", color: "#FF5500", synopsis: "Direct audio playback — demos, releases, live sessions" },
  { num: 9, source: "Amazon Music", type: "Discography", url: "https://music.amazon.com/artists/azakels", color: "#25D1DA", synopsis: "Full discography — Poetic Personifications, Dog Paradox" },
];

const INTERVAL_SECONDS = 5;

export function QrCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [qrImages, setQrImages] = useState<Record<number, string>>({});
  const [qrStatus, setQrStatus] = useState<Record<number, "loading" | "done" | "error">>({});
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateSingleQr = useCallback(async (idx: number): Promise<boolean> => {
    const page = PAGES[idx];
    setQrStatus(prev => ({ ...prev, [idx]: "loading" }));
    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData: page.url,
          cornerColor: page.color,
          highlightCorners: true,
          colorScheme: "standard",
          scanMeText: `${page.num}/9 · ${page.source}`,
          scanMeColor: page.color,
          logoScale: 0,
          tabsToOpen: 1,
          metadataFriendly: true,
          pageTitle: `AZAKELS — ${page.type}`,
          pageDescription: page.synopsis,
        }),
      });
      const data = await res.json();
      if (data.qrImageBase64) {
        setQrImages(prev => ({ ...prev, [idx]: data.qrImageBase64 }));
        setQrStatus(prev => ({ ...prev, [idx]: "done" }));
        return true;
      }
      throw new Error("No image returned");
    } catch {
      setQrStatus(prev => ({ ...prev, [idx]: "error" }));
      return false;
    }
  }, []);

  const generateAllQrs = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled(PAGES.map((_, idx) => generateSingleQr(idx)));
    setLoading(false);
  }, [generateSingleQr]);

  useEffect(() => { generateAllQrs(); }, [generateAllQrs]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= INTERVAL_SECONDS * 10) {
          setActiveIdx(i => (i + 1) % PAGES.length);
          return 0;
        }
        return prev + 1;
      });
    }, 100);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const goTo = (idx: number) => { setActiveIdx(idx); setElapsed(0); };
  const prev = () => goTo((activeIdx - 1 + PAGES.length) % PAGES.length);
  const next = () => goTo((activeIdx + 1) % PAGES.length);

  const page = PAGES[activeIdx];
  const progress = elapsed / (INTERVAL_SECONDS * 10);

  const downloadCurrent = () => {
    const img = qrImages[activeIdx];
    if (!img) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${img}`;
    link.download = `azakels-qr-${page.num}-${page.source.toLowerCase().replace(/\s/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    Object.entries(qrImages).forEach(([idx, img]) => {
      const p = PAGES[parseInt(idx)];
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${img}`;
      link.download = `azakels-qr-${p.num}-${p.source.toLowerCase().replace(/\s/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const sourceIcon = (src: string) => {
    if (src === "SoundBetter") return <Music className="w-3.5 h-3.5" />;
    if (src === "Amazon") return <BookOpen className="w-3.5 h-3.5" />;
    if (src === "Songwhip") return <Headphones className="w-3.5 h-3.5" />;
    return <Users className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Morphing QR Carousel</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          9 real scannable QR codes — each encodes a unique URL. Auto-cycles every {INTERVAL_SECONDS} seconds.
          Open on one device, photograph each frame with another, then scan via camera or Google Lens.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main QR Display */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl shadow-black/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.92, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotateY: -90 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center p-4"
              >
                {qrStatus[activeIdx] === "error" ? (
                  <div className="flex flex-col items-center gap-3 text-red-400">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">!</div>
                    <span className="text-sm">Failed to generate QR {activeIdx + 1}</span>
                    <Button size="sm" variant="outline" onClick={() => generateSingleQr(activeIdx)} className="text-xs">
                      Retry
                    </Button>
                  </div>
                ) : loading || !qrImages[activeIdx] ? (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">Generating QR {activeIdx + 1}/9…</span>
                  </div>
                ) : (
                  <img
                    src={`data:image/png;base64,${qrImages[activeIdx]}`}
                    alt={`QR code ${page.num}: ${page.type} — ${page.url}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Page counter overlay */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-white text-xs font-bold shadow-lg"
              style={{ backgroundColor: page.color + "DD" }}>
              {page.num} / 9
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full max-w-md mt-4 space-y-2">
            <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: page.color }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Timer className="w-3 h-3" />
                <span>{Math.ceil(INTERVAL_SECONDS - elapsed / 10)}s until next</span>
              </div>
              <span className="font-mono">{page.source} · {page.type}</span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={prev} className="w-9 h-9 p-0">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setPlaying(!playing)}
              className="w-12 h-12 rounded-full p-0"
              style={{ backgroundColor: page.color }}
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <Button variant="outline" size="sm" onClick={next} className="w-9 h-9 p-0">
              <SkipForward className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border/40 mx-1" />
            <Button variant="outline" size="sm" onClick={downloadCurrent} className="gap-1.5 text-xs">
              <Download className="w-3 h-3" /> This QR
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAll} className="gap-1.5 text-xs">
              <Download className="w-3 h-3" /> All 9
            </Button>
          </div>
        </div>

        {/* Page list sidebar */}
        <div className="w-full lg:w-72 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Page Sequence</p>
          {PAGES.map((p, idx) => (
            <button
              key={p.num}
              onClick={() => goTo(idx)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl border flex items-center gap-3 transition-all",
                idx === activeIdx
                  ? "bg-white/5 border-white/20 shadow-lg"
                  : "bg-transparent border-transparent hover:bg-white/3 hover:border-white/10"
              )}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: idx === activeIdx ? p.color : p.color + "33" }}
              >
                {p.num}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold leading-tight", idx === activeIdx ? "text-white" : "text-muted-foreground")}>
                  {p.type}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{sourceIcon(p.source)}</span>
                  <span className="text-[10px] text-muted-foreground">{p.source}</span>
                </div>
              </div>
              {qrStatus[idx] === "error" ? (
                <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
              ) : qrStatus[idx] === "loading" ? (
                <div className="w-2 h-2 rounded-full shrink-0 bg-yellow-500 animate-pulse" />
              ) : idx === activeIdx ? (
                <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: p.color }} />
              ) : qrStatus[idx] === "done" ? (
                <div className="w-2 h-2 rounded-full shrink-0 bg-green-500/50" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Current page detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-2xl border p-5 max-w-2xl mx-auto"
          style={{ borderColor: page.color + "40", backgroundColor: page.color + "08" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Badge style={{ backgroundColor: page.color + "25", color: page.color, borderColor: page.color + "50" }} className="border text-xs">
              {page.source}
            </Badge>
            <span className="text-sm font-bold text-white">{page.type}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{page.synopsis}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <a href={page.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border text-white hover:bg-white/5 transition-colors"
              style={{ borderColor: page.color + "40" }}>
              <ExternalLink className="w-3 h-3" /> Open Page
            </a>
            <code className="text-[10px] text-muted-foreground font-mono truncate max-w-[300px]">{page.url}</code>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
