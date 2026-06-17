"use client"

import { useEffect, useMemo, useState } from "react"
import { LogOut } from "lucide-react"
import { type Transaction } from "@/lib/bnf-types"
import { BnfLogo } from "@/components/bnf/bnf-logo"
import { LoginScreen, type BnfUser } from "@/components/bnf/login-screen"
import { BalanceCard } from "@/components/bnf/balance-card"
import { TransactionList } from "@/components/bnf/transaction-list"
import { IssueCheque } from "@/components/bnf/issue-cheque"
import { CashCheque } from "@/components/bnf/cash-cheque"
import { TabBar, type BnfTab } from "@/components/bnf/tab-bar"
import { ThemeToggle } from "@/components/bnf/theme-toggle"
import { Sidebar } from "@/components/bnf/sidebar"

export default function Page() {
  const [user, setUser] = useState<BnfUser | null>(null)
  const [tab, setTab] = useState<BnfTab>("dashboard")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // ── 📝 REMPLACE LE BLOC EFFECT PAR CELUI-CI ──────────────────────────
  useEffect(() => {
    if (!user) return

    // 💡 On crée une copie fixe pour que TypeScript ne râle pas dans la fonction async
    const currentUser = user 

    async function loadTransactions() {
      try {
        const res = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${currentUser.cle_secrete}` }
        })
        if (res.ok) {
          const dbData = await res.json()
          
          const mappedData = dbData.map((tx: any) => {
            const isIn = tx.receiver_pseudo === currentUser.pseudo
            return {
              id: tx.id,
              type: isIn ? "cheque_encaisse" : "cheque_emis",
              amount: tx.amount,
              party: isIn ? tx.sender_pseudo : tx.receiver_pseudo,
              code: tx.type === "cheque" ? "CHÈQUE" : "VIR",
              date: new Date(tx.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) +
                    " · " +
                    new Date(tx.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            }
          })
          
          setTransactions(mappedData)
        }
      } catch (err) {
        console.error("Erreur historique:", err)
      }
    }

    loadTransactions()
  }, [user])
  // ─────────────────────────────────────────────────────────────────────


  const { received, sent } = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "cheque_encaisse") acc.received += tx.amount
        else acc.sent += tx.amount
        return acc
      },
      { received: 0, sent: 0 },
    )
  }, [transactions])

  function now() {
    return (
      "Aujourd'hui · " +
      new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  function handleIssueSuccess(result: {
    code: string
    montant: number
    beneficiary?: string
  }) {
    setUser((u) =>
      u ? { ...u, solde: u.solde - result.montant } : null,
    )
    setTransactions((t) => [
      {
        id: crypto.randomUUID(),
        type: "cheque_emis",
        amount: result.montant,
        party: result.beneficiary,
        code: result.code,
        date: now(),
      },
      ...t,
    ])
  }

  function handleCashSuccess(result: { code: string; montant: number }) {
    setUser((u) =>
      u ? { ...u, solde: u.solde + result.montant } : null,
    )
    setTransactions((t) => [
      {
        id: crypto.randomUUID(),
        type: "cheque_encaisse",
        amount: result.montant,
        code: result.code,
        date: now(),
      },
      ...t,
    ])
  }

  function handleLogout() {
    setUser(null)
    setTab("dashboard")
    setTransactions([])
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        pseudo={user.pseudo}
        active={tab}
        onChange={setTab}
        onLogout={handleLogout}
      />

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
            <BnfLogo size="sm" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Se déconnecter"
                className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md flex-1 px-5 py-6 lg:max-w-5xl lg:px-10 lg:py-10">
          {tab === "dashboard" ? (
            <div key="dashboard" className="animate-tab-in space-y-6">
              <div className="hidden lg:block">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Bonjour, {user.pseudo}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Voici un aperçu de votre compte BNF.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <BalanceCard
                  pseudo={user.pseudo}
                  balance={user.solde}
                  received={received}
                  sent={sent}
                />
                <TransactionList transactions={transactions} />
              </div>
            </div>
          ) : (
            <div key="actions" className="animate-tab-in space-y-5">
              <div className="hidden lg:block">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Zone d&apos;actions
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Émettez ou encaissez un chèque BNF en quelques secondes.
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
                <IssueCheque
                  balance={user.solde}
                  cle_secrete={user.cle_secrete}
                  onSuccess={handleIssueSuccess}
                />
                <CashCheque
                  cle_secrete={user.cle_secrete}
                  onSuccess={handleCashSuccess}
                />
              </div>
            </div>
          )}
        </main>

        <TabBar active={tab} onChange={setTab} />
      </div>
    </div>
  )
}
