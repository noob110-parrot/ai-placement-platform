"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit, LayoutDashboard, Briefcase, Clock,
  Megaphone, Bell, BarChart3, Settings, LogOut,
  Users, FileText, Workflow, ChevronRight, Trophy, Target
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",        href: "/dashboard",                badge: null },
  { icon: Users,           label: "Students",        href: "/dashboard/students",       badge: null },
  { icon: Briefcase,       label: "Applications",    href: "/dashboard/applications",   badge: "12" },
  { icon: Clock,           label: "Deadlines",       href: "/dashboard/deadlines",      badge: "3"  },
  { icon: Briefcase,       label: "Job Matches",     href: "/dashboard/jobs",           badge: null },
  { icon: Target,          label: "Skill Gap",       href: "/dashboard/skill-gap",      badge: null },
  { icon: Trophy,          label: "Placed Students", href: "/dashboard/tracker",        badge: null },
  { icon: Megaphone,       label: "Notices",         href: "/dashboard/notices",        badge: null },
  { icon: Bell,            label: "Notifications",   href: "/dashboard/notifications",  badge: "5"  },
  { icon: FileText,        label: "Resume Parser",   href: "/dashboard/resume",         badge: null },
  { icon: BarChart3,       label: "Analytics",       href: "/dashboard/analytics",      badge: null },
  { icon: Workflow,        label: "n8n Workflows",   href: "/dashboard/workflows",      badge: null },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-surface-DEFAULT overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-surface-border bg-surface-card">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">AI Placement</p>
            <p className="text-text-muted text-xs">Platform v1.0</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group
                  ${active
                    ? "bg-brand-900/60 text-white border border-brand-700/40"
                    : "text-text-muted hover:text-white hover:bg-surface-muted"}`}>
                  <item.icon size={16} className={active ? "text-brand-400" : "group-hover:text-brand-400 transition-colors"} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-brand-700/50 text-brand-300 text-xs font-mono">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight size={13} className="text-brand-400" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-surface-border space-y-0.5">
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-white hover:bg-surface-muted transition-all cursor-pointer">
              <Settings size={16} />
              <span>Settings</span>
            </div>
          </Link>
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-400/5 transition-all cursor-pointer">
              <LogOut size={16} />
              <span>Exit Dashboard</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full">
          {children}
        </motion.div>
      </main>
    </div>
  );
}
