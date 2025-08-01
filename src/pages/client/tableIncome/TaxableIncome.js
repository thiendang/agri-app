import {Switch} from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import {lighten, useTheme} from '@mui/material/styles';
import Grid2 from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import {isEqual} from 'lodash';
import {pullAllBy} from 'lodash';
import {differenceBy} from 'lodash';
import {join} from 'lodash';
import {map} from 'lodash';
import {filter} from 'lodash';
import {defer} from 'lodash';
import {findLastIndex} from 'lodash';
import debounce from 'lodash/debounce';
import find from 'lodash/find';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {stringify} from 'query-string';
import {parse} from 'query-string';
import {useRef} from 'react';
import {useLayoutEffect} from 'react';
import {useState, useCallback, useMemo} from 'react';
import React from 'react';
import {isFirefox} from 'react-dnd-html5-backend/dist/BrowserDetector';
import {useIntl} from 'react-intl';
import {useNavigate} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useRecoilState} from 'recoil';
import {useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import Empty from '../../../components/Empty';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import Header from '../../../components/Header';
import {SCALE_APP} from '../../../Constants';
import {MONTH_CONVERT} from '../../../Constants';
import {TAXABLE_INCOME_INDEX} from '../../../Constants';
import {DEFAULT_MONTH_ORDER} from '../../../Constants';
import {DEPRECIATION_TYPE_NAME} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {LOCK_ICON} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {YEAR_FORMAT} from '../../../Constants';
import {TAXABLE_CASH_FLOW_QUERY} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {INCOME_TYPE_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../../../data/QueriesGL';
import {getCashFlowReportRefetchQueries} from '../../../data/QueriesGL';
import {ENTITY_CASH_FLOW_CREATE_UPDATE} from '../../../data/QueriesGL';
import {ENTITY_CASH_FLOW_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {getExpenseTypeUpdateQueries} from '../../../data/QueriesGL';
import {EXPENSE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {EXPENSE_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {INCOME_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {INCOME_CREATE_UPDATE} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import Form from '../../../fhg/components/edit/Form';
import useEditData from '../../../fhg/components/edit/useEditData';
import AdminAccess from '../../../fhg/components/security/AdminAccess';
import StaticCell from '../../../fhg/components/table/StaticCell';
import TableContainerFrame from '../../../fhg/components/table/TableContainerFrame';
import {selectedCellState} from '../../../fhg/components/table/TableNewUiFHG';
import {editCellState} from '../../../fhg/components/table/TableNewUiFHG';

import TableNewUiFHG from '../../../fhg/components/table/TableNewUiFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import {titleStatus} from '../../../fhg/components/WebAppBar';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useEffect from '../../../fhg/hooks/useEffect';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import ScrollStack from '../../../fhg/ScrollStack';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {formatMessage} from '../../../fhg/utils/Utils';
import {entityState} from '../../admin/EntityListDropDown';
import {userRoleState} from '../../Main';
import MultipleSelect from './MultipleSelect';
import useTaxableIncomeTotals from './useTaxableIncomeTotals';

const PERCENT_COLUMN_WIDTH = isFirefox() ? 61.2 : 86;
// const EXPENSE_PERCENT_COLUMN2_WIDTH = isFirefox() ? 61.2 : 102.44;
// const DEFAULT_COLUMN_WIDTH = 145;
const ACTUAL_COLUMN_WIDTH = 145.5;
const CATEGORY_INCOME_COLUMN_ID = 'income';
const CATEGORY_EXPENSE_COLUMN_ID = 'expense';
const CATEGORY_COLUMN_INDEX = 0;
const INCOME_TABLE = 'Income';
const EXPENSES_TABLE = 'Expenses';

const ADD_BUTTON_CELL_VALUE = undefined;

const operatingLoanBalance = [];

export function convertYearToNumber(year) {
   const type = typeof year;
   if (type === 'string') {
      return +year;
   } else if (type !== 'number') {
      return moment(year).year();
   }
   return year || 0;
}

const useStyles = makeStyles(
   (theme) => ({
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
         backgroundColor: lighten(theme.palette.error.light, 0.3),
         color: 'black',
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.6),
         },
      },
      footerStyle: {
         fontSize: 16 * SCALE_APP,
      },
      formStyle: {
         maxHeight: '100%',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      tableHeadRoot: {
         top: 102,
         position: 'sticky',
         zIndex: theme.zIndex.drawer + 1,
      },
      negativeStyle: {
         color: theme.palette.error.main,
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: '8px 8px 4px',
         fontSize: 16 * SCALE_APP,
         '&.editable': {
            color: 'black',
         },
         '&:hover.editable': {
            backgroundColor: 'rgba(240, 246, 233, 0.75)',
            cursor: 'pointer',
         },
         '&:hover:not(.editable)': {
            backgroundColor: '#f0f0f0',
            cursor: 'default',
         },
      },
      inputStyle: {
         minWidth: 60,
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
               backgroundColor: 'white !important',
            },
            '& td:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
               borderLeft: `1px solid ${theme.palette.divider}`,
            },
            '& th:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: theme.palette.table.header.primary,
               borderLeft: `1px solid ${theme.palette.divider}`,
               borderTopLeftRadius: `${0} !important`,
            },
            '& tr:nth-child(2) > th:nth-last-child(2)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
                  right: PERCENT_COLUMN_WIDTH,
               },
            },
            '& tr:nth-child(2) > th:nth-last-child(3)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
               },
            },
            '& tr:nth-child(2) > th:nth-last-child(4)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH * 2 + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: theme.palette.table.header.primary,
               },
            },
            '& th:last-child': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: 0,
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
                  right: 0,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(2)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(3)': {
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
            '& td:nth-last-child(4)': {
               borderLeft: `2px solid ${theme.palette.divider}`,
               '@media (min-width: 1200px)': {
                  position: 'sticky',
                  right: PERCENT_COLUMN_WIDTH * 2 + ACTUAL_COLUMN_WIDTH,
                  zIndex: theme.zIndex.modal - 1,
                  backgroundColor: 'inherit',
               },
            },
         },
      },
   }),
   {name: 'TaxableIncomeStyles'},
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

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * TODO finish converting to the new UI. The search has not been implemented.
 * Reviewed: 5/28/21(incomplete development)
 */
