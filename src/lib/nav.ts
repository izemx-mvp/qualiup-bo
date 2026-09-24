import { BellRing, BookOpen, Bot, CalendarCog, ClipboardCheck, LayoutDashboard } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Bot;
}

export interface NavSection {
  key: string;
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    key: "accueil",
    title: "Accueil",
    items: [{ label: "Tableau de bord IA", to: "/", icon: LayoutDashboard }],
  },
  {
    key: "demandes",
    title: "Supervision",
    items: [{ label: "Demandes & validation", to: "/demandes", icon: ClipboardCheck }],
  },
  {
    key: "planning",
    title: "Configuration IA",
    items: [{ label: "Paramètres de planification", to: "/planning", icon: CalendarCog }],
  },
  {
    key: "connaissances",
    title: "Contenu de l’agent",
    items: [{ label: "Base de connaissances", to: "/connaissances", icon: BookOpen }],
  },
  {
    key: "notifications",
    title: "Communication",
    items: [{ label: "Notifications & relances", to: "/notifications", icon: BellRing }],
  },
];
