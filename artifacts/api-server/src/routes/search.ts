import { Router, type IRouter, type Request, type Response } from "express";
import * as cheerio from "cheerio";

const router: IRouter = Router();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Platform detection helpers
// ---------------------------------------------------------------------------

interface PlatformProfile {
  platform: string;
  profileUrl: string;
  mediaUrl: string;
  handle: string;
}

function detectPlatformUrls(url: string, query: string): PlatformProfile {
  const handle = query.replace(/\s+/g, "").toLowerCase();
  const u = url.toLowerCase();

  if (u.includes("instagram.com")) {
    const slug = extractPathSegment(url, 1) || handle;
    return {
      platform: "Instagram",
      profileUrl: `https://www.instagram.com/${slug}/`,
      mediaUrl: `https://www.instagram.com/${slug}/reels/`,
      handle: slug,
    };
  }
  if (u.includes("tiktok.com")) {
    const slug = extractPathSegment(url, 1)?.replace("@", "") || handle;
    return {
      platform: "TikTok",
      profileUrl: `https://www.tiktok.com/@${slug}`,
      mediaUrl: `https://www.tiktok.com/@${slug}?tab=videos`,
      handle: slug,
    };
  }
  if (u.includes("twitter.com") || u.includes("x.com")) {
    const slug = extractPathSegment(url, 1) || handle;
    return {
      platform: "X / Twitter",
      profileUrl: `https://x.com/${slug}`,
      mediaUrl: `https://x.com/${slug}/media`,
      handle: slug,
    };
  }
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    const slug = extractPathSegment(url, 2) || handle;
    return {
      platform: "YouTube",
      profileUrl: `https://www.youtube.com/@${slug}`,
      mediaUrl: `https://www.youtube.com/@${slug}/videos`,
      handle: slug,
    };
  }
  if (u.includes("facebook.com")) {
    const slug = extractPathSegment(url, 1) || handle;
    return {
      platform: "Facebook",
      profileUrl: `https://www.facebook.com/${slug}`,
      mediaUrl: `https://www.facebook.com/${slug}/photos`,
      handle: slug,
    };
  }
  if (u.includes("soundcloud.com")) {
    const slug = extractPathSegment(url, 1) || handle;
    return {
      platform: "SoundCloud",
      profileUrl: `https://soundcloud.com/${slug}`,
      mediaUrl: `https://soundcloud.com/${slug}/tracks`,
      handle: slug,
    };
  }
  if (u.includes("spotify.com")) {
    return {
      platform: "Spotify",
      profileUrl: url,
      mediaUrl: url.replace("/artist/", "/artist/") + "?tab=discography",
      handle,
    };
  }
  if (u.includes("bandcamp.com")) {
    const slug = url.match(/https?:\/\/([^.]+)\.bandcamp/)?.[1] || handle;
    return {
      platform: "Bandcamp",
      profileUrl: `https://${slug}.bandcamp.com/`,
      mediaUrl: `https://${slug}.bandcamp.com/music`,
      handle: slug,
    };
  }
  if (u.includes("threads.net")) {
    const slug = extractPathSegment(url, 2) || handle;
    return {
      platform: "Threads",
      profileUrl: `https://www.threads.net/@${slug}`,
      mediaUrl: `https://www.threads.net/@${slug}`,
      handle: slug,
    };
  }
  // Generic fallback
  const domain = new URL(url).hostname;
  return {
    platform: domain,
    profileUrl: url,
    mediaUrl: url,
    handle,
  };
}

function extractPathSegment(url: string, index: number): string | undefined {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[index] ? decodeURIComponent(parts[index]) : undefined;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Fetch page metadata (logo, og:image, description)
// ---------------------------------------------------------------------------

interface SiteMetadata {
  title: string;
  description: string;
  ogDescription: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  keywords: string;
  twitterDescription: string;
}

async function fetchSiteMetadata(url: string): Promise<SiteMetadata> {
  const empty: SiteMetadata = {
    title: "",
    description: "",
    ogDescription: "",
    logoUrl: "",
    faviconUrl: "",
    ogImageUrl: "",
    keywords: "",
    twitterDescription: "",
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return empty;
    const html = await res.text();
    const $ = cheerio.load(html);
    const base = new URL(url);

    const resolveUrl = (href: string) => {
      if (!href) return "";
      try {
        return new URL(href, base.origin).href;
      } catch {
        return href;
      }
    };

    // Favicon / native logo — prefer apple-touch-icon or manifest icon over default favicon
    const faviconHref =
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="apple-touch-icon-precomposed"]').attr("href") ||
      $('link[rel="icon"][type="image/png"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="icon"]').first().attr("href") ||
      "/favicon.ico";

    // Look for a native logo <img> (not a platform-generic icon)
    const logoImgSrc = (() => {
      const candidates: string[] = [];
      $('img[class*="logo"], img[id*="logo"], img[alt*="logo"], img[class*="brand"]').each(
        (_, el) => {
          const src = $(el).attr("src");
          if (src) candidates.push(resolveUrl(src));
        }
      );
      return candidates[0] || "";
    })();

    return {
      title: $("title").text().trim() || $('meta[property="og:title"]').attr("content") || "",
      description: $('meta[name="description"]').attr("content") || "",
      ogDescription: $('meta[property="og:description"]').attr("content") || "",
      logoUrl: logoImgSrc,
      faviconUrl: resolveUrl(faviconHref),
      ogImageUrl: $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || "",
      keywords: $('meta[name="keywords"]').attr("content") || "",
      twitterDescription: $('meta[name="twitter:description"]').attr("content") || "",
    };
  } catch {
    return empty;
  }
}

