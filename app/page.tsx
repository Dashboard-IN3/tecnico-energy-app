import CardGrid from "@/components/card-grid"
import { Header } from "@/components/header"
import PlausibleProvider from "next-plausible"

export const revalidate = 3600 // revalidate the data at most every hour

export default async function Home() {
  return (
    <PlausibleProvider domain="process.env.NEXT_PUBLIC_DOMAIN_NAME">
      <div className="bg-slate-100 h-full min-h-screen flex flex-col overflow-x-hidden">
        <Header />
        <div className="container mx-2 px-2 sm:px-6 lg:px-8 py-8 min-w-full">
          <h1 className="text-xl font-bold">Explore Urban Data Studies</h1>
          <CardGrid />
        </div>
      </div>
    </PlausibleProvider>
  )
}
