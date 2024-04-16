"use client"

import { SidePane } from "./side-pane"
import Map from "./map/map"
import { Source, Layer } from "react-map-gl"
import { LngLatLike } from "mapbox-gl"
import { globalVariables } from "../global-config"
import { useState } from "react"

interface Props {
  params: { slug: string }
  metaData: Studies.Study
}

const Explore: React.FC<Props> = ({ params, metaData }) => {
  const [tilesLoaded, setTilesLoaded] = useState()

  const layerType =
    params.slug === "lisbon-building-energy" ? "fill-extrusion" : "line"

  const mapCenter: LngLatLike =
    params.slug === "lisbon-building-energy"
      ? [-9.142, 38.735]
      : [-9.102, 38.755]

  const mapZoom = params.slug === "lisbon-building-energy" ? 11 : 6

  return (
    <>
      <SidePane
        {...{
          imgSrc: metaData.image_src,

          studyId: params.slug,
        }}
      />
      <div className="row-span-1 col-span-2 md:col-span-1">
        <Map
          {...{
            id: "explore-map",
            zoom: mapZoom,
            center: mapCenter,
            layerType,
            studySlug: params.slug,
          }}
        >
          <Source
            id="building-footprints"
            promoteId={"name"}
            type="vector"
            tiles={[
              `${global.window?.location.origin}/api/tiles/${params.slug}/{z}/{x}/{y}`,
            ]}
            minzoom={6}
            maxzoom={14}
          >
            <Layer
              id="buildings-layer"
              type="fill-extrusion"
              source={"buildings"}
              source-layer="default"
              paint={{
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-color": [
                  "case",
                  ["boolean", ["feature-state", "selected"], false],
                  "#228C22",
                  [
                    "interpolate-hcl",
                    ["linear"],
                    ["get", "height"],
                    0,
                    "#990000",
                    3,
                    "#990000",
                    15,
                    "#990000",
                  ],
                ],
                "fill-extrusion-opacity": 0.75,
              }}
            />
          </Source>
        </Map>
      </div>
    </>
  )
}

export default Explore
