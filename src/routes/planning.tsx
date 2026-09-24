import { createFileRoute } from "@tanstack/react-router";
import { CalendarCog, CheckCircle2, Clock3, Loader2, MapPinned, RotateCcw, Save, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, StatCard } from "@/components/app/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import type { CalendarConfig, PlanningConfig } from "@/lib/qualiup-types";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Paramètres de planification IA — QualiUp" },
      { name: "description", content: "Configurez les règles et le calendrier utilisés par l’agent IA." },
      { property: "og:title", content: "Paramètres de planification IA — QualiUp" },
      { property: "og:description", content: "Durées, créneaux, capacité et calendrier de l’agent QualiUp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanningPage,
});

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const PROVIDERS: CalendarConfig["provider"][] = ["Calendrier QualiUp", "Google Calendar", "Microsoft Outlook"];

function slotsFor(p: PlanningConfig) {
  const [sh, sm] = p.workStart.split(":").map(Number);
  const [eh, em] = p.workEnd.split(":").map(Number);
  const start = (sh ?? 0) * 60 + (sm ?? 0);
  const end = (eh ?? 0) * 60 + (em ?? 0);
  const step = Math.max(15, p.defaultDuration + p.buffer);
  const out: string[] = [];
  for (let t = start; t + p.defaultDuration <= end && out.length < 24; t += step) {
    const f = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    out.push(`${f(t)}–${f(t + p.defaultDuration)}`);
  }
  return out;
}

