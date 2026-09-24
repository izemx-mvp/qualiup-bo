import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportCsv, PageHeader, StatCard, StatusBadge, Toolbar } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/activite")({
  head: () => ({
    meta: [
      { title: "Activité IA — QualiUp AI Back-Office" },
      {
        name: "description",
        content:
          "Journal des événements opérationnels produits par les agents IA : détections, propositions, envois et erreurs.",
      },
      { property: "og:title", content: "Activité IA — QualiUp" },
      {
        property: "og:description",
        content: "Événements IA horodatés, sans contenu de conversation client.",
      },
    ],
  }),
  component: ActivitePage,
});

function ActivitePage() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState("tous");
  const [status, setStatus] = useState("tous");

  const events = useMemo(
    () =>
      store.aiEvents.filter((e) => {
        if (agent !== "tous" && e.agentId !== agent) return false;
        if (status !== "tous" && e.status !== status) return false;
        const hay = `${e.title} ${Object.values(e.fields).join(" ")}`.toLowerCase();
        return !search || hay.includes(search.toLowerCase());
      }),
    [store.aiEvents, search, agent, status],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((e) => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    return [...map.entries()];
  }, [events]);

  return (
    <>
      <PageHeader
        eyebrow="IA"
        title="Activité des agents IA"
        description="Flux d'événements opérationnels. Aucune conversation client n'est enregistrée — uniquement l'action, l'objet et le résultat."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Événements" value={store.aiEvents.length} />
        <StatCard label="Succès" value={store.aiEvents.filter((e) => e.status === "succès").length} tone="success" />
        <StatCard
          label="Validation requise"
          value={store.aiEvents.filter((e) => e.status === "validation requise").length}
          tone="warning"
        />
        <StatCard label="Erreurs" value={store.aiEvents.filter((e) => e.status === "erreur").length} tone="danger" />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher un événement…"
        onExport={() =>
          exportCsv(
            "activite-ia-qualiup.csv",
            events.map((e) => ({
              Date: e.date,
              Heure: e.time,
              Agent: store.agentName(e.agentId),
              Evenement: e.title,
              Details: Object.entries(e.fields)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" | "),
              Statut: e.status,
            })),
          )
        }
      >
        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="h-9 w-[210px] bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les agents</SelectItem>
            {store.agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[190px] bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["tous", "succès", "validation requise", "erreur", "refusé"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "tous" ? "Tous les statuts" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="space-y-6">
        {grouped.map(([date, list]) => (
          <div key={date}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</div>
            <div className="space-y-2">
              {list.map((e) => (
                <div key={e.id} className="panel flex flex-wrap items-start gap-4 p-4">
                  <div className="num w-12 shrink-0 text-sm font-semibold">{e.time}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {store.agentName(e.agentId)}
                    </div>
                    <div className="text-sm font-semibold">{e.title}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(e.fields).map(([k, v]) => (
                        <span key={k} className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
                          <span className="text-muted-foreground">{k} : </span>
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="panel p-10 text-center text-sm text-muted-foreground">
            Aucun événement pour ces filtres.
          </p>
        )}
      </div>
    </>
  );
}
