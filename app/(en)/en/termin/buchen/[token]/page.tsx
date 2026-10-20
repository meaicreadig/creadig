import { TerminBuchenRoute, terminBuchenMetadata } from "@/app/_routes/termin-buchen"

export const dynamic = "force-dynamic"
export const metadata = terminBuchenMetadata("en")

export default function Page(props: { params: Promise<{ token: string }> }) {
  return <TerminBuchenRoute params={props.params} locale="en" />
}
