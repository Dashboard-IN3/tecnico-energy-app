import { Header } from "../../components/header"

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 grid-rows-[auto,1fr,1fr] md:grid-cols-[350px,1fr] md:grid-rows-[auto,1fr] h-full w-full overflow-x-hidden">
      <div className="row-span-1 col-span-2 relative border-b border-gray-200">
        <Header />
      </div>
      {children}
    </div>
  )
}
