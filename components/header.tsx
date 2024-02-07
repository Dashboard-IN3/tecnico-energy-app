import Link from "next/link"

export const Header = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="mx-2 px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href={"/"} className="flex items-center text-2xl font-bold">
            Urban Data Visualizer
          </Link>
        </div>
      </div>
    </nav>
  )
}
