import moment from 'moment/moment';
// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import {MONTH_CONVERT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {TAXABLE_CASH_FLOW_QUERY} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {INCOME_TYPE_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import TaxableIncomeMainPdf from './TaxableIncomeMainPdf';

const MINIMUM_YEAR = '01-01-1901';

/**
 * Hook to return the pages for the Loan Analysis in a PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useTaxableIncomePdf(intl, orientation, clientId, entityId, reportDate) {
   const [taxableCashFlowDataLazy] = useLazyQueryFHG(
      TAXABLE_CASH_FLOW_QUERY,
      {fetchPolicy: 'no-cache'},
      'cashFlow.type'
   );
   const [clientQuery] = useLazyQueryFHG(CLIENT_BY_ID_QUERY, {fetchPolicy: 'network-only'}, 'client.type');

   const [incomeTypesFetch] = useLazyQueryFHG(INCOME_TYPE_ALL_WHERE_QUERY, undefined, 'incomeType.type');
   const [expenseTypesFetch] = useLazyQueryFHG(EXPENSE_TYPE_ALL_WHERE_QUERY, undefined, 'expenseType.type');

   return useCallback(
      async (entityNames = '') => {
         const clientData = await clientQuery({variables: {clientId}});
         let searchYear = sessionStorage.filterDate ? moment(sessionStorage.filterDate, MONTH_FORMAT) : undefined;
         let fiscalYear;
         const startMonth = clientData?.data?.client.startMonth || 'jan';

         if (startMonth) {
            const fiscalYearStart = moment(`${moment().get('year')}-${MONTH_CONVERT[startMonth]}`, 'YYYY-M');
            fiscalYear = moment().isBefore(fiscalYearStart, 'month')
               ? fiscalYearStart.subtract(1, 'year').year()
               : fiscalYearStart.year();
         } else {
            fiscalYear = undefined;
         }
         let year;

         if (!searchYear || !searchYear?.isValid() || searchYear?.isBefore(MINIMUM_YEAR, 'year')) {
            year = fiscalYear || moment().year();
         } else {
            year = searchYear.year();
         }

         const incomeNonTaxableTypes = await incomeTypesFetch({
            variables: {entityId, isTaxable: [false]},
            fetchPolicy: 'no-cache',
         });
         const expenseNonTaxableTypes = await expenseTypesFetch({
            variables: {entityId, isTaxable: [false]},
            fetchPolicy: 'no-cache',
         });

         const result = await taxableCashFlowDataLazy({
            fetchPolicy: 'no-cache',
            variables: {
               entityId,
               year,
            },
         });

         return (
            <TaxableIncomeMainPdf
               intl={intl}
               orientation={orientation}
               cashFlowData={result.data}
               entityNames={entityNames}
               reportDate={reportDate}
               incomeExclusions={incomeNonTaxableTypes?.data?.incomeTypes}
               expenseExclusions={expenseNonTaxableTypes?.data?.expenseTypes}
            />
         );
      },
      [
         taxableCashFlowDataLazy,
         clientId,
         clientQuery,
         entityId,
         expenseTypesFetch,
         incomeTypesFetch,
         intl,
         orientation,
         reportDate,
      ]
   );
}
