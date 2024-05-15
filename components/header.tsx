import Link from "next/link"
import Github from "./icons/github"
import Logo from "./icons/logo"

export const Header = () => {
  return (
    <nav
      className="bg-white shadow-md flex"
      style={{ justifyContent: "space-between", alignItems: "center" }}
    >
      <div className="px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <Link href={"/"} className="flex items-center text-2xl font-bold">
            <Logo />
            <span className="ml-2">Urban Data Visualizer</span>
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
