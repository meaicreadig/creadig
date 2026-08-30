import type { Metadata } from "next"
import {
  ArbeitRoute,
  arbeitMetadata,
  arbeitStaticParams,
} from "@/app/_routes/arbeit-detail"

export const dynamicParams = false
export const generateStaticParams = arbeitStaticParams

export function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  return arbeitMetadata("tr", props.params)
}

export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <ArbeitRoute locale="ar" params={props.params} />
}
