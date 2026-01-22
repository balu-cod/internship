import { users, type Material } from "../../../shared/database/schema";
import { db } from "../../backend/db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: number): Promise<any | undefined>;
  upsertUser(user: any): Promise<any>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: number): Promise<any | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: any): Promise<any> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.replitId,
        set: {
          ...userData,
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
