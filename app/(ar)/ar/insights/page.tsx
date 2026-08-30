import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const metadata = insightsMetadata("ar")

export default function Page() {
  return <InsightsRoute locale="ar" />
}
