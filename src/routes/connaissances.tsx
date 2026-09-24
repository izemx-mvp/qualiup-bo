import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Building2, CheckCircle2, Clock, FileText, Mail, MapPin, Pencil, Phone, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ConfirmDelete, PageHeader, Panel, StatCard, StatusBadge, Toolbar } from "@/components/app/ui-kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Faq, KbDocument, LabInfo } from "@/lib/qualiup-types";

export const Route = createFileRoute("/connaissances")({
  head: () => ({
    meta: [
      { title: "Base de connaissances de l’agent — QualiUp" },
      { name: "description", content: "FAQ, documents, informations pratiques et champs obligatoires de l’agent QualiUp." },
      { property: "og:title", content: "Base de connaissances de l’agent — QualiUp" },
      { property: "og:description", content: "Gérez les réponses et références utilisées par l’agent IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KnowledgePage,
});

const FAQ_CATS = ["Analyses", "Prélèvement", "Délais", "Résultats", "Planning", "Tarifs", "Accréditation"];
const DOC_CATS = ["Catalogue", "Procédures", "Accréditation", "Commercial", "Juridique"];
const today = () => new Date().toLocaleDateString("fr-FR");

function KnowledgePage() {
  const store = useStore();
  return (
    <>
      <PageHeader
        eyebrow="Contenu de l’agent"
        title="Base de connaissances"
        description="La source unique utilisée par l’agent pour informer les clients et compléter une demande."
        actions={
          <>
            <StatusBadge status={store.knowledge.status} />
            <Button variant="outline" className="gap-1.5" onClick={store.reindexKnowledge}>
              <RefreshCw className="h-4 w-4" /> Réindexer
            </Button>
          </>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Questions actives" value={store.faqs.filter((f) => f.active).length} icon={BookOpen} />
        <StatCard label="Documents indexés" value={`${store.documents.filter((d) => d.indexed).length}/${store.documents.length}`} icon={FileText} />
        <StatCard label="Champs obligatoires" value={store.requiredFields.filter((f) => f.active).length} icon={CheckCircle2} tone="success" hint={`Dernière synchro : ${store.knowledge.lastSync}`} />
      </div>
      <Tabs defaultValue="faq">
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="faq" className="gap-1.5"><BookOpen className="h-4 w-4" /> FAQ</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
          <TabsTrigger value="infos" className="gap-1.5"><Building2 className="h-4 w-4" /> Informations</TabsTrigger>
        </TabsList>
        <TabsContent value="faq"><FaqTab /></TabsContent>
        <TabsContent value="docs"><DocsTab /></TabsContent>
        <TabsContent value="infos"><InfosTab /></TabsContent>
      </Tabs>
    </>
  );
}

/* ---------------- FAQ ---------------- */
const emptyFaq: Omit<Faq, "id"> = { question: "", answer: "", category: "Analyses", active: true, priority: 1 };

function FaqTab() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [edit, setEdit] = useState<{ id?: string; data: Omit<Faq, "id"> } | null>(null);
  const list = useMemo(
    () =>
      store.faqs
        .filter((f) => (cat === "all" || f.category === cat) && (f.question + f.answer).toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.priority - b.priority),
    [store.faqs, search, cat],
  );
  const save = () => {
    if (!edit) return;
    if (edit.id) store.updateFaq(edit.id, edit.data);
    else store.addFaq(edit.data);
    setEdit(null);
  };
  const valid = edit && edit.data.question.trim().length > 4 && edit.data.answer.trim().length > 4;
  return (
    <Panel title="FAQ de l’agent" description="Analyses, prélèvements, délais et résultats." actions={<Button size="sm" className="gap-1.5" onClick={() => setEdit({ data: { ...emptyFaq } })}><Plus className="h-4 w-4" /> Nouvelle question</Button>}>
      <Toolbar search={search} onSearch={setSearch} placeholder="Rechercher une question…">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes catégories</SelectItem>{FAQ_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </Toolbar>
      {list.length === 0 && <Empty text="Aucune question ne correspond." />}
      <div className="space-y-3">
        {list.map((f) => (
          <div key={f.id} className={`rounded-lg border bg-surface/70 p-4 transition-all hover:shadow-panel ${f.active ? "" : "opacity-60"}`}>
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{f.question}</span><StatusBadge status={f.category} /><span className="num text-[11px] text-muted-foreground">priorité {f.priority}</span></div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex items-center gap-1">
                <Switch checked={f.active} onCheckedChange={(active) => store.updateFaq(f.id, { active })} aria-label="Activer" />
                <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEdit({ id: f.id, data: { question: f.question, answer: f.answer, category: f.category, active: f.active, priority: f.priority } })}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete title="Supprimer cette question ?" description={f.question} onConfirm={() => store.deleteFaq(f.id)}>
                  <Button size="icon" variant="ghost" aria-label="Supprimer" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </ConfirmDelete>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier la question" : "Nouvelle question"}</DialogTitle><DialogDescription>L’agent utilisera cette réponse sur WhatsApp.</DialogDescription></DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <F label="Question"><Input value={edit.data.question} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, question: e.target.value } })} /></F>
              <F label="Réponse"><Textarea rows={4} value={edit.data.answer} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, answer: e.target.value } })} /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Catégorie"><Select value={edit.data.category} onValueChange={(category) => setEdit({ ...edit, data: { ...edit.data, category } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from(new Set([...FAQ_CATS, edit.data.category])).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></F>
                <F label="Priorité (1 = haute)"><Input type="number" min={1} max={9} value={edit.data.priority} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, priority: Math.max(1, Number(e.target.value)) } })} /></F>
              </div>
              <label className="flex items-center justify-between rounded-md border p-3 text-sm">Question active<Switch checked={edit.data.active} onCheckedChange={(active) => setEdit({ ...edit, data: { ...edit.data, active } })} /></label>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Annuler</Button><Button disabled={!valid} onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

/* ---------------- Documents ---------------- */
type DocDraft = Omit<KbDocument, "id">;
const emptyDoc: DocDraft = { name: "", category: "Procédures", size: "—", visibility: "client", keywords: "", updatedAt: "", indexed: false };

function DocsTab() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<{ id?: string; data: DocDraft } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const list = store.documents.filter((d) => (d.name + d.keywords + d.category).toLowerCase().includes(search.toLowerCase()));
  const onFile = (file?: File) => {
    if (!file || !edit) return;
    const kb = file.size / 1024;
    setEdit({ ...edit, data: { ...edit.data, name: file.name, size: kb > 1024 ? `${(kb / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(kb))} Ko` } });
  };
  const save = () => {
    if (!edit) return;
    const data = { ...edit.data, updatedAt: today() };
    if (edit.id) store.updateDocument(edit.id, { ...data, indexed: false });
    else store.addDocument(data);
    setEdit(null);
  };
  return (
    <Panel title="Documents de référence" description="Catalogue des analyses et procédures utilisés pour les réponses." actions={<Button size="sm" className="gap-1.5" onClick={() => setEdit({ data: { ...emptyDoc } })}><Plus className="h-4 w-4" /> Ajouter un document</Button>}>
      <Toolbar search={search} onSearch={setSearch} placeholder="Nom, catégorie ou mot-clé…" />
      {list.length === 0 && <Empty text="Aucun document." />}
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((d) => (
          <div key={d.id} className="flex items-start gap-3 rounded-lg border bg-surface/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-panel">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{d.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{d.category} · {d.size} · {d.visibility} · maj {d.updatedAt}</div>
              {d.keywords && <div className="mt-1 truncate text-[11px] text-muted-foreground">#{d.keywords.split(",").map((k) => k.trim()).join(" #")}</div>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={d.indexed ? "à jour" : "désynchronisée"} />
                {!d.indexed && <Button size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => { store.updateDocument(d.id, { indexed: true }); }}>Indexer</Button>}
              </div>
            </div>
            <div className="flex">
              <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEdit({ id: d.id, data: { name: d.name, category: d.category, size: d.size, visibility: d.visibility, keywords: d.keywords, updatedAt: d.updatedAt, indexed: d.indexed } })}><Pencil className="h-4 w-4" /></Button>
              <ConfirmDelete title="Supprimer ce document ?" description={d.name} onConfirm={() => store.deleteDocument(d.id)}>
                <Button size="icon" variant="ghost" aria-label="Supprimer" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </ConfirmDelete>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier le document" : "Ajouter un document"}</DialogTitle><DialogDescription>Le document sera indexé pour l’agent après réindexation.</DialogDescription></DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.txt" onChange={(e) => onFile(e.target.files?.[0])} />
              <Button type="button" variant="outline" className="gap-1.5 border-dashed" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Choisir un fichier</Button>
              <F label="Nom du document"><Input value={edit.data.name} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, name: e.target.value } })} placeholder="Catalogue des analyses 2026.pdf" /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Catégorie"><Select value={edit.data.category} onValueChange={(category) => setEdit({ ...edit, data: { ...edit.data, category } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Array.from(new Set([...DOC_CATS, edit.data.category])).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></F>
                <F label="Visibilité"><Select value={edit.data.visibility} onValueChange={(v) => setEdit({ ...edit, data: { ...edit.data, visibility: v as KbDocument["visibility"] } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="interne">Interne</SelectItem><SelectItem value="client">Client</SelectItem><SelectItem value="public">Public</SelectItem></SelectContent></Select></F>
              </div>
              <F label="Mots-clés (séparés par des virgules)"><Input value={edit.data.keywords} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, keywords: e.target.value } })} /></F>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Annuler</Button><Button disabled={!edit?.data.name.trim()} onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

