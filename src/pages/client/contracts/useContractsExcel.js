// noinspection ES6CheckImport
import filter from 'lodash/filter';
import moment from 'moment';
import {useCallback} from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {HEDGE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {FUTURE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {CASH_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useContractExcelExport from './useContractExcelExport';

/**
 * Hook to insert the worksheet for the contracts in an Excel document. All of the data is queried.
 *
 * Reviewed:
 */
export default function useContractsExcel(intl, orientation, entityId, historyDate) {
   const exportToExcel = useContractExcelExport(intl, orientation);
   const [cashContractsQuery] = useLazyQueryFHG(
      CASH_CONTRACTS_ENTITY_QUERY,
      {fetchPolicy: 'network-only'},
      'contract.type'
   );
   const [futureContractsQuery] = useLazyQueryFHG(
      FUTURE_CONTRACTS_ENTITY_QUERY,
      {fetchPolicy: 'network-only'},
      'contract.type'
   );
   const [hedgeContractsQuery] = useLazyQueryFHG(
      HEDGE_CONTRACTS_ENTITY_QUERY,
      {fetchPolicy: 'network-only'},
      'contract.type'
   );

   return useCallback(
      async (workbook, entityNames = '') => {
         const reportDate = moment(historyDate).format(DATE_DB_FORMAT);
         const cashContractsData = await cashContractsQuery({variables: {entityId, historyDate: reportDate}});
         const cashContracts = filter(cashContractsData?.data?.cashContracts || [], {isRemoved: false});

         const futureContractsData = await futureContractsQuery({variables: {entityId, historyDate: reportDate}});
         const futureContracts = filter(futureContractsData?.data?.futureContracts || [], {isRemoved: false});

         const hedgeContractsData = await hedgeContractsQuery({variables: {entityId, historyDate: reportDate}});
         const hedgeContracts = filter(hedgeContractsData?.data?.hedgeContracts || [], {isRemoved: false});

         return exportToExcel(workbook, cashContracts, futureContracts, hedgeContracts, historyDate, entityNames);
      },
      [cashContractsQuery, entityId, exportToExcel, futureContractsQuery, hedgeContractsQuery, historyDate]
   );
}
