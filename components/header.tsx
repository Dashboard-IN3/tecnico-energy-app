import Link from "next/link"
import Github from "./icons/github"

export const Header = () => {
  return (
    <nav
      className="bg-white shadow-md flex px-2 "
      style={{ justifyContent: "space-between", alignItems: "center" }}
    >
      <div className="sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href={"/"} className="flex items-center text-2xl font-bold">
            Urban Data Visualizer
          </Link>
        </div>
      </div>

      <Link
        href={"https://github.com/Dashboard-IN3/Dashboard_DS"}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="mr-6 hover:fill-sky-800">
          <Github className="mt-2" />
        </div>
      </Link>
    </nav>
  )
}
