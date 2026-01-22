import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth.ts";

export { users };

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
  issuedBy: text("issued_by"),
  enteredBy: text("entered_by"),
  balanceQty: integer("balance_qty").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow(),
  userId: text("user_id"),
});

// Bin Transactions table
export const binTransactions = pgTable("bin_transactions", {
  id: serial("id").primaryKey(),
  materialCode: text("material_code").notNull(),
  binLocation: text("bin_location").notNull(),
  receivedQty: integer("received_qty").notNull().default(0),
  issuedQty: integer("issued_qty").notNull().default(0),
  balanceQty: integer("balance_qty").notNull(),
  personName: text("person_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true, lastUpdated: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, timestamp: true });
export const insertBinTransactionSchema = createInsertSchema(binTransactions).omit({ id: true, createdAt: true });

// Explicit Types
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type BinTransaction = typeof binTransactions.$inferSelect;
export type InsertBinTransaction = z.infer<typeof insertBinTransactionSchema>;

// API Requests
export type EntryRequest = {
  materialCode: string;
  quantity: number;
  rack: string;
  bin: string;
  enteredBy: string;
};

export type IssueRequest = {
  materialCode: string;
  quantity: number;
  rack: string;
  bin: string;
  issuedBy: string;
};

export type DashboardStats = {
  totalMaterials: number;
  enteredToday: number;
  issuedToday: number;
  recentLogs: Log[];
};
