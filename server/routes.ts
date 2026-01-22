import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Material Routes ===
  app.get(api.materials.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const materials = await storage.getMaterials(search);
    res.json(materials);
  });

  app.get(api.materials.get.path, async (req, res) => {
    const material = await storage.getMaterialByCode(req.params.code);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.json(material);
  });

  // === Action Routes ===
  // Entry: Adds quantity
  app.post(api.actions.entry.path, async (req, res) => {
    try {
      const input = api.actions.entry.input.parse(req.body);
      
      const existing = await storage.getMaterialByCode(input.materialCode);
      let material;

      if (existing) {
        // Update existing: Add quantity
        // Also update location if provided (or strictly check location? Requirements say "Location Input Structure", imply simple entry)
        // Let's assume Entry updates the location to the latest one provided
        material = await storage.updateMaterial(input.materialCode, {
          quantity: existing.quantity + input.quantity,
          rack: input.rack,
          bin: input.bin
        });
      } else {
        // Create new
        material = await storage.createMaterial({
          code: input.materialCode,
          quantity: input.quantity,
          rack: input.rack,
          bin: input.bin
        });
      }

      // Log action
      await storage.createLog({
        materialCode: input.materialCode,
        action: "entry",
        quantity: input.quantity,
        rack: input.rack,
        bin: input.bin,
        userId: "system"
      });

      res.status(existing ? 200 : 201).json(material);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Issue: Subtracts quantity
  app.post(api.actions.issue.path, async (req, res) => {
    try {
      const input = api.actions.issue.input.parse(req.body);
      
      const existing = await storage.getMaterialByCode(input.materialCode);
      if (!existing) {
        return res.status(404).json({ message: "Material not found" });
      }

      if (existing.quantity < input.quantity) {
        return res.status(400).json({ message: "Insufficient quantity" });
      }

      // Strict location check? "Prevent issuing more than available quantity" - handled.
      // "Location (Rack + Bin)" in Issue Page. Should we validate against stored location?
      // "Values: A1, A2... Bin 01-84". 
      // Let's warn if location doesn't match but allow issue (flexibility)? 
      // Requirement: "System Logic: Prevent issuing more than available quantity". Doesn't explicitly say "Prevent issue if location wrong". 
      // But for inventory integrity, we should probably check.
      // However, simplified logic for now: Just reduce quantity. 
      // Maybe the user is issuing from a different bin?
      // Let's stick to simple quantity logic for now to match the prompt's simplicity.

      const material = await storage.updateMaterial(input.materialCode, {
        quantity: existing.quantity - input.quantity
      });

      // Log action
      await storage.createLog({
        materialCode: input.materialCode,
        action: "issue",
        quantity: input.quantity,
        rack: input.rack, // Log where they claimed they took it from
        bin: input.bin,
        issuedBy: input.issuedBy,
        userId: "system"
      });

      res.json(material);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Logs & Stats ===
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.list.path, async (req, res) => {
    await storage.clearLogs();
    res.json({ message: "Logs cleared" });
  });

  app.delete(`${api.materials.list.path}/:code`, async (req, res) => {
    await storage.deleteMaterial(req.params.code);
    res.json({ message: "Material deleted" });
  });

  app.post(`${api.materials.list.path}/reset`, async (req, res) => {
    await storage.resetInventory();
    res.json({ message: "Inventory reset" });
  });

  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  return httpServer;
}

// Seed function
async function seed() {
  const existing = await storage.getMaterials();
  if (existing.length === 0) {
    console.log("Seeding data...");
    await storage.createMaterial({ code: "TRIM-001", quantity: 100, rack: "A1", bin: "01" });
    await storage.createMaterial({ code: "TRIM-002", quantity: 50, rack: "B2", bin: "15" });
    await storage.createMaterial({ code: "BUTTON-X", quantity: 500, rack: "C1", bin: "84" });
    
    await storage.createLog({ materialCode: "TRIM-001", action: "entry", quantity: 100, rack: "A1", bin: "01", userId: "system" });
  }
}

// Run seed on startup (async)
seed().catch(console.error);
