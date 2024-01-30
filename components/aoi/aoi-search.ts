import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects"

export const useAoiSearch = (features, coordinates) => {
  const turfPolygon = turf.polygon(coordinates)
  // Filter potential intersections using exact geometry intersection check
  const foundIntersections = features
    .filter(feature => {
      return booleanIntersects(turfPolygon, turf.feature(feature.geometry))
    })
    .map(feature => feature.id.split(","))
    .flat()

  return foundIntersections
}
