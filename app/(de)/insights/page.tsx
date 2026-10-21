import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const revalidate = 300
export function generateMetadata() {
  return insightsMetadata("de")
}

export default function Page() {
  return <InsightsRoute locale="de" />
}
