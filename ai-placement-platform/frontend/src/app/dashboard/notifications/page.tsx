"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Smartphone, Mail, LayoutDashboard, CheckCircle2,
  XCircle, Clock, Filter, RefreshCw, Check, Trash2, Zap
} from "lucide-react";
import { toast } from "sonner";

type Channel = "whatsapp" | "email" | "dashboard";
type Status  = "delivered" | "sent" | "failed" | "pending";

interface Notification {
  id: string;
  channel: Channel;
  status: Status;
  subject: string;
  body: string;
  student_name: string;
  sent_at: string;
  read: boolean;
}

const DEMO_NOTIFS: Notification[] = [
  { id:"1", channel:"whatsapp", status:"delivered", subject:"Deadline Alert",     body:"Hey Aryan! Google India SWE Intern deadline on 25 Mar 2026…", student_name:"Aryan Mehta",  sent_at:"2026-03-17T14:22:18", read:false },
  { id:"2", channel:"email",    status:"delivered", subject:"TCS NQT Notice",     body:"3-bullet summary of TCS NQT deadline extension broadcast",    student_name:"Priya Sharma", sent_at:"2026-03-17T14:22:22", read:false },
  { id:"3", channel:"dashboard",status:"delivered", subject:"New Job Match",      body:"3 new jobs matched your profile — React, Python, SQL",         student_name:"Aryan Mehta",  sent_at:"2026-03-17T13:10:00", read:true  },
  { id:"4", channel:"whatsapp", status:"delivered", subject:"Deadline Reminder",  body:"Microsoft SDE Intern deadline in 11 days — don't miss it!",    student_name:"Rohan Verma",  sent_at:"2026-03-17T06:00:05", read:true  },
  { id:"5", channel:"email",    status:"failed",    subject:"Welcome Email",      body:"Welcome to AI Placement Platform — failed to deliver",         student_name:"Dev Malhotra", sent_at:"2026-03-16T11:30:00", read:true  },
  { id:"6", channel:"whatsapp", status:"delivered", subject:"Deadline Alert",     body:"Amazon SDE-I application due in 16 days. Apply now!",          student_name:"Sneha Patel",  sent_at:"2026-03-16T06:00:10", read:true  },
  { id:"7", channel:"email",    status:"delivered", subject:"Job Alert",          body:"Flipkart Full Stack Dev role matches your profile (91%)",       student_name:"Kavya Nair",   sent_at:"2026-03-15T09:15:00", read:true  },
  { id:"8", channel:"dashboard",status:"delivered", subject:"OA Reminder",        body:"You have a pending OA for Microsoft — check your email",       student_name:"Aryan Mehta",  sent_at:"2026-03-14T14:00:00", read:true  },
];

const CHANNEL_CONFIG: Record<Channel, { icon: any; label: string; color: string }> = {
  whatsapp: { icon: Smartphone,     label: "WhatsApp", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  email:    { icon: Mail,           label: "Email",    color: "text-brand-400 bg-brand-400/10 border-brand-400/20"       },
  dashboard:{ icon: LayoutDashboard,label: "Dashboard",color: "text-violet-400 bg-violet-400/10 border-violet-400/20"   },
};

const STATUS_CONFIG: Record<Status, { icon: any; color: string }> = {
  delivered: { icon: CheckCircle2, color: "text-emerald-400" },
  sent:      { icon: Check,        color: "text-brand-400"   },
  failed:    { icon: XCircle,      color: "text-red-400"     },
  pending:   { icon: Clock,        color: "text-amber-400"   },
};

export default function NotificationsPage() {
  const [notifs, setNotifs]         = useState<Notification[]>(DEMO_NOTIFS);
  const [channelFilter, setFilter]  = useState<"all" | Channel>("all");
  const [loading, setLoading]       = useState(false);

  const filtered = notifs.filter((n) => channelFilter === "all" || n.channel === channelFilter);
  const unread   = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const resend = (id: string) => {
    toast.success("Notification queued for resend");
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, status: "pending" as Status } : n));
    setTimeout(() => {
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, status: "delivered" as Status } : n));
      toast.success("Notification delivered ✓");
    }, 2000);
  };

  const delivered = notifs.filter((n) => n.status === "delivered").length;
  const failed    = notifs.filter((n) => n.status === "failed").length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Notifications
            {unread > 0 && (
              <span className="px-2 py-0.5 bg-brand-700/50 border border-brand-600/50 text-brand-300 text-sm rounded-lg font-mono">
                {unread} unread
              </span>
            )}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">All channels · {delivered} delivered · {failed} failed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 700); }}
            className="p-2.5 border border-surface-border text-text-muted hover:text-white rounded-xl transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 border border-surface-border text-text-muted hover:text-white text-sm rounded-xl transition-colors">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "WhatsApp",  value: notifs.filter((n) => n.channel === "whatsapp").length, color: "text-emerald-400" },
          { label: "Email",     value: notifs.filter((n) => n.channel === "email").length,    color: "text-brand-400" },
          { label: "Dashboard", value: notifs.filter((n) => n.channel === "dashboard").length,color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Channel filter */}
      <div className="flex items-center gap-2">
        <Filter size={13} className="text-text-muted" />
        {(["all", "whatsapp", "email", "dashboard"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize
              ${channelFilter === f ? "bg-brand-700/50 text-brand-300 border-brand-600/50" : "border-surface-border text-text-muted hover:text-white"}`}>
            {f === "all" ? "All Channels" : f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((n, i) => {
            const ch = CHANNEL_CONFIG[n.channel];
            const st = STATUS_CONFIG[n.status];
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass rounded-xl p-4 flex items-start gap-4 transition-all
                  ${!n.read ? "border-brand-500/20 bg-brand-900/10" : "border-surface-border"}`}>
                {/* Channel badge */}
                <div className={`p-2 rounded-xl border flex-shrink-0 ${ch.color}`}>
                  <ch.icon size={14} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white text-sm font-medium">{n.subject}</p>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    <span className={`flex items-center gap-1 text-xs ml-auto ${st.color}`}>
                      <st.icon size={11} /> {n.status}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed truncate">{n.body}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                    <span>{n.student_name}</span>
                    <span>·</span>
                    <span>{new Date(n.sent_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {n.status === "failed" && (
                    <button onClick={() => resend(n.id)}
                      className="p-1.5 text-text-muted hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all" title="Resend">
                      <Zap size={13} />
                    </button>
                  )}
                  <button onClick={() => setNotifs((prev) => prev.filter((x) => x.id !== n.id))}
                    className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
