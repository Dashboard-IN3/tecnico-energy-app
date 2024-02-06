import { studies } from "@prisma/client"
import Card from "./card"

export default async function CardGrid({ studies }: Props) {
  return (
    <div className="container pr-4 md:pr-0 md:mx-auto py-8 md:max-w-max">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {studies?.map(study => (
          <Card
            key={study.id}
            description={study.description}
            title={study.title}
            href={`explore/${study.slug}`}
            src={study.image_src}
          />
        ))}
      </div>
    </div>
  )
}

interface Props {
  studies: studies[]
}
