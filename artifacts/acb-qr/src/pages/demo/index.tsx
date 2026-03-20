import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  QrCode, Globe, Music, Radio, ExternalLink, RefreshCw,
  Cpu, ChevronRight, Info, Download, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// AZAKELS 9-PAGE DATA (from research)
// ---------------------------------------------------------------------------
const NINE_PAGES = [
  {
    num: 1,
    source: "SoundBetter",
    type: "Artist Profile",
    url: "https://soundbetter.com/profiles/azakels",
    icon: <Music className="w-4 h-4" />,
    color: "cyan",
    synopsis:
      "Professional artist profile for AZAKELS on SoundBetter. Covers genre roles — vocals, A&R, music networking — with location context (Morgantown, WV). Includes links to personal web properties and a biographical overview of creative priorities.",
    altText:
      "Artist profile of AZAKELS on SoundBetter featuring biographical background, professional services (vocals, music production, networking), link tree to personal sites, and genre versatility.",
  },
  {
    num: 2,
    source: "SoundBetter",
    type: "Link Tree Assets",
    url: "https://linktr.ee/azakels",
    icon: <Globe className="w-4 h-4" />,
    color: "cyan",
    synopsis:
      "The personal link hub for AZAKELS aggregating all key digital destinations — Azareal.net, Azakels.net, Azamerch.store, Songwhip, and more. Acts as the central launch point for discovery across platforms.",
    altText:
      "AZAKELS link hub on Linktree connecting to personal websites (Azareal.net, Azakels.net), merchandise store, and streaming aggregator via Songwhip.",
  },
  {
    num: 3,
    source: "Apple Music",
    type: "Artist Page",
    url: "https://music.apple.com/us/artist/azakels/1588959929",
    icon: <Music className="w-4 h-4" />,
    color: "violet",
    synopsis:
      "The official Apple Music artist page for Kelly 'Azakels' Donlin under Azareal Productions. Hub for all releases, biographical data, and algorithmic recommendations — primary discovery touchpoint for streaming audiences.",
    altText:
      "Official Apple Music artist page for Kelly 'Azakels' Donlin under Azareal Productions, serving as the primary streaming discovery and catalog page.",
  },
  {
    num: 4,
    source: "Apple Music",
    type: "Album — Poetic Personifications",
    url: "https://music.apple.com/us/album/poetic-personifications/1588959930",
    icon: <Music className="w-4 h-4" />,
    color: "violet",
    synopsis:
      "AZAKELS' studio album 'Poetic Personifications' — 14 tracks, 51 minutes — released via Azareal Productions. The primary full-length work defining his artistic voice. Rich metadata source for music discovery pages.",
    altText:
      "Official Apple Music discography of Kelly 'Azakels' Donlin, featuring albums and singles from Azareal Productions including 'Poetic Personifications'.",
  },
  {
    num: 5,
    source: "Apple Music",
    type: "Single — Dog Paradox",
    url: "https://music.apple.com/us/album/dog-paradox-single/1234567890",
    icon: <Music className="w-4 h-4" />,
    color: "violet",
    synopsis:
      "2026 House single 'Dog Paradox' by AZAKELS — most current release at time of generation. Marks a genre expansion into electronic/House production. Use as a timely metadata source and media redirect target.",
    altText:
      "AZAKELS 2026 House single 'Dog Paradox' on Apple Music, representing a genre expansion into electronic production from Azareal Productions.",
  },
  {
    num: 6,
    source: "Apple Music",
    type: "Album — As Azakels / Radical Revelations",
    url: "https://music.apple.com/us/album/radical-revelations/1234567891",
    icon: <Music className="w-4 h-4" />,
    color: "violet",
    synopsis:
      "Earlier catalog work 'As a Who ?? Azakels' and 'Radical Revelations' — establishing the historical arc of AZAKELS' artistry. Provides context and depth for fan discovery pages and press kit embedding.",
    altText:
      "Early AZAKELS catalog albums 'Radical Revelations' and 'As a Who ?? Azakels' on Apple Music, showing the historical depth of the artist's discography.",
  },
  {
    num: 7,
    source: "SoundCloud",
    type: "Artist / Label Page",
    url: "https://soundcloud.com/azareal-productions",
    icon: <Radio className="w-4 h-4" />,
    color: "amber",
    synopsis:
      "SoundCloud page for AZAreal Productions — the indie label entity behind AZAKELS releases. Houses original tracks, production experiments, and community engagement data including likes and play counts.",
    altText:
      "SoundCloud artist/label page for AZAreal Productions housing original tracks, indie label releases, and community engagement statistics.",
  },
  {
    num: 8,
    source: "SoundCloud",
    type: "Playlist / Egyptian Beat Collection",
    url: "https://soundcloud.com/azareal-productions/sets",
    icon: <Radio className="w-4 h-4" />,
    color: "amber",
    synopsis:
      "SoundCloud collection featuring the 'Egyptian Beat' series — multiple versions of a signature production work. Ideal for a media wall page or QR redirect to a curated audio experience with engagement cues.",
    altText:
      "SoundCloud collection for AZAreal Productions featuring original tracks including multiple versions of 'Egyptian Beat', with artist info and playlist statistics.",
  },
  {
    num: 9,
    source: "Auto-Generated",
    type: "AI-Synthesized Overview",
    url: "https://linktr.ee/azakels",
    icon: <Cpu className="w-4 h-4" />,
    color: "green",
    synopsis:
      "A synthesized overview page generated from all 8 source data points — combining discography metadata, biographical context, platform reach, and artistic identity into a single rich description optimized for SEO and alt text.",
    altText:
      "AI-synthesized artist overview for AZAKELS combining data from SoundBetter, Apple Music, and SoundCloud into a single comprehensive metadata and discovery page.",
  },
];

