declare namespace MapState {
  import { GeoJSONFeature } from "maplibre-gl"

  export type aoi = {
    feature: GeoJSONFeature
    bbox: number[]
  }
}
