import { Router, type IRouter, type Request, type Response } from "express";
import QRCode from "qrcode";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { db, qrSessionsTable, visitsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

interface TextOverlayConfig {
  text: string;
  font: string;
  size: number;
  x: number;
  y: number;
  color: string;
}

interface QrGenerateRequest {
  qrData: string;
  dynamicContent?: string;
  cornerColor?: string;
  logoUrl?: string;
  logoScale?: number;
  textOverlay?: TextOverlayConfig;
  whiteFill?: boolean;
  whiteFillColor?: string;
  highlightCorners?: boolean;
  metadataFriendly?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  vocalIntroUrl?: string;
  trackTraffic?: boolean;
  tabsToOpen?: number;
  premiumFeatures?: boolean;
  colorScheme?: "standard" | "tricolor" | "monochrome" | "rainbow" | "profile";
  triColors?: [string, string, string];
  scanMeText?: string;
  scanMeColor?: string;
  profileColors?: { primary: string; secondary: string; accent: string };
}

function isFinderPatternOuter(row: number, col: number, size: number): false | "tl" | "tr" | "bl" {
  if (row < 7 && col < 7) return "tl";
  if (row < 7 && col >= size - 7) return "tr";
  if (row >= size - 7 && col < 7) return "bl";
  return false;
}

function getFinderRole(
  localRow: number,
  localCol: number
): "outer" | "gap" | "center" {
  if (
    localRow === 0 || localRow === 6 ||
    localCol === 0 || localCol === 6
  ) return "outer";
  if (
    localRow >= 2 && localRow <= 4 &&
    localCol >= 2 && localCol <= 4
  ) return "center";
  return "gap";
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

async function generateQrWithOptions(
  data: string,
  opts: QrGenerateRequest
): Promise<string> {
  const cornerColor = opts.cornerColor || "#000000";
  const highlightCorners = opts.highlightCorners !== false;
  const scheme = opts.colorScheme || "standard";
  const bgColor = opts.whiteFill ? (opts.whiteFillColor || "#FAFAFA") : "#FFFFFF";
  const scanMeText = opts.scanMeText || "";
  const scanMeColor = opts.scanMeColor || cornerColor;
  const logoScale = Math.min(opts.logoScale ?? 0, 0.4);

  const qr = QRCode.create(data, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const modCount = modules.size;
  const modSize = 12;
  const margin = 4;
  const qrDim = modCount * modSize;
  const totalQrArea = qrDim + margin * modSize * 2;
  const scanMeHeight = scanMeText ? 56 : 0;
  const canvasW = totalQrArea;
  const canvasH = totalQrArea + scanMeHeight;

  const triColors = opts.triColors || [cornerColor, "#9B59B6", "#FF6600"];
  const profileColors = opts.profileColors || { primary: cornerColor, secondary: "#555555", accent: "#888888" };

  function getCornerColor(corner: "tl" | "tr" | "bl"): string {
    if (scheme === "tricolor") {
      if (corner === "tl") return triColors[0];
      if (corner === "tr") return triColors[1];
      return triColors[2];
    }
    if (scheme === "profile") {
      if (corner === "tl") return profileColors.primary;
      if (corner === "tr") return profileColors.secondary;
      return profileColors.accent;
    }
    if (scheme === "monochrome") return "#2A2A2A";
    return cornerColor;
  }

  function getModuleColor(row: number, col: number): string {
    if (scheme === "rainbow") {
      const hue = Math.floor(((col + row * 0.3) / (modCount + modCount * 0.3)) * 360);
      return hslToHex(hue % 360, 80, 35);
    }
    if (scheme === "monochrome") return "#1A1A1A";
    if (scheme === "profile") return profileColors.primary;
    if (highlightCorners) return cornerColor;
    return "#000000";
  }

  let rects = "";

  rects += `<rect x="0" y="0" width="${canvasW}" height="${canvasH}" fill="${bgColor}" />`;

  for (let row = 0; row < modCount; row++) {
    for (let col = 0; col < modCount; col++) {
      const idx = row * modCount + col;
      const isDark = modules.data[idx] === 1;
      const x = margin * modSize + col * modSize;
      const y = margin * modSize + row * modSize;

      const finder = isFinderPatternOuter(row, col, modCount);

      if (finder) {
        const localRow = finder === "bl" ? row - (modCount - 7) : row;
        const localCol = finder === "tr" ? col - (modCount - 7) : col;
        const role = getFinderRole(localRow, localCol);
        const cColor = getCornerColor(finder);

        if (role === "outer") {
          rects += `<rect x="${x}" y="${y}" width="${modSize}" height="${modSize}" fill="${cColor}" rx="1" />`;
        } else if (role === "center") {
          rects += `<rect x="${x}" y="${y}" width="${modSize}" height="${modSize}" fill="${cColor}" rx="1" />`;
        } else {
          rects += `<rect x="${x}" y="${y}" width="${modSize}" height="${modSize}" fill="#FFFFFF" />`;
        }
      } else {
        if (isDark) {
          const color = getModuleColor(row, col);
          if (scheme === "rainbow") {
            rects += `<rect x="${x}" y="${y}" width="${modSize}" height="${modSize}" fill="${color}" rx="2" />`;
          } else {
            rects += `<rect x="${x}" y="${y}" width="${modSize}" height="${modSize}" fill="${color}" rx="1" />`;
          }
        }
      }
    }
  }

  if (scanMeText) {
    const textY = totalQrArea + scanMeHeight / 2 + 2;
    rects += `
      <text
        x="${canvasW / 2}"
        y="${textY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        font-weight="bold"
        fill="${scanMeColor}"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="4"
      >${scanMeText.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
  }

  if (opts.textOverlay && opts.textOverlay.text && !scanMeText) {
    const ov = opts.textOverlay;
    const textY = totalQrArea + 36;
    const fontWeight = ov.font === "bold" ? "bold" : "normal";
    rects += `
      <text
        x="${canvasW / 2}"
        y="${textY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${Math.max(16, Math.min(ov.size, 48))}"
        font-weight="${fontWeight}"
        fill="${ov.color || "#000000"}"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="3"
      >${ov.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">${rects}</svg>`;

  let image = sharp(Buffer.from(svg)).resize(canvasW > 600 ? 600 : canvasW).png();

  if (opts.logoUrl && logoScale > 0) {
    try {
      const imgBuf = await image.toBuffer();
      const imgMeta = await sharp(imgBuf).metadata();
      const outW = imgMeta.width || 600;
      const outH = imgMeta.height || 600;
      const logoSize = Math.floor(outW * logoScale);
      const logoX = Math.floor((outW - logoSize) / 2);
      const qrAreaH = outH - (scanMeText ? Math.floor(scanMeHeight * (outW / canvasW)) : 0);
      const logoY = Math.floor((qrAreaH - logoSize) / 2);

      const logoUrlParsed = new URL(opts.logoUrl);
      if (!["https:", "http:"].includes(logoUrlParsed.protocol)) throw new Error("Invalid logo URL protocol");
      const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "169.254.169.254", "metadata.google.internal"];
      if (blockedHosts.some(h => logoUrlParsed.hostname === h || logoUrlParsed.hostname.endsWith(".internal"))) throw new Error("Blocked host");
      const ipParts = logoUrlParsed.hostname.split(".");
      if (ipParts.length === 4 && (ipParts[0] === "10" || (ipParts[0] === "172" && parseInt(ipParts[1]) >= 16 && parseInt(ipParts[1]) <= 31) || (ipParts[0] === "192" && ipParts[1] === "168"))) throw new Error("Blocked private IP");

      const protocol = logoUrlParsed.protocol === "https:" ? await import("https") : await import("http");
      const MAX_LOGO_BYTES = 5 * 1024 * 1024;
      const logoBuffer = await new Promise<Buffer>((resolve, reject) => {
        const req = protocol.get(opts.logoUrl!, (res: any) => {
          if (res.statusCode >= 300 && res.statusCode < 400) { reject(new Error("Redirects not followed")); return; }
          const chunks: Buffer[] = [];
          let totalBytes = 0;
          res.on("data", (chunk: Buffer) => { totalBytes += chunk.length; if (totalBytes > MAX_LOGO_BYTES) { req.destroy(); reject(new Error("Logo too large")); return; } chunks.push(chunk); });
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        }).on("error", reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error("Logo fetch timeout")); });
      });

      const bgCircle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${logoSize + 12}" height="${logoSize + 12}"><circle cx="${(logoSize + 12) / 2}" cy="${(logoSize + 12) / 2}" r="${(logoSize + 12) / 2}" fill="white"/></svg>`);

      const resizedLogo = await sharp(logoBuffer)
        .resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .toBuffer();

      image = sharp(imgBuf).composite([
        { input: await sharp(bgCircle).png().toBuffer(), left: logoX - 6, top: logoY - 6 },
        { input: resizedLogo, left: logoX, top: logoY },
      ]);
    } catch (_e) {}
  }

  const finalBuffer = await image.png().toBuffer();
  return finalBuffer.toString("base64");
}

function buildPageHtml(session: typeof qrSessionsTable.$inferSelect): string {
  const title = session.pageTitle || "QR Code Page";
  const description = session.pageDescription || "Generated by ACB Dynamic QR Studio";
  const data = session.dynamicContent || session.qrData;

  const metaTags = session.metadataFriendly
    ? `
    <meta name="description" content="${description.replace(/"/g, "&quot;")}">
    <meta property="og:title" content="${title.replace(/"/g, "&quot;")}">
    <meta property="og:description" content="${description.replace(/"/g, "&quot;")}">
    <meta name="robots" content="index, follow">
    `
    : "";

  const audioTag = session.premiumFeatures && session.vocalIntroUrl
    ? `<audio autoplay src="${session.vocalIntroUrl}"></audio>`
    : "";

  const trackingScript = session.premiumFeatures && session.trackTraffic
    ? `<script>
        fetch('/api/traffic/${session.id}/track', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ source: document.referrer || 'direct', userAgent: navigator.userAgent })
        }).catch(() => {});
       </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/</g, "&lt;")}</title>
  ${metaTags}
</head>
<body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f0f0f;font-family:sans-serif;color:#fff;">
  ${audioTag}
  <h1 style="margin-bottom:1rem;font-size:1.5rem;">${title.replace(/</g, "&lt;")}</h1>
  <img
    src="data:image/png;base64,${session.qrImageBase64}"
    alt="${description.replace(/"/g, "&quot;")}"
    style="max-width:400px;width:90%;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.5);"
    width="400"
    height="400"
  />
  <p style="margin-top:1rem;color:#aaa;font-size:0.875rem;">${data.replace(/</g, "&lt;")}</p>
  ${trackingScript}
</body>
</html>`;
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const body = req.body as QrGenerateRequest;

    if (!body.qrData) {
      res.status(400).json({ error: "MISSING_QR_DATA", message: "qrData is required" });
      return;
    }

    const effectiveData = body.dynamicContent?.trim() || body.qrData;
    const id = uuidv4();

    const qrImageBase64 = await generateQrWithOptions(effectiveData, body);
    const pageUrl = `/api/qr/page/${id}`;

    const session = {
      id,
      qrData: body.qrData,
      dynamicContent: body.dynamicContent || null,
      cornerColor: body.cornerColor || "#000000",
      logoUrl: body.logoUrl || null,
      logoScale: body.logoScale ?? 0.2,
      textOverlay: body.textOverlay ? JSON.parse(JSON.stringify(body.textOverlay)) : null,
      whiteFill: body.whiteFill ?? false,
      whiteFillColor: body.whiteFillColor || "#FFFFFF",
      highlightCorners: body.highlightCorners !== false,
      metadataFriendly: body.metadataFriendly !== false,
      pageTitle: body.pageTitle || null,
      pageDescription: body.pageDescription || null,
      vocalIntroUrl: body.vocalIntroUrl || null,
      trackTraffic: body.trackTraffic ?? false,
      tabsToOpen: body.tabsToOpen ?? 1,
      premiumFeatures: body.premiumFeatures ?? false,
      qrImageBase64,
      pageUrl,
    };

    const [inserted] = await db.insert(qrSessionsTable).values(session).returning();

    res.json(inserted);
  } catch (err) {
    req.log.error(err, "Failed to generate QR");
    res.status(500).json({ error: "GENERATION_FAILED", message: "QR generation failed" });
  }
});

