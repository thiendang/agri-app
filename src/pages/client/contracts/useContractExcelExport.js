import {formatMessage} from '../../../fhg/utils/Utils';
import useCashContractExcelExport from './useCashContractExcelExport';
import useFutureContractExcelExport from './useFutureContractExcelExport';
import useHedgeContractExcelExport from './useHedgeContractExcelExport';

/**
 * The hook to export the contracts workbook to excel. Each type of contract is in a separate worksheet.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useContractExcelExport(intl, orientation) {
   const exportCashContractWorksheet = useCashContractExcelExport(
      intl,
      orientation,
      formatMessage(intl, 'contract.cashContracts.label', 'Cash Contracts')
   );
   const exportFutureContractWorksheet = useFutureContractExcelExport(
      intl,
      orientation,
      formatMessage(intl, 'contract.futures.label', 'Futures Contracts')
   );
   const exportHedgeContractWorksheet = useHedgeContractExcelExport(
      intl,
      orientation,
      formatMessage(intl, 'contract.hedges.label', 'Hedge Contracts')
   );

   return async (workbook, cashContracts, futureContracts, hedgeContracts, reportDate, entityName = '') => {
      if (cashContracts?.length > 0) {
         await exportCashContractWorksheet(workbook, cashContracts, reportDate, entityName);
      }
      if (futureContracts?.length > 0) {
         await exportFutureContractWorksheet(workbook, futureContracts, reportDate, entityName);
      }
      if (hedgeContracts?.length > 0) {
         await exportHedgeContractWorksheet(workbook, hedgeContracts, reportDate, entityName);
      }
   };
}
