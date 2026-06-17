export type TransactionType = "cheque_emis" | "cheque_encaisse"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  /** Pseudo de l'autre partie (bénéficiaire ou émetteur), si connu */
  party?: string
  code: string
  date: string
}

export interface Account {
  pseudo: string
  balance: number
}

export function generateChequeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatBNF(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount)
}
