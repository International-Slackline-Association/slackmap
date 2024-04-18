import { DDBEntityConverter } from './entityConverter';
import { DDBTableKeyAttrs } from './types';

export type CollectionKeysComposer = {
  [key in keyof DDBTableKeyAttrs]?: (params: any) => string | undefined;
};
export class DDBCollectionQueryParser<
  QueryResultType extends Record<string, any>,
  FlattenedType = undefined,
> {
  constructor(
    private queryUtils: {
      [P in keyof QueryResultType]: {
        converter: DDBEntityConverter<any, QueryResultType[P][number], any, any>;
        flatten?: (entity: QueryResultType[P][number]) => FlattenedType;
      };
    },
  ) {}

  public parseQueryItems = (items: DDBTableKeyAttrs[]) => {
    const queryUtils = this.queryUtils;

    const entities: Prettify<
      QueryResultType & {
        flattened: FlattenedType extends undefined ? undefined : FlattenedType[];
      }
    > = {
      flattened: [],
    } as any;

    for (const key of Object.keys(queryUtils)) {
      entities[key as keyof QueryResultType] = [] as any;
    }

    for (const item of items) {
      for (const entityField in queryUtils) {
        const entityUtil = queryUtils[entityField as keyof typeof queryUtils];
        if (entityUtil.converter.isItemMatching(item)) {
          const entity = entityUtil.converter.itemToEntity(item);
          entities[entityField as keyof typeof entities].push(entity);
          const flattenedEntity = entityUtil.flatten?.(entity);
          if (flattenedEntity) {
            entities.flattened.push(flattenedEntity);
          }
        }
      }
    }
    return entities;
  };
}
