import { Download, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger" | "info";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    accent: "text-accent-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    info: "text-info",
  };
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/70" />}
      </div>
      <div className={cn("num mt-2 text-2xl font-bold", tones[tone])}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  // requests
  "à valider": "bg-warning/15 text-warning-foreground border-warning/40",
  validée: "bg-info/15 text-info border-info/30",
  planifiée: "bg-info/15 text-info border-info/30",
  refusée: "bg-destructive/10 text-destructive border-destructive/30",
  clarification: "bg-muted text-muted-foreground border-border",
  // operations
  planifié: "bg-info/15 text-info border-info/30",
  "en cours": "bg-accent/25 text-accent-foreground border-accent/50",
  réalisé: "bg-success/15 text-success border-success/30",
  "en retard": "bg-destructive/10 text-destructive border-destructive/30",
  annulé: "bg-muted text-muted-foreground border-border",
  // actions
  "en attente": "bg-warning/15 text-warning-foreground border-warning/40",
  approuvée: "bg-success/15 text-success border-success/30",
  modifiée: "bg-info/15 text-info border-info/30",
  // integrations / logs
  connecté: "bg-success/15 text-success border-success/30",
  dégradé: "bg-warning/15 text-warning-foreground border-warning/40",
  déconnecté: "bg-destructive/10 text-destructive border-destructive/30",
  succès: "bg-success/15 text-success border-success/30",
  erreur: "bg-destructive/10 text-destructive border-destructive/30",
  avertissement: "bg-warning/15 text-warning-foreground border-warning/40",
  "validation requise": "bg-warning/15 text-warning-foreground border-warning/40",
  refusé: "bg-destructive/10 text-destructive border-destructive/30",
  // urgency
  basse: "bg-muted text-muted-foreground border-border",
  normale: "bg-info/10 text-info border-info/25",
  élevée: "bg-warning/15 text-warning-foreground border-warning/40",
  critique: "bg-destructive/10 text-destructive border-destructive/30",
  // permissions
  autorisé: "bg-success/15 text-success border-success/30",
  validation: "bg-warning/15 text-warning-foreground border-warning/40",
  interdit: "bg-destructive/10 text-destructive border-destructive/30",
  actif: "bg-success/15 text-success border-success/30",
  inactif: "bg-muted text-muted-foreground border-border",
  "à jour": "bg-success/15 text-success border-success/30",
  envoyé: "bg-success/15 text-success border-success/30",
  automatique: "bg-info/10 text-info border-info/25",
  "validation humaine": "bg-warning/15 text-warning-foreground border-warning/40",
  désynchronisée: "bg-warning/15 text-warning-foreground border-warning/40",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2 py-0 text-[11px] font-medium capitalize", STATUS_TONES[status] ?? "", className)}
    >
      {status}
    </Badge>
  );
}

export function Confidence({ value, className }: { value: number; className?: string }) {
  const tone = value >= 90 ? "bg-success" : value >= 70 ? "bg-warning" : "bg-destructive";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="num text-xs text-muted-foreground">{value} %</span>
    </div>
  );
}

export function Toolbar({
  search,
  onSearch,
  placeholder = "Rechercher…",
  children,
  onExport,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
  onExport?: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="h-9 bg-surface pl-8"
        />
      </div>
      {children}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Exporter
        </Button>
      )}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-foreground">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function KeyValue({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y">
      {items.map((it) => (
        <div key={it.label} className="flex items-start justify-between gap-4 py-2 text-sm">
          <dt className="text-muted-foreground">{it.label}</dt>
          <dd className="max-w-[60%] text-right font-medium">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function exportCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const csv = [
    headers.join(";"),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(";")),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ConfirmDelete({
  title,
  description,
  onConfirm,
  children,
}: {
  title: string;
  description?: string;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? "Cette action est définitive."}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
