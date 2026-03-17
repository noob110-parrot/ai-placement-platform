"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Target, Sparkles, Loader2, CheckCircle2, XCircle,
  TrendingUp, BookOpen, ExternalLink, ChevronRight,
  Code2, Plus, X
} from "lucide-react";

interface Recommendation {
  skill: string;
  resource: string;
  platform: string;
  url?: string;
}

interface GapResult {
  readiness_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: Recommendation[];
}

const PLATFORM_COLORS: Record<string, string> = {
  Coursera:   "text-brand-400  bg-brand-400/10  border-brand-400/20",
  YouTube:    "text-red-400    bg-red-400/10    border-red-400/20",
  LeetCode:   "text-amber-400  bg-amber-400/10  border-amber-400/20",
  Udemy:      "text-violet-400 bg-violet-400/10 border-violet-400/20",
  default:    "text-cyan-400   bg-cyan-400/10   border-cyan-400/20",
};

const DEMO_JOBS = [
  { label: "ML Engineer @ CRED",         required: ["Python", "TensorFlow", "PyTorch", "MLOps", "SQL", "Docker"] },
  { label: "SWE Intern @ Google",         required: ["Python", "Algorithms", "Data Structures", "System Design", "Go"] },
  { label: "Full Stack Dev @ Razorpay",   required: ["React", "Node.js", "PostgreSQL", "Redis", "Docker", "TypeScript"] },
  { label: "Data Analyst @ Amazon",       required: ["SQL", "Python", "Tableau", "Statistics", "Power BI"] },
];

const STUDENT_SKILLS = ["Python", "React", "SQL", "Machine Learning", "FastAPI", "Git"];

function ScoreArc({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a45" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white leading-none">{score}</span>
          <span className="text-text-muted text-xs mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

export default function SkillGapPage() {
  const [studentSkills, setStudentSkills] = useState<string[]>(STUDENT_SKILLS);
  const [newSkill, setNewSkill]           = useState("");
  const [selectedJob, setSelectedJob]     = useState(0);
  const [result, setResult]               = useState<GapResult | null>(null);
  const [loading, setLoading]             = useState(false);

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !studentSkills.includes(s)) {
      setStudentSkills((prev) => [...prev, s]);
    }
    setNewSkill("");
  };

  const removeSkill = (s: string) => setStudentSkills((prev) => prev.filter((x) => x !== s));

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      // In prod: const { data } = await api.post("/resume/score", { student_skills: studentSkills, job_skills: required })
      await new Promise((r) => setTimeout(r, 1800));

      const required = DEMO_JOBS[selectedJob].required;
      const matched  = required.filter((r) => studentSkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()));
      const missing  = required.filter((r) => !studentSkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()));
      const score    = Math.round((matched.length / required.length) * 100);

      const demoRecs: Recommendation[] = missing.slice(0, 3).map((skill) => ({
        skill,
        resource:  `${skill} Complete Bootcamp`,
        platform:  ["Coursera", "YouTube", "Udemy", "LeetCode"][Math.floor(Math.random() * 4)],
        url:       "https://coursera.org",
      }));

      setResult({ readiness_score: score, matched_skills: matched, missing_skills: missing, recommendations: demoRecs });
      toast.success(`Analysis complete — ${score}% ready`, { description: `${matched.length}/${required.length} skills matched` });
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Skill Gap Analyzer
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Compare your skills against any job — get a readiness score and personalised learning path
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — inputs */}
        <div className="space-y-5">

          {/* Your skills */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Code2 size={15} className="text-brand-400" /> Your Skills
            </h2>
            <div className="flex flex-wrap gap-2 mb-3 min-h-10">
              {studentSkills.map((s) => (
                <span key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-900/50 border border-brand-700/40 text-brand-300 text-xs font-medium">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill (Enter)"
                className="flex-1 bg-surface-muted border border-surface-border text-white rounded-xl px-3 py-2 text-sm placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button onClick={addSkill}
                className="px-3 py-2 bg-brand-700/50 border border-brand-600/40 text-brand-300 rounded-xl text-sm hover:bg-brand-600/50 transition-colors">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Target job */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Target size={15} className="text-brand-400" /> Target Job
            </h2>
            <div className="space-y-2">
              {DEMO_JOBS.map((j, i) => (
                <button key={i} onClick={() => setSelectedJob(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
                    ${selectedJob === i
                      ? "bg-brand-900/50 border-brand-600/50 text-white"
                      : "border-surface-border text-text-secondary hover:border-brand-500/40 hover:text-white"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{j.label}</span>
                    {selectedJob === i && <ChevronRight size={14} className="text-brand-400" />}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{j.required.join(", ")}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={analyze} disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400
              text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
              : <><Sparkles size={16} /> Analyze Skill Gap</>}
          </button>
        </div>

        {/* Right — results */}
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-surface-border">
              <Target size={36} className="text-text-muted/30 mb-3" />
              <p className="text-text-muted text-sm">Select a job and click Analyze</p>
              <p className="text-text-muted text-xs mt-1">Results will appear here</p>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={36} className="text-brand-400 animate-spin" />
              <div className="text-center">
                <p className="text-white font-medium">Running semantic analysis…</p>
                <p className="text-text-muted text-sm mt-1">Sentence Transformers + GPT recommendations</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6 overflow-y-auto max-h-[75vh]">

              {/* Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Readiness Score</h3>
                  <p className="text-text-muted text-xs mt-0.5">{DEMO_JOBS[selectedJob].label}</p>
                </div>
                <ScoreArc score={result.readiness_score} />
              </div>

              {/* Matched */}
              <div>
                <p className="text-white text-xs font-semibold flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  Matched Skills ({result.matched_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_skills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-300">{s}</span>
                  ))}
                  {result.matched_skills.length === 0 && (
                    <span className="text-text-muted text-xs">None matched</span>
                  )}
                </div>
              </div>

              {/* Missing */}
              {result.missing_skills.length > 0 && (
                <div>
                  <p className="text-white text-xs font-semibold flex items-center gap-1.5 mb-2">
                    <XCircle size={12} className="text-red-400" />
                    Skill Gaps ({result.missing_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_skills.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-red-900/30 border border-red-700/30 text-red-300">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning path */}
              {result.recommendations.length > 0 && (
                <div>
                  <p className="text-white text-xs font-semibold flex items-center gap-1.5 mb-3">
                    <BookOpen size={12} className="text-brand-400" />
                    Recommended Learning Path
                  </p>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, i) => {
                      const pc = PLATFORM_COLORS[rec.platform] || PLATFORM_COLORS.default;
                      return (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-surface-muted rounded-xl border border-surface-border">
                          <div className="w-6 h-6 rounded-lg bg-brand-700/40 flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={11} className="text-brand-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{rec.resource}</p>
                            <p className="text-text-muted text-xs">for <span className="text-brand-300">{rec.skill}</span></p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${pc}`}>{rec.platform}</span>
                            {rec.url && (
                              <a href={rec.url} target="_blank" rel="noopener noreferrer"
                                className="text-text-muted hover:text-brand-400 transition-colors">
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
