// noinspection ES6CheckImport
import {map} from 'lodash';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import {useCallback} from 'react';
import {DATE_DB_FORMAT} from '../../Constants';
import {LIABILITIES_ENTITY_QUERY} from '../../data/QueriesGL';
import useLazyQueryFHG from '../../fhg/hooks/data/useLazyQueryFHG';
import useLiabilitiesExcelExport from './useLiabilitiesExcelExport';

/**
 * Hook to insert the worksheet for the liabilities in an Excel document. All of the data is queried.
 *
 * Reviewed:
 */
export default function useLiabilitiesExcel(orientation, entityIds, historyDate) {
   const exportToExcel = useLiabilitiesExcelExport('Liabilities', orientation);
   const [liabilityQuery] = useLazyQueryFHG(LIABILITIES_ENTITY_QUERY);

   return useCallback(
      async (workbook, entityName = '') => {
         const reportDate = moment(historyDate).format(DATE_DB_FORMAT);

         async function getLiabilities() {
            const liabilityData = await liabilityQuery({variables: {entityId: entityIds, historyDate: reportDate}});
            const useLiabilities = filter(liabilityData?.data?.liabilities || [], {isRemoved: false});

            const tableLiabilities = map(useLiabilities, (liability) => ({
               ...liability,
               collateralString: liability.isCollateral ? 'Yes' : 'No',
            }));
            return sortBy(tableLiabilities, ['liabilityCategory.name', 'createdDateTime']);
         }

         const liabilities = await getLiabilities();
         const total = liabilities?.length > 0 ? sumBy(liabilities, 'amount') : 0;

         if (liabilities?.length > 0) {
            await exportToExcel(workbook, liabilities, total, entityName);
         }
      },
      [entityIds, exportToExcel, historyDate, liabilityQuery]
   );
}
