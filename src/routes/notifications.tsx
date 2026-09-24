import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Check, CheckCircle2, Clock3, MessageCircle, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConfirmDelete, exportCsv, PageHeader, Panel, StatCard, StatusBadge, Toolbar } from "@/components/app/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { CommunicationTemplate } from "@/lib/qualiup-types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & relances — QualiUp" },
      { name: "description", content: "Modèles WhatsApp, relances automatiques et historique des messages opérationnels QualiUp." },
      { property: "og:title", content: "Notifications & relances — QualiUp" },
      { property: "og:description", content: "Pilotez les messages opérationnels envoyés par l’agent QualiUp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

type TplDraft = Omit<CommunicationTemplate, "id">;
const TRIGGERS = ["Planification validée", "Veille à 18:00", "Jour J à 07:30", "Départ du préleveur", "Opération réalisée", "Résultats publiés", "Demande incomplète"];
const VARS = ["{contact}", "{date}", "{creneau}", "{site}", "{preleveur}", "{champs_manquants}"];
const emptyTpl: TplDraft = { name: "", trigger: TRIGGERS[0]!, channel: "WhatsApp", body: "", active: true, approvalMode: "automatique" };

function NotificationsPage() {
  const store = useStore();
  const [edit, setEdit] = useState<{ id?: string; data: TplDraft } | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [relance, setRelance] = useState<{ ref: string; missing: string } | null>(null);

  const waiting = store.sentMessages.filter((m) => m.status === "à valider");
  const incomplete = store.requests.filter((r) => r.status === "clarification");
  const history = store.sentMessages.filter(
    (m) => (status === "all" || m.status === status) && (m.customer + m.template + m.requestRef).toLowerCase().includes(search.toLowerCase()),
  );
  const missingFor = (ref: string) => {
    const r = store.requests.find((x) => x.ref === ref);
    const miss = r?.extraction.filter((f) => f.confidence < 70 || !f.value || f.value === "—").map((f) => f.label) ?? [];
    return miss.length ? miss.join(", ") : store.requiredFields.filter((f) => f.active).slice(3).map((f) => f.label).join(", ");
  };
  const save = () => {
    if (!edit) return;
    if (edit.id) store.updateTemplate(edit.id, edit.data);
    else store.addTemplate(edit.data);
    setEdit(null);
  };
  const tplCount = (name: string) => store.sentMessages.filter((m) => m.template === name && m.status === "envoyé").length;

  return (
    <>
      <PageHeader
        eyebrow="Communication WhatsApp"
        title="Notifications & relances"
        description="Définissez quels messages partent automatiquement et lesquels nécessitent votre validation."
        actions={<Button className="gap-1.5" onClick={() => setEdit({ data: { ...emptyTpl } })}><Plus className="h-4 w-4" /> Nouveau modèle</Button>}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Modèles actifs" value={store.templates.filter((t) => t.active).length} icon={BellRing} />
        <StatCard label="Messages envoyés" value={store.sentMessages.filter((m) => m.status === "envoyé").length} icon={CheckCircle2} tone="success" />
        <StatCard label="À valider" value={waiting.length} icon={Clock3} tone="warning" />
        <StatCard label="Demandes incomplètes" value={incomplete.length} icon={MessageCircle} tone="danger" />
      </div>

      {waiting.length > 0 && (
        <Panel title="Messages en attente de validation" description="Ces messages ne partiront qu’après votre accord." className="mb-4 border-warning/40">
          <div className="space-y-2">
            {waiting.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-warning/5 p-3 text-sm">
                <div className="min-w-0 flex-1"><b>{m.customer}</b> · {m.template} <span className="num text-xs text-muted-foreground">({m.requestRef})</span></div>
                <Button size="sm" className="gap-1.5" onClick={() => store.approveMessage(m.id)}><Check className="h-4 w-4" /> Valider et envoyer</Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => store.cancelMessage(m.id)}><X className="h-4 w-4" /> Annuler</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Modèles WhatsApp" description="Confirmation, rappel, préleveur en route, prélèvement effectué, résultats disponibles.">
          <div className="grid gap-3 md:grid-cols-2">
            {store.templates.map((t) => (
              <div key={t.id} className={`flex flex-col rounded-lg border bg-surface/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-panel ${t.active ? "" : "opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="text-sm font-semibold">{t.name}</div><div className="mt-1 text-xs text-muted-foreground">Déclencheur : {t.trigger}</div></div>
                  <Switch checked={t.active} onCheckedChange={(active) => store.updateTemplate(t.id, { active })} aria-label="Activer le modèle" />
                </div>
                <p className="mt-3 line-clamp-3 flex-1 rounded-md bg-muted/50 p-2.5 text-xs leading-5 text-muted-foreground">{t.body}</p>
                <div className="mt-3">
                  <Select value={t.approvalMode} onValueChange={(v) => store.updateTemplate(t.id, { approvalMode: v as CommunicationTemplate["approvalMode"] })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="automatique">Envoi automatique</SelectItem><SelectItem value="validation humaine">Après validation humaine</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="num text-[11px] text-muted-foreground">{tplCount(t.name)} envoyé(s)</span>
                  <div className="flex">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Modifier" onClick={() => setEdit({ id: t.id, data: { name: t.name, trigger: t.trigger, channel: t.channel, body: t.body, active: t.active, approvalMode: t.approvalMode } })}><Pencil className="h-3.5 w-3.5" /></Button>
                    <ConfirmDelete title="Supprimer ce modèle ?" description={t.name} onConfirm={() => store.deleteTemplate(t.id)}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label="Supprimer"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </ConfirmDelete>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Relances des demandes incomplètes" description="L’agent redemande uniquement les informations manquantes.">
          {incomplete.length === 0 && <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune demande incomplète. 🎉</p>}
          <div className="space-y-3">
            {incomplete.map((r) => {
              const relanced = r.notes.startsWith("Relance envoyée");
              return (
                <div key={r.id} className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="text-sm font-semibold">{store.customerName(r.customerId)}</div><div className="num text-xs text-muted-foreground">Demande {r.ref} · reçue {r.receivedAt}</div></div>
                    <MessageCircle className="h-5 w-5 text-warning" />
                  </div>
                  <p className="mt-3 text-sm">Manquant : <b>{missingFor(r.ref)}</b></p>
                  {relanced && <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1.5" onClick={() => setRelance({ ref: r.ref, missing: missingFor(r.ref) })}><Send className="h-4 w-4" /> {relanced ? "Relancer à nouveau" : "Relancer le client"}</Button>
                    <Button size="sm" variant="outline" asChild><Link to="/demandes/$id" params={{ id: r.id }}>Voir la demande</Link></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Historique des messages envoyés" description="Uniquement les notifications opérationnelles sortantes, sans conversation client." className="mt-4">
        <Toolbar search={search} onSearch={setSearch} placeholder="Client, modèle ou demande…"
          onExport={() => exportCsv("messages-qualiup.csv", history.map((m) => ({ Date: m.sentAt, Client: m.customer, Demande: m.requestRef, Modèle: m.template, Statut: m.status })))}>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous statuts</SelectItem><SelectItem value="envoyé">Envoyés</SelectItem><SelectItem value="à valider">À valider</SelectItem></SelectContent>
          </Select>
        </Toolbar>
        {history.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Aucun message.</p>}
        <div className="space-y-1">
          {history.map((m) => (
            <div key={m.id} className="grid gap-2 border-b py-3 text-sm last:border-0 sm:grid-cols-[140px_1fr_70px_110px] sm:items-center">
              <span className="num text-xs text-muted-foreground">{m.sentAt}</span>
              <span><b>{m.customer}</b> · {m.template}</span>
              <span className="num">{m.requestRef}</span>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </Panel>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier le modèle" : "Nouveau modèle WhatsApp"}</DialogTitle><DialogDescription>Les variables entre accolades sont remplacées automatiquement.</DialogDescription></DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Nom</Label><Input value={edit.data.name} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, name: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Déclencheur</Label><Select value={edit.data.trigger} onValueChange={(trigger) => setEdit({ ...edit, data: { ...edit.data, trigger } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from(new Set([...TRIGGERS, edit.data.trigger])).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Mode d’envoi</Label><Select value={edit.data.approvalMode} onValueChange={(v) => setEdit({ ...edit, data: { ...edit.data, approvalMode: v as TplDraft["approvalMode"] } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="automatique">Automatique</SelectItem><SelectItem value="validation humaine">Validation humaine</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-1.5"><Label>Message</Label><Textarea rows={5} value={edit.data.body} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, body: e.target.value } })} />
                <div className="flex flex-wrap gap-1">{VARS.map((v) => <Button key={v} type="button" size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => setEdit({ ...edit, data: { ...edit.data, body: `${edit.data.body}${edit.data.body.endsWith(" ") || !edit.data.body ? "" : " "}${v}` } })}>{v}</Button>)}</div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Annuler</Button><Button disabled={!edit?.data.name.trim() || !edit?.data.body.trim()} onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!relance} onOpenChange={(o) => !o && setRelance(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Relancer la demande {relance?.ref}</DialogTitle><DialogDescription>Aperçu du message WhatsApp envoyé au client.</DialogDescription></DialogHeader>
          {relance && (
            <>
              <div className="space-y-1.5"><Label>Informations à demander</Label><Input value={relance.missing} onChange={(e) => setRelance({ ...relance, missing: e.target.value })} /></div>
              <div className="rounded-lg bg-success/10 p-3 text-sm leading-6">
                {(store.templates.find((t) => t.name === "Demande de clarification")?.body ?? "Bonjour, pourriez-vous préciser : {champs_manquants} ?").replace("{champs_manquants}", relance.missing)}
              </div>
            </>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setRelance(null)}>Annuler</Button><Button className="gap-1.5" disabled={!relance?.missing.trim()} onClick={() => { if (relance) store.relaunchRequest(relance.ref, relance.missing); setRelance(null); }}><Send className="h-4 w-4" /> Envoyer la relance</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
