import CardGrid from "@/components/card-grid"
import { Header } from "@/components/header"
import PlausibleProvider from "next-plausible"
import Image from "next/image"

export const revalidate = 3600 // revalidate the data at most every hour

export default async function Home() {
  return (
    <PlausibleProvider domain={process.env.NEXT_PUBLIC_DOMAIN_NAME || ""}>
      <div className="bg-slate-100 min-h-screen flex flex-col">
        <Header />
        
        <div className="flex-1 container mx-auto px-2 sm:px-6 lg:px-8 py-8">
          <h1 className="text-xl font-bold">Explore Urban Data Studies</h1>
          <CardGrid />
        </div>
        
        {/* Logo Container - Bottom right corner */}
        <div className="flex justify-end gap-2 pr-4 pb-4">
          <a href="https://in3.dem.ist.utl.pt/" target="_blank" rel="noopener noreferrer">
            <Image
              src="/BARRA_LOGOS-03.png"
              alt="IN+ Logo"
              width={2048}
              height={295}
              className="object-contain h-[60px] w-auto" // Height locked, width scales
            />
          </a>
          <a href="https://www.beneutral.pt/" target="_blank" rel="noopener noreferrer">
            <Image
              src="/beNeutral-logo.webp"
              alt="beNeutral Logo"
              width={120}
              height={60}
              className="object-contain h-[60px] w-auto" // Consistent height with first logo
            />
          </a>
        </div>
      </div>
    </PlausibleProvider>
  );
}
