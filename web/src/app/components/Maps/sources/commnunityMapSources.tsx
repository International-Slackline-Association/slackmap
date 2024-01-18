import React, { useEffect } from 'react';
import { Layer, Source } from 'react-map-gl';

import { geoJsonURL } from 'app/api/constants';

import { countryPointLayer, countryPolygonOutlineLayer } from '../layers/countryLayers';
import { slacklineGroupsPointLayer } from '../layers/slacklineGroupsLayer';

export const CommunityMapSourceIds = {
  slacklineGroups: 'slacklineGroups',
  communityCountries: 'communityCountries',
  countriesOutlines: 'countriesOutlines',
} as const;

export const CommunityMapSources = (props: {
  filter?: {
    country?: string;
  };
}) => {
  const { filter } = props;
  const [countryFilterExpr, setCountryFilterExpr] = React.useState<any>();

  useEffect(() => {
    if (filter?.country) {
      setCountryFilterExpr(['==', ['get', 'c'], filter.country]);
    } else {
      setCountryFilterExpr(undefined);
    }
  }, [filter]);

  return (
    <>
      <Source
        id={CommunityMapSourceIds.slacklineGroups}
        type="geojson"
        data={geoJsonURL.groups}
        generateId={true}
        promoteId="id"
      >
        <Layer
          {...slacklineGroupsPointLayer({
            visible: true,
            filter: countryFilterExpr,
          })}
        />
      </Source>
      <Source
        id={CommunityMapSourceIds.communityCountries}
        type="geojson"
        data={geoJsonURL.communityCountries}
        generateId
        promoteId="id"
      >
        <Layer {...countryPointLayer({ visible: true })} />
      </Source>

      {filter?.country && (
        <Source
          id={CommunityMapSourceIds.countriesOutlines}
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
