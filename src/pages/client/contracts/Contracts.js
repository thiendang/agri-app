import {Stack, Tab, Tabs} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import {indexOf} from 'lodash';
import filter from 'lodash/filter';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {stringify} from 'query-string';
import {parse} from 'query-string';
import {useState} from 'react';
import React from 'react';
import {useEffect} from 'react';
import {useMemo} from 'react';
import {Outlet} from 'react-router-dom';
import {useNavigate, useLocation} from 'react-router-dom';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import Header from '../../../components/Header';
import {BORDER_RADIUS_10, DARK_MODE_COLORS} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {CONTRACTS_EDIT} from '../../../components/permission/PermissionAllow';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import {CASH_EDIT_PATH, FUTURE_EDIT_PATH, HEDGE_EDIT_PATH} from '../../../Constants';
import {CONTRACTS_INDEX} from '../../../Constants';
import {CURRENCY_FORMAT} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {CONTRACT_EDIT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {ENTITY_BY_ID_QUERY} from '../../../data/QueriesGL';
import {HEDGE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {FUTURE_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';
import {CASH_CONTRACTS_ENTITY_QUERY} from '../../../data/QueriesGL';

import Grid from '../../../fhg/components/Grid';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {userRoleState} from '../../Main';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useIntl} from 'react-intl';
import ScrollStack from '../../../fhg/ScrollStack';
import TableNewUiFHG from '../../../fhg/components/table/TableNewUiFHG';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import {AddCircleOutline} from '@mui/icons-material';
import Empty from '../../../components/Empty';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import {useTheme} from '@mui/styles';
import {entityState} from '../../admin/EntityListDropDown';

const REMOVED_CATEGORY = 'Removed Contracts';
export const CASH_CONTRACTS_CATEGORY = 'Cash Contracts';
export const FUTURE_CONTRACTS_CATEGORY = 'Future Contracts';
export const HEDGE_CONTRACTS_CATEGORY = 'Hedge Contracts';
export const INIT = 'All Contracts';

const contractCategories = [
   {id: INIT, name: INIT},
   {id: REMOVED_CATEGORY, name: REMOVED_CATEGORY},
];

const CURRENT_TAB = 'current';
const INTERMEDIATE_TAB = 'intermediate';
const LONG_TAB = 'long';

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: theme.palette.mode === 'dark' ? '#1D1D1D !important' : '#FFFFFF !important',
         padding: theme.spacing(0, 2),
         boxShadow: theme.shadows[1],
         marginLeft: theme.spacing(2),
      },
      headerTextStyle: {
         fontWeight: 500,
      },
      tableStyle: {
         cursor: 'pointer',
         borderRadius: BORDER_RADIUS_10,
         '& .searchBarTitleStyle': {
            position: 'sticky',
            left: 20,
            zIndex: 4,
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
         totalFooter: {
            position: 'sticky',
            right: 10,
         },
         '& .MuiTableCell-stickyHeader': {
            top: 0,
         },
      },
      totalFooter: {
         position: 'sticky',
         right: 10,
      },
      content: {
         marginTop: '20px',
         backgroundColor: '#FBFBFB',
         cursor: 'pointer',
         borderRadius: BORDER_RADIUS_10,
         boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
      },
      tableStyle2: {
         cursor: 'pointer',
         padding: theme.spacing(0, 3, 2, 2),
      },
      frameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      date: {
         '& > .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeEnd.MuiIconButton-sizeMedium': {
            marginRight: '0px',
            color: theme.palette.primary.main,
         },
      },
      plusIcon: {
         width: '20px',
         height: '20px',
      },
      root: {
         backgroundColor: theme.palette.background.default,
         // paddingTop: '20px',
         display: 'flex',
         overflow: 'auto',
      },
      exportView: {
         justifyContent: 'flex-end',
         alignItems: 'center',
         display: 'flex',
         flex: 1,
      },
      search: {
         alignItems: 'center',
         display: 'flex',
         height: '44px',
         paddingLeft: '10px',
         paddingRight: '10px',
         boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
      },
      business: {
         backgroundColor: theme.palette.background.default,
         boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
         borderRadius: BORDER_RADIUS_10,
         borderWidth: '0px',
         height: '41px',
         width: 250 * SCALE_APP,
         padding: theme.spacing(0, 1.25),
         marginLeft: theme.spacing(0.75),
         color: 'theme.palette.text.darkGrey',
         fontWeight: 400,
         fontSize: 16 * SCALE_APP,
         margin: theme.spacing(0.125),
      },
      reportDate: {
         backgroundColor: theme.palette.background.default,
         boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
         borderRadius: BORDER_RADIUS_10,
         borderWidth: '0px',
         width: 250 * SCALE_APP,
         marginLeft: theme.spacing(0.75),
         color: 'theme.palette.text.darkGrey',
         fontWeight: 400,
         fontSize: 16 * SCALE_APP,
         margin: theme.spacing(0.125),
      },
      iconExport: {
         width: 20 * SCALE_APP,
         height: 20 * SCALE_APP,
         marginRight: theme.spacing(1.75),
      },
      label: {
         fontSize: 16 * SCALE_APP,
         fontWeight: '700',
      },
      button: {
         marginRight: theme.spacing(1),
         boxShadow: theme.shadows[5],
         margin: 2,
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
         [theme.breakpoints.down('md')]: {
            display: 'inline-flex',
         },
         [theme.breakpoints.up('md')]: {
            display: 'none',
         },
      },
      filter: {
         [theme.breakpoints.down('md')]: {
            display: 'none',
         },
         [theme.breakpoints.up('md')]: {
            display: 'inline-flex',
         },
         width: '180px',
      },
   }),
   {name: 'ContractsStyles'},
);

