"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Megaphone, Sparkles, Send, Loader2, CheckCircle2,
  Users, Mail, Smartphone, LayoutDashboard, ChevronRight,
  FileText, Zap, Clock, X
} from "lucide-react";

interface Bullet { text: string; }
interface BroadcastResult {
  recipients_targeted: number;
  whatsapp_delivered: number;
  emails_sent: number;
  dashboard_notifications: number;
  failed: number;
  time_taken_seconds: number;
}

const SAMPLE_NOTICE = `This is to inform all final-year students of the Department of Computer Science & Engineering, Electronics & Communication Engineering, and Information Technology that TCS iON has extended its registration deadline for the National Qualifier Test (NQT) — a mandatory assessment for TCS recruitment — from 20th March 2026 to 28th March 2026. Students who have not yet registered are strongly advised to do so immediately at tcsion.com. The test will be conducted in online proctored mode between 1st April and 5th April 2026. Students must carry a valid government-issued photo ID and their admit card. Please note that TCS requires a minimum CGPA of 7.0 and no active backlogs. The Placement Cell will conduct a preparatory session on 26th March at 3:00 PM in Seminar Hall B. Attendance is mandatory for all registered candidates.`;

const DEPARTMENTS = ["CSE", "ECE", "IT", "EEE", "MECH", "CIVIL"];

