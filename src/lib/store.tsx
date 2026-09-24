import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import * as seed from "./demo-data";
import type {
  AiAgent,
  AiEvent,
  AppUser,
  AuditEvent,
  BusinessRule,
  CalendarConfig,
  CommunicationTemplate,
  CompanyInfo,
  Customer,
  Faq,
  GeneralSettings,
  Integration,
  KbDocument,
  KnowledgeStatus,
  NotificationRule,
  PendingAction,
  PlanningConfig,
  Preleveur,
  PriorityRule,
  Sampling,
  SamplingRequest,
  SecuritySettings,
  SentMessage,
  Site,
  SystemLog,
  UserRole,
} from "./qualiup-types";

let seq = 1000;
const uid = (prefix: string) => `${prefix}${++seq}`;

const nowStamp = () => `${seed.TODAY} ${new Date().toTimeString().slice(0, 5)}`;
const nowTime = () => new Date().toTimeString().slice(0, 5);

interface State {
  currentUserId: string;
  customers: Customer[];
  sites: Site[];
  preleveurs: Preleveur[];
  requests: SamplingRequest[];
  samplings: Sampling[];
  agents: AiAgent[];
  actions: PendingAction[];
  businessRules: BusinessRule[];
  priorityRules: PriorityRule[];
  faqs: Faq[];
  documents: KbDocument[];
  templates: CommunicationTemplate[];
  sentMessages: SentMessage[];
  integrations: Integration[];
  aiEvents: AiEvent[];
  systemLogs: SystemLog[];
  auditEvents: AuditEvent[];
  users: AppUser[];
  notificationRules: NotificationRule[];
  planning: PlanningConfig;
  calendar: CalendarConfig;
  general: GeneralSettings;
  security: SecuritySettings;
  company: CompanyInfo;
  knowledge: KnowledgeStatus;
}

const initialState: State = {
  currentUserId: "u1",
  customers: seed.customers,
  sites: seed.sites,
  preleveurs: seed.preleveurs,
  requests: seed.requests,
  samplings: seed.samplings,
  agents: seed.agents,
  actions: seed.pendingActions,
  businessRules: seed.businessRules,
  priorityRules: seed.priorityRules,
  faqs: seed.faqs,
  documents: seed.kbDocuments,
  templates: seed.templates,
  sentMessages: seed.sentMessages,
  integrations: seed.integrations,
  aiEvents: seed.aiEvents,
  systemLogs: seed.systemLogs,
  auditEvents: seed.auditEvents,
  users: seed.appUsers,
  notificationRules: seed.notificationRules,
  planning: seed.planningConfig,
  calendar: seed.calendarConfig,
  general: seed.generalSettings,
  security: seed.securitySettings,
  company: seed.companyInfo,
  knowledge: seed.knowledgeStatus,
};

export const ROLE_SECTIONS: Record<UserRole, string[]> = {
  Administrateur: ["accueil", "demandes", "planning", "connaissances", "notifications"],
  "Responsable opérations": ["accueil", "demandes", "planning", "notifications"],
  "Service client": ["accueil", "demandes", "connaissances", "notifications"],
  Direction: ["accueil", "demandes", "planning", "notifications"],
  Technique: ["accueil", "planning", "connaissances", "notifications"],
};

