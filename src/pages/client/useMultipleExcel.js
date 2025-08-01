import moment from 'moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import {FIELD_METRICS_INDEX, MONTH_FORMAT, YEAR_FORMAT} from '../../Constants';
// import {TAXABLE_INCOME_INDEX} from '../../Constants';
import {DATE_DB_FORMAT} from '../../Constants';
import {
   ASSET_INDEX,
   CASH_FLOW_INDEX,
   BALANCE_SHEET_INDEX,
   LOAN_ANALYSIS_INDEX,
   CONTRACTS_INDEX,
   LIABILITY_INDEX,
} from '../../Constants';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import useAssetExcel from './assets/useAssetExcel';
import useBalanceSheetExcel from './balanceSheet/useBalanceSheetExcel';
import useCashFlowExcel from './cashFlow/useCashFlowExcel';
import useContractsExcel from './contracts/useContractsExcel';
import useLoanAnalysisExcel from './loanAnalysisComponents/useLoanAnalysisExcel';
// import useTaxableIncomeExcel from './tableIncome/useTaxableIncomeExcel';
import useLiabilitiesExcel from './useLiabilitiesExcel';
import useFieldMetricsExcel from './profitLoss/useFieldMetricsExcel';

/**
 * Hook to return all the PDF document types.
 *
 * Reviewed:
 *
 * @param intl The localization object.
 * @param orientation The orientation of all the PDF pages.
 * @param clientId The client ID of the client for all the PDF documents
 * @param entityIds The entity ID(s) of the entities for the PDF documents.
 * @param historyDate The date used for Assets, Liabilities and the other reports.
 * @return {function(*, *, *, *): Promise<*>}
 */
export default function useMultipleExcel(intl, orientation, clientId, entityIds, historyDate) {
   const [{reportDate, isCashOnly, showByField, isPerAcre}] = useCustomSearchParams();
   let date = moment(historyDate);

   if (!date.isValid()) {
      date = moment(historyDate, MONTH_FORMAT);
   }

   if (date.isAfter(moment(), 'month')) {
      date = moment();
   }

   let historyDateString = moment(date).format(DATE_DB_FORMAT);
   let historyYearString = moment(date).format(YEAR_FORMAT);

   const getAssetDocument = useAssetExcel(orientation, entityIds, historyDateString);
   const getLiabilityDocument = useLiabilitiesExcel(orientation, entityIds, historyDateString);
   const getContractDocument = useContractsExcel(intl, orientation, entityIds, historyDateString);
   const getLoanAnaysisDocument = useLoanAnalysisExcel(orientation, entityIds, historyDateString);
   const getBalanceSheetDocument = useBalanceSheetExcel(intl, orientation, entityIds, historyDateString);
   const getCashFlowDocument = useCashFlowExcel(orientation, clientId, entityIds, reportDate, isCashOnly);
   const getFieldMetricsDocument = useFieldMetricsExcel(
      orientation,
      entityIds,
      clientId,
      reportDate,
      !!showByField,
      isPerAcre,
   );
   // const getTaxableDocument = useTaxableIncomeExcel(orientation, clientId, entityIds, historyDateString);

   return useCallback(
      async (workbook, types, title, entityNames) => {
         const handleExport = async () => {
            if (types[ASSET_INDEX]) {
               await getAssetDocument(workbook, entityNames);
            }
            if (types[LIABILITY_INDEX]) {
               await getLiabilityDocument(workbook, entityNames);
            }
            if (types[CONTRACTS_INDEX]) {
               await getContractDocument(workbook, entityNames);
            }
            if (types[LOAN_ANALYSIS_INDEX]) {
               await getLoanAnaysisDocument(workbook, entityNames);
            }
            if (types[BALANCE_SHEET_INDEX]) {
               await getBalanceSheetDocument(workbook, entityNames);
            }
            if (types[CASH_FLOW_INDEX]) {
               await getCashFlowDocument(workbook, entityNames);
            }
            if (types[FIELD_METRICS_INDEX]) {
               await getFieldMetricsDocument(workbook, entityNames);
            }
            // TODO add taxable income back later.
            // if (types[TAXABLE_INCOME_INDEX]) {
            //    await getTaxableDocument(workbook, entityNames);
            // }
         };
         await handleExport();
      },
      [
         getAssetDocument,
         getBalanceSheetDocument,
         getCashFlowDocument,
         getContractDocument,
         getFieldMetricsDocument,
         getLiabilityDocument,
         getLoanAnaysisDocument,
      ],
   );
}
