import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req, { params }) {
  const { coordinates } = params
  // TODO check that this doesn't need more sanitizing
  const lineStringCoords = Prisma.raw(decodeURI(coordinates))

  const sql = Prisma.sql`SELECT name, properties
         FROM buildings WHERE
          ST_Intersects(ST_Transform(geom, 3857),
          ST_Transform(ST_Polygon('LINESTRING(${lineStringCoords})'::geometry, 4326), 3857))`

  const buildings = await prisma.$queryRaw(sql)

  return Response.json({ buildings })
}
