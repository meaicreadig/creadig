import type { Metadata } from "next"
import {
  ServiceRoute,
  serviceMetadata,
  serviceStaticParams,
} from "@/app/_routes/leistung-detail"

export const dynamicParams = false
export const generateStaticParams = serviceStaticParams

export function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  return serviceMetadata("tr", props.params)
}

export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <ServiceRoute locale="ar" params={props.params} />
}
