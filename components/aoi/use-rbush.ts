import { useEffect, useState } from "react"
import * as turf from "@turf/turf"
import rbush from "rbush"
import booleanValid from "@turf/boolean-valid"

const useRtree = () => {
  const [rTree, setRtree] = useState(null)
  const [validFeatures, setValidFeatures] = useState([])

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        // Load geojson data
        const promise = await fetch(`http://localhost:8000/api/feature-data`, {
          cache: "no-cache",
        })
        const response = await promise.json()
        const geojson = response.data

        // Filter and validate features
        const filteredFeatures = geojson.features.filter(feature => {
          const isValidGeometry = booleanValid(feature)
          if (!isValidGeometry) {
            const bufferedFeature = turf.buffer(feature, 0)
            const isValidBufferedGeometry = booleanValid(bufferedFeature)
            if (
              isValidBufferedGeometry &&
              feature.geometry.type === "MultiPolygon" &&
              feature.geometry.coordinates.length === 1
            ) {
              return true
            }
            return false
          }
          return true
        })

        // Create an rbush tree with bounding boxes of valid features
        const newTree = new rbush()
        filteredFeatures.forEach((feature, idx) => {
          const bbox = turf.bbox(turf.polygon(feature.geometry.coordinates[0]))
          newTree.insert({
            minX: bbox[0],
            minY: bbox[1],
            maxX: bbox[2],
            maxY: bbox[3],
            featureIndex: idx,
          })
        })

        // Set the tree and valid features
        setRtree(newTree)
        setValidFeatures(filteredFeatures)
      } catch (error) {
        console.error("Error fetching and processing data:", error)
      }
    }

    if (!rTree && validFeatures.length === 0) {
      fetchAndProcessData()
    }
  }, [rTree, validFeatures])

  return { rTree, validFeatures }
}

export default useRtree
