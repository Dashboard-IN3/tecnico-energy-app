import { notFound } from "next/navigation"
import { promises as fs } from "fs"
import { useStore } from "@/app/lib/store"
import { getStudy } from "@/app/lib/data"
import Explore from "@/components/explore"
import StoreInitialize from "@/components/store-initialize"
import { Header } from "@/components/header"

export default async function ExplorePage({
  params,
}: {
  params: { slug: string }
}) {
  const study = await getStudy(params.slug)
  if (!study) notFound()

  // const response = await fs.readFile(
  //   process.cwd() + `/app/data/studies/${params.slug}/meta-data.json`,
  //   "utf8"
  // )
  // const metaData = JSON.parse(response)
  // const selectedStudy: Studies.Study = {
  //   ...study,
  //   selectedTheme: {
  //     [metaData.id]: metaData?.themes[0],
  //   },
  // }

  const selectedStudy = {
    ...study,
    selectedTheme: study.themes[0],
    selectedThemeId: study.themes[0]?.slug,
  }
  const stateObject = {
    studies: {},
    selectedStudy,
  }

  useStore.setState(stateObject)

  return (
    <>
      {<StoreInitialize {...stateObject} />}
      <div className="grid grid-cols-1 grid-rows-[auto,1fr,1fr] md:grid-cols-[350px,1fr] md:grid-rows-[auto,1fr] h-screen w-full overflow-x-hidden">
        <div className="row-span-1 col-span-2 relative border-b border-gray-200">
          <Header />
        </div>
        <Explore params={params} metaData={selectedStudy} />
      </div>
    </>
  )
}
