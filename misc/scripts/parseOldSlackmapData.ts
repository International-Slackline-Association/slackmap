import config from '../config.json';
import fs from 'fs';
import { nanoid } from 'nanoid';

interface Options {
  file: string;
}

export interface Spot {
  out_Viewed?: string[];
  in_Viewed?: string[];
  name?: null | string;
  lat: number;
  lon: number;
  created_at: number;
  type: number;
  rid: string;
  subtype: number;
  privacy: number;
  in_ContentOf?: string[];
  length_laser: boolean;
  shape: Shape;
  height_laser: boolean;
  length: number;
  exposure: number;
  climbing: number;
  height: number;
  location_path?: LocationPath[];
  coordinates: Coordinates;
  _rid?: string;
  user?: string;
  location?: string;
  in_Created: string[];
  out_LocatedIn?: string[];
  out_TaggedIn?: string[];
  description?: string;
  '@fieldTypes': string;
  photo?: string;
  in_MediaOf?: string[];
  in_Walked?: string[];
  in_Updated?: string[];
  access?: number;
  in_Likes?: string[];
  in_CommentOf?: string[];
  in_Dislikes?: string[];
}

interface Coordinates {
  type: CoordinatesType;
  coordinates: number[];
}

enum CoordinatesType {
  Point = 'Point',
}

interface LocationPath {
  code?: string;
  name?: null | string;
  rid?: string;
}

interface Shape {
  coordinates: Array<Coordinate[]>;
  type: ShapeType;
}

type Coordinate = number[] | number;

enum ShapeType {
  LineString = 'LineString',
  Polygon = 'Polygon',
}

const parseOldSlackmapData = async (opts: Options) => {
  const data = JSON.parse(fs.readFileSync(opts.file, 'utf8')) as Spot[];
  const geoJson = {
    type: 'FeatureCollection',
    features: [],
  } as any;
  for (const spot of data) {
    const feature = createGeoJsonFeature(spot);
    geoJson.features.push(...feature);
  }
  fs.writeFileSync('slackmap.geojson', JSON.stringify(JSON.stringify(geoJson)));
};

const findArg = (args: string[], field: string) => {
  const index = args.findIndex((arg) => arg.startsWith(field));
  if (index !== -1) {
    return args[index + 1];
  }
  return undefined;
};

const createGeoJsonFeature = (spot: Spot) => {
  const feature = {
    type: 'Feature',
    geometry: {
      type: spot.shape.type,
      coordinates: spot.shape.coordinates,
    },
    properties: {
      // name: spot.name,
      // // description: spot.description,
      // height: spot.height,
      l: spot.length,
    },
  };
  const featurePoint = {
    type: 'Feature',
    geometry: {
      type: spot.coordinates.type,
      coordinates: spot.coordinates.coordinates,
    },
    properties: {
      // name: spot.name,
      // // description: spot.description,
      // height: spot.height,
      l: spot.length,
    },
  };
  return [feature];
};

const args = process.argv.slice(2);
const file = findArg(args, '--file');

if (!file) {
  throw new Error('Missing arguments');
}

parseOldSlackmapData({ file });
