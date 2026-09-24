import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportCsv, PageHeader, Panel, StatCard, StatusBadge } from "@/components/app/ui-kit";
import { TODAY } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Planning des prélèvements — QualiUp AI Back-Office" },
      {
        name: "description",
        content:
          "Planning par préleveur et par jour, issu des propositions IA validées : créneaux, charge et laboratoires.",
      },
      { property: "og:title", content: "Planning des prélèvements — QualiUp" },
      {
        property: "og:description",
        content: "Charge des préleveurs, créneaux planifiés et respect des règles de planification.",
      },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const store = useStore();
  const dates = useMemo(
    () => [...new Set(store.samplings.map((o) => o.date))].sort((a, b) => (a < b ? -1 : 1)),
    [store.samplings],
  );
  const [date, setDate] = useState(TODAY);
  const [lab, setLab] = useState("tous");

  const ops = store.samplings.filter((o) => o.date === date && (lab === "tous" || o.lab === lab));
  const activePreleveurs = store.preleveurs.filter((p) => p.active && (lab === "tous" || p.lab === lab));

  return (
    <>
      <PageHeader
        eyebrow="Opérations"
        title="Planning"
        description={`Créneaux confirmés après validation humaine. Règles actives : ${store.planning.workStart} — ${store.planning.workEnd}, ${store.planning.buffer} min de battement, ${store.planning.maxDaily} prélèvements max par préleveur.`}
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/regles">
                <Settings2 className="h-4 w-4" /> Règles de planification
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportCsv(
                  `planning-${date.replace(/\//g, "-")}.csv`,
                  ops.map((o) => ({
                    Operation: o.ref,
                    Date: o.date,
                    Creneau: o.slot,
                    Client: store.customerName(o.customerId),
                    Site: store.siteName(o.siteId),
                    Preleveur: store.preleveurName(o.preleveurId),
                    Analyse: o.analysisType,
                    Echantillons: o.samples,
                    Statut: o.status,
                  })),
                )
              }
            >
              Exporter
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={date} onValueChange={setDate}>
          <SelectTrigger className="h-9 w-[190px] bg-surface">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dates.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
                {d === TODAY ? " (aujourd'hui)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={lab} onValueChange={setLab}>
          <SelectTrigger className="h-9 w-[180px] bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les laboratoires</SelectItem>
            {store.general.labs.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Opérations du jour" value={ops.length} />
        <StatCard label="Planifiées" value={ops.filter((o) => o.status === "planifié").length} tone="info" />
        <StatCard label="Réalisées" value={ops.filter((o) => o.status === "réalisé").length} tone="success" />
        <StatCard label="Échantillons" value={ops.reduce((s, o) => s + o.samples, 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {activePreleveurs.map((p) => {
          const list = ops.filter((o) => o.preleveurId === p.id);
          const load = Math.round((list.length / p.maxDaily) * 100);
          return (
            <Panel
              key={p.id}
              title={p.name}
              description={`${p.lab} · ${p.hours} · ${list.length}/${p.maxDaily} interventions`}
              actions={
                <span
                  className={
                    load >= 90
                      ? "text-xs font-semibold text-destructive"
                      : load >= 60
                        ? "text-xs font-semibold text-warning"
                        : "text-xs font-semibold text-success"
                  }
                >
                  {load} %
                </span>
              }
            >
              <div className="space-y-2">
                {list.map((o) => (
                  <div key={o.id} className="rounded-md border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="num text-xs font-semibold">{o.slot}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="mt-1 text-sm font-medium">{store.customerName(o.customerId)}</div>
                    <div className="text-[11px] text-muted-foreground">{store.siteName(o.siteId)}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {o.analysisType} · {o.samples} échantillons · {o.ref}
                    </div>
                    {o.status === "planifié" && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => store.updateSampling(o.id, { status: "en cours" })}>
                          Démarrer
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => store.updateSampling(o.id, { status: "annulé" })}>
                          Annuler
                        </Button>
                      </div>
                    )}
                    {o.status === "en cours" && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => store.updateSampling(o.id, { status: "réalisé" })}
                      >
                        Marquer réalisé
                      </Button>
                    )}
                  </div>
                ))}
                {list.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Aucun créneau ce jour — capacité disponible pour l'IA.
                  </p>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
