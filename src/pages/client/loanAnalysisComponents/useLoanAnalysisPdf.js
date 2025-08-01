import moment from 'moment/moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {LOAN_ANALYSIS_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import LoanAnalysisMainPdf from './LoanAnalysisMainPdf';
import {validate} from 'uuid';
import {useRecoilValue} from 'recoil';
import {bankStore} from '../loanAnalysis/LoanAnalysis';

/**
 * Hook to return the pages for the Loan Analysis in a PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useLoanAnalysisPdf(intl, orientation, entityId, date) {
   const [loanAnalysisQuery] = useLazyQueryFHG(LOAN_ANALYSIS_QUERY, {
      fetchPolicy: 'network-only',
   });

   const bank = useRecoilValue(bankStore);

   return useCallback(
      async (entityNames = '') => {
         let reportDate = moment(date).endOf('month').format(DATE_DB_FORMAT);
         if (reportDate === 'Invalid date') {
            reportDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
         }

         const loanAnalysisData = await loanAnalysisQuery({variables: {entityId, date: reportDate}});

         const data = {...loanAnalysisData?.data};

         if (validate(bank?.id)) {
            data.loanAnalysis = data?.loanAnalysis?.bankDetails?.find((item) => item.id === bank?.id);
         }

         return (
            <LoanAnalysisMainPdf
               intl={intl}
               orientation={orientation}
               data={data?.loanAnalysis}
               entityNames={entityNames}
               reportDate={reportDate}
               bank={bank}
            />
         );
      },
      [date, entityId, intl, loanAnalysisQuery, orientation, bank],
   );
}
