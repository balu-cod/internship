import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "../../shared/database/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

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

  app.post(api.actions.entry.path, async (req, res) => {
    try {
      const input = api.actions.entry.input.parse(req.body);
      const existing = await storage.getMaterialByCode(input.materialCode);
      let material;

      if (existing) {
        material = await storage.updateMaterial(input.materialCode, {
          quantity: existing.quantity + input.quantity,
          rack: input.rack,
          bin: input.bin,
        });
      } else {
        material = await storage.createMaterial({
          code: input.materialCode,
          quantity: input.quantity,
          rack: input.rack,
          bin: input.bin,
        });
      }

      await storage.createLog({
        materialCode: input.materialCode,
        action: "entry",
        quantity: input.quantity,
        rack: input.rack,
        bin: input.bin,
        enteredBy: input.enteredBy,
        userId: "system"
      });

      // Bin Transaction
      await storage.createBinTransaction({
        materialCode: input.materialCode,
        binLocation: `${input.rack}-${input.bin}`,
        receivedQty: input.quantity,
        issuedQty: 0,
        balanceQty: material.quantity,
        personName: input.enteredBy,
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

  app.post(api.actions.issue.path, async (req, res) => {
    try {
      const input = api.actions.issue.input.parse(req.body);
      const existing = await storage.getMaterialByCode(input.materialCode);
      if (!existing) {
        return res.status(404).json({ message: "Material not found" });
      }

      if (existing.rack.toUpperCase() !== input.rack.toUpperCase() || 
          existing.bin !== input.bin) {
        return res.status(400).json({ 
          message: `Material is not in the specified location. Current location: Rack ${existing.rack}, Bin ${existing.bin}` 
        });
      }

      if (existing.quantity < input.quantity) {
        return res.status(400).json({ message: "Insufficient quantity" });
      }

      const material = await storage.updateMaterial(input.materialCode, {
        quantity: existing.quantity - input.quantity
      });

      await storage.createLog({
        materialCode: input.materialCode,
        action: "issue",
        quantity: input.quantity,
        rack: input.rack,
        bin: input.bin,
        issuedBy: input.issuedBy,
        userId: "system"
      });

      // Bin Transaction
      await storage.createBinTransaction({
        materialCode: input.materialCode,
        binLocation: `${input.rack}-${input.bin}`,
        receivedQty: 0,
        issuedQty: input.quantity,
        balanceQty: material.quantity,
        personName: input.issuedBy,
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

  app.get("/api/materials/:code/transactions", async (req, res) => {
    const transactions = await storage.getBinTransactions(req.params.code);
    res.json(transactions);
  });

  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(`${api.materials.list.path}/:code`, async (req, res) => {
    await storage.deleteMaterial(req.params.code);
    res.json({ message: "Material deleted" });
  });

  app.post(`${api.materials.list.path}/reset`, async (req, res) => {
    await storage.resetInventory();
    res.json({ message: "Inventory reset" });
  });

  app.delete(api.logs.list.path, async (req, res) => {
    await storage.clearLogs();
    res.json({ message: "Logs cleared" });
  });

  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  return httpServer;
}

async function seed() {
  const existing = await storage.getMaterials();
  if (existing.length === 0) {
    console.log("Seeding data...");
    await storage.createMaterial({ code: "TRIM-001", quantity: 100, rack: "A1", bin: "01" });
    await storage.createMaterial({ code: "TRIM-002", quantity: 50, rack: "B2", bin: "15" });
    await storage.createMaterial({ code: "BUTTON-X", quantity: 500, rack: "C1", bin: "84" });
  }
}

seed().catch(console.error);
