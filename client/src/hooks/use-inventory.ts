import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Types derived from schema via api
type Material = z.infer<typeof api.materials.list.responses[200]>[number];
type EntryInput = z.infer<typeof api.actions.entry.input>;
type IssueInput = z.infer<typeof api.actions.issue.input>;

export function useMaterials(search?: string) {
  return useQuery({
    queryKey: [api.materials.list.path, search],
    queryFn: async () => {
      const url = search 
        ? `${api.materials.list.path}?search=${encodeURIComponent(search)}` 
        : api.materials.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch materials");
      return api.materials.list.responses[200].parse(await res.json());
    },
  });
}

export function useMaterial(code: string) {
  return useQuery({
    queryKey: [api.materials.get.path, code],
    queryFn: async () => {
      const url = buildUrl(api.materials.get.path, { code });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch material");
      return api.materials.get.responses[200].parse(await res.json());
    },
    enabled: !!code,
  });
}

export function useMaterialAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const entryMutation = useMutation({
    mutationFn: async (data: EntryInput) => {
      // Validate client-side before sending
      const validated = api.actions.entry.input.parse(data);
      
      const res = await fetch(api.actions.entry.path, {
        method: api.actions.entry.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Entry failed");
      }
      return await res.json(); // Returning Material type
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.materials.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      toast({
        title: "Material Entered",
        description: `Added ${data.quantity} units to ${data.code}`,
        className: "border-primary text-primary-foreground bg-secondary",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Entry Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const issueMutation = useMutation({
    mutationFn: async (data: IssueInput) => {
      const validated = api.actions.issue.input.parse(data);
      
      const res = await fetch(api.actions.issue.path, {
        method: api.actions.issue.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Issue failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.materials.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      toast({
        title: "Material Issued",
        description: `Issued units from ${data.code}. Remaining: ${data.quantity}`,
        className: "border-accent text-accent-foreground bg-secondary",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Issue Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { entry: entryMutation, issue: issueMutation };
}

export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}
