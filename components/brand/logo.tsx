import { cn } from "@/lib/utils"

type LogoProps = {
  /** Auf dunklen Bändern wird die anthrazitfarbene Wortmarke aufgehellt. */
  variant?: "auto" | "dark" | "light"
  className?: string
  priority?: boolean
}

/**
 * Echtes creaDIG-Logo (Gold + Anthrazit, ineinandergreifendes Emblem).
 * Quelle: `~/Documents/creadiglogo.svg` → `public/brand/creadig-logo.svg`.
 *
 * Kein `next/image`: Das SVG ist unter 9 KB und soll ohne Layout-Shift und
 * ohne Optimierungs-Pipeline sofort stehen. Höhe kommt über `className`,
 * die Breite ergibt sich aus dem Seitenverhältnis (~9,4 : 1).
 */
export function Logo({ variant = "auto", className, priority }: LogoProps) {
  if (variant === "auto") {
    return (
      <span className={cn("relative inline-block", className)}>
        {/* Auf hellem Grund: Wortmarke anthrazit. */}
        <img
          src="/brand/creadig-logo.svg"
          alt="creaDIG"
          className="h-full w-auto dark:hidden"
          fetchPriority={priority ? "high" : undefined}
        />
        {/* Im Dark-Mode: aufgehellte Wortmarke, Gold bleibt Gold. */}
        <img
          src="/brand/creadig-logo-light.svg"
          alt=""
          aria-hidden="true"
          className="hidden h-full w-auto dark:block"
        />
      </span>
    )
  }

  return (
    <img
      src={variant === "light" ? "/brand/creadig-logo-light.svg" : "/brand/creadig-logo.svg"}
      alt="creaDIG"
      className={cn("w-auto", className)}
      fetchPriority={priority ? "high" : undefined}
    />
  )
}