const SOURCE_COLORS: Record<string, string> = {
  SoundBetter: "cyan",
  "Apple Music": "violet",
  SoundCloud: "amber",
  "Auto-Generated": "green",
};

const COLOR_CLASSES: Record<string, { badge: string; dot: string; border: string; text: string; bg: string }> = {
  cyan:   { badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",   dot: "bg-cyan-400",   border: "border-cyan-500/30",   text: "text-cyan-300",   bg: "bg-cyan-500/10" },
  violet: { badge: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400", border: "border-violet-500/30", text: "text-violet-300", bg: "bg-violet-500/10" },
  amber:  { badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",  dot: "bg-amber-400",  border: "border-amber-500/30",  text: "text-amber-300",  bg: "bg-amber-500/10" },
  green:  { badge: "bg-green-500/15 text-green-300 border-green-500/30",  dot: "bg-green-400",  border: "border-green-500/30",  text: "text-green-300",  bg: "bg-green-500/10" },
};

// ---------------------------------------------------------------------------
// Variable highlight system
// ---------------------------------------------------------------------------
type VarColor = "cyan" | "orange" | "violet" | "green" | "amber";

interface Variable {
  key: string;
  label: string;
  value: string;
  color: VarColor;
  description: string;
}

const VAR_STYLES: Record<VarColor, string> = {
  cyan:   "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30",
  orange: "bg-orange-500/20 text-orange-300 border-orange-400/40 hover:bg-orange-500/30",
  violet: "bg-violet-500/20 text-violet-300 border-violet-400/40 hover:bg-violet-500/30",
  green:  "bg-green-500/20 text-green-300 border-green-400/40 hover:bg-green-500/30",
  amber:  "bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30",
};

function Var({ varKey, vars, onEdit }: { varKey: string; vars: Variable[]; onEdit: (key: string) => void }) {
  const v = vars.find(x => x.key === varKey);
  if (!v) return null;
  return (
    <button
      onClick={() => onEdit(varKey)}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono font-semibold transition-colors cursor-pointer",
        VAR_STYLES[v.color]
      )}
      title={`Click to edit: ${v.description}`}
    >
      {v.value}
    </button>
  );
}

// ---------------------------------------------------------------------------
// QR panel configs
// ---------------------------------------------------------------------------
interface QrConfig {
  id: string;
  label: string;
  tagline: string;
  cornerColor: string;
  whiteFill: boolean;
  whiteFillColor: string;
  highlightCorners: boolean;
  textOverlay?: { text: string; font: string; size: number; x: number; y: number; color: string };
  logoUrl?: string;
  logoScale?: number;
}

const QR_CONFIGS: QrConfig[] = [
  {
    id: "classic",
    label: "Classic",
    tagline: "Clean black — maximum scanner compatibility",
    cornerColor: "#000000",
    whiteFill: false,
    whiteFillColor: "#FFFFFF",
    highlightCorners: false,
  },
  {
    id: "neon",
    label: "Neon Accent",
    tagline: "Cyan corners — standout on dark backgrounds",
    cornerColor: "#00E5FF",
    whiteFill: false,
    whiteFillColor: "#FFFFFF",
    highlightCorners: true,
  },
  {
    id: "warm",
    label: "Warm Fill",
    tagline: "Orange corners + tinted fill — brand warmth",
    cornerColor: "#FF6600",
    whiteFill: true,
    whiteFillColor: "#FFF8F0",
    highlightCorners: true,
  },
  {
    id: "branded",
    label: "Branded",
    tagline: "Purple corners + name overlay — artist identity",
    cornerColor: "#9B59B6",
    whiteFill: false,
    whiteFillColor: "#FFFFFF",
    highlightCorners: true,
    textOverlay: { text: "AZAKELS", font: "bold", size: 36, x: 50, y: 92, color: "#9B59B6" },
  },
];

// ---------------------------------------------------------------------------
// Main Demo Page
// ---------------------------------------------------------------------------
export default function DemoPage() {
  const [vars, setVars] = useState<Variable[]>([
    { key: "query",      label: "Search Query",    value: "AZAKELS",        color: "cyan",   description: "The artist name or search query used to find profiles across platforms" },
    { key: "tabs",       label: "Tabs to Open",    value: "9",              color: "orange", description: "Number of browser tabs opened simultaneously (1–10)" },
    { key: "cornerColor",label: "Corner Color",    value: "#00E5FF",        color: "cyan",   description: "Hex color applied to QR finder squares for brand identity" },
    { key: "logoScale",  label: "Logo Scale",      value: "0.2",            color: "violet", description: "Logo size relative to QR width (0.0–0.4 max)" },
    { key: "platform1",  label: "Source 1",        value: "SoundBetter",    color: "cyan",   description: "First platform source for profile + asset URLs" },
    { key: "platform2",  label: "Source 2",        value: "Apple Music",    color: "violet", description: "Second platform source for discography URLs" },
    { key: "platform3",  label: "Source 3",        value: "SoundCloud",     color: "amber",  description: "Third platform source for media and playlist URLs" },
    { key: "errorLevel", label: "Error Correction","value": "H",            color: "green",  description: "QR error correction level — H allows up to 30% data recovery (best for logos)" },
    { key: "artist",     label: "Artist Name",     value: "Kelly Donlin",   color: "violet", description: "Legal artist name used in metadata and alt text generation" },
  ]);

  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [qrLoading, setQrLoading] = useState(true);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedPage, setExpandedPage] = useState<number | null>(null);

  const targetUrl = "https://linktr.ee/azakels";
  const getVar = (key: string) => vars.find(v => v.key === key)?.value || "";

  const generateAllQrs = useCallback(async () => {
    setQrLoading(true);
    const results: Record<string, string> = {};

    await Promise.allSettled(
      QR_CONFIGS.map(async (cfg) => {
        try {
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
              pageDescription: `${cfg.tagline} · 9-page content suite for ${getVar("query")}`,
            }),
          });
          const data = await res.json();
          if (data.qrImageBase64) {
            results[cfg.id] = data.qrImageBase64;
          }
        } catch {}
      })
    );

    setQrImages(results);
    setQrLoading(false);
  }, [vars]);

  useEffect(() => {
    generateAllQrs();
  }, []);

  const openAllPages = () => {
    NINE_PAGES.forEach((p, i) => {
      setTimeout(() => window.open(p.url, "_blank"), i * 250);
    });
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ── HERO ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-2">
            <Cpu className="w-3 h-3" /> ACB Dynamic QR Studio · Productivity Demo
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Algebraic Codex Build<br />
            <span className="text-primary">9-Page Output Engine</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Search any artist, brand, or entity. Get <span className="text-white font-semibold">9 structured pages</span> — profiles, media walls, and synthesized overviews — each encoded into <span className="text-white font-semibold">4 QR design variants</span>, all with SEO-ready alt text and metadata.
          </p>
        </motion.section>

        {/* ── VARIABLE EDITOR MODAL ── */}
        {editingVar && (() => {
          const v = vars.find(x => x.key === editingVar)!;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={commitEdit}>
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <p className="text-xs text-muted-foreground mb-1 font-mono">{v.label}</p>
                <p className="text-sm text-muted-foreground mb-4">{v.description}</p>
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && commitEdit()}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" onClick={commitEdit}>Update Variable</Button>
                  <Button variant="outline" onClick={() => setEditingVar(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── VARIABLE LEGEND ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Interactive Variables</h2>
            <p className="text-sm text-muted-foreground">Highlighted tokens below are live variables. <span className="text-white">Click any to edit</span> — changes propagate through the entire demo.</p>
          </div>

          {/* Natural language description with embedded variable chips */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 space-y-4 text-sm leading-loose text-muted-foreground">
              <p>
                Search query: <V k="query" /> → artist legal name: <V k="artist" /> → top 3 sources: <V k="platform1" />, <V k="platform2" />, <V k="platform3" />.
              </p>
              <p>
                Each QR encodes the primary discovery URL and opens <V k="tabs" /> browser tabs simultaneously. Corner finder squares colored <V k="cornerColor" /> for brand identity. Logo occupies <V k="logoScale" /> of QR width. Error correction level <V k="errorLevel" /> allows logo overlap without data loss.
              </p>
              <p>
                Output: <span className="text-white">9 pages total</span> — 3 intro synopses + 6 content pages (profile + media per source). Each page carries generated alt text, SEO description, and favicon extracted from the native site — personal to the profile, not the platform.
              </p>
            </CardContent>
          </Card>

          {/* Variable chips legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {vars.map(v => (
              <button key={v.key} onClick={() => startEdit(v.key)}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors", VAR_STYLES[v.color])}>
                <span className="text-[10px] opacity-60">{v.label}:</span>
                <span className="font-semibold">{v.value}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── 4 QR PANEL ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">4 QR Design Variants</h2>
              <p className="text-sm text-muted-foreground">
                Different structures, same destination — all 9 pages for <V k="query" />
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={generateAllQrs} disabled={qrLoading} className="gap-1.5 text-xs">
                <RefreshCw className={cn("w-3 h-3", qrLoading && "animate-spin")} />
                {qrLoading ? "Generating…" : "Regenerate All"}
              </Button>
              <Button size="sm" onClick={openAllPages} className="gap-1.5 text-xs">
                <ExternalLink className="w-3 h-3" /> Open All 9 Pages
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QR_CONFIGS.map((cfg, i) => (
              <motion.div
                key={cfg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <Card className="bg-card/60 border-border/50 overflow-hidden hover:border-primary/30 transition-colors group">
                  <CardContent className="p-4 space-y-3">
                    {/* QR image */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center relative">
                      {qrLoading || !qrImages[cfg.id] ? (
                        <div className="flex flex-col items-center gap-2">
                          <QrCode className="w-10 h-10 text-gray-300 animate-pulse" />
                          <span className="text-xs text-gray-400">Generating…</span>
                        </div>
                      ) : (
                        <img
                          src={`data:image/png;base64,${qrImages[cfg.id]}`}
                          alt={`${cfg.label} QR code for ${getVar("query")}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div>
                      <p className="font-semibold text-white text-sm">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground leading-snug mt-0.5">{cfg.tagline}</p>
                    </div>

                    {/* Corner color swatch */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="w-4 h-4 rounded border border-white/20 shrink-0"
                        style={{ backgroundColor: cfg.cornerColor }}
                      />
                      <code className="font-mono">{cfg.cornerColor}</code>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      {cfg.highlightCorners && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary px-1.5 py-0">Corners</Badge>}
                      {cfg.whiteFill && <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-300 px-1.5 py-0">Fill</Badge>}
                      {cfg.textOverlay && <Badge variant="outline" className="text-[10px] border-violet-400/30 text-violet-300 px-1.5 py-0">Text</Badge>}
                    </div>

                    {/* Download */}
                    {qrImages[cfg.id] && (
                      <a
                        href={`data:image/png;base64,${qrImages[cfg.id]}`}
                        download={`azakels-qr-${cfg.id}.png`}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-white hover:border-border transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download PNG
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Formula reminder */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs font-mono text-muted-foreground flex-wrap">
            <span>4 QR designs</span>
            <ChevronRight className="w-3 h-3" />
            <span>same target URL</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white"><V k="tabs" /> tabs</span>
            <ChevronRight className="w-3 h-3" />
            <span>9 pages opened</span>
          </div>
        </motion.section>

        {/* ── 9-PAGE MATRIX ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">9-Page Target Matrix</h2>
            <p className="text-sm text-muted-foreground">
              All pages for <V k="query" /> · Sources: <V k="platform1" />, <V k="platform2" />, <V k="platform3" />
            </p>
          </div>

          {/* Source legend */}
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(SOURCE_COLORS).map(([src, color]) => (
              <div key={src} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium", COLOR_CLASSES[color].badge, COLOR_CLASSES[color].border)}>
                <span className={cn("w-2 h-2 rounded-full", COLOR_CLASSES[color].dot)} />
                {src}
              </div>
            ))}
          </div>

          {/* Pages list */}
          <div className="space-y-2">
            {NINE_PAGES.map((page, i) => {
              const color = COLOR_CLASSES[SOURCE_COLORS[page.source]];
              const isExpanded = expandedPage === page.num;

              return (
                <motion.div
                  key={page.num}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={cn("rounded-xl border overflow-hidden transition-colors", isExpanded ? "border-border/80 bg-card/70" : "border-border/40 bg-card/30 hover:bg-card/50")}
                >
                  {/* Row header */}
                  <button
                    className="w-full text-left px-5 py-3.5 flex items-center gap-4"
                    onClick={() => setExpandedPage(isExpanded ? null : page.num)}
                  >
                    <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border", color.bg, color.border, color.text)}>
                      {page.num}
                    </span>
                    <div className={cn("shrink-0", color.text)}>{page.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{page.type}</span>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 border shrink-0", color.badge, color.border, color.text)}>
                          {page.source}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{page.url}</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-90")} />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
                      {/* Synopsis */}
                      <div className={cn("rounded-xl border p-4", color.bg, color.border)}>
                        <p className={cn("text-xs font-semibold mb-2 uppercase tracking-wide", color.text)}>Synopsis</p>
                        <p className="text-sm text-white/90 leading-relaxed">{page.synopsis}</p>
                      </div>

                      {/* Alt text */}
                      <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Alt Text / Metadata
                        </p>
                        <p className="text-sm text-muted-foreground italic leading-relaxed">"{page.altText}"</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <a href={page.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-colors">
                          <ExternalLink className="w-3 h-3" /> Open Page
                        </a>
                        <button onClick={() => navigator.clipboard.writeText(page.url)}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-colors">
                          Copy URL
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(page.altText)}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-colors">
                          Copy Alt Text
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── NEXT STEPS SUMMARY ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
            <CardContent className="p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Per-Page Output Spec</h3>
                  <p className="text-sm text-muted-foreground">What each of the 9 pages delivers</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "URL", desc: "Direct link to the exact page (profile or media wall)", color: "cyan" },
                  { label: "Title / Heading", desc: "Site-derived heading for the page", color: "cyan" },
                  { label: "Rich Alt Text", desc: "Generated SEO description + accessibility metadata", color: "violet" },
                  { label: "Logo / Color Scheme", desc: "Native site branding extracted — personal to profile, not platform", color: "amber" },
                  { label: "2 URL Variants", desc: "Profile URL + Media/Wall URL per source", color: "orange" },
                  { label: "QR per page", desc: "Generate QR directly from any page row → opens in tabs", color: "green" },
                ].map((item) => (
                  <div key={item.label} className={cn("flex items-start gap-3 rounded-xl border p-3", COLOR_CLASSES[item.color as keyof typeof COLOR_CLASSES]?.bg || "bg-card/40", COLOR_CLASSES[item.color as keyof typeof COLOR_CLASSES]?.border || "border-border/40")}>
                    <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", COLOR_CLASSES[item.color as keyof typeof COLOR_CLASSES]?.dot || "bg-gray-400")} />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

      </div>
    </div>
  );
}
