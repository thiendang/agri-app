import {sum} from 'lodash';
import {useMemo} from 'react';
import {DEPRECIATION_TYPE_NAME} from '../../../Constants';
import {DEFAULT_MONTH_ORDER} from '../../../Constants';
import differenceWith from 'lodash/differenceWith';

export default function useTaxableIncomeTotals(list, exclusions) {
   return useMemo(() => {
      const totals = {};

      if (list?.length > 0) {
         let hasActual = {};
         for (const month of DEFAULT_MONTH_ORDER) {
            for (const item of list) {
               if (item.typeName !== DEPRECIATION_TYPE_NAME && item[month].actual > 0) {
                  hasActual[month] = true;
                  // No need to check other items for the current month because this month has an actual value.
                  break;
               }
            }
         }

         const filteredList = differenceWith(list, exclusions, (item, exclusion) => item.typeName === exclusion.name);

         for (const item of filteredList) {
            let total = 0;
            for (const month of DEFAULT_MONTH_ORDER) {
               total += item[month].actual || (hasActual[month] ? 0 : item[month].expected);
            }
            totals[item.typeName] = total;
         }
         totals.total = sum(Object.values(totals));
      }
      return totals;
   }, [list, exclusions]);
}