export default function TaxableIncome() {
   const [{clientId: clientIdProp, entityId, reportDate}] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const location = useLocation();
   const navigate = useNavigate();
   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const [{entities: entityIdList, allEntities: isAllEntities}, setEntityStatus] = useRecoilState(entityState);
   const year = moment(date, MONTH_FORMAT)?.format(YEAR_FORMAT);

   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {fetchPolicy: 'cache-network', variables: {clientId}, skip: !validate(clientId)},
      'client.type',
   );

   // Set the startMonth and default to jan if not set
   const startMonth = clientData?.client.startMonth || 'jan';

   const fiscalYear = useMemo(() => {
      if (startMonth !== 'jan') {
         const fiscalYearStart = moment(
            `${moment(date, MONTH_FORMAT).get('year')}-${MONTH_CONVERT[startMonth]}`,
            'YYYY-M',
         );
         return moment(date, MONTH_FORMAT).isBefore(fiscalYearStart, 'month')
            ? fiscalYearStart.subtract(1, 'year').year()
            : fiscalYearStart.year();
      }
      return year;
   }, [date, startMonth, year]);

   const theme = useTheme();
   const classes = useStyles();
   const intl = useIntl();

   const incomeTotals = useRef({}).current;
   const expenseTotals = useRef({}).current;

   const [showEdit, setShowEdit] = useRecoilState(editCellState);
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
   const [pdfDataReady, setPdfDataReady] = useState(true);
   const [pdfReportReady, setPdfReportReady] = useState(false);
   const [refreshExpense, setRefreshExpense] = useState(Date.now());
   const [refreshIncome, setRefreshIncome] = useState(Date.now());

   const [incomeCreateUpdate] = useMutationFHG(INCOME_CREATE_UPDATE);
   const [incomeTypeCreateUpdate] = useMutationFHG(INCOME_TYPE_CREATE_UPDATE);

   const [expenseCreateUpdate] = useMutationFHG(EXPENSE_CREATE_UPDATE);
   const [expenseTypeCreateUpdate] = useMutationFHG(EXPENSE_TYPE_CREATE_UPDATE);

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   const entities = useMemo(() => sortBy(entitiesData?.entities || [], 'name'), [entitiesData]);

   const [cashFlowData, {loading}] = useQueryFHG(TAXABLE_CASH_FLOW_QUERY, {
      fetchPolicy: 'network-only',
      variables: {entityId: entityIdList, year: convertYearToNumber(fiscalYear)},
      skip: !(entityIdList?.length > 0) || !fiscalYear,
   });

   const incomeTypeIds = useMemo(() => map(cashFlowData?.cashFlow?.income, 'typeId'), [cashFlowData?.cashFlow]);
   const expenseTypeIds = useMemo(() => map(cashFlowData?.cashFlow?.expenses, 'typeId'), [cashFlowData?.cashFlow]);

   const [incomeTypes] = useQueryFHG(INCOME_TYPE_ALL_WHERE_QUERY, {variables: {id: incomeTypeIds}});
   const [expenseTypes] = useQueryFHG(EXPENSE_TYPE_ALL_WHERE_QUERY, {variables: {id: expenseTypeIds}});

   const incomeAnnualActualTotals = useTaxableIncomeTotals(cashFlowData?.cashFlow?.income);
   const expenseAnnualActualTotals = useTaxableIncomeTotals(cashFlowData?.cashFlow?.expenses);

   const [entityCashFlowData, {loading: entityCashFlowDataLoading}] = useQueryFHG(ENTITY_CASH_FLOW_ALL_WHERE_QUERY, {
      fetchPolicy: 'cache-network',
      variables: {entityId: entityIdList, year: convertYearToNumber(fiscalYear)},
      skip: !entityIdList || !fiscalYear,
   });

   const [monthOrder, setMonthOrder] = useState(DEFAULT_MONTH_ORDER);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: false}));
   }, [setEntityStatus]);

   useEffect(() => {
      const newMonthOrder = cashFlowData?.cashFlow?.monthOrder;
      if (newMonthOrder) {
         if (!isEqual(monthOrder, cashFlowData?.cashFlow?.monthOrder)) {
            setMonthOrder(cashFlowData?.cashFlow?.monthOrder);
         }
      } else {
         setMonthOrder(DEFAULT_MONTH_ORDER);
      }
      // monthOrder changes in the effect and will cause endless looping.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [cashFlowData?.cashFlow?.monthOrder]);

   const [entityCashFlowCreateUpdate] = useMutationFHG(ENTITY_CASH_FLOW_CREATE_UPDATE);

   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      if (incomeTypes?.incomeTypes?.length > 0 && cashFlowData?.cashFlow?.income?.length > 0) {
         const cashFlowList = cashFlowData?.cashFlow?.income;
         const typeList = incomeTypes?.incomeTypes;
         const selected = {};

         for (const cashFlowEntry of cashFlowList) {
            const typeObject = find(typeList, {id: cashFlowEntry.typeId});
            if (typeObject) {
               selected[typeObject?.id] = typeObject?.isTaxable;
            }
         }
         setIncomeCategorySelectedList(selected);
      } else {
         setIncomeCategorySelectedList({});
      }
   }, [cashFlowData?.cashFlow?.income, incomeTypes?.incomeTypes]);

   /**
    * Submit the expense type changes to the server.
    */
   const submitExpenseType = useCallback(
      async function (expenseTypeId = uuid(), value, isTaxable = false) {
         const variables = {id: expenseTypeId, name: value?.length > 0 ? value.trim() : undefined, entityId, isTaxable};

         return await expenseTypeCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               expenseType: {
                  __typename: 'ExpenseType',
                  ...variables,
                  isDeleted: false,
               },
            },
            update: cacheUpdate(getExpenseTypeUpdateQueries(), variables.id, 'expenseType'),
            refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
         });
      },
      [entityId, expenseTypeCreateUpdate, year],
   );

   useEffect(() => {
      if (expenseTypes?.expenseTypes?.length > 0 && cashFlowData?.cashFlow?.expenses?.length > 0) {
         let depreciationType = find(expenseTypes?.expenseTypes, {name: DEPRECIATION_TYPE_NAME});

         if (!depreciationType) {
            submitExpenseType(undefined, DEPRECIATION_TYPE_NAME, true);
         } else {
            const cashFlowList = differenceBy(
               cashFlowData?.cashFlow?.expenses,
               [{typeName: DEPRECIATION_TYPE_NAME}],
               'typeName',
            );
            const typeList = expenseTypes?.expenseTypes;
            const selected = {};

            for (const cashFlowEntry of cashFlowList) {
               const typeObject = find(typeList, {id: cashFlowEntry.typeId});
               if (typeObject) {
                  selected[typeObject?.id] = typeObject?.isTaxable;
               }
            }
            setExpenseCategorySelectedList(selected);
         }
      } else {
         setExpenseCategorySelectedList({});
      }
   }, [
      cashFlowData?.cashFlow.expense,
      cashFlowData?.cashFlow?.expenses,
      expenseTypes?.expenseTypes,
      submitExpenseType,
   ]);

   const [editValues, handleChange, {getValue, setValue, setEditValues}] = useEditData({
      entityId: entityIdList,
      isLocked: false,
      isAllEntityId: isAllEntities,
   });

   const [incomeCategorySelectedList, setIncomeCategorySelectedList] = useState();
   const [expenseCategorySelectedList, setExpenseCategorySelectedList] = useState();

   /**
    * When the url params change check for the auto lock.
    */
   useEffect(() => {
      setValue('isLocked', year < fiscalYear || entityIdList?.length > 1 || isAllEntities);
      // adding setValue will cause infinite calls.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [entityIdList?.length, fiscalYear, isAllEntities, year]);

   const handleChangeCallback = (changed) => {
      setPdfDataReady(false);
      handleSubmitDebounced(changed, year);
   };

   const [
      editCashFlowValues,
      handleCashFlowChange,
      {getValue: getCashFlowValue, defaultValues: defaultCashFlowValues, resetValues: resetCashFlowValues},
   ] = useEditData(
      {id: uuid(), entityId, ...entityCashFlowData?.entityCashFlow?.[0]},
      ['id', 'entityId'],
      undefined,
      handleChangeCallback,
   );

   const [selectedLocation, setSelectedLocation] = useState();
   const actualFieldName = useMemo(() => (getCashFlowValue('taxLock') ? 'taxActual' : 'actual'), [getCashFlowValue]);

   /**
    * Get the entity objects from the list of entityIds.
    */
   const getEntities = useCallback(() => {
      const isAllEntityIds = getValue('isAllEntityId');

      if (entities?.length > 0) {
         if (isAllEntityIds) {
            return entities;
         } else {
            const entityIds = getValue('entityId');
            // Get the entity objects from the list of entityIds.
            return filter(entities, (entity) => find(entityIds, (entityId) => entityId === entity.id));
         }
      }
      return [];
   }, [entities, getValue]);

   const entityNames = useMemo(() => {
      return join(map(getEntities(), 'name'), ', ');
   }, [getEntities]);

   useEffect(() => {
      if (editValues?.entityId?.length > 0 || editValues?.isAllEntityId !== undefined) {
         const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
         searchParams.year = year;

         // if (getValue('isAllEntityId')) {
         //    searchParams.isAllEntities = true;
         //    searchParams.entityIds = undefined;
         // } else {
         //    searchParams.isAllEntities = undefined;
         //    searchParams.entityIds = getValue('entityId') ? getValue('entityId') : undefined;
         // }

         const search = stringify(searchParams);
         navigate({pathname: location.pathname, search}, {replace: true});
      }
   }, [navigate, location.pathname, location.search, editValues, setEditValues, getValue, year]);

   useEffect(() => {
      if (loading || entityCashFlowDataLoading) {
         setPdfDataReady(false);
      } else if (cashFlowData && entityNames && entityCashFlowData) {
         setPdfDataReady(true);
      }
   }, [loading, cashFlowData, entityNames, entityCashFlowDataLoading, entityCashFlowData]);

   useEffect(() => {
      if (loading || entityCashFlowDataLoading || !pdfDataReady || !entityNames) {
         setPdfReportReady(false);
      } else {
         setPdfReportReady(true);
      }
   }, [loading, entityCashFlowDataLoading, cashFlowData, pdfDataReady, entityNames]);

   usePageTitle({titleKey: 'taxable.bar.title', values: {year}});
   const setTitleStatus = useSetRecoilState(titleStatus);

   useEffect(() => {
      if (entityCashFlowData?.entityCashFlow) {
         setIsLoading(false);

         if (entityCashFlowData.entityCashFlow.length > 0) {
            let values = {id: uuid(), entityId};

            if ((isAllEntities || entityIdList?.length > 1) && entityCashFlowData.entityCashFlow.length > 1) {
               const array = entityCashFlowData?.entityCashFlow;
               values.actualOperatingLoanBalance = sumBy(array, 'actualOperatingLoanBalance');
               values.operatingLoanLimit = sumBy(array, 'operatingLoanLimit');
            } else {
               values = {...values, ...entityCashFlowData?.entityCashFlow?.[0]};
            }
            resetCashFlowValues(values);
         } else {
            resetCashFlowValues();
         }
      }
   }, [entityCashFlowData?.entityCashFlow, entityId, entityIdList?.length, isAllEntities, resetCashFlowValues]);

   const {incomeCashFlowData, expenseCashFlowData, incomeCategories, expenseCategories} = useMemo(() => {
      const cashFlow = cashFlowData?.cashFlow;

      if (cashFlow) {
         let incomeCategories = map(cashFlow?.income, (item) => ({
            name: item?.typeName,
            id: item?.typeId,
            entityId: item?.entityId,
         }));

         incomeCategories = filter(incomeCategories, (category) => !!category.entityId);
         let expenseCategories = map(cashFlow?.expenses, (item) => ({
            name: item?.typeName,
            id: item?.typeId,
            entityId: item?.entityId,
         }));
         expenseCategories = filter(expenseCategories, (category) => !!category.entityId);
         pullAllBy(expenseCategories, [{name: DEPRECIATION_TYPE_NAME}], 'name');
         const incomeCashFlowData = filter(cashFlow?.income, (income) => incomeCategorySelectedList?.[income?.typeId]);
         let expenseCashFlowData = filter(
            cashFlow?.expenses,
            (expense) => expenseCategorySelectedList?.[expense?.typeId],
         );
         expenseCashFlowData = [...expenseCashFlowData, find(cashFlow?.expenses, {typeName: DEPRECIATION_TYPE_NAME})];
         if (expenseCashFlowData?.length === 1 && expenseCashFlowData[0] === undefined) {
            expenseCashFlowData = [];
         }

         return {incomeCashFlowData, expenseCashFlowData, incomeCategories, expenseCategories};
      } else {
         return {
            incomeCashFlowData: [],
            expenseCashFlowData: undefined,
            incomeCategories: [],
            expenseCategories: [],
         };
      }
   }, [cashFlowData, incomeCategorySelectedList, expenseCategorySelectedList]);

   /**
    * When the grouped expenses change, select the new category and set it for editing.
    */
   useEffect(() => {
      if (expenseCashFlowData?.length > 0) {
         const newCategoryIndex = findLastIndex(expenseCashFlowData, ['typeName', null]);

         if (newCategoryIndex >= 0) {
            setSelectedLocation({isExpense: true});
            setCellSelected({
               tableName: EXPENSES_TABLE,
               rowIndex: newCategoryIndex,
               columnIndex: CATEGORY_COLUMN_INDEX,
            });
            setShowEdit(true);
         }
      }
   }, [expenseCashFlowData, setCellSelected, setShowEdit]);

   // Create the columns for the income table.
   const columns = useMemo(() => {
      let columnIndex = 0;
      const cellDefaults = {
         isFormattedNumber: true,
         prefix: '',
         format: CURRENCY_FULL_FORMAT,
         minWidth: 145,
         maxWidth: 145,
         width: 145,
         tableCellProps: {align: 'right'},
         isEditable: false,
         Footer: (info) => {
            // Only calculate total visits if rows change
            const sum = React.useMemo(() => {
               const sumCalc = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
               incomeTotals[info.column.id] = sumCalc;
               return sumCalc;
            }, [info.rows, info.column.id]);
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
      };

      const columns = [
         {
            id: CATEGORY_INCOME_COLUMN_ID,
            Header: <TypographyFHG id={'cashFlow.income.column1'} />,
            accessor: 'typeName',
            style: {align: 'right', whiteSpace: 'pre-wrap'},
            minWidth: 240,
            maxWidth: 240,
            width: 240,
            ___index: columnIndex++,
            isEditable: false,
            Cell: (data) => {
               return getValue('isLocked') && data.value === ADD_BUTTON_CELL_VALUE ? (
                  ''
               ) : (
                  <StaticCell
                     {...data}
                     isEditable={false}
                     color={data.value === ADD_BUTTON_CELL_VALUE ? 'lightgrey' : undefined}
                     defaultValue={data.value === ADD_BUTTON_CELL_VALUE ? 'Add a category' : 'Untitled Category'}
                  />
               );
            },
            Footer: 'Total Income',
         },
      ];

      columns.push({
         Header: <TypographyFHG id={'taxable.actual.column'} />,
         accessor: `annual.${actualFieldName}`,
         ___index: columnIndex++,
         field: actualFieldName,
         bold: true,
         isEditable: false,
         ...cellDefaults,
         Cell: ({row}) => {
            let sum;
            if (cashFlowData) {
               const incomeItem = find(cashFlowData.cashFlow.income, {typeName: row.original.typeName});
               sum = incomeItem?.annual?.[actualFieldName] || 0;
            } else {
               sum = 0;
            }

            row.values[`annual.${actualFieldName}`] = sum;
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
      });
      return columns;
   }, [cashFlowData, actualFieldName, incomeTotals, getValue, classes.footerStyle, theme.palette.error.main]);

   /**
    * Submit the expense type changes to the server.
    */
   const submitTypeTaxable = useCallback(
      async function (isIncome, selectedTypes) {
         let type, __typename, mutation, typeList, cashFlowList;
         const cashFlow = cashFlowData?.cashFlow;

         if (isIncome) {
            type = 'incomeType';
            __typename = 'IncomeType';
            cashFlowList = cashFlow?.income;
            typeList = incomeTypes?.incomeTypes || [];
            mutation = incomeTypeCreateUpdate;
         } else {
            type = 'expenseType';
            __typename = 'ExpenseType';
            cashFlowList = cashFlow?.expenses;
            typeList = expenseTypes?.expenseTypes || [];
            mutation = expenseTypeCreateUpdate;
         }

         for (const cashFlowEntry of cashFlowList) {
            const typeObject = find(typeList, {id: cashFlowEntry.typeId});
            const isTaxable = selectedTypes[typeObject.id];

            if (typeObject?.isTaxable !== !!isTaxable) {
               const variables = {id: typeObject?.id, entityId: typeObject?.entityId, isTaxable};

               await mutation({
                  variables,
                  optimisticResponse: {__typename: 'Mutation', [type]: {__typename, ...variables}},
               });
            }
         }
      },
      [cashFlowData?.cashFlow, expenseTypeCreateUpdate, expenseTypes, incomeTypeCreateUpdate, incomeTypes],
   );

   // Create the columns for the expense table.
   const expenseColumns = useMemo(() => {
      let columnIndex = 0;

      const cellDefaults = {
         isFormattedNumber: true,
         prefix: '',
         format: CURRENCY_FULL_FORMAT,
         minWidth: 145,
         maxWidth: 145,
         width: 145,
         tableCellProps: {align: 'right'},
         isEditable: (cell) => cell?.row?.values?.expense === DEPRECIATION_TYPE_NAME,
         Footer: (info) => {
            const sum = React.useMemo(() => {
               const sumCalc = info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
               expenseTotals[info.column.id] = sumCalc;
               return sumCalc;
            }, [info.rows, info.column.id]);
            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
         Footer2: (info) => {
            const sum = incomeTotals[info.column.id] - expenseTotals[info.column.id];

            return (
               <div
                  className={classes.footerStyle}
                  style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
               </div>
            );
         },
      };

      const columns = [
         {
            id: CATEGORY_EXPENSE_COLUMN_ID,
            Header: <TypographyFHG id={'cashFlow.expense.column'} />,
            accessor: 'typeName',
            style: {align: 'right', whiteSpace: 'pre-wrap'},
            minWidth: 240,
            maxWidth: 240,
            width: 240,
            ___index: columnIndex++,
            isEditable: false,
            Cell: (data) => {
               return getValue('isLocked') && data.value === ADD_BUTTON_CELL_VALUE ? (
                  ''
               ) : (
                  <StaticCell
                     {...data}
                     isEditable={false}
                     color={data.value === ADD_BUTTON_CELL_VALUE ? 'lightgrey' : undefined}
                  />
               );
            },
            Footer: 'Total Expense',
            Footer2: 'Taxable Income',
         },
      ];

      columns.push({
         Header: <TypographyFHG id={'taxable.actual.column'} />,
         accessor: `annual.${actualFieldName}`,
         ___index: columnIndex++,
         field: actualFieldName,
         bold: true,
         isEditable: (cell) => cell?.row?.values?.expense === DEPRECIATION_TYPE_NAME,
         ...cellDefaults,
         Cell: (data) => {
            if (data?.row?.original?.typeName === DEPRECIATION_TYPE_NAME) {
               return <StaticCell {...data} isEditable={true} />;
            } else {
               let sum;
               if (cashFlowData) {
                  const expenseItem = find(cashFlowData.cashFlow.expenses, {typeName: data?.row.original.typeName});
                  sum = expenseItem?.annual?.[actualFieldName] || 0;
               } else {
                  sum = 0;
               }
               data.row.values[`annual.${actualFieldName}`] = sum;

               return (
                  <div
                     className={classes.footerStyle}
                     style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}
                  >
                     {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                  </div>
               );
            }
         },
      });
      return columns;
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      actualFieldName,
      getCashFlowValue,
      getValue,
      refreshExpense,
      incomeTotals,
      operatingLoanBalance,
      expenseTotals,
      classes.footerStyle,
      theme.palette.error.main,
      monthOrder,
      expenseAnnualActualTotals,
   ]);

   /**
    * Perform keyboard navigation and escape and enter.
    *
    * @type {(function(*): void)|*}
    */
   const handleKey = useCallback(
      (event) => {
         let rowIndex;
         let columnIndex;

         if (!event.defaultPrevented && !showEdit) {
            const offset = event.shiftKey ? -1 : 1;

            switch (event.keyCode) {
               // Tab
               case 9:
                  if (cellSelected?.columnIndex >= 0) {
                     columnIndex = cellSelected.columnIndex + offset;
                  }
                  break;

               // Enter
               case 13:
                  if (cellSelected?.rowIndex >= 0) {
                     rowIndex = cellSelected?.rowIndex + offset;
                  }
                  break;

               //Escape
               case 27:
                  event.preventDefault();
                  setCellSelected({});
                  break;

               // Left Arrow
               case 37:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.columnIndex >= 0) {
                     columnIndex = cellSelected.columnIndex - offset;
                  }
                  break;

               // Up Arrow
               case 38:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.rowIndex >= 0) {
                     rowIndex = cellSelected?.rowIndex - offset;
                  }
                  break;

               // Right Arrow
               case 39:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.columnIndex >= 0) {
                     columnIndex = cellSelected.columnIndex + offset;
                  }
                  break;

               // Down Arrow
               case 40:
                  if (event.target.tagName !== 'INPUT' && cellSelected?.rowIndex >= 0) {
                     rowIndex = cellSelected?.rowIndex + offset;
                  }
                  break;

               // 0 - 9 or number pad 0 - 9 or "-".
               default:
                  if (
                     (event.keyCode >= 48 && event.keyCode <= 57) ||
                     (event.keyCode >= 96 && event.keyCode <= 105) ||
                     (event.keyCode === 189 && !!(selectedLocation?.cell || cellSelected?.tableName))
                  ) {
                     setShowEdit(true);
                  }
                  break;
            }

            if (rowIndex !== undefined || columnIndex !== undefined) {
               const maxColumn =
                  (cellSelected?.tableName === INCOME_TABLE ? columns.length : expenseColumns.length) * 2 - 1;
               const maxRow =
                  cellSelected?.tableName === INCOME_TABLE ? incomeCashFlowData?.length : expenseCashFlowData?.length;

               if (
                  (!rowIndex || (rowIndex >= 0 && rowIndex < maxRow)) &&
                  (!columnIndex || (columnIndex >= 0 && columnIndex < maxColumn))
               ) {
                  event?.preventDefault();
                  event?.stopPropagation();
                  setCellSelected((cellSelected) => ({
                     ...cellSelected,
                     rowIndex: rowIndex !== undefined ? rowIndex : cellSelected.rowIndex,
                     columnIndex: columnIndex !== undefined ? columnIndex : cellSelected.columnIndex,
                  }));
                  defer(() => {
                     const id = `StaticCell' ${cellSelected?.tableName} ${rowIndex || cellSelected?.rowIndex} ${
                        columnIndex || cellSelected?.columnIndex
                     }`;
                     const dom = document.getElementById(id);

                     if (dom) {
                        dom.focus();

                        if (dom?.scrollIntoViewIfNeeded) {
                           dom.scrollIntoViewIfNeeded(false);
                        } else {
                           dom.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
                        }
                     }
                  });
               }
            }
         }
      },
      [
         showEdit,
         cellSelected?.columnIndex,
         cellSelected?.rowIndex,
         cellSelected?.tableName,
         setCellSelected,
         selectedLocation?.cell,
         setShowEdit,
         columns?.length,
         expenseColumns?.length,
         incomeCashFlowData?.length,
         expenseCashFlowData?.length,
      ],
   );

   /**
    * Install keydown listener.
    */
   useEffect(() => {
      document.addEventListener('keydown', handleKey, false);
   }, [cellSelected, setCellSelected, setShowEdit, handleKey]);

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
         document.removeEventListener('keydown', handleKey, false);
      };
   }, [cellSelected, setCellSelected, setShowEdit, handleKey, setTitleStatus]);

   /**
    * When a cell is selected set the selected location and turn on cell editing.
    * @param isExpense Indicates if the cell is in the expense or the income table.
    * @return {(function(*, *, *, *, *): void)|*}
    */
   const handleSelectCell = useCallback(
      (isExpense) => (index, cellKey, rowIndex, columnIndex, cell) => {
         setSelectedLocation({isExpense, cell});

         if (columnIndex === CATEGORY_COLUMN_INDEX && cell.getValue() === ADD_BUTTON_CELL_VALUE) {
            setShowEdit(true);
         }
      },
      [setShowEdit],
   );

   /**
    * Submit the user.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (changes, year) => {
         const variables = {...changes, year: convertYearToNumber(year)};

         await entityCashFlowCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               entityCashFlow: {
                  __typename: 'EntityCashFlow',
                  ...getInitialCashFlow(year),
                  ...defaultCashFlowValues,
                  ...editCashFlowValues,
                  isDeleted: false,
               },
            },
            refetchQueries: getCashFlowReportRefetchQueries(entityId, year),
         });
      },
      [entityCashFlowCreateUpdate, defaultCashFlowValues, editCashFlowValues, entityId],
   );

   const handleSubmitDebounced = useRef(debounce(handleSubmit, 1000)).current;

   /**
    * When a cell is updated, submit the changes to the server.
    * @param index - unused
    * @param id The ID of the column
    * @param value The updated value.
    * @param original The original income or expense.
    * @return {Promise<void>} For the server submit.
    */
   const handleUpdate = useCallback(
      async (index, id, value, original) => {
         if (
            id !== CATEGORY_INCOME_COLUMN_ID &&
            id !== CATEGORY_EXPENSE_COLUMN_ID &&
            original?.typeName === DEPRECIATION_TYPE_NAME
         ) {
            let itemCreateUpdate;
            const [recordField, field] = id?.split('.');
            const item = get(original, recordField);

            if (recordField && field && item) {
               const variables = {
                  entityId,
                  date: moment(`${startMonth}-01-${year}`),
                  [field]: +value || 0,
               };
               item[field] = +value || 0;

               if (cellSelected.tableName === INCOME_TABLE) {
                  variables.incomeTypeId = original?.typeId;
                  itemCreateUpdate = incomeCreateUpdate;
                  setRefreshIncome(Date.now());
               } else if (cellSelected.tableName === EXPENSES_TABLE) {
                  variables.expenseTypeId = original?.typeId;
                  itemCreateUpdate = expenseCreateUpdate;
                  setRefreshExpense(Date.now());
               } else {
                  console.log('could not find the selected item', cellSelected, selectedLocation);
                  return;
               }

               itemCreateUpdate({variables});
            }
         }
         setPdfDataReady(true);
      },
      [cellSelected, entityId, expenseCreateUpdate, incomeCreateUpdate, selectedLocation, year, startMonth],
   );

   /**
    * If the Income table is scrolling, scroll the Expense table the same amount.
    * @param event The scroll event.
    */
   const handleIncomeScroll = useCallback((event) => {
      const expenseTableContainer = document.getElementsByName(EXPENSES_TABLE + 'Container')?.[0];

      // expenseTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
   }, []);

   /**
    * If the Expense table is scrolling, scroll the Income table the same amount.
    * @param event The scroll event.
    */
   const handleExpenseScroll = useCallback((event) => {
      const incomeTableContainer = document.getElementsByName(INCOME_TABLE + 'Container')?.[0];
      // incomeTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
   }, []);

   const getDepreciationStyle = useCallback(
      (cell) => {
         const typeName = cell.row?.original?.typeName;
         if (typeName === DEPRECIATION_TYPE_NAME) {
            return {
               backgroundColor: '#F7FBF4',
               zIndex: theme.zIndex.modal - 1,
               fontWeight: 500,
            };
         }
         return {};
      },
      [theme.zIndex.modal],
   );

   const ExpenseTable = useMemo(() => {
      if (expenseColumns?.length > 0 && expenseCashFlowData) {
         return (
            <TableNewUiFHG
               key={'ExpenseTable' + refreshExpense}
               name={EXPENSES_TABLE}
               columns={expenseColumns}
               data={expenseCashFlowData}
               getCellProps={getDepreciationStyle}
               stickyHeader={false}
               stickyLeftColumn={false}
               updateMyData={getValue('isLocked') ? undefined : handleUpdate}
               onScroll={handleExpenseScroll}
               classes={{
                  root: classes.tableRoot,
                  tableHeadRoot: classes.tableHeadRoot,
                  cellStyle: classes.cellStyle,
               }}
               allowCellSelection={true}
               hasBorder
               onSelect={handleSelectCell(true)}
            />
         );
      } else {
         return null;
      }
   }, [
      refreshExpense,
      expenseColumns,
      expenseCashFlowData,
      getDepreciationStyle,
      getValue,
      handleUpdate,
      handleExpenseScroll,
      classes.tableRoot,
      classes.tableHeadRoot,
      classes.cellStyle,
      handleSelectCell,
   ]);

   const IncomeTable = useMemo(
      () => (
         <TableNewUiFHG
            key={'IncomeTable' + refreshIncome}
            name={INCOME_TABLE}
            columns={columns}
            data={incomeCashFlowData}
            stickyHeader={false}
            stickyLeftColumn={false}
            onScroll={handleIncomeScroll}
            classes={{
               root: classes.tableRoot,
               tableHeadRoot: classes.tableHeadRoot,
               cellStyle: classes.cellStyle,
            }}
            allowCellSelection={true}
            hasBorder
            onSelect={handleSelectCell(false)}
         />
      ),
      [
         refreshIncome,
         columns,
         incomeCashFlowData,
         handleIncomeScroll,
         classes.tableRoot,
         classes.tableHeadRoot,
         classes.cellStyle,
         handleSelectCell,
      ],
   );

   const handleSelectIncomeCategories = (selectedTypes) => {
      setIncomeCategorySelectedList(selectedTypes);
      submitTypeTaxable(true, selectedTypes);
   };

   const handleSelectExpenseCategories = (selectedTypes) => {
      setExpenseCategorySelectedList(selectedTypes);
      submitTypeTaxable(false, selectedTypes);
   };

   return (
      <Stack
         name={'Taxable Income Frame'}
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
            <Header idTitle='taxable.title' values={{year}} />
            <Stack direction={'row'} flexWrap={'nowrap'}>
               <CheckboxFHG
                  key={'isLocked'}
                  name={'isLocked'}
                  onChange={handleChange}
                  color={'default'}
                  labelKey={'cashFlow.locked.label'}
                  value={'isLocked'}
                  checked={getValue('isLocked') || false}
                  marginTop={0}
                  marginLeft={2}
                  disabled={getValue('entityId')?.length > 1 || getValue('isAllEntityId')}
                  fullWidth
               />
               <AdminAccess>
                  <FormControlLabel
                     control={
                        <Switch
                           checked={getCashFlowValue('taxLock') || false}
                           onChange={handleCashFlowChange}
                           name='taxLock'
                           color='primary'
                        />
                     }
                     label={formatMessage(intl, 'cashFlow.taxLocked.label')}
                  />
               </AdminAccess>
            </Stack>
         </Stack>

         {!clientId || !(incomeCashFlowData?.length > 0) || !(expenseCashFlowData?.length > 0) ? (
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
               name={'taxable income flow root'}
               direction={'column'}
               wrap={'nowrap'}
               height={'100%'}
               width={'100%'}
               overflow={'hidden'}
            >
               <Form onSubmit={handleSubmit} className={classes.formStyle}>
                  {!isLoading && <ExportChoiceButton selectedIndex={TAXABLE_INCOME_INDEX} />}
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
                  >
                     <TableContainerFrame
                        titleKey={'cashFlow.income.column'}
                        stickyTitle
                        titleHeader={
                           <Grid2
                              flexDirection={'row'}
                              justifyContent={'space-between'}
                              rowSpacing={1}
                              columnSpacing={2}
                              sx={{ml: 3}}
                           >
                              <Grid2
                                 columnSpacing={1}
                                 flex={'1 1'}
                                 alignItems={'center'}
                                 style={{minWidth: 300}}
                                 flexDirection={'row'}
                              >
                                 <MultipleSelect
                                    selectedDefaults={incomeCategorySelectedList}
                                    titleKey={'taxable.selectIncome.text'}
                                    buttonKey={'taxable.selectIncome.text'}
                                    onSelect={handleSelectIncomeCategories}
                                    menuItems={incomeCategories}
                                    disabled={getValue('isLocked')}
                                 />
                              </Grid2>
                           </Grid2>
                        }
                        style={{width: 'fit-content', height: 'fit-content'}}
                     >
                        {IncomeTable}
                     </TableContainerFrame>
                     {expenseColumns.length > 0 && (
                        <TableContainerFrame
                           titleKey={'cashFlow.expense.title'}
                           stickyTitle
                           style={{width: 'fit-content', height: 'fit-content'}}
                           sx={{mt: 2}}
                           titleHeader={
                              <Box item padding={1} position={'sticky'} left={0}>
                                 <MultipleSelect
                                    selectedDefaults={expenseCategorySelectedList}
                                    titleKey={'taxable.selectExpense.text'}
                                    buttonKey={'taxable.selectExpense.text'}
                                    onSelect={handleSelectExpenseCategories}
                                    menuItems={expenseCategories}
                                 />
                              </Box>
                           }
                        >
                           {ExpenseTable}
                        </TableContainerFrame>
                     )}
                     )
                  </ScrollStack>
               </Form>
            </Stack>
         )}
      </Stack>
   );
}
