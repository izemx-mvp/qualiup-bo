import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Building2, CheckCircle2, FileText } from "lucide-react";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/connaissances")({
 head: () => ({ meta: [
  { title: "Base de connaissances de l’agent — QualiUp" }, { name: "description", content: "FAQ, documents, informations pratiques et champs obligatoires de l’agent QualiUp." },
  { property: "og:title", content: "Base de connaissances de l’agent — QualiUp" }, { property: "og:description", content: "Gérez les réponses et références utilisées par l’agent IA." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
 ]}), component: KnowledgePage,
});

function KnowledgePage(){
 const store=useStore(); const required=["Client et contact","Site et adresse","Type d’analyse","Nombre d’échantillons","Date ou délai souhaité"];
 return <><PageHeader eyebrow="Contenu de l’agent" title="Base de connaissances" description="La source unique utilisée par l’agent pour informer les clients et compléter une demande."/>
 <div className="mb-5 grid gap-3 sm:grid-cols-3"><StatCard label="Questions actives" value={store.faqs.filter(f=>f.active).length} icon={BookOpen}/><StatCard label="Documents indexés" value={store.documents.filter(d=>d.indexed).length} icon={FileText}/><StatCard label="Champs obligatoires" value={required.length} icon={CheckCircle2} tone="success"/></div>
 <div className="grid gap-4 xl:grid-cols-2">
  <Panel title="FAQ de l’agent" description="Analyses, prélèvements, délais et résultats."><div className="space-y-3">{store.faqs.filter(f=>f.active).map(f=><details key={f.id} className="group rounded-lg border bg-surface/70 p-4"><summary className="cursor-pointer list-none text-sm font-semibold">{f.question}<StatusBadge status={f.category} className="ml-2"/></summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{f.answer}</p></details>)}</div></Panel>
  <div className="space-y-4"><Panel title="Documents de référence" description="Catalogue et procédures disponibles pour les réponses."><div className="space-y-2">{store.documents.map(d=><div key={d.id} className="flex items-center gap-3 rounded-lg border bg-surface/70 p-3"><FileText className="h-5 w-5 text-primary"/><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{d.name}</div><div className="text-xs text-muted-foreground">{d.category} · {d.size}</div></div><StatusBadge status={d.indexed?"indexé":"à indexer"}/></div>)}</div></Panel>
  <Panel title="Informations pratiques" description="Coordonnées communiquées aux clients."><div className="flex gap-3"><Building2 className="mt-1 h-5 w-5 text-primary"/><div className="space-y-1 text-sm"><p className="font-semibold">{store.company.name} · {store.company.labs}</p><p>{store.company.phone} · {store.company.email}</p><p className="text-muted-foreground">{store.company.hours}</p></div></div></Panel>
  <Panel title="Informations obligatoires" description="Une demande reste incomplète tant qu’un champ manque."><div className="grid gap-2 sm:grid-cols-2">{required.map(item=><div key={item} className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success"/>{item}</div>)}</div></Panel></div>
 </div></>;
}