import { Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

export function BnfLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const box =
    size === "lg" ? "size-14" : size === "sm" ? "size-9" : "size-11"
  const icon = size === "lg" ? "size-7" : size === "sm" ? "size-4" : "size-5"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-xl bg-gold text-gold-foreground shadow-lg shadow-black/40 ring-1 ring-gold/40",
          box,
        )}
      >
        <Landmark className={icon} strokeWidth={2.25} aria-hidden />
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
