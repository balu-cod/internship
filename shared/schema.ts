import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as auth from "./models/auth";

export const users = auth.users;

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  quantity: integer("quantity").notNull().default(0),
  rack: text("rack").notNull(),
  bin: text("bin").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  materialCode: text("material_code").notNull(),
  action: text("action").notNull(), // "entry" or "issue"
  quantity: integer("quantity").notNull(),
  rack: text("rack").notNull(),
  bin: text("bin").notNull(),
  issuedBy: text("issued_by"), // New field for issue tracking
  timestamp: timestamp("timestamp").defaultNow(),
  userId: text("user_id"), // Optional: Link to Replit Auth user ID
});

// Zod Schemas
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true, lastUpdated: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, timestamp: true });

// Explicit Types
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// API Requests
export type EntryRequest = {
  materialCode: string;
  quantity: number;
  rack: string;
  bin: string;
};

export type IssueRequest = {
  materialCode: string;
  quantity: number;
  rack: string;
  bin: string;
};

export type MaterialResponse = Material;
export type LogResponse = Log;

export type DashboardStats = {
  totalMaterials: number;
  enteredToday: number;
  issuedToday: number;
  recentLogs: Log[];
};
