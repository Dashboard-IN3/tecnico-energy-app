import Card from "./card"
import { getStudies } from "@/app/lib/data"

export default async function CardGrid() {
  const studies = await getStudies()

  return (
    <div className="container pr-4 md:pr-0 py-8 md:max-w-max min-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols:6 gap-6">
        {studies?.map(study => (
          <Card
            key={study.slug}
            description={study.description}
            title={study.name}
            href={`explore/${study.slug}`}
            imgSrc={study.image_src || undefined}
          />
        ))}
      </div>
    </div>
  )
}
