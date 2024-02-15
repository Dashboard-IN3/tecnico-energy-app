import { notFound } from "next/navigation"
import { useStore } from "@/app/lib/store"
import { getStudies, getStudy } from "@/app/lib/data"
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

  const selectedStudy = {
    ...study,
    // store themes and scenarios as dictionaries for easier lookup
    themes: study?.themes.reduce((acc, theme) => {
      acc[theme.slug] = {
        ...theme,
        selectedScenario: null,
        scenarios: theme.scenarios.reduce((acc, scenario) => {
          acc[scenario.slug] = scenario
          return acc
        }, {}),
      }
      return acc
    }, {}),
    selectedTheme: {
      ...study.themes[0],
      scenarios: study.themes[0].scenarios.reduce((acc, scenario) => {
        acc[scenario.slug] = scenario
        return acc
      }, {}),
    },
    selectedThemeId: study.themes[0]?.slug,
    aoi: {},
  }
  const stateObject = {
    selectedStudy,
  }

  useStore.setState(stateObject)

  return (
    <>
      <StoreInitialize stateObject={stateObject} />
      <div className="grid grid-cols-1 grid-rows-[auto,1fr,1fr] md:grid-cols-[350px,1fr] md:grid-rows-[auto,1fr] h-screen w-full overflow-x-hidden">
        <div className="row-span-1 col-span-2 relative border-b border-gray-200">
          <Header />
        </div>
        <Explore params={params} metaData={selectedStudy} />
      </div>
    </>
  )
}
