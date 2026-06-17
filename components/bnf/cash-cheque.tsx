"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Hash, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBNF } from "@/lib/bnf-types"

export function CashCheque({
  cle_secrete,
  onSuccess,
}: {
  cle_secrete: string
  onSuccess: (result: { code: string; montant: number }) => void
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<number | null>(null)
  const [securedMessage, setSecuredMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (clean.length !== 6) {
      setError("Le code doit comporter 6 caractères.")
      return
    }

    setError("")
    setSuccess(null)
    setSecuredMessage(null)
    setLoading(true)

    try {
      const res = await fetch("/api/cheque/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cle_secrete,
          code_unique: clean,
        }),
      })

      const data = await res.json()

      if (res.status === 403 && data.secured) {
        setSecuredMessage(data.error)
        setCode("")
        return
      }

      if (!res.ok) {
        setError(data.error ?? "Code invalide, déjà utilisé ou expiré.")
        return
      }

      setSuccess(data.montant)
      setCode("")
      onSuccess({ code: data.code_unique, montant: data.montant })
    } catch {
      setError("Erreur réseau. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
          <Inbox className="size-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Encaisser un chèque
          </h2>
          <p className="text-xs text-muted-foreground">
            Saisissez le code à 6 caractères reçu.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="cash-code" className="text-sm font-medium">
            Code du chèque
          </label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="cash-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().slice(0, 6))
                setSuccess(null)
                setSecuredMessage(null)
              }}
              placeholder="A8X92B"
              maxLength={6}
              disabled={loading}
              className="h-12 w-full rounded-xl border border-input bg-background/60 pl-10 pr-3 text-center font-mono text-lg font-semibold tracking-[0.3em] outline-none transition placeholder:tracking-[0.3em] placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
            />
          </div>
        </div>

        {error && (
          <p className="animate-pop text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {securedMessage && (
          <div
            className="animate-pop flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-3.5"
            role="status"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" />
            <p className="text-sm text-foreground">{securedMessage}</p>
          </div>
        )}

        {success !== null && (
          <div
            className="animate-pop flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3.5"
            role="status"
          >
            <CheckCircle2 className="size-5 shrink-0 text-accent" />
            <p className="text-sm text-foreground">
              Chèque encaissé !{" "}
              <span className="font-mono font-semibold text-accent">
                +{formatBNF(success)} BNF
              </span>{" "}
              crédités sur votre compte.
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90"
        >
          <Inbox className="size-4.5" />
          {loading ? "Encaissement…" : "Encaisser"}
        </Button>
      </form>
    </section>
  )
}
