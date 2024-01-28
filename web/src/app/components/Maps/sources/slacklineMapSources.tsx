import React, { useEffect } from 'react';
import { Layer, Source } from 'react-map-gl';

import { SlacklineType } from '@server/core/types';
import { geoJsonURL } from 'app/api/constants';

import { SelectedDisplayFeature } from '../SlacklineMap/useMapOptions';
import { countryPointLayer, countryPolygonOutlineLayer } from '../layers/countryLayers';
import {
  guideLabelLayer,
  guideLineStringLayer,
  guidePointLayer,
  guidePolygonLayer,
  guidePolygonOutlineLayer,
} from '../layers/guideLayers';
import { lineLabelLayer, lineLineStringLayer, linePointLayer } from '../layers/lineLayers';
import { spotPointLayer, spotPolygonLayer, spotPolygonOutlineLayer } from '../layers/spotLayers';

export const SlacklineMapSourceIds = {
  spots: 'spots',
  lines: 'lines',
  guides: 'guides',
  linePoints: 'linePoints',
  spotPoints: 'spotPoints',
  guidePoints: 'guidePoints',
  countryPoints: 'countryPoints',
  countriesOutlines: 'countriesOutlines',
} as const;

export const SlacklineMapSources = (props: {
  displayFeature: SelectedDisplayFeature;
  filter?: {
    id?: string;
    lineType?: SlacklineType;
    country?: string;
  };
}) => {
  const { displayFeature, filter } = props;

  const [idFilterExpr, setIdFilterExpr] = React.useState<any>();
  const [lineTypeFilterExpr, setLineTypeFilterExpr] = React.useState<any>();
  const [countryFilterExpr, setCountryFilterExpr] = React.useState<any>();

  const options = {
    lines: displayFeature === 'line' || displayFeature === 'all',
    spots: displayFeature === 'spot' || displayFeature === 'all',
    guides: displayFeature === 'guide' || displayFeature === 'all',
  };
  useEffect(() => {
    if (filter?.id) {
      setIdFilterExpr(['!=', ['get', 'id'], filter?.id]);
    } else {
      setIdFilterExpr(undefined);
    }
    if (filter?.lineType && options.lines) {
      setLineTypeFilterExpr(['==', ['get', 'lt'], filter.lineType.substring(0, 1)]);
    } else {
      setLineTypeFilterExpr(undefined);
    }
    if (filter?.country) {
      setCountryFilterExpr(['==', ['get', 'c'], filter.country]);
    } else {
      setCountryFilterExpr(undefined);
    }
  }, [filter]);

  return (
    <>
      <Source
        id={SlacklineMapSourceIds.spots}
        type="geojson"
        data={geoJsonURL.spots}
        generateId={true}
        promoteId="id"
        filter={idFilterExpr}
      >
        <Layer {...spotPolygonLayer({ visible: options.spots })} />
        <Layer {...spotPolygonOutlineLayer({ visible: options.spots })} />
      </Source>

      <Source
        id={SlacklineMapSourceIds.lines}
        type="geojson"
        data={geoJsonURL.lines}
        generateId
        promoteId="id"
        filter={idFilterExpr}
      >
        <Layer
          {...lineLineStringLayer({
            visible: options.lines,
            filter: lineTypeFilterExpr,
          })}
        />
        <Layer
          {...lineLabelLayer({
            visible: options.lines,
            filter: lineTypeFilterExpr,
          })}
        />
      </Source>

      <Source
        id={SlacklineMapSourceIds.guides}
        type="geojson"
        data={geoJsonURL.guides}
        generateId={true}
        promoteId="id"
        filter={idFilterExpr}
      >
        <Layer
          {...guidePointLayer({
            visible: options.guides,
          })}
        />
        <Layer
          {...guideLineStringLayer({
            visible: options.guides,
          })}
        />
        <Layer
          {...guidePolygonLayer({
            visible: options.guides,
          })}
        />
        <Layer
          {...guidePolygonOutlineLayer({
            visible: options.guides,
          })}
        />
        <Layer
          {...guideLabelLayer({
            visible: options.guides,
          })}
        />
      </Source>

      <Source
        id={SlacklineMapSourceIds.linePoints}
        type="geojson"
        data={geoJsonURL.linePoints}
        generateId
        promoteId="id"
      >
        <Layer
          {...linePointLayer({
            visible: options.lines,
            filter: ['all', countryFilterExpr || true, lineTypeFilterExpr || true],
          })}
        />
      </Source>

      <Source
        id={SlacklineMapSourceIds.spotPoints}
        type="geojson"
        data={geoJsonURL.spotPoints}
        generateId
        promoteId="id"
      >
        <Layer
          {...spotPointLayer({
            visible: options.spots,
            filter: countryFilterExpr,
          })}
        />
      </Source>

      <Source
        id={SlacklineMapSourceIds.guidePoints}
        type="geojson"
        data={geoJsonURL.guidePoints}
        generateId
        promoteId="id"
      >
        <Layer
          {...guidePointLayer({
            visible: options.guides,
            isGlobalView: true,
            filter: countryFilterExpr,
          })}
        />
      </Source>

      <Source
        id={SlacklineMapSourceIds.countryPoints}
        type="geojson"
        data={geoJsonURL.countryPoints}
        generateId
        promoteId="id"
      >
        <Layer {...countryPointLayer({ visible: true })} />
      </Source>

      {filter?.country && (
        <Source
          id={SlacklineMapSourceIds.countriesOutlines}
          type="geojson"
          data={geoJsonURL.countryPolygons(filter.country)}
          generateId
          promoteId="id"
        >
          <Layer {...countryPolygonOutlineLayer()} />
        </Source>
      )}
    </>
  );
};
