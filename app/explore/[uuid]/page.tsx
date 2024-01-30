import { redirect } from "next/navigation"
import { promises as fs } from "fs"
import Explore from "../../../components/explore"
import { useStore } from "../../lib/store"
import StoreInitialize from "../../../components/store-initialize"

export default async function ExplorePage({
  params,
}: {
  params: { uuid: string }
}) {
  console.log("test from explore page")
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
        [metaData.id]: metaData.themes[0],
      },
    } as Studies.Study,
  }

  useStore.setState(stateObject)

  return (
    <>
      {metaData && <StoreInitialize {...stateObject} />}
      <Explore params={params} metaData={metaData} />
    </>
  )
}
