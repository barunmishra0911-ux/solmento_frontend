const route = (path, screen, title, subtitle, nav, detail = false) => ({
  path,
  screen,
  title,
  subtitle,
  nav,
  detail,
});

// Client-admin routes from the SolmentoAI UI/UX sitemap. The screen and nav
// keys keep the existing Client Admin shell working while the URL remains the
// single source of truth for the visible page.
export const clientAdminRouteDefinitions = [
  route(
    "/app/dashboard",
    "dashboard",
    "Dashboard",
    "Here is what is happening with your admissions today.",
    "dashboard",
  ),
  route(
    "/app/profile",
    "profile",
    "Profile",
    "Manage your account and organization information.",
    "settings",
  ),
  route(
    "/app/profile/edit",
    "profileEdit",
    "Edit Profile",
    "Update your personal account information.",
    "settings",
    true,
  ),
  route(
    "/app/notifications",
    "notifications",
    "Notifications",
    "Stay updated with important activity and tasks.",
    "dashboard",
  ),
  route(
    "/app/settings/company",
    "companyProfile",
    "Company Profile",
    "Manage your organization's details, branding, and contact information.",
    "settings",
  ),
  route(
    "/app/settings/company-profile",
    "companyProfile",
    "Company Profile",
    "Manage your organization's details, branding, and contact information.",
    "settings",
  ),
  route(
    "/app/team",
    "team",
    "Team Management",
    "Manage team members, workloads and access.",
    "team",
  ),
  route(
    "/app/team/new",
    "teamMember",
    "Add Team Member",
    "Invite a team member and configure their access.",
    "team",
    true,
  ),
  route(
    "/app/settings/roles",
    "rolesPermissions",
    "Roles & Permissions",
    "Control access for each member of your admissions team.",
    "settings",
  ),
  route(
    "/app/settings/audit-logs",
    "auditLogs",
    "Audit Logs",
    "Track all important activities, changes and actions performed across the platform.",
    "settings",
  ),
  route(
    "/app/chatbots",
    "chatbots",
    "Chatbots",
    "Manage your conversational AI experiences.",
    "chatbots",
  ),
  route(
    "/app/chatbots/create",
    "createChatbot",
    "Create Chatbot",
    "Set up a new chatbot for your admissions team.",
    "chatbots",
    true,
  ),
  route(
    "/app/chatbots/:chatbotId/builder",
    "chatbotBuilder",
    "Chatbot Builder",
    "Build conversation flows and responses.",
    "chatbots",
    true,
  ),
  route(
    "/app/chatbots/:chatbotId/conversations",
    "chatbotConversations",
    "Chatbot Conversations",
    "View and manage all conversations for this chatbot.",
    "chatbots",
    true,
  ),
  route(
    "/app/chatbots/:id/preview",
    "chatbotPreview",
    "Chatbot Preview",
    "Preview the chatbot experience before publishing.",
    "aiAgents",
  ),
  route(
    "/app/chatbots/:id/settings",
    "chatbotSettings",
    "Chatbot Settings",
    "Update chatbot behaviour and channel settings.",
    "aiAgents",
  ),
  route(
    "/app/knowledge-base",
    "knowledgeBase",
    "Knowledge Base",
    "Manage the sources your AI can use to answer questions.",
    "aiAgents",
  ),
  route(
    "/app/knowledge-base/new",
    "addKnowledgeSource",
    "Add Knowledge Source",
    "Add content for your AI agents to reference.",
    "aiAgents",
    true,
  ),
  route(
    "/app/widget",
    "widget",
    "Website Widget",
    "Manage your website chat widget.",
    "settings",
  ),
  route(
    "/app/widget/customize",
    "widgetCustomize",
    "Widget Customization",
    "Match the widget to your organisation's brand.",
    "settings",
    true,
  ),
  route(
    "/app/widget/embed-code",
    "widgetEmbedCode",
    "Embed Code",
    "Copy the code needed to add the widget to your website.",
    "settings",
  ),
  route(
    "/app/settings/ai",
    "aiAgents",
    "AI Settings",
    "Configure AI agents that help your admissions team.",
    "aiAgents",
  ),
  route(
    "/app/analytics/ai-usage",
    "aiUsage",
    "AI Usage",
    "Track token usage and AI activity.",
    "reports",
  ),
  route(
    "/app/analytics/conversations",
    "conversationAnalytics",
    "Conversation Analytics",
    "Measure conversation activity and outcomes.",
    "reports",
  ),
  route(
    "/app/analytics/calls",
    "callAnalytics",
    "Call Analytics",
    "Measure call performance and outcomes.",
    "reports",
  ),
  route(
    "/app/whatsapp",
    "whatsapp",
    "WhatsApp Dashboard",
    "Manage WhatsApp conversations and account activity.",
    "whatsapp",
  ),
  route(
    "/app/whatsapp/configuration",
    "whatsappConfiguration",
    "WhatsApp Configuration",
    "Manage your WhatsApp Business API connection and integration credentials.",
    "whatsapp",
    true,
  ),

  route(
    "/app/inbox",
    "inbox",
    "Inbox",
    "Review messages waiting for your team.",
    "inbox",
  ),
  route(
    "/app/inbox/all",
    "conversations",
    "All Conversations",
    "Manage conversations from every channel.",
    "conversations",
  ),
  route(
    "/app/inbox/unassigned",
    "inboxUnassigned",
    "Unassigned Conversations",
    "Assign conversations to the right team member.",
    "inbox",
  ),
  route(
    "/app/inbox/mine",
    "inboxMine",
    "My Conversations",
    "Review conversations assigned to you.",
    "inbox",
  ),
  route(
    "/app/inbox/ai",
    "inboxAi",
    "AI Conversations",
    "Review AI-managed conversations.",
    "inbox",
  ),
  route(
    "/app/inbox/human",
    "inboxHuman",
    "Human Conversations",
    "Review conversations handled by your team.",
    "inbox",
  ),
  route(
    "/app/inbox/closed",
    "inboxClosed",
    "Closed Conversations",
    "Review completed conversations.",
    "inbox",
  ),
  route(
    "/app/inbox/:conversationId/customer",
    "customerProfile",
    "Customer Profile",
    "Review the customer's details and interaction history.",
    "inbox",
    true,
  ),
  route(
    "/app/inbox/:conversationId/notes",
    "conversationNotes",
    "Conversation Notes",
    "Review notes saved for this conversation.",
    "inbox",
    true,
  ),
  route(
    "/app/inbox/:conversationId",
    "conversationDetail",
    "Conversation",
    "See the full conversation and assign the next action.",
    "conversations",
    true,
  ),

  route(
    "/app/whatsapp/connect",
    "whatsappConnection",
    "WhatsApp Connection",
    "Connect your WhatsApp Business account.",
    "whatsapp",
    true,
  ),
  route(
    "/app/whatsapp/numbers",
    "whatsappNumbers",
    "WhatsApp Numbers",
    "Manage connected WhatsApp phone numbers.",
    "whatsapp",
  ),
  route(
    "/app/whatsapp/templates",
    "whatsappTemplates",
    "WhatsApp Templates",
    "Create and manage approved WhatsApp templates.",
    "whatsapp",
  ),
  route(
    "/app/whatsapp/templates/new",
    "whatsappCreateTemplate",
    "Create WhatsApp Template",
    "Create a template for proactive messaging.",
    "whatsapp",
    true,
  ),
  route(
    "/app/whatsapp/templates/:id",
    "whatsappTemplateDetail",
    "WhatsApp Template",
    "Review and update this WhatsApp template.",
    "whatsapp",
    true,
  ),
  route(
    "/app/contacts",
    "contacts",
    "Contacts",
    "Keep student and parent contact records organised.",
    "contacts",
  ),
  route(
    "/app/contacts/import",
    "importContacts",
    "Import Contacts",
    "Bring your contacts into Solmento AI.",
    "contacts",
    true,
  ),
  route(
    "/app/contacts/groups",
    "contactGroups",
    "Contact Groups",
    "Organise contacts for targeting and follow-ups.",
    "contacts",
  ),
  route(
    "/app/campaigns",
    "campaigns",
    "Campaigns",
    "Create targeted campaigns to engage prospective students.",
    "campaigns",
  ),
  route(
    "/app/campaigns/bulk-sender",
    "bulkSender",
    "Bulk Sender",
    "Send a campaign to a selected audience.",
    "campaigns",
  ),
  route(
    "/app/campaigns/create",
    "campaignBuilder",
    "Create Campaign",
    "Choose an audience, message and delivery schedule.",
    "campaigns",
    true,
  ),
  route(
    "/app/campaigns/new",
    "campaignBuilder",
    "Create Campaign",
    "Choose an audience, message and delivery schedule.",
    "campaigns",
    true,
  ),
  route(
    "/app/campaigns/:id/analytics",
    "campaignAnalytics",
    "Campaign Analytics",
    "Review campaign engagement and performance.",
    "campaigns",
    true,
  ),
  route(
    "/app/campaigns/:id",
    "campaignDetails",
    "Campaign Details",
    "Review this campaign and its delivery status.",
    "campaigns",
    true,
  ),

  route(
    "/app/leads/dashboard",
    "leadDashboard",
    "Lead Dashboard",
    "Monitor lead volume, activity and conversion.",
    "leadDashboard",
  ),
  route(
    "/app/leads/students",
    "studentLeads",
    "Student Leads",
    "Manage and track all student leads from different sources.",
    "leadDashboard",
  ),
  route(
    "/app/leads/students/:id",
    "studentLeadDetails",
    "Lead Details",
    "View student conversation and key information.",
    "leadDashboard",
    true,
  ),
  route(
    "/app/leads/management",
    "leadManagement",
    "Lead Management",
    "Manage lead statuses, assignments, and follow-ups.",
    "leadDashboard",
  ),
  route(
    "/app/leads/management/edit/:leadId",
    "leadManagementEdit",
    "Edit Lead",
    "Update student lead information.",
    "leadDashboard",
    true,
  ),
  route(
    "/app/counsellor",
    "counsellors",
    "Counsellor",
    "Manage counsellors, departments and team designations.",
    "counsellors",
  ),
  route(
    "/app/counsellor/create",
    "createCounsellor",
    "Create Counsellor",
    "Add a counsellor to your admissions team.",
    "counsellors",
    true,
  ),
  route(
    "/app/leads/kanban",
    "leadKanban",
    "Lead Kanban",
    "Move leads through your admissions pipeline.",
    "leads",
  ),
  route(
    "/app/leads/follow-ups",
    "followUps",
    "Follow-ups",
    "Keep every lead follow-up on track.",
    "leads",
  ),
  route(
    "/app/leads/follow_ups",
    "followUps",
    "Follow-ups",
    "Keep every lead follow-up on track.",
    "leads",
  ),
  route(
    "/app/leads/follow-ups/new",
    "createFollowUp",
    "Schedule Follow-up",
    "Set a reminder to follow up with an assigned student lead.",
    "leads",
    true,
  ),
  route(
    "/app/leads/follow-ups/create",
    "createFollowUp",
    "Schedule Follow-up",
    "Set a reminder to follow up with an assigned student lead.",
    "leads",
    true,
  ),
  route(
    "/app/leads/sources",
    "leadSources",
    "Lead Sources",
    "Understand where your most valuable leads come from.",
    "leads",
  ),
  route(
    "/app/leads/tags",
    "leadTags",
    "Lead Tags",
    "Create and manage labels for your leads.",
    "leads",
  ),
  route(
    "/app/leads/analytics",
    "leadAnalytics",
    "Lead Analytics",
    "Measure the quality and conversion of your leads.",
    "leads",
  ),
  route(
    "/app/leads/:id/edit",
    "editLead",
    "Edit Lead",
    "Update this lead's details and follow-up status.",
    "leads",
    true,
  ),
  route(
    "/app/leads/:id",
    "leadDetail",
    "Lead Profile",
    "Review lead details, activity and follow-up tasks.",
    "leads",
    true,
  ),

  route(
    "/app/counsellors/dashboard",
    "counsellorDashboard",
    "Counsellor Dashboard",
    "Monitor counsellor activity and lead workload.",
    "team",
  ),
  route(
    "/app/counsellors",
    "counsellors",
    "Counsellors",
    "Manage your counsellor team and availability.",
    "team",
  ),
  route(
    "/app/counsellors/new",
    "addCounsellor",
    "Add Counsellor",
    "Add a counsellor to your admissions team.",
    "team",
    true,
  ),
  route(
    "/app/availability",
    "counsellorAvailability",
    "Counsellor Availability",
    "Review and manage counsellor availability.",
    "counsellorAvailability",
  ),
  route(
    "/app/counsellors/availability",
    "counsellorAvailability",
    "Counsellor Availability",
    "Review and manage counsellor availability.",
    "counsellorAvailability",
  ),
  route(
    "/app/performance",
    "counsellorPerformance",
    "Counsellor Performance",
    "Review counsellor performance and conversion.",
    "counsellorPerformance",
  ),
  route(
    "/app/counsellors/performance",
    "counsellorPerformance",
    "Counsellor Performance",
    "Review counsellor performance and conversion.",
    "counsellorPerformance",
  ),
  route(
    "/app/counsellors/:id/performance",
    "counsellorPerformance",
    "Counsellor Performance",
    "Review counsellor performance and conversion.",
    "team",
    true,
  ),
  route(
    "/app/counsellors/:id/activity",
    "counsellorActivity",
    "Counsellor Activity",
    "Review recent counsellor activity.",
    "team",
    true,
  ),
  route(
    "/app/counsellors/:id",
    "counsellorProfile",
    "Counsellor Profile",
    "Review this counsellor's details and workload.",
    "team",
    true,
  ),
  route(
    "/app/head-counsellor/dashboard",
    "headCounsellorDashboard",
    "Head Counsellor Dashboard",
    "Review team performance and admissions activity.",
    "team",
  ),
  route(
    "/app/head-counsellor/team-performance",
    "teamPerformance",
    "Team Performance",
    "Review performance across your counselling team.",
    "team",
  ),
  route(
    "/app/head-counsellor/assign-leads",
    "leadAssignment",
    "Lead Assignment",
    "Assign leads to the right counsellor.",
    "team",
  ),

  route(
    "/app/calls/dashboard",
    "callsDashboard",
    "Voice Dashboard",
    "Monitor calling activity and outcomes.",
    "calls",
  ),
  route(
    "/app/calls",
    "calls",
    "Calls",
    "Track calls, recordings and follow-up outcomes.",
    "calls",
  ),
  route(
    "/app/calls/new",
    "logCall",
    "Log Call Record",
    "Record an outbound/inbound call or schedule an upcoming call with your student lead.",
    "calls",
    true,
  ),
  route(
    "/app/calls/create",
    "logCall",
    "Log Call Record",
    "Record an outbound/inbound call or schedule an upcoming call with your student lead.",
    "calls",
    true,
  ),
  route(
    "/app/calls/analytics",
    "callsAnalytics",
    "Call Analytics",
    "Measure call activity and outcomes.",
    "calls",
  ),
  route(
    "/app/calls/:id/active",
    "activeCall",
    "Active Call",
    "Manage the call currently in progress.",
    "calls",
    true,
  ),
  route(
    "/app/calls/:id/recording",
    "callRecording",
    "Call Recording",
    "Listen to the saved call recording.",
    "calls",
    true,
  ),
  route(
    "/app/calls/:id/transcript",
    "callTranscript",
    "Call Transcript",
    "Review the transcript from this call.",
    "calls",
    true,
  ),
  route(
    "/app/calls/:id",
    "callDetail",
    "Call Details",
    "Review this call and its outcome.",
    "calls",
    true,
  ),

  route(
    "/app/workflows",
    "automation",
    "Automation",
    "Automate repeated work and lead follow-ups.",
    "automation",
  ),
  route(
    "/app/workflows/new",
    "createWorkflow",
    "Create Workflow",
    "Create an automation workflow for your team.",
    "automation",
    true,
  ),
  route(
    "/app/workflows/analytics",
    "workflowAnalytics",
    "Automation Analytics",
    "Measure workflow performance and delivery.",
    "automation",
  ),
  route(
    "/app/workflows/:id/builder",
    "automationBuilder",
    "Workflow Builder",
    "Build a workflow that moves leads forward automatically.",
    "automation",
    true,
  ),
  route(
    "/app/workflows/:id/logs",
    "automationLogs",
    "Automation Logs",
    "Review workflow runs and delivery status.",
    "automation",
  ),
  route(
    "/app/workflows/:id",
    "workflowDetails",
    "Workflow Details",
    "Review this workflow and its configuration.",
    "automation",
    true,
  ),

  route(
    "/app/reports",
    "reports",
    "Reports",
    "Measure performance across leads, campaigns and conversations.",
    "reports",
  ),
  route(
    "/app/reports/leads",
    "leadReports",
    "Lead Reports",
    "Review lead performance and conversion metrics.",
    "reports",
  ),
  route(
    "/app/reports/conversations",
    "conversationReports",
    "Conversation Reports",
    "Review conversation activity and outcomes.",
    "reports",
  ),
  route(
    "/app/reports/whatsapp",
    "whatsappReports",
    "WhatsApp Reports",
    "Review WhatsApp performance and engagement.",
    "reports",
  ),
  route(
    "/app/reports/campaigns",
    "campaignReports",
    "Campaign Reports",
    "Review campaign delivery and engagement.",
    "reports",
  ),
  route(
    "/app/reports/calls",
    "callReports",
    "Call Reports",
    "Review call performance and outcomes.",
    "reports",
  ),
  route(
    "/app/reports/ai",
    "aiReports",
    "AI Reports",
    "Review AI activity and usage metrics.",
    "reports",
  ),
  route(
    "/app/reports/team",
    "teamReports",
    "Team Reports",
    "Review team activity and productivity.",
    "reports",
  ),
  route(
    "/app/reports/export",
    "reportBuilder",
    "Export Reports",
    "Create and export a shareable report.",
    "reports",
    true,
  ),
  route(
    "/app/settings/api-keys",
    "apiKeys",
    "API Keys",
    "Manage API keys for your workspace.",
    "settings",
  ),
  route(
    "/app/settings/webhooks",
    "webhooks",
    "Webhooks",
    "Configure webhook endpoints and events.",
    "settings",
  ),
  route(
    "/app/settings/integrations",
    "integrations",
    "Integrations",
    "Connect the tools your team uses.",
    "settings",
  ),
  route(
    "/app/settings/notifications",
    "notificationSettings",
    "Notification Settings",
    "Choose which alerts your team receives.",
    "settings",
  ),
  route(
    "/app/settings/security",
    "securitySettings",
    "Security Settings",
    "Manage workspace security preferences.",
    "settings",
  ),
  route(
    "/app/settings/account",
    "accountSettings",
    "Account Settings",
    "Update your account preferences.",
    "settings",
  ),
  route(
    "/app/settings/system",
    "systemSettings",
    "System Settings",
    "Manage workspace-level system preferences.",
    "settings",
  ),
  route(
    "/app/settings/subscription",
    "subscription",
    "Subscription & Plan",
    "Review your current subscription and plan usage.",
    "settings",
  ),
  route(
    "/app/support",
    "support",
    "Support Center",
    "Get help with your Solmento AI workspace.",
    "settings",
  ),
];

