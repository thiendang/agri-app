import memoize from 'fast-memoize';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import {useCallback} from 'react';
import {ACTIVE_ROOT_ID, PASSIVE_ROOT_ID, ROOT_ID, SCALE_APP} from '../../../Constants';

const STATIC_NODE_HEIGHT = 120 * SCALE_APP;

const getDefaultClientEntityMemo = memoize((entityId) => {
   return {
      id: ROOT_ID,
      name: 'Agri Game Plan',
      isEditable: false,
      hasAdd: false,

      height: 220 * SCALE_APP,
      entities: [
         {
            id: ACTIVE_ROOT_ID,
            name: 'Active Income',
            height: STATIC_NODE_HEIGHT,
            isActive: true,
            isEditable: false,
            entities: [],
         },
         {
            id: PASSIVE_ROOT_ID,
            name: 'Passive Income',
            height: STATIC_NODE_HEIGHT,
            isActive: false,
            isEditable: false,
            entities: [],
         },
      ],
   };
});

/**
 * Hook to get the function to calculate the roots of all the entities.
 * @return {function(*, *): *[]|{responsibilities: null, userIdList: null, name: string, entityId: *, ClientEntityId: null}}
 */
export default function useGetRoot() {
   return useCallback((entityId, entitiesData) => {
      let roots = [];

      if (entitiesData?.length > 0) {
         const entities = cloneDeep(entitiesData);
         const entitiesGroupBy = groupBy(entities, 'entityId');

         for (const [id, childEntities] of Object.entries(entitiesGroupBy)) {
            if (id !== null && id !== 'null') {
               const entitiesGroupByElement = find(entities, {id});

               if (entitiesGroupByElement) {
                  entitiesGroupByElement.entities = childEntities;
               } else {
                  console.log('Could not find element.', id);
               }
            }
         }

         const topGroupBy = groupBy(entitiesGroupBy['null'], 'isActive');
         roots.push({
            id: ROOT_ID,
            name: 'Agri Game Plan',
            isEditable: false,
            hasAdd: false,
            height: STATIC_NODE_HEIGHT,
            entities: [
               {
                  id: ACTIVE_ROOT_ID,
                  name: 'Active Income',
                  isActive: true,
                  height: STATIC_NODE_HEIGHT,
                  isEditable: false,
                  entities: topGroupBy.true,
               },
               {
                  id: PASSIVE_ROOT_ID,
                  name: 'Passive Income',
                  isActive: false,
                  height: STATIC_NODE_HEIGHT,
                  isEditable: false,
                  entities: topGroupBy.false,
               },
            ],
         });
      }
      return roots?.length > 0 ? roots : [getDefaultClientEntityMemo(entityId)];
   }, []);
}
