import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, Input, Button } from "../components/UI";
import { ShieldAlert, Loader2, Lock } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded as requested
    if (username === "admin" && password === "12345") {
      localStorage.setItem("admin_auth", "true");
      toast({
        title: "Access Granted",
        description: "Welcome, Administrator.",
      });
      // Redirect based on where they were trying to go
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/admin/dashboard";
      setLocation(redirectTo);
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md border-destructive/30">
        <CardHeader 
          title="Security Clearance" 
          subtitle="Restricted Area: Administrator Authentication Required" 
        />
        <form onSubmit={handleLogin} className="p-6 pt-0 space-y-4">
          <div className="flex justify-center py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-full">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <Input 
            label="Ident-Code"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input 
            label="Pass-Key"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            className="w-full bg-destructive hover:bg-destructive/90 text-white gap-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            Authenticate
          </Button>
        </form>
      </Card>
    </div>
  );
}
