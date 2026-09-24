import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CalendarCheck, CircleAlert, Clock3, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Tableau de bord IA — QualiUp" },
    { name: "description", content: "Supervision des demandes WhatsApp, planifications, validations et notifications QualiUp." },
    { property: "og:title", content: "Tableau de bord IA — QualiUp" },
    { property: "og:description", content: "Pilotez l’agent IA de prélèvement QualiUp." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const store = useStore();
  const planned = store.requests.filter((r) => r.status === "planifiée").length;
  const pending = store.requests.filter((r) => r.status === "à valider").length;
  const incomplete = store.requests.filter((r) => r.status === "clarification").length;
  const sent = store.sentMessages.filter((m) => m.status === "envoyé").length;
  const whatsapp = store.requests.filter((r) => r.source === "WhatsApp").length;
  return <>
    <PageHeader eyebrow="Pilotage quotidien" title="Tableau de bord IA" description="L’agent transforme les demandes WhatsApp en propositions prêtes à valider." actions={<Button asChild><Link to="/demandes">Voir les validations <ArrowRight className="h-4 w-4" /></Link></Button>} />
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Demandes WhatsApp" value={whatsapp} icon={MessageCircle} hint="détectées par l’agent" />
      <StatCard label="Planifiées" value={planned} tone="success" icon={CalendarCheck} />
      <StatCard label="À valider" value={pending} tone="warning" icon={Clock3} />
      <StatCard label="Incomplètes" value={incomplete} tone="danger" icon={CircleAlert} />
      <StatCard label="Messages envoyés" value={sent} icon={Sparkles} hint="confirmations et rappels" />
    </section>
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Panel title="À valider maintenant" description="Chaque proposition sensible attend une décision humaine.">
        <div className="space-y-3">{store.actions.filter((a) => a.status === "en attente").slice(0,4).map((a) => <div key={a.id} className="group grid min-w-0 grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-lg border bg-surface/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-panel sm:grid-cols-[40px_minmax(0,1fr)_70px_auto] sm:items-center"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20"><Bot className="h-5 w-5 text-accent-foreground" /></div><div className="min-w-0"><div className="font-semibold">{a.title}</div><div className="mt-1 text-xs leading-5 text-muted-foreground">{a.proposal.join(" · ")}</div></div><div className="col-start-2 flex items-center gap-2 sm:col-start-auto sm:block sm:text-right"><div className="num text-sm font-bold text-primary">{a.confidence}%</div><span className="text-[10px] text-muted-foreground">confiance IA</span></div><Button asChild size="sm" variant="outline" className="col-start-2 w-fit sm:col-start-auto">{(() => { const r = store.requests.find((x) => x.ref === a.requestRef); return r ? <Link to="/demandes/$id" params={{ id: r.id }}>Examiner</Link> : <Link to="/demandes">Examiner</Link>; })()}</Button></div>)}</div>
      </Panel>
      <Panel title="Flux de l’agent" description="Dernières opérations structurées.">
        <div className="space-y-4">{store.aiEvents.slice(0,6).map((e) => <div key={e.id} className="flex gap-3"><span className="num w-10 shrink-0 text-xs text-muted-foreground">{e.time}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{e.title}</div><div className="text-[11px] text-muted-foreground">{store.agentName(e.agentId)}</div></div><StatusBadge status={e.status} /></div>)}</div>
      </Panel>
    </div>
  </>;
}