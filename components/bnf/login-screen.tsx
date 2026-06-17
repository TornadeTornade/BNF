"use client"

import { useState } from "react"
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BnfLogo } from "./bnf-logo"
import { ThemeToggle } from "./theme-toggle" // Réintégré pour le confort des joueurs

// 1. On garde l'interface indispensable pour le reste du site
export interface BnfUser {
  pseudo: string
  solde: number
  cle_secrete: string
}

type Mode = "login" | "register"

export function LoginScreen({
  onLogin,
}: {
  onLogin: (user: BnfUser) => void // Attend l'utilisateur complet
}) {
  const [mode, setMode] = useState<Mode>("login")
  const [pseudo, setPseudo] = useState("")
  const [secret, setSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false) // Réintégré pour éviter les double-clics
  const [createdUser, setCreatedUser] = useState<BnfUser | null>(null)
  const [copied, setCopied] = useState(false)

  const isRegister = mode === "register"

  function switchMode(next: Mode) {
    if (loading) return
    setMode(next)
    setError("")
    setSecret("")
    setShowSecret(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!pseudo.trim()) {
      setError("Veuillez renseigner votre pseudo Minecraft.")
      return
    }

    if (mode === "login" && !secret.trim()) {
      setError("Veuillez renseigner votre clé secrète.")
      return
    }

    setError("")
    setLoading(true)

    try {
      if (mode === "login") {
        // VRAIE CONNEXION API
        const res = await fetch("/api/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pseudo: pseudo.trim(),
            cle_secrete: secret.trim(),
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Connexion impossible.")
          return
        }

        onLogin({
          pseudo: data.pseudo,
          solde: data.solde,
          cle_secrete: data.cle_secrete,
        })
      } else {
        // VRAIE CRÉATION DE COMPTE API
        if (pseudo.trim().length < 3) {
          setError("Le pseudo doit comporter au moins 3 caractères.")
          return
        }

        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pseudo: pseudo.trim(),
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Création de compte impossible.")
          return
        }

        // Stocke l'utilisateur créé pour afficher l'écran avec la clé générée
        setCreatedUser({
          pseudo: data.pseudo,
          solde: data.solde,
          cle_secrete: data.cle_secrete,
        })
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyKey() {
    if (!createdUser) return
    try {
      await navigator.clipboard.writeText(createdUser.cle_secrete)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  // ── Ecran de succès d'inscription (Indispensable pour récupérer la clé automatique) ──
  if (createdUser) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
        <div className="bnf-sheen pointer-events-none absolute inset-0" aria-hidden />
        <div className="absolute right-5 top-5 z-10">
          <ThemeToggle />
        </div>
        <div className="animate-tab-in relative w-full max-w-md rounded-2xl border border-border bg-card/80 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur">
          <BnfLogo showText={false} size="lg" />
          <h1 className="mt-5 text-xl font-semibold text-foreground">Compte créé avec succès !</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Conservez précieusement cette clé secrète. Elle est générée automatiquement et reste indispensable pour vous reconnecter.
          </p>
          <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Votre Clé Secrète
            </p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-gold">
              {createdUser.cle_secrete}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCopyKey}
            variant="outline"
            className="mt-4 h-10 w-full rounded-xl border-gold/40 gap-2"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-500" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copier la clé dans le presse-papiers
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => onLogin(createdUser)}
            className="mt-3 h-11 w-full rounded-xl bg-gold text-base font-semibold text-gold-foreground hover:bg-gold/90"
          >
            Accéder à mon espace BNF
          </Button>
        </div>
      </main>
    )
  }

  // ── Formulaire principal (Ton superbe design d'onglets) ──
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <div className="bnf-sheen pointer-events-none absolute inset-0" aria-hidden />

      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <BnfLogo showText={false} size="lg" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-balance text-foreground">
            Banque Nationale Friendaise
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {isRegister
              ? "Ouvrez votre compte officiel et commencez à gérer vos BNF."
              : "Accédez à votre compte officiel pour gérer vos BNF en toute sécurité."}
          </p>
        </div>

        {/* Sélecteur Connexion / Création style Onglet (Ton idée de génie) */}
        <div
          className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary/60 p-1"
          role="tablist"
          aria-label="Mode d'accès"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            disabled={loading}
            onClick={() => switchMode("login")}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
              !isRegister
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground disabled:opacity-50"
            }`}
          >
            <LogIn className="size-4" />
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            disabled={loading}
            onClick={() => switchMode("register")}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
              isRegister
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground disabled:opacity-50"
            }`}
          >
            <UserPlus className="size-4" />
            Créer un compte
          </button>
        </div>

        <form
          key={mode}
          onSubmit={handleSubmit}
          className="animate-tab-in rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-foreground/5 backdrop-blur"
        >
          <div className="space-y-5">
            {/* Champ Pseudo (Commun aux deux modes) */}
            <div className="space-y-2">
              <label
                htmlFor="pseudo"
                className="text-sm font-medium text-foreground"
              >
                Pseudo Minecraft
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="pseudo"
                  value={pseudo}
                  disabled={loading}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ex. Steve_le_Roi"
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-input bg-background/60 pl-10 pr-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Mode Connexion : On demande la clé secrète */}
            {!isRegister && (
              <div className="space-y-2">
                <label
                  htmlFor="secret"
                  className="text-sm font-medium text-foreground"
                >
                  Clé secrète
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="secret"
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    disabled={loading}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-input bg-background/60 pl-10 pr-11 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    aria-label={showSecret ? "Masquer la clé" : "Afficher la clé"}
                    className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    {showSecret ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mode Inscription : Message d'information sur les conditions de création */}
            {isRegister && (
              <div className="rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
                Un compte sera créé avec un solde de départ de 100 BNF. Votre
                clé secrète sécurisée sera générée automatiquement à l'étape suivante.
              </div>
            )}

            {/* Zone d'affichage des erreurs */}
            {error && (
              <p className="animate-pop text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {/* Bouton de validation dynamique */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-gold text-base font-semibold text-gold-foreground hover:bg-gold/90 gap-2"
            >
              {isRegister ? (
                <>
                  <Sparkles className="size-4" />
                  {loading ? "Création en cours..." : "Ouvrir mon compte"}
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  {loading ? "Vérification..." : "Se connecter"}
                </>
              )}
            </Button>

            {/* Lien secondaire de secours en bas */}
            <p className="text-center text-sm text-muted-foreground">
              {isRegister ? (
                <>
                  Vous avez déjà un compte ?{" "}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => switchMode("login")}
                    className="font-semibold text-gold underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => switchMode("register")}
                    className="font-semibold text-gold underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </p>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-accent" />
          Connexion chiffrée — établissement officiel du serveur
        </div>
      </div>
    </main>
  )
}