/**
 * Custom hooks for AI Placement Platform data fetching.
 * Uses React Query for caching, refetching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import type {
  Student, Deadline, Application, Notice,
  PlacementStats, BroadcastResult,
} from "@/types";

// ── Students ──────────────────────────────────────────────────────────────────

export function useStudents(filters?: { department?: string; year?: number }) {
  return useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.department) params.set("department", filters.department);
      if (filters?.year)       params.set("year",       String(filters.year));
      const { data } = await api.get<Student[]>(`/students?${params}`);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useStudent(studentId: string | null) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data } = await api.get<Student>(`/students/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useRegisterStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Student>) => {
      const { data } = await api.post<Student>("/students/register", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student registered!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Registration failed");
    },
  });
}

// ── Deadlines ─────────────────────────────────────────────────────────────────

export function useDeadlines(studentId: string | null) {
  return useQuery({
    queryKey: ["deadlines", studentId],
    queryFn: async () => {
      const { data } = await api.get<Deadline[]>(`/deadlines/${studentId}`);
      return data;
    },
    enabled: !!studentId,
    refetchInterval: 60_000, // re-check every minute for updates
  });
}

export function useAddDeadline(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Deadline>) => {
      const { data } = await api.post<Deadline>(`/deadlines/${studentId}`, payload);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["deadlines", studentId] });
      toast.success("Deadline added!", {
        description: "WhatsApp alert sent · Calendar event created",
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to add deadline");
    },
  });
}

// ── Applications ──────────────────────────────────────────────────────────────

export function useApplications(studentId: string | null) {
  return useQuery({
    queryKey: ["applications", studentId],
    queryFn: async () => {
      const { data } = await api.get<Application[]>(`/applications/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Application> & { id: string }) => {
      const { data } = await api.patch<Application>(`/applications/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

// ── Notices ───────────────────────────────────────────────────────────────────

export function useSummarizeNotice() {
  return useMutation({
    mutationFn: async (payload: { raw_content: string; target_departments: string[]; target_years: number[] }) => {
      const { data } = await api.post<Notice>("/notices/summarize", payload);
      return data;
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "AI summarization failed");
    },
  });
}

export function useBroadcastNotice() {
  return useMutation({
    mutationFn: async (payload: { notice_id: string; channels: string[] }) => {
      const { data } = await api.post<BroadcastResult>("/notices/broadcast", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`📡 Broadcast complete — ${data.recipients_targeted} students reached`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Broadcast failed");
    },
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function usePlacementStats() {
  return useQuery({
    queryKey: ["placement-stats"],
    queryFn: async () => {
      const { data } = await api.get<PlacementStats>("/analytics/stats");
      return data;
    },
    staleTime: 120_000,
  });
}

export function useSkillDemand() {
  return useQuery({
    queryKey: ["skill-demand"],
    queryFn: async () => {
      const { data } = await api.get<{ skill: string; count: number }[]>("/analytics/skill-demand");
      return data;
    },
    staleTime: 300_000,
  });
}

// ── Job matching ──────────────────────────────────────────────────────────────

export function useJobMatches(studentId: string | null) {
  return useQuery({
    queryKey: ["job-matches", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/match/${studentId}`);
      return data;
    },
    enabled: !!studentId,
    staleTime: 300_000,
  });
}

// ── WebSocket hook ────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";

export function useRealtimeNotifications(studentId: string | null) {
  const wsRef        = useRef<WebSocket | null>(null);
  const [connected, setConnected]     = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    if (!studentId) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsBase  = apiBase.replace(/^http/, "ws");
    const ws      = new WebSocket(`${wsBase}/ws/${studentId}`);

    ws.onopen    = () => setConnected(true);
    ws.onclose   = () => { setConnected(false); setTimeout(connect, 3000); };
    ws.onerror   = () => ws.close();
    ws.onmessage = (e) => {
      try { setLastMessage(JSON.parse(e.data)); } catch {}
    };

    wsRef.current = ws;
  }, [studentId]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  const ping = () => wsRef.current?.send("ping");

  return { connected, lastMessage, ping };
}
