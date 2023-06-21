import Map from "@/components/map";

// Prisma does not support Edge without the Data Proxy currently
export const runtime = "edge";
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <Map />
    </main>
  );
}
