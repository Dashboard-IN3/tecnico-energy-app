import Image from "next/image"
import chevron from "../../../../public/icons/chevron-left.svg"
import Link from "next/link"
import { allDocs } from "contentlayer/generated"
import { notFound } from "next/navigation"

async function getDocFromParams(slug: string) {
  const doc = allDocs.find(doc => doc.slugAsParams === slug)

  if (!doc) notFound
  return doc
}

const StudyDetails: React.FC = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const doc = await getDocFromParams(params.slug)
  console.log(doc)
  return (
    <div className="min-h-screen h-full w-full bg-slate-100 p-12">
      <div className="text-2xl font-light flex ml-10 min-w-[300px]">
        <div className="mr-6 hover:bg-slate-100 h-[32px] min-w-[32px] p-1 rounded cursor-pointer">
          <Link href={`/explore/${params.slug}`}>
            <Image src={chevron} alt="chevron" width={22} height={22} />
          </Link>
        </div>
        <div>About This Study</div>
      </div>
      <div>{JSON.stringify(doc?.body.raw)}</div>
    </div>
  )
}

export default StudyDetails
