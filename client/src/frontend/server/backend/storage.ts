import { db } from "./db";
import {
  materials,
  logs,
  binTransactions,
  type Material,
  type InsertMaterial,
  type Log,
  type InsertLog,
  type BinTransaction,
  type InsertBinTransaction,
  type DashboardStats
} from "../../shared/database/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { startOfDay } from "date-fns";

export interface IStorage {
  // Materials
  getMaterials(search?: string): Promise<Material[]>;
  getMaterialByCode(code: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(code: string, updates: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(code: string): Promise<void>;
  resetInventory(): Promise<void>;
  
  // Logs
  createLog(log: InsertLog): Promise<Log>;
  getLogs(limit?: number): Promise<Log[]>;
  clearLogs(): Promise<void>;
  
  // Bin Transactions
  createBinTransaction(transaction: InsertBinTransaction): Promise<BinTransaction>;
  getBinTransactions(materialCode: string): Promise<BinTransaction[]>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  async getMaterials(search?: string): Promise<Material[]> {
    if (search) {
      if (search.includes("rack:") && search.includes("bin:")) {
        const parts = search.split("-");
        const rackVal = parts[0].replace("rack:", "").trim().toLowerCase();
        const binVal = parts[1].replace("bin:", "").trim().toLowerCase();
        return await db.select().from(materials).where(
          and(
            sql`lower(${materials.rack}) = ${rackVal}`,
            sql`lower(${materials.bin}) = ${binVal}`
          )
        ).orderBy(desc(materials.lastUpdated));
      }
      
      if (search.startsWith("rack:")) {
        const rackVal = search.split(":")[1].trim().toLowerCase();
        const pattern = `${rackVal}%`;
        return await db.select().from(materials).where(
          sql`lower(${materials.rack}) LIKE ${pattern}`
        ).orderBy(desc(materials.lastUpdated));
      }

      const searchPattern = `%${search}%`;
      return await db.select().from(materials).where(
        sql`lower(${materials.code}) LIKE lower(${searchPattern}) OR 
            lower(${materials.rack}) LIKE lower(${searchPattern}) OR 
            lower(${materials.bin}) LIKE lower(${searchPattern}) OR
            lower(concat(${materials.rack}, '-', ${materials.bin})) LIKE lower(${searchPattern})`
      );
    }
    return await db.select().from(materials).orderBy(desc(materials.lastUpdated));
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
    const material = await this.getMaterialByCode(insertLog.materialCode);
    const balanceQty = material ? material.quantity : 0;
    
    const [log] = await db.insert(logs).values({
      ...insertLog,
      balanceQty
    }).returning();
    return log;
  }

  async getLogs(limit: number = 50): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.timestamp)).limit(limit);
  }

  async clearLogs(): Promise<void> {
    await db.delete(logs);
  }

  async createBinTransaction(transaction: InsertBinTransaction): Promise<BinTransaction> {
    const [newTransaction] = await db.insert(binTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getBinTransactions(materialCode: string): Promise<BinTransaction[]> {
    return await db.select().from(binTransactions)
      .where(eq(binTransactions.materialCode, materialCode))
      .orderBy(desc(binTransactions.createdAt));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = startOfDay(new Date());

    const totalMaterialsResult = await db.select({ count: sql<number>`count(*)` }).from(materials);
    const totalMaterials = Number(totalMaterialsResult[0]?.count || 0);

    const enteredTodayResult = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(and(eq(logs.action, "entry"), gte(logs.timestamp, today)));
    const enteredToday = Number(enteredTodayResult[0]?.count || 0);

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
