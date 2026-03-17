"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Settings, Bell, Smartphone, Mail, Calendar,
  Shield, Database, Zap, Save, CheckCircle2,
  ToggleLeft, ToggleRight, Key, Globe, Palette
} from "lucide-react";

interface Toggle { key: string; label: string; desc: string; enabled: boolean; icon: any }

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Toggle[]>([
    { key: "whatsapp",  label: "WhatsApp Notifications", desc: "Send deadline & job alerts via WhatsApp Business API", enabled: true,  icon: Smartphone },
    { key: "email",     label: "Email Notifications",    desc: "Send HTML emails via Gmail SMTP for all alerts",      enabled: true,  icon: Mail       },
    { key: "calendar",  label: "Google Calendar Sync",   desc: "Auto-create calendar events when deadlines are added",enabled: true,  icon: Calendar   },
    { key: "ai_summary",label: "AI Notice Summarizer",   desc: "Use OpenAI GPT to generate 3-bullet notice summaries",enabled: true,  icon: Zap        },
    { key: "n8n",       label: "n8n Automation Engine",  desc: "Enable n8n workflow webhooks for automation",         enabled: true,  icon: Database   },
    { key: "analytics", label: "Analytics Tracking",     desc: "Track placement metrics and generate reports",        enabled: true,  icon: Shield     },
  ]);

  const [apiKeys, setApiKeys] = useState({
    openai:     "sk-••••••••••••••••••••••••••••••••",
    whatsapp:   "EAA••••••••••••••••••••••••••••••••",
    google:     "••••••••••••••••.apps.googleusercontent.com",
  });

  const [saving, setSaving] = useState(false);

  const flipToggle = (key: string) => {
    setToggles((prev) => prev.map((t) => t.key === key ? { ...t, enabled: !t.enabled } : t));
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-text-muted text-sm mt-0.5">Configure platform integrations and notification preferences</p>
      </div>

      {/* Feature toggles */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Settings size={16} className="text-brand-400" /> Feature Toggles
        </h2>
        <div className="space-y-3">
          {toggles.map((t, i) => (
            <motion.div key={t.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.enabled ? "bg-brand-900/50 text-brand-400" : "bg-surface-muted text-text-muted"}`}>
                  <t.icon size={16} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.label}</p>
                  <p className="text-text-muted text-xs">{t.desc}</p>
                </div>
              </div>
              <button onClick={() => flipToggle(t.key)} className="flex-shrink-0 ml-4">
                {t.enabled
                  ? <ToggleRight size={28} className="text-brand-400" />
                  : <ToggleLeft size={28} className="text-text-muted" />}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Key size={16} className="text-brand-400" /> API Keys & Credentials
        </h2>
        <div className="space-y-4">
          {[
            { key: "openai",   label: "OpenAI API Key",              icon: Zap,        hint: "Used for AI summarization and skill gap analysis" },
            { key: "whatsapp", label: "WhatsApp Business API Token", icon: Smartphone, hint: "Meta Cloud API for WhatsApp message delivery" },
            { key: "google",   label: "Google OAuth Client ID",      icon: Globe,      hint: "For Google Calendar sync and Gmail OAuth" },
          ].map(({ key, label, icon: Icon, hint }) => (
            <div key={key}>
              <label className="block text-sm text-text-secondary mb-1.5">
                <Icon size={12} className="inline mr-1.5" />{label}
              </label>
              <input
                type="password"
                value={apiKeys[key as keyof typeof apiKeys]}
                onChange={(e) => setApiKeys({ ...apiKeys, [key]: e.target.value })}
                className="w-full bg-surface-muted border border-surface-border text-white px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:border-brand-500 transition-colors"
              />
              <p className="text-text-muted text-xs mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status indicators */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-brand-400" /> Integration Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ["PostgreSQL",       "Connected",   "emerald"],
            ["Redis",            "Connected",   "emerald"],
            ["n8n Engine",       "Running",     "emerald"],
            ["WhatsApp API",     "Authorized",  "emerald"],
            ["Google Calendar",  "Synced",      "emerald"],
            ["OpenAI API",       "Active",      "emerald"],
          ].map(([name, status, color]) => (
            <div key={name} className="flex items-center gap-2 bg-surface-muted rounded-xl px-3 py-2.5">
              <span className={`w-2 h-2 rounded-full bg-${color}-400`} />
              <div>
                <p className="text-white text-xs font-medium">{name}</p>
                <p className={`text-${color}-400 text-xs`}>{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
        {saving ? "Saving…" : <><Save size={15} /> Save Settings</>}
      </button>
    </div>
  );
}
