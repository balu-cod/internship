import { z } from "zod";
import { insertMaterialSchema, insertLogSchema, materials, logs } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
};

export const api = {
  materials: {
    list: {
      method: "GET" as const,
      path: "/api/materials",
      input: z.object({
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof materials.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/materials/:code",
      responses: {
        200: z.custom<typeof materials.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  actions: {
    entry: {
      method: "POST" as const,
      path: "/api/actions/entry",
      input: z.object({
        materialCode: z.string().min(1, "Material Code is required"),
        quantity: z.number().positive("Quantity must be positive"),
        rack: z.string().min(1, "Rack is required"),
        bin: z.string().min(1, "Bin is required"),
      }),
      responses: {
        200: z.custom<typeof materials.$inferSelect>(), // Returns updated material
        201: z.custom<typeof materials.$inferSelect>(), // Returns new material
        400: errorSchemas.validation,
      },
    },
    issue: {
      method: "POST" as const,
      path: "/api/actions/issue",
      input: z.object({
        materialCode: z.string().min(1, "Material Code is required"),
        quantity: z.number().positive("Quantity must be positive"),
        rack: z.string().min(1, "Rack is required"), // Validation: Must match stored location
        bin: z.string().min(1, "Bin is required"),   // Validation: Must match stored location
        issuedBy: z.string().min(1, "Issued Person Name is required"),
      }),
      responses: {
        200: z.custom<typeof materials.$inferSelect>(),
        400: errorSchemas.validation, // Insufficient stock or wrong location
        404: errorSchemas.notFound,
      },
    },
  },
  logs: {
    list: {
      method: "GET" as const,
      path: "/api/logs",
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
  },
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats",
      responses: {
        200: z.object({
          totalMaterials: z.number(),
          enteredToday: z.number(),
          issuedToday: z.number(),
          recentLogs: z.array(z.custom<typeof logs.$inferSelect>()),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
