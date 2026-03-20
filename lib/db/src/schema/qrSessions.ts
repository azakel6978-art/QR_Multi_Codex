import { pgTable, text, boolean, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const qrSessionsTable = pgTable("qr_sessions", {
  id: text("id").primaryKey(),
  qrData: text("qr_data").notNull(),
  dynamicContent: text("dynamic_content"),
  cornerColor: text("corner_color").notNull().default("#000000"),
  logoUrl: text("logo_url"),
  logoScale: real("logo_scale").notNull().default(0.2),
  textOverlay: jsonb("text_overlay"),
  whiteFill: boolean("white_fill").notNull().default(false),
  whiteFillColor: text("white_fill_color").notNull().default("#FFFFFF"),
  highlightCorners: boolean("highlight_corners").notNull().default(true),
  metadataFriendly: boolean("metadata_friendly").notNull().default(true),
  pageTitle: text("page_title"),
  pageDescription: text("page_description"),
  vocalIntroUrl: text("vocal_intro_url"),
  trackTraffic: boolean("track_traffic").notNull().default(false),
  tabsToOpen: integer("tabs_to_open").notNull().default(1),
  premiumFeatures: boolean("premium_features").notNull().default(false),
  qrImageBase64: text("qr_image_base64").notNull(),
  pageUrl: text("page_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQrSessionSchema = createInsertSchema(qrSessionsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertQrSession = z.infer<typeof insertQrSessionSchema>;
export type QrSession = typeof qrSessionsTable.$inferSelect;
