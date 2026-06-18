import Image from "next/image"
import { cn } from "@/lib/utils"

export function BnfLogoLogin({
  className,
  showText = true,
  size = "md",
}: {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl" 
}) {
  const box =
    size === "2xl" ? "size-50" :
    size === "xl" ? "size-30" :
    size === "lg" ? "size-14" :
    size === "sm" ? "size-9" : "size-11"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-xl overflow-hidden",
          box,
        )}
      >
       {/* ☀️ IMAGE POUR LE MODE CLAIR */}
        <Image 
          src="/Logo_BNF1.png" 
          alt="Logo BNF"
          width={500}
          height={300}
          className="size-full object-contain dark:hidden" // ◄ Visible par défaut, masqué en mode dark
        />

        {/* 🌙 IMAGE POUR LE MODE SOMBRE */}
        <Image 
          src="/Logo_BNF3.png" 
          alt="Logo BNF"
          width={500}
          height={300}
          className="hidden size-full object-contain dark:block" // ◄ Masqué par défaut, affiché en mode dark
        />
      </div>

      {showText && (
        <div className="leading-tight">
          <p className="font-semibold tracking-tight text-foreground">
            BNF
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Banque Nationale Friendaise
          </p>
        </div>
      )}
    </div>
  )
}


export function BnfLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl" 
}) {
  const box =
    size === "2xl" ? "size-50" :
    size === "xl" ? "size-20" :
    size === "lg" ? "size-14" :
    size === "sm" ? "size-9" : "size-11"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-xl overflow-hidden",
          box,
        )}
      >
       {/* ☀️ IMAGE POUR LE MODE CLAIR */}
        <Image 
          src="/Logo_BNF2.png" 
          alt="Logo BNF"
          width={500}
          height={300}
          className="size-full object-contain dark:hidden" // ◄ Visible par défaut, masqué en mode dark
        />

        {/* 🌙 IMAGE POUR LE MODE SOMBRE */}
        <Image 
          src="/Logo_BNF4.png" 
          alt="Logo BNF"
          width={500}
          height={300}
          className="hidden size-full object-contain dark:block" // ◄ Masqué par défaut, affiché en mode dark
        />
      </div>

      {showText && (
        <div className="leading-tight">
          <p className="font-semibold tracking-tight text-foreground">
             
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Banque Nationale Friendaise
          </p>
        </div>
      )}
    </div>
  )
}
