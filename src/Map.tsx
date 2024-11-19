"use client";
import React from "react";
import MapElement, { Layer, Source } from "react-map-gl";

export type Point = {
  latitude: number;
  longitude: number;
};

type PathData = {
  type: string;
  properties: object;
  geometry: {
    type: string;
    coordinates: number[][];
  };
};

type MapProps = {
  middlePoint?: Point;
  pathData: PathData;
};

export const Map = (props: MapProps) => {
  const { middlePoint, pathData } = props;

  return (
    <div className="h-full w-full">
      <MapElement
        initialViewState={{
          longitude: middlePoint?.longitude ?? 0,
          latitude: middlePoint?.latitude ?? 0,
          zoom: 9.6,
        }}
        style={{ width: "100%", height: "100%" }}
        mapboxAccessToken="pk.eyJ1Ijoia2VlZ2FuY29kZXMiLCJhIjoiY2xxZnVldmNqMDRzejJpbjdwbTdvMTVoMSJ9.rbUIzEkZAYwSEg9G-5xVbQ"
        mapStyle="mapbox://styles/mapbox/streets-v10"
      >
        <Source id="polylineLayer" type="geojson" data={pathData}>
          <Layer
            id="lineLayer"
            type="line"
            source="my-data"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "rgba(3, 170, 238, 0.5)",
              "line-width": 2,
            }}
          />
        </Source>
        {/* <Marker
            longitude={markerPoint.longitude}
            latitude={markerPoint.latitude}
            anchor="bottom"
          >
            X
          </Marker> */}
      </MapElement>
    </div>
  );
};
