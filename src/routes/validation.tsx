import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Pencil, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Confidence, Field, PageHeader, Panel, StatCard, StatusBadge, Toolbar } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Actions à valider — QualiUp AI Back-Office" },
      {
        name: "description",
        content:
          "Centre de validation humaine : chaque action sensible proposée par les agents IA est approuvée, modifiée ou refusée avec traçabilité.",
      },
      { property: "og:title", content: "Actions à valider — QualiUp" },
      {
        property: "og:description",
        content: "Human-in-the-loop : approuver, modifier ou refuser les propositions des agents IA.",
      },
    ],
  }),
  component: ValidationPage,
});

const CATEGORIES = [
  "toutes",
  "Planning",
  "Affectation préleveur",
  "Modification de rendez-vous",
  "Annulation",
  "Communication client",
];

function ValidationPage() {
  const store = useStore();
  const [tab, setTab] = useState("en attente");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("toutes");
  const [refuseId, setRefuseId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [editValue, setEditValue] = useState("");

  const actions = useMemo(
    () =>
      store.actions.filter((a) => {
        if (tab === "en attente" && a.status !== "en attente") return false;
        if (tab === "traitées" && a.status === "en attente") return false;
        if (category !== "toutes" && a.category !== category) return false;
        if (search && !`${a.title} ${a.reason} ${a.requestRef ?? ""}`.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [store.actions, tab, category, search],
  );

  const pending = store.actions.filter((a) => a.status === "en attente");

  return (
    <>
      <PageHeader
        eyebrow="IA"
        title="Actions à valider"
        description="Rien n'est exécuté sans décision humaine. Chaque décision est horodatée et tracée dans l'audit."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="En attente" value={pending.length} tone="warning" />
        <StatCard label="Impact élevé" value={pending.filter((a) => a.impact === "élevé").length} tone="danger" />
        <StatCard
          label="Approuvées"
          value={store.actions.filter((a) => a.status === "approuvée" || a.status === "modifiée").length}
          tone="success"
        />
        <StatCard label="Refusées" value={store.actions.filter((a) => a.status === "refusée").length} tone="danger" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="en attente">En attente ({pending.length})</TabsTrigger>
            <TabsTrigger value="traitées">Traitées</TabsTrigger>
            <TabsTrigger value="toutes">Toutes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Rechercher une action, une demande…">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[220px] bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "toutes" ? "Toutes les catégories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="space-y-3">
        {actions.map((a) => (
          <div key={a.id} className="panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={a.status} />
                  <span className="rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                    {a.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{store.agentName(a.agentId)}</span>
                  <span className="text-[11px] text-muted-foreground">· {a.createdAt}</span>
                  <span
                    className={
                      a.impact === "élevé"
                        ? "text-[11px] font-medium text-destructive"
                        : "text-[11px] text-muted-foreground"
                    }
                  >
                    · impact {a.impact}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold">{a.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.proposal.map((p) => (
                    <span key={p} className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
                      {p}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Pourquoi : </span>
                  {a.reason}
                </p>
                {a.decisionReason && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Motif de décision : </span>
                    {a.decisionReason} {a.decidedBy && `— ${a.decidedBy}`}
                  </p>
                )}
                {a.requestRef && (
                  <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                    <Link
                      to="/demandes/$id"
                      params={{
                        id: store.requests.find((r) => r.ref === a.requestRef)?.id ?? "",
                      }}
                    >
                      Voir la demande {a.requestRef}
                    </Link>
                  </Button>
                )}
              </div>

              <div className="w-full shrink-0 space-y-2 sm:w-52">
                <Confidence value={a.confidence} />
                {a.status === "en attente" ? (
                  <>
                    <Button size="sm" className="w-full gap-1.5" onClick={() => store.decideAction(a.id, "approuvée")}>
                      <Check className="h-4 w-4" /> Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={() => {
                        setEditId(a.id);
                        setEditValue(a.proposal.join(" · "));
                      }}
                    >
                      <Pencil className="h-4 w-4" /> Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setRefuseId(a.id)}
                    >
                      <X className="h-4 w-4" /> Refuser
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Décision : {a.status}
                    {a.decidedBy ? ` par ${a.decidedBy}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {actions.length === 0 && (
          <Panel title="Aucune action">
            <p className="text-sm text-muted-foreground">
              Aucune action ne correspond à ces filtres. Les agents fonctionnent dans leur périmètre autorisé.
            </p>
          </Panel>
        )}
      </div>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la proposition</DialogTitle>
            <DialogDescription>
              Ajustez la proposition de l'IA : elle sera enregistrée comme modifiée puis exécutée.
            </DialogDescription>
          </DialogHeader>
          <Field label="Proposition" hint="Ex : Date : 26/09/2026 · Créneau : 10:00 — 11:30 · Préleveur : Salma Aït Baha">
            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!editId) return;
                store.decideAction(editId, "modifiée", `Proposition ajustée : ${editValue}`);
                setEditId(null);
              }}
            >
              Enregistrer et exécuter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!refuseId} onOpenChange={(o) => !o && setRefuseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser l'action</DialogTitle>
            <DialogDescription>Le motif est obligatoire et conservé dans l'audit.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du refus…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefuseId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={reason.trim().length < 3}
              onClick={() => {
                if (!refuseId) return;
                store.decideAction(refuseId, "refusée", reason);
                setRefuseId(null);
                setReason("");
              }}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