/* ---------------- Informations ---------------- */
type LabDraft = Omit<LabInfo, "id">;
const emptyLab: LabDraft = { name: "", address: "", phone: "", hours: "", email: "" };

function InfosTab() {
  const store = useStore();
  const [edit, setEdit] = useState<{ id?: string; data: LabDraft } | null>(null);
  const [newField, setNewField] = useState("");
  const [fieldEdit, setFieldEdit] = useState<{ id: string; label: string } | null>(null);
  const save = () => {
    if (!edit) return;
    if (edit.id) store.updateLab(edit.id, edit.data);
    else store.addLab(edit.data);
    setEdit(null);
  };
  const addField = () => {
    if (!newField.trim()) return;
    store.addRequiredField(newField.trim());
    setNewField("");
  };
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <Panel title="Informations pratiques" description="Adresses, téléphones et horaires communiqués aux clients." actions={<Button size="sm" className="gap-1.5" onClick={() => setEdit({ data: { ...emptyLab } })}><Plus className="h-4 w-4" /> Ajouter un laboratoire</Button>}>
        {store.labs.length === 0 && <Empty text="Aucun laboratoire renseigné." />}
        <div className="grid gap-3 md:grid-cols-2">
          {store.labs.map((l) => (
            <div key={l.id} className="rounded-lg border bg-surface/70 p-4 transition-all hover:shadow-panel">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4 text-primary" />{l.name}</div>
                <div className="flex">
                  <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEdit({ id: l.id, data: { name: l.name, address: l.address, phone: l.phone, hours: l.hours, email: l.email } })}><Pencil className="h-4 w-4" /></Button>
                  <ConfirmDelete title="Supprimer ce laboratoire ?" description={l.name} onConfirm={() => store.deleteLab(l.id)}>
                    <Button size="icon" variant="ghost" aria-label="Supprimer" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </ConfirmDelete>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{l.address}</p>
                <p className="flex gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{l.phone}</p>
                {l.email && <p className="flex gap-2"><Mail className="h-3.5 w-3.5 shrink-0" />{l.email}</p>}
                <p className="flex gap-2"><Clock className="h-3.5 w-3.5 shrink-0" />{l.hours}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Informations obligatoires" description="Une demande reste incomplète tant qu’un champ actif manque. L’agent le redemande au client.">
        <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addField(); }}>
          <Input value={newField} onChange={(e) => setNewField(e.target.value)} placeholder="Ex. Température de conservation" />
          <Button type="submit" disabled={!newField.trim()} className="gap-1.5"><Plus className="h-4 w-4" /> Ajouter</Button>
        </form>
        <div className="space-y-2">
          {store.requiredFields.map((f) => (
            <div key={f.id} className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${f.active ? "text-success" : "text-muted-foreground"}`} />
              {fieldEdit?.id === f.id ? (
                <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); if (fieldEdit.label.trim()) { store.updateRequiredField(f.id, { label: fieldEdit.label.trim() }); setFieldEdit(null); } }}>
                  <Input autoFocus className="h-8" value={fieldEdit.label} onChange={(e) => setFieldEdit({ id: f.id, label: e.target.value })} />
                  <Button size="sm" type="submit">OK</Button>
                </form>
              ) : (
                <span className={`flex-1 ${f.active ? "" : "text-muted-foreground line-through"}`}>{f.label}</span>
              )}
              <Switch checked={f.active} onCheckedChange={(active) => store.updateRequiredField(f.id, { active })} aria-label="Obligatoire" />
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Renommer" onClick={() => setFieldEdit({ id: f.id, label: f.label })}><Pencil className="h-3.5 w-3.5" /></Button>
              <ConfirmDelete title="Supprimer ce champ ?" description={f.label} onConfirm={() => store.deleteRequiredField(f.id)}>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label="Supprimer"><Trash2 className="h-3.5 w-3.5" /></Button>
              </ConfirmDelete>
            </div>
          ))}
        </div>
      </Panel>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier le laboratoire" : "Ajouter un laboratoire"}</DialogTitle><DialogDescription>Ces informations sont transmises aux clients par l’agent.</DialogDescription></DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <F label="Nom"><Input value={edit.data.name} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, name: e.target.value } })} /></F>
              <F label="Adresse"><Input value={edit.data.address} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, address: e.target.value } })} /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Téléphone"><Input value={edit.data.phone} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, phone: e.target.value } })} /></F>
                <F label="Email"><Input type="email" value={edit.data.email} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, email: e.target.value } })} /></F>
              </div>
              <F label="Horaires"><Input value={edit.data.hours} onChange={(e) => setEdit({ ...edit, data: { ...edit.data, hours: e.target.value } })} placeholder="Lun–Ven 08:00–18:00" /></F>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Annuler</Button><Button disabled={!edit?.data.name.trim() || !edit?.data.phone.trim()} onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</p>;
}
