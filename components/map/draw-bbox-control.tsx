import { useCallback, useEffect, useRef } from "react"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import { MapRef } from "react-map-gl"

const addDrawControl = (
  map: MapRef,
  drawingCompleted: (feature: GeoJSON.Feature) => void,
  handleUpdate: (feature: GeoJSON.Feature) => void,
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

    drawingCompleted(feature)
  })

  map.on("draw.update", e => {
    const { features } = e
    const feature = features[0]
    handleUpdate(feature)
  })
  return draw
}

type DrawBboxControlProps = {
  handleDrawComplete: (feature: GeoJSON.Feature) => void
  drawUpdate: (feature: GeoJSON.Feature) => void
  drawSelectionChange: (isSelected: boolean) => void
  isEnabled: boolean
  aoi: { feature: GeoJSON.Feature; bbox: number[] }
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
    (feature: GeoJSON.Feature) => {
      handleDrawComplete(feature)
    },
    [handleDrawComplete]
  )

  // Callback when feature properties are updated
  const handleUpdate = useCallback(
    (feature: GeoJSON.Feature) => {
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
        handleUpdate,
        handleSelection
      )
    }
  }, [map, handleDraw, handleSelection, handleUpdate])

  const resetMapFeatures = useCallback(() => {
    drawControlRef.current.deleteAll()
    drawControlRef.current.changeMode("draw_polygon")
    map.getCanvas().style.cursor = "crosshair"
  }, [map])

  // set map drawing to on when drawing state is on
  useEffect(() => {
    if (!drawControlRef.current) return
    if (isEnabled) {
      resetMapFeatures()
    } else {
      map.getCanvas().style.cursor = "grab"
    }
  }, [isEnabled, map, resetMapFeatures])

  // control map feature selection with state
  useEffect(() => {
    if (!drawControlRef.current) return
    if (aoi.feature) {
      drawControlRef.current.set({
        type: "FeatureCollection",
        // TODO add proper GeoJSON type
        features: [aoi.feature as any],
      })
    } else {
      resetMapFeatures()
    }
  }, [aoi.feature, resetMapFeatures])

  return null
}

export default DrawBboxControl
