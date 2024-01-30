import { useCallback, useEffect, useRef } from "react"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import { GeoJSONFeature, GeoJSONPolygon } from "./types"
import { MapRef } from "react-map-gl"

const addDrawControl = (
  map: MapRef,
  drawingCompleted: (feature: GeoJSONFeature) => void,
  handleUpdate: (feature: GeoJSONFeature) => void,
  handleSelection: (isSelected: boolean) => void
) => {
  const { modes } = MapboxDraw

  const options = {
    modes: {
      ...modes,
    },
    boxSelect: false,
    displayControlsDefault: false,
  }
  const draw = new MapboxDraw(options) as any

  map.addControl(draw)
  map.on("draw.create", e => {
    const { features } = e
    const feature = features[0]
    map.getCanvas().style.cursor = ""
    setTimeout(() => draw.changeMode("simple_select"), 0)
    console.log("setting feature to state")
    drawingCompleted(feature)
  })
  return draw
}

type DrawBboxControlProps = {
  handleDrawComplete: (feature: GeoJSONFeature) => void
  drawUpdate: (feature: GeoJSONFeature) => void
  drawSelectionChange: (isSelected: boolean) => void
  isEnabled: boolean
  aoi: { feature: GeoJSONFeature; bbox: number[] }
  map: MapRef
}

function DrawBboxControl({
  map,
  handleDrawComplete,
  drawSelectionChange,
  isEnabled,
  drawUpdate,
  aoi,
}: DrawBboxControlProps) {
  const drawControlRef = useRef<MapboxDraw>()

  // Callback when drawing is finished
  const handleDraw = useCallback(
    (feature: GeoJSONFeature) => {
      console.log("On level up draw complete")
      handleDrawComplete(feature)
    },
    [handleDrawComplete]
  )

  // Callback when feature properties are updated
  const handleUpdate = useCallback(
    (feature: GeoJSONFeature) => {
      drawUpdate(feature)
    },
    [drawUpdate]
  )

  // Callback when feature select status changes
  const handleSelection = useCallback(
    (isSelected: boolean) => {
      drawSelectionChange(isSelected)
    },
    [drawSelectionChange]
  )

  useEffect(() => {
    if (map && !drawControlRef.current) {
      drawControlRef.current = addDrawControl(
        map,
        handleDraw,
        drawUpdate,
        handleSelection
      )
    }
  }, [map, handleDraw])

  // set map drawing to on when drawing state is on
  useEffect(() => {
    if (isEnabled && drawControlRef.current) {
      drawControlRef.current.deleteAll()
      drawControlRef.current.changeMode("draw_polygon")
      map.getCanvas().style.cursor = "crosshair"
    }
  }, [isEnabled, map])

  // control map feature selection with state
  useEffect(() => {
    if (aoi.feature && drawControlRef.current) {
      drawControlRef.current.set({
        type: "FeatureCollection",
        // TODO fix type issue
        features: [aoi.feature as any],
      })
    } else {
      if (drawControlRef.current) {
        drawControlRef.current.deleteAll()
      }
    }
  }, [aoi.feature])

  return null
}

export default DrawBboxControl
