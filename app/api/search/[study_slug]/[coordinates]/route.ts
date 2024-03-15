import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req, { params }) {
  const { coordinates, study_slug } = params
  // TODO check that this doesn't need more sanitizing
  const lineStringCoords = Prisma.raw(decodeURI(coordinates))

  const buildings = await prisma.$queryRaw`
    SELECT 
      key
    FROM 
      geometries 
    WHERE
      ST_Intersects(
        ST_Transform(geom, 3857),
        ST_Transform(
          ST_Polygon(
            'LINESTRING(${lineStringCoords})'::geometry, 
            4326
          ), 
          3857
        )
      )
      AND
      study_slug = ${study_slug}
  `

  return Response.json({ buildings })
}
