import moment from 'moment/moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {LOAN_ANALYSIS_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useLoanAnalysisExcelExport from './useLoanAnalysisExcelExport';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {validate} from 'uuid';

/**
 * Hook to insert the worksheet for the Loan Analysis in an Excel document. All the data is queried.
 *
 * Reviewed:
 */
export default function useLoanAnalysisExcel(orientation, entityId, date) {
   const exportToExcel = useLoanAnalysisExcelExport('Borrowing Power', orientation);
   const [loanAnalysisQuery] = useLazyQueryFHG(LOAN_ANALYSIS_QUERY, {
      fetchPolicy: 'network-only',
   });

   const [{bankId}] = useCustomSearchParams();

   return useCallback(
      async (workbook, entityNames = '') => {
         let reportDate = moment(date).endOf('month').format(DATE_DB_FORMAT);
         if (reportDate === 'Invalid date') {
            reportDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
         }

         const loanAnalysisData = await loanAnalysisQuery({variables: {entityId, date: reportDate}});

         const data = {...loanAnalysisData?.data};

         if (validate(bankId)) {
            data.loanAnalysis = data?.loanAnalysis?.bankDetails?.find((item) => item.id === bankId);
         }

         return exportToExcel(workbook, data?.loanAnalysis, reportDate, entityNames);
      },
      [bankId, date, entityId, exportToExcel, loanAnalysisQuery],
   );
}
