import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  QrCode, Globe, Music, Radio, ExternalLink, RefreshCw,
  Cpu, ChevronRight, Info, Download, Layers, BookOpen, Users, Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────────────────────────────────────────
// REAL AZAKELS 9-PAGE MATRIX — verified URLs + research data
// Formula: 3 sources × (1 intro + 2 content pages) = 9
// ─────────────────────────────────────────────────────────────────────────────
const NINE_PAGES = [
  // ── SOURCE 1: SoundBetter ──────────────────────────────────────────────────
  {
    num: 1,
    source: "SoundBetter",
    type: "Intro Synopsis",
    url: "https://soundbetter.com/profiles/azakels",
    icon: <Music className="w-4 h-4" />,
    color: "cyan",
    pageRole: "intro",
    synopsis:
      "AZAKELS is a multi-disciplined independent artist from Morgantown, WV operating as vocalist, A&R consultant, and music networker through Azareal Productions. His SoundBetter profile is the central professional hub — connecting prospective collaborators to a web of personal properties (Azareal.net, Azakels.net, Azamerch.store) and streaming platforms via Songwhip.",
    altText:
      "Artist profile of AZAKELS on SoundBetter featuring biographical background, professional services (vocals, A&R, music production, networking), personal website links, and genre versatility.",
  },
  {
    num: 2,
    source: "SoundBetter",
    type: "Artist Profile Page",
    url: "https://soundbetter.com/profiles/azakels",
    icon: <Music className="w-4 h-4" />,
    color: "cyan",
    pageRole: "profile",
    synopsis:
      "The full professional profile on SoundBetter — services offered, sample works, credits, and biography. Ideal as a press kit redirect target or a landing page for industry contacts scanning QR at events.",
    altText:
      "AZAKELS full SoundBetter professional profile — vocals, music production, A&R services, credits, and contact information for industry networking.",
  },
  {
    num: 3,
    source: "SoundBetter",
    type: "LinkTree Asset Hub",
    url: "https://linktr.ee/azakels",
    icon: <Globe className="w-4 h-4" />,
    color: "cyan",
    pageRole: "media",
    synopsis:
      "The personal link hub aggregating all AZAKELS digital properties — Azareal.net, Azakels.net, Azamerch.store, Songwhip, and social platforms. The highest-value single QR target: one scan, every destination.",
    altText:
      "AZAKELS Linktree hub connecting to personal websites (Azareal.net, Azakels.net), merchandise store, Songwhip streaming aggregator, and all social media profiles.",
  },

  // ── SOURCE 2: Amazon ──────────────────────────────────────────────────────
  {
    num: 4,
    source: "Amazon",
    type: "Intro Synopsis",
    url: "https://www.amazon.com/gp/product/B0CKRFH8XX",
    icon: <BookOpen className="w-4 h-4" />,
    color: "amber",
    pageRole: "intro",
    synopsis:
      "Commit Poker is a Kindle publication by Azakels — a creative work that extends his brand beyond music into written form. The Amazon listing serves as both a commerce page and a credibility signal, demonstrating range across music, writing, and entrepreneurship. The ASIN B0CKRFH8XX is the verified product identifier.",
    altText:
      "Commit Poker — a Kindle book by Azakels (ASIN B0CKRFH8XX) on Amazon, showcasing the artist's creative range beyond music into published writing.",
  },
  {
    num: 5,
    source: "Amazon",
    type: "Commit Poker — Kindle Edition",
    url: "https://www.amazon.com/gp/product/B0CKRFH8XX",
    icon: <BookOpen className="w-4 h-4" />,
    color: "amber",
    pageRole: "profile",
    synopsis:
      "Direct link to Commit Poker on Amazon Kindle. Includes product description, reader reviews, and purchase / Kindle Unlimited access. A powerful QR redirect for physical events, printed merch, or press materials — take someone from paper to purchase in one scan.",
    altText:
      "Amazon Kindle product page for 'Commit Poker' by Azakels — available for purchase and Kindle Unlimited, ASIN B0CKRFH8XX.",
  },
  {
    num: 6,
    source: "Amazon",
    type: "Amazon Music — Artist Page",
    url: "https://music.amazon.com/artists/azakels",
    icon: <Music className="w-4 h-4" />,
    color: "amber",
    pageRole: "media",
    synopsis:
      "AZAKELS on Amazon Music — catalog page covering albums including Poetic Personifications (14 tracks, 51 min), singles like Dog Paradox (2026, House), and earlier works. Amazon Music is a key streaming destination for Prime subscribers, expanding reach beyond the usual Spotify/Apple audience.",
    altText:
      "Amazon Music artist page for Azakels featuring discography including 'Poetic Personifications' album and 2026 single 'Dog Paradox' from Azareal Productions.",
  },

  // ── SOURCE 3: Social / Songwhip ───────────────────────────────────────────
  {
    num: 7,
    source: "Songwhip",
    type: "Intro Synopsis",
    url: "https://songwhip.com/azakels",
    icon: <Headphones className="w-4 h-4" />,
    color: "violet",
    pageRole: "intro",
    synopsis:
      "Songwhip is a smart streaming aggregator that detects the listener's preferred platform and routes them directly — Spotify, Apple Music, Amazon Music, Tidal, and more. For AZAKELS it serves as the universal music link: one URL, every streaming service. Ideal as the primary QR music target.",
    altText:
      "Songwhip universal music link for Azakels — automatically routes fans to their preferred streaming platform including Spotify, Apple Music, Amazon Music, and Tidal.",
  },
  {
    num: 8,
    source: "Songwhip",
    type: "Songwhip — All Streaming",
    url: "https://songwhip.com/azakels",
    icon: <Headphones className="w-4 h-4" />,
    color: "violet",
    pageRole: "profile",
    synopsis:
      "The Songwhip page for AZAKELS auto-detects the visitor's device and streaming app, presenting the cleanest path from QR scan to music playback. Zero friction — no app-store redirects, no guesswork. This is the recommended music QR destination for any physical or digital placement.",
    altText:
      "Songwhip music aggregator page for Azakels linking to all major streaming platforms from one universal URL — optimized for frictionless discovery.",
  },
  {
    num: 9,
    source: "Facebook",
    type: "Facebook — Artist & Community Page",
    url: "https://www.facebook.com/azakels",
    icon: <Users className="w-4 h-4" />,
    color: "green",
    pageRole: "media",
    synopsis:
      "The AZAKELS Facebook presence — community updates, event announcements, fan engagement, and media posts. Facebook remains the broadest-reach social platform for music discovery among 25–54 demographics. A QR pointed here captures audience segments not reachable through streaming-only links.",
    altText:
      "AZAKELS official Facebook page for community engagement, event announcements, fan interaction, and music updates across the artist's full career.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Color maps
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  SoundBetter: "cyan",
  Amazon:      "amber",
  Songwhip:    "violet",
  Facebook:    "green",
};

const PAGE_ROLE_LABELS: Record<string, string> = {
  intro:   "Intro",
  profile: "Profile",
  media:   "Media / Hub",
};

const COLOR_CLASSES: Record<string, { badge: string; dot: string; border: string; text: string; bg: string }> = {
  cyan:   { badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",     dot: "bg-cyan-400",   border: "border-cyan-500/30",   text: "text-cyan-300",   bg: "bg-cyan-500/10"   },
  violet: { badge: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400", border: "border-violet-500/30", text: "text-violet-300", bg: "bg-violet-500/10" },
  amber:  { badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",   dot: "bg-amber-400",  border: "border-amber-500/30",  text: "text-amber-300",  bg: "bg-amber-500/10"  },
  green:  { badge: "bg-green-500/15 text-green-300 border-green-500/30",   dot: "bg-green-400",  border: "border-green-500/30",  text: "text-green-300",  bg: "bg-green-500/10"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Variable highlight system — click any chip to edit inline
// ─────────────────────────────────────────────────────────────────────────────
type VarColor = "cyan" | "orange" | "violet" | "green" | "amber";

interface Variable {
  key: string;
  label: string;
  value: string;
  color: VarColor;
  description: string;
}

const VAR_STYLES: Record<VarColor, string> = {
  cyan:   "bg-cyan-500/20   text-cyan-300   border-cyan-400/50   hover:bg-cyan-500/30",
  orange: "bg-orange-500/20 text-orange-300 border-orange-400/50 hover:bg-orange-500/30",
  violet: "bg-violet-500/20 text-violet-300 border-violet-400/50 hover:bg-violet-500/30",
  green:  "bg-green-500/20  text-green-300  border-green-400/50  hover:bg-green-500/30",
  amber:  "bg-amber-500/20  text-amber-300  border-amber-400/50  hover:bg-amber-500/30",
};

function Var({ varKey, vars, onEdit }: { varKey: string; vars: Variable[]; onEdit: (key: string) => void }) {
  const v = vars.find(x => x.key === varKey);
  if (!v) return null;
  return (
    <button
      onClick={() => onEdit(varKey)}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono font-semibold transition-all cursor-pointer",
        VAR_STYLES[v.color]
      )}
      title={`Edit: ${v.description}`}
    >
      {v.value}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 QR design configs — same destination, 4 visual identities
// ─────────────────────────────────────────────────────────────────────────────
interface QrConfig {
  id: string;
  label: string;
  tagline: string;
  cornerColor: string;
  whiteFill: boolean;
  whiteFillColor: string;
  highlightCorners: boolean;
  textOverlay?: { text: string; font: string; size: number; x: number; y: number; color: string };
  logoScale?: number;
  targetKey: string; // which variable key holds the target URL
}

const QR_CONFIGS: QrConfig[] = [
  {
    id: "classic",
    label: "Classic",
    tagline: "Black corners — max scan compatibility on any surface",
    cornerColor: "#000000",
    whiteFill: false,
    whiteFillColor: "#FFFFFF",
    highlightCorners: false,
    targetKey: "urlLinktree",
  },
  {
    id: "neon",
    label: "Neon Accent",
    tagline: "Cyan highlighted corners — pops on dark print or screen",
    cornerColor: "#00E5FF",
    whiteFill: false,
    whiteFillColor: "#FFFFFF",
    highlightCorners: true,
    targetKey: "urlLinktree",
  },
  {
    id: "kindle",
    label: "Commit Poker",
    tagline: "Amber corners — routes directly to Amazon Kindle listing",
    cornerColor: "#FF9900",
    whiteFill: true,
    whiteFillColor: "#FFFAF0",
    highlightCorners: true,
    targetKey: "urlKindle",
  },
  {
    id: "branded",
    label: "Branded Artist",
    tagline: "Violet + name overlay — full identity for merch or press",
    cornerColor: "#9B59B6",
    whiteFill: false,
    whiteFillColor: "#FFFFFF",
    highlightCorners: true,
    textOverlay: { text: "AZAKELS", font: "bold", size: 36, x: 50, y: 92, color: "#9B59B6" },
    targetKey: "urlSongwhip",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Demo Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [vars, setVars] = useState<Variable[]>([
    { key: "query",      label: "Search Query",     value: "AZAKELS",                                                color: "cyan",   description: "The artist name or query used to find profiles across platforms" },
    { key: "artist",     label: "Artist Name",      value: "Kelly 'Azakels' Donlin",                               color: "violet", description: "Legal artist name used in metadata and alt text generation" },
    { key: "tabs",       label: "Tabs to Open",     value: "9",                                                     color: "orange", description: "How many browser tabs open simultaneously when QR is scanned (1–9)" },
    { key: "cornerColor",label: "Corner Color",     value: "#00E5FF",                                               color: "cyan",   description: "Hex color applied to QR finder squares for visual brand identity" },
    { key: "logoScale",  label: "Logo Scale",       value: "0.2",                                                   color: "violet", description: "Logo size as a fraction of QR width — max 0.4 to preserve scannability" },
    { key: "errorLevel", label: "Error Correction", value: "H",                                                     color: "green",  description: "QR error correction level — H handles up to 30% data loss, best for logos" },
    { key: "urlLinktree",label: "Hub URL",          value: "https://linktr.ee/azakels",                            color: "cyan",   description: "Primary QR destination — the Linktree hub linking all platforms" },
    { key: "urlKindle",  label: "Book URL",         value: "https://www.amazon.com/gp/product/B0CKRFH8XX",        color: "amber",  description: "Amazon Kindle listing for Commit Poker by Azakels (ASIN B0CKRFH8XX)" },
    { key: "urlSongwhip",label: "Music URL",        value: "https://songwhip.com/azakels",                         color: "violet", description: "Songwhip universal music link — auto-routes to listener's streaming platform" },
    { key: "urlFacebook",label: "Social URL",       value: "https://www.facebook.com/azakels",                    color: "green",  description: "Facebook artist/community page for fan engagement and event updates" },
  ]);

  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [qrLoading, setQrLoading] = useState(true);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedPage, setExpandedPage] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const getVar = useCallback((key: string) => vars.find(v => v.key === key)?.value || "", [vars]);

  const generateAllQrs = useCallback(async () => {
    setQrLoading(true);
    const results: Record<string, string> = {};

    await Promise.allSettled(
      QR_CONFIGS.map(async (cfg) => {
        try {
          const targetUrl = getVar(cfg.targetKey);
          const res = await fetch("/api/qr/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              qrData: targetUrl,
              cornerColor: cfg.cornerColor,
              highlightCorners: cfg.highlightCorners,
              whiteFill: cfg.whiteFill,
              whiteFillColor: cfg.whiteFillColor,
              textOverlay: cfg.textOverlay,
              logoScale: cfg.logoScale ?? 0,
              tabsToOpen: parseInt(getVar("tabs")) || 9,
              metadataFriendly: true,
              pageTitle: `AZAKELS — ${cfg.label}`,
              pageDescription: cfg.tagline,
            }),
          });
          const data = await res.json();
          if (data.qrImageBase64) results[cfg.id] = data.qrImageBase64;
        } catch {}
      })
    );

    setQrImages(results);
    setQrLoading(false);
  }, [getVar]);

  useEffect(() => { generateAllQrs(); }, []);

  const openAllPages = () => {
    NINE_PAGES.forEach((p, i) => setTimeout(() => window.open(p.url, "_blank"), i * 200));
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const startEdit = (key: string) => {
    const v = vars.find(x => x.key === key);
    if (v) { setEditingVar(key); setEditValue(v.value); }
  };

  const commitEdit = () => {
    if (!editingVar) return;
    setVars(prev => prev.map(v => v.key === editingVar ? { ...v, value: editValue } : v));
    setEditingVar(null);
  };

  const V = ({ k }: { k: string }) => <Var varKey={k} vars={vars} onEdit={startEdit} />;

  // Group pages by source for the 3×3 display
  const sources = ["SoundBetter", "Amazon", "Songwhip", "Facebook"];
  const uniqueSources = Array.from(new Set(NINE_PAGES.map(p => p.source)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%]  w-[45%] h-[45%] rounded-full bg-cyan-500/4   blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[45%] h-[45%] rounded-full bg-violet-500/4 blur-[120px]" />
        <div className="absolute top-[40%] right-[10%]  w-[30%] h-[30%] rounded-full bg-amber-500/3  blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 space-y-20">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono">
            <Cpu className="w-3 h-3" /> ACB Dynamic QR Studio · Productivity Demo
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Algebraic Codex Build
            <br />
            <span className="text-primary">9-Page Output Engine</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            One search. Three sources. Nine structured pages — each with SEO-ready metadata, alt text, and a unique QR code variant. Built for <span className="text-white font-semibold">artists, authors, and brands</span> who need every platform covered, instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button onClick={openAllPages} className="gap-2">
              <ExternalLink className="w-4 h-4" /> Open All 9 Pages
            </Button>
            <Button variant="outline" onClick={generateAllQrs} disabled={qrLoading} className="gap-2">
              <RefreshCw className={cn("w-4 h-4", qrLoading && "animate-spin")} />
              {qrLoading ? "Generating QRs…" : "Regenerate QR Variants"}
            </Button>
          </div>
        </motion.section>

        {/* ── VARIABLE EDITOR MODAL ─────────────────────────────────────────── */}
        {editingVar && (() => {
          const v = vars.find(x => x.key === editingVar)!;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md" onClick={commitEdit}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <p className="text-xs text-muted-foreground font-mono mb-0.5">Editing variable</p>
                <p className="text-base font-bold text-white mb-1">{v.label}</p>
                <p className="text-sm text-muted-foreground mb-4">{v.description}</p>
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingVar(null); }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" onClick={commitEdit}>Apply Change</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setEditingVar(null)}>Cancel</Button>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* ── INTERACTIVE VARIABLES ────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white mb-1">Interactive Variables</h2>
            <p className="text-muted-foreground text-sm">Every highlighted token is a live variable. <span className="text-white font-medium">Click any chip to edit it</span> — changes apply across the whole demo instantly.</p>
          </div>

          {/* Natural-language description with embedded variable chips */}
          <Card className="bg-card/50 border-border/50 mb-4">
            <CardContent className="p-6 space-y-4 text-sm leading-loose text-muted-foreground">
              <p>
                Search for <V k="query" /> · legal name <V k="artist" /> · opens <V k="tabs" /> tabs on scan.
              </p>
              <p>
                QR corner color: <V k="cornerColor" /> · logo scale: <V k="logoScale" /> · error correction: <V k="errorLevel" /> (allows logo overlap without data loss).
              </p>
              <p>
                Hub target: <V k="urlLinktree" /><br />
                Book target: <V k="urlKindle" /><br />
                Music target: <V k="urlSongwhip" /><br />
                Social target: <V k="urlFacebook" />
              </p>
            </CardContent>
          </Card>

          {/* Chip legend */}
          <div className="flex flex-wrap gap-2">
            {vars.map(v => (
              <button key={v.key} onClick={() => startEdit(v.key)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all", VAR_STYLES[v.color])}>
                <span className="opacity-50 text-[10px]">{v.label}:</span>
                <span className="font-bold truncate max-w-[160px]">{v.value}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── 4 QR VARIANTS ───────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">4 QR Design Variants</h2>
            <p className="text-sm text-muted-foreground">
              Different visual structures — three target the same hub, one routes directly to the Kindle listing for <strong className="text-white">Commit Poker</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QR_CONFIGS.map((cfg, i) => {
              const targetUrl = getVar(cfg.targetKey);
              return (
                <motion.div key={cfg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
                  <Card className="bg-card/60 border-border/50 overflow-hidden hover:border-primary/30 transition-colors group h-full flex flex-col">
                    <CardContent className="p-4 space-y-3 flex flex-col flex-1">
                      {/* QR image */}
                      <div className="aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
                        {qrLoading || !qrImages[cfg.id] ? (
                          <div className="flex flex-col items-center gap-2">
                            <QrCode className="w-10 h-10 text-gray-300 animate-pulse" />
                            <span className="text-[10px] text-gray-400">Rendering…</span>
                          </div>
                        ) : (
                          <img
                            src={`data:image/png;base64,${qrImages[cfg.id]}`}
                            alt={`${cfg.label} QR code for ${getVar("query")}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{cfg.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{cfg.tagline}</p>
                      </div>

                      {/* Corner color + target */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="w-3.5 h-3.5 rounded-sm border border-white/20 shrink-0" style={{ backgroundColor: cfg.cornerColor }} />
                          <code className="font-mono">{cfg.cornerColor}</code>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">{targetUrl}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {cfg.highlightCorners && <Badge variant="outline" className="text-[9px] border-primary/30 text-primary px-1.5 py-0">Corners</Badge>}
                        {cfg.whiteFill        && <Badge variant="outline" className="text-[9px] border-amber-400/30 text-amber-300 px-1.5 py-0">Fill</Badge>}
                        {cfg.textOverlay      && <Badge variant="outline" className="text-[9px] border-violet-400/30 text-violet-300 px-1.5 py-0">Text</Badge>}
                      </div>

                      {/* Download */}
                      {qrImages[cfg.id] && (
                        <a
                          href={`data:image/png;base64,${qrImages[cfg.id]}`}
                          download={`azakels-qr-${cfg.id}.png`}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-white hover:border-border transition-colors"
                        >
                          <Download className="w-3 h-3" /> Download PNG
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Formula bar */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
            {["4 QR variants", "→", "3 destinations", "→", `opens ${getVar("tabs")} tabs`, "→", "9 pages covered"].map((t, i) => (
              <span key={i} className={t === "→" ? "opacity-30" : t.includes("9") ? "text-white" : ""}>{t}</span>
            ))}
          </div>
        </motion.section>

        {/* ── 9-PAGE MATRIX ───────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">9-Page Target Matrix</h2>
            <p className="text-sm text-muted-foreground">
              3 sources × 3 pages each = 9 total · Query: <V k="query" />
            </p>
          </div>

          {/* Source legend */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {uniqueSources.map(src => {
              const color = SOURCE_COLORS[src] || "cyan";
              const c = COLOR_CLASSES[color];
              return (
                <div key={src} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium", c.badge, c.border)}>
                  <span className={cn("w-2 h-2 rounded-full", c.dot)} />
                  {src}
                </div>
              );
            })}
          </div>

          {/* Grouped by source — 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uniqueSources.map(src => {
              const pages = NINE_PAGES.filter(p => p.source === src);
              const color = SOURCE_COLORS[src] || "cyan";
              const c = COLOR_CLASSES[color];
              return (
                <div key={src} className={cn("rounded-2xl border p-4 space-y-3", c.border, c.bg)}>
                  <p className={cn("text-xs font-bold uppercase tracking-widest mb-3", c.text)}>{src}</p>
                  {pages.map(page => {
                    const isExpanded = expandedPage === page.num;
                    return (
                      <div key={page.num} className={cn("rounded-xl border overflow-hidden bg-background/40 transition-colors", isExpanded ? "border-border/60" : "border-transparent hover:border-border/30")}>
                        <button className="w-full text-left px-3.5 py-3 flex items-start gap-3" onClick={() => setExpandedPage(isExpanded ? null : page.num)}>
                          <span className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0 mt-0.5", c.bg, c.border, c.text)}>
                            {page.num}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight">{page.type}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 border shrink-0", c.badge, c.border, c.text)}>
                                {PAGE_ROLE_LABELS[page.pageRole]}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 transition-transform", isExpanded && "rotate-90")} />
                        </button>

                        {isExpanded && (
                          <div className="px-3.5 pb-4 space-y-3 border-t border-border/20 pt-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">{page.synopsis}</p>
                            <div className="rounded-lg bg-background/60 border border-border/30 p-2.5">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Alt Text
                              </p>
                              <p className="text-[11px] text-muted-foreground italic leading-relaxed">"{page.altText}"</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <a href={page.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors">
                                <ExternalLink className="w-2.5 h-2.5" /> Open
                              </a>
                              <button onClick={() => copyText(page.url, `url-${page.num}`)}
                                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors">
                                {copied === `url-${page.num}` ? "Copied!" : "Copy URL"}
                              </button>
                              <button onClick={() => copyText(page.altText, `alt-${page.num}`)}
                                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors">
                                {copied === `alt-${page.num}` ? "Copied!" : "Copy Alt Text"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Numbered master list — always visible */}
          <div className="mt-8 rounded-2xl border border-border/40 bg-card/30 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border/30 flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-white">All 9 Pages — Master List</span>
            </div>
            <div className="divide-y divide-border/20">
              {NINE_PAGES.map(page => {
                const color = SOURCE_COLORS[page.source] || "cyan";
                const c = COLOR_CLASSES[color];
                return (
                  <div key={page.num} className="px-5 py-3 flex items-center gap-4 hover:bg-white/2 transition-colors">
                    <span className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0", c.bg, c.border, c.text)}>{page.num}</span>
                    <span className={cn("text-[11px] font-medium shrink-0 w-20", c.text)}>{page.source}</span>
                    <span className="text-xs text-white font-medium flex-1 truncate">{page.type}</span>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 border shrink-0", c.badge, c.border, c.text)}>
                      {PAGE_ROLE_LABELS[page.pageRole]}
                    </Badge>
                    <a href={page.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── OUTPUT SPEC CARD ─────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-gradient-to-br from-primary/8 to-violet-500/8 border border-primary/20">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">What Every Page Delivers</h3>
                  <p className="text-sm text-muted-foreground">Per-page output spec — applies to all 9 entries</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "Verified URL",         desc: "Direct link to exact page — profile or media wall",              color: "cyan"   },
                  { label: "Title / Heading",       desc: "Site-derived title used as page heading and OG tag",             color: "cyan"   },
                  { label: "Paraphrased Synopsis",  desc: "Human-readable content summary for description pages",           color: "violet" },
                  { label: "SEO Alt Text",          desc: "Accessibility-ready description used in QR metadata embedding",  color: "violet" },
                  { label: "Native Logo / Colors",  desc: "Favicon and branding extracted from source site — not generic", color: "amber"  },
                  { label: "2 URL Variants",        desc: "Profile URL + Media/Wall URL per source platform",               color: "amber"  },
                  { label: "QR per Page",           desc: "Generate a QR directly from any page row — opens in tabs",      color: "green"  },
                  { label: "Traffic Tracking",      desc: "Optional scan count and referrer logging per session",           color: "green"  },
                  { label: "4 Design Variants",     desc: "Classic, Neon, Branded, Filled — one identity per use case",    color: "cyan"   },
                ].map(item => {
                  const c = COLOR_CLASSES[item.color as keyof typeof COLOR_CLASSES];
                  return (
                    <div key={item.label} className={cn("flex items-start gap-3 rounded-xl border p-3.5", c.bg, c.border)}>
                      <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", c.dot)} />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>

      </div>
    </div>
  );
}
