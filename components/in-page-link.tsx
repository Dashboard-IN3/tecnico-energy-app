import Link from "next/link"

interface Props {
  href: string
  label: string
}

export const InPageLink: React.FC<Props> = ({ href, label }) => {
  return (
    <Link href={href}>
      <div className="text-blue-900 text-sm font-normal font-['Inter'] leading-tight">
        {label}
      </div>
    </Link>
  )
}
