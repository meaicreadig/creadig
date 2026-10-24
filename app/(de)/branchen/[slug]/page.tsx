import { BrancheRoute, brancheMetadata, brancheParams } from "@/app/_routes/branche"

export const dynamicParams = false
export const generateStaticParams = brancheParams

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return brancheMetadata((await params).slug, "de")
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <BrancheRoute slug={(await params).slug} locale="de" />
}
