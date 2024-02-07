import CardGrid from "@/components/card-grid"
import { Header } from "@/components/header"

export const revalidate = 3600 // revalidate the data at most every hour

export default async function Home() {
  return (
    <div className="bg-slate-100 h-full flex flex-col overflow-x-hidden">
      <Header />
      <div className="container mx-2 px-2 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold">Explore Urban Data Studies</h1>
        <CardGrid />
      </div>
    </div>
  )
}
