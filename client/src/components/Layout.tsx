import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  PackagePlus, 
  PackageMinus, 
  Search, 
  BarChart2, 
  LogOut,
  ShieldAlert
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
    { icon: BarChart2, label: "Stats", path: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation Bar (Always Visible) */}
      <header className="h-20 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <span className="font-display font-bold text-xl tracking-wider text-primary hidden sm:block">TRIMS.SYS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className="px-4 py-2 relative group">
                  <div className={clsx(
                    "flex items-center gap-2 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-tight">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-[-24px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(250,204,21,0.5)]"
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
                variant="ghost" 
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
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20 scanlines z-0" />
        
        <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-[calc(100vh-5rem)] flex flex-col pb-24 md:pb-12">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
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
