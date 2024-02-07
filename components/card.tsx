import Image from "next/image"
import Link from "next/link"

interface Props {
  src: string
  title: string
  description: string
  href: string
}
const Card: React.FC<Props> = ({ src, title, description, href }) => {
  return (
    <Link
      href={href}
      className="md:max-w-sm rounded shadow-lg p-4 block transition duration-200 ease-in-out hover:shadow-xl border border-transparent hover:border-blue-300 bg-white"
    >
      <div className="relative h-[150px]">
        <Image
          className="top-0 left-0 bottom-0 w-full h-full object-cover rounded-t"
          src={src}
          fill={true}
          alt="Card Image"
          priority={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="py-4">
        <div className="font-bold text-l mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
    </Link>
  )
}

export default Card
