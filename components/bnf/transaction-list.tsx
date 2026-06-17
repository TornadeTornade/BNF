import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react"
import { formatBNF, type Transaction } from "@/lib/bnf-types"

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[]
}) {
  return (
    <section aria-label="Historique des transactions">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Receipt className="size-4 text-gold" />
          Dernières transactions
        </h2>
        <span className="text-xs text-muted-foreground">
          {transactions.length} opération{transactions.length > 1 ? "s" : ""}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Aucune transaction pour le moment.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {transactions.map((tx) => {
            const isIn = tx.type === "cheque_encaisse"
            return (
              <li
                key={tx.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3.5 transition hover:border-gold/30"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    isIn
                      ? "bg-accent/15 text-accent"
                      : "bg-gold/15 text-gold"
                  }`}
                >
                  {isIn ? (
                    <ArrowDownLeft className="size-5" />
                  ) : (
                    <ArrowUpRight className="size-5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {isIn ? "Chèque encaissé" : "Chèque émis"}
                    {tx.party ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {tx.party}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{tx.code}</span> · {tx.date}
                  </p>
                </div>

                <p
                  className={`shrink-0 font-mono text-sm font-semibold ${
                    isIn ? "text-accent" : "text-gold"
                  }`}
                >
                  {isIn ? "+" : "-"}
                  {formatBNF(tx.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
