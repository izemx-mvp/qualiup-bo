import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCircle2, Clock3, MessageCircle } from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/app/ui-kit";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
 head: () => ({ meta: [
  { title: "Notifications & relances — QualiUp" }, { name: "description", content: "Modèles WhatsApp, relances automatiques et historique des messages opérationnels QualiUp." },
  { property: "og:title", content: "Notifications & relances — QualiUp" }, { property: "og:description", content: "Pilotez les messages opérationnels envoyés par l’agent QualiUp." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
 ]}), component: NotificationsPage,
});

function NotificationsPage(){const store=useStore();const waiting=store.sentMessages.filter(m=>m.status==="à valider").length;return <><PageHeader eyebrow="Communication WhatsApp" title="Notifications & relances" description="Définissez quels messages partent automatiquement et lesquels nécessitent votre validation."/>
 <div className="mb-5 grid gap-3 sm:grid-cols-3"><StatCard label="Modèles actifs" value={store.templates.filter(t=>t.active).length} icon={BellRing}/><StatCard label="Messages envoyés" value={store.sentMessages.filter(m=>m.status==="envoyé").length} icon={CheckCircle2} tone="success"/><StatCard label="À valider" value={waiting} icon={Clock3} tone="warning"/></div>
 <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
  <Panel title="Modèles WhatsApp" description="Confirmation, rappel, suivi du préleveur et disponibilité des résultats."><div className="grid gap-3 md:grid-cols-2">{store.templates.map(t=><div key={t.id} className="rounded-lg border bg-surface/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-panel"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold">{t.name}</div><div className="mt-1 text-xs text-muted-foreground">{t.trigger}</div></div><Switch checked={t.active} onCheckedChange={active=>store.updateTemplate(t.id,{active})}/></div><p className="mt-4 line-clamp-3 text-xs leading-5 text-muted-foreground">{t.body}</p><div className="mt-4"><StatusBadge status={t.approvalMode}/></div></div>)}</div></Panel>
  <Panel title="Relances incomplètes" description="L’agent demande uniquement les informations manquantes."><div className="rounded-lg border border-warning/30 bg-warning/10 p-5"><MessageCircle className="mb-6 h-6 w-6 text-warning"/><div className="text-sm font-semibold">1 demande à relancer</div><p className="mt-1 text-xs text-muted-foreground">Bio Farm Souss · demande #250</p><p className="mt-4 text-sm">Informations manquantes : nombre d’échantillons et date souhaitée.</p><StatusBadge status="validation humaine" className="mt-4"/></div></Panel>
 </div>
 <Panel title="Historique des messages envoyés" description="Uniquement les notifications opérationnelles sortantes, sans conversation client." className="mt-4"><div className="space-y-1">{store.sentMessages.map(m=><div key={m.id} className="grid gap-2 border-b py-3 text-sm last:border-0 sm:grid-cols-[140px_1fr_90px_110px]"><span className="num text-xs text-muted-foreground">{m.sentAt}</span><span><b>{m.customer}</b> · {m.template}</span><span className="num">{m.requestRef}</span><StatusBadge status={m.status}/></div>)}</div></Panel>
 </>}