/**
 * Contract List component to display all the Contracts & Hedges.
 *
 * Reviewed:
 */
export default function Contracts() {
   const [{clientId: clientIdProp, entityId, reportDate, category}, , searchAsString] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const location = useLocation();
   const navigate = useNavigate();
   const hasPermission = usePermission(CONTRACTS_EDIT);

   const setEntityStatus = useSetRecoilState(entityState);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   const classes = useStyles();

   const hadSelectAll = useMemo(() => !!clientId && !!entityId, [clientId, entityId]);

   const [selectedTab, setSelectedTab] = useState(CURRENT_TAB);

   const [selectedCategory, setSelectedCategory] = React.useState(null);

   const [pdfReportReady, setPdfReportReady] = useState(false);

   const historyDate = useMemo(
      () => (reportDate ? moment(reportDate, MONTH_FORMAT).format(DATE_DB_FORMAT) : moment().format(DATE_DB_FORMAT)),
      [reportDate],
   );
   const month = moment(reportDate, MONTH_FORMAT)?.format('MMMM');
   const year = moment(reportDate, MONTH_FORMAT)?.year();

   const [cashContractsData] = useQueryFHG(CASH_CONTRACTS_ENTITY_QUERY, {
      variables: {entityId, historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const cashContracts = useMemo(() => {
      if (cashContractsData?.cashContracts) {
         if (!selectedCategory || selectedCategory === INIT) return cashContractsData?.cashContracts || [];
         return filter(cashContractsData?.cashContracts || [], {isRemoved: selectedCategory === REMOVED_CATEGORY});
      }
      return undefined;
   }, [cashContractsData?.cashContracts, selectedCategory]);

   const [futureContractsData] = useQueryFHG(FUTURE_CONTRACTS_ENTITY_QUERY, {
      variables: {entityId, historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const futureContracts = useMemo(() => {
      if (futureContractsData?.futureContracts) {
         if (!selectedCategory || selectedCategory === INIT) return futureContractsData?.futureContracts || [];
         return filter(futureContractsData?.futureContracts || [], {isRemoved: selectedCategory === REMOVED_CATEGORY});
      }
      return undefined;
   }, [futureContractsData?.futureContracts, selectedCategory]);

   const [hedgeContractsData] = useQueryFHG(HEDGE_CONTRACTS_ENTITY_QUERY, {
      variables: {entityId, historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
   });

   const hedgeContracts = useMemo(() => {
      if (hedgeContractsData?.hedgeContracts) {
         if (!selectedCategory || selectedCategory === INIT) return hedgeContractsData?.hedgeContracts || [];
         return filter(hedgeContractsData?.hedgeContracts || [], {isRemoved: selectedCategory === REMOVED_CATEGORY});
      }
      return undefined;
   }, [hedgeContractsData?.hedgeContracts, selectedCategory]);

   const [searchFilter, setSearchFilter] = useState();

   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId)},
      'entity.type',
   );

   useEffect(() => {
      setPdfReportReady(
         (cashContracts?.length > 0 || futureContracts?.length > 0 || hedgeContracts?.length > 0) &&
            entityData?.entity.name,
      );
   }, [cashContracts, entityData?.entity.name, futureContracts, hedgeContracts]);

   usePageTitle({
      titleKey: 'contract.title',
      values: {month, year},
   });

   /**
    * Set the selected category based on the category in the search parameters for the location
    */
   useEffect(() => {
      if (!!category && category !== selectedCategory && contractCategories?.length > 0) {
         const useSelectedCategoryIndex = indexOf(contractCategories, category);

         if (useSelectedCategoryIndex >= 0) {
            setSelectedCategory(contractCategories[useSelectedCategoryIndex]);
         } else {
            setSelectedCategory(undefined);
         }
         setSearchFilter(undefined);
      }
   }, [category, selectedCategory]);

   /**
    * On select category, close the menu and select the category. Add the category to the location search.
    *
    * @param event the event to select the category.
    * @param category The category selected.
    * @return {(function(): void)|*}
    */
   const handleSelectCategory = (event, category) => {
      const categoryId = category.id;
      setSelectedCategory(categoryId);
      setSearchFilter(undefined);
      const searchParams = parse(location.search, {parseBooleans: true, parseNumbers: true});
      searchParams.category = categoryId;
      const search = stringify(searchParams);
      navigate({pathname: location.pathname, search});
   };

   /**
    * On Add Contract, navigate to show the edit drawer.
    */
   const handleAddContract = (category) => () => {
      let pathname = CASH_EDIT_PATH;

      if (category === HEDGE_CONTRACTS_CATEGORY) {
         pathname = HEDGE_EDIT_PATH;
      }
      if (category === FUTURE_CONTRACTS_CATEGORY) {
         pathname = FUTURE_EDIT_PATH;
      }
      navigate({pathname, search: searchAsString}, {replace: true, state: {edit: CONTRACT_EDIT, category}});
   };

   /**
    * On row select, navigate to show the edit drawer for the contract.
    * @param category The category of contract to edit.
    */
   const handleRowSelect = (category) => (original) => {
      if (hasPermission) {
         let pathname = CASH_EDIT_PATH;

         if (category === HEDGE_CONTRACTS_CATEGORY) {
            pathname = HEDGE_EDIT_PATH;
         }
         if (category === FUTURE_CONTRACTS_CATEGORY) {
            pathname = FUTURE_EDIT_PATH;
         }
         navigate(
            {pathname, search: searchAsString},
            {replace: true, state: {edit: CONTRACT_EDIT, category, id: original?.contractId}},
         );
      }
   };

   /**
    * Create the columns for the contracts table.
    */
   const cashColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: <TypographyFHG id={'contract.crop.column'} component={'span'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
         },
         {
            accessor: 'isNew',
            Header: <TypographyFHG id={'contract.new.column'} component={'span'} />,
            minWidth: 50,
            width: 50,
            maxWidth: 50,
            Cell: ({row}) => (row?.values?.isNew ? 'Yes' : 'No'),
         },
         {
            accessor: 'bushelsSold',
            Header: <TypographyFHG id={'contract.bushelsSold.column'} component={'span'} />,
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            Cell: ({row}) => <div style={{textAlign: 'right'}}>{row.values?.bushelsSold}</div>,
         },
         {
            accessor: 'price',
            Header: <TypographyFHG id={'contract.price.column'} component={'span'} />,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, row.values?.price)}</div>
            ),
         },
         {
            accessor: 'deliveryMonth',
            Header: <TypographyFHG id={'contract.deliveryMonth.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) =>
               row?.values?.deliveryMonth ? moment(row?.values?.deliveryMonth, 'M').format('MMM') : 'N/A',
         },
         {
            accessor: 'deliveryLocation',
            Header: <TypographyFHG id={'contract.deliveryLocation.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            accessor: 'contractNumber',
            Header: <TypographyFHG id={'contract.contractNumber.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            accessor: 'isDelivered',
            Header: <TypographyFHG id={'contract.delivered.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (row?.values?.isDelivered ? 'Yes' : 'No'),
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'contract.value.column'} component={'span'} />,
            Cell: (info) => {
               const sum = (info.row.values?.bushelsSold || 0) * (info.row.values?.price || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, []);

   /**
    * Create the columns for the futures contracts table.
    */
   const futureColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: <TypographyFHG id={'contract.crop.column'} component={'span'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
         },
         {
            accessor: 'bushels',
            Header: <TypographyFHG id={'contract.bushels.column'} component={'span'} />,
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            Cell: ({row}) => <div style={{textAlign: 'left'}}>{row.values?.bushels}</div>,
         },
         {
            accessor: 'monthYear',
            Header: <TypographyFHG id={'contract.monthYear.column'} component={'span'} />,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => `${row?.original?.month}/${row?.original?.year}`,
         },
         {
            accessor: 'futuresPrice',
            Header: <TypographyFHG id={'contract.futurePrice.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.futuresPrice)}</div>
            ),
         },
         {
            accessor: 'estimatedBasis',
            Header: <TypographyFHG id={'contract.estimatedBasis.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.estimatedBasis)}</div>
            ),
         },
         {
            accessor: 'cashPrice',
            Header: <TypographyFHG id={'contract.cashPrice.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.cashPrice)}</div>
            ),
         },
         {
            accessor: 'contractNumber',
            Header: <TypographyFHG id={'contract.contractNumber.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            accessor: 'deliveryLocation',
            Header: <TypographyFHG id={'contract.deliveryLocation.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'contract.value.column'} component={'span'} />,
            Cell: (info) => {
               const sum = (info.row.values?.bushels || 0) * (info.row.values?.cashPrice || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, []);

   /**
    * Create the columns for the hedges contracts table.
    */
   const hedgeColumns = useMemo(() => {
      return [
         {
            accessor: 'crop',
            Header: <TypographyFHG id={'contract.crop.column'} component={'span'} />,
            minWidth: 300,
            width: 300,
            maxWidth: 300,
         },
         {
            accessor: 'bushels',
            Header: <TypographyFHG id={'contract.bushels.column'} component={'span'} />,
            width: 150,
            minWidth: 150,
            maxWidth: 150,
            Cell: ({row}) => <div style={{textAlign: 'left'}}>{row.values?.bushels}</div>,
         },
         {
            accessor: 'strikePrice',
            Header: <TypographyFHG id={'contract.strikePrice.column'} component={'span'} />,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.strikePrice)}</div>
            ),
         },
         {
            accessor: 'strikeCost',
            Header: <TypographyFHG id={'contract.strikeCost.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.strikeCost)}</div>
            ),
         },
         {
            accessor: 'futuresMonth',
            Header: <TypographyFHG id={'contract.futureMonth.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => `${row?.original?.month}/${row?.original?.year}`,
         },
         {
            accessor: 'currentMarketValue',
            Header: <TypographyFHG id={'contract.currentMarketValue.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FORMAT, row.values?.currentMarketValue)}
               </div>
            ),
         },
         {
            accessor: 'contractNumber',
            Header: <TypographyFHG id={'contract.contractNumber.column'} component={'span'} />,
            width: 75,
            minWidth: 75,
            maxWidth: 75,
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'contract.value.column'} component={'span'} />,
            Cell: (info) => {
               const sum = (info.row.values?.bushels || 0) * (info.row.values?.currentMarketValue || 0);
               return <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, sum)}</div>;
            },
         },
      ];
   }, []);

   const handleTabChange = (event, value) => {
      if (value !== undefined) {
         setSelectedTab(value);
      }
   };

   const intl = useIntl();

   const theme = useTheme();
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

   return (
      <Grid container fullWidth fullHeight direction={'column'} wrap={'nowrap'} className={classes.root}>
         <Outlet />
         <Header idTitle='contract.title' values={{month, year}}>
            <Box sx={{ml: 'auto !important'}}>{buttonPanel}</Box>
            <ExportChoiceButton
               clientId={clientId}
               selectedIndex={CONTRACTS_INDEX}
               entityIds={entityId}
               historyDate={reportDate}
               disabled={!pdfReportReady}
            />
         </Header>
         {hadSelectAll ? (
            <>
               <ProgressIndicator isGlobal={false} />
               <Stack className={classes.filterTablet} direction={'row'} alignItems={'center'} spacing={4}>
                  <AutocompleteMatchLXData
                     id={'categorySelect'}
                     sx={{minWidth: 200, mb: 1}}
                     key={'categorySelect ' + contractCategories?.length + ' ' + category}
                     name={'entityId'}
                     label={'Filter by Category'}
                     defaultValue={category}
                     options={contractCategories}
                     autoFocus={false}
                     disableClearable
                     onChange={handleSelectCategory}
                     textFieldProps={{variant: 'outlined'}}
                     matchSorterProps={{keys: ['_default', 'name']}}
                     noOptionsText={
                        <div>
                           <div>No Categories.</div>
                           <div>Create a new category.</div>
                        </div>
                     }
                     inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                  />
               </Stack>
               <Tabs
                  className={classes.tabs}
                  name='Tab buttons'
                  value={selectedTab}
                  onChange={handleTabChange}
                  sx={{flex: '0 0', minHeight: 60, mt: 3, '@media (max-height: 600px)': {mt: 1}}}
               >
                  <Tab value={CURRENT_TAB} label={formatMessage(intl, 'contract.cashContracts.label')} />
                  <Tab value={INTERMEDIATE_TAB} label={formatMessage(intl, 'contract.futures.label')} />
                  <Tab value={LONG_TAB} label={formatMessage(intl, 'contract.hedges.label')} />
                  <Box flex={'1 1'} />
                  <Stack className={classes.filter} direction={'row'} alignItems={'center'} spacing={4} sx={{mb: 2}}>
                     <AutocompleteMatchLXData
                        id={'categorySelect'}
                        sx={{minWidth: 200, mb: 1}}
                        key={'categorySelect ' + contractCategories?.length + ' ' + category}
                        name={'entityId'}
                        label={'Filter by Category'}
                        defaultValue={category}
                        options={contractCategories}
                        autoFocus={false}
                        disableClearable
                        onChange={handleSelectCategory}
                        textFieldProps={{variant: 'outlined'}}
                        matchSorterProps={{keys: ['_default', 'name']}}
                        noOptionsText={
                           <div>
                              <div>No Categories.</div>
                              <div>Create a new category.</div>
                           </div>
                        }
                        inputProps={{style: {backgroundColor: theme.palette.background.default}}}
                     />
                  </Stack>
               </Tabs>
               <Stack
                  name='Outer Assets Tabs Frame'
                  overflow={'hidden'}
                  width={'100%'}
                  flex={'1 1'}
                  height={`${100 / scale}%`}
               >
                  {
                     {
                        [CURRENT_TAB]: (
                           <ScrollStack
                              name='Current Tab'
                              className={classes.tableStyle}
                              direction={'column'}
                              style={{height: `${100 / scale}%`}}
                              innerStackProps={{
                                 spacing: 5,
                                 style: {...scaleStyle, width: `${100 / scale}%`, height: `${100 / scale}%`},
                              }}
                           >
                              <Grid item fullWidth overflow={'unset'}>
                                 {cashContracts?.length > 0 ? (
                                    <TableNewUiFHG
                                       name={'CashContracts'}
                                       columns={cashColumns}
                                       data={cashContracts}
                                       title={' '}
                                       classes={{
                                          headerTextStyle: classes.headerTextStyle,
                                          tableStyle: classes.tableStyle,
                                          totalFooter: classes.totalFooter,
                                       }}
                                       searchFilter={searchFilter}
                                       emptyTableMessageKey={
                                          entityId !== 'undefined' ? 'contract.na.label' : 'contract.noEntity.label'
                                       }
                                       onSelect={handleRowSelect(CASH_CONTRACTS_CATEGORY)}
                                       stickyExternal={true}
                                    >
                                       <PermissionAllow permissionName={CONTRACTS_EDIT}>
                                          <ButtonFHG
                                             variant={'contained'}
                                             labelKey={'contract.addCashContract.label'}
                                             startIcon={<AddCircleOutline />}
                                             onClick={handleAddContract(CASH_CONTRACTS_CATEGORY)}
                                             disabled={entityId === 'undefined'}
                                          />
                                       </PermissionAllow>
                                    </TableNewUiFHG>
                                 ) : (
                                    <Box mt='24px'>
                                       <Empty open={!!clientId || !!entityId} titleMessageKey={'contract.empty.cash'}>
                                          <PermissionAllow permissionName={CONTRACTS_EDIT}>
                                             <Box display={'flex'} justifyContent={'flex-start'}>
                                                <Button
                                                   onClick={handleAddContract(CASH_CONTRACTS_CATEGORY)}
                                                   variant='contained'
                                                >
                                                   <Box display='flex' alignItems='center'>
                                                      <Box width='9px' />
                                                      <TypographyFHG
                                                         id='contract.addCashContract.label'
                                                         className={classes.label}
                                                      />
                                                   </Box>
                                                </Button>
                                             </Box>
                                          </PermissionAllow>
                                       </Empty>
                                    </Box>
                                 )}
                              </Grid>
                           </ScrollStack>
                        ),
                        [INTERMEDIATE_TAB]: (
                           <ScrollStack
                              name='Intermediate Tab'
                              className={classes.tableStyle}
                              direction={'column'}
                              innerStackProps={{
                                 spacing: 5,
                                 style: {...scaleStyle, width: `${100 / scale}%`, height: `${100 / scale}%`},
                              }}
                           >
                              <Grid item fullWidth overflow={'unset'}>
                                 {futureContracts?.length > 0 ? (
                                    <TableNewUiFHG
                                       name={'FutureContracts'}
                                       columns={futureColumns}
                                       data={futureContracts}
                                       title={' '}
                                       classes={{
                                          headerTextStyle: classes.headerTextStyle,
                                          tableStyle: classes.tableStyle,
                                          totalFooter: classes.totalFooter,
                                       }}
                                       searchFilter={searchFilter}
                                       emptyTableMessageKey={
                                          entityId !== 'undefined' ? 'contract.na.label' : 'contract.noEntity.label'
                                       }
                                       onSelect={handleRowSelect(FUTURE_CONTRACTS_CATEGORY)}
                                       stickyExternal={true}
                                    >
                                       <PermissionAllow permissionName={CONTRACTS_EDIT}>
                                          <ButtonFHG
                                             variant={'contained'}
                                             labelKey={'contract.addFutureContract.label'}
                                             startIcon={<AddCircleOutline />}
                                             onClick={handleAddContract(FUTURE_CONTRACTS_CATEGORY)}
                                             disabled={entityId === 'undefined'}
                                          />
                                       </PermissionAllow>
                                    </TableNewUiFHG>
                                 ) : (
                                    <Box mt='24px'>
                                       <Empty open={!!clientId || !!entityId} titleMessageKey={'contract.empty.future'}>
                                          <PermissionAllow permissionName={CONTRACTS_EDIT}>
                                             <Box display={'flex'} flex={'1 1 0%'} justifyContent={'flex-start'}>
                                                <Button
                                                   onClick={handleAddContract(FUTURE_CONTRACTS_CATEGORY)}
                                                   variant='contained'
                                                >
                                                   <Box display='flex' alignItems='center'>
                                                      <Box width='9px' />
                                                      <TypographyFHG
                                                         id='contract.addFutureContract.label'
                                                         className={classes.label}
                                                      />
                                                   </Box>
                                                </Button>
                                             </Box>
                                          </PermissionAllow>
                                       </Empty>
                                    </Box>
                                 )}
                              </Grid>
                           </ScrollStack>
                        ),
                        [LONG_TAB]: (
                           <ScrollStack
                              name='Long term Tab'
                              className={classes.tableStyle}
                              direction={'column'}
                              innerStackProps={{
                                 spacing: 5,
                                 style: {...scaleStyle, width: `${100 / scale}%`, height: `${100 / scale}%`},
                              }}
                           >
                              <Grid item fullWidth overflow={'unset'}>
                                 {hedgeContracts?.length > 0 ? (
                                    <TableNewUiFHG
                                       name={'HedgeContracts'}
                                       columns={hedgeColumns}
                                       data={hedgeContracts}
                                       title={' '}
                                       classes={{
                                          headerTextStyle: classes.headerTextStyle,
                                          tableStyle: classes.tableStyle,
                                          totalFooter: classes.totalFooter,
                                       }}
                                       searchFilter={searchFilter}
                                       emptyTableMessageKey={
                                          entityId !== 'undefined' ? 'contract.na.label' : 'contract.noEntity.label'
                                       }
                                       onSelect={handleRowSelect(HEDGE_CONTRACTS_CATEGORY)}
                                       stickyExternal={true}
                                    >
                                       <PermissionAllow permissionName={CONTRACTS_EDIT}>
                                          <ButtonFHG
                                             variant={'contained'}
                                             labelKey={'contract.addHedgeContract.label'}
                                             startIcon={<AddCircleOutline />}
                                             onClick={handleAddContract(HEDGE_CONTRACTS_CATEGORY)}
                                             disabled={entityId === 'undefined'}
                                          />
                                       </PermissionAllow>
                                    </TableNewUiFHG>
                                 ) : (
                                    <Box mt='24px'>
                                       <Empty open={!!clientId || !!entityId} titleMessageKey={'contract.empty.hedge'}>
                                          <PermissionAllow permissionName={CONTRACTS_EDIT}>
                                             <Box display={'flex'} flex={'1 1 0%'} justifyContent={'flex-start'}>
                                                <Button
                                                   onClick={handleAddContract(HEDGE_CONTRACTS_CATEGORY)}
                                                   variant='contained'
                                                >
                                                   <Box display='flex' alignItems='center'>
                                                      <TypographyFHG
                                                         id='contract.addHedgeContract.label'
                                                         className={classes.label}
                                                      />
                                                   </Box>
                                                </Button>
                                             </Box>
                                          </PermissionAllow>
                                       </Empty>
                                    </Box>
                                 )}
                              </Grid>
                           </ScrollStack>
                        ),
                     }[selectedTab]
                  }
               </Stack>
            </>
         ) : (
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
         )}
      </Grid>
   );
}
