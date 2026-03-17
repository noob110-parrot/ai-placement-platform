"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BrainCircuit, Hash, Lock, ArrowRight, Loader2, Eye, EyeOff,
} from "lucide-react";
import api from "@/lib/api";

const schema = z.object({
  roll_no:  z.string().min(3, "Roll number required"),
  password: z.string().min(4, "Enter last 4 digits of your phone"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", data.roll_no);
      form.append("password", data.password);
      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("student_id",   res.data.student_id);
        localStorage.setItem("student_name", res.data.name);
      }
      toast.success(`Welcome back, ${res.data.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-brand-950/40 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to AI Placement Platform</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Roll No */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                <Hash size={13} className="inline mr-1.5" />Roll Number
              </label>
              <input
                {...register("roll_no")}
                placeholder="CS21B047"
                className={`w-full bg-surface-muted border text-white rounded-xl px-4 py-3 text-sm placeholder-text-muted
                  focus:outline-none transition-colors
                  ${errors.roll_no ? "border-red-500/60" : "border-surface-border focus:border-brand-500"}`}
              />
              {errors.roll_no && <p className="text-red-400 text-xs mt-1">{errors.roll_no.message}</p>}
            </div>

            {/* Password (last 4 digits of phone) */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                <Lock size={13} className="inline mr-1.5" />Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  placeholder="Last 4 digits of phone"
                  className={`w-full bg-surface-muted border text-white rounded-xl px-4 py-3 pr-11 text-sm placeholder-text-muted
                    focus:outline-none transition-colors
                    ${errors.password ? "border-red-500/60" : "border-surface-border focus:border-brand-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password
                ? <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                : <p className="text-text-muted text-xs mt-1">Use the last 4 digits of your registered phone number</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400
                text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-border text-center space-y-3">
            <p className="text-text-muted text-sm">
              New student?{" "}
              <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Register here
              </Link>
            </p>
            <Link href="/dashboard" className="block text-text-muted text-xs hover:text-white transition-colors">
              Continue as coordinator (skip login) →
            </Link>
          </div>
        </div>

        {/* Demo hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-4 p-3 rounded-xl border border-surface-border bg-surface-muted/30 text-xs text-text-muted text-center">
          Demo: Roll <span className="text-white font-mono">CS21B047</span> · Password: last 4 digits of{" "}
          <span className="text-white font-mono">+91 98765 43210</span> → <span className="text-white font-mono">3210</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
