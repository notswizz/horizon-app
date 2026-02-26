import { JOBS_BOARD_ID, CREW_BOARD_ID, SUB_BOARD_ID, JOB_COLUMNS, CREW_COLUMNS, SUB_COLUMNS } from "./constants";

const MONDAY_API_URL = "https://api.monday.com/v2";

// ─── Types ───────────────────────────────────────────────────────────

export interface MondayColumnValue {
  id: string;
  text: string;
  value: string | null;
  type: string;
}

export interface MondayItem {
  id: string;
  name: string;
  group: { id: string; title: string };
  column_values: MondayColumnValue[];
  updated_at: string;
}

export interface Job {
  id: string;
  name: string;
  group: string;
  groupTitle: string;
  status: string;
  homeowner: string;
  phone: string;
  email: string;
  nextSteps: string;
  auditDate: string;
  inspectionDate: string;
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  inspectionNotes: string;
  processNotes: string;
  applianceNotes: string;
  programType: string;
  projectId: string;
  workTodo: string;
  workComplete: string;
  invoiceStatus: string;
  rebateAmount: number | null;
  approvedAmount: number | null;
  gefaPaid: string;
  inspectionStatus: string;
  companyCamLink: string;
  snuggProLink: string;
  assignedCrewIds: string[];
  assignedCrewNames: string[];
  updatedAt: string;
}

export interface CrewMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  availability: string;
}

export interface DashboardStats {
  totalActive: number;
  pipelineValue: number;
  readyToSchedule: number;
  thisWeekWork: number;
  statusCounts: Record<string, number>;
  groupCounts: Record<string, number>;
}

export interface ActivityEvent {
  id: string;
  type: "status" | "edit" | "new" | "move" | "crew";
  description: string;
  jobName: string;
  jobId: string;
  timestamp: string;
  statusFrom?: string;
  statusTo?: string;
}

export interface SubItem {
  id: string;
  name: string;
  group: string;
  groupTitle: string;
  phone: string;
  email: string;
  address: string;
  workType: string;
  scope: string;
  wiringComplete: string;
  ngApproval: string;
  goodToSubmit: string;
  companyCamLink: string;
  scheduledDate: string;
  completionDate: string;
  notes: string;
  relatedJobIds: string[];
  updatedAt: string;
}

// ─── GraphQL Client ──────────────────────────────────────────────────

