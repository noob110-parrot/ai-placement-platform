"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Building2, Calendar, Clock, CheckCircle2,
  TrendingUp, Medal, Star, ArrowRight, Users
} from "lucide-react";

interface PlacedStudent {
  id: string;
  name: string;
  roll_no: string;
  department: string;
  company: string;
  role: string;
  package: string;
  offer_date: string;
  joining_date: string;
  type: "full-time" | "internship";
}

const PLACED_STUDENTS: PlacedStudent[] = [
  { id:"1", name:"Priya Sharma",   roll_no:"CS21B023", department:"CSE", company:"Google India",  role:"SWE",              package:"₹28 LPA",   offer_date:"2026-03-01", joining_date:"2026-07-15", type:"full-time"  },
  { id:"2", name:"Ananya Roy",     roll_no:"CS21B019", department:"CSE", company:"Microsoft",      role:"SDE",              package:"₹32 LPA",   offer_date:"2026-02-20", joining_date:"2026-07-01", type:"full-time"  },
  { id:"3", name:"Kavya Nair",     roll_no:"IT21B007", department:"IT",  company:"Flipkart",       role:"Full Stack Dev",   package:"₹22 LPA",   offer_date:"2026-03-10", joining_date:"2026-07-20", type:"full-time"  },
  { id:"4", name:"Raj Kumar",      roll_no:"CS21B041", department:"CSE", company:"Amazon",         role:"SDE Intern",       package:"₹90k/mo",   offer_date:"2026-03-05", joining_date:"2026-05-15", type:"internship" },
  { id:"5", name:"Divya Menon",    roll_no:"EC21B033", department:"ECE", company:"Samsung R&D",    role:"VLSI Design Eng",  package:"₹16 LPA",   offer_date:"2026-02-28", joining_date:"2026-07-10", type:"full-time"  },
  { id:"6", name:"Aditya Joshi",   roll_no:"CS21B060", department:"CSE", company:"Razorpay",       role:"Backend Engineer", package:"₹24 LPA",   offer_date:"2026-03-12", joining_date:"2026-08-01", type:"full-time"  },
];

const COMPANY_COLORS: Record<string, string> = {
  "Google India":  "#6366f1",
  "Microsoft":     "#8b5cf6",
  "Amazon":        "#f59e0b",
  "Flipkart":      "#10b981",
  "Samsung R&D":   "#06b6d4",
  "Razorpay":      "#ec4899",
};

export default function PlacementTrackerPage() {
  const [filter, setFilter] = useState<"all" | "full-time" | "internship">("all");

  const filtered = PLACED_STUDENTS.filter((s) => filter === "all" || s.type === filter);
  const totalPackages  = PLACED_STUDENTS.filter((s) => s.type === "full-time").map((s) => parseFloat(s.package.replace(/[^0-9.]/g, "")));
  const avgPackage     = totalPackages.length ? (totalPackages.reduce((a, b) => a + b, 0) / totalPackages.length).toFixed(1) : "N/A";
  const highestPackage = totalPackages.length ? Math.max(...totalPackages).toFixed(0) : "N/A";

  const byDept = PLACED_STUDENTS.reduce<Record<string, number>>((acc, s) => {
    acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy size={22} className="text-amber-400" /> Placement Tracker
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            Placement Season 2025–26 · {PLACED_STUDENTS.length} students placed
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "full-time", "internship"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize
                ${filter === f ? "bg-brand-700/50 text-brand-300 border-brand-600/50" : "border-surface-border text-text-muted hover:text-white"}`}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users,     label: "Total Placed",    value: PLACED_STUDENTS.length,                               color: "text-brand-400"   },
          { icon: TrendingUp,label: "Avg Package",     value: `₹${avgPackage} LPA`,                                 color: "text-emerald-400" },
          { icon: Medal,     label: "Highest Package", value: `₹${highestPackage} LPA`,                             color: "text-amber-400"   },
          { icon: Star,      label: "Top Recruiter",   value: "Google India",                                        color: "text-violet-400"  },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5">
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Dept breakdown mini-bar */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-sm font-semibold mb-4">Placements by Department</h3>
        <div className="space-y-3">
          {Object.entries(byDept).map(([dept, count]) => (
            <div key={dept} className="flex items-center gap-3">
              <span className="text-text-secondary text-xs w-10">{dept}</span>
              <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / PLACED_STUDENTS.length) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-brand-500 rounded-full"
                />
              </div>
              <span className="text-white text-xs font-mono w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Placed students grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s, i) => {
          const color = COMPANY_COLORS[s.company] || "#6366f1";
          return (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5 card-glow">
              {/* Company badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: color + "25", color }}>
                    {s.company[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.company}</p>
                    <p className="text-text-muted text-xs">{s.role}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${
                  s.type === "full-time"
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    : "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
                }`}>
                  {s.type === "full-time" ? "FT" : "Intern"}
                </span>
              </div>

              {/* Student info */}
              <div className="mb-4">
                <p className="text-white font-medium">{s.name}</p>
                <p className="text-text-muted text-xs">{s.roll_no} · {s.department}</p>
              </div>

              {/* Package & dates */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center gap-1.5"><TrendingUp size={10} /> Package</span>
                  <span className="text-emerald-400 font-bold">{s.package}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center gap-1.5"><CheckCircle2 size={10} /> Offer Date</span>
                  <span className="text-white font-mono">{new Date(s.offer_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center gap-1.5"><Calendar size={10} /> Joining</span>
                  <span className="text-white font-mono">{new Date(s.joining_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
