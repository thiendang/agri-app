import {AddCircleOutline} from '@mui/icons-material';
import {Block} from '@mui/icons-material';
import {Delete} from '@mui/icons-material';
import {Box} from '@mui/material';
import {IconButton} from '@mui/material';
import {Stack} from '@mui/material';
import {Chip} from '@mui/material';
import {Tab} from '@mui/material';
import {Tabs} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import {omit} from 'lodash';
import {map} from 'lodash';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import isArray from 'lodash/isArray';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import {useCallback} from 'react';
import {useRef} from 'react';
import {useState} from 'react';
import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {Outlet} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import Header from '../../components/Header';
import {BORDER_RADIUS_10, DARK_MODE_COLORS} from '../../Constants';
import {SCALE_APP} from '../../Constants';
import {ASSETS_EDIT} from '../../components/permission/PermissionAllow';
import PermissionAllow from '../../components/permission/PermissionAllow';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {LIABILITY_INDEX} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {CURRENCY_FORMAT} from '../../Constants';
import {DATE_DB_FORMAT} from '../../Constants';
import {EDIT_PATH} from '../../Constants';
import {LIABILITY_DELETE} from '../../data/QueriesGL';
import {LIABILITY_QUERY} from '../../data/QueriesGL';
import {LIABILITY_CREATE_UPDATE} from '../../data/QueriesGL';
import {LIABILITY_CATEGORY_QUERY} from '../../data/QueriesGL';
import {LIABILITIES_ENTITY_QUERY} from '../../data/QueriesGL';
import numberFormatter from 'number-formatter';
import ConfirmIconButton from '../../fhg/components/ConfirmIconButton';
import AutocompleteMatchLXData from '../../fhg/components/edit/AutocompleteMatchLXData';
import useEditData from '../../fhg/components/edit/useEditData';
import TypographyWithHover from '../../fhg/components/table/TypographyWithHover';
import TypographyFHG from '../../fhg/components/Typography';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';

import filter from 'lodash/filter';
import {useEffect} from 'react';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import useScalePanel from '../../fhg/hooks/useScalePanel';
import {pollState} from '../../fhg/hooks/useSubscriptionPath';
import ScrollStack from '../../fhg/ScrollStack';
import {cacheUpdate} from '../../fhg/utils/DataUtil';
import {formatMessage} from '../../fhg/utils/Utils';
import {entityState} from '../admin/EntityListDropDown';
import {userRoleState} from '../Main';
import OverviewPanel from '../../components/OverviewPanel';
import Empty from '../../components/Empty';
import ExportChoiceButton from '../../components/ExportChoiceButton';
import TableNewUiFHG from '../../fhg/components/table/TableNewUiFHG';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import ReplayIcon from '@mui/icons-material/Replay';

// noinspection JSUnusedGlobalSymbols
export const TERM_TO_DISPLAY = {current: 'Current', intermediate: 'Intermediate', long: 'Long Term'};
const REMOVED_LIABILITIES_CATEGORY = 'Removed Liabilities';
const REMOVED_LIABILITIES_CATEGORY_OBJECT = {id: 2, _default: -2, name: REMOVED_LIABILITIES_CATEGORY};
const ALL_CATEGORY = 'All Categories';
const ALL_CATEGORY_ID = 1;
const ALL_CATEGORY_OBJECT = {id: ALL_CATEGORY_ID, _default: -1, name: ALL_CATEGORY};

const ALL_TAB = 'all';
const CURRENT_TAB = 'current';
const INTERMEDIATE_TAB = 'intermediate';
const LONG_TERM_TAB = 'long';
const REMOVED_TAB = 'remove';
const MAX_WIDTH_OVERVIEW = 360;
const MIN_WIDTH_OVERVIEW = 180;

const useStyles = makeStyles(
   (theme) => ({
      headerTextStyle: {
         fontWeight: 500,
      },
      tableStyle: {
         cursor: 'pointer',
         padding: theme.spacing(0, 0, 2, 0),
         borderRadius: BORDER_RADIUS_10,
         '& .searchBarTitleStyle': {
            position: 'sticky',
            left: 20,
            zIndex: 4,
            color: theme.palette.text.primary,
         },
         '& .searchStyle': {
            position: 'sticky',
            right: 10,
         },
         '& tbody tr td p': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& tbody tr td div': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& .MuiToolbar-root': {
            backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_1 : '#FAFAFA',
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 4,
         },
      },
      frameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      tabs: {
         '& .MuiTab-textColorPrimary': {
            color: theme.palette.text.primary,
         },
         '& .Mui-selected': {
            color: '#769548',
         },
      },
      filterTablet: {
         [theme.breakpoints.down('tablet')]: {
            display: 'inline-flex',
         },
         [theme.breakpoints.up('tablet')]: {
            display: 'none',
         },
         '& input.MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
      },
      filter: {
         [theme.breakpoints.down('tablet')]: {
            display: 'none',
         },
         [theme.breakpoints.up('tablet')]: {
            display: 'inline-flex',
         },
         '& input.MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
         width: '180px',
      },
   }),
   {name: 'LiabilitiesStyles'},
);

