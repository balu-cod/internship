import { Link } from "wouter";
import { 
  PackagePlus, 
  PackageMinus, 
  Search, 
  BarChart2, 
  Settings,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const menuItems = [
  { 
    title: "Entry", 
    icon: PackagePlus, 
    path: "/entry", 
    desc: "Register incoming materials",
    color: "text-primary border-primary hover:bg-primary/10"
  },
  { 
    title: "Issue", 
    icon: PackageMinus, 
    path: "/issue", 
    desc: "Disburse materials for production",
    color: "text-accent border-accent hover:bg-accent/10"
  },
  { 
    title: "Search", 
    icon: Search, 
    path: "/search", 
    desc: "Locate inventory items",
    color: "text-foreground border-border hover:border-foreground/50 hover:bg-secondary"
  },
  { 
    title: "Dashboard", 
    icon: BarChart2, 
    path: "/dashboard", 
    desc: "View analytics and logs",
    color: "text-foreground border-border hover:border-foreground/50 hover:bg-secondary"
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 border border-primary/20 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest text-foreground glow-text">
          TRIMS<span className="text-primary">.SYS</span>
        </h1>
        <p className="font-mono text-muted-foreground tracking-wider uppercase text-sm md:text-base">
          Tactical Resource Inventory Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {menuItems.map((item, index) => (
          <Link key={item.path} href={item.path}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "group relative h-48 border-2 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300",
                item.color,
                "hover:-translate-y-1 hover:shadow-lg"
              )}
            >
              <item.icon className="w-12 h-12 stroke-[1.5]" />
              <div className="text-center space-y-1">
                <span className="block text-2xl font-display font-bold uppercase tracking-wider">{item.title}</span>
                <span className="block text-xs font-mono opacity-60 uppercase">{item.desc}</span>
              </div>
              
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