function PlanningPage() {
  const store = useStore();
  const [p, setP] = useState<PlanningConfig>(store.planning);
  const [cal, setCal] = useState<CalendarConfig>(store.calendar);
  const [testing, setTesting] = useState(false);
  useEffect(() => setP(store.planning), [store.planning]);
  useEffect(() => setCal(store.calendar), [store.calendar]);

  const dirty = JSON.stringify(p) !== JSON.stringify(store.planning);
  const calDirty = JSON.stringify(cal) !== JSON.stringify(store.calendar);
  const invalid = p.workEnd <= p.workStart || p.defaultDuration < 15 || p.maxDaily < 1 || p.workDays.length === 0;
  const slots = slotsFor(p);

  const num = (k: keyof PlanningConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP({ ...p, [k]: Math.max(0, Number(e.target.value)) });

  const testConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      const stamp = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
      store.updateCalendar({ ...cal, lastTest: stamp });
      toast.success(`Connexion à ${cal.provider} réussie.`);
    }, 1200);
  };

  return (
    <>
      <PageHeader
        eyebrow="Configuration IA"
        title="Paramètres de planification"
        description="Ces règles encadrent toutes les propositions de créneau faites par l’agent."
        actions={
          <>
            <Button variant="outline" disabled={!dirty} onClick={() => setP(store.planning)} className="gap-1.5">
              <RotateCcw className="h-4 w-4" /> Annuler
            </Button>
            <Button disabled={!dirty || invalid} onClick={() => store.updatePlanning(p)} className="gap-1.5">
              <Save className="h-4 w-4" /> Enregistrer les règles
            </Button>
          </>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Durée standard" value={`${store.planning.defaultDuration} min`} icon={Clock3} />
        <StatCard label="Capacité quotidienne" value={store.planning.maxDaily} icon={Users} hint="prélèvements / préleveur" />
        <StatCard label="Créneaux par jour" value={slotsFor(store.planning).length} icon={CalendarCog} />
        <StatCard label="Regroupement par site" value={store.planning.groupBySite ? "Actif" : "Inactif"} icon={MapPinned} tone={store.planning.groupBySite ? "success" : "default"} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Règles de l’agent" description="Modifiez puis enregistrez pour appliquer aux prochaines propositions.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Début des créneaux"><Input type="time" value={p.workStart} onChange={(e) => setP({ ...p, workStart: e.target.value })} /></Field>
            <Field label="Fin des créneaux"><Input type="time" value={p.workEnd} onChange={(e) => setP({ ...p, workEnd: e.target.value })} /></Field>
            <Field label="Durée d’un prélèvement">
              <Select value={String(p.defaultDuration)} onValueChange={(v) => setP({ ...p, defaultDuration: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[30, 45, 60, 90, 120].map((d) => <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Maximum par jour"><Input type="number" min={1} value={p.maxDaily} onChange={num("maxDaily")} /></Field>
            <Field label="Battement entre visites (min)"><Input type="number" min={0} value={p.buffer} onChange={num("buffer")} /></Field>
            <Field label="Temps de trajet entre sites (min)"><Input type="number" min={0} value={p.travelBuffer} onChange={num("travelBuffer")} /></Field>
            <div className="sm:col-span-2 space-y-2">
              <Label>Jours travaillés</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const on = p.workDays.includes(d);
                  return (
                    <Button key={d} type="button" size="sm" variant={on ? "default" : "outline"}
                      onClick={() => setP({ ...p, workDays: on ? p.workDays.filter((x) => x !== d) : DAYS.filter((x) => x === d || p.workDays.includes(x)) })}>
                      {d.slice(0, 3)}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div><Label>Regrouper par site</Label><p className="text-xs text-muted-foreground">L’agent propose en priorité les créneaux proches d’un prélèvement déjà prévu sur le même site.</p></div>
              <Switch checked={p.groupBySite} onCheckedChange={(v) => setP({ ...p, groupBySite: v })} />
            </div>
            <Field label="Jours fériés (jj/mm, séparés par des virgules)"><Input value={p.holidays} onChange={(e) => setP({ ...p, holidays: e.target.value })} /></Field>
          </div>
          {invalid && <p className="mt-4 text-xs font-medium text-destructive">Vérifiez les horaires (fin après début), la durée (≥ 15 min), la capacité et au moins un jour travaillé.</p>}
          {dirty && !invalid && <p className="mt-4 text-xs font-medium text-warning-foreground">Modifications non enregistrées.</p>}
        </Panel>
        <div className="space-y-4">
          <Panel title="Aperçu des créneaux" description="Créneaux que l’agent pourra proposer avec ces règles.">
            {slots.length === 0 ? <p className="text-sm text-muted-foreground">Aucun créneau possible avec ces horaires.</p> : (
              <div className="flex flex-wrap gap-2">{slots.map((s) => <span key={s} className="num rounded-md border bg-surface px-2.5 py-1 text-xs">{s}</span>)}</div>
            )}
          </Panel>
          <Panel title="Calendrier connecté" description="Source de disponibilité consultée par l’agent avant toute proposition.">
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {PROVIDERS.map((pr) => (
                  <button key={pr} type="button" onClick={() => setCal({ ...cal, provider: pr })}
                    className={`rounded-lg border p-3 text-left text-sm transition-all hover:-translate-y-0.5 ${cal.provider === pr ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "bg-surface"}`}>
                    <CalendarCog className="mb-2 h-5 w-5 text-primary" />
                    <div className="font-semibold">{pr === "Calendrier QualiUp" ? "Interne" : pr.replace("Microsoft ", "")}</div>
                    {store.calendar.provider === pr && <div className="mt-1 flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="h-3 w-3" /> Connecté</div>}
                  </button>
                ))}
              </div>
              <Field label="Nom du calendrier"><Input value={cal.calendarName} onChange={(e) => setCal({ ...cal, calendarName: e.target.value })} /></Field>
              <Field label="Fréquence de synchronisation">
                <Select value={cal.syncFrequency} onValueChange={(v) => setCal({ ...cal, syncFrequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from(new Set(["Temps réel", "Toutes les 5 minutes", "Toutes les 15 minutes", "Toutes les heures", cal.syncFrequency])).map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <p className="text-xs text-muted-foreground">Dernier test : {store.calendar.lastTest}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={testConnection} disabled={testing} className="gap-1.5">
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Tester la connexion
                </Button>
                <Button disabled={!calDirty || !cal.calendarName.trim()} onClick={() => store.updateCalendar(cal)} className="gap-1.5">
                  <Save className="h-4 w-4" /> Enregistrer le calendrier
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
