import { XMLParser } from "fast-xml-parser";
import React from "react";
import MapElement, { Layer, Marker, Source } from "react-map-gl";
import { Map, Point } from "./Map";

const defaultPowerZones = {
  1: 103,
  2: 141,
  3: 169,
  4: 197,
  5: 225,
  6: 282,
};

const defaultHrZones = {
  1: 112,
  2: 148,
  3: 167,
  4: 185,
};

const parser = new XMLParser({
  ignoreAttributes: false,
});

type WorkoutProps = {
  type?: "cycling";
  title?: string;
  distanceFeet?: number;
  timeSeconds?: number;
  elevationFeet?: number;
  powerZones?: { [key: number]: number };
  hrZones?: { [key: number]: number };
};

export const Workout = async (props: WorkoutProps) => {
  const {
    title,
    distanceFeet = 0,
    powerZones = defaultPowerZones,
    hrZones = defaultHrZones,
  } = props;

  const distanceMiles = Math.round((distanceFeet / 5280) * 100) / 100;

  const file = await fetch("https://fitness.static.donley.xyz/realale2024.gpx");

  const xml = await file.text();

  const parsed = parser.parse(xml);

  const displayTitle = title ?? parsed.gpx?.trk?.name;

  const points: Point[] = parsed.gpx.trk.trkseg.trkpt.map((pt: any) => {
    return {
      latitude: parseFloat(pt["@_lat"]),
      longitude: parseFloat(pt["@_lon"]),
    };
  });

  const middlePoint = points[Math.floor(points.length / 2)];

  const pathData = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: points.map((p) => [p.longitude, p.latitude]),
    },
  };

  const elevationData: Array<{ time: string; elevation: number }> =
    parsed.gpx.trk.trkseg.trkpt.map((pt: any) => {
      return {
        time: pt.time,
        elevation: pt.ele,
      };
    });

  const powerData: Array<{ time: string; power: number }> =
    parsed.gpx.trk.trkseg.trkpt.map((pt: any) => {
      return {
        time: pt.time,
        power: pt.extensions.power,
      };
    });

  const hrData: Array<{ time: string; hr: number }> =
    parsed.gpx.trk.trkseg.trkpt.map((pt: any) => {
      return {
        time: pt.time,
        hr: pt.extensions["gpxtpx:TrackPointExtension"]["gpxtpx:hr"],
      };
    });

  const timeInZones = hrData.reduce(
    (acc, curr) => {
      if (curr.hr <= hrZones[1]) {
        acc[1]++;
      } else if (curr.hr <= hrZones[2]) {
        acc[2]++;
      } else if (curr.hr <= hrZones[3]) {
        acc[3]++;
      } else if (curr.hr <= hrZones[4]) {
        acc[4]++;
      } else {
        acc[5]++;
      }

      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  const totalTime =
    timeInZones[1] +
    timeInZones[2] +
    timeInZones[3] +
    timeInZones[4] +
    timeInZones[5];

  console.log(totalTime);

  const minElevationValue = Math.min(...elevationData.map((d) => d.elevation));
  const maxElevationValue = Math.max(...elevationData.map((d) => d.elevation));

  const minPowerValue = Math.min(...powerData.map((d) => d.power ?? 0));
  const maxPowerValue = Math.max(...powerData.map((d) => d.power ?? 0));

  const sparklineHeight = 140;
  const sparklineHeightPower = 80;

  const maxPoints = 80;
  const maxPointsPower = 120;

  const sparklineData = elevationData.filter(
    (x, i) => i % Math.floor(elevationData.length / maxPoints) === 0
  );

  const powerSparklineData = powerData.filter(
    (x, i) => i % Math.floor(powerData.length / maxPointsPower) === 0
  );

  console.log(timeInZones);

  console.log(Math.round((timeInZones[3] / totalTime) * 100 * 100) / 100);

  return (
    <div className="h-[450px] w-full flex flex-col rounded-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="p-4 pl-5 flex">
          <div className="backdrop-blur-sm bg-black p-4 rounded-lg shadow-lg bg-opacity-20">
            <p className="text-4xl">{displayTitle}</p>
            <div className="pt-2">
              <span className="text-2xl font-semibold">{distanceMiles}</span>
              <span className="text-sm pl-1">mi</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grow relative">
        <div className="absolute top-0 left-0 right-0 bottom-0 z-40 bg-gradient-to-b from-blue-200 to-transparent pointer-events-none"></div>
        <Map middlePoint={middlePoint} pathData={pathData} />
      </div>
      <div
        className="absolute bottom-2 left-2 right-0 h-[var(--graph-height)] flex"
        style={
          {
            "--graph-height": `${sparklineHeight}px`,
          } as any
        }
      >
        {sparklineData.map((d) => {
          const heightPercent =
            (d.elevation - minElevationValue) /
            (maxElevationValue - minElevationValue);
          return (
            <div
              key={d.time}
              className="h-[var(--height)] bg-gradient-to-b from-blue-300 flex-grow mt-auto backdrop-blur-md bg-opacity-70"
              style={
                {
                  "--height": `${heightPercent * sparklineHeight}px`,
                } as any
              }
            ></div>
          );
        })}
      </div>
      <div
        className="absolute bottom-0 left-2 right-0 h-[var(--graph-height)] flex"
        style={
          {
            "--graph-height": `${sparklineHeightPower}px`,
          } as any
        }
      >
        {powerSparklineData.map((d) => {
          const heightPercent =
            (d.power - minPowerValue) / (maxPowerValue - minPowerValue);
          let colorClass = "from-gray-300";
          if (d.power < powerZones[1]) {
            colorClass = "from-gray-300";
          } else if (d.power < powerZones[2]) {
            colorClass = "from-blue-300";
          } else if (d.power < powerZones[3]) {
            colorClass = "from-green-300";
          } else if (d.power < powerZones[4]) {
            colorClass = "from-yellow-300";
          } else if (d.power < powerZones[5]) {
            colorClass = "from-orange-300";
          } else if (d.power < powerZones[6]) {
            colorClass = "from-red-400";
          } else {
            colorClass = "from-purple-400";
          }
          return (
            <div
              key={d.time}
              className={`h-[var(--height)] bg-gradient-to-b  flex-grow mt-auto backdrop-blur-md bg-opacity-70 ${colorClass}`}
              style={
                {
                  "--height": `${heightPercent * sparklineHeightPower}px`,
                } as any
              }
            ></div>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 w-2 top-0 z-50 flex flex-col-reverse shadow-xl">
        <div
          className="h-[var(--hr-zone-ratio)] bg-gray-100"
          style={
            {
              "--hr-zone-ratio": `${
                Math.round((timeInZones[1] / totalTime) * 100 * 100) / 100
              }%`,
            } as any
          }
        ></div>
        <div
          className="h-[var(--hr-zone-ratio)] bg-red-200"
          style={
            {
              "--hr-zone-ratio": `${
                Math.round((timeInZones[2] / totalTime) * 100 * 100) / 100
              }%`,
            } as any
          }
        ></div>
        <div
          className="h-[var(--hr-zone-ratio)] bg-red-300"
          style={
            {
              "--hr-zone-ratio": `${
                Math.round((timeInZones[3] / totalTime) * 100 * 100) / 100
              }%`,
            } as any
          }
        ></div>
        <div
          className="h-[var(--hr-zone-ratio)] bg-red-400"
          style={
            {
              "--hr-zone-ratio": `${
                Math.round((timeInZones[4] / totalTime) * 100 * 100) / 100
              }%`,
            } as any
          }
        ></div>
        <div
          className="h-[var(--hr-zone-ratio)] bg-red-600"
          style={
            {
              "--hr-zone-ratio": `${
                Math.round((timeInZones[5] / totalTime) * 100 * 100) / 100
              }%`,
            } as any
          }
        ></div>
      </div>
    </div>
  );
};
