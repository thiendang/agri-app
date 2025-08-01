import memoize from 'fast-memoize';
import {castArray} from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import {useCallback} from 'react';
import {filter} from 'lodash';
import {v4 as uuid} from 'uuid';

const getDefaultSeatMemo = memoize((entityId) => {
   return {
      entityId,
      id: uuid(),
      name: 'Visionary',
      responsibilities: null,
      seatId: null,
      userIdList: null,
      seats: [
         {
            id: uuid(),
            name: 'Integrator',
            entityId,
            seats: [
               {id: uuid(), name: 'Marketing/Sales', entityId},
               {id: uuid(), name: 'Operations', entityId},
               {id: uuid(), name: 'Finance', entityId},
            ],
         },
      ],
   };
});

/**
 * Hook to get the function to calculate the roots of all the entities.
 * @return {function(*, *): *[]|{responsibilities: null, userIdList: null, name: string, entityId: *, seatId: null}}
 */
export default function useGetRoot() {
   return useCallback((entityId, seatsProp) => {
      let roots = [];
      const entityIdList = castArray(entityId);

      for (let i = 0; i < entityIdList.length; i++) {
         const entityId = entityIdList[i];
         const useSeats = filter(seatsProp, {entityId});

         if (useSeats?.length > 0) {
            const seats = cloneDeep(useSeats);
            const seatsGroupBy = groupBy(seats, 'seatId');

            for (const [id, childSeats] of Object.entries(seatsGroupBy)) {
               if (id !== 'null') {
                  const seatsGroupByElement = find(seats, {id});

                  if (seatsGroupByElement) {
                     seatsGroupByElement.seats = sortBy(childSeats, ['order', 'createdDateTime']);
                  } else {
                     console.log('Could not find element.', id);
                  }
               }
            }

            if (!seatsGroupBy[null]?.length || seatsGroupBy[null]?.length <= 0) {
               roots[i] = getDefaultSeatMemo(entityId);
            } else if (seatsGroupBy[null]?.length > 1) {
               console.log('Too many root nodes for team chart', seatsGroupBy[null]);
               roots[i] = seatsGroupBy[null]?.[0];
            } else {
               roots[i] = seatsGroupBy[null]?.[0];
            }
         }
      }
      return roots?.length > 0 ? roots : [getDefaultSeatMemo(entityId)];
   }, []);
}
