/**
 * Tests for the API client and hook utilities.
 */

// ── API client ────────────────────────────────────────────────────────────────

describe("api client", () => {
  it("exports a default axios instance", async () => {
    const api = (await import("@/lib/api")).default;
    expect(api).toBeDefined();
    expect(typeof api.get).toBe("function");
    expect(typeof api.post).toBe("function");
    expect(typeof api.patch).toBe("function");
    expect(typeof api.delete).toBe("function");
  });

  it("has the correct base URL configured", async () => {
    const api = (await import("@/lib/api")).default;
    expect(api.defaults.baseURL).toContain("/api");
  });

  it("has correct timeout set", async () => {
    const api = (await import("@/lib/api")).default;
    expect(api.defaults.timeout).toBe(15000);
  });
});

// ── Type guards ───────────────────────────────────────────────────────────────

describe("TypeScript types", () => {
  it("Student type has required fields", () => {
    const student: import("@/types").Student = {
      id:            "uuid-123",
      roll_no:       "CS21B047",
      name:          "Aryan Mehta",
      email:         "aryan@gmail.com",
      phone:         "+919876543210",
      department:    "CSE",
      year_of_study: 4,
      cgpa:          8.4,
      skills:        ["Python"],
      placement_score: 67,
      is_placed:     false,
      created_at:    "2026-01-01T00:00:00Z",
    };
    expect(student.roll_no).toBe("CS21B047");
    expect(student.is_placed).toBe(false);
  });

  it("Deadline type has required fields", () => {
    const deadline: import("@/types").Deadline = {
      id:              "d-uuid",
      student_id:      "s-uuid",
      company:         "Google India",
      role:            "SWE Intern",
      deadline_at:     "2026-03-25T23:59:00Z",
      priority:        "high",
      reminder_sent:   false,
      whatsapp_sent:   true,
      created_at:      "2026-03-01T00:00:00Z",
    };
    expect(deadline.whatsapp_sent).toBe(true);
    expect(deadline.priority).toBe("high");
  });

  it("BroadcastResult has delivery stats", () => {
    const result: import("@/types").BroadcastResult = {
      notice_id:               "n-uuid",
      recipients_targeted:     142,
      whatsapp_delivered:      139,
      emails_sent:             142,
      dashboard_notifications: 142,
      failed:                  3,
      time_taken_seconds:      4.8,
      broadcast_at:            "2026-03-17T14:22:00Z",
    };
    expect(result.whatsapp_delivered).toBe(139);
    expect(result.failed).toBe(3);
  });
});
