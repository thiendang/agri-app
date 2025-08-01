import {Document} from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import {useRecoilState} from 'recoil';
import {TableOfContents, TableOfContentsProvider} from '../../components/pdf/TableOfContents';
import {BUSINESS_STRUCTURE_INDEX, FIELD_METRICS_INDEX, GAME_PLAN_INDEX} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {YEAR_FORMAT} from '../../Constants';
import {DATE_DB_FORMAT} from '../../Constants';
// import {TAXABLE_INCOME_INDEX} from '../../Constants';
import {
   ASSET_INDEX,
   ACCOUNTABILITY_CHART_INDEX,
   CASH_FLOW_INDEX,
   BALANCE_SHEET_INDEX,
   LOAN_ANALYSIS_INDEX,
   CONTRACTS_INDEX,
   LIABILITY_INDEX,
} from '../../Constants';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import {entityState} from '../admin/EntityListDropDown';
import useAccountabilityChartPdf from './accountability/useAccountabilityChartPdf';
import useAssetPdf from './assets/useAssetPdf';
import useBalanceSheetPdf from './balanceSheet/useBalanceSheetPdf';
import useContractsPdf from './contracts/useContractsPdf';
import useLoanAnalysisPdf from './loanAnalysisComponents/useLoanAnalysisPdf';
import useCashFlowPdf from './cashFlow/useCashFlowPdf';
// import useTaxableIncomePdf from './tableIncome/useTaxableIncomePdf';
import useLiabilitiesPdf from './useLiabilitiesPdf';
import TitlePage from '../../components/pdf/TitlePageV2';
import {useGamePlanPdf} from './gamePlan/hooks/useGamePlanPdf';
import {useFieldMetricsPdf} from './profitLoss/useFieldMetricsPdf';
import useClientEntityChartPdf from './entity/useClientEntityChartPdf';

/**
 */
/**
 * Hook to return all the PDF document types.
 *
 * Reviewed:
 *
 * @param intl The localization object.
 * @param orientation The orientation of all the PDF pages.
 * @param clientId The client ID of the client for all the PDF documents
 * @param itemsKey The property key for the item in the tree for the team charts.
 * @return {function(*, *, *, *): Promise<*>}
 */
