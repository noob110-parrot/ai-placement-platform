"use client";

/**
 * Global notification provider — wraps the app and listens
 * to WebSocket events, showing toast notifications in real time.
 */

import { useEffect } from "react";
import { toast } from "sonner";
import { useRealtimeNotifications } from "@/hooks";

interface Props {
  studentId?: string;
  children: React.ReactNode;
}

export function NotificationProvider({ studentId, children }: Props) {
  const { connected, lastMessage } = useRealtimeNotifications(studentId || null);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "deadline_alert":
        toast.warning(`⏰ Deadline Alert: ${lastMessage.company}`, {
          description: `${lastMessage.role} — ${lastMessage.deadline_at}`,
          duration: 8000,
        });
        break;

      case "job_match":
        toast.success(`💼 New Job Match!`, {
          description: `${lastMessage.jobs?.length || 0} new roles match your profile`,
          duration: 6000,
        });
        break;

      case "notice":
        toast.info(`📢 ${lastMessage.title}`, {
          description: lastMessage.bullets?.[0] || "New placement notice",
          duration: 10000,
        });
        break;

      case "broadcast":
        toast.info("📡 Platform Notice", {
          description: lastMessage.message,
          duration: 8000,
        });
        break;

      case "placement_update":
        toast.success(`🎉 Congratulations!`, {
          description: lastMessage.message || "You've been placed!",
          duration: 15000,
        });
        break;

      default:
        break;
    }
  }, [lastMessage]);

  return <>{children}</>;
}
