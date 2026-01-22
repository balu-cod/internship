import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, Button } from "@/components/UI";
import { ShieldAlert, RotateCcw, History, AlertTriangle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth !== "true") {
      setLocation("/admin");
    } else {
      setIsAuthorized(true);
    }
  }, [setLocation]);

  const handleAction = async (path: string, method: string, label: string) => {
    if (!confirm(`Are you sure you want to perform: ${label}? This action is destructive.`)) return;

    try {
      const res = await fetch(path, { method });
      if (!res.ok) throw new Error("Action failed");
      
      toast({
        title: "Success",
        description: `${label} completed successfully.`,
      });

      queryClient.invalidateQueries();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to perform administrative action.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setLocation("/");
  };

  if (!isAuthorized) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-4 sm:px-0">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div className="flex items-center gap-3 text-primary">
          <ShieldAlert className="w-8 h-8" />
          <h1 className="text-3xl font-display font-bold uppercase tracking-tighter">System Administration</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader title="Maintenance" subtitle="System maintenance and data management." />
          <div className="p-6 pt-0 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-secondary border border-border text-xs font-mono uppercase text-muted-foreground">
              <AlertTriangle className="w-4 h-4 shrink-0 text-primary" />
              <span>System maintenance operations for authorized administrators.</span>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 border-border hover:bg-primary hover:text-black transition-colors"
              onClick={() => handleAction("/api/materials/reset", "POST", "Reset Inventory Count")}
            >
              <RotateCcw className="w-4 h-4" /> Reset All Quantities
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 border-border hover:bg-primary hover:text-black transition-colors"
              onClick={() => handleAction("/api/logs", "DELETE", "Clear Audit Logs")}
            >
              <History className="w-4 h-4" /> Clear Activity History
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="System Status" subtitle="Live environment metrics." />
          <div className="p-6 pt-0 space-y-2 font-mono text-xs text-muted-foreground uppercase">
            <div className="flex justify-between border-b border-border pb-2">
              <span>Core Status</span>
              <span className="text-primary font-bold">Operational</span>
            </div>
            <div className="flex justify-between border-b border-border py-2">
              <span>Database</span>
              <span>PostgreSQL / Drizzle</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Environment</span>
              <span>Production-Node</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
