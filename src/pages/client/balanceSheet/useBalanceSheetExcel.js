import moment from 'moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {BALANCE_SHEET_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useBalanceSheetExcelExport from './useBalanceSheetExcelExport';

/**
 * Hook to insert the tab for the Balance Sheet in a Excel document. All the data is queried.
 *
 * Reviewed:
 */
export default function useBalanceSheetExcel(intl, orientation, entityId, date) {
   const exportToExcel = useBalanceSheetExcelExport('Balance Sheet', orientation);
   const [balanceSheetQuery] = useLazyQueryFHG(BALANCE_SHEET_QUERY);

   return useCallback(
      async (workbook, entityNames = '') => {
         let reportDate = moment(date).endOf('month').format(DATE_DB_FORMAT);
         if (reportDate === 'Invalid date') {
            reportDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
         }
         const balanceSheetData = await balanceSheetQuery({variables: {entityId, date: reportDate}});

         return exportToExcel(workbook, balanceSheetData?.data?.balanceSheet, reportDate, entityNames);
      },
      [balanceSheetQuery, date, entityId, exportToExcel]
   );
}
