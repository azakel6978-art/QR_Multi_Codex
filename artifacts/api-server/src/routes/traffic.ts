import { Router, type IRouter, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, visitsTable, qrSessionsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const [session] = await db
      .select()
      .from(qrSessionsTable)
      .where(eq(qrSessionsTable.id, sessionId));

    if (!session) {
      res.status(404).json({ error: "NOT_FOUND", message: "Session not found" });
      return;
    }

    const allVisits = await db
      .select()
      .from(visitsTable)
      .where(eq(visitsTable.sessionId, sessionId))
      .orderBy(desc(visitsTable.visitedAt));

    const uniqueAgents = new Set(allVisits.map((v) => v.userAgent || "unknown"));

    const sources: Record<string, number> = {};
    for (const visit of allVisits) {
      const src = visit.source || "direct";
      sources[src] = (sources[src] || 0) + 1;
    }

    res.json({
      sessionId,
      totalVisits: allVisits.length,
      uniqueVisitors: uniqueAgents.size,
      sources,
      recentVisits: allVisits.slice(0, 20).map((v) => ({
        id: v.id,
        sessionId: v.sessionId,
        source: v.source,
        userAgent: v.userAgent,
        visitedAt: v.visitedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Failed to get traffic report");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to fetch traffic" });
  }
});

router.post("/:sessionId/track", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { source, userAgent } = req.body as { source?: string; userAgent?: string };

    const [session] = await db
      .select()
      .from(qrSessionsTable)
      .where(eq(qrSessionsTable.id, sessionId));

    if (!session) {
      res.status(404).json({ error: "NOT_FOUND", message: "Session not found" });
      return;
    }

    if (!session.trackTraffic || !session.premiumFeatures) {
      res.json({ success: false, visitId: "" });
      return;
    }

    const visitId = uuidv4();
    await db.insert(visitsTable).values({
      id: visitId,
      sessionId,
      source: source || "direct",
      userAgent: userAgent || req.headers["user-agent"] || null,
    });

    res.json({ success: true, visitId });
  } catch (err) {
    req.log.error(err, "Failed to track visit");
    res.status(500).json({ error: "DB_ERROR", message: "Failed to track visit" });
  }
});

export default router;
