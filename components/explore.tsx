"use client"

import { useState } from "react"
import { redirect } from "next/navigation"
import { SidePane } from "./side-pane"
import Map from "./map/map"
import { Source, Layer } from "react-map-gl"
import { LngLatLike } from "mapbox-gl"
import { usePathname } from "next/navigation"

interface Props {
  params: { uuid: string }
  metaData: Studies.Study
}

const Explore: React.FC<Props> = ({ params, metaData }) => {
  const pathname = usePathname()
  console.log({ pathname })
  console.warn("test")
  const [isDrawing, setIsDrawing] = useState(false)
  // TODO make this driven by studies inventory
  const whiteList = [
    "portugal-municipal-energy",
    "fpo",
    "lisbon-building-energy",
  ]
  if (!whiteList.includes(params.uuid)) {
    return redirect("/404")
  }

  const layerType =
    params.uuid === "lisbon-building-energy" ? "fill-extrusion" : "line"

  const mapCenter: LngLatLike =
    params.uuid === "lisbon-building-energy"
      ? [-9.142, 38.735]
      : [-9.102, 38.755]

  const mapZoom = params.uuid === "lisbon-building-energy" ? 11 : 6

  return (
    <>
      <SidePane
        {...{
          src: metaData.image_src,
          setIsDrawing,
          isDrawing,
          study_id: params.uuid,
        }}
      />
      <div className="row-span-1 col-span-2 md:col-span-1">
        <Map
          {...{
            id: "explore-map",
            zoom: mapZoom,
            center: mapCenter,
            layerType,
            setIsDrawing,
            isDrawing,
          }}
        >
          <Source
            id="building-footprints"
            type="vector"
            tiles={[`${window.location.origin}/api/tiles/{z}/{x}/{y}`]}
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
