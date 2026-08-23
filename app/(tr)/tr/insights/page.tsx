import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const metadata = insightsMetadata("tr")

export default function Page() {
  return <InsightsRoute locale="tr" />
}
