"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, Plus, GripVertical, Clock, Star,
  CheckCircle2, XCircle, AlertCircle, Building2,
  ChevronRight, Trash2, ExternalLink, Filter
} from "lucide-react";
import { toast } from "sonner";

type Status = "saved" | "applied" | "oa" | "interview" | "offered" | "rejected";

interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  applied_at?: string;
  match_score?: number;
  priority?: "low" | "normal" | "high";
  logo_color: string;
  notes?: string;
}

const COLUMNS: { key: Status; label: string; color: string; icon: any }[] = [
  { key: "saved",     label: "Saved",     color: "text-slate-400",   icon: Star         },
  { key: "applied",   label: "Applied",   color: "text-brand-400",   icon: Briefcase    },
  { key: "oa",        label: "OA Round",  color: "text-amber-400",   icon: AlertCircle  },
  { key: "interview", label: "Interview", color: "text-violet-400",  icon: ChevronRight },
  { key: "offered",   label: "Offered 🎉",color: "text-emerald-400", icon: CheckCircle2 },
  { key: "rejected",  label: "Rejected",  color: "text-red-400",     icon: XCircle      },
];

const LOGO_COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#14b8a6"];

const DEMO_APPS: Application[] = [
  { id:"1", company:"Google India",  role:"SWE Intern",        status:"applied",   applied_at:"2026-03-10", match_score:88, priority:"high",   logo_color:"#6366f1" },
  { id:"2", company:"Microsoft",     role:"SDE Intern",        status:"oa",        applied_at:"2026-03-05", match_score:76, priority:"high",   logo_color:"#8b5cf6" },
  { id:"3", company:"Amazon",        role:"SDE-I",             status:"interview", applied_at:"2026-02-28", match_score:72, priority:"normal", logo_color:"#f59e0b" },
  { id:"4", company:"Flipkart",      role:"Full Stack Dev",    status:"offered",   applied_at:"2026-02-20", match_score:91, priority:"high",   logo_color:"#10b981" },
  { id:"5", company:"Infosys",       role:"Systems Engineer",  status:"saved",                              match_score:55, priority:"low",    logo_color:"#06b6d4" },
  { id:"6", company:"Wipro",         role:"Project Engineer",  status:"saved",                              match_score:48, priority:"low",    logo_color:"#ec4899" },
  { id:"7", company:"TCS",           role:"ASE",               status:"applied",   applied_at:"2026-03-12", match_score:60, priority:"normal", logo_color:"#14b8a6" },
  { id:"8", company:"Razorpay",      role:"Backend Engineer",  status:"rejected",  applied_at:"2026-03-01", match_score:69, priority:"normal", logo_color:"#ef4444" },
];

function AppCard({ app, onMove }: { app: Application; onMove: (id: string, status: Status) => void }) {
  const nextStatus: Partial<Record<Status, Status>> = {
    saved: "applied", applied: "oa", oa: "interview", interview: "offered",
  };

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-card border border-surface-border rounded-xl p-3.5 group hover:border-brand-500/30 transition-all cursor-default">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: app.logo_color + "30", color: app.logo_color }}>
            {app.company[0]}
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-tight">{app.company}</p>
            <p className="text-text-muted text-xs">{app.role}</p>
          </div>
        </div>
        <GripVertical size={13} className="text-surface-border group-hover:text-text-muted transition-colors mt-0.5 flex-shrink-0" />
      </div>

      {app.match_score !== undefined && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1 bg-surface-border rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${app.match_score}%` }} />
          </div>
          <span className="text-xs text-text-muted font-mono">{app.match_score}%</span>
        </div>
      )}

      {app.applied_at && (
        <p className="text-text-muted text-xs flex items-center gap-1 mb-2">
          <Clock size={10} /> {new Date(app.applied_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
        </p>
      )}

      {nextStatus[app.status] && (
        <button
          onClick={() => onMove(app.id, nextStatus[app.status]!)}
          className="w-full text-xs py-1.5 border border-surface-border text-text-muted hover:text-brand-300 hover:border-brand-500/30 rounded-lg transition-all mt-1 opacity-0 group-hover:opacity-100">
          Move to {nextStatus[app.status]} →
        </button>
      )}
    </motion.div>
  );
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(DEMO_APPS);
  const [showAdd, setShowAdd] = useState(false);
  const [newApp, setNewApp] = useState({ company: "", role: "" });

  const moveApp = (id: string, status: Status) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    toast.success(`Moved to ${status}`);
  };

  const addApp = () => {
    if (!newApp.company || !newApp.role) return;
    setApps((prev) => [...prev, {
      id: Date.now().toString(),
      company: newApp.company, role: newApp.role,
      status: "saved", match_score: Math.floor(Math.random() * 40 + 50),
      logo_color: LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)],
    }]);
    setNewApp({ company: "", role: "" });
    setShowAdd(false);
    toast.success("Application added to pipeline");
  };

  const byStatus = (s: Status) => apps.filter((a) => a.status === s);

  return (
    <div className="p-8 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Application Tracker</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {apps.length} total · {byStatus("offered").length} offers · {byStatus("interview").length} in interview
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={14} /> Add Application
        </button>
      </div>

      {/* Quick add */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <Building2 size={16} className="text-brand-400 flex-shrink-0" />
          <input value={newApp.company} onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
            placeholder="Company name"
            className="bg-surface-muted border border-surface-border text-white px-3 py-2 rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors w-40" />
          <input value={newApp.role} onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
            placeholder="Role / position"
            className="bg-surface-muted border border-surface-border text-white px-3 py-2 rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors w-48" />
          <button onClick={addApp}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-xl transition-colors">
            Add
          </button>
          <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-surface-border text-text-muted hover:text-white text-sm rounded-xl transition-colors">
            Cancel
          </button>
        </motion.div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = byStatus(col.key);
          return (
            <div key={col.key} className="flex-shrink-0 w-52">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <col.icon size={13} className={col.color} />
                  <span className="text-white text-xs font-semibold">{col.label}</span>
                </div>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${col.color} bg-current/10`} style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-24 bg-surface-muted/30 rounded-xl p-2 border border-surface-border/50">
                {colApps.map((app) => (
                  <AppCard key={app.id} app={app} onMove={moveApp} />
                ))}
                {colApps.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-text-muted text-xs opacity-50">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
