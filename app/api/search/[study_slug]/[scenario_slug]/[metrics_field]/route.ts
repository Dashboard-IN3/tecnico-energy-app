import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { study_slug, metrics_field, scenario_slug } = params
  const coordinates = req?.nextUrl?.searchParams.get("coordinates")!

  // get all features if we have no aoi
  if (coordinates == "null") {
    const search = await prisma.$queryRaw`
    WITH IntersectedGeometries AS (
    SELECT
        g.key AS id,
        CAST(m.data -> ${metrics_field} ->> 'value' AS NUMERIC) AS data_value,
        m.data -> ${metrics_field} ->> 'units' AS data_unit
    FROM 
        geometries g
    JOIN  
        scenario_metrics m ON g.key = m.geometry_key
    WHERE
        (m.scenario_slug = ${scenario_slug} OR (m.scenario_slug IS NULL AND ${scenario_slug} = 'baseline'))
        AND
        g.study_slug = ${study_slug}
      )
      SELECT 
          (SELECT SUM(data_value) FROM IntersectedGeometries) AS data_total,
          (SELECT AVG(data_value) FROM IntersectedGeometries) AS data_avg,
          (SELECT data_unit FROM IntersectedGeometries LIMIT 1) AS data_unit,
          json_agg(id) AS feature_ids
      FROM 
          IntersectedGeometries
  `
    return Response.json({ search })
  }

  const lineStringCoords = Prisma.raw(decodeURI(coordinates))

  const search = await prisma.$queryRaw`
    WITH IntersectedGeometries AS (
    SELECT
        g.key AS id,
        CAST(m.data -> ${metrics_field} ->> 'value' AS NUMERIC) AS data_value,
        m.data -> ${metrics_field} ->> 'units' AS data_unit
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
        (m.scenario_slug = ${scenario_slug} OR (m.scenario_slug IS NULL AND ${scenario_slug} = 'baseline'))
        AND
        g.study_slug = ${study_slug}
      )
      SELECT 
          (SELECT SUM(data_value) FROM IntersectedGeometries) AS data_total,
          (SELECT AVG(data_value) FROM IntersectedGeometries) AS data_avg,
          (SELECT data_unit FROM IntersectedGeometries LIMIT 1) AS data_unit,
          json_agg(id) AS feature_ids
      FROM 
          IntersectedGeometries
  `

  return Response.json({ search })
}

interface Params {
  study_slug: string
  scenario_slug: string
  coordinates: string
  metrics_field: string
}
