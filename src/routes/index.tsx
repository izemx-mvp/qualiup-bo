import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  FlaskConical,
  TrendingUp,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Panel, PageHeader, StatCard, StatusBadge } from "@/components/app/ui-kit";
import { automationTrend, TODAY } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard opérationnel — QualiUp AI Back-Office" },
      {
        name: "description",
        content:
          "Vue de contrôle temps réel : demandes reçues, prélèvements du jour, activité des agents IA et performance.",
      },
      { property: "og:title", content: "Dashboard opérationnel — QualiUp AI Back-Office" },
      {
        property: "og:description",
        content: "Demandes, planning, actions IA à valider et indicateurs de performance QualiUp.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const store = useStore();
  const { requests, samplings, actions, agents, aiEvents, preleveurs } = store;

  const todayOps = samplings.filter((o) => o.date === TODAY);
  const received = requests.filter((r) => r.receivedAt.startsWith(TODAY)).length;
  const toValidate = requests.filter((r) => r.status === "à valider").length;
  const pendingActions = actions.filter((a) => a.status === "en attente");
  const executed = actions.filter((a) => a.status === "approuvée" || a.status === "modifiée").length;
  const refused = actions.filter((a) => a.status === "refusée").length;
  const errors = aiEvents.filter((e) => e.status === "erreur").length;
  const doneToday = todayOps.filter((o) => o.status === "réalisé");
  const caToday = doneToday.reduce((sum, o) => sum + o.price, 0);
  const automation = Math.round(
    (executed / Math.max(1, executed + refused + pendingActions.length)) * 100 + 58,
  );

  return (
    <>
      <PageHeader
        eyebrow="Accueil"
        title="Centre de contrôle opérationnel"
        description={`Situation au ${TODAY}. Les agents IA opèrent, QualiUp valide les décisions sensibles.`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/activite">Activité IA</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/validation">
                <BadgeCheck className="h-4 w-4" />
                {pendingActions.length} action{pendingActions.length > 1 ? "s" : ""} à valider
              </Link>
            </Button>
          </>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Aujourd'hui
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Demandes reçues" value={received} icon={ClipboardList} />
          <StatCard label="Demandes à valider" value={toValidate} tone="warning" icon={BadgeCheck} />
          <StatCard
            label="Prélèvements planifiés"
            value={todayOps.filter((o) => o.status === "planifié").length}
            icon={CalendarClock}
          />
          <StatCard
            label="En cours"
            value={todayOps.filter((o) => o.status === "en cours").length}
            tone="info"
            icon={Clock}
          />
          <StatCard label="Terminés" value={doneToday.length} tone="success" icon={CheckCircle2} />
          <StatCard
            label="En retard"
            value={samplings.filter((o) => o.status === "en retard").length}
            tone="danger"
            icon={AlertTriangle}
          />
          <StatCard
            label="Préleveurs disponibles"
            value={preleveurs.filter((p) => p.active).length}
            icon={UserCheck}
          />
        </div>
      </section>

      <section className="mb-6 grid gap-3 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Intelligence artificielle
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Agents actifs" value={agents.filter((a) => a.active).length} icon={Bot} />
            <StatCard label="En attente" value={pendingActions.length} tone="warning" />
            <StatCard label="Exécutées" value={executed} tone="success" />
            <StatCard label="Refusées" value={refused} tone="danger" icon={XCircle} />
            <StatCard label="Erreurs IA" value={errors} tone="danger" icon={AlertTriangle} />
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Performance
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Taux d'automatisation" value={`${Math.min(automation, 92)} %`} tone="success" icon={TrendingUp} />
            <StatCard label="Traitement moyen" value="2,4 min" hint="Réception → proposition" icon={Clock} />
            <StatCard label="Prélèvements" value={todayOps.length} icon={FlaskConical} />
            <StatCard label="CA du jour" value={`${caToday.toLocaleString("fr-FR")} MAD`} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Actions IA en attente de validation"
          description="Le système n'exécute rien avant décision humaine."
          className="xl:col-span-2"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/validation">Tout voir</Link>
            </Button>
          }
        >
          <div className="space-y-2">
            {pendingActions.slice(0, 4).map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.category.toLowerCase()} className="border-border bg-surface text-foreground" />
                    <span className="text-xs text-muted-foreground">{store.agentName(a.agentId)}</span>
                  </div>
                  <div className="mt-1 truncate text-sm font-medium">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {a.proposal.join(" · ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-xs text-muted-foreground">{a.confidence} %</span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/validation">Examiner</Link>
                  </Button>
                </div>
              </div>
            ))}
            {pendingActions.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune action en attente. Les agents opèrent dans leur périmètre autorisé.
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Derniers événements IA" description="Événements opérationnels, pas de conversations.">
          <div className="space-y-3">
            {aiEvents.slice(0, 6).map((e) => (
              <div key={e.id} className="flex gap-3 text-sm">
                <div className="num w-10 shrink-0 text-xs text-muted-foreground">{e.time}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{store.agentName(e.agentId)}</div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
          <Button asChild variant="ghost" size="sm" className="mt-3 w-full gap-1.5">
            <Link to="/activite">
              <Activity className="h-3.5 w-3.5" /> Voir toute l'activité
            </Link>
          </Button>
        </Panel>
      </div>

      <Panel
        title="Automatisation vs validation humaine"
        description="Part des actions IA exécutées automatiquement, par semaine."
        className="mt-4"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={automationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis unit=" %" tickLine={false} axisLine={false} fontSize={12} />
              <ReTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="automatisation"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.15}
                name="Automatisation"
                unit=" %"
              />
              <Area
                type="monotone"
                dataKey="validation"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.2}
                name="Validation humaine"
                unit=" %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
