// API-shaped demo records. Timestamps are relative to when the demo starts.
export function createMockChatbots(now = new Date()) {
  const hoursAgo = (hours) => new Date(now.getTime() - hours * 3_600_000).toISOString();

  return [
    {
      id: "admissions-assistant",
      name: "Admissions Assistant",
      description: "Answer admission questions and help students take their next step.",
      status: "active",
      channels: ["website", "whatsapp"],
      conversationsThisMonth: 2486,
      lastEditedAt: hoursAgo(2),
    },
    {
      id: "course-advisor",
      name: "Course Advisor",
      description: "Help students explore courses, eligibility and career opportunities.",
      status: "active",
      channels: ["website"],
      conversationsThisMonth: 1248,
      lastEditedAt: hoursAgo(5),
    },
    {
      id: "whatsapp-enquiries",
      name: "WhatsApp Enquiries",
      description: "Respond to enquiries and keep admission conversations moving.",
      status: "active",
      channels: ["whatsapp"],
      conversationsThisMonth: 1832,
      lastEditedAt: hoursAgo(24),
    },
    {
      id: "scholarship-guide",
      name: "Scholarship Guide",
      description: "Guide students through scholarships, fees and financial support.",
      status: "inactive",
      channels: ["website", "whatsapp"],
      conversationsThisMonth: 364,
      lastEditedAt: hoursAgo(48),
    },
    {
      id: "campus-visit-assistant",
      name: "Campus Visit Assistant",
      description: "Help prospective students plan a campus visit and meet the team.",
      status: "active",
      channels: ["website", "whatsapp"],
      conversationsThisMonth: 672,
      lastEditedAt: hoursAgo(72),
    },
    {
      id: "student-support",
      name: "Student Support",
      description: "Give students a helpful starting point for everyday questions.",
      status: "inactive",
      channels: ["website"],
      conversationsThisMonth: 0,
      lastEditedAt: hoursAgo(96),
    },
  ];
}
