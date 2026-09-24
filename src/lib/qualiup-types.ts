export type Urgency = "basse" | "normale" | "élevée" | "critique";
export type RequestStatus =
  | "à valider"
  | "validée"
  | "planifiée"
  | "refusée"
  | "clarification";
export type SamplingStatus =
  | "planifié"
  | "en cours"
  | "réalisé"
  | "en retard"
  | "annulé";
export type PermissionLevel = "autorisé" | "validation" | "interdit";
export type ActionStatus = "en attente" | "approuvée" | "refusée" | "modifiée";
export type IntegrationStatus = "connecté" | "dégradé" | "déconnecté";
export type UserRole =
  | "Administrateur"
  | "Responsable opérations"
  | "Service client"
  | "Direction"
  | "Technique";

export interface Customer {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  sector: string;
  active: boolean;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  address: string;
  city: string;
  sector: string;
  lab: string;
}

export interface Preleveur {
  id: string;
  name: string;
  lab: string;
  skills: string[];
  analysisTypes: string[];
  hours: string;
  maxDaily: number;
  area: string;
  active: boolean;
  availability: Record<string, boolean>;
}

export interface ExtractionField {
  label: string;
  value: string;
  confidence: number;
}

export interface Recommendation {
  date: string;
  slot: string;
  preleveurId: string;
  lab: string;
  reason: string;
}

export interface SamplingRequest {
  id: string;
  ref: string;
  receivedAt: string;
  customerId: string;
  siteId: string;
  lab: string;
  analysisType: string;
  samples: number;
  urgency: Urgency;
  requestedDate: string;
  requestedTime: string;
  source: "WhatsApp" | "Email" | "Téléphone" | "API";
  status: RequestStatus;
  confidence: number;
  notes: string;
  originalMessage?: string;
  extraction: ExtractionField[];
  recommendation: Recommendation;
}

export interface Sampling {
  id: string;
  ref: string;
  requestRef: string;
  customerId: string;
  siteId: string;
  date: string;
  slot: string;
  preleveurId: string;
  analysisType: string;
  samples: number;
  status: SamplingStatus;
  price: number;
  lab: string;
}

export interface AgentField {
  label: string;
  required: boolean;
}

export interface AgentPermission {
  action: string;
  level: PermissionLevel;
}

export interface AiAgent {
  id: string;
  name: string;
  description: string;
  active: boolean;
  hours: string;
  autoThreshold: number;
  validateThreshold: number;
  detectionRules: string;
  fields: AgentField[];
  permissions: AgentPermission[];
  actionsToday: number;
  successRate: number;
  comms?: {
    confirmationEnabled: boolean;
    confirmationTiming: string;
    reminderDayBefore: boolean;
    reminderSameDay: boolean;
    reminderTiming: string;
    reschedulePolicy: "propose" | "auto" | "validation";
    cancellationAllowed: boolean;
    cancellationNeedsApproval: boolean;
    resultsNotification: boolean;
  };
}

export interface PendingAction {
  id: string;
  category: string;
  agentId: string;
  title: string;
  proposal: string[];
  reason: string;
  confidence: number;
  impact: "faible" | "moyen" | "élevé";
  createdAt: string;
  status: ActionStatus;
  requestRef?: string;
  decisionReason?: string;
  decidedBy?: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
  scope: string;
}

export interface PriorityRule {
  id: string;
  label: string;
  active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  priority: number;
}

export interface KbDocument {
  id: string;
  name: string;
  category: string;
  size: string;
  visibility: "interne" | "client" | "public";
  keywords: string;
  updatedAt: string;
  indexed: boolean;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  trigger: string;
  channel: "WhatsApp" | "Email" | "SMS";
  body: string;
  active: boolean;
  approvalMode: "automatique" | "validation humaine";
}

export interface SentMessage {
  id: string;
  sentAt: string;
  customer: string;
  requestRef: string;
  template: string;
  channel: "WhatsApp";
  status: "envoyé" | "à valider";
}

export interface IntegrationDetail {
  label: string;
  value: string;
  masked?: boolean;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  lastEvent: string;
  lastSync: string;
  errors: number;
  details: IntegrationDetail[];
  webhookActive: boolean;
}

export interface AiEvent {
  id: string;
  time: string;
  date: string;
  agentId: string;
  title: string;
  fields: Record<string, string>;
  status: "succès" | "validation requise" | "erreur" | "refusé";
}

export interface SystemLog {
  id: string;
  timestamp: string;
  agent: string;
  workflow: string;
  event: string;
  status: "succès" | "erreur" | "avertissement";
  duration: string;
  error?: string;
}

export interface AuditEvent {
  id: string;
  user: string;
  date: string;
  action: string;
  object: string;
  before: string;
  after: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin: string;
}

export interface NotificationRule {
  id: string;
  label: string;
  recipients: string;
  email: boolean;
  inApp: boolean;
}

export interface PlanningConfig {
  workStart: string;
  workEnd: string;
  workDays: string[];
  durations: number[];
  defaultDuration: number;
  buffer: number;
  travelBuffer: number;
  maxDaily: number;
  holidays: string;
  groupBySite: boolean;
}

export interface CalendarConfig {
  provider: "Calendrier QualiUp" | "Google Calendar" | "Microsoft Outlook";
  calendarName: string;
  syncFrequency: string;
  conflictBehavior: string;
  lastTest: string;
}

export interface GeneralSettings {
  company: string;
  timezone: string;
  language: string;
  labs: string[];
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordMinLength: number;
  mfa: boolean;
  ipRestriction: boolean;
  auditRetention: number;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  website: string;
  social: string;
  hours: string;
  labs: string;
}

export interface KnowledgeStatus {
  lastSync: string;
  indexedChunks: number;
  status: "à jour" | "désynchronisée" | "indexation";
}

export interface LabInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  email: string;
}

export interface RequiredField {
  id: string;
  label: string;
  active: boolean;
}
