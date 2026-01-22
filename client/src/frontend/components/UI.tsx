import { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

// --- Modern Card ---
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={clsx(
        "bg-card border border-border p-6 shadow-sm rounded-xl",
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
      <h3 className="text-xl font-semibold text-foreground tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

// --- Modern Button ---
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
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-8 text-base",
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

// --- Modern Input ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "focus:border-primary",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

// --- Modern Stats Metric ---
export function StatMetric({ label, value, trend, icon: Icon }: { label: string; value: string | number; trend?: string; icon?: any }) {
  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-primary" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {trend && <span className="text-xs font-medium text-emerald-600">{trend}</span>}
      </div>
    </Card>
  );
}
