import { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

// --- Industrial Card ---
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={clsx(
        "bg-card border border-border p-6 relative overflow-hidden group",
        "before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t before:border-l before:border-primary before:opacity-50",
        "after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b after:border-r after:border-primary after:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 border-b border-border/50 pb-4">
      <h3 className="text-2xl font-display font-bold text-foreground uppercase tracking-wider">{title}</h3>
      {subtitle && <p className="text-sm font-mono text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

// --- Industrial Button ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-display font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-12 px-8 text-sm",
    lg: "h-16 px-10 text-base",
  };

  return (
    <button
      ref={ref}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

// --- Industrial Input ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-mono uppercase text-muted-foreground tracking-widest">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          ref={ref}
          className={clsx(
            "w-full bg-background/50 border-2 border-border px-4 py-3 font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors",
            error ? "border-destructive" : "group-hover:border-primary/50",
            className
          )}
          {...props}
        />
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {error && <p className="text-xs text-destructive font-mono">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

// --- Stats Metric ---
export function StatMetric({ label, value, trend, icon: Icon }: { label: string; value: string | number; trend?: string; icon?: any }) {
  return (
    <Card className="flex flex-col justify-between h-full bg-secondary/10">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-mono uppercase text-muted-foreground tracking-widest">{label}</span>
        {Icon && <Icon className="w-5 h-5 text-primary opacity-50" />}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-display font-bold text-foreground glow-text">{value}</span>
        {trend && <span className="text-xs font-mono text-accent mb-2">{trend}</span>}
      </div>
    </Card>
  );
}
