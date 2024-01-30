import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects"

export const getAoiFeatures = (features, coordinates) => {
  const turfPolygon = turf.polygon(coordinates)
  // Filter potential intersections using exact geometry intersection check
  const intersectingFeatureIds = features
    .filter(feature => {
      return booleanIntersects(turfPolygon, turf.feature(feature.geometry))
    })
    .map(feature => feature.id)

  return intersectingFeatureIds
}
