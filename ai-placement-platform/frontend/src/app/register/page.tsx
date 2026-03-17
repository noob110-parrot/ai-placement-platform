"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  User, Mail, Phone, Hash, Building2, GraduationCap,
  Star, Code2, CheckCircle2, ArrowRight, ArrowLeft, Loader2, BrainCircuit
} from "lucide-react";
import api from "@/lib/api";

// ── Validation schema ──────────────────────────────────────────────────────

const schema = z.object({
  roll_no:       z.string().min(3, "Roll number too short").max(20),
  name:          z.string().min(2, "Name too short").max(100),
  email:         z.string().email("Invalid email").endsWith("@gmail.com", "Must be a Gmail address"),
  phone:         z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  department:    z.string().min(2, "Department required"),
  year_of_study: z.coerce.number().int().min(1).max(5),
  cgpa:          z.coerce.number().min(0).max(10),
  skills:        z.string().min(1, "Add at least one skill"),
});

type FormData = z.infer<typeof schema>;

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
];

// ── Field config ─────────────────────────────────────────────────────────────

const fields = [
  { name: "roll_no",       label: "Roll Number",     icon: Hash,          placeholder: "CS21B047",              type: "text" },
  { name: "name",          label: "Full Name",        icon: User,          placeholder: "Aryan Mehta",           type: "text" },
  { name: "email",         label: "Gmail Address",    icon: Mail,          placeholder: "aryan.mehta@gmail.com", type: "email" },
  { name: "phone",         label: "Phone Number",     icon: Phone,         placeholder: "+91 98765 43210",       type: "tel" },
  { name: "year_of_study", label: "Year of Study",    icon: GraduationCap, placeholder: "4",                     type: "number" },
  { name: "cgpa",          label: "CGPA",             icon: Star,          placeholder: "8.4",                   type: "number" },
  { name: "skills",        label: "Skills (comma-separated)", icon: Code2, placeholder: "Python, React, SQL, ML", type: "text" },
];

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState<any>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const emailValue = watch("email", "");

  const handleEmailBlur = async () => {
    if (!emailValue) return;
    try {
      const { data } = await api.get(`/students/validate-email?email=${emailValue}`);
      setEmailValid(data.valid);
    } catch { setEmailValid(false); }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        year_of_study: Number(data.year_of_study),
        cgpa: Number(data.cgpa),
        skills: data.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await api.post("/students/register", payload);
      setSuccess(res.data);
      toast.success("🎉 Student registered successfully!", {
        description: "Welcome WhatsApp message sent.",
        duration: 5000,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Registration failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return <SuccessScreen student={success} />;

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <BrainCircuit size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">
            Feature 33 — <span className="text-gradient">Student Registration</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Register with a real Gmail and phone number to enable WhatsApp alerts and Google Calendar sync.
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Department select */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                <Building2 size={13} className="inline mr-1.5 mb-0.5" />Department
              </label>
              <select
                {...register("department")}
                className="w-full bg-surface-muted border border-surface-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors">
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
            </div>

            {/* Dynamic fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map((f) => (
                <div key={f.name} className={f.name === "skills" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    <f.icon size={13} className="inline mr-1.5 mb-0.5" />{f.label}
                  </label>
                  <div className="relative">
                    <input
                      {...register(f.name as any)}
                      type={f.type}
                      step={f.name === "cgpa" ? "0.1" : undefined}
                      placeholder={f.placeholder}
                      onBlur={f.name === "email" ? handleEmailBlur : undefined}
                      className={`w-full bg-surface-muted border text-white rounded-xl px-4 py-3 text-sm placeholder-text-muted focus:outline-none transition-colors
                        ${errors[f.name as keyof typeof errors]
                          ? "border-red-500/60 focus:border-red-500"
                          : f.name === "email" && emailValid !== null
                            ? emailValid ? "border-emerald-500/60" : "border-red-500/60"
                            : "border-surface-border focus:border-brand-500"}`}
                    />
                    {f.name === "email" && emailValid === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} /> Gmail ✓
                      </span>
                    )}
                  </div>
                  {errors[f.name as keyof typeof errors] && (
                    <p className="text-red-400 text-xs mt-1">
                      {(errors[f.name as keyof typeof errors] as any)?.message}
                    </p>
                  )}
                  {f.name === "email" && emailValid === true && (
                    <p className="text-emerald-400 text-xs mt-1">
                      ✅ Gmail detected — Calendar & notification sync enabled
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Registering…</>
              ) : (
                <>Register Student <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function SuccessScreen({ student }: { student: any }) {
  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md text-center">
        <div className="glass rounded-3xl p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl font-extrabold mb-2">
            Welcome, {student.name}! 🎉
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Your profile is live. WhatsApp welcome message sent to{" "}
            <span className="text-white font-mono">{student.phone}</span>.
          </p>
          <div className="bg-surface-muted rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            {[
              ["Roll No", student.roll_no],
              ["Department", student.department],
              ["CGPA", student.cgpa],
              ["Notifications", "✅ Active"],
              ["Calendar Sync", "✅ Ready"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-text-muted">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/deadlines"
            className="block w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-sm">
            Next: Add a Deadline (Feature 34) →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
