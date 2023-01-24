import axios from 'axios';
import { logger } from 'core/utils/logger';

const username = process.env.GEONAMES_API_USERNAME || 'demo';
export const geoNamesApi = axios.create({
  baseURL: `http://api.geonames.org`,
});

export const getCountryCode = async (lat: number, lng: number) => {
  return geoNamesApi
    .get(`/findNearbyPlaceNameJSON`, {
      params: {
        lat: lat,
        lng: lng,
        style: 'short',
        username,
      },
    })
    .then((r) => {
      return r.data.geonames?.[0]?.countryCode as string;
    })
    .catch((err) => {
      logger.error('Error getting country code', { message: err.message });
      return undefined;
    });
};
