"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, ChevronDown, ChevronUp,
  GraduationCap, Star, CheckCircle2, XCircle,
  Mail, Phone, Code2, ArrowUpRight, UserPlus,
  BarChart3, Download, RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  roll_no: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year_of_study: number;
  cgpa: number;
  skills: string[];
  placement_score: number;
  is_placed: boolean;
  created_at: string;
}

const DEMO_STUDENTS: Student[] = [
  { id: "1", roll_no: "CS21B047", name: "Aryan Mehta",    email: "aryan.mehta2024@gmail.com",  phone: "+919876543210", department: "CSE", year_of_study: 4, cgpa: 8.4, skills: ["Python","React","SQL","ML"],          placement_score: 67, is_placed: false, created_at: "2026-01-10" },
  { id: "2", roll_no: "CS21B023", name: "Priya Sharma",   email: "priya.sharma2024@gmail.com", phone: "+919876543211", department: "CSE", year_of_study: 4, cgpa: 9.1, skills: ["Java","Spring","AWS","Docker"],        placement_score: 88, is_placed: true,  created_at: "2026-01-11" },
  { id: "3", roll_no: "EC21B014", name: "Rohan Verma",    email: "rohan.verma2024@gmail.com",  phone: "+919876543212", department: "ECE", year_of_study: 4, cgpa: 7.8, skills: ["C++","VLSI","Embedded","Python"],      placement_score: 54, is_placed: false, created_at: "2026-01-12" },
  { id: "4", roll_no: "IT21B031", name: "Sneha Patel",    email: "sneha.patel2024@gmail.com",  phone: "+919876543213", department: "IT",  year_of_study: 4, cgpa: 8.0, skills: ["React","Node.js","MongoDB","TS"],      placement_score: 71, is_placed: false, created_at: "2026-01-13" },
  { id: "5", roll_no: "CS21B055", name: "Vikram Singh",   email: "vikram.singh2024@gmail.com", phone: "+919876543214", department: "CSE", year_of_study: 4, cgpa: 7.5, skills: ["Python","DS","TensorFlow","SQL"],      placement_score: 58, is_placed: false, created_at: "2026-01-14" },
  { id: "6", roll_no: "CS21B019", name: "Ananya Roy",     email: "ananya.roy2024@gmail.com",   phone: "+919876543215", department: "CSE", year_of_study: 4, cgpa: 9.4, skills: ["Go","Rust","Kubernetes","gRPC"],        placement_score: 92, is_placed: true,  created_at: "2026-01-15" },
  { id: "7", roll_no: "EC21B028", name: "Dev Malhotra",   email: "dev.malhotra2024@gmail.com", phone: "+919876543216", department: "ECE", year_of_study: 4, cgpa: 7.2, skills: ["MATLAB","Signal Processing","C"],       placement_score: 42, is_placed: false, created_at: "2026-01-16" },
  { id: "8", roll_no: "IT21B007", name: "Kavya Nair",     email: "kavya.nair2024@gmail.com",   phone: "+919876543217", department: "IT",  year_of_study: 4, cgpa: 8.6, skills: ["Flutter","Dart","Firebase","React"],    placement_score: 76, is_placed: true,  created_at: "2026-01-17" },
];