interface StoreApi extends State {
  currentUser: AppUser;
  setCurrentUser: (id: string) => void;
  can: (section: string) => boolean;
  // lookups
  customerName: (id: string) => string;
  siteName: (id: string) => string;
  site: (id: string) => Site | undefined;
  preleveurName: (id: string) => string;
  agentName: (id: string) => string;
  // AI actions
  decideAction: (id: string, decision: "approuvée" | "refusée" | "modifiée", reason?: string) => void;
  toggleAgent: (id: string) => void;
  updateAgent: (id: string, patch: Partial<AiAgent>) => void;
  setPermission: (agentId: string, action: string, level: AiAgent["permissions"][number]["level"]) => void;
  // requests / operations
  updateRequest: (id: string, patch: Partial<SamplingRequest>) => void;
  updateSampling: (id: string, patch: Partial<Sampling>) => void;
  // rules
  addBusinessRule: (rule: Omit<BusinessRule, "id">) => void;
  updateBusinessRule: (id: string, patch: Partial<BusinessRule>) => void;
  deleteBusinessRule: (id: string) => void;
  togglePriorityRule: (id: string) => void;
  movePriorityRule: (id: string, dir: -1 | 1) => void;
  // knowledge base
  addFaq: (faq: Omit<Faq, "id">) => void;
  updateFaq: (id: string, patch: Partial<Faq>) => void;
  deleteFaq: (id: string) => void;
  addDocument: (doc: Omit<KbDocument, "id">) => void;
  deleteDocument: (id: string) => void;
  reindexKnowledge: () => void;
  syncKnowledge: () => void;
  // templates
  addTemplate: (tpl: Omit<CommunicationTemplate, "id">) => void;
  updateTemplate: (id: string, patch: Partial<CommunicationTemplate>) => void;
  deleteTemplate: (id: string) => void;
  // preleveurs & clients
  updatePreleveur: (id: string, patch: Partial<Preleveur>) => void;
  addPreleveur: (p: Omit<Preleveur, "id">) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addCustomer: (c: Omit<Customer, "id">) => void;
  addSite: (s: Omit<Site, "id">) => void;
  updateSite: (id: string, patch: Partial<Site>) => void;
  // integrations
  testIntegration: (id: string) => void;
  reconnectIntegration: (id: string) => void;
  updateIntegration: (id: string, patch: Partial<Integration>) => void;
  // config
  updatePlanning: (patch: Partial<PlanningConfig>) => void;
  updateCalendar: (patch: Partial<CalendarConfig>) => void;
  updateGeneral: (patch: Partial<GeneralSettings>) => void;
  updateSecurity: (patch: Partial<SecuritySettings>) => void;
  updateCompany: (patch: Partial<CompanyInfo>) => void;
  updateNotificationRule: (id: string, patch: Partial<NotificationRule>) => void;
  // users
  addUser: (u: Omit<AppUser, "id">) => void;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  // shared
  logAudit: (action: string, object: string, before: string, after: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? state.users[0]!,
    [state.users, state.currentUserId],
  );

  const logAudit = useCallback(
    (action: string, object: string, before: string, after: string) => {
      setState((s) => {
        const user = s.users.find((u) => u.id === s.currentUserId);
        return {
          ...s,
          auditEvents: [
            {
              id: uid("au"),
              user: user?.name.split(" ")[0] ?? "Utilisateur",
              date: nowStamp(),
              action,
              object,
              before,
              after,
            },
            ...s.auditEvents,
          ],
        };
      });
    },
    [],
  );

  const pushEvent = useCallback((event: Omit<AiEvent, "id">) => {
    setState((s) => ({ ...s, aiEvents: [{ id: uid("e"), ...event }, ...s.aiEvents] }));
  }, []);

  const pushLog = useCallback((log: Omit<SystemLog, "id">) => {
    setState((s) => ({ ...s, systemLogs: [{ id: uid("l"), ...log }, ...s.systemLogs] }));
  }, []);

  const api: StoreApi = {
    ...state,
    currentUser,
    setCurrentUser: (id) => {
      patch({ currentUserId: id });
      const u = state.users.find((x) => x.id === id);
      toast.success(`Profil actif : ${u?.name} (${u?.role})`);
    },
    can: (section) => ROLE_SECTIONS[currentUser.role].includes(section),

    customerName: (id) => state.customers.find((c) => c.id === id)?.name ?? "—",
    siteName: (id) => state.sites.find((s) => s.id === id)?.name ?? "—",
    site: (id) => state.sites.find((s) => s.id === id),
    preleveurName: (id) => state.preleveurs.find((p) => p.id === id)?.name ?? "—",
    agentName: (id) => state.agents.find((a) => a.id === id)?.name ?? "—",

    decideAction: (id, decision, reason) => {
      setState((s) => {
        const action = s.actions.find((a) => a.id === id);
        if (!action) return s;
        const actions = s.actions.map((a) =>
          a.id === id
            ? {
                ...a,
                status: decision,
                ...(reason ? { decisionReason: reason } : {}),
                decidedBy: currentUser.name.split(" ")[0] ?? "Utilisateur",
              }
            : a,
        );
        let requests = s.requests;
        let samplings = s.samplings;
        if (action.requestRef) {
          requests = s.requests.map((r) => {
            if (r.ref !== action.requestRef) return r;
            if (decision === "refusée") return { ...r, status: "refusée" as const };
            return { ...r, status: "planifiée" as const };
          });
          const req = s.requests.find((r) => r.ref === action.requestRef);
          if (req && decision !== "refusée" && !s.samplings.some((o) => o.requestRef === req.ref)) {
            samplings = [
              {
                id: uid("o"),
                ref: `PRL-${2600 + s.samplings.length + 1}`,
                requestRef: req.ref,
                customerId: req.customerId,
                siteId: req.siteId,
                date: req.recommendation.date,
                slot: req.recommendation.slot,
                preleveurId: req.recommendation.preleveurId,
                analysisType: req.analysisType,
                samples: req.samples,
                status: "planifié",
                price: req.samples * 420,
                lab: req.lab,
              },
              ...s.samplings,
            ];
          }
        }
        return { ...s, actions, requests, samplings };
      });
      const label = decision === "approuvée" ? "approuvée" : decision === "refusée" ? "refusée" : "modifiée puis approuvée";
      logAudit("Validation d'action IA", id, "en attente", decision);
      pushEvent({
        time: nowTime(),
        date: seed.TODAY,
        agentId: state.actions.find((a) => a.id === id)?.agentId ?? "a1",
        title: `Action ${label} par ${currentUser.name.split(" ")[0]}`,
        fields: reason ? { Motif: reason } : {},
        status: decision === "refusée" ? "refusé" : "succès",
      });
      toast.success(`Action ${label}. Décision enregistrée dans l'audit.`);
    },

    toggleAgent: (id) => {
      const agent = state.agents.find((a) => a.id === id);
      if (!agent) return;
      patch({ agents: state.agents.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) });
      logAudit("Changement d'état d'un agent", agent.name, agent.active ? "actif" : "inactif", agent.active ? "inactif" : "actif");
      toast.success(`${agent.name} ${agent.active ? "désactivé" : "activé"}.`);
    },