router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const sessions = await db
      .select()
      .from(qrSessionsTable)
      .orderBy(desc(qrSessionsTable.createdAt));
    res.json(sessions);
  } catch (err) {
    req.log.error(err, "Failed to list sessions");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to fetch sessions" });
  }
});

router.get("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const [session] = await db
      .select()
      .from(qrSessionsTable)
      .where(eq(qrSessionsTable.id, req.params.id));

    if (!session) {
      res.status(404).json({ error: "NOT_FOUND", message: "Session not found" });
      return;
    }
    res.json(session);
  } catch (err) {
    req.log.error(err, "Failed to get session");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to fetch session" });
  }
});

router.delete("/sessions/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(qrSessionsTable).where(eq(qrSessionsTable.id, req.params.id));
    await db.delete(visitsTable).where(eq(visitsTable.sessionId, req.params.id));
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    req.log.error(err, "Failed to delete session");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to delete session" });
  }
});

router.post("/test", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body as { sessionId?: string; qrImageBase64?: string };

    let session: typeof qrSessionsTable.$inferSelect | undefined;

    if (sessionId) {
      const [found] = await db
        .select()
        .from(qrSessionsTable)
        .where(eq(qrSessionsTable.id, sessionId));
      session = found;
    }

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let logoConflict = false;
    let cornerConflict = false;
    let confidence = 0.95;

    if (session) {
      const logoScale = session.logoScale ?? 0;
      if (logoScale > 0.3) {
        logoConflict = true;
        confidence -= 0.25;
        issues.push("Logo scale exceeds 30% — critical QR data modules may be obscured");
        recommendations.push("Reduce logo scale to 0.25 or below for reliable scanning");
      } else if (logoScale > 0.25) {
        warnings.push("Logo scale is above 25% — some scanners may struggle");
        recommendations.push("Consider reducing logo scale to 0.2 for best compatibility");
        confidence -= 0.1;
      }

      if (session.whiteFill && session.whiteFillColor !== "#FFFFFF") {
        warnings.push("Custom white fill color may reduce QR contrast");
        recommendations.push("Use high-contrast colors for fill to maintain scannability");
        confidence -= 0.05;
      }

      if (session.highlightCorners && session.cornerColor !== "#000000") {
        const hex = session.cornerColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance > 0.6) {
          cornerConflict = true;
          confidence -= 0.2;
          issues.push("Corner color is too light — finder squares may not be detected");
          recommendations.push("Use a darker corner color (luminance below 40%) for finder square visibility");
        } else if (luminance > 0.4) {
          warnings.push("Corner color has moderate luminance — test with multiple scanners");
          confidence -= 0.08;
        }
      }

      if (session.qrData && session.qrData.length > 200) {
        warnings.push("QR data is long — use a URL shortener for better reliability");
        confidence -= 0.05;
      }

      if (session.textOverlay) {
        warnings.push("Text overlay may cover QR modules — verify scannability after placement");
        confidence -= 0.05;
      }
    } else {
      warnings.push("No session found — running generic validation only");
      recommendations.push("Generate a QR session first for detailed analysis");
    }

    if (issues.length === 0 && warnings.length === 0) {
      recommendations.push("QR code looks great! No issues detected.");
    }

    confidence = Math.max(0, Math.min(1, confidence));

    res.json({
      sessionId: session?.id,
      scannable: confidence >= 0.6,
      confidence,
      issues,
      warnings,
      recommendations,
      logoConflict,
      cornerConflict,
    });
  } catch (err) {
    req.log.error(err, "Failed to test QR");
    res.status(500).json({ error: "TEST_FAILED", message: "QR test failed" });
  }
});

router.get("/page/:id", async (req: Request, res: Response) => {
  try {
    const [session] = await db
      .select()
      .from(qrSessionsTable)
      .where(eq(qrSessionsTable.id, req.params.id));

    if (!session) {
      res.status(404).json({ error: "NOT_FOUND", message: "Session not found" });
      return;
    }

    const contentType = req.headers.accept?.includes("text/html") ? "html" : "json";

    if (contentType === "html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(buildPageHtml(session));
    } else {
      res.json({
        sessionId: session.id,
        html: buildPageHtml(session),
        pageTitle: session.pageTitle,
        pageDescription: session.pageDescription,
      });
    }
  } catch (err) {
    req.log.error(err, "Failed to get QR page");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to fetch page" });
  }
});

export default router;