const DEPT_COLORS: Record<string, string> = {
  CSE: "text-brand-400 bg-brand-400/10 border-brand-400/20",
  ECE: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  IT:  "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  EEE: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const bg    = score >= 80 ? "bg-emerald-400/10 border-emerald-400/20" : score >= 60 ? "bg-amber-400/10 border-amber-400/20" : "bg-red-400/10 border-red-400/20";
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono ${color} ${bg}`}>
      <div className="w-12 h-1.5 bg-surface-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${score}%` }} />
      </div>
      {score}
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents]     = useState<Student[]>(DEMO_STUDENTS);
  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [sortBy, setSortBy]         = useState<"name" | "cgpa" | "score">("score");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        (s.name.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
        (deptFilter === "all" || s.department === deptFilter)
      );
    })
    .sort((a, b) => {
      const key = sortBy === "name" ? "name" : sortBy === "cgpa" ? "cgpa" : "placement_score";
      const v = sortDir === "asc" ? 1 : -1;
      return a[key] > b[key] ? v : -v;
    });

  const toggle = (key: "name" | "cgpa" | "score") => {
    if (sortBy === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: typeof sortBy }) =>
    sortBy === k ? (sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null;

  const placed   = students.filter((s) => s.is_placed).length;
  const avgScore = Math.round(students.reduce((s, st) => s + st.placement_score, 0) / students.length);

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-text-muted text-sm mt-0.5">{students.length} registered · {placed} placed · avg score {avgScore}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="p-2.5 border border-surface-border text-text-muted hover:text-white rounded-xl transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="p-2.5 border border-surface-border text-text-muted hover:text-white rounded-xl transition-colors">
            <Download size={15} />
          </button>
          <Link href="/register"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl transition-colors">
            <UserPlus size={14} /> Register Student
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: students.length,                                           color: "text-white" },
          { label: "Placed",    value: placed,                                                    color: "text-emerald-400" },
          { label: "Unplaced",  value: students.length - placed,                                  color: "text-amber-400" },
          { label: "Avg Score", value: avgScore,                                                   color: "text-brand-400" },
        ].map((c) => (
          <div key={c.label} className="glass rounded-xl p-4">
            <p className={`text-2xl font-extrabold font-mono ${c.color}`}>{c.value}</p>
            <p className="text-text-muted text-xs mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, email…"
            className="w-full bg-surface-card border border-surface-border text-white pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-text-muted" />
          {["all", "CSE", "ECE", "IT", "EEE"].map((d) => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all
                ${deptFilter === d ? "bg-brand-700/50 text-brand-300 border-brand-600/50" : "border-surface-border text-text-muted hover:text-white"}`}>
              {d === "all" ? "All Depts" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-surface-muted border-b border-surface-border text-text-muted text-xs font-medium">
          <div className="col-span-1">Roll No</div>
          <button onClick={() => toggle("name")} className="col-span-3 flex items-center gap-1 hover:text-white transition-colors text-left">
            Name <SortIcon k="name" />
          </button>
          <div className="col-span-2">Department</div>
          <button onClick={() => toggle("cgpa")} className="col-span-1 flex items-center gap-1 hover:text-white transition-colors text-left">
            CGPA <SortIcon k="cgpa" />
          </button>
          <button onClick={() => toggle("score")} className="col-span-2 flex items-center gap-1 hover:text-white transition-colors text-left">
            Readiness <SortIcon k="score" />
          </button>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-surface-border">
          {filtered.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <div
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-surface-muted/40 cursor-pointer transition-colors items-center">
                <div className="col-span-1 text-text-muted text-xs font-mono">{s.roll_no}</div>
                <div className="col-span-3">
                  <p className="text-white text-sm font-medium">{s.name}</p>
                  <p className="text-text-muted text-xs truncate">{s.email}</p>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium border px-2 py-0.5 rounded-lg ${DEPT_COLORS[s.department] || "text-text-muted border-surface-border"}`}>
                    {s.department}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-white font-mono text-sm font-semibold">{s.cgpa}</span>
                </div>
                <div className="col-span-2">
                  <ScoreBadge score={s.placement_score} />
                </div>
                <div className="col-span-2">
                  {s.is_placed ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg w-fit">
                      <CheckCircle2 size={11} /> Placed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg w-fit">
                      <Star size={11} /> Seeking
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronDown size={14} className={`text-text-muted transition-transform ${expanded === s.id ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expanded row */}
              <AnimatePresence>
                {expanded === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-surface-muted/20 border-t border-surface-border">
                    <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-text-muted text-xs mb-2">Contact</p>
                        <div className="space-y-1.5">
                          <p className="text-sm text-text-secondary flex items-center gap-2"><Mail size={12} className="text-brand-400" />{s.email}</p>
                          <p className="text-sm text-text-secondary flex items-center gap-2"><Phone size={12} className="text-brand-400" />{s.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-text-muted text-xs mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.skills.map((sk) => (
                            <span key={sk} className="text-xs px-2 py-0.5 rounded-lg bg-surface-card border border-surface-border text-text-secondary">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-surface-border text-text-muted hover:text-white rounded-xl transition-colors">
                          <BarChart3 size={12} /> View Analytics
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-brand-700/40 border border-brand-600/40 text-brand-300 hover:bg-brand-600/40 rounded-xl transition-colors">
                          <ArrowUpRight size={12} /> Full Profile
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-text-muted text-sm">
            No students match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
