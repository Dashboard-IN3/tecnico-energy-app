import { redirect } from "next/navigation"
import { promises as fs } from "fs"
import Explore from "../../../components/explore"
import { useStore } from "../../lib/store"
import StoreInitialize from "../../../components/store-initialize"
import { Header } from "../../../components/header"

export default async function ExplorePage({
  params,
}: {
  params: { uuid: string }
}) {
  // TODO make this driven by studies inventory
  const whiteList = [
    "portugal-municipal-energy",
    "fpo",
    "lisbon-building-energy",
  ]
  if (!whiteList.includes(params.uuid)) {
    return redirect("/404")
  }

  const response = await fs.readFile(
    process.cwd() + `/app/data/studies/${params.uuid}/meta-data.json`,
    "utf8"
  )
  const metaData = JSON.parse(response)
  const stateObject = {
    studies: {},
    selectedStudy: {
      title: metaData.title,
      id: metaData.id,
      themes: metaData.themes,
      description: "",
      selectedTheme: {
        [metaData.id]: metaData?.themes[0],
      },
    } as Studies.Study,
  }

  useStore.setState(stateObject)

  return (
    <>
      {metaData && <StoreInitialize {...stateObject} />}{" "}
      <div className="grid grid-cols-1 grid-rows-[auto,1fr,1fr] md:grid-cols-[350px,1fr] md:grid-rows-[auto,1fr] h-screen w-full overflow-x-hidden">
        <div className="row-span-1 col-span-2 relative border-b border-gray-200">
          <Header />
        </div>
        <Explore params={params} metaData={metaData} />
      </div>
    </>
  )
}
