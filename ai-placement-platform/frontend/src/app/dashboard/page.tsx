"use client";

import { motion } from "framer-motion";
import {
  Users, Briefcase, Clock, CheckCircle2, TrendingUp,
  Bell, Zap, ArrowUpRight, Activity, Award
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const placementData = [
  { month: "Oct", placed: 4,  applications: 18 },
  { month: "Nov", placed: 9,  applications: 32 },
  { month: "Dec", placed: 14, applications: 45 },
  { month: "Jan", placed: 22, applications: 67 },
  { month: "Feb", placed: 31, applications: 89 },
  { month: "Mar", placed: 38, applications: 102 },
];

const stats = [
  { label: "Total Students",   value: "142",  change: "+12",  icon: Users,        color: "brand"   },
  { label: "Applications",     value: "847",  change: "+54",  icon: Briefcase,    color: "violet"  },
  { label: "Upcoming Deadlines",value: "3",   change: "urgent",icon: Clock,       color: "amber"   },
  { label: "Students Placed",  value: "38",   change: "26.7%",icon: CheckCircle2, color: "emerald" },
];

const recentActivity = [
  { type: "whatsapp", text: "Deadline alert sent to Aryan Mehta", time: "18s ago", color: "emerald" },
  { type: "calendar", text: "Google Calendar event created: Google India", time: "21s ago", color: "brand" },
  { type: "notice",   text: "TCS NQT notice broadcast to 142 students", time: "4m ago", color: "violet" },
  { type: "match",    text: "Job match: 3 new roles for CSE students", time: "12m ago", color: "cyan" },
  { type: "register", text: "New student registered: Priya Sharma", time: "1h ago", color: "emerald" },
];

const colorMap: any = {
  brand:   "text-brand-400 bg-brand-400/10",
  violet:  "text-violet-400 bg-violet-400/10",
  amber:   "text-amber-400 bg-amber-400/10",
  emerald: "text-emerald-400 bg-emerald-400/10",
  cyan:    "text-cyan-400 bg-cyan-400/10",
};

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Placement Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">
            17 March 2026 · Placement Season Active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All systems live
          </span>
          <Link href="/register"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            + Register Student
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5 card-glow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                <s.icon size={18} />
              </div>
              <span className="text-xs text-text-muted font-mono">{s.change}</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
            <div className="text-text-muted text-sm">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white">Placement Progress</h2>
              <p className="text-text-muted text-xs mt-0.5">Applications vs Placements</p>
            </div>
            <TrendingUp size={18} className="text-brand-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={placementData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#16162a", border: "1px solid #2a2a45", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="applications" stroke="#6366f1" fill="url(#grad1)" strokeWidth={2} />
              <Area type="monotone" dataKey="placed" stroke="#10b981" fill="url(#grad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Live Activity</h2>
            <Activity size={16} className="text-brand-400 animate-pulse" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${colorMap[a.color].split(" ")[0].replace("text-", "bg-")}`} />
                <div>
                  <p className="text-sm text-text-secondary leading-snug">{a.text}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Add Deadline",      href: "/dashboard/deadlines",   icon: Clock,    desc: "Feature 34" },
          { label: "Paste Notice",      href: "/dashboard/notices",     icon: Bell,     desc: "Feature 36" },
          { label: "View Workflows",    href: "/dashboard/workflows",   icon: Zap,      desc: "Feature 37" },
          { label: "View Analytics",   href: "/dashboard/analytics",   icon: Award,    desc: "Feature 38" },
        ].map((a, i) => (
          <Link key={i} href={a.href}>
            <div className="glass rounded-xl p-4 card-glow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <a.icon size={18} className="text-brand-400" />
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-brand-400 transition-colors" />
              </div>
              <p className="text-white text-sm font-medium">{a.label}</p>
              <p className="text-text-muted text-xs">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
