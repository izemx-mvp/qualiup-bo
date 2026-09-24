import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Bot, Menu, ShieldCheck, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import logoAsset from "@/assets/qualiup-logo.png.asset.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NAV } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { can, agents } = useStore();
  const activeAgents = agents.filter((a) => a.active).length;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/95 p-1">
          <img src={logoAsset.url} alt="QualiUp" className="h-full w-full object-contain" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-wide">QUALIUP</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-primary">
            AI Control Center
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-3 py-4">
          {NAV.filter((section) => can(section.key)).map((section) => (
            <div key={section.key} className="mb-5">
              <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    activeOptions={{ exact: item.to === "/" }}
                    className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
                  >
                    <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-foreground/60">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-sidebar-primary" />
          {activeAgents} agent{activeAgents > 1 ? "s" : ""} IA actif{activeAgents > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, users, setCurrentUser, actions } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pending = actions.filter((a) => a.status === "en attente").length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-surface/95 px-4 backdrop-blur lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Environnement de démonstration · données opérationnelles simulées
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="relative gap-2">
              <Link to="/validation">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Validation</span>
                {pending > 0 && (
                  <Badge className="ml-1 bg-accent text-accent-foreground">{pending}</Badge>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-semibold">{currentUser.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{currentUser.role}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Changer de profil (démo des rôles)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users
                  .filter((u) => u.active)
                  .map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onClick={() => setCurrentUser(u.id)}
                      className={cn("flex flex-col items-start gap-0.5", u.id === currentUser.id && "bg-muted")}
                    >
                      <span className="text-xs font-medium">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground">{u.role}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main key={pathname} className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
