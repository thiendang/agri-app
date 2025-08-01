import {memoize, sumBy} from 'lodash';
import { DEFAULT_MONTH_ORDER } from '../../../Constants';

const sumAnnualRow = (type, row) => {
   let sum = 0;

   for (const month of DEFAULT_MONTH_ORDER) {
      sum += row?.[month]?.[type] || 0;
   }
   return sum;
};

export const sumAnnualRowMemoized = memoize(sumAnnualRow);

export const updateAnnualTotals = memoize((rows, actualFieldName, incomeTotals) => {
   for (const row of rows) {
      if (row?.annual) {
         row.annual.expected = sumAnnualRowMemoized('expected', row);
         row.annual[actualFieldName] = sumAnnualRowMemoized(actualFieldName, row);
      }
   }
});

export const updateTotalsMemoized = memoize((totals, rows, columnIdList, actualFieldName) => {
   for (const columnId of columnIdList) {
      const expected = sumBy(rows, (row) => row?.[columnId]?.expected) || 0;
      const actual = sumBy(rows, (row) => row?.[columnId]?.[actualFieldName]) || 0;

      totals[columnId] = {expected, [actualFieldName]: actual};
   }
   totals.annual = {
      expected: sumAnnualRow('expected', totals),
      [actualFieldName]: sumAnnualRow(actualFieldName, totals),
   };
});

export const updateOperatingLoanTotalsMemoized = memoize(
   (totals, incomeTotals, expenseTotals, columnIdList, actualOperatingLoanBalance, isCash, actualFieldName) => {
      let useOperatingLoanBalanceActual, useOperatingLoanBalanceExpected;
      let index = 1;

      const cachedTotals = [...totals];
      for (const columnId of columnIdList) {
         if (index === 1 || index === 2) {
            if (isCash) {
               useOperatingLoanBalanceExpected = -actualOperatingLoanBalance;
               useOperatingLoanBalanceActual = -actualOperatingLoanBalance;
            } else {
               useOperatingLoanBalanceExpected = actualOperatingLoanBalance;
               useOperatingLoanBalanceActual = actualOperatingLoanBalance;
            }
         } else {
            useOperatingLoanBalanceExpected = cachedTotals?.[index - 2] ?? 0;
            useOperatingLoanBalanceActual = cachedTotals?.[index - 1] ?? 0;
         }
         const calcExpected =
            useOperatingLoanBalanceExpected - (incomeTotals[columnId].expected - expenseTotals[columnId].expected);
         const calcActual =
            useOperatingLoanBalanceActual -
            (incomeTotals[columnId]?.[actualFieldName] - expenseTotals[columnId]?.[actualFieldName]);

         cachedTotals[index] = calcExpected;
         cachedTotals[index + 1] = calcActual;
         index += 2;
      }
      return cachedTotals;
   },
);
