import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, Button } from "../components/UI";
import { ShieldAlert, RotateCcw, History, AlertTriangle, LogOut, QrCode } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RackQRCode } from "../components/RackQRCode";
import { useMaterials } from "../hooks/use-inventory";

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showQRs, setShowQRs] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: materials } = useMaterials();

  // Group materials by Rack and Bin
  const rackBinGroups = materials ? materials.reduce((acc, material) => {
    const key = `${material.rack}-${material.bin}`;
    if (!acc[key]) acc[key] = { rack: material.rack, bin: material.bin, materials: [] };
    acc[key].materials.push(material);
    return acc;
  }, {} as Record<string, { rack: string, bin: string, materials: any[] }>) : {};

  const sortedKeys = Object.keys(rackBinGroups).sort();

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
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* QR Codes Section - Main Interface */}
      <Card id="qr-codes" className="border-primary/20 bg-primary/5">
        <div className="p-6 flex justify-between items-center">
          <CardHeader 
            title="Zone QR Codes" 
            subtitle="Identification tags for inventory racks." 
          />
          <div className="flex gap-2">
            <Button 
              variant={showQRs ? "secondary" : "primary"}
              onClick={() => setShowQRs(!showQRs)}
              className="gap-2"
            >
              <QrCode className="w-4 h-4" /> {showQRs ? "Hide" : "Display All"}
            </Button>
            {showQRs && sortedKeys.length > 0 && (
              <Button variant="outline" onClick={() => window.print()} className="hidden sm:flex gap-2">
                Print
              </Button>
            )}
          </div>
        </div>
        
        {showQRs && (
          <div className="p-6 pt-0">
            {sortedKeys.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedKeys.map(key => (
                  <RackQRCode 
                    key={key} 
                    rack={rackBinGroups[key].rack} 
                    bin={rackBinGroups[key].bin} 
                    materials={rackBinGroups[key].materials} 
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded text-muted-foreground uppercase font-mono text-xs">
                No inventory data available to generate QR codes.
              </div>
            )}
            <div className="mt-8 p-4 bg-secondary/20 border border-dashed border-border rounded text-center">
              <p className="text-xs font-mono text-muted-foreground uppercase">
                Dynamic QR codes generated per specific section (Rack-Bin). Scanning a code provides full visibility and access to assets in that specific area.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
