"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, Sparkles, MapPin, Clock, TrendingUp,
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  ExternalLink, Search, Filter, RefreshCw, Building2
} from "lucide-react";
import { Badge } from "@/components/ui";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  application_url: string;
  deadline: string | null;
}

const DEMO_JOBS: Job[] = [
  { id:"1", title:"Software Engineer Intern", company:"Google India",    location:"Hyderabad",   job_type:"internship", salary_range:"₹80k/mo", match_score:88, matched_skills:["Python","React","SQL"],                missing_skills:["Kubernetes"],              application_url:"https://careers.google.com",  deadline:"2026-03-25" },
  { id:"2", title:"SDE Intern",               company:"Microsoft",       location:"Bengaluru",   job_type:"internship", salary_range:"₹90k/mo", match_score:76, matched_skills:["Python","SQL"],                         missing_skills:["C++","System Design"],      application_url:"https://careers.microsoft.com",deadline:"2026-03-28" },
  { id:"3", title:"Backend Engineer",         company:"Razorpay",        location:"Bengaluru",   job_type:"full-time",  salary_range:"₹18–24 LPA",match_score:72,matched_skills:["Python","FastAPI","PostgreSQL"],       missing_skills:["Go","Redis"],               application_url:"https://razorpay.com/jobs",   deadline:"2026-04-05" },
  { id:"4", title:"Full Stack Developer",     company:"Flipkart",        location:"Bengaluru",   job_type:"full-time",  salary_range:"₹14–20 LPA",match_score:68,matched_skills:["React","SQL"],                        missing_skills:["Node.js","AWS"],            application_url:"https://careers.flipkart.com",deadline:"2026-03-30" },
  { id:"5", title:"ML Engineer",              company:"CRED",            location:"Bengaluru",   job_type:"full-time",  salary_range:"₹20–28 LPA",match_score:62,matched_skills:["Python","Machine Learning"],           missing_skills:["TensorFlow","PyTorch","MLOps"],application_url:"https://cred.club/careers",  deadline:"2026-04-10" },
  { id:"6", title:"Data Analyst Intern",      company:"Amazon",          location:"Chennai",     job_type:"internship", salary_range:"₹70k/mo", match_score:58, matched_skills:["SQL","Python"],                         missing_skills:["Tableau","Statistics"],     application_url:"https://amazon.jobs",         deadline:"2026-04-02" },
];

function MatchRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#6366f1" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#2a2a45" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{score}%</span>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs]           = useState<Job[]>(DEMO_JOBS);
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [typeFilter, setType]     = useState("all");

  const filtered = jobs
    .filter((j) => {
      const q = search.toLowerCase();
      return (
        (j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) &&
        (typeFilter === "all" || j.job_type === typeFilter)
      );
    })
    .sort((a, b) => b.match_score - a.match_score);

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Job matches refreshed");
  };

  const daysUntil = (d: string | null) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Job Matches
            <span className="text-sm font-normal text-brand-400 bg-brand-400/10 border border-brand-400/20 px-2.5 py-0.5 rounded-lg">
              AI-Matched
            </span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Ranked by semantic match to your skills · Aryan Mehta</p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 px-4 py-2.5 border border-surface-border text-text-muted hover:text-white rounded-xl text-sm transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Matches
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
            className="w-full bg-surface-card border border-surface-border text-white pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors" />
        </div>
        <div className="flex items-center gap-2">
          {[["all","All"],["internship","Internship"],["full-time","Full-time"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all
                ${typeFilter === v ? "bg-brand-700/50 text-brand-300 border-brand-600/50" : "border-surface-border text-text-muted hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {filtered.map((job, i) => {
          const days = daysUntil(job.deadline);
          const isExpanded = expanded === job.id;
          return (
            <motion.div key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden card-glow">
              {/* Main row */}
              <div className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : job.id)}>
                <MatchRing score={job.match_score} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white font-semibold">{job.title}</p>
                    <Badge variant={job.job_type === "internship" ? "info" : "brand"}>
                      {job.job_type}
                    </Badge>
                    {job.match_score >= 80 && <Badge variant="success">Top Match</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-text-muted text-xs flex-wrap">
                    <span className="flex items-center gap-1"><Building2 size={10} />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                    <span className="font-medium text-text-secondary">{job.salary_range}</span>
                    {days !== null && (
                      <span className={`flex items-center gap-1 font-medium ${days <= 3 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-text-muted"}`}>
                        <Clock size={10} />{days}d left
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {job.application_url && (
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-text-muted hover:text-brand-400 hover:bg-brand-400/10 rounded-lg transition-all">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-5 pb-5 border-t border-surface-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white text-xs font-semibold flex items-center gap-1.5 mb-2">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matched_skills.map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-300">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold flex items-center gap-1.5 mb-2">
                      <XCircle size={12} className="text-amber-400" /> Skill Gap
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.missing_skills.length === 0
                        ? <span className="text-emerald-400 text-xs">No gaps — perfect match!</span>
                        : job.missing_skills.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-lg bg-amber-900/30 border border-amber-700/30 text-amber-300">{s}</span>
                        ))}
                    </div>
                  </div>
                  {job.application_url && (
                    <div className="md:col-span-2">
                      <a href={job.application_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors">
                        Apply Now <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
