import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, PageHeader, Panel, StatusBadge } from "@/components/app/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/regles")({
  head: () => ({
    meta: [
      { title: "Règles IA — QualiUp AI Back-Office" },
      {
        name: "description",
        content:
          "Règles métier et règles de priorité qui encadrent le comportement des agents IA : planification, urgences, escalades.",
      },
      { property: "og:title", content: "Règles IA — QualiUp" },
      {
        property: "og:description",
        content: "Encadrez les décisions de l'IA avec des règles métier et un ordre de priorité explicite.",
      },
    ],
  }),
  component: ReglesPage,
});

const CATEGORIES = ["Planification", "Urgence", "Affectation", "Communication", "Escalade"];

function ReglesPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    category: "Planification",
    condition: "",
    action: "",
  });

  return (
    <>
      <PageHeader
        eyebrow="IA"
        title="Règles IA"
        description="Les agents ne décident jamais librement : ils appliquent ces règles, dans cet ordre de priorité."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle règle
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <Panel
            title="Règles métier"
            description="Condition → action. Une règle désactivée n'est jamais appliquée par les agents."
          >
            <div className="space-y-2">
              {store.businessRules.map((r) => (
                <div key={r.id} className="rounded-md border bg-muted/30 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{r.name}</span>
                        <span className="rounded-full border bg-surface px-2 py-0.5 text-[11px]">{r.category}</span>
                        <StatusBadge status={r.active ? "actif" : "inactif"} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Si </span>
                        {r.condition}
                        <span className="font-medium text-foreground"> alors </span>
                        {r.action}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={r.active}
                        onCheckedChange={(v) => store.updateBusinessRule(r.id, { active: v })}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => store.deleteBusinessRule(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel
          title="Ordre de priorité"
          description="Utilisé par l'agent Prélèvements pour arbitrer entre deux créneaux possibles."
        >
          <div className="space-y-2">
            {store.priorityRules.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <span className="num w-5 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                <span className="min-w-0 flex-1 text-sm">{p.label}</span>
                <Switch checked={p.active} onCheckedChange={() => store.togglePriorityRule(p.id)} />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={i === 0}
                  onClick={() => store.movePriorityRule(p.id, "up")}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={i === store.priorityRules.length - 1}
                  onClick={() => store.movePriorityRule(p.id, "down")}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle règle métier</DialogTitle>
            <DialogDescription>Elle s'applique immédiatement aux agents actifs.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Nom de la règle">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Catégorie">
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Condition (si…)">
              <Input value={draft.condition} onChange={(e) => setDraft({ ...draft, condition: e.target.value })} />
            </Field>
            <Field label="Action (alors…)">
              <Input value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} />
            </Field>
            <Label className="text-xs text-muted-foreground">
              La règle est créée active et tracée dans l'audit.
            </Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={!draft.name || !draft.condition || !draft.action}
              onClick={() => {
                store.addBusinessRule({ ...draft, active: true });
                setDraft({ name: "", category: "Planification", condition: "", action: "" });
                setOpen(false);
              }}
            >
              Créer la règle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
