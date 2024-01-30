import Card from "./card"

export default async function CardGrid() {
  const promise = await fetch(`http://localhost:3000/api/studies`)
  const studies = (await promise.json()) as { studies: Studies.Study[] }

  return (
    <div className="container pr-4 md:pr-0 md:mx-auto py-8 md:max-w-max">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {studies &&
          studies.studies?.map((study, key) => (
            <Card
              key={key}
              description={study.description}
              title={study.title}
              href={study.href}
              src={study.image_src}
            />
          ))}
      </div>
    </div>
  )
}
