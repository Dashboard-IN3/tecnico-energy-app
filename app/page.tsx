import { Header } from "../components/header"
import CardGrid from "../components/card-grid"

// Prisma does not support Edge without the Data Proxy currently
export const runtime = "edge"
export const preferredRegion = "home"
export const dynamic = "force-dynamic"

export default async function Home() {
  return (
    <div className="bg-slate-100 h-full overflow-x-hidden">
      <Header />
      <div className="container mx-2 px-2 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold">Explore Urban Data Studies</h1>
        {/* <CardGrid /> */}
      </div>
    </div>
  )
}
