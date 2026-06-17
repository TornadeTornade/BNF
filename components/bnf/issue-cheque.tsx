"use client"

import { useState } from "react"
import {
  Check,
  Coins,
  Copy,
  Lock,
  PenLine,
  Sparkles,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBNF } from "@/lib/bnf-types"

export function IssueCheque({
  balance,
  cle_secrete,
  onSuccess,
}: {
  balance: number
  cle_secrete: string
  onSuccess: (result: {
    code: string
    montant: number
    beneficiary?: string
  }) => void
}) {
  const [amount, setAmount] = useState("")
  const [beneficiary, setBeneficiary] = useState("")
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) {
      setError("Indiquez un montant valide.")
      return
    }
    if (value > balance) {
      setError("Solde insuffisant pour émettre ce chèque.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        cle_secrete,
        montant: value,
      }
      const trimmedBeneficiary = beneficiary.trim()
      if (trimmedBeneficiary) {
        body.pseudo_recepteur = trimmedBeneficiary
      }

      const res = await fetch("/api/cheque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Émission impossible. Réessayez.")
        return
      }

      const generatedCode = data.code_unique as string
      setCode(generatedCode)
      setCopied(false)
      setAmount("")
      setBeneficiary("")
      onSuccess({
        code: generatedCode,
        montant: data.montant,
        beneficiary: trimmedBeneficiary || undefined,
      })
    } catch {
      setError("Erreur réseau. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-gold/15 text-gold">
          <PenLine className="size-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Émettre un chèque
          </h2>
          <p className="text-xs text-muted-foreground">
            Générez un code à remettre au bénéficiaire.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Montant (BNF)
          </label>
          <div className="relative">
            <Coins className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="0"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-input bg-background/60 pl-10 pr-3 font-mono text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Solde disponible : {formatBNF(balance)} BNF
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="beneficiary"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            Pseudo du bénéficiaire
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
              <Lock className="size-3" />
              Sécurisé
            </span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="beneficiary"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Optionnel — réservé à ce joueur"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-input bg-background/60 pl-10 pr-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
            />
          </div>
        </div>

        {error && (
          <p className="animate-pop text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-gold text-base font-semibold text-gold-foreground hover:bg-gold/90"
        >
          <Sparkles className="size-4.5" />
          {loading ? "Génération…" : "Générer le code"}
        </Button>
      </form>

      {code && (
        <div className="animate-pop mt-5 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Code du chèque
          </p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em] text-gold">
            {code}
          </p>
          <Button
            type="button"
            onClick={handleCopy}
            variant="outline"
            className="mt-4 h-10 rounded-xl border-gold/40 bg-transparent text-foreground hover:bg-gold/10"
          >
            {copied ? (
              <>
                <Check className="size-4 text-accent" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copier le code
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  )
}