export async function mondayQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const apiKey = process.env.MONDAY_API_KEY;
  if (!apiKey) throw new Error("MONDAY_API_KEY not set");

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Monday API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.errors) {
    throw new Error(`Monday GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  return data.data as T;
}

// ─── Column Value Parsers ────────────────────────────────────────────

function getColumnText(columns: MondayColumnValue[], id: string): string {
  return columns.find((c) => c.id === id)?.text ?? "";
}

function getColumnValue(columns: MondayColumnValue[], id: string): string | null {
  return columns.find((c) => c.id === id)?.value ?? null;
}

function parseNumber(columns: MondayColumnValue[], id: string): number | null {
  const text = getColumnText(columns, id);
  if (!text) return null;
  const num = parseFloat(text.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? null : num;
}

function parseLocation(columns: MondayColumnValue[], id: string): { address: string; lat: number | null; lng: number | null } {
  const raw = getColumnValue(columns, id);
  if (!raw) return { address: getColumnText(columns, id), lat: null, lng: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      address: parsed.address || getColumnText(columns, id),
      lat: parsed.lat ?? null,
      lng: parsed.lng ?? null,
    };
  } catch {
    return { address: getColumnText(columns, id), lat: null, lng: null };
  }
}

function parseLink(columns: MondayColumnValue[], id: string): string {
  const raw = getColumnValue(columns, id);
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return parsed.url || "";
  } catch {
    return getColumnText(columns, id);
  }
}

function parseBoardRelation(columns: MondayColumnValue[], id: string): string[] {
  const raw = getColumnValue(columns, id);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.linkedPulseIds?.map((p: { linkedPulseId: number }) => String(p.linkedPulseId)) ?? [];
  } catch {
    return [];
  }
}

function parseLongText(columns: MondayColumnValue[], id: string): string {
  const raw = getColumnValue(columns, id);
  if (!raw) return getColumnText(columns, id);
  try {
    const parsed = JSON.parse(raw);
    return parsed.text || getColumnText(columns, id);
  } catch {
    return getColumnText(columns, id);
  }
}

// ─── Item to Job Mapper ─────────────────────────────────────────────

export function itemToJob(item: MondayItem, crewNames?: Map<string, string>): Job {
  const cols = item.column_values;
  const loc = parseLocation(cols, JOB_COLUMNS.LOCATION);
  const crewIds = parseBoardRelation(cols, JOB_COLUMNS.ASSIGNED_CREW);

  return {
    id: item.id,
    name: item.name,
    group: item.group.id,
    groupTitle: item.group.title,
    status: getColumnText(cols, JOB_COLUMNS.STATUS),
    homeowner: getColumnText(cols, JOB_COLUMNS.HOMEOWNER) || item.name,
    phone: getColumnText(cols, JOB_COLUMNS.PHONE),
    email: getColumnText(cols, JOB_COLUMNS.EMAIL),
    nextSteps: parseLongText(cols, JOB_COLUMNS.NEXT_STEPS),
    auditDate: getColumnText(cols, JOB_COLUMNS.AUDIT_DATE),
    inspectionDate: getColumnText(cols, JOB_COLUMNS.INSPECTION_DATE),
    location: loc.address,
    locationLat: loc.lat,
    locationLng: loc.lng,
    inspectionNotes: parseLongText(cols, JOB_COLUMNS.INSPECTION_NOTES),
    processNotes: parseLongText(cols, JOB_COLUMNS.PROCESS_NOTES),
    applianceNotes: parseLongText(cols, JOB_COLUMNS.APPLIANCE_NOTES),
    programType: getColumnText(cols, JOB_COLUMNS.PROGRAM_TYPE),
    projectId: getColumnText(cols, JOB_COLUMNS.PROJECT_ID),
    workTodo: parseLongText(cols, JOB_COLUMNS.WORK_TODO),
    workComplete: getColumnText(cols, JOB_COLUMNS.WORK_COMPLETE),
    invoiceStatus: getColumnText(cols, JOB_COLUMNS.INVOICE_STATUS),
    rebateAmount: parseNumber(cols, JOB_COLUMNS.REBATE_AMOUNT),
    approvedAmount: parseNumber(cols, JOB_COLUMNS.APPROVED_AMOUNT),
    gefaPaid: getColumnText(cols, JOB_COLUMNS.GEFA_PAID),
    inspectionStatus: getColumnText(cols, JOB_COLUMNS.INSPECTION_STATUS),
    companyCamLink: parseLink(cols, JOB_COLUMNS.COMPANYCAM_LINK),
    snuggProLink: parseLink(cols, JOB_COLUMNS.SNUGGPRO_LINK),
    assignedCrewIds: crewIds,
    assignedCrewNames: crewNames
      ? crewIds.map((id) => crewNames.get(id) ?? "Unknown")
      : [],
    updatedAt: item.updated_at,
  };
}

// ─── Query Functions ─────────────────────────────────────────────────

export async function fetchAllJobs(): Promise<Job[]> {
  // Fetch crew names first for relation mapping
  const crewData = await mondayQuery<{
    boards: { items_page: { items: { id: string; name: string }[] } }[];
  }>(`query {
    boards(ids: [${CREW_BOARD_ID}]) {
      items_page(limit: 100) {
        items {
          id
          name
        }
      }
    }
  }`);

  const crewNames = new Map<string, string>();
  crewData.boards[0]?.items_page.items.forEach((item) => {
    crewNames.set(item.id, item.name);
  });

  // Fetch all jobs
  const data = await mondayQuery<{
    boards: { items_page: { items: MondayItem[] } }[];
  }>(`query {
    boards(ids: [${JOBS_BOARD_ID}]) {
      items_page(limit: 500) {
        items {
          id
          name
          group { id title }
          updated_at
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }`);

  return data.boards[0]?.items_page.items.map((item) => itemToJob(item, crewNames)) ?? [];
}

export async function fetchJob(itemId: string): Promise<Job | null> {
  const data = await mondayQuery<{
    items: MondayItem[];
  }>(`query {
    items(ids: [${itemId}]) {
      id
      name
      group { id title }
      updated_at
      column_values {
        id
        text
        value
        type
      }
    }
  }`);

  const item = data.items[0];
  if (!item) return null;

  // Fetch crew names for relations
  const crewIds = parseBoardRelation(item.column_values, JOB_COLUMNS.ASSIGNED_CREW);
  const crewNames = new Map<string, string>();

  if (crewIds.length > 0) {
    const crewData = await mondayQuery<{
      items: { id: string; name: string }[];
    }>(`query {
      items(ids: [${crewIds.join(",")}]) {
        id
        name
      }
    }`);
    crewData.items.forEach((c) => crewNames.set(c.id, c.name));
  }

  return itemToJob(item, crewNames);
}

export async function updateJobColumn(
  itemId: string,
  columnId: string,
  value: string
): Promise<void> {
  await mondayQuery(
    `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: String!) {
      change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }`,
    {
      boardId: JOBS_BOARD_ID,
      itemId,
      columnId,
      value,
    }
  );
}

export async function updateJobColumnJSON(
  itemId: string,
  columnId: string,
  value: unknown
): Promise<void> {
  const jsonValue = JSON.stringify(value);
  await mondayQuery(
    `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }`,
    {
      boardId: JOBS_BOARD_ID,
      itemId,
      columnId,
      value: jsonValue,
    }
  );
}

export async function createJob(
  name: string,
  columnValues: Record<string, unknown>
): Promise<string> {
  const data = await mondayQuery<{
    create_item: { id: string };
  }>(
    `mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        group_id: $groupId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }`,
    {
      boardId: JOBS_BOARD_ID,
      groupId: "group_mm0x6bx6", // New Leads / Audit
      itemName: name,
      columnValues: JSON.stringify(columnValues),
    }
  );
  return data.create_item.id;
}

export async function fetchCrew(): Promise<CrewMember[]> {
  const data = await mondayQuery<{
    boards: { items_page: { items: MondayItem[] } }[];
  }>(`query {
    boards(ids: [${CREW_BOARD_ID}]) {
      items_page(limit: 100) {
        items {
          id
          name
          group { id title }
          updated_at
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }`);

  return (
    data.boards[0]?.items_page.items.map((item) => ({
      id: item.id,
      name: item.name,
      phone: getColumnText(item.column_values, CREW_COLUMNS.PHONE),
      email: getColumnText(item.column_values, CREW_COLUMNS.EMAIL),
      role: getColumnText(item.column_values, CREW_COLUMNS.ROLE),
      availability: getColumnText(item.column_values, CREW_COLUMNS.AVAILABILITY),
    })) ?? []
  );
}

// ─── Sub Work ────────────────────────────────────────────────────────

export function itemToSubItem(item: MondayItem): SubItem {
  const cols = item.column_values;
  return {
    id: item.id,
    name: item.name,
    group: item.group.id,
    groupTitle: item.group.title,
    phone: getColumnText(cols, SUB_COLUMNS.PHONE),
    email: getColumnText(cols, SUB_COLUMNS.EMAIL),
    address: getColumnText(cols, SUB_COLUMNS.ADDRESS),
    workType: getColumnText(cols, SUB_COLUMNS.WORK_TYPE),
    scope: parseLongText(cols, SUB_COLUMNS.SCOPE),
    wiringComplete: getColumnText(cols, SUB_COLUMNS.WIRING_COMPLETE),
    ngApproval: getColumnText(cols, SUB_COLUMNS.NG_APPROVAL),
    goodToSubmit: getColumnText(cols, SUB_COLUMNS.GOOD_TO_SUBMIT),
    companyCamLink: parseLink(cols, SUB_COLUMNS.COMPANYCAM_LINK),
    scheduledDate: getColumnText(cols, SUB_COLUMNS.SCHEDULED_DATE),
    completionDate: getColumnText(cols, SUB_COLUMNS.COMPLETION_DATE),
    notes: parseLongText(cols, SUB_COLUMNS.NOTES),
    relatedJobIds: parseBoardRelation(cols, SUB_COLUMNS.RELATED_JOB),
    updatedAt: item.updated_at,
  };
}

export async function fetchAllSubItems(): Promise<SubItem[]> {
  const data = await mondayQuery<{
    boards: { items_page: { items: MondayItem[] } }[];
  }>(`query {
    boards(ids: [${SUB_BOARD_ID}]) {
      items_page(limit: 500) {
        items {
          id
          name
          group { id title }
          updated_at
          column_values {
            id
            text
            value
            type
          }
        }
      }
    }
  }`);

  return data.boards[0]?.items_page.items.map((item) => itemToSubItem(item)) ?? [];
}

export async function fetchSubItem(itemId: string): Promise<SubItem | null> {
  const data = await mondayQuery<{
    items: MondayItem[];
  }>(`query {
    items(ids: [${itemId}]) {
      id
      name
      group { id title }
      updated_at
      column_values {
        id
        text
        value
        type
      }
    }
  }`);

  const item = data.items[0];
  if (!item) return null;
  return itemToSubItem(item);
}

export async function updateSubColumn(
  itemId: string,
  columnId: string,
  value: string
): Promise<void> {
  await mondayQuery(
    `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: String!) {
      change_simple_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }`,
    {
      boardId: SUB_BOARD_ID,
      itemId,
      columnId,
      value,
    }
  );
}

export async function updateSubColumnJSON(
  itemId: string,
  columnId: string,
  value: unknown
): Promise<void> {
  const jsonValue = JSON.stringify(value);
  await mondayQuery(
    `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }`,
    {
      boardId: SUB_BOARD_ID,
      itemId,
      columnId,
      value: jsonValue,
    }
  );
}
