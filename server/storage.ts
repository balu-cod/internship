import { db } from "./db";
import {
  materials,
  logs,
  type Material,
  type InsertMaterial,
  type Log,
  type InsertLog,
  type DashboardStats
} from "@shared/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { startOfDay } from "date-fns";

export interface IStorage {
  // Materials
  getMaterials(search?: string): Promise<Material[]>;
  getMaterialByCode(code: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(code: string, updates: Partial<InsertMaterial>): Promise<Material>;
  
  // Logs
  createLog(log: InsertLog): Promise<Log>;
  getLogs(limit?: number): Promise<Log[]>;
  clearLogs(): Promise<void>;
  
  // Stats
  getDashboardStats(): Promise<DashboardStats>;
  deleteMaterial(code: string): Promise<void>;
  resetInventory(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMaterials(search?: string): Promise<Material[]> {
    if (search) {
      const searchPattern = `%${search}%`;
      // Search on code, rack, bin, and composite location (rack-bin)
      return await db.select().from(materials).where(
        sql`lower(${materials.code}) LIKE lower(${searchPattern}) OR 
            lower(${materials.rack}) LIKE lower(${searchPattern}) OR 
            lower(${materials.bin}) LIKE lower(${searchPattern}) OR
            lower(concat(${materials.rack}, '-', ${materials.bin})) LIKE lower(${searchPattern})`
      );
    }
    return await db.select().from(materials);
  }

  async getMaterialByCode(code: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.code, code));
    return material;
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db.insert(materials).values(insertMaterial).returning();
    return material;
  }

  async updateMaterial(code: string, updates: Partial<InsertMaterial>): Promise<Material> {
    const [updated] = await db
      .update(materials)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(materials.code, code))
      .returning();
    return updated;
  }

  async deleteMaterial(code: string): Promise<void> {
    await db.delete(materials).where(eq(materials.code, code));
  }

  async resetInventory(): Promise<void> {
    await db.update(materials).set({ quantity: 0, lastUpdated: new Date() });
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }

  async getLogs(limit: number = 50): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.timestamp)).limit(limit);
  }

  async clearLogs(): Promise<void> {
    await db.delete(logs);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = startOfDay(new Date());

    const totalMaterialsResult = await db.select({ count: sql<number>`count(*)` }).from(materials);
    const totalMaterials = Number(totalMaterialsResult[0]?.count || 0);

    // Count logs for "entry" today
    const enteredTodayResult = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(and(eq(logs.action, "entry"), gte(logs.timestamp, today)));
    const enteredToday = Number(enteredTodayResult[0]?.count || 0);

    // Count logs for "issue" today
    const issuedTodayResult = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(and(eq(logs.action, "issue"), gte(logs.timestamp, today)));
    const issuedToday = Number(issuedTodayResult[0]?.count || 0);

    const recentLogs = await this.getLogs(10);

    return {
      totalMaterials,
      enteredToday,
      issuedToday,
      recentLogs
    };
  }
}

export const storage = new DatabaseStorage();
