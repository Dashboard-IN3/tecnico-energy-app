"use client"

import { SidePane } from "./side-pane"
import Map from "./map/map"
import { Source, Layer } from "react-map-gl"
import { LngLatLike } from "mapbox-gl"
import { useStore } from "../app/lib/store"
interface Props {
  params: { slug: string }
  metaData: Studies.Study
}

const Explore: React.FC<Props> = ({ params, metaData }) => {
  const layerType =
    params.slug === "lisbon-building-energy" ? "fill-extrusion" : "line"

  const mapCenter: LngLatLike =
    params.slug === "lisbon-building-energy"
      ? [-9.142, 38.735]
      : [-9.102, 38.755]

  const mapZoom = params.slug === "lisbon-building-energy" ? 11 : 6

  const { selectedStudy, show3d } = useStore()
  const { selectedTheme } = selectedStudy

  const selectedScenario = selectedTheme.selectedScenario
  const category = selectedScenario?.selectedCategory?.value
  const usage = selectedScenario?.selectedUsage?.value || "ALL"
  const source = selectedScenario?.selectedSource?.value || "ALL"

  const metricsField = `${category}.${usage}.${source}`

  return (
    <>
      <SidePane
        {...{
          imgSrc: metaData.imageSrc,

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
            promoteId={"key"}
            type="vector"
            tiles={[
              `${global.window?.location.origin}/api/tiles/${params.slug}/${selectedScenario?.slug}/${metricsField}/{z}/{x}/{y}`,
            ]}
            minzoom={2}
            maxzoom={14}
          >
            <Layer
              id="buildings-layer"
              beforeId="road_path"
              type="fill-extrusion"
              source={"buildings"}
              source-layer="default"
              paint={{
                "fill-extrusion-height": [
                  "case",
                  [
                    "boolean",
                    selectedStudy.scale === "Buildings" && show3d,
                    true,
                  ],
                  0,
                  ["get", "height"],
                ],
                "fill-extrusion-color": [
                  "case",
                  ["boolean", ["feature-state", "selected"], false],
                  [
                    "interpolate-hcl",
                    ["linear"],
                    ["get", "shading_percentage"],
                    0,
                    "#ffffff",
                    25,
                    "#3c649f",
                    100,
                    "#1b2d48",
                  ],
                  "#dadada",
                ],
                "fill-extrusion-opacity": 0.9,
              }}
            />
          </Source>
        </Map>
      </div>
    </>
  )
}

export default Explore
