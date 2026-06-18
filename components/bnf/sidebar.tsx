"use client"

import { LayoutDashboard, LogOut, Wallet, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { BnfLogo } from "@/components/bnf/bnf-logo"
import { ThemeToggle } from "@/components/bnf/theme-toggle"
import type { BnfTab } from "@/components/bnf/tab-bar"
import Link from "next/link" // ◄ Ajout de l'import Link

const NAV: { id: BnfTab; label: string; icon: typeof Wallet }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "actions", label: "Actions", icon: Wallet },
  { id: "audit", label: "Audit Public", icon: ShieldCheck },
]

export function Sidebar({
  pseudo,
  active,
  onChange,
  onLogout,
}: {
  pseudo: string
  active: BnfTab
  onChange: (tab: BnfTab) => void
  onLogout: () => void
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card/40 px-4 py-5 lg:flex">
      <div className="px-2">
        <BnfLogo size="lg" />
      </div>

      <nav aria-label="Navigation principale" className="mt-8 flex flex-col gap-1.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{pseudo}</p>
            <p className="text-xs text-muted-foreground">Compte vérifié</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