export default function useMultiplePdf(intl, orientation, clientId, itemsKey) {
   const [{reportDate, entityId, isCashOnly, showByField, isPerAcre}] = useCustomSearchParams();
   const [{entities: entityIds}] = useRecoilState(entityState);

   let date = moment(reportDate);

   if (!date.isValid()) {
      date = moment(reportDate, MONTH_FORMAT);
   }

   if (!date.isValid()) {
      date = moment(reportDate, YEAR_FORMAT);
   }

   if (date.isAfter(moment(), 'month')) {
      date = moment();
   }

   let historyDateString = moment(date).format(DATE_DB_FORMAT);
   let historyYearString = moment(date).format(YEAR_FORMAT);

   const getAssetDocument = useAssetPdf(intl, orientation, entityIds, historyDateString);
   const getLiabilityDocument = useLiabilitiesPdf(intl, orientation, entityIds, historyDateString);
   const getContractDocument = useContractsPdf(intl, orientation, entityIds, historyDateString);
   const getLoanAnalysisDocument = useLoanAnalysisPdf(intl, orientation, entityIds, historyDateString);
   const getBalanceSheetDocument = useBalanceSheetPdf(intl, orientation, entityIds, historyDateString);
   const getCashFlowDocument = useCashFlowPdf(intl, orientation, entityIds, historyYearString, reportDate, isCashOnly);
   // const getTaxableDocument = useTaxableIncomePdf(intl, orientation, clientId, entityIds, historyDateString);
   const getAccountabilityChart = useAccountabilityChartPdf(
      intl,
      orientation,
      clientId,
      entityIds,
      historyDateString,
      itemsKey,
   );
   const getClientEntityChart = useClientEntityChartPdf(
      intl,
      orientation,
      clientId,
      entityIds,
      historyDateString,
      itemsKey,
   );
   const getGamePlanDocument = useGamePlanPdf(intl, entityId, clientId, historyDateString);
   const getFieldMetricsDocument = useFieldMetricsPdf(intl, entityId, clientId, reportDate, !!showByField, isPerAcre);

   /**
    * Combine the selected PDF document types to be displayed.
    * @return {string} The type title.
    */
   const getTypeTitle = (types) => {
      let title = null;

      if (types[ACCOUNTABILITY_CHART_INDEX]) {
         title = 'Team Chart';
      }
      if (types[ASSET_INDEX]) {
         title = 'Assets Report';
      }
      if (types[BALANCE_SHEET_INDEX]) {
         title = 'Balance Sheet Report';
      }
      if (types[CASH_FLOW_INDEX]) {
         title = 'Cash Flow Report';
      }
      if (types[CONTRACTS_INDEX]) {
         title = 'Contracts Report';
      }
      if (types[LIABILITY_INDEX]) {
         title = 'Liabilities Report';
      }
      if (types[LOAN_ANALYSIS_INDEX]) {
         title = 'Borrowing Power Report';
      }
      if (types[GAME_PLAN_INDEX]) {
         title = 'Game Plan Report';
      }
      if (types[FIELD_METRICS_INDEX]) {
         title = 'Field Metrics Report';
      }
      if (types[BUSINESS_STRUCTURE_INDEX]) {
         title = 'Business Structure Report';
      }
      //TODO Taxable Income is on hold for now. Maybe restored later.
      // if (types[TAXABLE_INCOME_INDEX]) {
      //    titles.push(formatMessage(intl, 'export.taxableIncome.title'));
      // }

      return title;
   };

   return useCallback(
      async (types, title, entityNames, clientData) => (
         <Document title={title}>
            <TitlePage
               intl={intl}
               orientation={'landscape'}
               types={types}
               entityNames={entityNames}
               clientData={clientData}
               historyDate={reportDate}
            />
            <TableOfContentsProvider>
               <TableOfContents
                  historyDate={reportDate}
                  intl={intl}
                  orientation={'landscape'}
                  title={types?.filter(Boolean)?.length >= 2 ? '' : getTypeTitle(types)}
               />
               {types[ACCOUNTABILITY_CHART_INDEX] && (await getAccountabilityChart(entityNames))}
               {types[LOAN_ANALYSIS_INDEX] && (await getLoanAnalysisDocument(entityNames))}
               {types[ASSET_INDEX] && (await getAssetDocument(entityNames))}
               {types[LIABILITY_INDEX] && (await getLiabilityDocument(entityNames))}
               {types[BALANCE_SHEET_INDEX] && (await getBalanceSheetDocument(entityNames))}
               {types[CASH_FLOW_INDEX] && (await getCashFlowDocument(entityNames))}
               {types[CONTRACTS_INDEX] && (await getContractDocument(entityNames))}
               {types[GAME_PLAN_INDEX] && (await getGamePlanDocument(entityNames))}
               {types[FIELD_METRICS_INDEX] && (await getFieldMetricsDocument(entityNames))}
               {types[BUSINESS_STRUCTURE_INDEX] && (await getClientEntityChart(entityNames))}
               {/*{types[TAXABLE_INCOME_INDEX] && (await getTaxableDocument(entityNames))}*/}
            </TableOfContentsProvider>
         </Document>
      ),
      [
         intl,
         reportDate,
         getAccountabilityChart,
         getLoanAnalysisDocument,
         getAssetDocument,
         getLiabilityDocument,
         getBalanceSheetDocument,
         getCashFlowDocument,
         getContractDocument,
         getGamePlanDocument,
         getFieldMetricsDocument,
         getClientEntityChart,
      ],
   );
}
