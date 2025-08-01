import {Radio} from '@mui/material';
import {RadioGroup} from '@mui/material';
import {Stack} from '@mui/material';
import {Switch} from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import {InputAdornment} from '@mui/material';
import {lighten, useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import memoize from 'fast-memoize';
import {sortBy} from 'lodash';
import {assign} from 'lodash';
import {castArray} from 'lodash';
import {find} from 'lodash';
import {differenceBy} from 'lodash';
import {trim} from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import pick from 'lodash/pick';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {stringify} from 'query-string';
import {useRef} from 'react';
import {useLayoutEffect} from 'react';
import {useState, useCallback, useMemo} from 'react';
import React from 'react';
import {isFirefox} from 'react-dnd-html5-backend/dist/BrowserDetector';
import {useIntl} from 'react-intl';
import {useNavigate} from 'react-router-dom';
import {atom, useRecoilValue} from 'recoil';
import {useRecoilState} from 'recoil';
import {useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import ButtonLF from '../../../components/ButtonLF';
import {reportDateProperties} from '../../../components/ClientDrawer';
import Empty from '../../../components/Empty';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import OverviewPanel from '../../../components/OverviewPanel';
import {CASH_FLOW_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TextFieldLF from '../../../components/TextFieldLF';
import {MONTH_CONVERT} from '../../../Constants';
import {ROLLING_CYCLE_MAX_MONTHS} from '../../../Constants';
import {DARK_MODE_COLORS, SCALE_APP} from '../../../Constants';
import {NOTE_EDIT_IMG} from '../../../Constants';
import {DEFAULT_MONTH_ORDER} from '../../../Constants';
import {CASH_FLOW_INDEX} from '../../../Constants';
import {DEPRECIATION_TYPE_NAME} from '../../../Constants';
import {PERCENT_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {LOCK_ICON} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {EXPENSE_TYPE_CREATE_SUBCATEGORY} from '../../../data/QueriesGL';
import {CASH_FLOW_CARRY_OVER, getEntityCashFlowRefetchQueries, MULTI_CASHFLOW_UPDATE} from '../../../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {getCashFlowReportRefetchQueries} from '../../../data/QueriesGL';
import {ENTITY_CASH_FLOW_CREATE_UPDATE} from '../../../data/QueriesGL';
import {ENTITY_CASH_FLOW_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CASH_FLOW_QUERY} from '../../../data/QueriesGL';
import {getIncomeTypeUpdateQueries} from '../../../data/QueriesGL';
import {INCOME_TYPE_DELETE} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_DELETE} from '../../../data/QueriesGL';
import {getExpenseTypeUpdateQueries} from '../../../data/QueriesGL';
import {EXPENSE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {INCOME_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {INCOME_CREATE_UPDATE} from '../../../data/QueriesGL';
import ConfirmButton from '../../../fhg/components/ConfirmButton';
import Form from '../../../fhg/components/edit/Form';
import useEditData from '../../../fhg/components/edit/useEditData';
import {v4 as uuid} from 'uuid';
import {parse} from 'query-string';
import InfoVideoPopup from '../../../fhg/components/InfoVideoPopup';
import AdminAccess from '../../../fhg/components/security/AdminAccess';
import CategoryCellV8 from '../../../fhg/components/table/CategoryCellV8';
import {noteEditStatus} from '../../../fhg/components/table/TableContainerNewUiFHG';
import TableStickyContainerFrame from '../../../fhg/components/table/TableStickyContainerFrame';
import {selectedCellState} from '../../../fhg/components/table/TableNewUiFHG';

import TableV8FHG from '../../../fhg/components/table/TableV8FHG';
import TypographyFHG from '../../../fhg/components/Typography';
import VideoHelpButton from '../../../fhg/components/VideoHelpButton';
import {titleStatus} from '../../../fhg/components/WebAppBar';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
// import useEffect from '../../../fhg/hooks/useEffectDebugCount';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import ScrollStack from '../../../fhg/ScrollStack';
import {getMarkedWholeCell} from '../../../fhg/utils/DataUtil';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {findWithSubitem} from '../../../fhg/utils/Utils';
import {useLocation} from 'react-router-dom';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {formatMessage} from '../../../fhg/utils/Utils';
import {entityState} from '../../admin/EntityListDropDown';
import {userRoleState} from '../../Main';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NoteCellV8 from '../../../fhg/components/table/NoteCellV8';
import useWidthRule from '../../../fhg/hooks/useWidthRule';
import useMediaQuery from '@mui/material/useMediaQuery';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import {EditCarryOverIncomeNote} from './EditCarryOverIncomeNote';
import {DrawerMenuButton} from '../../../components/DrawerMenuButton';

const PERCENT_COLUMN_WIDTH = isFirefox() ? 61.2 : 86;
// const EXPENSE_PERCENT_COLUMN_WIDTH = isFirefox() ? 61.2 : 89.33;
// const pasteLineEnding = isFirefox() ? '\n' : '\r\n';
const DEFAULT_COLUMN_WIDTH = 128;
const ACTUAL_COLUMN_WIDTH = 128;
const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_HEADER_ROW_HEIGHT = 43;
const CATEGORY_INCOME_COLUMN_ID = 'income';
const CATEGORY_EXPENSE_COLUMN_ID = 'expense';
export const CATEGORY_COLUMN_INDEX = 0;
const INCOME_TABLE = 'Income';
const EXPENSES_TABLE = 'Expenses';

const defaultIncomeExpense = {
   // id: undefined,
   jan: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   feb: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   mar: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   apr: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   may: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   jun: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   jul: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   aug: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   sep: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   oct: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   nov: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   dec: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   annual: {
      id: undefined,
      actual: 0,
      expected: 0,
   },
   hasSubcategories: false,
   subcategories: [],
};

const sumAnnualRow = (type, row) => {
   let sum = 0;

   for (const month of DEFAULT_MONTH_ORDER) {
      sum += row?.[month]?.[type] || 0;
   }
   return sum;
};

const sumAnnualRowMemoized = memoize(sumAnnualRow);

const sumAnnualPercentColumnMemoized = memoize((rows, columnId) => {
   return rows?.reduce((sum, row) => (row.getValue(columnId) || 0) + sum, 0);
});

const sumAnnualPercentMemoized = memoize((type, row, total) => {
   let sum = sumAnnualRowMemoized(type, row);
   return total > 0 ? (sum / total) * 100 : 0;
});

const updateAnnualTotals = memoize((rows, actualFieldName) => {
   for (const row of rows) {
      if (row?.annual) {
         row.annual.expected = sumAnnualRowMemoized('expected', row);
         row.annual[actualFieldName] = sumAnnualRowMemoized(actualFieldName, row);
      }
   }
});

const updateAnnualPercentTotals = memoize((rows, actualFieldName, incomeTotals) => {
   for (const row of rows) {
      if (row?.annual) {
         row.annual.expectedPercent = sumAnnualPercentMemoized('expected', row, incomeTotals?.annual.expected);
         row.annual[actualFieldName + 'Percent'] = sumAnnualPercentMemoized(
            actualFieldName,
            row,
            incomeTotals?.annual?.[actualFieldName],
         );
      }
   }
});

const updateTotalsMemoized = memoize((totals, rows, columnIdList, actualFieldName) => {
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

const updateOperatingLoanTotalsMemoized = memoize(
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

const useStyles = makeStyles(
   (theme) => ({
      inputAdornmentStyle: {
         '& .MuiFormControlLabel-root': {marginRight: 4},
      },
      totalsAreaStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      totalsStyle: {
         marginBottom: theme.spacing(2),
      },
      tableRoot: {
         backgroundColor: 'white',
      },
      tableFrameStyle: {
         padding: theme.spacing(0.5, 3, 0.5, 2),
      },
      buttonStyle: {
         margin: theme.spacing(1),
      },
      deleteButtonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.dark, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.dark, 0.6),
         },
      },
      footerStyle: {
         fontSize: 18 * SCALE_APP,
      },
      formStyle: {
         maxHeight: '100%',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      tableHeadRoot: {
         top: 54,
         position: 'sticky',
         zIndex: theme.zIndex.drawer - 1,
      },
      negativeStyle: {
         color: theme.palette.error.main,
      },
      tableStyle: {
         '& .header-style.row-1': {
            position: 'sticky',
            left: 18,
            top: 80,
         },
         '&:not(.singleColumnMonth) th:nth-of-type(even).header-style.row-1': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '&:not(.singleColumnMonth) th:nth-of-type(odd).header-style.row-1': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '&.singleColumnMonth th.header-style.row-1': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .header-style.row-0': {
            borderTop: '1px solid ' + theme.palette.divider,
            position: 'sticky',
            left: 18,
            top: 44,
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .left-table .header-style': {
            borderRight: '2px solid ' + theme.palette.divider,
            borderLeft: '1px solid ' + theme.palette.divider,
         },
         '& .left-table .row-0.header-style': {
            color: 'transparent',
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .left-table .cell-style': {
            borderRight: '2px solid ' + theme.palette.divider,
            borderLeft: '1px solid ' + theme.palette.divider,
         },
         '& .left-table .footer-style': {
            borderRight: '2px solid ' + theme.palette.divider,
            borderLeft: '1px solid ' + theme.palette.divider,
         },
         '& .center-table .row-0.header-style': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .center-table .row-1.header-style:nth-of-type(odd)': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '& .center-table .footer-style:nth-of-type(odd)': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '& .center-table .row-1.header-style:nth-of-type(even)': {
            borderRight: '2px solid ' + theme.palette.divider,
            // top: 80,
            // left: 0,
            // zIndex: 100,
         },
         '& .center-table .footer-style:nth-of-type(even)': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .center-table .cell-style:nth-of-type(odd)': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '& .center-table .cell-style:nth-of-type(even)': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .row-0.header-style': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .row-1.header-style:nth-of-type(odd)': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '& .right-table .row-1.header-style:nth-of-type(even)': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .cell-style:nth-of-type(odd)': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '& .right-table .footer-style:nth-of-type(odd)': {
            borderRight: '1px solid ' + theme.palette.divider,
         },
         '& .right-table .cell-style:nth-of-type(even)': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .footer-style:nth-of-type(even)': {
            borderRight: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .header-style:first-of-type': {
            borderLeft: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .footer-style:first-of-type': {
            borderLeft: '2px solid ' + theme.palette.divider,
         },
         '& .right-table .cell-style:first-of-type': {
            borderLeft: '2px solid ' + theme.palette.divider,
         },
      },

      cellStyle: {
         whiteSpace: 'nowrap',
         // padding: theme.spacing(0.7, 0.7, 0.5),
         paddingRight: '4px',
         paddingTop: '2px',
         paddingBottom: '2px',
         fontSize: 18 * SCALE_APP,
         '&.editable': {
            color: `${theme.palette.text.primary} !important`,
         },
         '&:hover.editable:not(.keyboardRecent)': {
            backgroundColor: theme.palette.mode === 'dark' ? '#4C5343' : '#f0f6e9',
            cursor: 'pointer',
         },
         '&:hover:not(.editable):not(.keyboardRecent)': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.avatar : '#f0f0f0',
            cursor: 'default',
         },
         borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(224, 224, 224, 1)'
         }`,
         color: theme.palette.text.primary,
         borderRight: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(0, 0, 0, 0.12)'
         } !important`,
      },
      inputStyle: {
         minWidth: 60,
         width: '100%',
         '& input': {
            minWidth: '200px !important',
         },
      },
      entitySelectStyle: {
         marginBottom: 6,
      },
      progressStyle: {
         position: 'relative',
         top: '50%',
         left: '50%',
         zIndex: 5000,
      },
      borderFrame: {
         backgroundColor: 'white',
         marginTop: 1,
         marginRight: 1,
         marginBottom: theme.spacing(2),
         position: 'relative',
      },
      buttonStyleLF: {
         textDecoration: 'underline',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
      lockStyle: {
         position: 'relative',
         '&.disabled:hover:before': {
            content: `url(${LOCK_ICON})`,
            paddingLeft: 'calc(50% - 64px)',
            paddingTop: '8%',
            marginRight: '5%',
            width: 'calc(100% - 16px)',
            height: '100%',
            filter: 'opacity(60%)',
            transition: '1s',
            '@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)': {
               opacity: 0.3,
            },
            display: 'block',
            verticalAlign: 'middle',
            backgroundColor: `#fbfbfb`,
            position: 'fixed',
            zIndex: 10000,
         },
      },
      stickyFrame: {
         overflow: 'unset',
         '& table': {
            '& .MuiTableRow-head': {
               zIndex: theme.zIndex.drawer - 1,
            },
            '& thead > tr': {
               position: 'sticky',
               left: 0,
               top: 0,
            },
            '& tbody > tr, tfoot > tr': {
               position: 'sticky',
               left: 0,
            },
            '& tfoot > tr > td': {
               // backgroundColor: 'white !important',
            },
            '& td:first-child': {
               position: 'sticky',
               left: 18,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
               borderLeft: `1px solid ${theme.palette.divider}`,
               borderRight: `2px solid ${theme.palette.divider}`,
            },
            '&:not(.singleColumnMonth) td:nth-of-type(even):not(:first-child)': {
               borderRight: `1px solid ${theme.palette.divider}`,
            },
            '&:not(.singleColumnMonth) td:nth-of-type(odd):not(:first-child)': {
               borderRight: `2px solid ${theme.palette.divider}`,
            },
            '&.singleColumnMonth td:not(:first-child)': {
               borderRight: `2px solid ${theme.palette.divider}`,
            },
            '& th:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: theme.palette.table.header.primary,
               borderLeft: `1px solid ${theme.palette.divider}`,
               borderRight: `2px solid ${theme.palette.divider}`,
               borderTopLeftRadius: `${0} !important`,
            },
            '& tr:nth-child(2) > th:nth-last-child(2)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
                  right: PERCENT_COLUMN_WIDTH + 16,
               },
            },
            '&.singleColumnMonth tr:nth-child(2) > th:nth-last-child(2)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
            },
            '&.singleColumnMonth  td:nth-last-child(2)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
            },
            '&:not(.singleColumnMonth) tr:nth-child(2) > th:nth-last-child(3)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + ACTUAL_COLUMN_WIDTH + 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
               },
            },
            '&:not(.singleColumnMonth) tr:nth-child(2) > th:nth-last-child(4)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH * 2 + ACTUAL_COLUMN_WIDTH + 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
               },
            },
            '& th:last-child': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
               },
            },
            '& tr:first-child > th:last-child': {
               borderLeft: `2px solid ${theme.palette.divider}`,
            },
            '& td:last-child': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(2)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '&:not(.singleColumnMonth) td:nth-last-child(3)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + ACTUAL_COLUMN_WIDTH + 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '&:not(.singleColumnMonth) td:nth-last-child(4)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH * 2 + ACTUAL_COLUMN_WIDTH + 16,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
         },
      },
      textFieldStyle: {
         '& .MuiInputBase-input': {
            color: 'black',
         },
      },
      editPaper: {
         padding: theme.spacing(1),
         backgroundColor: theme.palette.background.background2,
         zIndex: `${theme.zIndex.modal} !important`,
         width: 230,
      },
      popover: {
         pointerEvents: 'none',
      },
      noteIconStyle: {
         position: 'absolute',
         right: theme.spacing(-0.5),
         top: theme.spacing(-0.5),
         backgroundColor: '#C6D2B8',
         fontSize: 16 * SCALE_APP,
         zIndex: theme.zIndex.drawer,
      },
      root: {
         zIndex: `${theme.zIndex.modal + 2} !important`,
      },
      formStyleNote: {
         maxHeight: '100%',
         overflow: 'visible',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      buttonStyle1: {
         padding: theme.spacing(0.5),
      },
      radioLabel: {
         fontWeight: '700',
         color: theme.palette.text.primary,
      },
   }),
   {name: 'CashFlowStyles'},
);

