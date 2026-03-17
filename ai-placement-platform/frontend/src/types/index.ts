export type Priority = "low" | "normal" | "high" | "urgent";

export type ApplicationStatus =
  | "saved" | "applied" | "oa" | "interview"
  | "offered" | "rejected" | "withdrawn";

export interface Student {
  id: string;
  roll_no: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year_of_study: number;
  cgpa: number;
  skills: string[];
  placement_score: number;
  is_placed: boolean;
  created_at: string;
}

export interface Deadline {
  id: string;
  student_id: string;
  company: string;
  role: string;
  deadline_at: string;
  priority: Priority;
  application_url?: string;
  calendar_event_id?: string;
  reminder_sent: boolean;
  whatsapp_sent: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_at?: string;
  notes?: string;
  resume_score?: number;
  match_score?: number;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  summary_bullets: string[];
  target_departments: string[];
  target_years: number[];
  raw_content: string;
  is_broadcast: boolean;
  recipients_count: number;
  broadcast_at?: string;
  created_at: string;
}

export interface BroadcastResult {
  notice_id: string;
  recipients_targeted: number;
  whatsapp_delivered: number;
  emails_sent: number;
  dashboard_notifications: number;
  failed: number;
  time_taken_seconds: number;
  broadcast_at: string;
}

export interface WorkflowExecution {
  id: string;
  started: string;
  duration: string;
  status: "success" | "error" | "running";
  itemsProcessed?: number;
}

export interface PlacementStats {
  total_students: number;
  placed_students: number;
  placement_percentage: number;
  avg_cgpa: number;
  total_applications: number;
  top_recruiters: Array<{ company: string; count: number }>;
  department_breakdown: Array<{ dept: string; placed: number; total: number }>;
}
