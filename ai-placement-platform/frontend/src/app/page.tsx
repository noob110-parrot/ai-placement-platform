"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BrainCircuit, Zap, Bell, Calendar, BarChart3,
  ArrowRight, CheckCircle2, Users, Briefcase, Award
} from "lucide-react";

const features = [
  { icon: BrainCircuit, title: "AI Resume Parsing", desc: "spaCy + Sentence Transformers extract skills, education, and experience automatically." },
  { icon: Zap,          title: "Instant Alerts",    desc: "WhatsApp notifications delivered in under 30 seconds via n8n automation." },
  { icon: Calendar,     title: "Calendar Sync",     desc: "Deadlines auto-create Google Calendar events with smart reminders." },
  { icon: Bell,         title: "Notice Broadcast",  desc: "AI generates 3-bullet summaries and broadcasts to 100+ students instantly." },
  { icon: BarChart3,    title: "Placement Score",   desc: "Dynamic readiness score (0–100) from CGPA, skills, activity signals." },
  { icon: Briefcase,    title: "Job Matching",      desc: "Semantic similarity matching surfaces the right roles for each student." },
];

const stats = [
  { value: "< 30s", label: "WhatsApp delivery" },
  { value: "99.2%", label: "Notification success" },
  { value: "3 bullets", label: "AI notice summary" },
  { value: "100+", label: "Students reached" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT text-text-primary overflow-hidden">

      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-brand-950/40 via-transparent to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-surface-border glass">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">AI Placement Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-text-secondary hover:text-white transition-colors text-sm">
            Dashboard
          </Link>
          <Link href="/register"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/50 border border-brand-700/50 text-brand-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            Features 33–38 Live Demo Ready
          </span>

          <h1 className="text-6xl font-extrabold leading-tight mb-6">
            <span className="text-gradient">AI-Powered</span>{" "}
            <br className="hidden md:block" />
            Placement Management
          </h1>

          <p className="text-text-secondary text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Register students, track deadlines, receive WhatsApp alerts in under 30 seconds,
            sync Google Calendar, broadcast AI-summarized notices — all in one platform.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register"
              className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 flex items-center gap-2 text-base">
              Register a Student <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard"
              className="px-8 py-4 border border-surface-border text-text-secondary hover:text-white hover:border-brand-500/50 rounded-xl transition-all duration-300 font-medium text-base">
              View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
          {stats.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 card-glow">
              <div className="text-3xl font-extrabold text-gradient mb-1">{s.value}</div>
              <div className="text-text-muted text-sm">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Platform Features</h2>
        <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
          A full-stack, production-grade system with React, FastAPI, PostgreSQL, and n8n automation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 card-glow group cursor-default">
              <div className="w-11 h-11 rounded-xl bg-brand-900/60 flex items-center justify-center mb-4 group-hover:bg-brand-700/40 transition-colors">
                <f.icon size={22} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-20 text-center">
        <div className="glass rounded-3xl p-12 border-brand-700/30">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Ready to Demo?</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Walk through all six features — from student registration to live WhatsApp delivery.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all">
            Start with Feature 33 — Register Student <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border py-8 text-center text-text-muted text-sm">
        <p>AI Placement Platform · Built with Next.js, FastAPI, PostgreSQL & n8n</p>
      </footer>
    </div>
  );
}
