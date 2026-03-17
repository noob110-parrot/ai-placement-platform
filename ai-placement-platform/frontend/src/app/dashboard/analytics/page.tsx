"use client";

import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, Brain, Mic,
  Search, Map, Sparkles, ArrowRight, Lock,
  Users, Award, CheckCircle2, Lightbulb
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell
} from "recharts";

const radarData = [
  { subject: "CGPA",          A: 84, fullMark: 100 },
  { subject: "Skills",        A: 70, fullMark: 100 },
  { subject: "Applications",  A: 60, fullMark: 100 },
  { subject: "Interviews",    A: 45, fullMark: 100 },
  { subject: "Certs",         A: 40, fullMark: 100 },
  { subject: "Projects",      A: 75, fullMark: 100 },
];

const deptData = [
  { dept: "CSE",   placed: 18, total: 42, color: "#6366f1" },
  { dept: "ECE",   placed: 12, total: 35, color: "#8b5cf6" },
  { dept: "IT",    placed: 8,  total: 28, color: "#06b6d4" },
  { dept: "EEE",   placed: 0,  total: 20, color: "#f59e0b" },
  { dept: "MECH",  placed: 0,  total: 17, color: "#ef4444" },
];

const futureFeatures = [
  {
    icon: Target,
    title: "Placement Readiness Score (PRS)",
    tag: "High Impact",
    tagColor: "text-brand-400 bg-brand-400/10 border-brand-400/20",
    desc: "A dynamic 0–100 score computed from CGPA, applied companies, interviews cleared, skill certifications, and mock test performance. Updates in real time. Coordinators can identify at-risk students weeks before the season ends — enabling proactive intervention instead of reactive panic.",
    effort: "~2 weeks",
    impact: "Very High",
  },
  {
    icon: Mic,
    title: "Mock Interview AI",
    tag: "Student Favourite",
    tagColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    desc: "LLM-powered conversational interviewer simulating technical and HR rounds for specific companies. Evaluates answers on a rubric, scores communication clarity, and delivers written feedback reports. Closes the loop between knowing you need to prepare and being able to practice anywhere, anytime.",
    effort: "~3 weeks",
    impact: "Very High",
  },
  {
    icon: Search,
    title: "Recruiter Finder System",
    tag: "Career Accelerator",
    tagColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    desc: "Integrates with LinkedIn and company portals to surface relevant recruiters for each student's target companies. Drafts personalized cold-connect messages using the student's profile, suggests optimal outreach timing, and tracks connection status. Transforms the platform from passive tracker to active career accelerator.",
    effort: "~4 weeks",
    impact: "High",
  },
  {
    icon: Map,
    title: "Skill Gap Analyzer with Learning Pathways",
    tag: "AI-Powered",
    tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    desc: "Semantic gap scoring between student skills and job requirements: 'You are 73% ready for this ML Engineer role. Missing: PyTorch, MLOps fundamentals.' Immediately surfaces a curated learning path from Coursera, YouTube, and LeetCode. The student doesn't just know the gap — they receive the bridge.",
    effort: "~2 weeks",
    impact: "High",
  },
  {
    icon: BarChart3,
    title: "Cohort-Level Placement Analytics",
    tag: "Coordinator Tool",
    tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    desc: "Heatmap dashboard showing which department + skill + company combinations are producing placements and which are stalling. Moves placement coordination from anecdote-driven decisions to data-driven strategy. Feeds directly into the existing analytics architecture already built in this platform.",
    effort: "~1 week",
    impact: "High",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Feature 38 — <span className="text-gradient">Forward-Thinking Vision</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1 max-w-2xl leading-relaxed">
          <em>"If we had more time, we would add…"</em> — A demonstration of architectural foresight.
          Every feature below can be wired into the existing system without rebuilding from scratch.
        </p>
      </div>

      {/* Current placement score demo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-brand-400" />
            <h3 className="font-semibold text-white text-sm">Placement Readiness Score</h3>
            <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Lock size={10} /> Coming Soon
            </span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a45" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="10"
                  strokeDasharray={`${(67 / 100) * 314} 314`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">67</span>
                <span className="text-text-muted text-xs">/ 100</span>
              </div>
            </div>
          </div>
          <p className="text-text-secondary text-xs text-center leading-relaxed">
            Aryan Mehta · CSE Final Year<br />
            <span className="text-amber-400">Moderate readiness</span> — 3 signals need improvement
          </p>
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-brand-400" />
            <h3 className="font-semibold text-white text-sm">Readiness Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="#2a2a45" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-brand-400" />
            <h3 className="font-semibold text-white text-sm">Department Placement Rate</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="dept" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#16162a", border: "1px solid #2a2a45", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="placed" radius={[4, 4, 0, 0]}>
                {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Future features */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-brand-700/40 flex items-center justify-center">
            <Lightbulb size={16} className="text-brand-400" />
          </div>
          <div>
            <h2 className="text-white font-bold">If We Had More Time, We Would Add…</h2>
            <p className="text-text-muted text-xs">Judges reward forward thinking — here's our roadmap</p>
          </div>
        </div>

        <div className="space-y-4">
          {futureFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 card-glow">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center flex-shrink-0">
                  <f.icon size={20} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-white font-semibold">{f.title}</h3>
                    <span className={`text-xs font-medium border px-2.5 py-0.5 rounded-lg ${f.tagColor}`}>
                      {f.tag}
                    </span>
                    <span className="ml-auto text-xs text-text-muted font-mono flex items-center gap-1">
                      <Lock size={10} /> Est. {f.effort}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={11} className="text-brand-400" />
                      Impact: <span className="text-white font-medium ml-1">{f.impact}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      API contracts already defined
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Closing statement */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-8 border border-brand-700/30 bg-brand-900/10 text-center">
        <Sparkles size={32} className="text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">
          The Platform You Saw Today Is Version 1.
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed max-w-2xl mx-auto mb-4">
          The architecture in the codebase is already <strong className="text-white">Version 3 in its thinking.</strong>{" "}
          We didn't skip mock interviews because we ran out of ideas — we built the infrastructure that makes
          each future feature a 2–4 week addition, not a 3-month rebuild.
        </p>
        <p className="text-text-muted text-xs italic">
          "The best platforms aren't finished products. They're living systems."
        </p>
      </motion.div>
    </div>
  );
}