const staticRoutePaths = clientAdminRouteDefinitions.reduce(
  (paths, definition) => {
    if (!definition.path.includes(":") && !paths[definition.screen]) {
      paths[definition.screen] = definition.path;
    }
    return paths;
  },
  {},
);

// Aliases are used by actions from the existing dashboard where a PDF route
// contains a dynamic id segment.
export const clientAdminRoutes = {
  ...staticRoutePaths,
  profile: "/app/profile",
  profileEdit: "/app/profile/edit",
  notifications: "/app/notifications",
  team: "/app/counsellors",
  settings: "/app/settings/company",
  companyProfile: "/app/settings/company-profile",
  leadDetail: "/app/leads/lead-1",
  studentLeads: "/app/leads/students",
  studentLeadDetails: "/app/leads/students/lead-1",
  leadManagement: "/app/leads/management",
  conversationDetail: "/app/inbox/conversation-1",
  chatbotBuilder: "/app/chatbots/chatbot-1/builder",
  chatbotConversations: "/app/chatbots/chatbot-1/conversations",
  chatbotPreview: "/app/chatbots/chatbot-1/preview",
  chatbotSettings: "/app/chatbots/chatbot-1/settings",
  whatsappTemplateDetail: "/app/whatsapp/templates/template-1",
  campaignDetails: "/app/campaigns/campaign-1",
  campaignAnalytics: "/app/campaigns/campaign-1/analytics",
  editLead: "/app/leads/lead-1/edit",
  counsellorProfile: "/app/counsellors/counsellor-1",
  counsellorPerformance: "/app/counsellors/counsellor-1/performance",
  counsellorActivity: "/app/counsellors/counsellor-1/activity",
  counsellorAvailability: "/app/counsellors/availability",
  callDetail: "/app/calls/call-1",
  activeCall: "/app/calls/call-1/active",
  callRecording: "/app/calls/call-1/recording",
  callTranscript: "/app/calls/call-1/transcript",
  automationBuilder: "/app/workflows/workflow-1/builder",
  automationLogs: "/app/workflows/workflow-1/logs",
  workflowDetails: "/app/workflows/workflow-1",
  myLeads: "/app/leads/students",
  createFollowUp: "/app/leads/follow-ups/new",
  logCall: "/app/calls/new",
  makeCall: "/app/calls/new",
};

