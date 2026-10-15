import { STATUS_LABEL } from "@/lib/finanz/auftraege/rechnen"

const TON: Record<string, string> = {
  entwurf: "bg-background text-muted-foreground",
  versendet: "bg-secondary text-secondary-foreground",
  geoeffnet: "bg-secondary text-primary",
  angenommen: "bg-primary text-primary-foreground",
  bezahlt: "bg-primary text-primary-foreground",
  aenderung: "bg-accent text-accent-foreground",
  ueberfaellig: "bg-destructive text-primary-foreground",
  abgelaufen: "bg-background text-muted-foreground",
  abgelehnt: "bg-background text-muted-foreground",
  ersetzt: "bg-background text-muted-foreground",
  storniert: "bg-background text-muted-foreground line-through",
}

export function StatusPille({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${TON[status] ?? TON.entwurf}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