// ---------------------------------------------------------------------------
// DuckDuckGo search scrape (no API key)
// ---------------------------------------------------------------------------

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function duckduckgoSearch(query: string, maxResults = 3): Promise<SearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encoded}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $(".result").each((_, el) => {
      if (results.length >= maxResults) return false;

      const anchor = $(el).find(".result__a");
      const title = anchor.text().trim();
      const rawHref = anchor.attr("href") || "";
      const snippet = $(el).find(".result__snippet").text().trim();

      // DuckDuckGo wraps links — extract real URL
      let url = rawHref;
      try {
        const parsed = new URL(rawHref, "https://duckduckgo.com");
        url = parsed.searchParams.get("uddg") || parsed.href;
        url = decodeURIComponent(url);
      } catch {
        url = rawHref;
      }

      if (title && url && url.startsWith("http")) {
        results.push({ title, url, snippet });
      }
    });

    return results.slice(0, maxResults);
  } catch (err) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Synopsis builder
// ---------------------------------------------------------------------------

function buildSiteIntro(
  platform: PlatformProfile,
  meta: SiteMetadata,
  query: string
): string {
  const name = query;
  const desc =
    meta.ogDescription ||
    meta.description ||
    meta.twitterDescription ||
    meta.snippet ||
    "";
  const kw = meta.keywords ? ` Keywords associated: ${meta.keywords}.` : "";

  return (
    `${name} on ${platform.platform}: ` +
    (desc
      ? `"${desc}"${kw}`
      : `Profile found at ${platform.platform}. No extended description available from this source.${kw}`)
  );
}

// ---------------------------------------------------------------------------
// Page builder — 9 pages: [intro, page1, page2] × 3 sites
// ---------------------------------------------------------------------------

export interface ContentPage {
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

// ---------------------------------------------------------------------------
// Route: POST /api/search/build-pages
// ---------------------------------------------------------------------------

router.post("/build-pages", async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };

  if (!query || query.trim().length === 0) {
    res.status(400).json({ error: "MISSING_QUERY", message: "query is required" });
    return;
  }

  req.log.info({ query }, "Building 9-page content for query");

  try {
    // 1. Search
    const searchResults = await duckduckgoSearch(query.trim(), 3);

    if (searchResults.length === 0) {
      res.status(422).json({
        error: "NO_RESULTS",
        message: "No search results found for this query",
      });
      return;
    }

    // 2. Fetch metadata for each result in parallel
    const metaResults = await Promise.allSettled(
      searchResults.map((r) => fetchSiteMetadata(r.url))
    );

    const pages: ContentPage[] = [];
    let pageNum = 1;

    for (let i = 0; i < searchResults.length; i++) {
      const sr = searchResults[i];
      const meta: SiteMetadata & { snippet?: string } =
        metaResults[i].status === "fulfilled"
          ? { ...metaResults[i].value, snippet: sr.snippet }
          : {
              title: sr.title,
              description: sr.snippet,
              ogDescription: "",
              logoUrl: "",
              faviconUrl: "",
              ogImageUrl: "",
              keywords: "",
              twitterDescription: "",
              snippet: sr.snippet,
            };

      const platform = detectPlatformUrls(sr.url, query);
      const synopsis = buildSiteIntro(platform as any, meta as any, query);

      // -- INTRO PAGE (1 of 3 intro pages) --
      pages.push({
        pageNumber: pageNum++,
        type: "intro",
        platform: platform.platform,
        title: `Overview: ${query} on ${platform.platform}`,
        url: platform.profileUrl,
        synopsis,
        altText: `Synopsis and review of ${query}'s presence on ${platform.platform}. ${synopsis}`,
        logoUrl: meta.logoUrl || meta.faviconUrl,
        faviconUrl: meta.faviconUrl,
        ogImageUrl: meta.ogImageUrl,
        searchSnippet: sr.snippet,
      });

      // -- PROFILE PAGE --
      pages.push({
        pageNumber: pageNum++,
        type: "profile",
        platform: platform.platform,
        title: `${query} — Profile on ${platform.platform}`,
        url: platform.profileUrl,
        synopsis: `Direct profile page for ${query} on ${platform.platform}. ${meta.description || meta.ogDescription || sr.snippet}`,
        altText: `${query} official profile on ${platform.platform}. ${meta.description || sr.snippet}`,
        logoUrl: meta.logoUrl || meta.faviconUrl,
        faviconUrl: meta.faviconUrl,
        ogImageUrl: meta.ogImageUrl,
        searchSnippet: sr.snippet,
      });

      // -- MEDIA / WALL PAGE --
      pages.push({
        pageNumber: pageNum++,
        type: "media",
        platform: platform.platform,
        title: `${query} — Media & Posts on ${platform.platform}`,
        url: platform.mediaUrl,
        synopsis: `Media library, wall, or high-engagement posts for ${query} on ${platform.platform}. Curated content feed and audience interaction hub.`,
        altText: `${query} media wall and content library on ${platform.platform}. View videos, posts, tracks, and high-engagement content.`,
        logoUrl: meta.logoUrl || meta.faviconUrl,
        faviconUrl: meta.faviconUrl,
        ogImageUrl: meta.ogImageUrl,
        searchSnippet: sr.snippet,
      });
    }

    res.json({
      query,
      totalPages: pages.length,
      sitesFound: searchResults.length,
      pages,
    });
  } catch (err) {
    req.log.error(err, "Failed to build pages");
    res.status(500).json({ error: "BUILD_FAILED", message: "Failed to build content pages" });
  }
});

export default router;