/**
 * Liability List component to display all the current Liabilities.
 *
 * Reviewed: 5/28/21
 */
export default function Liabilities() {
   const [
      {clientId: clientIdProp, entityId: entityIdParam, categoryId = ALL_CATEGORY_ID, search, reportDate, category},
      setSearchParams,
      searchAsString,
   ] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);
   const entityId = isArray(entityIdParam) ? entityIdParam[0] : entityIdParam;
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const intl = useIntl();
   const clientId = userClientId || clientIdProp;
   const navigate = useNavigate();
   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const month = moment(date, MONTH_FORMAT)?.format('MMMM');
   const year = moment(date, MONTH_FORMAT)?.year();

   const theme = useTheme();
   const classes = useStyles();
   const [selectedTab, setSelectedTab] = useState(ALL_TAB);
   const setEntityStatus = useSetRecoilState(entityState);

   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const [editValues, , {getValue}] = useEditData({historyDate});

   const [liabilityCreateUpdate] = useMutationFHG(LIABILITY_CREATE_UPDATE, {historyDate}, true);

   const [liabilityCategoryData] = useQueryFHG(LIABILITY_CATEGORY_QUERY, {
      pollInterval,
   });
   const liabilityCategories = useMemo(
      () => sortBy(liabilityCategoryData?.liabilityCategories, ['term', 'name']),
      [liabilityCategoryData],
   );

   const liabilitiesCategoriesMenuItems = useMemo(
      () => [
         ALL_CATEGORY_OBJECT,
         REMOVED_LIABILITIES_CATEGORY_OBJECT,
         ...filter(liabilityCategories, {term: selectedTab}),
      ],
      [liabilityCategories, selectedTab],
   );

   const [liabilitiesData, {refetch}] = useQueryFHG(LIABILITIES_ENTITY_QUERY, {
      variables: {entityId, historyDate: editValues?.historyDate || historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
      pollInterval,
   });

   const [previousLiabilitiesData] = useQueryFHG(LIABILITIES_ENTITY_QUERY, {
      variables: {
         entityId,
         historyDate: moment(editValues?.historyDate || historyDate)
            .subtract(1, 'year')
            .format(DATE_DB_FORMAT),
      },
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const {buttonPanel, scaleStyle, scale} = useScalePanel(
      {
         position: 'relative',
         top: 'unset',
         right: 'unset',
         backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_2 : 'white',
         opacity: 1,
      },
      false,
   );

   useEffect(() => {
      if (category && liabilityCategories?.length > 0) {
         const selectedCategory = find(liabilityCategories, {name: category});

         if (selectedCategory) {
            setSelectedTab(selectedCategory.term);
            setSearchParams((params) => ({...omit(params, 'category'), categoryId: selectedCategory?.id}), {
               replace: true,
            });
         }
      }
   }, [liabilityCategories, category, setSearchParams]);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   const liabilitiesGroups = useMemo(
      () => groupBy(liabilitiesData?.liabilities, 'liabilityCategory.term'),
      [liabilitiesData],
   );
   const liabilitiesGroupsPrevious = useMemo(
      () => groupBy(previousLiabilitiesData?.liabilities, 'liabilityCategory.term'),
      [previousLiabilitiesData],
   );

   const totalCurrent = useMemo(() => {
      return liabilitiesGroups?.current ? sumBy(filter(liabilitiesGroups?.current, {isRemoved: false}), 'amount') : 0;
   }, [liabilitiesGroups]);

   const totalCurrentPrevious = useMemo(() => {
      return liabilitiesGroupsPrevious?.current
         ? sumBy(filter(liabilitiesGroupsPrevious?.current, {isRemoved: false}), 'amount')
         : 0;
   }, [liabilitiesGroupsPrevious]);

   const totalIntermediate = useMemo(() => {
      return liabilitiesGroups?.intermediate
         ? sumBy(filter(liabilitiesGroups?.intermediate, {isRemoved: false}), 'amount')
         : 0;
   }, [liabilitiesGroups?.intermediate]);

   const totalIntermediatePrevious = useMemo(() => {
      return liabilitiesGroupsPrevious?.intermediate
         ? sumBy(filter(liabilitiesGroupsPrevious?.intermediate, {isRemoved: false}), 'amount')
         : 0;
   }, [liabilitiesGroupsPrevious?.intermediate]);

   useEffect(() => {
      const historyDate = getValue('historyDate');

      if (historyDate) {
         sessionStorage.filterDate = historyDate ? moment(historyDate).format(MONTH_FORMAT) : undefined;
      }
   }, [getValue]);

   const totalLong = useMemo(() => {
      return liabilitiesGroups?.long ? sumBy(filter(liabilitiesGroups?.long, {isRemoved: false}), 'amount') : 0;
   }, [liabilitiesGroups?.long]);

   const totalLongPrevious = useMemo(() => {
      return liabilitiesGroupsPrevious?.long
         ? sumBy(filter(liabilitiesGroupsPrevious?.long, {isRemoved: false}), 'amount')
         : 0;
   }, [liabilitiesGroupsPrevious?.long]);

   const totalLiabilities = totalCurrent + totalIntermediate + totalLong;
   const totalLiabilitiesPrevious = totalCurrentPrevious + totalIntermediatePrevious + totalLongPrevious;

   // Create the filtered list of liabilities based on the category selected.
   const liabilities = useMemo(() => {
      let filteredLiabilities;

      if (categoryId) {
         if (categoryId === ALL_CATEGORY_OBJECT.id) {
            filteredLiabilities = filter(liabilitiesData?.liabilities || [], {isRemoved: false});
         } else if (categoryId === REMOVED_LIABILITIES_CATEGORY_OBJECT.id) {
            filteredLiabilities = filter(liabilitiesData?.liabilities || [], {isRemoved: true});
         } else {
            filteredLiabilities = filter(liabilitiesData?.liabilities || [], {
               isRemoved: false,
               liabilityCategoryId: categoryId,
            });
         }
      } else {
         filteredLiabilities = filter(liabilitiesData?.liabilities || [], {isRemoved: false});
      }
      const tableLiabilities = map(filteredLiabilities, (liability) => ({
         ...liability,
         removedLabel: liability.isRemoved ? 'removed' : undefined,
         collateralString: liability.isCollateral ? 'Yes' : 'No',
      }));
      return sortBy(tableLiabilities, ['isRemoved', 'liabilityCategory.name', 'createdDateTime']);
   }, [liabilitiesData, categoryId]);

   const liabilitiesRemoved = useMemo(() => {
      let filteredLiabilities = filter(liabilitiesData?.liabilities || [], (liability) => liability?.isRemoved);
      const tableLiabilities = map(filteredLiabilities, (liability) => ({
         ...liability,
         removedLabel: liability.isRemoved ? 'removed' : undefined,
         collateralString: liability.isCollateral ? 'Yes' : 'No',
      }));
      return sortBy(tableLiabilities, ['isRemoved', 'liabilityCategory.name', 'createdDateTime']);
   }, [liabilitiesData]);

   const liabilityGroupsByCategory = useMemo(() => groupBy(liabilities, 'liabilityCategory.name'), [liabilities]);

   const liabilityGroupsByCategoryRemoved = useMemo(
      () => groupBy(liabilitiesRemoved, 'liabilityCategory.name'),
      [liabilitiesRemoved],
   );

   usePageTitle({
      titleKey: 'liability.title',
      values: {month, year},
   });

   const ref = useRef();

   /**
    * Handles changes to the selected tab.
    *
    * @param event the target of the event that triggered the change
    * @param value the value of the change
    */
   const handleTabChange = (event, value) => {
      if (value !== undefined) {
         setSelectedTab(value);
         setSearchParams((params) => omit(params, 'categoryId'));
      }
   };

   /**
    * On select category, close the menu and select the category. Add the
    * category to the location search.
    *
    * @param event the select event
    * @param category the category selected
    */
   const handleSelectCategory = (event, category) => {
      setSearchParams((params) => ({...params, categoryId: category?.id}));
   };

   /**
    * On add liability, navigate to show edit drawer.
    *
    * @param category the category
    */
   const handleAddLiability = useCallback(
      (category) => () => {
         navigate({pathname: EDIT_PATH, search: searchAsString}, {state: {category}});
      },
      [navigate, searchAsString],
   );

   /**
    * On row select, navigate to the edit drawer for the liability.
    *
    * @param original the original instance
    */
   const handleRowSelect = useCallback(
      (original) => {
         navigate({pathname: EDIT_PATH, search: searchAsString}, {state: {id: original?.liabilityId || original?.id}});
      },
      [navigate, searchAsString],
   );

   /**
    * Submit the liability.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (event, liability) => {
         event?.stopPropagation();
         event?.preventDefault();

         try {
            const liabilityEdited = {...liability};
            delete liabilityEdited.liabilityCategory;
            delete liabilityEdited.bank;

            const removedDate = moment(liability?.removedDate) || moment();
            let useHistoryDate = liability?.historyDate ? liability?.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(liability?.startDate)) {
               useHistoryDate = moment(liability?.startDate);
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...liabilityEdited,
               id: liabilityEdited?.liabilityId,
               isCollateral: !liabilityEdited?.isCollateral,
            };

            await liabilityCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  liability: {
                     ...liability,
                     collateralString: variables?.isCollateral ? 'Yes' : 'No',
                     isCollateral: variables?.isCollateral,
                  },
               },
               update: cacheUpdate(getLiabilityUpdateQueries(entityId, historyDate), liability?.id, 'liability'),
               refetchQueries: () => getLiabilityRefetchQueries(entityId, variables?.id, historyDate),
            });
         } catch (e) {
            console.log(e);
         }
      },
      [liabilityCreateUpdate, entityId, historyDate],
   );

   const [liabilityDelete] = useMutationFHG(LIABILITY_DELETE);

   const handleDelete = useCallback(
      async (event, liability) => {
         try {
            event?.stopPropagation();
            event?.preventDefault();
            if (liability?.isRemoved) {
               await liabilityDelete({
                  variables: {id: liability?.liabilityId},
                  optimisticResponse: {liability_Delete: 1},
               });
               refetch();
            } else {
               let useHistoryDate = liability?.historyDate
                  ? liability?.historyDate
                  : moment(historyDate, DATE_DB_FORMAT);

               if (useHistoryDate.isBefore(liability?.startDate)) {
                  useHistoryDate = moment(liability?.startDate);
               }

               const variables = {
                  ...liability,
                  id: liability?.liabilityId,
                  isRemoved: true,
                  removedDate: moment(historyDate).endOf('month').format('YYYY-MM-DD'),
                  liabilityCategory: liability?.liabilityCategory?.name,
                  bank: liability?.bank?.name,
                  historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               };

               await liabilityCreateUpdate({
                  variables,
                  optimisticResponse: {
                     __typename: 'Mutation',
                     liability: {
                        ...liability,
                        isRemoved: true,
                        removedDate: moment(historyDate).endOf('month').format('YYYY-MM-DD'),
                     },
                  },
                  update: cacheUpdate(getLiabilityUpdateQueries(entityId, historyDate), liability?.id, 'liability'),
                  refetchQueries: () => getLiabilityRefetchQueries(entityId, liability?.id, historyDate),
               });
            }
         } catch (error) {
            console.log(error);
         }
      },
      [entityId, historyDate, liabilityCreateUpdate, liabilityDelete, refetch],
   );

   // Create the columns for the liabilities table.
   const columns = useMemo(() => {
      return [
         {
            id: 'description',
            Header: <TypographyFHG id={'liability.description.column'} component={'span'} />,
            minWidth: 180,
            width: 180,
            maxWidth: 180,
            accessor: 'description',
            Cell: (row) => (
               <TypographyWithHover
                  style={{
                     fontSize: theme.components.MuiTableCell.styleOverrides.root.fontSize,
                     fontFamily: theme.components.MuiTableCell.styleOverrides.root.fontFamily,
                     fontWeight: theme.components.MuiTableCell.styleOverrides.root.fontWeight,
                  }}
               >
                  {row.value}
               </TypographyWithHover>
            ),
         },
         {
            id: 'lastUpdated',
            Header: <TypographyFHG id={'liability.lastUpdate.column'} component={'span'} />,
            accessor: 'updatedDateTime',
            minWidth: 125,
            width: 125,
            maxWidth: 125,
            Cell: (row) => <TypographyFHG id={'liability.lastUpdate.cell'} values={{value: moment(row.value)}} />,
         },
         {
            id: 'interestRate',
            Header: <TypographyFHG id={'liability.interestRate.column'} component={'span'} />,
            accessor: 'interestRate',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter('##0.0#%', row.values?.interestRate)}</div>
            ),
         },
         {
            id: 'payment',
            Header: <TypographyFHG id={'liability.payment.column'} component={'span'} />,
            accessor: 'payment',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.payment)}</div>
            ),
         },
         {
            id: 'paymentDueDate',
            Header: <TypographyFHG id={'liability.paymentDueDate.column'} component={'span'} />,
            accessor: 'paymentDueDate',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
         },
         {
            id: 'paymentMaturityDate',
            Header: <TypographyFHG id={'liability.paymentMaturityDate.column'} component={'span'} />,
            accessor: 'paymentMaturityDate',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) =>
               row.original.paymentMaturityDate
                  ? moment(row.original.paymentMaturityDate).format(DATE_FORMAT_KEYBOARD)
                  : '',
         },
         {
            id: 'bank',
            Header: <TypographyFHG id={'liability.bankDebst.column'} component={'span'} />,
            accessor: 'bank.name',
            minWidth: 200,
            width: 200,
            maxWidth: 200,
            Cell: (row) => {
               return (
                  <TypographyWithHover
                     style={{
                        fontSize: theme.components.MuiTableCell.styleOverrides.root.fontSize,
                        fontFamily: theme.components.MuiTableCell.styleOverrides.root.fontFamily,
                        fontWeight: theme.components.MuiTableCell.styleOverrides.root.fontWeight,
                     }}
                  >
                     {row.value}
                  </TypographyWithHover>
               );
            },
            Footer: 'Total',
         },
         {
            id: 'collateralString',
            Header: <TypographyFHG id={'liability.collateral.column'} component={'span'} />,
            accessor: 'collateralString',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <Grid container justifyContent={'center'}>
                  <Chip
                     size='small'
                     label={row.values?.collateralString}
                     style={{
                        margin: 'auto',
                        width: 67,
                        backgroundColor: row?.original?.isCollateral ? theme.palette.table.header.secondary : undefined,
                     }}
                     onClick={(event) => handleSubmit(event, row.original)}
                  />
               </Grid>
            ),
         },
         {
            id: 'removedLabel',
            Header: <TypographyFHG id={'liability.removed.column'} component={'span'} />,
            accessor: 'removedLabel',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            show: categoryId === REMOVED_LIABILITIES_CATEGORY_OBJECT?.id,
            Cell: ({row}) => (
               <Grid container justifyContent={'center'}>
                  {row?.original?.isRemoved && <Block color={'error'} />}
               </Grid>
            ),
         },
         {
            id: 'amount',
            Header: <TypographyFHG id={'liability.amount.column'} component={'span'} />,
            accessor: 'amount',
            minWidth: 100,
            width: 100,
            maxWidth: 100,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.amount)}</div>
            ),
            Footer: (info) => {
               // Only calculate total visits if rows change
               const sum = React.useMemo(() => {
                  return info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
               }, [info.rows, info.column.id]);
               return (
                  <div
                     style={{
                        textAlign: 'right',
                        color: sum > 0 ? undefined : theme.palette.error.main,
                     }}
                  >
                     {numberFormatter(CURRENCY_FORMAT, sum)}
                  </div>
               );
            },
         },
         {
            id: 'remove',
            Header: <TypographyFHG id={'liability.remove.column'} component={'span'} />,
            width: 75 * SCALE_APP,
            minWidth: 75 * SCALE_APP,
            maxWidth: 75 * SCALE_APP,
            Cell: ({row}) => (
               <Box display='flex' justifyContent='center' alignItems='center'>
                  <ConfirmIconButton
                     onConfirm={(e) => handleDelete(e, row.original)}
                     values={{type: 'liability'}}
                     titleKey={row.original?.isRemoved ? 'confirmRemove.title' : 'confirmActualRemove.title'}
                     messageKey={
                        row.original?.isRemoved ? 'confirmPermanentDelete.message' : 'confirmActualRemove.message'
                     }
                     buttonLabelKey={row.original?.isRemoved ? 'delete.button' : 'remove.button'}
                  >
                     <Delete color={theme.palette.mode === 'dark' ? 'error' : 'secondary'} />
                  </ConfirmIconButton>
               </Box>
            ),
         },
      ];
   }, [
      categoryId,
      theme.components.MuiTableCell.styleOverrides.root.fontSize,
      theme.components.MuiTableCell.styleOverrides.root.fontFamily,
      theme.components.MuiTableCell.styleOverrides.root.fontWeight,
      theme.palette.table.header.secondary,
      theme.palette.error.main,
      handleSubmit,
   ]);

   const getLiabilityRefetchQueries = (entityId, liabilityId, historyDate) => {
      return [
         {
            query: LIABILITY_QUERY,
            variables: {liabilityId, historyDate},
            queryPath: 'liability',
         },
      ];
   };

   const getLiabilityUpdateQueries = (entityId, historyDate) => {
      return [
         {
            query: LIABILITIES_ENTITY_QUERY,
            variables: {entityId, historyDate},
            queryPath: 'liabilities',
         },
      ];
   };

   const currentLiabilities = useMemo(() => {
      if (Object.values(liabilityGroupsByCategory)?.length > 0) {
         return filter(
            Object.values(liabilityGroupsByCategory),
            (item) => item?.[0]?.liabilityCategory?.term === 'current',
         );
      }

      return [];
   }, [liabilityGroupsByCategory]);

   const intermediateLiabilities = useMemo(() => {
      if (Object.values(liabilityGroupsByCategory)?.length > 0) {
         return filter(
            Object.values(liabilityGroupsByCategory),
            (item) => item?.[0]?.liabilityCategory?.term === 'intermediate',
         );
      }

      return [];
   }, [liabilityGroupsByCategory]);

   const longTermLiabilities = useMemo(() => {
      if (Object.values(liabilityGroupsByCategory)?.length > 0) {
         return filter(
            Object.values(liabilityGroupsByCategory),
            (item) => item?.[0].liabilityCategory?.term === 'long',
         );
      }

      return [];
   }, [liabilityGroupsByCategory]);

   const removedList = useMemo(() => {
      return Object.values(liabilityGroupsByCategoryRemoved);
   }, [liabilityGroupsByCategoryRemoved]);

   const handleLiabilityCreateUpdate = useCallback(
      async (event, liability) => {
         event?.stopPropagation();
         event?.preventDefault();

         try {
            const liabilityEdited = {...liability};
            delete liabilityEdited.liabilityCategory;
            delete liabilityEdited.bank;

            let useHistoryDate = liability?.historyDate ? liability?.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(liability?.startDate)) {
               useHistoryDate = moment(liability?.startDate);
            }

            const variables = {
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...liabilityEdited,
               id: liabilityEdited?.liabilityId,
               isRemoved: false,
               removedDate: null,
            };

            await liabilityCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  liability: {
                     ...liability,
                     isRemoved: false,
                     removedDate: null,
                  },
               },
               update: cacheUpdate(getLiabilityUpdateQueries(entityId, historyDate), liability?.id, 'liability'),
               refetchQueries: () => getLiabilityRefetchQueries(entityId, variables?.id, historyDate),
            });
         } catch (e) {
            console.log(e);
         }
      },
      [entityId, historyDate, liabilityCreateUpdate],
   );

   const currentTab = useMemo(
      () => (
         <>
            {currentLiabilities?.length > 0 ? (
               currentLiabilities?.map((data, rowIndex) => (
                  <Stack key={rowIndex}>
                     <TableNewUiFHG
                        key={'Current Liabilities' + rowIndex}
                        name={'Current Liabilities'}
                        columns={columns}
                        data={data}
                        title={data?.[0].liabilityCategory?.name}
                        classes={{
                           headerTextStyle: classes.headerTextStyle,
                           tableStyle: classes.tableStyle,
                           totalFooter: classes.totalFooter,
                        }}
                        allowSearch={true}
                        searchFilter={search}
                        emptyTableMessageKey={
                           entityId !== 'undefined' ? 'liability.na.label' : 'liability.noEntity.label'
                        }
                        onSelect={handleRowSelect}
                        stickyExternal={true}
                        hasBorder={false}
                     >
                        <PermissionAllow permissionName={ASSETS_EDIT}>
                           <ButtonFHG
                              variant={'contained'}
                              labelKey={'liability.add.button'}
                              startIcon={<AddCircleOutline />}
                              onClick={handleAddLiability(data?.[0].liabilityCategory)}
                              disabled={entityId === 'undefined'}
                           />
                        </PermissionAllow>
                     </TableNewUiFHG>
                  </Stack>
               ))
            ) : (
               <Empty open={!!clientId || !!entityId} titleMessageKey={'liability.noCurrentLiabilities.label'}>
                  <PermissionAllow permissionName={ASSETS_EDIT}>
                     <ButtonFHG
                        variant={'contained'}
                        labelKey={'liability.addLiabilities.button'}
                        onClick={handleAddLiability()}
                     />
                  </PermissionAllow>
               </Empty>
            )}
         </>
      ),
      [
         classes.headerTextStyle,
         classes.tableStyle,
         classes.totalFooter,
         clientId,
         columns,
         currentLiabilities,
         entityId,
         handleAddLiability,
         handleRowSelect,
         search,
      ],
   );

   const intermediateTab = useMemo(
      () => (
         <>
            {intermediateLiabilities?.length > 0 ? (
               intermediateLiabilities?.map((data, index) => (
                  <TableNewUiFHG
                     key={'Intermediate Liabilities' + index}
                     name={'Intermediate Liabilities'}
                     columns={columns}
                     data={data}
                     title={data?.[0].liabilityCategory?.name}
                     classes={{
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     searchFilter={search}
                     allowSearch={true}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'liability.na.label' : 'liability.noEntity.label'}
                     onSelect={handleRowSelect}
                     stickyExternal={true}
                     hasBorder={false}
                  >
                     <PermissionAllow permissionName={ASSETS_EDIT}>
                        <ButtonFHG
                           variant={'contained'}
                           labelKey={'liability.add.button'}
                           startIcon={<AddCircleOutline />}
                           onClick={handleAddLiability(data?.[0].liabilityCategory)}
                           disabled={entityId === 'undefined'}
                        />
                     </PermissionAllow>
                  </TableNewUiFHG>
               ))
            ) : (
               <Empty titleMessageKey={'liability.noIntermediateLiabilities.label'}>
                  <PermissionAllow permissionName={ASSETS_EDIT}>
                     <ButtonFHG
                        variant='contained'
                        labelKey={'liability.addLiabilities.button'}
                        onClick={handleAddLiability()}
                     />
                  </PermissionAllow>
               </Empty>
            )}
         </>
      ),
      [
         classes.headerTextStyle,
         classes.tableStyle,
         classes.totalFooter,
         columns,
         entityId,
         handleAddLiability,
         handleRowSelect,
         intermediateLiabilities,
         search,
      ],
   );

   const longTermTab = useMemo(
      () => (
         <>
            {longTermLiabilities?.length > 0 ? (
               longTermLiabilities?.map((data, index) => (
                  <TableNewUiFHG
                     key={'Long Term Liabilities' + index}
                     name={'Long Term Liabilities'}
                     columns={columns}
                     data={data}
                     title={data?.[0].liabilityCategory?.name}
                     classes={{
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     searchFilter={search}
                     allowSearch={true}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'liability.na.label' : 'liability.noEntity.label'}
                     onSelect={handleRowSelect}
                     stickyExternal={true}
                     hasBorder={false}
                  >
                     <ButtonFHG
                        variant={'contained'}
                        labelKey={'liability.add.button'}
                        startIcon={<AddCircleOutline />}
                        onClick={handleAddLiability(data?.[0].liabilityCategory)}
                     />
                  </TableNewUiFHG>
               ))
            ) : (
               <Empty titleMessageKey={'liability.noLongTermLiabilities.label'}>
                  <PermissionAllow permissionName={ASSETS_EDIT}>
                     <ButtonFHG
                        variant={'contained'}
                        labelKey={'liability.addLiabilities.button'}
                        onClick={handleAddLiability()}
                     />
                  </PermissionAllow>
               </Empty>
            )}
         </>
      ),
      [
         classes.headerTextStyle,
         classes.tableStyle,
         classes.totalFooter,
         columns,
         entityId,
         handleAddLiability,
         handleRowSelect,
         longTermLiabilities,
         search,
      ],
   );

   const removedTab = useMemo(
      () => (
         <>
            {removedList?.length > 0 ? (
               removedList?.map((data, index) => (
                  <TableNewUiFHG
                     key={'Removed Liabilities' + index}
                     name={'Remove Liabilities'}
                     columns={[
                        ...columns.slice(0, columns.length - 1),
                        {
                           id: 'id',
                           Header: <TypographyFHG id={'liability.undo.column'} component={'span'} />,
                           accessor: 'id',
                           headerTextAlign: 'center',
                           width: 75 * SCALE_APP,
                           minWidth: 75 * SCALE_APP,
                           maxWidth: 75 * SCALE_APP,
                           Cell: ({row}) => (
                              <Grid container justifyContent={'center'}>
                                 <IconButton
                                    onClick={(event) => {
                                       handleLiabilityCreateUpdate(event, row.original);
                                    }}
                                 >
                                    <ReplayIcon />
                                 </IconButton>
                              </Grid>
                           ),
                        },
                     ]}
                     data={data}
                     title={data?.[0].liabilityCategory?.name}
                     classes={{
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     searchFilter={search}
                     allowSearch={true}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'liability.na.label' : 'liability.noEntity.label'}
                     onSelect={handleRowSelect}
                     stickyExternal={true}
                     hasBorder={false}
                  >
                     <PermissionAllow permissionName={ASSETS_EDIT}>
                        <ButtonFHG
                           variant={'contained'}
                           labelKey={'liability.add.button'}
                           startIcon={<AddCircleOutline />}
                           onClick={handleAddLiability(data?.[0].liabilityCategory)}
                        />
                     </PermissionAllow>
                  </TableNewUiFHG>
               ))
            ) : (
               <Empty titleMessageKey={'liability.noRemoved.tab'} />
            )}
         </>
      ),
      [
         classes.headerTextStyle,
         classes.tableStyle,
         classes.totalFooter,
         columns,
         entityId,
         handleAddLiability,
         handleRowSelect,
         removedList,
         search,
         handleLiabilityCreateUpdate,
      ],
   );

   const wrapperTab = useCallback(
      (name, content) => {
         return (
            <ScrollStack
               name={name}
               className={classes.tableStyle}
               direction={'column'}
               innerStackProps={{
                  style: {
                     ...scaleStyle,
                     width: `${100 / scale}%`,
                     height: `${100 / scale}%`,
                  },
                  spacing: 5,
                  height: 'fit-content',
                  maxHeight: '100%',
               }}
            >
               {content}
            </ScrollStack>
         );
      },
      [classes.tableStyle, scale, scaleStyle],
   );

   return (
      <Stack
         ref={ref}
         name={'Liabilities Component'}
         width={'100%'}
         height={'100%'}
         direction={'column'}
         flexWrap={'nowrap'}
         display={'flex'}
         overflow={'hidden'}
      >
         <Header idTitle='liability.title' values={{month, year}}>
            <Box sx={{ml: 'auto !important'}}>{buttonPanel}</Box>
            <ExportChoiceButton selectedIndex={LIABILITY_INDEX} disabled={liabilities?.length <= 0} />
         </Header>

         <Grid name={'totalsValuesArea'} spacing={3} overflow='visible' container sx={{mb: 2, mr: -0.6}}>
            <Grid item xs={6} lg={4} xl={3} overflow={'visible'}>
               <OverviewPanel
                  titleKey={'liability.total.title'}
                  value={totalLiabilities}
                  change={
                     totalLiabilitiesPrevious
                        ? ((totalLiabilities - totalLiabilitiesPrevious) / totalLiabilitiesPrevious) * 100
                        : undefined
                  }
                  maxWidth={MAX_WIDTH_OVERVIEW}
                  minWidth={MIN_WIDTH_OVERVIEW}
               />
            </Grid>
            <Grid item xs={6} lg={4} xl={3} overflow='visible'>
               <OverviewPanel
                  titleKey={'liability.totalCurrent.title'}
                  value={totalCurrent}
                  change={
                     totalCurrentPrevious > 0
                        ? ((totalCurrent - totalCurrentPrevious) / totalCurrentPrevious) * 100
                        : undefined
                  }
                  maxWidth={MAX_WIDTH_OVERVIEW}
                  minWidth={MIN_WIDTH_OVERVIEW}
               />
            </Grid>
            <Grid item xs={6} lg={4} xl={3} overflow='visible'>
               <OverviewPanel
                  titleKey={'liability.totalIntermediate.title'}
                  value={totalIntermediate}
                  change={
                     totalIntermediatePrevious > 0
                        ? ((totalIntermediate - totalLiabilitiesPrevious) / totalIntermediatePrevious) * 100
                        : undefined
                  }
                  maxWidth={MAX_WIDTH_OVERVIEW}
                  minWidth={MIN_WIDTH_OVERVIEW}
               />
            </Grid>
            <Grid item xs={6} lg={4} xl={3} overflow='visible'>
               <OverviewPanel
                  titleKey={'liability.totalLong.title'}
                  value={totalLong}
                  change={
                     totalLongPrevious > 0 ? ((totalLong - totalLongPrevious) / totalLongPrevious) * 100 : undefined
                  }
                  maxWidth={MAX_WIDTH_OVERVIEW}
                  minWidth={MIN_WIDTH_OVERVIEW}
               />
            </Grid>
         </Grid>
         {!clientId || !entityId ? (
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
            <>
               <Stack className={classes.filterTablet} direction={'row'} alignItems={'center'} spacing={4}>
                  <AutocompleteMatchLXData
                     id={'categorySelect'}
                     sx={{minWidth: 200, mb: 1}}
                     key={'categorySelect' + liabilitiesCategoriesMenuItems?.length + ' ' + categoryId}
                     name={'entityId'}
                     label={'Filter by Category'}
                     defaultValue={categoryId}
                     options={liabilitiesCategoriesMenuItems}
                     autoFocus={false}
                     disableClearable
                     onChange={handleSelectCategory}
                     textFieldProps={{variant: 'outlined'}}
                     matchSorterProps={{keys: ['_default', 'name']}}
                     noOptionsText={
                        <div>
                           <div>No Businesses.</div>
                           <div>Create a new Business.</div>
                        </div>
                     }
                     inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                  />
               </Stack>
               <Tabs
                  name='Tab buttons'
                  value={selectedTab}
                  onChange={handleTabChange}
                  className={classes.tabs}
                  sx={{
                     flex: '0 0',
                     minHeight: 60,
                     mt: 3,
                     '@media (max-height: 600px)': {mt: 1},
                  }}
               >
                  <Tab value={ALL_TAB} label={formatMessage(intl, 'liability.all.tab')} />
                  <Tab value={CURRENT_TAB} label={formatMessage(intl, 'liability.current.tab')} />
                  <Tab value={INTERMEDIATE_TAB} label={formatMessage(intl, 'liability.intermediate.tab')} />
                  <Tab value={LONG_TERM_TAB} label={formatMessage(intl, 'liability.long.tab')} />
                  <Tab value={REMOVED_TAB} label={formatMessage(intl, 'liability.removed.tab')} />
                  <Box flex={'1 1'} />
                  <Stack className={classes.filter} direction={'row'} alignItems={'center'} spacing={4} sx={{mb: 2}}>
                     <AutocompleteMatchLXData
                        id={'categorySelect'}
                        sx={{minWidth: 200, mb: 1}}
                        key={'categorySelect' + liabilitiesCategoriesMenuItems?.length + ' ' + categoryId}
                        name={'entityId'}
                        label={'Filter by Category'}
                        defaultValue={categoryId}
                        options={liabilitiesCategoriesMenuItems}
                        autoFocus={false}
                        disableClearable
                        onChange={handleSelectCategory}
                        textFieldProps={{variant: 'outlined'}}
                        matchSorterProps={{keys: ['_default', 'name']}}
                        noOptionsText={
                           <div>
                              <div>No Businesses.</div>
                              <div>Create a new Business.</div>
                           </div>
                        }
                        inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                     />
                  </Stack>
               </Tabs>
               <Stack
                  name='Outer Liabilities Tabs Frame'
                  overflow={'hidden'}
                  height={'100%'}
                  width={'100%'}
                  flex={'1 1'}
               >
                  {
                     {
                        [ALL_TAB]: wrapperTab(
                           'All Tab',
                           <>
                              {currentLiabilities.length === 0 &&
                              intermediateLiabilities.length === 0 &&
                              longTermLiabilities.length === 0 ? (
                                 <Empty
                                    open={!!clientId || !!entityId}
                                    titleMessageKey={'liability.noLiabilities.label'}
                                 >
                                    <ButtonFHG
                                       variant={'contained'}
                                       labelKey={'liability.addLiabilities.button'}
                                       onClick={handleAddLiability()}
                                    />
                                 </Empty>
                              ) : (
                                 <>
                                    {currentLiabilities.length > 0 && currentTab}
                                    {intermediateLiabilities.length > 0 && intermediateTab}
                                    {longTermLiabilities.length > 0 && longTermTab}
                                 </>
                              )}
                           </>,
                        ),
                        [CURRENT_TAB]: wrapperTab('Current Tab', currentTab),
                        [INTERMEDIATE_TAB]: wrapperTab('Intermediate Tab', intermediateTab),
                        [LONG_TERM_TAB]: wrapperTab('Long term tab', longTermTab),
                        [REMOVED_TAB]: wrapperTab('Removed tab', removedTab),
                     }[selectedTab]
                  }
               </Stack>
            </>
         )}
         <Outlet />
      </Stack>
   );
}