const getInitialCashFlow = (year) => ({
   id: uuid(),
   actualOperatingLoanBalance: 0,
   expectedOperatingLoanBalance: 0,
   date: moment().format(DATE_DB_FORMAT),
   entityId: '',
   operatingLoanLimit: 0,
   carryoverIncome: 0,
   year,
   taxLock: false,
});

const DECEMBER_ACTUAL_OPERATING_BALANCE = 24;
const DECEMBER_PROJECTED_OPERATING_BALANCE = 23;

/**
 * Given the recordField, startMonth and year calculate the correct date for the record based on the fiscal year.
 *
 * @param recordField The record field from the table column.
 * @param startMonth The fiscal year start month.
 * @param year The current year selected by the user.
 * @return {undefined|moment.Moment} The moment containing the date.
 */
function calculateDate(recordField, startMonth, year) {
   if (recordField && startMonth && year) {
      return moment(
         `${recordField}-01-${
            DEFAULT_MONTH_ORDER.indexOf(recordField) < DEFAULT_MONTH_ORDER.indexOf(startMonth) // If record month is strictly prior
               ? // to the startMonth
                 year + 1 // Add one year to date
               : year // Otherwise, send selected year
         }`,
      );
   } else {
      console.log('Cash flow - calculateDate did not have the correct params', recordField, startMonth, year);
   }
   return undefined;
}
export const SHOW_ACTUALS = 1;
export const SHOW_PROJECTED = 2;
export const SHOW_ANNUALS = 3;
export const SHOW_ALL = 4;
const OPTIONS = [
   {
      id: SHOW_ACTUALS,
      name: 'Show Actuals Only',
   },
   {
      id: SHOW_PROJECTED,
      name: 'Show Projection Only',
   },
   {
      id: SHOW_ANNUALS,
      name: 'Show Annuals Only',
   },
   {
      id: SHOW_ALL,
      name: 'Show All Columns',
   },
];

const HIDDEN_COLUMNS = {
   1: [
      'dec_expected',
      'jan_expected',
      'feb_expected',
      'mar_expected',
      'apr_expected',
      'may_expected',
      'jun_expected',
      'jul_expected',
      'aug_expected',
      'sep_expected',
      'oct_expected',
      'nov_expected',
      'annual_expected',
      'annual_expectedPercent',
   ],
   2: [
      'dec_actual',
      'jan_actual',
      'feb_actual',
      'mar_actual',
      'apr_actual',
      'may_actual',
      'jun_actual',
      'jul_actual',
      'aug_actual',
      'sep_actual',
      'oct_actual',
      'nov_actual',
      'annual_actual',
      'annual_actualPercent',
   ],
   3: [
      'dec_expected',
      'jan_expected',
      'feb_expected',
      'mar_expected',
      'apr_expected',
      'may_expected',
      'jun_expected',
      'jul_expected',
      'aug_expected',
      'sep_expected',
      'oct_expected',
      'nov_expected',
      'dec_actual',
      'jan_actual',
      'feb_actual',
      'mar_actual',
      'apr_actual',
      'may_actual',
      'jun_actual',
      'jul_actual',
      'aug_actual',
      'sep_actual',
      'oct_actual',
      'nov_actual',
   ],
   4: [],
};

export const showCashFlowState = atom({
   key: 'showCashFlowState',
   default: SHOW_ALL,
});

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed: 5/28/21(incomplete development)
 */