const normalisePathname = (pathname = "") => {
  const cleaned = pathname.replace(/\/+$/, "");
  return cleaned || "/";
};

const matchesRoute = (pattern, pathname) => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathnameParts = pathname.split("/").filter(Boolean);

  return (
    patternParts.length === pathnameParts.length &&
    patternParts.every(
      (part, index) => part.startsWith(":") || part === pathnameParts[index],
    )
  );
};

const routeSpecificity = (path) =>
  path
    .split("/")
    .filter(Boolean)
    .reduce((score, part) => score + (part.startsWith(":") ? 0 : 1), 0);

export function resolveClientAdminRoute(pathname) {
  const normalisedPath = normalisePathname(pathname);

  return clientAdminRouteDefinitions.reduce((bestMatch, definition) => {
    if (!matchesRoute(definition.path, normalisedPath)) return bestMatch;
    if (
      !bestMatch ||
      routeSpecificity(definition.path) > routeSpecificity(bestMatch.path)
    ) {
      return definition;
    }
    return bestMatch;
  }, null);
}

export const clientAdminScreens = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Here is what is happening with your admissions today.",
  },
  profile: {
    title: "Profile",
    subtitle: "Manage your account and organization information.",
  },
  profileEdit: {
    title: "Edit Profile",
    subtitle: "Update your personal account information.",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Stay updated with important activity and tasks.",
  },

  inbox: { title: "Inbox", subtitle: "Review messages waiting for your team." },
  leads: {
    title: "Counsellor",
    subtitle: "Manage counsellors, departments and team designations.",
    detail: "leadDetail",
  },
  counsellors: {
    title: "Counsellor",
    subtitle: "Manage counsellors, departments and team designations.",
  },
  createCounsellor: {
    title: "Create Counsellor",
    subtitle: "Add a counsellor to your admissions team.",
  },
  leadDetail: {
    title: "Lead profile",
    subtitle: "Review lead details, activity and follow-up tasks.",
  },
  studentLeads: {
    title: "Student Leads",
    subtitle: "Manage and track all student leads from different sources.",
  },
  studentLeadDetails: {
    title: "Lead Details",
    subtitle: "View student conversation and key information.",
  },
  leadManagement: {
    title: "Lead Management",
    subtitle: "Manage lead statuses, assignments, and follow-ups.",
  },
  conversations: {
    title: "Conversations",
    subtitle: "Manage conversations from every channel.",
    detail: "conversationDetail",
  },
  conversationDetail: {
    title: "Conversation",
    subtitle: "See the full conversation and assign the next action.",
  },
  chatbotConversations: {
    title: "Chatbot Conversations",
    subtitle: "View and manage all conversations for this chatbot.",
  },
  aiAgents: {
    title: "AI Agents",
    subtitle: "Configure AI agents that help your admissions team.",
    detail: "aiAgentConfig",
  },
  aiAgentConfig: {
    title: "AI agent configuration",
    subtitle: "Set agent instructions, channels and handoff rules.",
  },
  whatsapp: {
    title: "WhatsApp",
    subtitle: "Connect WhatsApp and manage incoming conversations.",
  },
  whatsappConfiguration: {
    title: "WhatsApp Configuration",
    subtitle: "Manage your WhatsApp Business API connection and integration credentials.",
    detail: true,
  },
  followUps: {
    title: "Follow-ups",
    subtitle: "Keep every lead follow-up on track.",
  },
  createFollowUp: {
    title: "Schedule Follow-up",
    subtitle: "Set a reminder to follow up with an assigned student lead.",
  },
  calls: {
    title: "Calls",
    subtitle: "Track calls, recordings and follow-up outcomes.",
  },
  logCall: {
    title: "Log Call Record",
    subtitle: "Record an outbound/inbound call or schedule an upcoming call with your student lead.",
  },
  makeCall: {
    title: "Log Call Record",
    subtitle: "Record an outbound/inbound call or schedule an upcoming call with your student lead.",
  },
  campaigns: {
    title: "Campaigns",
    subtitle: "Create targeted campaigns to engage prospective students.",
    detail: "campaignBuilder",
  },
  campaignBuilder: {
    title: "Create campaign",
    subtitle: "Choose an audience, message and delivery schedule.",
  },
  automation: {
    title: "Automation",
    subtitle: "Automate repeated work and lead follow-ups.",
    detail: "automationBuilder",
  },
  automationBuilder: {
    title: "Automation builder",
    subtitle: "Build a workflow that moves leads forward automatically.",
  },
  contacts: {
    title: "Contacts",
    subtitle: "Keep your student and parent contact records organised.",
  },
  reports: {
    title: "Reports",
    subtitle: "Measure performance across leads, campaigns and conversations.",
    detail: "reportBuilder",
  },
  reportBuilder: {
    title: "Build report",
    subtitle: "Select metrics and create a shareable report.",
  },
  team: {
    title: "Team",
    subtitle: "Manage team members, workloads and access.",
  },
  teamMember: {
    title: "Team member",
    subtitle: "Review performance, availability and assignments.",
  },
  settings: {
    title: "Settings",
    subtitle: "Update your workspace preferences and integrations.",
  },
  companyProfile: {
    title: "Company Profile",
    subtitle:
      "Manage your organization's details, branding, and contact information.",
  },
  auditLogs: {
    title: "Audit Logs",
    subtitle: "Track all important activities, changes and actions performed across the platform.",
  },
};

