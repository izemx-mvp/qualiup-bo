import { createFileRoute } from "@tanstack/react-router";
import { CalendarCog, Clock3, MapPinned, Users } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/app/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/planning")({
 head: () => ({ meta: [
  { title: "Paramètres de planification IA — QualiUp" }, { name: "description", content: "Configurez les règles et le calendrier utilisés par l’agent IA." },
  { property: "og:title", content: "Paramètres de planification IA — QualiUp" }, { property: "og:description", content: "Durées, créneaux, capacité et calendrier de l’agent QualiUp." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
 ]}), component: PlanningPage,
});

function PlanningPage() {
 const store = useStore(); const p = store.planning;
 return <><PageHeader eyebrow="Configuration IA" title="Paramètres de planification" description="Ces règles encadrent toutes les propositions de créneau faites par l’agent." />
  <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Durée standard" value={`${p.defaultDuration} min`} icon={Clock3}/><StatCard label="Capacité quotidienne" value={p.maxDaily} icon={Users}/><StatCard label="Début de journée" value={p.workStart} icon={CalendarCog}/><StatCard label="Regroupement par site" value="Actif" icon={MapPinned} tone="success"/></div>
  <div className="grid gap-4 xl:grid-cols-2">
   <Panel title="Règles de l’agent" description="Modifiez une valeur pour l’appliquer aux prochaines propositions."><div className="grid gap-5 sm:grid-cols-2">
    <Field label="Début des créneaux"><Input type="time" value={p.workStart} onChange={(e)=>store.updatePlanning({workStart:e.target.value})}/></Field>
    <Field label="Fin des créneaux"><Input type="time" value={p.workEnd} onChange={(e)=>store.updatePlanning({workEnd:e.target.value})}/></Field>
    <Field label="Durée par défaut (min)"><Input type="number" value={p.defaultDuration} onChange={(e)=>store.updatePlanning({defaultDuration:Number(e.target.value)})}/></Field>
    <Field label="Maximum par jour"><Input type="number" value={p.maxDaily} onChange={(e)=>store.updatePlanning({maxDaily:Number(e.target.value)})}/></Field>
    <Field label="Battement entre visites (min)"><Input type="number" value={p.buffer} onChange={(e)=>store.updatePlanning({buffer:Number(e.target.value)})}/></Field>
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"><div><Label>Regrouper par site</Label><p className="text-xs text-muted-foreground">Réduit les déplacements</p></div><Switch defaultChecked /></div>
   </div></Panel>
   <Panel title="Calendrier connecté" description="Choisissez la source de disponibilité consultée par l’agent."><div className="space-y-5"><Field label="Fournisseur"><Select value={store.calendar.provider} onValueChange={(v)=>store.updateCalendar({provider:v as typeof store.calendar.provider})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="QualiUp interne">Calendrier interne</SelectItem><SelectItem value="Google Calendar">Google Calendar</SelectItem><SelectItem value="Microsoft Outlook">Microsoft Outlook</SelectItem></SelectContent></Select></Field><div className="rounded-lg border bg-primary p-5 text-primary-foreground"><CalendarCog className="mb-8 h-6 w-6"/><p className="text-sm font-semibold">Synchronisation bidirectionnelle</p><p className="mt-1 text-xs text-primary-foreground/70">Les indisponibilités sont prises en compte avant toute proposition.</p></div></div></Panel>
  </div></>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <div className="space-y-2"><Label>{label}</Label>{children}</div>}