import { useEffect } from "react"

export const useHoverFeature = ({ map, mapInteraction, setHoveredFeature }) => {
  useEffect(() => {
    if (!map || mapInteraction !== "selection") return

    let hoveredPolygonId: string | null = null
    const hoverLayerName = "buildings-layer"

    const handleMouseMove = (e: any) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = "pointer"
        const newHoveredPolygonId = e.features[0].id ?? null
        if (newHoveredPolygonId !== hoveredPolygonId) {
          if (hoveredPolygonId !== null) {
            map.setFeatureState(
              {
                source: "building-footprints",
                sourceLayer: "default",
                id: hoveredPolygonId,
              },
              { hover: false }
            )
          }

          hoveredPolygonId = newHoveredPolygonId ?? null

          setHoveredFeature({
            id: hoveredPolygonId,
            location: e.lngLat,
            value: e.features[0].properties.shading,
            unit: e.features[0].properties.unit,
          })

          map.setFeatureState(
            {
              source: "building-footprints",
              sourceLayer: "default",
              id: hoveredPolygonId as any,
            },
            { hover: true }
          )
        }
      }
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ""
      if (hoveredPolygonId !== null) {
        map.setFeatureState(
          {
            source: "building-footprints",
            sourceLayer: "default",
            id: hoveredPolygonId,
          },
          { hover: false }
        )
        hoveredPolygonId = null
        setHoveredFeature({
          id: null,
          location: null,
          value: null,
          unit: null,
        })
      }
    }

    map.on("mousemove", hoverLayerName, handleMouseMove)
    map.on("mouseleave", hoverLayerName, handleMouseLeave)

    return () => {
      map.off("mousemove", hoverLayerName, handleMouseMove)
      map.off("mouseleave", hoverLayerName, handleMouseLeave)
    }
  }, [map, setHoveredFeature, mapInteraction])
}