    updateAgent: (id, p) => {
      patch({ agents: state.agents.map((a) => (a.id === id ? { ...a, ...p } : a)) });
      const agent = state.agents.find((a) => a.id === id);
      logAudit("Modification configuration agent", agent?.name ?? id, "configuration précédente", "configuration mise à jour");
      toast.success("Configuration de l'agent enregistrée.");
    },

    setPermission: (agentId, action, level) => {
      const agent = state.agents.find((a) => a.id === agentId);
      const before = agent?.permissions.find((p) => p.action === action)?.level ?? "—";
      patch({
        agents: state.agents.map((a) =>
          a.id === agentId
            ? { ...a, permissions: a.permissions.map((p) => (p.action === action ? { ...p, level } : p)) }
            : a,
        ),
      });
      logAudit("Modification permission agent", `${agent?.name} — ${action}`, before, level);
      toast.success(`Permission mise à jour : ${action} → ${level}.`);
    },

    updateRequest: (id, p) => {
      patch({ requests: state.requests.map((r) => (r.id === id ? { ...r, ...p } : r)) });
      toast.success("Demande mise à jour.");
    },

    updateSampling: (id, p) => {
      const op = state.samplings.find((o) => o.id === id);
      patch({ samplings: state.samplings.map((o) => (o.id === id ? { ...o, ...p } : o)) });
      if (p.status && op) logAudit("Changement de statut d'opération", op.ref, op.status, p.status);
      toast.success("Opération mise à jour.");
    },

