import {castArray, cloneDeep, differenceBy} from 'lodash';
import sumBy from 'lodash/sumBy';
import moment from 'moment/moment';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import {DEFAULT_MONTH_ORDER, DEPRECIATION_TYPE_NAME, MONTH_FORMAT} from '../../../Constants';
import {YEAR_FORMAT} from '../../../Constants';
import {ENTITY_CASH_FLOW_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CASH_FLOW_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useCashFlowExcelExport from './useCashFlowExcelExport';
import {updateAnnualTotals, updateOperatingLoanTotalsMemoized, updateTotalsMemoized} from './useCashFlow';

/**
 * Hook to insert the worksheet for the Cash Flow in a Excel document. All the data is queried.
 *
 * Reviewed:
 */
export default function useCashFlowExcel(orientation, clientId, entityId, reportDate, isCashOnly) {
   const exportToExcel = useCashFlowExcelExport('CashFlow', orientation);
   const [cashFlowDataLazy] = useLazyQueryFHG(CASH_FLOW_QUERY, {fetchPolicy: 'network-only'}, 'cashFlow.type');

   const [entityCashFlowQuery] = useLazyQueryFHG(
      ENTITY_CASH_FLOW_ALL_WHERE_QUERY,
      {fetchPolicy: 'network-only'},
      'entity.type',
   );

   return useCallback(
      async (workbook, entityNames = '') => {
         const entityIdList = castArray(entityId);

         let theReportDate = moment(reportDate, MONTH_FORMAT);
         if (!theReportDate.isValid()) {
            theReportDate = moment(reportDate, YEAR_FORMAT);
         }

         const entityCashFlowData = await entityCashFlowQuery({
            variables: {entityId, year: [Number(theReportDate.format(YEAR_FORMAT))]},
         });

         const result = await cashFlowDataLazy({
            fetchPolicy: 'no-cache',
            variables: {entityId, year: Number(theReportDate.format(YEAR_FORMAT))},
         });

         let actualOperatingLoanBalance;
         let operatingLoanLimit;
         let carryoverIncome;

         if (entityIdList?.length > 1 && entityCashFlowData?.data?.entityCashFlow?.length > 1) {
            const array = entityCashFlowData?.data?.entityCashFlow;
            actualOperatingLoanBalance = sumBy(array, 'actualOperatingLoanBalance');
            operatingLoanLimit = sumBy(array, 'operatingLoanLimit');
            carryoverIncome = sumBy(array, 'carryoverIncome');
            actualOperatingLoanBalance = Math.abs(actualOperatingLoanBalance);
         } else {
            const entityCashFlow = entityCashFlowData?.data?.entityCashFlow?.[0];
            actualOperatingLoanBalance = Math.abs(entityCashFlow?.actualOperatingLoanBalance);
            operatingLoanLimit = entityCashFlow?.operatingLoanLimit;
            carryoverIncome = entityCashFlow?.carryoverIncome;
         }

         const yearEndActualBalance = result?.data?.cashFlow?.actualOperatingLoanBalanceEnd;
         const yearEndProjectedBalance = result?.data?.cashFlow?.expectedOperatingLoanBalanceEnd;

         const cashFlow = result?.data?.cashFlow;
         const monthOrder = cashFlow?.monthOrder || DEFAULT_MONTH_ORDER;

         const useCashFlowExpenses = differenceBy(cashFlow?.expenses, [{typeName: DEPRECIATION_TYPE_NAME}], 'typeName');
         const incomeCashFlowData = cashFlow?.income ? cloneDeep([...cashFlow?.income, {}]) : [{}];
         const expenseCashFlowData = useCashFlowExpenses ? cloneDeep([...useCashFlowExpenses, {}]) : [{}];
         let incomeTotals = {};
         let expenseTotals = {};

         const actualFieldName = 'actual';
         updateTotalsMemoized(incomeTotals, incomeCashFlowData, DEFAULT_MONTH_ORDER, actualFieldName);
         updateTotalsMemoized(expenseTotals, expenseCashFlowData, DEFAULT_MONTH_ORDER, actualFieldName);
         updateAnnualTotals(incomeCashFlowData, actualFieldName, incomeTotals);
         updateAnnualTotals(expenseCashFlowData, actualFieldName, expenseTotals);

         const operatingLoanBalance = updateOperatingLoanTotalsMemoized(
            [],
            incomeTotals,
            expenseTotals,
            monthOrder,
            actualOperatingLoanBalance,
            isCashOnly,
            actualFieldName,
         );

         const DECEMBER_ACTUAL_OPERATING_BALANCE = 24;
         const DECEMBER_PROJECTED_OPERATING_BALANCE = 23;

         const yearEndActualLOCBalance = Math.max(operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE], 0);
         const yearEndProjectedLOCBalance = Math.max(operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE], 0);

         const yearEndActualCashBalance = Math.abs(
            Math.min(operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE], 0),
         );
         const yearEndProjectedCashBalance = Math.abs(
            Math.min(operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE], 0),
         );

         const isCashShow =
            isCashOnly ||
            operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE] < 0 ||
            operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE] < 0;

         return exportToExcel(
            workbook,
            result?.data,
            theReportDate.year(),
            entityNames,
            actualOperatingLoanBalance,
            operatingLoanLimit,
            yearEndActualBalance,
            yearEndProjectedBalance,
            carryoverIncome,
            isCashOnly,
            yearEndActualCashBalance,
            yearEndProjectedCashBalance,
            isCashShow,
         );
      },
      [cashFlowDataLazy, entityCashFlowQuery, entityId, exportToExcel, reportDate, isCashOnly],
   );
}
