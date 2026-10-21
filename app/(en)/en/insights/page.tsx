import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const revalidate = 300
export function generateMetadata() {
  return insightsMetadata("en")
}

export default function Page() {
  return <InsightsRoute locale="en" />
}
