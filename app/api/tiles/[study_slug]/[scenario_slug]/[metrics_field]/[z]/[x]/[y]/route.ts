import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { Sql } from "@prisma/client/runtime"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Params }) {
  let tile: Tile
  try {
    tile = new Tile(params)
  } catch (e) {
    return new Response((e as Error).message, { status: 400 })
  }
  const sql = tile.asSql("geometries", "geom", "scenario_metrics")
  const [{ st_asmvt }] = await prisma.$queryRaw<{ st_asmvt: Buffer }[]>(sql)

  return new Response(
    new Blob([st_asmvt], { type: "application/octet-stream" }),
    {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": st_asmvt.length.toString(),
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=600",
      },
    }
  )
}

class Tile {
  public study_slug: string
  // https://github.com/pramsey/minimal-mvt/blob/8b736e342ada89c5c2c9b1c77bfcbcfde7aa8d82/minimal-mvt.py#L50-L150
  public zoom: number
  public x: number
  public y: number
  public scenario_slug: string
  public metrics_field: string

  constructor({ z, x, y, study_slug, scenario_slug, metrics_field }: Params) {
    if (!study_slug) {
      throw new Error("study_slug is required")
    }
    this.study_slug = study_slug
    this.scenario_slug = scenario_slug
    this.metrics_field = metrics_field

    if ([z, x, y].map(val => parseInt(val)).some(isNaN)) {
      throw new Error("Coordinates must be numbers")
    }

    ;[this.zoom, this.x, this.y] = [z, x, y].map(val => parseInt(val))

    if ([this.x, this.y].some(val => val >= 2 ** this.zoom)) {
      throw new Error("Coordinates must be appropriate for zoom level")
    }

    if ([this.x, this.y].some(val => val < 0)) {
      throw new Error("Coordinates must be greater than 0")
    }
  }

  private asEnvelope(): Envelope {
    const worldMercMax = 20037508.3427892
    const worldMercMin = -1 * worldMercMax
    const worldMercSize = worldMercMax - worldMercMin

    // Width in tiles
    const worldTileSize = Math.pow(2, this.zoom)

    // Tile width in EPSG:3857
    const tileMercSize = worldMercSize / worldTileSize

    // Calculate geographic bounds from tile coordinates
    // XYZ tile coordinates are in "image space" so origin is
    // top-left, not bottom right
    return {
      xmin: worldMercMin + tileMercSize * this.x,
      xmax: worldMercMin + tileMercSize * (this.x + 1),
      ymin: worldMercMax - tileMercSize * (this.y + 1),
      ymax: worldMercMax - tileMercSize * this.y,
    }
  }

  private asEnvelopeSql(): Sql {
    const env = this.asEnvelope()
    const DENSIFY_FACTOR = 4
    const segSize = (env.xmax - env.xmin) / DENSIFY_FACTOR
    return Prisma.sql`
      ST_Segmentize(
        ST_MakeEnvelope(
          ${env.xmin},
          ${env.ymin},
          ${env.xmax},
          ${env.ymax},
          3857
        ),
        ${segSize}
      )
    `
  }

  public asSql(
    table: string,
    geomColumn: string,
    metrics_table: string,
    attrColumns: string[] = [],
    srid: number = 4326
  ): Sql {
    const envSql = this.asEnvelopeSql()

    // NOTE: Do not mark any user-provided data as raw!
    const rawVals: Record<string, Sql> = Object.fromEntries(
      Object.entries({
        table,
        geomColumn,
        metrics_table,
      }).map(([k, v]) => [k, Prisma.raw(v)])
    )
    return Prisma.sql`
      WITH bounds AS (
        SELECT
          ${envSql} AS geom,
          ${envSql}::box2d AS b2d
      ),
      global_max AS (
        SELECT
            MAX(CAST(m.data->${this.metrics_field}->>'value' AS NUMERIC)) AS max_shading
        FROM
            ${rawVals.table} t
        JOIN
          scenario_metrics m ON t.key = m.geometry_key
        WHERE
            (t.study_slug = ${this.study_slug} AND m.scenario_slug IS NULL AND ${this.scenario_slug} = 'baseline') OR 
            (t.study_slug = ${this.study_slug} AND m.scenario_slug = ${this.scenario_slug}) 
      ),
      mvtgeom AS (
        SELECT
          ST_AsMVTGeom(
            ST_Transform(t.${rawVals.geomColumn}, 3857),
            bounds.b2d
          ) AS geom,
          key,
          54 as height,
          CAST(ROUND(CAST(m.data->${this.metrics_field}->>'value' AS NUMERIC)) AS INTEGER) AS shading,
          CAST(ROUND(CAST(m.data->${this.metrics_field}->>'value' AS NUMERIC) / NULLIF(gm.max_shading, 0) * 100) AS INTEGER) AS shading_percentage
        FROM
          ${rawVals.table} t
        JOIN
          scenario_metrics m ON t.key = m.geometry_key
        CROSS JOIN
          bounds
        CROSS JOIN
          global_max gm
        WHERE
          ST_Intersects(
            t.${rawVals.geomColumn},
            ST_Transform(bounds.geom, ${srid}::integer)
          )
          AND
          (t.study_slug = ${this.study_slug} AND m.scenario_slug IS NULL AND ${this.scenario_slug} = 'baseline') OR 
          (t.study_slug = ${this.study_slug} AND m.scenario_slug = ${this.scenario_slug}) 
      )
      SELECT
        ST_AsMVT(mvtgeom.*)
      FROM
        mvtgeom
    `
  }
}

interface Params {
  x: string
  y: string
  z: string
  study_slug: string
  scenario_slug: string
  metrics_field: string
}

interface Envelope {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}
