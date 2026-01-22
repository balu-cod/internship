import { z } from "zod";

// Shared schemas for consistent validation
export const materialSchema = z.object({
  id: z.number(),
  code: z.string().min(1, "Material code is required"),
  quantity: z.number().min(0),
  rack: z.string().min(1, "Rack is required"),
  bin: z.string().min(1, "Bin is required"),
  lastUpdated: z.string().optional().nullable(),
});

export const logSchema = z.object({
  id: z.number(),
  materialCode: z.string(),
  action: z.enum(["entry", "issue"]),
  quantity: z.number(),
  rack: z.string(),
  bin: z.string(),
  issuedBy: z.string().optional().nullable(),
  enteredBy: z.string().optional().nullable(),
  balanceQty: z.number(),
  timestamp: z.string().optional().nullable(),
});

export const statsSchema = z.object({
  totalMaterials: z.number(),
  enteredToday: z.number(),
  issuedToday: z.number(),
  recentLogs: z.array(logSchema),
});

// API Route Definitions
export const api = {
  materials: {
    list: {
      path: "/api/materials",
      method: "GET",
      responses: {
        200: z.array(materialSchema)
      }
    },
    get: {
      path: "/api/materials/:code",
      method: "GET",
      responses: {
        200: materialSchema
      }
    },
    delete: {
      path: "/api/materials/:code",
      method: "DELETE"
    }
  },
  actions: {
    entry: {
      path: "/api/actions/entry",
      method: "POST",
      input: z.object({
        materialCode: z.string().min(1, "Code required"),
        quantity: z.number().min(1, "Quantity must be > 0"),
        rack: z.string().min(1, "Rack required"),
        bin: z.string().min(1, "Bin required"),
        enteredBy: z.string().min(1, "Name required"),
      })
    },
    issue: {
      path: "/api/actions/issue",
      method: "POST",
      input: z.object({
        materialCode: z.string().min(1, "Code required"),
        quantity: z.number().min(1, "Quantity must be > 0"),
        rack: z.string().min(1, "Rack required"),
        bin: z.string().min(1, "Bin required"),
        issuedBy: z.string().min(1, "Name required"),
      })
    }
  },
  logs: {
    list: {
      path: "/api/logs",
      method: "GET",
      responses: {
        200: z.array(logSchema)
      }
    }
  },
  stats: {
    get: {
      path: "/api/stats",
      method: "GET",
      responses: {
        200: statsSchema
      }
    }
  }
};

export function buildUrl(path: string, params: Record<string, string>) {
  let url = path;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  }
  return url;
}
