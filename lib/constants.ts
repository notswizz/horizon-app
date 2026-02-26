// Board IDs
export const JOBS_BOARD_ID = "18401043296";
export const CREW_BOARD_ID = "18401499452";

// Group IDs
export const GROUPS = {
  GEFA_REVIEW: "group_mm0xbxhe",
  WORK_SCHEDULED: "group_mm0xxz3h",
  READY_TO_SCHEDULE: "group_mm0x5ng4",
  AWAITING_APPROVAL: "group_mm0x79sr",
  MODELING_SOW: "group_mm0xvb7z",
  NEW_LEADS_AUDIT: "group_mm0x6bx6",
  COMPLETED: "group_mm0wqejy",
  CANCELLED: "group_mm0wrba",
} as const;

// All groups that represent active (non-terminal) jobs
export const ACTIVE_GROUPS: Set<string> = new Set([
  GROUPS.NEW_LEADS_AUDIT,
  GROUPS.MODELING_SOW,
  GROUPS.AWAITING_APPROVAL,
  GROUPS.READY_TO_SCHEDULE,
  GROUPS.WORK_SCHEDULED,
  GROUPS.GEFA_REVIEW,
]);

// Status values and their display colors
export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Audit Scheduled": { bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400", border: "border-blue-500/30" },
  "Waiting for Customer Docs": { bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-400", border: "border-yellow-500/30" },
  "Model + Confirm SOW": { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400", border: "border-orange-500/30" },
  "Proposal Submitted": { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400", border: "border-orange-500/30" },
  "Sub Approval": { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400", border: "border-amber-500/30" },
  "Rebate Accepted": { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-400", border: "border-green-500/30" },
  "Work Scheduled": { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/30" },
  "Work Complete": { bg: "bg-purple-500/20", text: "text-purple-400", dot: "bg-purple-400", border: "border-purple-500/30" },
  "GEFA Review (Post Install)": { bg: "bg-violet-500/20", text: "text-violet-400", dot: "bg-violet-400", border: "border-violet-500/30" },
  "Cancelled": { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-400", border: "border-red-500/30" },
  "DLQ": { bg: "bg-gray-500/20", text: "text-gray-400", dot: "bg-gray-400", border: "border-gray-500/30" },
};

// Program type colors
export const PROGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  HER: { bg: "bg-blue-500/20", text: "text-blue-400" },
  HEAR: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  GHEFA: { bg: "bg-violet-500/20", text: "text-violet-400" },
  IRA: { bg: "bg-amber-500/20", text: "text-amber-400" },
};

// Status pipeline order (for funnel display)
export const STATUS_PIPELINE = [
  "Audit Scheduled",
  "Waiting for Customer Docs",
  "Model + Confirm SOW",
  "Proposal Submitted",
  "Sub Approval",
  "Rebate Accepted",
  "Work Scheduled",
  "Work Complete",
  "GEFA Review (Post Install)",
] as const;

// Group pipeline order + display config
export const GROUP_PIPELINE: { id: string; label: string; icon: string; bg: string; text: string; dot: string }[] = [
  { id: GROUPS.NEW_LEADS_AUDIT, label: "New Leads / Audit", icon: "📋", bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  { id: GROUPS.MODELING_SOW, label: "Modeling & SOW", icon: "📝", bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  { id: GROUPS.AWAITING_APPROVAL, label: "Awaiting Approval", icon: "⏳", bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  { id: GROUPS.READY_TO_SCHEDULE, label: "Ready to Schedule", icon: "✅", bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-400" },
  { id: GROUPS.WORK_SCHEDULED, label: "Work Scheduled", icon: "🔨", bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  { id: GROUPS.GEFA_REVIEW, label: "GEFA Review", icon: "🔍", bg: "bg-violet-500/20", text: "text-violet-400", dot: "bg-violet-400" },
];

// All statuses including terminal
export const ALL_STATUSES = [
  ...STATUS_PIPELINE,
  "Cancelled",
  "DLQ",
] as const;

// Column IDs for Jobs board
export const JOB_COLUMNS = {
  STATUS: "status",
  HOMEOWNER: "homeowner",
  PHONE: "phone",
  EMAIL: "email",
  NEXT_STEPS: "next_steps",
  AUDIT_DATE: "audit_date",
  LOCATION: "location_mm0szye6",
  INSPECTION_NOTES: "long_text_mm0wjbte",
  PROCESS_NOTES: "process_notes",
  APPLIANCE_NOTES: "appliance_notes",
  PROGRAM_TYPE_OLD: "program_type",
  PROGRAM_TYPE: "color_mm0wchee",
  PROJECT_ID: "project_id",
  WORK_TODO: "work_todo",
  WORK_COMPLETE: "work_complete",
  INVOICE_STATUS: "invoice_status",
  REBATE_AMOUNT: "rebate_amount",
  APPROVED_AMOUNT: "approved_amount",
  GEFA_PAID: "gefa_paid",
  INSPECTION_STATUS: "inspection_status",
  COMPANYCAM_LINK: "link_mm0s5adz",
  SNUGGPRO_LINK: "link_mm0wqh0a",
  INSPECTION_DATE: "date_mm0xf868",
  ASSIGNED_CREW: "board_relation_mm0xea94",
} as const;

// Column IDs for Crew board
export const CREW_COLUMNS = {
  PHONE: "text_mm0xw7gh",
  EMAIL: "email_mm0x4r1r",
  ROLE: "color_mm0xmaws",
  AVAILABILITY: "color_mm0xphvt",
} as const;

// ─── Sub Work Board ──────────────────────────────────────
export const SUB_BOARD_ID = "18401794803";

export const SUB_COLUMNS = {
  PHONE: "text_mm0ybaxa",
  EMAIL: "text_mm0yn10k",
  ADDRESS: "text_mm0y5xrk",
  WORK_TYPE: "color_mm0y88zh",
  SCOPE: "long_text_mm0yb5ep",
  WIRING_COMPLETE: "color_mm0yryr0",
  NG_APPROVAL: "color_mm0ymj51",
  GOOD_TO_SUBMIT: "color_mm0ynqpv",
  COMPANYCAM_LINK: "link_mm0y708b",
  SCHEDULED_DATE: "date_mm0y95cq",
  COMPLETION_DATE: "date_mm0yyva3",
  NOTES: "long_text_mm0ya22k",
  RELATED_JOB: "board_relation_mm0yy7bq",
} as const;

export const SUB_GROUPS = {
  WH_READY: "group_mm0yxpae",
  WH_WAITING: "group_mm0ypnj9",
  WH_NEXTGEN: "group_mm0yst82",
  ELEC_PRE_SUB: "group_mm0y47aw",
  ELEC_APPLIED: "group_mm0ynd3r",
  COMPLETED: "group_mm0ytpx9",
  CANCELLED: "group_mm0ycv2t",
} as const;

export const SUB_GROUP_PIPELINE: { id: string; label: string; icon: string; bg: string; text: string; dot: string }[] = [
  { id: SUB_GROUPS.WH_READY, label: "WH Ready", icon: "🔥", bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-400" },
  { id: SUB_GROUPS.WH_WAITING, label: "WH Waiting", icon: "⏳", bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  { id: SUB_GROUPS.WH_NEXTGEN, label: "WH NextGen", icon: "📋", bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
  { id: SUB_GROUPS.ELEC_PRE_SUB, label: "Elec Pre-Sub", icon: "⚡", bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  { id: SUB_GROUPS.ELEC_APPLIED, label: "Elec Applied", icon: "📝", bg: "bg-violet-500/20", text: "text-violet-400", dot: "bg-violet-400" },
  { id: SUB_GROUPS.COMPLETED, label: "Completed", icon: "✅", bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
];

// Navigation items
export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/jobs", label: "Jobs", icon: "Briefcase" },
  { href: "/schedule", label: "Schedule", icon: "Calendar" },
  { href: "/sub", label: "Sub Work", icon: "Wrench" },
  { href: "/crew", label: "Crew", icon: "Users" },
] as const;
