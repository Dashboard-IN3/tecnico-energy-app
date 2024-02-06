import Image from "next/image"
import chevron from "../../../../public/icons/chevron-left.svg"
import Link from "next/link"

const StudyAttributes: React.FC = ({
  params,
}: {
  params: { slug: string }
}) => {
  return (
    <div className="min-h-screen h-full w-full bg-slate-100 p-12">
      <div className="text-2xl font-light flex ml-10 min-w-[300px]">
        <div className="mr-6 hover:bg-slate-100 h-[32px] min-w-[32px] p-1 rounded cursor-pointer">
          <Link href={`/explore/${params.slug}`}>
            <Image src={chevron} alt="chevron" width={22} height={22} />
          </Link>
        </div>
        <div>Study Attributes</div>
      </div>
      <div className="h-full flex flex-col justify-center items-center">
        Table Goes Here
      </div>
    </div>
  )
}

export default StudyAttributes
