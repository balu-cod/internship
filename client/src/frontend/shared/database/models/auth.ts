import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: text("replit_id").notNull().unique(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
