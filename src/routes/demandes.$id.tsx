import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Pencil, Sparkles, X } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Confidence, Field, KeyValue, PageHeader, Panel, StatusBadge } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/demandes/$id")({
  head: () => ({
    meta: [
      { title: "Détail d'une demande — QualiUp AI Back-Office" },
      {
        name: "description",
        content:
          "Données structurées extraites par l'IA, proposition de planification et décision humaine pour une demande de prélèvement.",
      },
      { property: "og:title", content: "Détail d'une demande — QualiUp" },
      {
        property: "og:description",
        content: "Extraction IA, recommandation de créneau et validation humaine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestDetail,
});

function RequestDetail() {
  const { id } = Route.useParams();
  const store = useStore();
  const navigate = useNavigate();
  const request = store.requests.find((r) => r.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState({ date: "", slot: "", preleveurId: "" });

  if (!request) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-sm text-muted-foreground">Cette demande n'existe pas ou a été supprimée.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/demandes">Retour aux demandes</Link>
        </Button>
      </div>
    );
  }

  const customer = store.customers.find((c) => c.id === request.customerId);
  const site = store.site(request.siteId);
  const linkedAction = store.actions.find((a) => a.requestRef === request.ref);

  const openEdit = () => {
    setDraft({
      date: request.recommendation.date,
      slot: request.recommendation.slot,
      preleveurId: request.recommendation.preleveurId,
    });
    setEditOpen(true);
  };

  const approve = () => {
    if (linkedAction && linkedAction.status === "en attente") {
      store.decideAction(linkedAction.id, "approuvée");
    } else {
      store.updateRequest(request.id, { status: "planifiée" });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Opérations · Demandes"
        title={`Demande ${request.ref}`}
        description={`Reçue le ${request.receivedAt} via ${request.source}. Statut : ${request.status}.`}
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/demandes">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Link>
            </Button>
            <StatusBadge status={request.status} />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Message d’origine" description="Message initial reçu sur WhatsApp — aucun fil de conversation n’est conservé.">
            <blockquote className="rounded-lg border-l-4 border-accent bg-muted/50 p-4 text-sm leading-6">
              {request.originalMessage ?? `Demande reçue via ${request.source} pour ${request.analysisType}.`}
            </blockquote>
          </Panel>
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Informations client">
              <KeyValue
                items={[
                  { label: "Société", value: customer?.name ?? "—" },
                  { label: "Contact", value: customer?.contact ?? "—" },
                  { label: "Téléphone", value: customer?.phone ?? "—" },
                  { label: "Email", value: customer?.email ?? "—" },
                  { label: "Secteur", value: customer?.sector ?? "—" },
                ]}
              />
            </Panel>
            <Panel title="Site">
              <KeyValue
                items={[
                  { label: "Site", value: site?.name ?? "—" },
                  { label: "Adresse", value: site?.address ?? "—" },
                  { label: "Ville", value: site?.city ?? "—" },
                  { label: "Secteur", value: site?.sector ?? "—" },
                  { label: "Laboratoire", value: request.lab },
                ]}
              />
            </Panel>
          </div>

          <Panel title="Prélèvement demandé">
            <KeyValue
              items={[
                { label: "Type d'analyse", value: request.analysisType },
                { label: "Nombre d'échantillons", value: request.samples },
                { label: "Date souhaitée", value: request.requestedDate },
                { label: "Créneau souhaité", value: request.requestedTime },
                { label: "Urgence", value: <StatusBadge status={request.urgency} /> },
                { label: "Instructions particulières", value: request.notes },
              ]}
            />
          </Panel>

          <Panel
            title="Informations détectées par l'IA"
             description="Champs extraits automatiquement du message initial, avec niveau de confiance."
          >
            <div className="space-y-2">
              {request.extraction.map((f) => (
                <div key={f.label} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.label}</div>
                    <div className="truncate text-sm font-medium">{f.value}</div>
                  </div>
                  <Confidence value={f.confidence} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Proposition de l'agent IA"
            description={store.agentName("a1")}
            actions={<Sparkles className="h-4 w-4 text-accent" />}
          >
            <KeyValue
              items={[
                { label: "Date proposée", value: request.recommendation.date },
                { label: "Créneau", value: request.recommendation.slot },
                { label: "Préleveur", value: store.preleveurName(request.recommendation.preleveurId) },
                { label: "Laboratoire", value: request.recommendation.lab },
                { label: "Confiance", value: <Confidence value={request.confidence} /> },
              ]}
            />
            <p className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Motif : </span>
              {request.recommendation.reason}
            </p>

            <div className="mt-4 grid gap-2">
              <Button
                className="gap-1.5"
                disabled={request.status === "planifiée" || request.status === "refusée"}
                onClick={approve}
              >
                <Check className="h-4 w-4" /> Approuver
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={openEdit}>
                <Pencil className="h-4 w-4" /> Modifier
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={request.status === "refusée"}
                onClick={() => setRefuseOpen(true)}
              >
                <X className="h-4 w-4" /> Refuser
              </Button>
            </div>
          </Panel>

          <Panel title="Traçabilité">
            <KeyValue
              items={[
                { label: "Source", value: request.source },
                { label: "Réception", value: request.receivedAt },
                { label: "Statut", value: <StatusBadge status={request.status} /> },
                {
                  label: "Action liée",
                  value: linkedAction ? <StatusBadge status={linkedAction.status} /> : "—",
                },
              ]}
            />
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link to="/validation">Ouvrir le centre de validation</Link>
            </Button>
          </Panel>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la proposition</DialogTitle>
            <DialogDescription>
              La modification est enregistrée puis validée : l'IA n'exécute rien sans décision humaine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Date">
              <Input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Créneau">
              <Input value={draft.slot} onChange={(e) => setDraft({ ...draft, slot: e.target.value })} />
            </Field>
            <Field label="Préleveur">
              <Select
                value={draft.preleveurId}
                onValueChange={(v) => setDraft({ ...draft, preleveurId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {store.preleveurs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.lab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                store.updateRequest(request.id, {
                  recommendation: { ...request.recommendation, ...draft },
                  status: "validée",
                });
                store.logAudit(
                  "Modification proposition IA",
                  request.ref,
                  `${request.recommendation.date} ${request.recommendation.slot}`,
                  `${draft.date} ${draft.slot}`,
                );
                if (linkedAction && linkedAction.status === "en attente")
                  store.decideAction(linkedAction.id, "modifiée", "Créneau ajusté manuellement");
                setEditOpen(false);
              }}
            >
              Enregistrer et valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande {request.ref}</DialogTitle>
            <DialogDescription>Un motif est obligatoire : il est enregistré dans l'audit.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du refus…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefuseOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={reason.trim().length < 3}
              onClick={() => {
                if (linkedAction && linkedAction.status === "en attente")
                  store.decideAction(linkedAction.id, "refusée", reason);
                else store.updateRequest(request.id, { status: "refusée" });
                store.logAudit("Refus de demande", request.ref, request.status, `refusée — ${reason}`);
                setRefuseOpen(false);
                setReason("");
                navigate({ to: "/demandes" });
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
