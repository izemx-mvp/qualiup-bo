import {
  Activity,
  AlarmClock,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  ClipboardList,
  Cog,
  FileBarChart,
  FileText,
  FlaskConical,
  Gauge,
  Globe,
  Info,
  KeyRound,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquareCode,
  Plug,
  ScrollText,
  Shield,
  Sliders,
  TrendingUp,
  Users,
  UserSquare2,
} from "lucide-react";

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
    items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }],
  },
  {
    key: "operations",
    title: "Opérations",
    items: [
      { label: "Demandes", to: "/demandes", icon: ClipboardList },
      { label: "Planning", to: "/planning", icon: CalendarDays },
      { label: "Prélèvements", to: "/prelevements", icon: FlaskConical },
      { label: "Préleveurs", to: "/preleveurs", icon: UserSquare2 },
      { label: "Clients", to: "/clients", icon: Building2 },
      { label: "Sites", to: "/sites", icon: MapPin },
    ],
  },
  {
    key: "ia",
    title: "IA",
    items: [
      { label: "Agents IA", to: "/agents", icon: Bot },
      { label: "Actions à valider", to: "/validation", icon: BadgeCheck },
      { label: "Activité IA", to: "/activite", icon: Activity },
      { label: "Règles IA", to: "/regles", icon: Sliders },
      { label: "Modèles de messages", to: "/modeles", icon: MessageSquareCode },
      { label: "Permissions des agents", to: "/permissions", icon: Shield },
    ],
  },
  {
    key: "kb",
    title: "Base de connaissances",
    items: [
      { label: "FAQ", to: "/faq", icon: BookOpen },
      { label: "Documents", to: "/documents", icon: FileText },
      { label: "Informations générales", to: "/informations", icon: Info },
    ],
  },
  {
    key: "analytics",
    title: "Analytics",
    items: [
      { label: "Performance", to: "/performance", icon: Gauge },
      { label: "Chiffre d'affaires", to: "/chiffre-affaires", icon: TrendingUp },
      { label: "Rapports", to: "/rapports", icon: FileBarChart },
    ],
  },
  {
    key: "integrations",
    title: "Intégrations",
    items: [
      { label: "WhatsApp", to: "/integrations/whatsapp", icon: Plug },
      { label: "Calendrier", to: "/integrations/calendrier", icon: CalendarDays },
      { label: "Système QualiUp", to: "/integrations/systeme", icon: Globe },
      { label: "Email", to: "/integrations/email", icon: Mail },
      { label: "API", to: "/integrations/api", icon: KeyRound },
    ],
  },
  {
    key: "configuration",
    title: "Configuration",
    items: [
      { label: "Paramètres généraux", to: "/parametres", icon: Cog },
      { label: "Utilisateurs", to: "/utilisateurs", icon: Users },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "Sécurité", to: "/securite", icon: Shield },
      { label: "Logs système", to: "/logs", icon: ScrollText },
      { label: "Audit des actions", to: "/audit", icon: AlarmClock },
    ],
  },
];
