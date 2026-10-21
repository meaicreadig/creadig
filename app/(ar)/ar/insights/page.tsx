import { InsightsRoute, insightsMetadata } from "@/app/_routes/insights"

export const revalidate = 300
export function generateMetadata() {
  return insightsMetadata("ar")
}

export default function Page() {
  return <InsightsRoute locale="ar" />
}
