import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  PackagePlus, 
  PackageMinus, 
  Search, 
  BarChart2, 
  LogOut,
  ShieldAlert,
  QrCode
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Button } from "./UI";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check auth status on mount and when location changes
    const checkAuth = () => {
      setIsAdmin(localStorage.getItem("admin_auth") === "true");
    };
    
    checkAuth();
    // Also listen for storage events in case of cross-tab login/logout
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAdmin(false);
    setLocation("/");
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PackagePlus, label: "Entry", path: "/entry" },
    { icon: PackageMinus, label: "Issue", path: "/issue" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: BarChart2, label: "Dashboard", path: "/dashboard" },
    ...(isAdmin ? [{ icon: QrCode, label: "QR Manager", path: "/admin/dashboard" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">TrimsInventory</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className="px-3 py-2 relative group">
                  <div className={clsx(
                    "flex items-center gap-2 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-[-20px] left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <ShieldAlert className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">ADMIN</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-mono uppercase">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden">
        <div className="relative z-10 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col pb-24 md:pb-12">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav (Tablet and Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-t border-border flex items-center justify-around z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} className={clsx(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-mono uppercase">{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-mono uppercase">Logout</span>
          </button>
        )}
      </nav>
    </div>
  );
}
