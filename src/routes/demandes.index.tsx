import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Confidence, exportCsv, PageHeader, StatusBadge, Toolbar } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/demandes/")({
  head: () => ({
    meta: [
      { title: "Demandes & validation — QualiUp" },
      {
        name: "description",
        content:
          "File opérationnelle des demandes de prélèvement structurées par l'IA : client, site, analyse, urgence et confiance.",
      },
      { property: "og:title", content: "Demandes de prélèvement — QualiUp" },
      {
        property: "og:description",
        content: "Demandes structurées issues des canaux client, prêtes pour validation et planification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemandesPage,
});

function DemandesPage() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("tous");
  const [urgency, setUrgency] = useState("toutes");

  const rows = useMemo(
    () =>
      store.requests.filter((r) => {
        const haystack = [
          r.ref,
          store.customerName(r.customerId),
          store.siteName(r.siteId),
          r.analysisType,
          r.lab,
          r.source,
        ]
          .join(" ")
          .toLowerCase();
        if (search && !haystack.includes(search.toLowerCase())) return false;
        if (status !== "tous" && r.status !== status) return false;
        if (urgency !== "toutes" && r.urgency !== urgency) return false;
        return true;
      }),
    [store, search, status, urgency],
  );

  return (
    <>
      <PageHeader
        eyebrow="Supervision humaine"
        title="Demandes & validation"
        description="Vérifiez le message reçu, les informations extraites et la proposition de l’agent avant envoi au client."
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        placeholder="Rechercher par référence, client, site, analyse…"
        onExport={() =>
          exportCsv(
            "demandes-qualiup.csv",
            rows.map((r) => ({
              Reference: r.ref,
              Reception: r.receivedAt,
              Client: store.customerName(r.customerId),
              Site: store.siteName(r.siteId),
              Laboratoire: r.lab,
              Analyse: r.analysisType,
              Echantillons: r.samples,
              Urgence: r.urgency,
              DateDemandee: r.requestedDate,
              Source: r.source,
              Statut: r.status,
              ConfianceIA: `${r.confidence} %`,
            })),
          )
        }
      >
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[160px] bg-surface">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {["tous", "à valider", "validée", "planifiée", "clarification", "refusée"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "tous" ? "Tous les statuts" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={urgency} onValueChange={setUrgency}>
          <SelectTrigger className="h-9 w-[150px] bg-surface">
            <SelectValue placeholder="Urgence" />
          </SelectTrigger>
          <SelectContent>
            {["toutes", "basse", "normale", "élevée", "critique"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "toutes" ? "Toutes urgences" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>ID</TableHead>
              <TableHead>Réception</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Labo</TableHead>
              <TableHead>Type d'analyse</TableHead>
              <TableHead className="text-right">Éch.</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Date demandée</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Confiance IA</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="text-[13px]">
                <TableCell className="num font-semibold">{r.ref}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{r.receivedAt}</TableCell>
                <TableCell className="font-medium">{store.customerName(r.customerId)}</TableCell>
                <TableCell className="max-w-[180px] truncate">{store.siteName(r.siteId)}</TableCell>
                <TableCell>{r.lab}</TableCell>
                <TableCell className="max-w-[180px] truncate">{r.analysisType}</TableCell>
                <TableCell className="num text-right">{r.samples}</TableCell>
                <TableCell>
                  <StatusBadge status={r.urgency} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{r.requestedDate}</TableCell>
                <TableCell className="text-muted-foreground">{r.source}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <Confidence value={r.confidence} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/demandes/$id" params={{ id: r.id }}>
                      Ouvrir
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="py-10 text-center text-sm text-muted-foreground">
                  Aucune demande ne correspond à ces filtres.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