export const clientAdminNav = [
  ["dashboard", "Dashboard", "LayoutDashboard"],
  ["inbox", "Inbox", "Inbox"],
  ["counsellors", "Counsellor", "UsersRound"],
  ["leadDashboard", "Lead", "MessagesSquare"],
  ["chatbots", "Chatbots", "Bot"],
  ["calls", "Calls", "Phone"],
  ["whatsapp", "WhatsApp", "MessageCircle"],
  ["campaigns", "Campaigns", "Send"],
  ["reports", "Reports", "BarChart3"],
  ["settings", "Settings", "Settings2"],
];

export const counsellorNav = [
  ["counsellorDashboard", "Dashboard", "LayoutDashboard"],
  ["inbox", "Inbox", "Inbox"],
  ["studentLeads", "My Leads", "UsersRound"],
  ["followUps", "Follow-ups", "CalendarDays"],
  ["calls", "Calls", "Phone"],
  ["counsellorPerformance", "Performance", "BarChart3"],
  ["counsellorAvailability", "Availability", "CalendarDays"],
];

const COUNSELLOR_NAV_PERMISSIONS = {
  counsellorDashboard: "dashboard.view",
  inbox: "inbox.view",
  studentLeads: "my_leads.view",
  followUps: "follow_ups.view",
  calls: "calls.view",
  counsellorPerformance: "performance.view",
  counsellorAvailability: "availability.view",
};

export function getNavForRole(role, permissions = []) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return clientAdminNav;
  }

  if (role === "COUNSELLOR" || role === "HEAD_COUNSELLOR" || !role) {
    if (Array.isArray(permissions) && permissions.length > 0) {
      const filtered = counsellorNav.filter(([key]) => {
        const requiredPerm = COUNSELLOR_NAV_PERMISSIONS[key];
        return !requiredPerm || permissions.includes(requiredPerm);
      });
      if (permissions.includes("team")) {
        filtered.push(["team", "Team", "Users"]);
      }
      return filtered.length > 0 ? filtered : counsellorNav;
    }

    const nav = [...counsellorNav];
    if (permissions && permissions.includes("team")) {
      nav.push(["team", "Team", "Users"]);
    }
    return nav;
  }

  return clientAdminNav;
}

