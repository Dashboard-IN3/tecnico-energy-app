import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { coordinates, study_slug, metrics_field, scenario_slug } = params
  const lineStringCoords = Prisma.raw(decodeURI(coordinates))

  const summary = await prisma.$queryRaw`
    SELECT 
      SUM(CAST(m.data -> ${metrics_field} ->> 'value' AS NUMERIC)) AS data_total,
      ROUND(AVG(CAST(m.data -> ${metrics_field} ->> 'value' AS NUMERIC))) AS data_avg
    FROM 
      geometries g
    JOIN  
      scenario_metrics m ON g.key = m.geometry_key
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
      m.scenario_slug = ${scenario_slug}
      AND
      g.study_slug = ${study_slug}
  `
  console.log({ summary })
  return Response.json({ buildings: summary })
}

interface Params {
  study_slug: string
  scenario_slug: string
  coordinates: string
  metrics_field: string
}
