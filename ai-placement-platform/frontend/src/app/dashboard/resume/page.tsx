"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText, Upload, Sparkles, Loader2, CheckCircle2,
  User, Mail, Phone, Code2, GraduationCap, Briefcase,
  Award, Target, X, FileUp, BarChart3
} from "lucide-react";

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: { degree: string; institution: string; year: string; cgpa?: string }[];
  experience: { company: string; role: string; duration: string }[];
  certifications: string[];
  score: number;
  gap_skills: string[];
}

const DEMO_RESULT: ParsedResume = {
  name: "Aryan Mehta",
  email: "aryan.mehta2024@gmail.com",
  phone: "+91 98765 43210",
  skills: ["Python", "React", "FastAPI", "PostgreSQL", "Machine Learning", "Docker", "Git", "REST APIs"],
  education: [{ degree: "B.Tech Computer Science", institution: "VIT University", year: "2021–2025", cgpa: "8.4" }],
  experience: [{ company: "Startup XYZ", role: "Backend Intern", duration: "Jun–Aug 2024" }],
  certifications: ["AWS Cloud Practitioner", "Google Data Analytics"],
  score: 74,
  gap_skills: ["System Design", "Kubernetes", "GraphQL"],
};

function ScoreRing({ score }: { score: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#2a2a45" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{score}</span>
        <span className="text-text-muted text-xs">/ 100</span>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile]         = useState<File | null>(null);
  const [parsing, setParsing]   = useState(false);
  const [result, setResult]     = useState<ParsedResume | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      toast.error("Only PDF and DOCX files supported");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const parse = async () => {
    if (!file) return;
    setParsing(true);
    // Simulated — in prod: const formData = new FormData(); formData.append("file", file); await api.post("/resume/parse", formData)
    await new Promise((r) => setTimeout(r, 2800));
    setResult(DEMO_RESULT);
    setParsing(false);
    toast.success("Resume parsed successfully!", { description: `${DEMO_RESULT.skills.length} skills extracted · Score: ${DEMO_RESULT.score}/100` });
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Resume Parser</h1>
        <p className="text-text-muted text-sm mt-0.5">Upload a PDF or DOCX — AI extracts skills, experience, and scores fit for open roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upload area */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
              ${dragging ? "border-brand-500 bg-brand-900/20" : file ? "border-emerald-500/50 bg-emerald-900/10" : "border-surface-border hover:border-brand-500/50 hover:bg-surface-muted/30"}`}>
            <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {file ? (
              <div className="space-y-2">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-text-muted text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                  className="text-text-muted hover:text-red-400 text-xs flex items-center gap-1 mx-auto transition-colors">
                  <X size={11} /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <FileUp size={36} className="text-text-muted mx-auto" />
                <div>
                  <p className="text-white font-medium">Drop resume here or click to browse</p>
                  <p className="text-text-muted text-sm mt-1">PDF or DOCX · Max 5MB</p>
                </div>
              </div>
            )}
          </div>

          {file && (
            <button onClick={parse} disabled={parsing}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {parsing ? <><Loader2 size={16} className="animate-spin" /> Parsing with AI…</> : <><Sparkles size={16} /> Parse Resume</>}
            </button>
          )}

          {/* What the parser extracts */}
          <div className="glass rounded-xl p-5">
            <p className="text-white text-sm font-semibold mb-3">What gets extracted</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
              {[
                [User, "Personal info"],
                [Code2, "Technical skills"],
                [GraduationCap, "Education"],
                [Briefcase, "Experience"],
                [Award, "Certifications"],
                [Target, "Fit score (0–100)"],
              ].map(([Icon, label]: any) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={12} className="text-brand-400" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result panel */}
        <AnimatePresence mode="wait">
          {!result && !parsing && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-surface-border">
              <FileText size={36} className="text-text-muted/40 mb-3" />
              <p className="text-text-muted text-sm">Parsed resume data will appear here</p>
            </motion.div>
          )}

          {parsing && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={36} className="text-brand-400 animate-spin" />
              <div>
                <p className="text-white font-medium">Analyzing resume…</p>
                <p className="text-text-muted text-sm mt-1">spaCy NLP + GPT extraction</p>
              </div>
              <div className="w-full space-y-2 text-xs text-left">
                {["Extracting text from PDF…", "Running spaCy NER pipeline…", "Identifying skills & experience…", "Computing fit score…"].map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-2 text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" /> {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Score */}
              <div className="text-center">
                <ScoreRing score={result.score} />
                <p className="text-text-muted text-xs mt-2">Resume Fit Score</p>
              </div>

              {/* Info sections */}
              {[
                { icon: User,         label: "Extracted Info",    content: (
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p><span className="text-text-muted">Name:</span> {result.name}</p>
                    <p><span className="text-text-muted">Email:</span> {result.email}</p>
                    <p><span className="text-text-muted">Phone:</span> {result.phone}</p>
                  </div>
                )},
                { icon: Code2,        label: `Skills (${result.skills.length})`, content: (
                  <div className="flex flex-wrap gap-1.5">
                    {result.skills.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-lg bg-brand-900/50 border border-brand-700/40 text-brand-300">{s}</span>)}
                  </div>
                )},
                { icon: GraduationCap, label: "Education", content: (
                  <div className="space-y-1">
                    {result.education.map((e, i) => (
                      <p key={i} className="text-sm text-text-secondary">{e.degree} · {e.institution} · CGPA {e.cgpa}</p>
                    ))}
                  </div>
                )},
                { icon: Target,       label: "Skill Gaps",       content: (
                  <div className="flex flex-wrap gap-1.5">
                    {result.gap_skills.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-lg bg-red-900/30 border border-red-700/30 text-red-300">{s}</span>)}
                  </div>
                )},
              ].map(({ icon: Icon, label, content }) => (
                <div key={label}>
                  <p className="text-white text-xs font-semibold flex items-center gap-1.5 mb-2">
                    <Icon size={12} className="text-brand-400" /> {label}
                  </p>
                  {content}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
