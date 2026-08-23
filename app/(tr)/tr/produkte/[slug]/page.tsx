import type { Metadata } from "next"
import {
  ProduktRoute,
  produktMetadata,
  produktStaticParams,
} from "@/app/_routes/produkt-detail"

export const dynamicParams = false
export const generateStaticParams = produktStaticParams

export function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  return produktMetadata("tr", props.params)
}

export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <ProduktRoute locale="tr" params={props.params} />
}
