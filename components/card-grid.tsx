import Card from "./card"

export default function CardGrid() {
  // TODO: Get studies data from /api/studies endpoint

  return (
    <div className="container pr-4 md:pr-0 md:mx-auto py-8 md:max-w-max">
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {studies &&
          Object.values(studies).map((study, key) => (
            <Card
              key={key}
              description={study.description}
              title={study.title}
              href={study.href}
              src={study.image_src}
            />
          ))}
      </div> */}
    </div>
  )
}
