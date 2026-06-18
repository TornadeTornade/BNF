"use client"

import { LayoutDashboard, LogOut, Wallet, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export type BnfTab = "dashboard" | "actions" | "audit" 

const TABS: { id: BnfTab; label: string; icon: typeof Wallet }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "actions", label: "Actions", icon: Wallet },
  { id: "audit", label: "Audit Public", icon: ShieldCheck },
]

export function TabBar({
  active,
  onChange,
}: {
  active: BnfTab
  onChange: (tab: BnfTab) => void
}) {
  return (
    <nav
      aria-label="Navigation principale"
      className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-4 py-2.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition",
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", isActive && "text-gold")} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