export default function NoticesPage() {
  const [rawText, setRawText]           = useState("");
  const [summarizing, setSummarizing]   = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [bullets, setBullets]           = useState<string[]>([]);
  const [noticeTitle, setNoticeTitle]   = useState("");
  const [noticeId, setNoticeId]         = useState<string | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(["CSE", "ECE", "IT"]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["whatsapp", "email", "dashboard"]);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);
  const [step, setStep] = useState<"input" | "summary" | "broadcast" | "done">("input");

  const handleSummarize = async () => {
    if (rawText.trim().length < 30) {
      toast.error("Notice text too short");
      return;
    }
    setSummarizing(true);
    try {
      // Simulate AI summarization (replace with: await api.post("/notices/summarize", {...}))
      await new Promise((r) => setTimeout(r, 2300));
      setBullets([
        "TCS NQT registration deadline extended to 28 March 2026 — register now at tcsion.com (min. CGPA 7.0, no active backlogs required)",
        "Online proctored test scheduled 1–5 April 2026; bring valid government photo ID and admit card on exam day",
        "Mandatory prep session: 26 March at 3:00 PM in Seminar Hall B — all registered candidates must attend",
      ]);
      setNoticeTitle("TCS NQT Deadline Extension Notice");
      setNoticeId("NOTICE-2026-0317-07");
      setStep("summary");
      toast.success("AI summary generated in 2.3 seconds");
    } catch {
      toast.error("Summarization failed — check API key");
    } finally {
      setSummarizing(false);
    }
  };

  const handleBroadcast = async () => {
    setBroadcasting(true);
    try {
      await new Promise((r) => setTimeout(r, 4800));
      setBroadcastResult({
        recipients_targeted: 142,
        whatsapp_delivered: 139,
        emails_sent: 142,
        dashboard_notifications: 142,
        failed: 3,
        time_taken_seconds: 4.8,
      });
      setStep("done");
      toast.success("📡 Broadcast complete — 142 students reached!");
    } catch {
      toast.error("Broadcast failed");
    } finally {
      setBroadcasting(false);
    }
  };

  const toggleDept = (d: string) =>
    setSelectedDepts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const toggleChannel = (c: string) =>
    setSelectedChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Feature 36 — <span className="text-gradient">AI Notice Summarizer & Broadcast</span>
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Paste a college notice → AI generates 3-bullet summary → broadcast to all eligible students
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { key: "input", label: "Paste Notice" },
          { key: "summary", label: "AI Summary" },
          { key: "broadcast", label: "Review & Broadcast" },
          { key: "done", label: "Delivered" },
        ].map((s, i, arr) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${step === s.key ? "bg-brand-700/50 text-brand-300 border border-brand-600/50"
              : ["done", "summary", "broadcast"].indexOf(step) > ["done", "summary", "broadcast"].indexOf(s.key) ||
                step === "done"
                ? "text-emerald-400" : "text-text-muted"}`}>
              {(["done", "summary", "broadcast"].indexOf(step) >= i) ? (
                <CheckCircle2 size={11} className="text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">{i + 1}</span>
              )}
              {s.label}
            </div>
            {i < arr.length - 1 && <ChevronRight size={12} className="text-surface-border" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Input */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText size={16} className="text-brand-400" /> Raw Notice Text
              </h2>
              <button
                onClick={() => setRawText(SAMPLE_NOTICE)}
                className="text-xs text-brand-400 hover:text-brand-300 border border-brand-700/40 px-2.5 py-1 rounded-lg transition-colors">
                Load Sample
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the college notice here…&#10;&#10;e.g. 'This is to inform all final-year students of CSE, ECE and IT that TCS has extended…'"
              className="w-full h-52 bg-surface-muted border border-surface-border text-white text-sm rounded-xl px-4 py-3 placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-text-muted text-xs">{rawText.length} characters</span>
              <button
                onClick={handleSummarize}
                disabled={summarizing || rawText.length < 30}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {summarizing ? (
                  <><Loader2 size={14} className="animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles size={14} /> Generate Summary</>
                )}
              </button>
            </div>
          </div>

          {/* Target settings */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white text-sm">Target Audience</h3>
            <div>
              <p className="text-text-muted text-xs mb-2">Departments</p>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((d) => (
                  <button key={d} onClick={() => toggleDept(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${selectedDepts.includes(d)
                        ? "bg-brand-700/50 text-brand-300 border-brand-600/50"
                        : "border-surface-border text-text-muted hover:text-white"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-2">Broadcast Channels</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "whatsapp", label: "WhatsApp", icon: Smartphone },
                  { key: "email",    label: "Email",    icon: Mail },
                  { key: "dashboard",label: "Dashboard",icon: LayoutDashboard },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => toggleChannel(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${selectedChannels.includes(key)
                        ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                        : "border-surface-border text-text-muted hover:text-white"}`}>
                    <Icon size={11} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary + Broadcast */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center h-64 border-dashed border-2 border-surface-border">
                <Sparkles size={32} className="text-brand-400/40 mb-3" />
                <p className="text-text-muted text-sm">AI summary will appear here</p>
                <p className="text-text-muted text-xs mt-1">Paste a notice and click Generate</p>
              </motion.div>
            )}

            {(step === "summary" || step === "broadcast") && (
              <motion.div key="summary"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-700/50 flex items-center justify-center">
                    <Sparkles size={15} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">AI Summary</p>
                    <p className="text-text-muted text-xs">{noticeTitle}</p>
                  </div>
                  <span className="ml-auto text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-lg">
                    Generated in 2.3s
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  {bullets.map((b, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-start gap-3 p-3 bg-surface-muted rounded-xl border border-surface-border">
                      <span className="w-6 h-6 rounded-full bg-brand-700/50 text-brand-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <p className="text-text-secondary text-sm leading-relaxed">{b}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep("input")}
                    className="flex-1 py-2.5 border border-surface-border text-text-muted hover:text-white rounded-xl text-sm transition-colors">
                    ← Edit
                  </button>
                  <button onClick={() => { setStep("broadcast"); handleBroadcast(); }}
                    disabled={broadcasting}
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {broadcasting ? (
                      <><Loader2 size={14} className="animate-spin" /> Broadcasting…</>
                    ) : (
                      <><Send size={14} /> Broadcast Now</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "done" && broadcastResult && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Broadcast Complete</p>
                    <p className="text-text-muted text-xs">Notice ID: {noticeId}</p>
                  </div>
                  <span className="ml-auto text-xs text-emerald-400 font-mono">
                    {broadcastResult.time_taken_seconds}s
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    { label: "Recipients targeted",    value: broadcastResult.recipients_targeted,    icon: Users,          color: "text-white" },
                    { label: "WhatsApp delivered",     value: `${broadcastResult.whatsapp_delivered} / ${broadcastResult.recipients_targeted}`, icon: Smartphone, color: "text-emerald-400" },
                    { label: "Emails sent",            value: `${broadcastResult.emails_sent} / ${broadcastResult.recipients_targeted}`, icon: Mail, color: "text-emerald-400" },
                    { label: "Dashboard notifications",value: broadcastResult.dashboard_notifications, icon: LayoutDashboard, color: "text-emerald-400" },
                    { label: "Failed",                 value: broadcastResult.failed,                 icon: X,              color: "text-amber-400" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                      <span className="text-text-muted text-sm flex items-center gap-2">
                        <Icon size={13} className={color} /> {label}
                      </span>
                      <span className={`font-semibold text-sm font-mono ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setStep("input"); setRawText(""); setBullets([]); setBroadcastResult(null); }}
                  className="w-full py-2.5 border border-surface-border text-text-muted hover:text-white rounded-xl text-sm transition-colors">
                  + New Notice
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
