import { countryChangelogCollection } from './collections/countryChangelogCollection';
import { guideDetailsDB } from './entities/guide/details';
import { isaUsersDb } from './entities/isa-users';
import { lineDetailsDB } from './entities/line/details';
import { mapFeatureChangelogDB } from './entities/mapFeature/changelog';
import { mapFeatureDB } from './entities/mapFeature/editor';
import { spotDetailsDB } from './entities/spot/details';

export const db = {
  isaUsersDb,
  ...countryChangelogCollection,
  ...guideDetailsDB,
  ...lineDetailsDB,
  ...mapFeatureChangelogDB,
  ...mapFeatureDB,
  ...spotDetailsDB,
};
