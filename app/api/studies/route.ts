import prisma from "@/lib/prisma"

export async function GET() {
  const studies = await prisma.studies.findMany()

  return Response.json({ studies })
}
