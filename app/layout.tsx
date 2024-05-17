import "./globals.css"
import { Inter } from "next/font/google"

export const metadata = {
  title: "Técnico",
  description:
    "An interactive application to help others understand the energy consumption of urban environments.",
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <main className="h-full w-full min-h-screen">{children}</main>
      </body>
    </html>
  )
}
