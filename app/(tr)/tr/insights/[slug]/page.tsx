import type { Metadata } from "next"
import {
  InsightRoute,
  insightMetadata,
  insightStaticParams,
} from "@/app/_routes/insight-detail"

export const dynamicParams = true
export const revalidate = 300
export const generateStaticParams = insightStaticParams

export function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  return insightMetadata("tr", props.params)
}

export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <InsightRoute locale="tr" params={props.params} />
}