    addBusinessRule: (rule) => {
      patch({ businessRules: [...state.businessRules, { ...rule, id: uid("br") }] });
      logAudit("Création règle métier", rule.name, "—", `SI ${rule.condition} ALORS ${rule.action}`);
      toast.success("Règle métier créée.");
    },
    updateBusinessRule: (id, p) => {
      const rule = state.businessRules.find((r) => r.id === id);
      patch({ businessRules: state.businessRules.map((r) => (r.id === id ? { ...r, ...p } : r)) });
      if (rule && p.active !== undefined)
        logAudit("Changement d'état règle métier", rule.name, rule.active ? "active" : "inactive", p.active ? "active" : "inactive");
      toast.success("Règle mise à jour.");
    },
    deleteBusinessRule: (id) => {
      const rule = state.businessRules.find((r) => r.id === id);
      patch({ businessRules: state.businessRules.filter((r) => r.id !== id) });
      logAudit("Suppression règle métier", rule?.name ?? id, "active", "supprimée");
      toast.success("Règle supprimée.");
    },
    togglePriorityRule: (id) => {
      patch({ priorityRules: state.priorityRules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)) });
      toast.success("Critère mis à jour.");
    },
    movePriorityRule: (id, dir) => {
      const list = [...state.priorityRules];
      const i = list.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      const a = list[i]!;
      const b = list[j]!;
      list[i] = b;
      list[j] = a;
      patch({ priorityRules: list });
      logAudit("Réordonnancement des priorités", a.label, `position ${i + 1}`, `position ${j + 1}`);
    },

    addFaq: (faq) => {
      patch({ faqs: [...state.faqs, { ...faq, id: uid("f") }], knowledge: { ...state.knowledge, status: "désynchronisée" } });
      logAudit("Création FAQ", faq.question, "—", "créée");
      toast.success("FAQ ajoutée. Pensez à réindexer la base.");
    },
    updateFaq: (id, p) => {
      patch({ faqs: state.faqs.map((f) => (f.id === id ? { ...f, ...p } : f)), knowledge: { ...state.knowledge, status: "désynchronisée" } });
      toast.success("FAQ mise à jour.");
    },
    deleteFaq: (id) => {
      const f = state.faqs.find((x) => x.id === id);
      patch({ faqs: state.faqs.filter((x) => x.id !== id), knowledge: { ...state.knowledge, status: "désynchronisée" } });
      logAudit("Suppression FAQ", f?.question ?? id, "active", "supprimée");
      toast.success("FAQ supprimée.");
    },
    addDocument: (doc) => {
      patch({ documents: [...state.documents, { ...doc, id: uid("d") }], knowledge: { ...state.knowledge, status: "désynchronisée" } });
      logAudit("Ajout document", doc.name, "—", "ajouté");
      toast.success("Document ajouté à la base de connaissances.");
    },
    deleteDocument: (id) => {
      const d = state.documents.find((x) => x.id === id);
      patch({ documents: state.documents.filter((x) => x.id !== id), knowledge: { ...state.knowledge, status: "désynchronisée" } });
      logAudit("Suppression document", d?.name ?? id, "indexé", "supprimé");
      toast.success("Document supprimé.");
    },
    reindexKnowledge: () => {
      patch({
        knowledge: {
          lastSync: nowStamp(),
          indexedChunks: 60 * state.faqs.filter((f) => f.active).length + 80 * state.documents.length,
          status: "à jour",
        },
        documents: state.documents.map((d) => ({ ...d, indexed: true })),
      });
      pushLog({ timestamp: nowStamp(), agent: "Agent Service Client", workflow: "kb-reindex", event: "Réindexation de la base de connaissances", status: "succès", duration: "6,2 s" });
      toast.success("Base réindexée : contenu disponible pour les agents.");
    },
    syncKnowledge: () => {
      patch({ knowledge: { ...state.knowledge, lastSync: nowStamp(), status: "à jour" } });
      toast.success("Base synchronisée avec les agents IA.");
    },

    addTemplate: (tpl) => {
      patch({ templates: [...state.templates, { ...tpl, id: uid("t") }] });
      logAudit("Création modèle de message", tpl.name, "—", "créé");
      toast.success("Modèle créé.");
    },
    updateTemplate: (id, p) => {
      const t = state.templates.find((x) => x.id === id);
      patch({ templates: state.templates.map((x) => (x.id === id ? { ...x, ...p } : x)) });
      if (t && p.active !== undefined)
        logAudit("Changement d'état modèle", t.name, t.active ? "actif" : "inactif", p.active ? "actif" : "inactif");
      toast.success("Modèle mis à jour.");
    },
    deleteTemplate: (id) => {
      const t = state.templates.find((x) => x.id === id);
      patch({ templates: state.templates.filter((x) => x.id !== id) });
      logAudit("Suppression modèle", t?.name ?? id, "actif", "supprimé");
      toast.success("Modèle supprimé.");
    },

    updatePreleveur: (id, p) => {
      const prev = state.preleveurs.find((x) => x.id === id);
      patch({ preleveurs: state.preleveurs.map((x) => (x.id === id ? { ...x, ...p } : x)) });
      if (prev && p.maxDaily !== undefined && p.maxDaily !== prev.maxDaily)
        logAudit("Modification charge préleveur", prev.name, String(prev.maxDaily), String(p.maxDaily));
      toast.success("Préleveur mis à jour.");
    },
    addPreleveur: (p) => {
      patch({ preleveurs: [...state.preleveurs, { ...p, id: uid("p") }] });
      logAudit("Création préleveur", p.name, "—", "créé");
      toast.success("Préleveur ajouté.");
    },
    updateCustomer: (id, p) => {
      patch({ customers: state.customers.map((c) => (c.id === id ? { ...c, ...p } : c)) });
      toast.success("Client mis à jour.");
    },
    addCustomer: (c) => {
      patch({ customers: [...state.customers, { ...c, id: uid("c") }] });
      toast.success("Client créé.");
    },
    addSite: (s) => {
      patch({ sites: [...state.sites, { ...s, id: uid("s") }] });
      toast.success("Site créé.");
    },
    updateSite: (id, p) => {
      patch({ sites: state.sites.map((s) => (s.id === id ? { ...s, ...p } : s)) });
      toast.success("Site mis à jour.");
    },

    testIntegration: (id) => {
      const integ = state.integrations.find((i) => i.id === id);
      if (!integ) return;
      const ok = integ.status !== "déconnecté";
      patch({
        integrations: state.integrations.map((i) =>
          i.id === id ? { ...i, lastEvent: nowStamp(), lastSync: ok ? nowStamp() : i.lastSync } : i,
        ),
      });
      pushLog({
        timestamp: nowStamp(),
        agent: "Système",
        workflow: `test-${integ.id}`,
        event: `Test de connexion — ${integ.name}`,
        status: ok ? "succès" : "erreur",
        duration: ok ? "0,8 s" : "30,0 s",
        ...(ok ? {} : { error: "Connexion refusée" }),
      });
      if (ok) toast.success(`${integ.name} : test réussi (${nowStamp()}).`);
      else toast.error(`${integ.name} : test échoué. Reconnectez l'intégration.`);
    },
    reconnectIntegration: (id) => {
      const integ = state.integrations.find((i) => i.id === id);
      patch({
        integrations: state.integrations.map((i) =>
          i.id === id ? { ...i, status: "connecté", errors: 0, lastEvent: nowStamp(), lastSync: nowStamp(), webhookActive: true } : i,
        ),
      });
      logAudit("Reconnexion intégration", integ?.name ?? id, integ?.status ?? "—", "connecté");
      toast.success(`${integ?.name} reconnecté.`);
    },
    updateIntegration: (id, p) => {
      patch({ integrations: state.integrations.map((i) => (i.id === id ? { ...i, ...p } : i)) });
      toast.success("Intégration mise à jour.");
    },

    updatePlanning: (p) => {
      const before = state.planning;
      patch({ planning: { ...before, ...p } });
      if (p.maxDaily !== undefined && p.maxDaily !== before.maxDaily)
        logAudit("Modification règle planning", "Maximum prélèvements/jour", String(before.maxDaily), String(p.maxDaily));
      toast.success("Règles de planification enregistrées.");
    },
    updateCalendar: (p) => {
      patch({ calendar: { ...state.calendar, ...p } });
      toast.success("Configuration calendrier enregistrée.");
    },
    updateGeneral: (p) => {
      patch({ general: { ...state.general, ...p } });
      toast.success("Paramètres généraux enregistrés.");
    },
    updateSecurity: (p) => {
      patch({ security: { ...state.security, ...p } });
      logAudit("Modification paramètres de sécurité", "Sécurité", "valeurs précédentes", "valeurs mises à jour");
      toast.success("Paramètres de sécurité enregistrés.");
    },
    updateCompany: (p) => {
      patch({ company: { ...state.company, ...p }, knowledge: { ...state.knowledge, status: "désynchronisée" } });
      toast.success("Informations générales enregistrées.");
    },
    updateNotificationRule: (id, p) => {
      patch({ notificationRules: state.notificationRules.map((n) => (n.id === id ? { ...n, ...p } : n)) });
      toast.success("Notification mise à jour.");
    },

    addUser: (u) => {
      patch({ users: [...state.users, { ...u, id: uid("u") }] });
      logAudit("Création utilisateur", u.name, "—", u.role);
      toast.success("Utilisateur créé.");
    },
    updateUser: (id, p) => {
      const u = state.users.find((x) => x.id === id);
      patch({ users: state.users.map((x) => (x.id === id ? { ...x, ...p } : x)) });
      if (u && p.role && p.role !== u.role) logAudit("Modification rôle utilisateur", u.name, u.role, p.role);
      toast.success("Utilisateur mis à jour.");
    },
    deleteUser: (id) => {
      const u = state.users.find((x) => x.id === id);
      patch({ users: state.users.filter((x) => x.id !== id) });
      logAudit("Suppression utilisateur", u?.name ?? id, u?.role ?? "—", "supprimé");
      toast.success("Utilisateur supprimé.");
    },

    logAudit,
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans StoreProvider");
  return ctx;
}
