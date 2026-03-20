import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe, User, Image as ImageIcon, FileText,
  ExternalLink, Copy, QrCode, ChevronRight, Loader2,
  BookOpen, Film, Hash, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContentPage {
  pageNumber: number;
  type: "intro" | "profile" | "media";
  platform: string;
  title: string;
  url: string;
  synopsis: string;
  altText: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  searchSnippet: string;
}

interface BuildPagesResponse {
  query: string;
  totalPages: number;
  sitesFound: number;
  pages: ContentPage[];
}

interface NinePageBuilderProps {
  onPagesReady?: (pages: ContentPage[]) => void;
  onGenerateQrForUrl?: (url: string, title: string, altText: string) => void;
}

const PAGE_TYPE_CONFIG = {
  intro: {
    icon: <BookOpen className="w-4 h-4" />,
    label: "Synopsis",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    badgeClass: "border-violet-400/30 text-violet-300",
  },
  profile: {
    icon: <User className="w-4 h-4" />,
    label: "Profile",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    badgeClass: "border-cyan-400/30 text-cyan-300",
  },
  media: {
    icon: <Film className="w-4 h-4" />,
    label: "Media Wall",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    badgeClass: "border-amber-400/30 text-amber-300",
  },
} as const;

export function NinePageBuilder({ onPagesReady, onGenerateQrForUrl }: NinePageBuilderProps) {
  const [query, setQuery] = useState("AZAKELS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuildPagesResponse | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedPage, setExpandedPage] = useState<number | null>(null);

  const handleBuild = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/search/build-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to build pages");
        return;
      }
      setResult(data);
      onPagesReady?.(data.pages);
    } catch (err) {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const openAll = () => {
    result?.pages.forEach((p, i) => {
      setTimeout(() => window.open(p.url, "_blank"), i * 300);
    });
  };

  // Group pages into [intro, profile, media] triads
  const triads: ContentPage[][] = [];
  if (result) {
    for (let i = 0; i < result.pages.length; i += 3) {
      triads.push(result.pages.slice(i, i + 3));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">9-Page Content Builder</h2>
        <p className="text-muted-foreground text-sm">
          Search → Top 3 sites → 2 URLs each + synopsis intro = <span className="text-primary font-mono">9 pages</span>
        </p>
      </div>

      {/* Formula explainer */}
      <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
        {[
          { label: "3 Sites", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
          { label: "×", color: "text-muted-foreground" },
          { label: "2 URLs", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
          { label: "=", color: "text-muted-foreground" },
          { label: "6 pages", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
          { label: "+", color: "text-muted-foreground" },
          { label: "3 intros", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
          { label: "=", color: "text-muted-foreground" },
          { label: "9 TOTAL", color: "bg-primary/20 text-primary border-primary/30 font-bold" },
        ].map((item, i) => (
          item.label === "×" || item.label === "=" || item.label === "+" ? (
            <span key={i} className={item.color}>{item.label}</span>
          ) : (
            <span key={i} className={cn("px-2 py-1 rounded border", item.color)}>{item.label}</span>
          )
        ))}
      </div>

      {/* Search input */}
      <Card className="bg-card/60 border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuild()}
                placeholder="Enter name or search query…"
                className="pl-9 bg-background/50"
              />
            </div>
            <Button
              onClick={handleBuild}
              disabled={loading || !query.trim()}
              className="gap-2 min-w-[140px]"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
              ) : (
                <><Hash className="w-4 h-4" /> Build 9 Pages</>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">
                  "{result.query}"
                </span>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {result.sitesFound} sites · {result.totalPages} pages
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={openAll} className="gap-1 text-xs">
                  <ExternalLink className="w-3 h-3" /> Open All Tabs
                </Button>
              </div>
            </div>

            {/* Triads — [intro, profile, media] per site */}
            {triads.map((triad, triadIndex) => (
              <motion.div
                key={triadIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: triadIndex * 0.08 }}
                className="rounded-xl border border-border/40 bg-card/40 overflow-hidden"
              >
                {/* Site header */}
                <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3 bg-card/60">
                  {triad[0]?.faviconUrl ? (
                    <img
                      src={triad[0].faviconUrl}
                      alt={`${triad[0].platform} icon`}
                      className="w-5 h-5 rounded object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-white text-sm">{triad[0]?.platform}</span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    Site {triadIndex + 1} of {triads.length}
                  </span>
                </div>

                {/* Pages */}
                <div className="divide-y divide-border/20">
                  {triad.map((page) => {
                    const cfg = PAGE_TYPE_CONFIG[page.type];
                    const isExpanded = expandedPage === page.pageNumber;

                    return (
                      <div key={page.pageNumber} className={cn("transition-colors", isExpanded ? "bg-card/60" : "hover:bg-card/30")}>
                        {/* Row */}
                        <button
                          className="w-full text-left px-4 py-3 flex items-start gap-3"
                          onClick={() => setExpandedPage(isExpanded ? null : page.pageNumber)}
                        >
                          <span className="text-xs font-mono text-muted-foreground w-4 mt-0.5">
                            {page.pageNumber}
                          </span>
                          <span className={cn("mt-0.5 shrink-0", cfg.color)}>{cfg.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white truncate">{page.title}</span>
                              <Badge variant="outline" className={cn("text-xs shrink-0", cfg.badgeClass)}>
                                {cfg.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{page.url}</p>
                          </div>
                          <ChevronRight className={cn("w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform", isExpanded && "rotate-90")} />
                        </button>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-3 ml-7">
                                {/* OG image */}
                                {page.ogImageUrl && (
                                  <img
                                    src={page.ogImageUrl}
                                    alt={page.altText}
                                    className="w-full max-h-32 object-cover rounded-lg border border-border/30"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                )}

                                {/* Synopsis */}
                                <div className={cn("rounded-lg border p-3 text-xs", cfg.bg)}>
                                  <p className="font-medium text-white/80 mb-1">Synopsis</p>
                                  <p className="text-muted-foreground leading-relaxed">{page.synopsis}</p>
                                </div>

                                {/* Alt text */}
                                <div className="rounded-lg border border-border/30 bg-background/40 p-3 text-xs">
                                  <p className="font-medium text-white/80 mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Alt Text
                                  </p>
                                  <p className="text-muted-foreground leading-relaxed italic">"{page.altText}"</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                  <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Open
                                  </a>
                                  <button
                                    onClick={() => copyUrl(page.url)}
                                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                    {copiedUrl === page.url ? "Copied!" : "Copy URL"}
                                  </button>
                                  {onGenerateQrForUrl && (
                                    <button
                                      onClick={() => onGenerateQrForUrl(page.url, page.title, page.altText)}
                                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 transition-colors"
                                    >
                                      <QrCode className="w-3 h-3" /> Generate QR
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
