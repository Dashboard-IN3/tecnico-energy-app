"use client";

import ReactMap, { Source, Layer } from "react-map-gl";
import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
  return (
    <ReactMap
      initialViewState={{
        latitude: 38.75,
        longitude: -9.11,
        zoom: 14,
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapLib={maplibregl}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <Source
        id="building-footprints"
        type="vector"
        tiles={[`${window.location.origin}/api/tiles/{z}/{x}/{y}`]}
        minzoom={6}
        maxzoom={14}
      >
        <Layer
          type="fill"
          source-layer="default"
          paint={{
            "fill-outline-color": "#ff69b4",
            "fill-color": "rgba(0,0,0,0.1)",
          }}
        />
      </Source>
    </ReactMap>
  );
}
