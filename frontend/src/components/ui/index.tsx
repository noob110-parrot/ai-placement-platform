/**
 * Reusable UI primitives for AI Placement Platform.
 * Consistent, accessible, dark-themed components.
 */

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

// ── Button ────────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  icon?:     ReactNode;
  iconRight?: ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:   "bg-brand-600 hover:bg-brand-500 text-white border-transparent",
  secondary: "bg-transparent border-surface-border text-text-secondary hover:text-white hover:border-brand-500/50",
  ghost:     "bg-transparent border-transparent text-text-muted hover:text-white hover:bg-surface-muted",
  danger:    "bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/30",
  success:   "bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3.5 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, iconRight, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center font-medium rounded-xl border transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}>
      {loading ? <Loader2 size={size === "sm" ? 13 : size === "lg" ? 18 : 15} className="animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
);
Button.displayName = "Button";

// ── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "brand";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "text-text-muted bg-surface-muted border-surface-border",
  success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  danger:  "text-red-400 bg-red-400/10 border-red-400/20",
  info:    "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  brand:   "text-brand-400 bg-brand-400/10 border-brand-400/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = "default", children, dot, className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border", badgeVariants[variant], className)}>
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full bg-current")} />}
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hoverable, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass rounded-2xl p-6",
        hoverable && "card-glow cursor-pointer",
        className,
      )}>
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?:  string;
  icon?:  ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightElement, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full bg-surface-muted border text-white rounded-xl py-2.5 text-sm placeholder-text-muted",
            "focus:outline-none transition-colors",
            icon ? "pl-9" : "pl-4",
            rightElement ? "pr-10" : "pr-4",
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-surface-border focus:border-brand-500",
            className,
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-text-muted text-xs mt-1">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={clsx("animate-spin text-brand-400", className)} />;
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: any; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-muted" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

export function StatCard({ label, value, change, icon: Icon, color = "brand" }: {
  label: string; value: string | number; change?: string; icon: any; color?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-${color}-400 bg-${color}-400/10`}>
          <Icon size={18} />
        </div>
        {change && <span className="text-xs text-text-muted font-mono">{change}</span>}
      </div>
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-text-muted text-sm">{label}</div>
    </Card>
  );
}
