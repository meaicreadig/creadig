import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const metadata = insightsMetadata("de")

export default function Page() {
  return <InsightsRoute locale="de" />
}
