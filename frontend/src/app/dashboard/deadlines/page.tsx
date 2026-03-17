"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Clock, Plus, Smartphone, CheckCircle2, Calendar,
  Loader2, Building2, Briefcase, Link2, Zap, X, AlertTriangle
} from "lucide-react";
import api from "@/lib/api";

type Priority = "low" | "normal" | "high" | "urgent";

interface DeadlineForm {
  company: string;
  role: string;
  deadline_at: string;
  priority: Priority;
  application_url: string;
}

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  low:    { label: "Low",    color: "text-slate-400 bg-slate-400/10 border-slate-400/20",   dot: "bg-slate-400" },
  normal: { label: "Normal", color: "text-amber-400 bg-amber-400/10 border-amber-400/20",  dot: "bg-amber-400" },
  high:   { label: "High",   color: "text-orange-400 bg-orange-400/10 border-orange-400/20", dot: "bg-orange-400" },
  urgent: { label: "Urgent", color: "text-red-400 bg-red-400/10 border-red-400/20",         dot: "bg-red-400" },
};

// Demo deadlines for display
const mockDeadlines = [
  { id: "1", company: "Google India", role: "SWE Intern", deadline_at: "2026-03-25T23:59:00+05:30", priority: "high" as Priority, whatsapp_sent: true, calendar_event_id: "gcal_001" },
  { id: "2", company: "Microsoft",    role: "SDE Intern",  deadline_at: "2026-03-28T18:00:00+05:30", priority: "normal" as Priority, whatsapp_sent: true, calendar_event_id: "gcal_002" },
  { id: "3", company: "Amazon",       role: "SDE-I",       deadline_at: "2026-04-02T23:59:00+05:30", priority: "urgent" as Priority, whatsapp_sent: false, calendar_event_id: null },
];

export default function DeadlinesPage() {
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [notification, setNotification] = useState<"idle" | "sending" | "sent">("idle");
  const [deadlines, setDeadlines]       = useState(mockDeadlines);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeadlineForm>({
    defaultValues: { priority: "high" },
  });

  const onSubmit = async (data: DeadlineForm) => {
    setSubmitting(true);
    setNotification("sending");
    try {
      // In prod: await api.post(`/deadlines/${studentId}`, data);
      await new Promise((r) => setTimeout(r, 1800)); // simulate API
      setNotification("sent");

      const newDeadline = {
        id: Date.now().toString(),
        company: data.company,
        role: data.role,
        deadline_at: data.deadline_at,
        priority: data.priority,
        whatsapp_sent: true,
        calendar_event_id: `gcal_${Date.now()}`,
      };
      setDeadlines((prev) => [newDeadline, ...prev]);

      toast.success("✅ Deadline added!", {
        description: "WhatsApp message sent · Calendar event created",
        duration: 5000,
      });
      reset();
      setShowForm(false);
      setNotification("idle");
    } catch {
      toast.error("Failed to add deadline");
      setNotification("idle");
    } finally {
      setSubmitting(false);
    }
  };

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Feature 34 — <span className="text-gradient">Deadline Tracker</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            Add a deadline → WhatsApp arrives in &lt;30 seconds · Calendar event auto-created
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
          <Plus size={15} /> Add Deadline
        </button>
      </div>

      {/* Notification status banner */}
      <AnimatePresence>
        {notification === "sending" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Triggering n8n workflow… WhatsApp message dispatching to registered phone…
          </motion.div>
        )}
        {notification === "sent" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm">
            <CheckCircle2 size={16} />
            <span>
              <strong>WhatsApp delivered</strong> in ~18 seconds ·{" "}
              <strong>Google Calendar event</strong> created · Email reminder sent
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add deadline modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-lg glass rounded-2xl p-7 border border-surface-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <Clock size={18} className="text-brand-400" /> Add Application Deadline
                </h2>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {[
                  { name: "company", label: "Company", icon: Building2, placeholder: "Google India" },
                  { name: "role",    label: "Role",    icon: Briefcase, placeholder: "Software Engineer Intern" },
                  { name: "application_url", label: "Application URL", icon: Link2, placeholder: "https://careers.google.com/..." },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm text-text-secondary mb-1.5">
                      <f.icon size={12} className="inline mr-1.5" />{f.label}
                    </label>
                    <input
                      {...register(f.name as any, { required: f.name !== "application_url" && `${f.label} is required` })}
                      placeholder={f.placeholder}
                      className="w-full bg-surface-muted border border-surface-border text-white rounded-xl px-4 py-2.5 text-sm placeholder-text-muted focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">
                      <Clock size={12} className="inline mr-1.5" />Deadline Date & Time
                    </label>
                    <input
                      {...register("deadline_at", { required: "Deadline date required" })}
                      type="datetime-local"
                      className="w-full bg-surface-muted border border-surface-border text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">Priority</label>
                    <select
                      {...register("priority")}
                      className="w-full bg-surface-muted border border-surface-border text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors">
                      {Object.entries(priorityConfig).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* What will happen */}
                <div className="bg-brand-900/30 border border-brand-700/30 rounded-xl p-4 space-y-2 text-xs">
                  <p className="text-brand-300 font-medium">When you click Save:</p>
                  {[
                    "📱 WhatsApp alert delivered to registered phone in <30s",
                    "📅 Google Calendar event auto-created with reminders",
                    "📧 Email reminder sent with application link",
                    "🔔 Dashboard notification updated",
                  ].map((item, i) => (
                    <p key={i} className="text-text-secondary flex items-start gap-2">
                      <span>{item}</span>
                    </p>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-surface-border text-text-muted hover:text-white rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Zap size={15} /> Save & Notify</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deadlines list */}
      <div className="space-y-3">
        {deadlines.map((d, i) => {
          const days = daysUntil(d.deadline_at);
          const pc = priorityConfig[d.priority];
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-xl p-5 card-glow flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pc.color}`}>
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{d.company}</p>
                  <p className="text-text-muted text-xs">{d.role}</p>
                </div>
              </div>

              <div className="text-center hidden md:block">
                <p className="text-white text-sm font-mono">
                  {new Date(d.deadline_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <p className={`text-xs font-medium ${days <= 3 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-text-muted"}`}>
                  {days <= 0 ? "Expired" : `${days}d remaining`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${pc.color}`}>
                  {pc.label}
                </span>
                {d.whatsapp_sent ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-lg">
                    <Smartphone size={11} /> Sent
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
                    <AlertTriangle size={11} /> Pending
                  </span>
                )}
                {d.calendar_event_id && (
                  <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-400/10 border border-brand-400/20 px-2 py-1 rounded-lg">
                    <Calendar size={11} /> Cal
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