export default function CashFlow() {
   const [{clientId: clientIdProp, entityId, search, reportDate, isCashOnly}, setSearchAsObject] =
      useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const location = useLocation();
   const navigate = useNavigate();
   const date = reportDate ?? moment().format(MONTH_FORMAT);
   const pollInterval = useRecoilValue(pollState);

   const [, setShowCashFlowColumn] = useRecoilState(showCashFlowState);
   const [{entities: entityIdList, allEntities: isAllEntities}, setEntityStatus] = useRecoilState(entityState);
   const year = moment(date, MONTH_FORMAT)?.year();
   const hasPermission = usePermission(CASH_FLOW_EDIT);
   const isSmallWidth = useWidthRule('up', 'sm');
   const isLargeWidth = useMediaQuery('(min-width:1419px)');

   const setReportDateProperties = useSetRecoilState(reportDateProperties);
   const entityIdRef = useRef(entityId);
   const carryOverAddNoteButton = useRef();

   const [requestExpand, setRequestExpand] = useState();
   // Expanded rows in the income table.
   const [expandedIncome, setExpandedIncome] = useState();

   // Expanded rows in the expense table.
   const [expandedExpense, setExpandedExpense] = useState();

   entityIdRef.current = entityId;

   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {
         fetchPolicy: 'cache-and-network',
         variables: {clientId},
         skip: !validate(clientId),
         pollInterval,
      },
      'client.type',
   );

   // Set the startMonth and default to jan if not set
   const [startMonth, setStartMonth] = useState('jan');

   const fiscalYear = year;

   const theme = useTheme();
   const classes = useStyles();
   const intl = useIntl();

   const incomeTotals = useRef({}).current;
   const expenseTotals = useRef({}).current;
   const [operatingLoanBalance, setOperatingLoanBalance] = useState([]);

   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);

   const [incomeCreateUpdate] = useMutationFHG(INCOME_CREATE_UPDATE);
   const [incomeTypeCreateUpdate] = useMutationFHG(INCOME_TYPE_CREATE_UPDATE, undefined, undefined, false);
   const [incomeTypeDelete] = useMutationFHG(INCOME_TYPE_DELETE);

   const [expenseCreateUpdate] = useMutationFHG(EXPENSE_CREATE_UPDATE);
   const [expenseTypeDelete] = useMutationFHG(EXPENSE_TYPE_DELETE);
   const [expenseTypeCreateUpdate] = useMutationFHG(EXPENSE_TYPE_CREATE_UPDATE, undefined, undefined, false);
   const [expenseTypeCreateSubcategory] = useMutationFHG(EXPENSE_TYPE_CREATE_SUBCATEGORY, undefined, undefined, false);
   const [multiUpdateCashFlow] = useMutationFHG(MULTI_CASHFLOW_UPDATE, {
      fetchPolicy: 'no-cache',
      awaitRefetchQueries: true,
   });

   const [option, setOption] = useState(4);

   const [cashFlowCarryOver, {loading: isLoadingCarryOver}] = useMutationFHG(CASH_FLOW_CARRY_OVER);

   const [cashFlowData, {refetch}] = useQueryFHG(CASH_FLOW_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: entityIdList, year: year},
      skip: !(entityIdList?.length > 0) || !fiscalYear,
      pollInterval,
      onCompleted: (data) => {
         setStartMonth(data.cashFlow.startMonth || clientData?.client?.startMonth || 'jan');
         updateDataAndTotals(data?.cashFlow);
      },
   });
   const [entityCashFlowData, {refetch: refetchEntityCashFlow}] = useQueryFHG(ENTITY_CASH_FLOW_ALL_WHERE_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: entityIdList, year: [year]},
      skip: !entityIdList || entityIdList?.length === 0 || !year,
      pollInterval,
   });

   const monthOrder = useMemo(() => cashFlowData?.cashFlow?.monthOrder || DEFAULT_MONTH_ORDER, [cashFlowData]);

   const [entityCashFlowCreateUpdate] = useMutationFHG(ENTITY_CASH_FLOW_CREATE_UPDATE);

   const [isLoading, setIsLoading] = useState(true);

   const [editValues, handleChange, {getValue, setValue, setEditValues}] = useEditData({
      isLocked: false,
      isAllEntityId: isAllEntities,
   });

   const {buttonPanel, scaleStyle, scale} = useScalePanel(
      {
         position: 'relative',
         top: 'unset',
         right: 'unset',
         backgroundColor: theme.palette.background2,
         opacity: 1,
      },
      false,
   );

   useEffect(() => {
      const endDate = moment().add(ROLLING_CYCLE_MAX_MONTHS, 'months').endOf('year');
      setReportDateProperties({disableFuture: false, endDate});
      return () => {
         setReportDateProperties({disableFuture: true, endDate: undefined});
      };
   }, [setReportDateProperties]);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: false}));
   }, [setEntityStatus]);

   /**
    * When the url params change, check for the auto lock.
    */
   useEffect(() => {
      setValue('isLocked', year < moment().year() || entityIdList?.length > 1 || isAllEntities || !hasPermission);
      // adding setValue will cause infinite calls.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [entityIdList?.length, isAllEntities, year]);

   const handleChangeCallback = (changed, newChanged, currentValues) => {
      handleSubmitDebounced(changed, year, currentValues);
   };

   const [
      editCashFlowValues,
      handleCashFlowChange,
      {
         currentValues: currentCashValues,
         getValue: getCashFlowValue,
         defaultValues: defaultCashFlowValues,
         resetValues: resetCashFlowValues,
      },
   ] = useEditData(
      {id: uuid(), entityId, ...entityCashFlowData?.entityCashFlow?.[0], isCashOnly},
      ['id', 'entityId'],
      undefined,
      handleChangeCallback,
   );

   const [
      ,
      /*editValues*/ handleChangeNoteCarryover,
      {getValue: getValueNoteCarryover, resetValues: resetNoteCarryover},
   ] = useEditData({
      carryoverIncomeNote: entityCashFlowData?.entityCashFlow?.[0]?.carryoverIncomeNote,
   });

   const setEditNote = useSetRecoilState(noteEditStatus);

   const {isAdmin} = useRecoilValue(userRoleState);

   const actualFieldName = useMemo(
      () => (getCashFlowValue('taxLock') && isAdmin ? 'taxActual' : 'actual'),
      [getCashFlowValue, isAdmin],
   );

   useEffect(() => {
      if (editValues?.entityId?.length > 0 || editValues?.isAllEntityId !== undefined) {
         const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
         searchParams.year = year;

         const search = stringify(searchParams);
         navigate({pathname: location.pathname, search}, {replace: true});
      }
   }, [navigate, location.pathname, location.search, editValues, setEditValues, getValue, year]);

   useEffect(() => {
      setSearchAsObject((prev) => ({
         ...prev,
         isCashOnly: currentCashValues?.isCashOnly,
      }));
   }, [currentCashValues?.isCashOnly, setSearchAsObject]);

   usePageTitle({titleKey: 'cashFlow.title', values: {year}});
   const setTitleStatus = useSetRecoilState(titleStatus);

   useEffect(() => {
      setTitleStatus((status) => ({
         ...status,
         helpKey: 'cashFlow.overall.help',
         videoId: 'kvooi0oe1v',
      }));
   }, [setTitleStatus]);

   useEffect(() => {
      resetNoteCarryover({
         carryoverIncomeNote: entityCashFlowData?.entityCashFlow?.[0]?.carryoverIncomeNote,
      });
   }, [resetNoteCarryover, entityCashFlowData?.entityCashFlow]);

   useEffect(() => {
      if (entityCashFlowData?.entityCashFlow) {
         setIsLoading(false);

         let values = {id: uuid(), entityId};
         if (entityCashFlowData.entityCashFlow.length > 0) {
            if ((isAllEntities || entityIdList?.length > 1) && entityCashFlowData.entityCashFlow.length > 1) {
               const array = entityCashFlowData?.entityCashFlow;
               values.actualOperatingLoanBalance = sumBy(array, 'actualOperatingLoanBalance');
               values.operatingLoanLimit = sumBy(array, 'operatingLoanLimit');
               values.isCashOnly = values.actualOperatingLoanBalance < 0;
               values.actualOperatingLoanBalance = Math.abs(values.actualOperatingLoanBalance);
            } else {
               values = {...values, ...entityCashFlowData?.entityCashFlow?.[0]};
               if (values?.actualOperatingLoanBalance < 0 && values?.isCashOnly) {
                  values.actualOperatingLoanBalance = Math.abs(values?.actualOperatingLoanBalance);
               }
            }
            resetCashFlowValues(values);
         } else {
            if (values?.actualOperatingLoanBalance < 0 && values?.isCashOnly) {
               values.actualOperatingLoanBalance = Math.abs(values?.actualOperatingLoanBalance);
            }
            resetCashFlowValues(values);
         }
      }
   }, [entityCashFlowData?.entityCashFlow, entityId, entityIdList?.length, isAllEntities, resetCashFlowValues]);

   const [incomeData, setIncomeData] = useState();
   const [expenseData, setExpenseData] = useState();

   useEffect(() => {
      if ((!(entityIdList?.length > 0) || !fiscalYear) && (expenseData?.length > 0 || incomeData?.length > 0)) {
         updateDataAndTotals(null);
      }
   }, [entityIdList, fiscalYear, expenseData, incomeData]);

   const updateAllTotals = useCallback(
      (incomeCashFlowData, expenseCashFlowData) => {
         if (incomeCashFlowData) {
            updateTotalsMemoized(incomeTotals, incomeCashFlowData, DEFAULT_MONTH_ORDER, actualFieldName);
            updateAnnualTotals(incomeCashFlowData, actualFieldName, incomeTotals);
            updateAnnualPercentTotals(incomeCashFlowData, actualFieldName, incomeTotals);
         }
         if (expenseCashFlowData) {
            updateTotalsMemoized(expenseTotals, expenseCashFlowData, DEFAULT_MONTH_ORDER, actualFieldName);
            updateAnnualTotals(expenseCashFlowData, actualFieldName, expenseTotals);
            // Income totals must be used to base expenses as a percentage of income.
            updateAnnualPercentTotals(expenseCashFlowData, actualFieldName, incomeTotals);
         }
         const newOperatingLoanBalance = updateOperatingLoanTotalsMemoized(
            operatingLoanBalance,
            incomeTotals,
            expenseTotals,
            monthOrder,
            getCashFlowValue('actualOperatingLoanBalance') ?? 0,
            getCashFlowValue('isCashOnly', false),
            actualFieldName,
         );
         setOperatingLoanBalance(newOperatingLoanBalance);
      },
      [incomeTotals, expenseTotals, getCashFlowValue, monthOrder, operatingLoanBalance, actualFieldName],
   );

   /**
    * Set the income or expense in the data displayed in the tables.
    *
    * @param month The month to set the value for.
    * @param fieldName The name of the field (i.e. 'actual' or 'expected').
    *                  Can be an array, but must match the length of value.
    * @param value The value to set the field to.
    *              Can be an array, but must match the length of fieldName.
    *              Can also be an object, with fieldName empty to assign the entire object.
    * @param tableName The name of the table to set the data for.
    * @param typeId The record type id in the data.
    * @param doUpdateTotals Indicates if the totals should be updated after the value change.
    * @param dataProp The table data to use.
    *                 This supports making multiple calls without a redraw in between and not using the original
    *                 unmodified data.
    * @type {(function(*, *, *, *, *): void)|*}
    */
   const setIncomeExpenseTableData = useCallback(
      (month, fieldName, value, tableName, typeId, doUpdateTotals = false, dataProp) => {
         if (tableName) {
            let data = dataProp ? dataProp : tableName === INCOME_TABLE ? incomeData : expenseData;
            let monthData = findWithSubitem(data, 'subcategories', (item) => item.typeId === typeId);
            let isNew = true;
            if (monthData) {
               isNew = monthData?.id === undefined;

               if (!dataProp) {
                  data = cloneDeep(data);
                  monthData = findWithSubitem(data, 'subcategories', (item) => item.typeId === typeId);
               }

               if (month) {
                  const fieldNames = castArray(fieldName);
                  const values = castArray(value);

                  for (let i = 0; i < values?.length; i++) {
                     const value = values[i];
                     const fieldName = fieldNames[i];

                     monthData[month][fieldName] = value;
                  }

                  if (doUpdateTotals) {
                     if (tableName === INCOME_TABLE) {
                        updateAllTotals(data, undefined);
                     } else {
                        updateAllTotals(undefined, data);
                     }
                  }
               } else if (fieldName) {
                  const fieldNames = castArray(fieldName);
                  const values = castArray(value);

                  for (let i = 0; i < values?.length; i++) {
                     const value = values[i];
                     const fieldName = fieldNames[i];
                     if (fieldName === 'subcategories') {
                        monthData.hasSubcategories = value?.length > 0;
                     }

                     monthData[fieldName] = value;
                  }
               } else {
                  assign(monthData, value);
                  // Assign an id if not already assigned.
                  if (!monthData.id) {
                     monthData.id = uuid();
                  }
               }
               debugger;
               if (tableName === INCOME_TABLE) {
                  setIncomeData(data);
               } else {
                  setExpenseData(data);
               }
            }
            return {updateData: data, isNew};
         }
      },
      [updateAllTotals, incomeData, expenseData],
   );

   /**
    * Set new data and update the totals based on the new data.
    * @param cashFlow The cashflow data from the server.
    */
   const updateDataAndTotals = useCallback(
      (cashFlow) => {
         function addDefaultSubcategories(categories) {
            for (const category of categories) {
               if (category.hasSubcategories) {
                  const newDefault = {...cloneDeep(defaultIncomeExpense), entityId, typeId: uuid()};
                  category.subcategories = sortBy(category.subcategories, 'typeName');
                  category.subcategories.push(newDefault);
               }
            }
         }
         if (cashFlow) {
            const useCashFlowExpenses = differenceBy(
               cashFlow?.expenses,
               [{typeName: DEPRECIATION_TYPE_NAME}],
               'typeName',
            );
            const newDefaultIncome = {...cloneDeep(defaultIncomeExpense), entityId, typeId: uuid()};
            const newDefaultExpense = {...cloneDeep(defaultIncomeExpense), entityId, typeId: uuid()};
            const incomeData = cashFlow?.income
               ? cloneDeep([...cashFlow?.income, newDefaultIncome])
               : [newDefaultIncome];
            addDefaultSubcategories(incomeData);
            setIncomeData(incomeData);
            const expenseData = useCashFlowExpenses
               ? cloneDeep([...useCashFlowExpenses, newDefaultExpense])
               : [newDefaultExpense];
            addDefaultSubcategories(expenseData);
            setExpenseData(expenseData);

            updateAllTotals(incomeData, expenseData);
         } else {
            setIncomeData([]);
            setExpenseData([]);
         }
      },
      [entityId, updateAllTotals],
   );

   /**
    * Callback when the note is updated. Submit the note changes to the server.
    * @param note The updated note.
    * @return {Promise<void>}
    */
   const handleUpdateNotes = useCallback(
      async (note, cell, tableName, editItem) => {
         let itemCreateUpdate, item;

         if (cell) {
            if (tableName === INCOME_TABLE) {
               item = editItem?.[cell.column.parent.id];
            } else if (tableName === EXPENSES_TABLE) {
               item = editItem?.[cell.column.parent.id];
            } else {
               console.log('Could not find the selected item');
            }
         }
         if (item) {
            const [recordField] = [cell.column.parent.id] || [];

            const itemUuid = item?.id?.split('_');
            const useId = itemUuid?.[0] === entityId ? uuid() : itemUuid[0];
            const noteField = cell?.column?.columnDef?.meta?.field === 'expected' ? 'noteExpected' : 'noteActual';

            setIncomeExpenseTableData(recordField, noteField, note, tableName, cell?.row.original.typeId);

            const variables = {
               id: useId,
               entityId,
               [noteField]: note,
               date: calculateDate(recordField, startMonth, year)?.format(DATE_DB_FORMAT),
            };

            if (tableName === INCOME_TABLE) {
               variables.incomeTypeId = cell?.row?.original?.typeId;
               itemCreateUpdate = incomeCreateUpdate;
               // __typename = 'Income';
               // mutationPath = 'income';
            } else if (tableName === EXPENSES_TABLE) {
               variables.expenseTypeId = cell?.row?.original?.typeId;
               itemCreateUpdate = expenseCreateUpdate;
               // __typename = 'Expense';
               // mutationPath = 'expense';
            } else {
               console.log('could not find the selected item');
               return;
            }

            await itemCreateUpdate({variables});
         }
         setEditNote(false);
      },
      [entityId, expenseCreateUpdate, incomeCreateUpdate, startMonth, year, setIncomeExpenseTableData, setEditNote],
   );

   /**
    * Callback when a category is deleted.
    * @return {Promise<void>}
    */
   const handleDeleteCategory = useCallback(
      async (deleteCell, tableName) => {
         if (deleteCell && tableName) {
            const item = deleteCell.row?.original;
            if (tableName === EXPENSES_TABLE) {
               await expenseTypeDelete({
                  variables: {id: item?.typeId, year},
                  optimisticResponse: {expenseType_Delete: 1},
                  update: cacheDelete(getExpenseTypeUpdateQueries(), item?.id),
                  refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
            } else {
               await incomeTypeDelete({
                  variables: {id: item?.typeId, year},
                  optimisticResponse: {incomeType_Delete: 1},
                  update: cacheDelete(getIncomeTypeUpdateQueries(), item?.id),
                  // refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
               });
            }
            const results = await refetch();
            updateDataAndTotals(results?.data?.cashFlow);
            setCellSelected({});
         }
      },
      [refetch, updateDataAndTotals, setCellSelected, expenseTypeDelete, year, entityId, incomeTypeDelete],
   );

   /**
    * Callback when the user creates a new subcategory.
    * @param row The row the subcategory is being added to.
    * @param tableName The table name of the table with the row.
    */
   const handleAddSubcategory = useCallback(
      async (row, tableName) => {
         let useDefaultIncomeExpense = {};
         if (!row.original.hasSubcategories && (row.original.annual.actual > 0 || row.original.annual.expected > 0)) {
            let newUUID = uuid();
            const incomeExpense = row.original;
            const multiData = [];
            for (const monthAbbreviation of DEFAULT_MONTH_ORDER) {
               const monthData = pick(incomeExpense[monthAbbreviation], [
                  'actual',
                  'expected',
                  'noteActual',
                  'noteExpected',
               ]);
               const date = calculateDate(monthAbbreviation, startMonth, year);
               multiData.push({
                  date,
                  ...monthData,
                  entityId,
                  [tableName === INCOME_TABLE ? 'incomeTypeName' : 'expenseTypeName']:
                     incomeExpense?.typeName + ' Totals',
               });
            }
            const variables = {
               id: newUUID,
               parentId: row.original?.typeId,
               name: incomeExpense?.typeName + ' Totals',
               entityId,
               year,
               incomes: tableName === INCOME_TABLE ? multiData : [],
               expenses: tableName === EXPENSES_TABLE ? multiData : [],
            };

            await expenseTypeCreateSubcategory({variables});
            useDefaultIncomeExpense = cloneDeep(row.original);
            useDefaultIncomeExpense.typeName = incomeExpense?.typeName + ' Totals';
         }
         let subcategories = [
            {...cloneDeep(defaultIncomeExpense), entityId, typeId: uuid()},
            ...(row.original.subcategories || []),
         ];
         if (Object.keys(useDefaultIncomeExpense).length > 0) {
            subcategories = [useDefaultIncomeExpense, ...subcategories];
         }

         // The subcategories are required to be in an array.
         setIncomeExpenseTableData(undefined, 'subcategories', [subcategories], tableName, row.original.typeId);

         setRequestExpand({rowId: row.id, tableName: tableName});
      },
      [entityId, expenseTypeCreateUpdate, multiUpdateCashFlow, setIncomeExpenseTableData, startMonth, year],
   );

   // Create the columns for the income table.
   const columns = useMemo(() => {
      let columnIndex = 0;
      const cellDefaults = {
         meta: {
            isFormattedNumber: true,
            format: CURRENCY_FULL_FORMAT,
            minWidth: DEFAULT_COLUMN_WIDTH,
            maxWidth: DEFAULT_COLUMN_WIDTH,
            width: DEFAULT_COLUMN_WIDTH,
            headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
            height: DEFAULT_ROW_HEIGHT,
            tableCellProps: {align: 'right'},
            isEditable: true,
         },
         footer: (info) => {
            const sum = incomeTotals?.[info.column.parent.id]?.[info.column.columnDef.meta.field];
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}
               </div>
            );
         },
      };
      const actualCellDefaults = {
         meta: {
            ...cellDefaults.meta,
            field: actualFieldName,
            bold: true,
            isEditable: true,
         },
         footer: cellDefaults.footer,
      };
      const expectedCellDefaults = {
         meta: {
            ...cellDefaults.meta,
            field: 'expected',
            isEditable: true,
         },
         footer: cellDefaults.footer,
      };

      const columns = [
         {
            header: ' ', // Needed for react-table
            meta: {headerHeight: DEFAULT_HEADER_ROW_HEIGHT},
            columns: [
               {
                  id: CATEGORY_INCOME_COLUMN_ID,
                  header: <TypographyFHG id={'cashFlow.income.column1'} />,
                  accessorKey: 'typeName',
                  cell: (row) => (
                     <CategoryCellV8
                        key={`category cell ${CATEGORY_INCOME_COLUMN_ID}`}
                        {...row}
                        tableName={INCOME_TABLE}
                        disabled={getValue('isLocked')}
                        onDelete={handleDeleteCategory}
                        onChange={handleAddSubcategory}
                     />
                  ),
                  meta: {
                     headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                     style: {align: 'right', whiteSpace: 'pre-wrap'},
                     minWidth: 240,
                     maxWidth: 240,
                     width: 240,
                     height: DEFAULT_ROW_HEIGHT,
                     ___index: columnIndex++,
                     placeholder: 'Add a category',
                     subPlaceholder: 'Add a subcategory',
                     isEditable: true,
                  },
                  footer: 'Total Income',
               },
            ],
         },
      ];

      for (const month of monthOrder) {
         let yearAbbreviation;
         if (MONTH_CONVERT[month] < MONTH_CONVERT[startMonth]) {
            yearAbbreviation = moment(date, MONTH_FORMAT)?.add(1, 'year')?.format('YY');
         } else {
            yearAbbreviation = moment(date, MONTH_FORMAT)?.format('YY');
         }
         columns.push({
            id: month,
            header: <TypographyFHG id={`cashFlow.${month}.column`} values={{yearAbbreviation}} />,
            meta: {
               headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
            },
            getCanSort: () => false,
            columns: [
               {
                  header: <TypographyFHG id={'cashFlow.projected.column'} />,
                  accessorKey: `${month}.expected`,
                  footer: expectedCellDefaults.footer,
                  cell: (data) => (
                     <NoteCellV8
                        key={`${month}.expected`}
                        {...data}
                        tableName={INCOME_TABLE}
                        onChange={getValue('isLocked') ? undefined : handleUpdateNotes}
                     />
                  ),
                  meta: {
                     ___index: columnIndex++,
                     headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                     ...expectedCellDefaults.meta,
                     isEditable: true,
                  },
               },
               {
                  header: <TypographyFHG id={'cashFlow.actual.column'} />,
                  accessorKey: `${month}.${actualFieldName}`,
                  footer: actualCellDefaults.footer,
                  cell: (data) => (
                     <NoteCellV8
                        key={`${month}.${actualFieldName}`}
                        {...data}
                        tableName={INCOME_TABLE}
                        onChange={getValue('isLocked') ? undefined : handleUpdateNotes}
                     />
                  ),
                  meta: {
                     ___index: columnIndex++,
                     ...actualCellDefaults.meta,
                     headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                     isEditable: true,
                  },
               },
            ],
         });
      }

      columns.push({
         id: 'annual',
         header: <TypographyFHG id={`cashFlow.annual.column`} />,
         footer: '',
         meta: {
            headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
         },
         columns: [
            {
               id: 'annual_expected',
               accessorKey: 'annual.expected',
               header: <TypographyFHG id={'cashFlow.projected.column'} />,
               footer: cellDefaults.footer,
               meta: {
                  ...cellDefaults.meta,
                  ___index: columnIndex++,
                  headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                  field: 'expected',
                  isEditable: false,
               },
               cell: (row) => {
                  const renderCell = memoize((value) => {
                     return (
                        <div
                           className={classes.footerStyle}
                           style={{textAlign: 'right', color: value >= 0 ? undefined : theme.palette.error.main}}
                        >
                           {numberFormatter(CURRENCY_FULL_FORMAT, value)}
                        </div>
                     );
                  });
                  return renderCell(row.getValue());
               },
            },
            {
               id: `annual_expectedPercent`,
               header: <TypographyFHG id={'cashFlow.percent.column'} />,
               accessorKey: 'annual.expectedPercent',
               meta: {
                  ...cellDefaults.meta,
                  ___index: columnIndex++,
                  format: PERCENT_FORMAT,
                  headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                  field: 'expected',
                  isEditable: false,
                  minWidth: PERCENT_COLUMN_WIDTH,
                  maxWidth: PERCENT_COLUMN_WIDTH,
                  width: PERCENT_COLUMN_WIDTH,
               },
               cell: (row) => {
                  const sum = row.getValue();
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                        {/*{getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}*/}
                     </div>
                  );
               },
               footer: (
                  <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                     100%
                  </div>
               ),
            },
            {
               id: `annual_actual`,
               header: <TypographyFHG id={'cashFlow.actual.column'} />,
               accessorKey: 'annual.actual',
               footer: cellDefaults.footer,
               meta: {
                  ...cellDefaults.meta,
                  ___index: columnIndex++,
                  headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                  field: actualFieldName,
                  bold: true,
                  isEditable: false,
               },

               cell: (row) => {
                  const sum = row.getValue();
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                        {/*{getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}*/}
                     </div>
                  );
               },
            },
            {
               id: `annual_actualPercent`,
               header: <TypographyFHG id={'cashFlow.percent.column'} />,
               accessorKey: 'annual.actualPercent',
               meta: {
                  ...cellDefaults.meta,
                  ___index: columnIndex++,
                  format: PERCENT_FORMAT,
                  headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                  field: 'actual',
                  isEditable: false,
                  minWidth: PERCENT_COLUMN_WIDTH,
                  maxWidth: PERCENT_COLUMN_WIDTH,
                  width: PERCENT_COLUMN_WIDTH,
               },
               cell: (row) => {
                  const sum = row.getValue();

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}
                     </div>
                  );
               },
               footer: (
                  <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                     100%
                  </div>
               ),
            },
         ],
      });
      return columns;
   }, [
      handleAddSubcategory,
      handleDeleteCategory,
      actualFieldName,
      classes.footerStyle,
      theme.palette.error.main,
      incomeTotals,
      getValue,
      monthOrder,
      search,
      handleUpdateNotes,
   ]);

   /**
    * Submit the expense type changes to the server.
    */
   const submitExpenseType = useCallback(
      async function (expenseTypeId, value, parentId = null, incomeExpense) {
         setCellSelected({});
         const variables = {
            id: expenseTypeId,
            parentId,
            name: value?.length > 0 ? value.trim() : undefined,
            entityId,
            year,
         };

         const {updateData, isNew} = setIncomeExpenseTableData(
            undefined,
            undefined,
            {...cloneDeep(incomeExpense), entityId, typeId: expenseTypeId, typeName: variables.name},
            EXPENSES_TABLE,
            expenseTypeId,
            false,
         );

         // When a new category is added, insert the default new entry item.
         if (isNew) {
            const newDefault = {...cloneDeep(defaultIncomeExpense), entityId, typeId: uuid()};

            // If a top level category, add the default new category at the top level
            if (!parentId) {
               updateData.push(newDefault);
            } else {
               // If a subcategory, add the default new category to the parent subcategories.
               const parentData = findWithSubitem(updateData, 'subcategories', (item) => item.typeId === parentId);
               parentData?.subcategories?.push(newDefault);
            }
         }

         await expenseTypeCreateUpdate({variables});
         await refetch();
         refetchEntityCashFlow();
      },
      [
         setCellSelected,
         entityId,
         year,
         setIncomeExpenseTableData,
         expenseTypeCreateUpdate,
         refetch,
         refetchEntityCashFlow,
      ],
   );

   /**
    * Callback to transfer data from this year to the next year.
    * @type {(function(): Promise<void>)|*}
    */
   const handleTransferNext = useCallback(async () => {
      await cashFlowCarryOver({
         variables: {year: year, entityId},
         refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
      });
   }, [cashFlowCarryOver, year, entityId]);

   // Create the columns for the expense table.
   const expenseColumns = useMemo(() => {
      let columnIndex = 0;

      const cellDefaults = {
         meta: {
            isFormattedNumber: true,
            format: CURRENCY_FULL_FORMAT,
            minWidth: DEFAULT_COLUMN_WIDTH,
            maxWidth: DEFAULT_COLUMN_WIDTH,
            width: DEFAULT_COLUMN_WIDTH,
            headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
            height: DEFAULT_ROW_HEIGHT,
            tableCellProps: {align: 'right'},
            isEditable: true,
         },
         footer: (info) => {
            // Only calculate total visits if rows change
            const sum = expenseTotals?.[info.column.parent.id]?.[info.column.columnDef.meta.field];
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}
               </div>
            );
         },
         footer2: (info) => {
            const sum =
               incomeTotals[info.column.parent.id]?.[info.column.columnDef.meta.field] -
               expenseTotals?.[info.column.parent.id]?.[info.column.columnDef.meta.field];

            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                  {/*{getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}*/}
               </div>
            );
         },
         footer3: (info) => {
            const sum = Math.max(operatingLoanBalance[info.column.columnDef.meta.___index], 0);
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum > 0 ? theme.palette.error.main : undefined}}
               >
                  {getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}
               </div>
            );
         },
         footer4: (info) => {
            let sum = operatingLoanBalance[info.column.columnDef.meta.___index];
            if (sum < 0) {
               sum = -sum;
               return (
                  <div className={classes.footerStyle} style={{textAlign: 'right'}}>
                     {getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}
                  </div>
               );
            }
            return null;
         },
      };

      const columns = [
         {
            header: ' ', // Needed for react-table
            meta: {headerHeight: DEFAULT_HEADER_ROW_HEIGHT},
            columns: [
               {
                  id: CATEGORY_EXPENSE_COLUMN_ID,
                  header: <TypographyFHG id={'cashFlow.expense.column'} />,
                  accessorKey: 'typeName',
                  meta: {
                     headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                     style: {align: 'right', whiteSpace: 'pre-wrap'},
                     minWidth: 240,
                     maxWidth: 240,
                     width: 240,
                     height: DEFAULT_ROW_HEIGHT,
                     ___index: columnIndex++,
                     placeholder: 'Add a category',
                     subPlaceholder: 'Add a subcategory',
                     isEditable: true,
                  },
                  cell: (row) => (
                     <CategoryCellV8
                        key={`category cell ${CATEGORY_EXPENSE_COLUMN_ID}`}
                        {...row}
                        tableName={EXPENSES_TABLE}
                        disabled={getValue('isLocked')}
                        onDelete={handleDeleteCategory}
                        onChange={handleAddSubcategory}
                     />
                  ),

                  footer: 'Total Expense',
                  footer2: 'Net Cash Flow',
                  footer3: 'Operating Loan Balance',
                  footer4: 'Cash Account Balance',
               },
            ],
         },
      ];

      for (const month of monthOrder) {
         let yearAbbreviation;
         if (MONTH_CONVERT[month] < MONTH_CONVERT[startMonth]) {
            yearAbbreviation = moment(date, MONTH_FORMAT)?.add(1, 'year')?.format('YY');
         } else {
            yearAbbreviation = moment(date, MONTH_FORMAT)?.format('YY');
         }
         columns.push({
            id: month,
            header: <TypographyFHG id={`cashFlow.${month}.column`} values={{yearAbbreviation}} />,
            footer: '',
            getCanSort: () => false,
            meta: {
               headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
            },
            columns: [
               {
                  header: <TypographyFHG id={'cashFlow.projected.column'} />,
                  accessorKey: `${month}.expected`,
                  footer: cellDefaults.footer,
                  footer2: cellDefaults.footer2,
                  footer3: cellDefaults.footer3,
                  footer4: cellDefaults.footer4,
                  cell: (data) => (
                     <NoteCellV8
                        key={`${month}.expected`}
                        {...data}
                        tableName={EXPENSES_TABLE}
                        onChange={getValue('isLocked') ? undefined : handleUpdateNotes}
                     />
                  ),
                  meta: {
                     ___index: columnIndex++,
                     headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                     field: 'expected',
                     ...cellDefaults.meta,
                     isEditable: true,
                  },
               },
               {
                  header: <TypographyFHG id={'cashFlow.actual.column'} />,
                  accessorKey: `${month}.${actualFieldName}`,
                  footer: cellDefaults.footer,
                  footer2: cellDefaults.footer2,
                  footer3: cellDefaults.footer3,
                  footer4: cellDefaults.footer4,
                  cell: (data) => (
                     <NoteCellV8
                        key={`${month}.${actualFieldName}`}
                        {...data}
                        tableName={EXPENSES_TABLE}
                        onChange={getValue('isLocked') ? undefined : handleUpdateNotes}
                     />
                  ),
                  meta: {
                     ...cellDefaults.meta,
                     ___index: columnIndex++,
                     headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                     field: actualFieldName,
                     bold: true,
                     isEditable: true,
                  },
               },
            ],
         });
      }
      columns.push({
         id: 'annual',
         header: <TypographyFHG id={`cashFlow.annual.column`} />,
         footer: '',
         meta: {
            headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
         },
         columns: [
            {
               id: 'annual_expected',
               header: <TypographyFHG id={'cashFlow.projected.column'} />,
               accessorKey: 'annual.expected',
               meta: {
                  ...cellDefaults.meta,
                  ___index: columnIndex++,
                  headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                  field: 'expected',
                  isEditable: false,
               },
               footer2: cellDefaults.footer2,
               footer3: '  ',
               footer4: '  ',
               cell: (row) => {
                  const value = row.getValue();

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: value >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, value), value, search)}
                     </div>
                  );
               },
               footer: cellDefaults.footer,
            },
            {
               id: `annual_expectedPercent`,
               header: <TypographyFHG id={'cashFlow.percent.column'} />,
               accessorKey: 'annual.expectedPercent',
               meta: {
                  ___index: columnIndex++,
                  field: 'expectedPercent',
                  isEditable: false,
                  ...cellDefaults,
                  minWidth: PERCENT_COLUMN_WIDTH,
                  maxWidth: PERCENT_COLUMN_WIDTH,
                  width: PERCENT_COLUMN_WIDTH,
                  style: {overflow: 'hidden'},
               },
               footer: (info) => {
                  const sum = sumAnnualPercentColumnMemoized(info?.table.getCenterRows(), info?.column.id);
                  expenseTotals[info.column.id] = sum;
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{width: 60, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right'}}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                        {/*{getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}*/}
                     </div>
                  );
               },
               footer2: () => {
                  // Income annual projected percent will always be 100% - projected expense %.
                  const sum = 100 - expenseTotals['annual_expectedPercent'];
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{
                           width: 60,
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           textAlign: 'right',
                           color: sum >= 0 ? undefined : theme.palette.error.main,
                        }}
                     >
                        {getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}
                     </div>
                  );
               },
               footer3: '  ',
               footer4: '  ',
               cell: (row) => {
                  const sum = row.getValue();
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{
                           width: 60,
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           textAlign: 'right',
                           color: sum >= 0 ? undefined : theme.palette.error.main,
                        }}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                        {/*{getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}*/}
                     </div>
                  );
               },
               // cell: (row) => {
               //    let sum = sumAnnualRow('expected', row);
               //    const totalIncome = incomeTotals?.['annual.expected'];
               //    sum = totalIncome > 0 ? (sum / totalIncome) * 100 : 0;
               //
               //    return (
               //       <div
               //          className={classes.footerStyle}
               //          style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               //       >
               //          {getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}
               //       </div>
               //    );
               // },
            },
            {
               id: `annual_actual`,
               header: <TypographyFHG id={'cashFlow.actual.column'} />,
               accessorKey: 'annual.' + actualFieldName,
               meta: {
                  ___index: columnIndex++,
                  field: actualFieldName,
                  bold: true,
                  isEditable: false,
                  ...cellDefaults.meta,
               },
               footer: cellDefaults.footer,
               footer2: cellDefaults.footer2,
               footer3: '  ',
               footer4: '  ',
               cell: (row) => {
                  const sum = row.getValue();

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                        {/*{getMarkedWholeCell(numberFormatter(CURRENCY_FULL_FORMAT, sum), sum, search)}*/}
                     </div>
                  );
               },
            },
            {
               id: `annual_actualPercent`,
               header: <TypographyFHG id={'cashFlow.percent.column'} />,
               accessorKey: 'annual.actualPercent',
               meta: {
                  ...cellDefaults.meta,
                  ___index: columnIndex++,
                  headerHeight: DEFAULT_HEADER_ROW_HEIGHT,
                  field: 'actualPercent',
                  bold: true,
                  isEditable: false,
                  minWidth: PERCENT_COLUMN_WIDTH,
                  maxWidth: PERCENT_COLUMN_WIDTH,
                  width: PERCENT_COLUMN_WIDTH,
                  style: {overflow: 'hidden'},
               },

               footer: (info) => {
                  const sum = sumAnnualPercentColumnMemoized(info.table.getCenterRows(), info.column.id);
                  expenseTotals[info.column.id] = sum;
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{
                           width: 60,
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           textAlign: 'right',
                           color: sum >= 0 ? undefined : theme.palette.error.main,
                        }}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                     </div>
                  );
               },
               footer2: () => {
                  // Income annual actual percent will always be 100% - actual expense %.
                  const sum = 100 - expenseTotals['annual_actualPercent'];
                  return (
                     <div
                        className={classes.footerStyle}
                        style={{
                           width: 60,
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           textAlign: 'right',
                           color: sum >= 0 ? undefined : theme.palette.error.main,
                        }}
                     >
                        {numberFormatter(PERCENT_FORMAT, sum)}
                        {/*{getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}*/}
                     </div>
                  );
               },
               footer3: '  ',
               footer4: '  ',
               cell: (row) => {
                  const sum = row.getValue();

                  return (
                     <div
                        className={classes.footerStyle}
                        style={{
                           width: 60,
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           textAlign: 'right',
                           color: sum >= 0 ? undefined : theme.palette.error.main,
                        }}
                     >
                        {getMarkedWholeCell(numberFormatter(PERCENT_FORMAT, sum), sum, search)}
                     </div>
                  );
               },
            },
         ],
      });
      return columns;
   }, [
      handleDeleteCategory,
      actualFieldName,
      expenseTotals,
      classes.footerStyle,
      theme.palette.error.main,
      search,
      incomeTotals,
      operatingLoanBalance,
      monthOrder,
      getValue,
      handleAddSubcategory,
      handleUpdateNotes,
   ]);

   /**
    * Cleanup the listener when this component is removed. This is needed because of a bug in react. Should be able to
    * do this from UseEffect.
    */
   useLayoutEffect(() => {
      return () => {
         setTitleStatus((status) => ({
            ...status,
            helpKey: undefined,
            videoId: undefined,
         }));
      };
   }, [cellSelected, setCellSelected, setTitleStatus]);

   const [isEditCarryOver, setIsEditCarryOver] = useState(false);

   const handleAddNoteCarryover = () => {
      setIsEditCarryOver(true);
   };

   /**
    * When a cell is selected set the selected location and turn on cell editing.
    * @param isExpense Indicates if the cell is in the expense or the income table.
    * @return {(function(*, *, *, *, *): void)|*}
    */
   const handleSelectCell = useCallback(
      (index, cellKey, rowIndex, columnIndex, cell) => {
         if (cell?.row?.original?.typeName === undefined && columnIndex !== CATEGORY_COLUMN_INDEX) {
            setCellSelected({});
         }
      },
      [setCellSelected],
   );

   /**
    * Submit the user.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (changes, year, currentValues) => {
         const variables = {...changes, year};
         if (changes?.isCashOnly !== undefined) {
            if (changes?.isCashOnly === 'cash') {
               variables.isCashOnly = true;
               variables.actualOperatingLoanBalance = -Math.abs(currentValues?.actualOperatingLoanBalance);
            } else {
               variables.isCashOnly = false;
               variables.actualOperatingLoanBalance = Math.abs(currentValues?.actualOperatingLoanBalance);
            }
         } else if (changes?.actualOperatingLoanBalance !== undefined) {
            if (currentValues.isCashOnly === true) {
               variables.actualOperatingLoanBalance = -Math.abs(changes?.actualOperatingLoanBalance);
            } else {
               variables.actualOperatingLoanBalance = Math.abs(changes?.actualOperatingLoanBalance);
            }
         }
         if (variables?.id) {
            await entityCashFlowCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  entityCashFlow: {
                     __typename: 'EntityCashFlow',
                     ...getInitialCashFlow(year),
                     ...currentValues,
                     isDeleted: false,
                  },
               },
               refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
            });
         } else {
            console.log('entityCashFlowCreateUpdate is called with bad variables', variables);
            console.trace();
         }
      },
      [entityCashFlowCreateUpdate, entityId],
   );

   /**
    * Submit the user.
    * @return {Promise<void>}
    */
   const handleSubmitNote = useCallback(async () => {
      await entityCashFlowCreateUpdate({
         variables: {
            carryoverIncomeNote: getValueNoteCarryover('carryoverIncomeNote'),
            entityId,
            id: defaultCashFlowValues?.id,
            year,
         },
         optimisticResponse: {
            __typename: 'Mutation',
            entityCashFlow: {
               __typename: 'EntityCashFlow',
               ...getInitialCashFlow(year),
               ...defaultCashFlowValues,
               ...editCashFlowValues,
               carryoverIncomeNote: getValueNoteCarryover('carryoverIncomeNote'),
               isDeleted: false,
            },
         },
         refetchQueries: getEntityCashFlowRefetchQueries(entityId, year),
      });
   }, [entityCashFlowCreateUpdate, getValueNoteCarryover, year, defaultCashFlowValues, editCashFlowValues, entityId]);

   const handleSubmitDebounced = useRef(debounce(handleSubmit, 1000)).current;

   const [noteForCarryOver, setNoteForCarryOver] = useState(false);

   const handleBlurEditCarryOver = (event) => {
      if (carryOverAddNoteButton.current !== event.relatedTarget) {
         setNoteForCarryOver(false);
         handleSubmitDebounced.flush();
      }
   };

   const handleFocusEditCarryOver = () => {
      setNoteForCarryOver(true);
      handleFocusEdit();
   };

   const handleFocusEdit = () => {
      setCellSelected({});
   };

   const updateIncomeType = useCallback(
      (id, value, row, parentTypeId) => {
         if (
            value !== 'Add a category' &&
            (parentTypeId || trim(value)) &&
            row?.original?.typeName !== value &&
            (!row?.original?.id || row?.original?.entityId)
         ) {
            const rows = [];
            incomeTotals[id] = sumBy(rows, 'id');

            setCellSelected({});
            const variables = {
               id: row?.original?.typeId,
               parentId: parentTypeId,
               name: value?.length > 0 ? value.trim() : undefined,
               entityId,
               year,
            };

            const {updateData, isNew} = setIncomeExpenseTableData(
               undefined,
               undefined,
               {...cloneDeep(defaultIncomeExpense), entityId, typeId: variables.id, typeName: variables.name},
               INCOME_TABLE,
               variables.id,
               false,
            );

            // When a new category is added, insert the default new entry item.
            if (isNew) {
               const newDefault = {...cloneDeep(defaultIncomeExpense), entityId, typeId: uuid()};

               // If a top level category, add the default new category at the top level
               if (!parentTypeId) {
                  updateData.push(newDefault);
               } else {
                  // If a subcategory, add the default new category to the parent subcategories.
                  const parentData = findWithSubitem(
                     updateData,
                     'subcategories',
                     (item) => item.typeId === parentTypeId,
                  );
                  parentData?.subcategories?.push(newDefault);
               }
            }

            try {
               (async () => {
                  await incomeTypeCreateUpdate({variables});
                  await refetch();
                  refetchEntityCashFlow();
               })();
            } catch (e) {
               console.error(e);
            }
         }
      },
      [
         incomeTotals,
         setCellSelected,
         entityId,
         year,
         setIncomeExpenseTableData,
         incomeTypeCreateUpdate,
         refetch,
         refetchEntityCashFlow,
      ],
   );

   const updateParent = useCallback(
      (month, fieldName, row, data, tableName) => {
         const parentRow = row.getParentRow();
         if (parentRow) {
            const parentRecord = find(data, {typeId: parentRow.original?.typeId});

            if (parentRecord.hasSubcategories) {
               const sum = sumBy(parentRecord.subcategories, `${month}.${fieldName}`);
               setIncomeExpenseTableData(month, fieldName, sum, tableName, parentRecord.typeId, true, data);
            }
         }
      },
      [setIncomeExpenseTableData],
   );

   const updateIncome = useCallback(
      (value = 0, row, recordField, fieldId) => {
         const item = get(row.original, recordField);

         if (+value === item[fieldId]) return;

         if (recordField && fieldId && item) {
            const variables = {
               entityId,
               date: calculateDate(recordField, startMonth, year),
               [fieldId]: +value,
            };

            const useValue = +value;
            if (item[fieldId] !== useValue) {
               const {updateData} = setIncomeExpenseTableData(
                  recordField,
                  fieldId,
                  useValue,
                  INCOME_TABLE,
                  row?.original.typeId,
                  true,
               );
               updateParent(recordField, fieldId, row, updateData, INCOME_TABLE);
               variables.incomeTypeId = row?.original?.typeId;

               incomeCreateUpdate({variables, fetchPolicy: 'no-cache'});
               // setRefreshIncome(Date.now());
            }
         }
      },
      [entityId, year, startMonth, incomeCreateUpdate, setIncomeExpenseTableData, updateParent],
      //      // [entityId, incomeCreateUpdate, startMonth, year, setIncomeExpense],
   );

   /**
    * When a cell is updated, submit the changes to the server.
    * @param index - unused
    * @param id The ID of the column
    * @param value The updated value.
    * @param original The original income or expense.
    * @return {Promise<void>} For the server submit.
    */
   const handleUpdateIncome = useCallback(
      async (index, id, value, row, parentId, fieldId, parentTypeId) => {
         // check if exist in stack then push
         if (id === CATEGORY_INCOME_COLUMN_ID) {
            updateIncomeType(id, value, row, parentTypeId);
         } else if (value !== row?.original?.[parentId]?.[fieldId]) {
            updateIncome(value, row, parentId, fieldId);
         }
      },
      [updateIncomeType, updateIncome],
   );

   /**
    * When a cell is updated, submit the changes to the server.
    * @param index - unused
    * @param id The ID of the column
    * @param value The updated value.
    * @param original The original income or expense.
    * @return {Promise<void>} For the server submit.
    */
   const handleUpdateExpenses = useCallback(
      async (index, id, value, row, parentId, fieldId, parentTypeId) => {
         if (id === CATEGORY_EXPENSE_COLUMN_ID) {
            if (
               value !== 'Add a category' &&
               trim(value) &&
               row?.original?.typeName !== value &&
               (!row?.original?.id || row?.original?.entityId)
            ) {
               await submitExpenseType(row?.original?.typeId, value, parentTypeId, row?.original);
            }
         } else if (value !== row?.original?.[parentId]?.[fieldId]) {
            let recordField = parentId;
            let field = fieldId;
            if (!recordField && id?.includes?.('.')) {
               [recordField, field] = id?.split('.');
            }

            const item = row?.original?.[recordField];

            if (value === item?.[field]) return;

            if (recordField && field && item) {
               const variables = {
                  entityId,
                  date: calculateDate(recordField, startMonth, year),
                  [field]: +value || 0,
               };

               const useValue = +value || 0;
               if (item[field] !== useValue) {
                  const {updateData} = setIncomeExpenseTableData(
                     recordField,
                     field,
                     useValue,
                     EXPENSES_TABLE,
                     row?.original.typeId,
                     true,
                  );
                  updateParent(recordField, field, row, updateData, EXPENSES_TABLE);

                  variables.expenseTypeId = row?.original?.typeId;

                  expenseCreateUpdate({variables, fetchPolicy: 'no-cache'});
               }
            }
         }
      },
      [entityId, expenseCreateUpdate, submitExpenseType, year, startMonth, setIncomeExpenseTableData, updateParent],
   );

   /**
    * Get the subrows for the table from the cashflow subcategories.
    * @param original
    * @return {[]|*[]}
    */
   const getSubRows = (original) => {
      return original.hasSubcategories ? original.subcategories : [];
   };

   /**
    * Callback when a row is expanded. When requesting a row expand, the cell needs to be selected.
    * @param state The expand state from the table.
    * @param row The row that was expanded.
    * @param table The table with the row being expanded.
    * @param The name of the table.
    */
   const handleRowExpanded = useCallback(
      (state, row, table, name) => {
         if (requestExpand && row?.subRows?.length > 0) {
            const subRow = row?.subRows[0];

            setCellSelected({
               tableName: name,
               rowId: subRow?.id,
               columnIndex: CATEGORY_COLUMN_INDEX,
               cellId: subRow.getVisibleCells()[0]?.id,
               isRow: false,
               isColumn: false,
               original: subRow?.original,
            });
         }
         if (state && typeof state === 'function') {
            if (name === INCOME_TABLE) {
               setExpandedIncome(state);
            } else {
               setExpandedExpense(state);
            }
         }
      },
      [requestExpand, setCellSelected],
   );

   /**
    * Callback for each cell in a row being pasted.
    * @param pasteIndex The index of the pasted rows.
    * When 0 the accumulatedPasteData should be initialized.
    * @param column The column of the current cell being pasted.
    * @param row The row of the current cell being pasted.
    * @param pastedRowText The text being pasted into the cell.
    * @param accumulatedPasteData The data that is accumulated from the paste.
    * @param columnIndex The index of the column.
    * @param tableName The name of the table being pasted into.
    */
   const handlePasteRow = useCallback(
      (pasteIndex, column, row, pastedRowText, accumulatedPasteData, isLastIndex, columnIndex, tableName) => {
         if (pasteIndex === 0) {
            accumulatedPasteData.multiItemList = [];
            accumulatedPasteData.incomeExpenseData = undefined;
         }

         const month = column.parent.id;
         const date = calculateDate(month, startMonth, year);
         if (date) {
            let fieldName = column?.columnDef?.meta?.field;
            const typeNameType = tableName === INCOME_TABLE ? 'incomeTypeName' : 'expenseTypeName';

            const {updateData} = setIncomeExpenseTableData(
               month,
               fieldName,
               pastedRowText,
               tableName,
               row.original.typeId,
               isLastIndex,
               accumulatedPasteData.incomeExpenseData,
            );
            accumulatedPasteData.incomeExpenseData = updateData;
            accumulatedPasteData.multiItemList[pasteIndex] = {
               date,
               entityId: entityIdRef.current,
               [fieldName]: pastedRowText,
               [typeNameType]: row.original?.typeName,
            };
         }

         if (isLastIndex) {
            multiUpdateCashFlow({
               variables: {
                  incomes: tableName === INCOME_TABLE ? accumulatedPasteData.multiItemList : [],
                  expenses: tableName === EXPENSES_TABLE ? accumulatedPasteData.multiItemList : [],
               },
            });
         }
      },
      [multiUpdateCashFlow, setIncomeExpenseTableData, startMonth, year],
   );

   /**
    * Callback for each cell in a column being pasted.
    * @param pasteIndex The index of the pasted rows.
    * When 0 the accumulatedPasteData should be initialized.
    * @param column The column of the current cell being pasted.
    * @param row The row of the current cell being pasted.
    * @param pastedRowText The text being pasted into the cell.
    * @param accumulatedPasteData The data that is accumulated from the paste.
    * @param columnIndex The index of the column.
    * @param tableName The name of the table being pasted into.
    */
   const handlePasteColumn = useCallback(
      (pasteIndex, column, row, pastedRowText, accumulatedPasteData, isLastIndex, columnIndex, tableName) => {
         if (pasteIndex === 0) {
            accumulatedPasteData.multiItemList = [];
            accumulatedPasteData.incomeExpenseData = undefined;
         }
         const month = monthOrder[Math.floor((columnIndex - 1) / 2)];
         const date = calculateDate(month, startMonth, year);
         let fieldName = column?.columnDef?.meta?.field;
         const typeNameType = tableName === INCOME_TABLE ? 'incomeTypeName' : 'expenseTypeName';

         const {updateData} = setIncomeExpenseTableData(
            month,
            fieldName,
            pastedRowText,
            tableName,
            row.original?.typeId,
            isLastIndex,
            accumulatedPasteData.incomeExpenseData,
         );
         accumulatedPasteData.incomeExpenseData = updateData;

         accumulatedPasteData.multiItemList[pasteIndex] = {
            date,
            entityId: entityIdRef.current,
            [fieldName]: pastedRowText,
            [typeNameType]: row.original?.typeName,
         };
         if (isLastIndex) {
            (async () => {
               await multiUpdateCashFlow({
                  variables: {
                     incomes: tableName === INCOME_TABLE ? accumulatedPasteData.multiItemList : [],
                     expenses: tableName === EXPENSES_TABLE ? accumulatedPasteData.multiItemList : [],
                  },
               });
               // await refetch();
            })();
         }
      },
      [monthOrder, startMonth, year, setIncomeExpenseTableData, multiUpdateCashFlow],
   );

   /**
    * Callback when a table cell is double clicked.
    * @param event the click event.
    * @param row the row of the cell.
    * @param cell the cell clicked.
    * @param tableName the name of the table of the cell.
    */
   const handleDoubleClickCell = useCallback(
      (event, row, cell, tableName) => {
         if (cell.column.id === 'income' || cell.column.id === 'expense') {
            if (!row.getCanExpand()) {
               setCellSelected((selected) => ({
                  tableName,
                  rowId: row.id,
                  columnIndex: undefined,
                  cellId: cell?.id,
                  isEditing: false,
                  isColumn: false,
                  isRow: true,
                  original: row?.original,
               }));
            } else {
               row?.toggleExpanded(!row?.getIsExpanded());
            }
         }
      },
      [setCellSelected],
   );

   const ExpenseTable = useMemo(
      () => (
         <TableV8FHG
            hiddenColumns={HIDDEN_COLUMNS[option]}
            key={'ExpenseTable'}
            className={`${classes.tableStyle} ${option < 3 ? 'singleColumnMonth' : ''}`}
            name={EXPENSES_TABLE}
            columns={expenseColumns}
            isSortable={false}
            hasPinning={false}
            pinnedColumns={{
               left: isSmallWidth ? [CATEGORY_EXPENSE_COLUMN_ID] : [],
               right: isLargeWidth
                  ? ['annual_expected', 'annual_expectedPercent', 'annual_actual', 'annual_actualPercent']
                  : [],
            }}
            data={expenseData}
            allowSearch={true}
            searchFilter={search}
            emptyTableMessageKey={entityId !== 'undefined' ? 'cashflow.na.label' : 'cashflow.noEntity.label'}
            stickyHeader={true}
            stickyLeftColumn={true}
            updateData={getValue('isLocked') ? undefined : handleUpdateExpenses}
            classes={{
               root: classes.tableRoot,
               tableHeadRoot: classes.tableHeadRoot,
               cellStyle: classes.cellStyle,
               stickyFrame: classes.stickyFrame,
            }}
            allowCellSelection={true}
            hasBorder
            onSelect={handleSelectCell}
            getSubRows={getSubRows}
            expandRow={requestExpand?.tableName === EXPENSES_TABLE ? requestExpand?.rowId : undefined}
            expanded={expandedExpense}
            onRowExpanded={handleRowExpanded}
            onPasteRow={handlePasteRow}
            onPasteColumn={handlePasteColumn}
            onDoubleClick={handleDoubleClickCell}
         />
      ),
      [
         expandedExpense,
         expenseData,
         option,
         classes.tableStyle,
         classes.tableRoot,
         classes.tableHeadRoot,
         classes.cellStyle,
         classes.stickyFrame,
         expenseColumns,
         isSmallWidth,
         isLargeWidth,
         search,
         entityId,
         getValue,
         handleUpdateExpenses,
         handleSelectCell,
         handleRowExpanded,
         handlePasteRow,
         handlePasteColumn,
         handleDoubleClickCell,
         requestExpand?.rowId,
         requestExpand?.tableName,
      ],
   );

   const IncomeTable = useMemo(
      () => (
         <TableV8FHG
            hiddenColumns={HIDDEN_COLUMNS[option]}
            key={'IncomeTable'}
            className={`${classes.tableStyle} ${option < 3 ? 'singleColumnMonth' : ''}`}
            name={INCOME_TABLE}
            columns={columns}
            isSortable={false}
            hasPinning={false}
            pinnedColumns={{
               left: isSmallWidth ? [CATEGORY_INCOME_COLUMN_ID] : [],
               right: isLargeWidth
                  ? ['annual_expected', 'annual_expectedPercent', 'annual_actual', 'annual_actualPercent']
                  : [],
            }}
            data={incomeData}
            allowSearch={true}
            searchFilter={search}
            emptyTableMessageKey={entityId !== 'undefined' ? 'cashflow.na.label' : 'cashflow.noEntity.label'}
            stickyHeader={true}
            stickyLeftColumn={true}
            updateData={getValue('isLocked') ? undefined : handleUpdateIncome}
            classes={{
               root: classes.tableRoot,
               tableHeadRoot: classes.tableHeadRoot,
               cellStyle: classes.cellStyle,
               stickyFrame: classes.stickyFrame,
            }}
            allowCellSelection={true}
            hasBorder
            onSelect={handleSelectCell}
            getSubRows={getSubRows}
            expandRow={requestExpand?.tableName === INCOME_TABLE ? requestExpand?.rowId : undefined}
            expanded={expandedIncome}
            onRowExpanded={handleRowExpanded}
            onPasteRow={handlePasteRow}
            onPasteColumn={handlePasteColumn}
            onDoubleClick={handleDoubleClickCell}
         />
      ),
      [
         expandedIncome,
         incomeData,
         requestExpand?.tableName,
         requestExpand?.rowId,
         columns,
         isSmallWidth,
         isLargeWidth,
         search,
         entityId,
         getValue,
         handleUpdateIncome,
         handleSelectCell,
         handleRowExpanded,
         option,
         classes.tableStyle,
         classes.tableRoot,
         classes.tableHeadRoot,
         classes.cellStyle,
         classes.stickyFrame,
         handlePasteColumn,
         handlePasteRow,
         handleDoubleClickCell,
      ],
   );

   const handleClose = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setIsEditCarryOver(false);
      setNoteForCarryOver(false);
   };

   const handleKeydown = (event) => {
      if (event?.key === 'Escape') {
         handleClose(event);
      }
   };

   const handleSaveCarryover = async () => {
      // handle save note
      handleSubmitNote();
      setIsEditCarryOver(false);
      setNoteForCarryOver(false);
   };

   const handlePopoverClose = () => {
      setIsEditCarryOver(false);
      setNoteForCarryOver(false);
   };

   return (
      <>
         <Stack
            name='Cashflow Component'
            width={'100%'}
            height={'100%'}
            direction={'column'}
            flexWrap={'nowrap'}
            display={'flex'}
            overflow={'hidden'}
         >
            <Stack
               name='TitleFrame'
               className='title-page-margin'
               spacing={4}
               direction={'row'}
               alignItems={'center'}
               justifyContent={'space-between'}
               flex={'0 0'}
            >
               <Stack name='TitleFrame' direction={'row'} alignItems={'center'} flex={'0 0'} minWidth={'max-content'}>
                  <DrawerMenuButton />
                  <TypographyFHG
                     className='title-page'
                     variant='h4'
                     component={'span'}
                     id={'cashFlow.title'}
                     values={{year}}
                     style={{
                        fontWeight: '600',
                        color: theme.palette.text.primary,
                     }}
                  />
                  <VideoHelpButton videoId={null} />
               </Stack>
               <Stack direction={'row'} flexWrap={'nowrap'}>
                  <AdminAccess>
                     <FormControlLabel
                        key={'taxLock' + defaultCashFlowValues.id}
                        control={
                           <Switch
                              checked={getCashFlowValue('taxLock') || false}
                              onChange={handleCashFlowChange}
                              name='taxLock'
                              color='primary'
                              disabled={entityIdList?.length > 1}
                           />
                        }
                        label={formatMessage(intl, 'cashFlow.taxLocked.label')}
                        sx={{
                           color: 'text.primary',
                        }}
                     />
                  </AdminAccess>
                  <Box sx={{ml: 'auto', mr: 3, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                     {buttonPanel}
                     <Box width='18px' />
                     <ExportChoiceButton selectedIndex={CASH_FLOW_INDEX} />
                  </Box>
               </Stack>
            </Stack>

            <Stack name='Overview' direction={'row'} spacing={3} flex={'0 0'}>
               <OverviewPanel
                  horizontal
                  titleKey={'cashFlow.actualYTD.label'}
                  titleKey2={'cashFlow.projectedYTD.label'}
                  value={incomeTotals?.annual?.actual - expenseTotals?.annual?.actual}
                  value2={incomeTotals?.annual?.expected - expenseTotals?.annual?.expected}
               />
               <OverviewPanel
                  horizontal
                  key={
                     'OverviewPanel ' +
                     operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE] +
                     ' ' +
                     operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE]
                  }
                  titleKey={'cashFlow.yearEndActualBalance.label'}
                  value={Math.max(operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE], 0)}
                  titleKey2={'cashFlow.projectedOperatingBalance.label'}
                  value2={Math.max(operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE], 0)}
               />
               {(currentCashValues?.isCashOnly ||
                  operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE] < 0 ||
                  operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE] < 0) && (
                  <OverviewPanel
                     horizontal
                     key={
                        'Cash Only OverviewPanel ' +
                        operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE] +
                        ' ' +
                        operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE]
                     }
                     titleKey={'cashFlow.yearEndCashBalance.label'}
                     value={Math.abs(Math.min(operatingLoanBalance[DECEMBER_ACTUAL_OPERATING_BALANCE], 0))}
                     titleKey2={'cashFlow.projectedCashBalance.label'}
                     value2={Math.abs(Math.min(operatingLoanBalance[DECEMBER_PROJECTED_OPERATING_BALANCE], 0))}
                  />
               )}
            </Stack>
            {!clientId || !(incomeData?.length > 0) || !(expenseData?.length > 0) ? (
               <Empty
                  titleMessageKey={'empty.noInfo.message'}
                  messageKey={
                     !clientId
                        ? !entityId
                           ? 'empty.selectClientAndEntity.message'
                           : 'empty.selectClient.message'
                        : !entityId
                          ? 'empty.selectEntity.message'
                          : undefined
                  }
                  sx={{mt: 4}}
               />
            ) : (
               <Stack
                  name={'cash flow root'}
                  direction={'column'}
                  wrap={'nowrap'}
                  height={'100%'}
                  width={'100%'}
                  sx={{mt: 2}}
                  overflow={'hidden'}
               >
                  <Form
                     onSubmit={() => handleSubmit(editCashFlowValues, year, currentCashValues)}
                     className={classes.formStyle}
                  >
                     {!isLoading && (
                        <Stack direction={'column'} flexWrap={'wrap'}>
                           <RadioGroup
                              name='isCashOnly'
                              row
                              defaultValue={currentCashValues?.isCashOnly ? 'cash' : 'credit'}
                              onChange={handleCashFlowChange}
                              sx={{flex: '0 0 auto', alignItems: 'center', pl: 1.5, overflow: 'hidden'}}
                           >
                              <TypographyFHG
                                 id={'cashFlow.cashOrCredit.label'}
                                 variant={'fs16700'}
                                 color='text.primary'
                              />
                              <FormControlLabel
                                 classes={{
                                    label: classes.radioLabel,
                                 }}
                                 value={'cash'}
                                 sx={{ml: 2, mr: 0.5}}
                                 control={<Radio color='primary' size='small' />}
                                 label={'Cash'}
                              />
                              <FormControlLabel
                                 classes={{
                                    label: classes.radioLabel,
                                 }}
                                 value={'credit'}
                                 sx={{ml: 1, mr: 0.5}}
                                 control={<Radio color='primary' size='small' />}
                                 label={'Operating Loan'}
                              />
                           </RadioGroup>

                           <Stack
                              justifyContent={'space-between'}
                              direction={'row'}
                              alignItems={'center'}
                              style={{marginBottom: 6}}
                              flexWrap={'wrap'}
                           >
                              <Stack name='editRow' flexDirection={'row'}>
                                 <TextFieldLF
                                    key={'actualOperatingLoanBalance' + entityId}
                                    name={'actualOperatingLoanBalance'}
                                    isFormattedNumber={true}
                                    sx={{ml: 0.25, mr: 1, width: 186}}
                                    labelKey={
                                       currentCashValues?.isCashOnly === 'cash' ||
                                       currentCashValues?.isCashOnly === true
                                          ? 'cashFlow.cashBeginBalance.label'
                                          : 'cashFlow.actualBeginBalance.label'
                                    }
                                    onChange={handleCashFlowChange}
                                    value={getCashFlowValue('actualOperatingLoanBalance')}
                                    disabled={getValue('isLocked')}
                                    inputProps={{
                                       prefix: '$',
                                       isAllowed: (values) => {
                                          const {floatValue} = values;
                                          return !(floatValue < 0);
                                       },
                                       style: {
                                          color: theme.palette.text.primary,
                                       },
                                    }}
                                    fullWidth={false}
                                    onFocus={handleFocusEdit}
                                    onBlur={handleSubmitDebounced.flush}
                                    placeholder={'$100,000'}
                                    InputProps={{
                                       endAdornment: (
                                          <InputAdornment position='end' className={classes.inputAdornmentStyle}>
                                             <InfoVideoPopup
                                                labelKey={'cashFlow.actualLOC.help'}
                                                videoId={'kvooi0oe1v'}
                                             />
                                          </InputAdornment>
                                       ),
                                    }}
                                    classes={classes}
                                 />
                                 <TextFieldLF
                                    key={'operatingLoanLimit' + entityId}
                                    sx={{mr: 1, width: 180}}
                                    isFormattedNumber={true}
                                    name={'operatingLoanLimit'}
                                    labelKey={'cashFlow.operatingLimit.label'}
                                    onChange={handleCashFlowChange}
                                    value={getCashFlowValue('operatingLoanLimit')}
                                    disabled={getValue('isLocked')}
                                    inputProps={{
                                       prefix: '$',
                                       style: {
                                          color: theme.palette.text.primary,
                                       },
                                    }}
                                    fullWidth={false}
                                    onFocus={handleFocusEdit}
                                    onBlur={handleSubmitDebounced.flush}
                                    placeholder={'$100,000'}
                                    classes={classes}
                                 />
                                 <EditCarryOverIncomeNote
                                    classes={classes}
                                    entityId={entityId}
                                    handleBlurEditCarryOver={handleBlurEditCarryOver}
                                    handleCashFlowChange={handleCashFlowChange}
                                    handleChangeNoteCarryover={handleChangeNoteCarryover}
                                    handleClose={handleClose}
                                    handleFocusEditCarryOver={handleFocusEditCarryOver}
                                    handleKeydown={handleKeydown}
                                    handlePopoverClose={handlePopoverClose}
                                    handleSaveCarryover={handleSaveCarryover}
                                    isEditCarryOver={isEditCarryOver}
                                    value={getCashFlowValue('carryoverIncome')}
                                    disabled={getValue('isLocked')}
                                    title={getValueNoteCarryover('carryoverIncomeNote')}
                                    textValue={getValueNoteCarryover('carryoverIncomeNote')}
                                 />
                              </Stack>
                              <Stack
                                 name='actionRow'
                                 flexDirection={'row'}
                                 alignItems={'center'}
                                 justifyContent='flex-end'
                              >
                                 <FormControlLabel
                                    key={'isLocked'}
                                    sx={{mx: 0.5, bgcolor: 'background.background2'}}
                                    style={{
                                       borderRadius: '8px',
                                       boxShadow: theme.palette.mode !== 'dark' && '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                       border:
                                          theme.palette.mode === 'dark' && `2px solid ${theme.palette.primary.stroke}`,
                                       marginTop: '8px',
                                       paddingRight: '14px',
                                       paddingLeft: '2px',
                                       height: '36.25px',
                                       color: theme.palette.text.primary,
                                       minWidth: '200px',
                                    }}
                                    control={
                                       <Switch
                                          checked={getValue('isLocked') || false}
                                          onChange={handleChange}
                                          name='isLocked'
                                          color='primary'
                                          disabled={entityIdList?.length > 1 || isAllEntities || !hasPermission}
                                       />
                                    }
                                    label={formatMessage(intl, 'cashFlow.locked.label')}
                                 />
                                 <ConfirmButton
                                    titleKey={'cashFlow.transferNext.title'}
                                    onConfirm={handleTransferNext}
                                    messageKey={'cashFlow.confirmTransferNext.message'}
                                    buttonLabelKey={'cashFlow.transferNext.label'}
                                    values={{year, nextYear: year + 1}}
                                    color='primary'
                                    size='large'
                                    sx={{
                                       '& .MuiSvgIcon-root': {fontSize: '16px !important'},
                                       mt: 0,
                                       bgcolor: 'background.background2',
                                       borderRadius: '8px',
                                       marginTop: '8px',

                                       boxShadow: theme.palette.mode !== 'dark' && '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                       border:
                                          theme.palette.mode === 'dark' && `2px solid ${theme.palette.primary.stroke}`,
                                       paddingRight: '14px',
                                       paddingLeft: '14px',
                                       height: '36.25px',
                                       marginLeft: '2px',
                                       color: theme.palette.mode === 'dark' ? 'white' : theme.palette.text.green,
                                       minWidth: '200px',
                                    }}
                                    startIcon={<ContentCopyIcon />}
                                    buttonTypographyProps={{variant: 'inherit', values: {nextYear: year + 1}}}
                                    disabled={year < moment().get('year') - 1 || getValue('isLocked')}
                                    isProgress={isLoadingCarryOver}
                                 />

                                 <ButtonLF
                                    name='CarryOverAddNoteButton'
                                    ref={carryOverAddNoteButton}
                                    sx={{ml: 3, mr: 2, display: !noteForCarryOver ? 'none' : undefined}}
                                    startIcon={<img alt='' className={classes.imageStyle} src={NOTE_EDIT_IMG} />}
                                    labelKey={
                                       getValueNoteCarryover('carryoverIncomeNote')
                                          ? 'cashFlow.editNote.label'
                                          : 'cashFlow.addNote.label'
                                    }
                                    onClick={handleAddNoteCarryover}
                                 />
                                 <AutocompleteMatchLXData
                                    style={{width: '200px'}}
                                    label={''}
                                    defaultValue={4}
                                    value={option}
                                    options={OPTIONS}
                                    autoFocus={false}
                                    disableClearable
                                    onChange={(e, b) => {
                                       setOption(b.id);
                                       setShowCashFlowColumn(b.id)
                                    }}
                                    textFieldProps={{variant: 'outlined'}}
                                    matchSorterProps={{keys: ['_default', 'id']}}
                                    inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                                 />
                              </Stack>
                           </Stack>
                        </Stack>
                     )}
                     <ScrollStack
                        name={'income and expense tables'}
                        sx={{
                           '&.MuiStack-root': {
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                           },
                           my: 1,
                        }}
                        flex={'1 1'}
                        height={'100%'}
                        width={'100%'}
                        direction={'column'}
                        innerStackProps={{
                           style: {
                              ...scaleStyle,
                              scrollBehavior: 'smooth',
                              width: `${100 / scale}%`,
                              height: `${100 / scale}%`,
                           },
                        }}
                     >
                        <div className={`${classes.lockStyle} ${getValue('isLocked') ? 'disabled' : undefined}`}>
                           <TableStickyContainerFrame
                              titleKey={'cashFlow.income.column'}
                              stickyTitle
                              style={{width: 'fit-content', height: 'fit-content'}}
                           >
                              {IncomeTable}
                           </TableStickyContainerFrame>
                           <TableStickyContainerFrame
                              titleKey={'cashFlow.expense.title'}
                              stickyTitle
                              style={{width: 'fit-content', height: 'fit-content'}}
                           >
                              {ExpenseTable}
                           </TableStickyContainerFrame>
                        </div>
                     </ScrollStack>
                  </Form>
               </Stack>
            )}
         </Stack>
      </>
   );
}
