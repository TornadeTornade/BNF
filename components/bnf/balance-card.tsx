import Image from "next/image"
import { ArrowDownLeft, ArrowUpRight, BadgeCheck } from "lucide-react"
import { formatBNF } from "@/lib/bnf-types"

export function BalanceCard({
  pseudo,
  balance,
  received,
  sent,
}: {
  pseudo: string
  balance: number
  received: number
  sent: number
}) {
  return (
    <section
      aria-label="Solde du compte"
      className="bnf-sheen relative overflow-hidden rounded-3xl border border-gold/20 bg-card p-6 shadow-2xl shadow-black/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative size-12 overflow-hidden rounded-xl ring-2 ring-gold/40">
            <Image
              src={`https://mc-heads.net/avatar/${pseudo}`}
              alt={`Tête Minecraft de ${pseudo}`}
              fill
              sizes="48px"
              className="object-cover [image-rendering:pixelated]"
            />
          </div>
          <div className="leading-tight">
            <p className="flex items-center gap-1.5 font-semibold text-foreground">
              {pseudo}
              <BadgeCheck className="size-4 text-gold" aria-label="Compte vérifié" />
            </p>
            <p className="text-xs text-muted-foreground">Compte courant BNF</p>
          </div>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
          Officiel
        </span>
      </div>

      <div className="mt-7">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Solde disponible
        </p>
        <p className="mt-1 flex items-baseline gap-2 font-mono text-5xl font-semibold tracking-tight text-foreground">
          {formatBNF(balance)}
          <span className="text-xl font-medium text-gold">BNF</span>
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid size-6 place-items-center rounded-md bg-accent/15 text-accent">
              <ArrowDownLeft className="size-3.5" />
            </span>
            Encaissé
          </div>
          <p className="mt-1.5 font-mono text-lg font-semibold text-foreground">
            +{formatBNF(received)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid size-6 place-items-center rounded-md bg-gold/15 text-gold">
              <ArrowUpRight className="size-3.5" />
            </span>
            Émis
          </div>
          <p className="mt-1.5 font-mono text-lg font-semibold text-foreground">
            -{formatBNF(sent)}
          </p>
        </div>
      </div>
    </section>
  )
}
