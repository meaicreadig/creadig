import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const metadata = insightsMetadata("en")

export default function Page() {
  return <InsightsRoute locale="en" />
}
