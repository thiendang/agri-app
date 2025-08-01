// noinspection ES6CheckImport

import {AddCircleOutline} from '@mui/icons-material';
import {Delete} from '@mui/icons-material';
import {Block} from '@mui/icons-material';
import {Modal, Tab} from '@mui/material';
import {Tabs} from '@mui/material';
import {Stack} from '@mui/material';
import {Chip} from '@mui/material';
import {IconButton} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import {omit} from 'lodash';
import {uniqBy} from 'lodash';
import {map} from 'lodash';
import filter from 'lodash/filter';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import isArray from 'lodash/isArray';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useRef} from 'react';
import {useState} from 'react';
import {useCallback} from 'react';
import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {Outlet} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import Empty from '../../../components/Empty';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import Header from '../../../components/Header';
import OverviewPanel from '../../../components/OverviewPanel';
import {BORDER_RADIUS_10, DARK_MODE_COLORS, TREND_ANALYSIS_ICON} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {ASSETS_EDIT} from '../../../components/permission/PermissionAllow';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import {ASSET_INDEX} from '../../../Constants';
import {EDIT_PATH} from '../../../Constants';
import {CURRENCY_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {ASSET_QUERY, BALANCE_REPORT_KMI_DATA_QUERY} from '../../../data/QueriesGL';
import {ASSET_DELETE} from '../../../data/QueriesGL';
import {ASSET_CREATE_UPDATE} from '../../../data/QueriesGL';
import {ASSET_CATEGORY_QUERY} from '../../../data/QueriesGL';
import {ASSETS_ENTITY_QUERY} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import ConfirmIconButton from '../../../fhg/components/ConfirmIconButton';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import useEditData from '../../../fhg/components/edit/useEditData';
import ReplayIcon from '@mui/icons-material/Replay';

import TableNewUiFHG from '../../../fhg/components/table/TableNewUiFHG';
import TypographyWithHover from '../../../fhg/components/table/TypographyWithHover';
import TypographyFHG from '../../../fhg/components/Typography';

import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useEffect from '../../../fhg/hooks/useEffect';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import ScrollStack from '../../../fhg/ScrollStack';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {formatMessage} from '../../../fhg/utils/Utils';
import {getOS} from '../../../fhg/utils/Utils';
import {entityState} from '../../admin/EntityListDropDown';
import {userRoleState} from '../../Main';
import {getAssetDetails} from './AsssetUtil';
import TrendAnalysisChart from '../loanAnalysis/TrendAnalysisChart';

export const TERM_TO_DISPLAY = {current: 'Current', intermediate: 'Intermediate', long: 'Long Term'};
const REMOVED_ASSETS_CATEGORY = 'Removed Assets';
const REMOVED_ASSETS_CATEGORY_OBJECT = {id: 2, _default: -2, name: REMOVED_ASSETS_CATEGORY};
const ALL_CATEGORY = 'All Categories';
const ALL_CATEGORY_ID = 1;
const ALL_CATEGORY_OBJECT = {id: ALL_CATEGORY_ID, _default: -1, name: ALL_CATEGORY};

const ALL_TAB = 'all';
const CURRENT_TAB = 'current';
const INTERMEDIATE_TAB = 'intermediate';
const LONG_TAB = 'long';
const REMOVED_TAB = 'remove';
const MAX_WIDTH_OVERVIEW = 360;
const MIN_WIDTH_OVERVIEW = 180;
const os = getOS();
const isMobile = os === 'iOS' || os === 'Android';

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
         totalFooter: {
            position: 'sticky',
            right: 10,
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
         '& input.MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
      },
      filterTablet: {
         [theme.breakpoints.down('tablet')]: {
            display: 'inline-flex',
         },
         [theme.breakpoints.up('tablet')]: {
            display: 'none',
         },
      },
      filter: {
         [theme.breakpoints.down('tablet')]: {
            display: 'none',
         },
         [theme.breakpoints.up('tablet')]: {
            display: 'inline-flex',
         },
         width: '180px',
      },
   }),
   {name: 'AssetsStyles'},
);

/**
 * Asset List component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function Assets() {
   const [
      {clientId: clientIdProp, entityId: entityIdParam, categoryId = ALL_CATEGORY_ID, search, reportDate, category},
      setSearchParams,
      searchAsString,
   ] = useCustomSearchParams();
   const entityId = isArray(entityIdParam) ? entityIdParam[0] : entityIdParam;
   const pollInterval = useRecoilValue(pollState);
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const intl = useIntl();
   const clientId = userClientId || clientIdProp;
   const navigate = useNavigate();
   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const lastDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
   const month = moment(date, MONTH_FORMAT)?.format('MMMM');
   const year = moment(date, MONTH_FORMAT)?.year();

   const theme = useTheme();
   const classes = useStyles();
   const [selectedTab, setSelectedTab] = useState(ALL_TAB);
   const [openTrendAnalysis, setOpenTrendAnalysis] = React.useState(false);
   const setEntityStatus = useSetRecoilState(entityState);
   const hasPermission = usePermission(ASSETS_EDIT);

   const historyDate = moment(date, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const [editValues, , {getValue}] = useEditData({historyDate});

   const handleShowTrendAnalysis = () => setOpenTrendAnalysis((open) => !open);

   const [assetCreateUpdate] = useMutationFHG(ASSET_CREATE_UPDATE, {historyDate}, true);

   const [assetCategoryData] = useQueryFHG(ASSET_CATEGORY_QUERY, {
      pollInterval,
   });
   //'assetCategory.term'
   const assetCategories = useMemo(
      () => sortBy(assetCategoryData?.assetCategories, ['term', 'name']),
      [assetCategoryData],
   );
   const assetCategoriesMenuItems = useMemo(
      () => [ALL_CATEGORY_OBJECT, REMOVED_ASSETS_CATEGORY_OBJECT, ...filter(assetCategories, {term: selectedTab})],
      [assetCategories, selectedTab],
   );

   const [assetsData] = useQueryFHG(ASSETS_ENTITY_QUERY, {
      variables: {entityId, historyDate: editValues?.historyDate || historyDate},
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
      pollInterval,
   });

   const [previousAssetsData] = useQueryFHG(ASSETS_ENTITY_QUERY, {
      variables: {
         entityId,
         historyDate: moment(editValues?.historyDate || historyDate)
            .subtract(1, 'year')
            .format(DATE_DB_FORMAT),
      },
      skip: !validate(entityId),
      fetchPolicy: 'cache-and-network',
      pollInterval,
   });

   const [balanceReport_KmiData] = useQueryFHG(BALANCE_REPORT_KMI_DATA_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: [ entityId ], endDate: lastDate},
      skip: !validate(entityId),
      pollInterval,
   });

   const totalAssetsTrendAnalysis = balanceReport_KmiData?.balanceReport_KmiData?.assetHistory?.[0]?.totalAssets || [];

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
      if (category && assetCategories?.length > 0) {
         const selectedCategory = find(assetCategories, {name: category});

         if (selectedCategory) {
            setSelectedTab(selectedCategory.term);
            setSearchParams((params) => ({...omit(params, 'category'), categoryId: selectedCategory?.id}));
         }
      }
   }, [assetCategories, category, setSearchParams]);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   const assetList = useMemo(() => uniqBy(assetsData?.assets ?? [], 'id'), [assetsData?.assets]);

   const assetGroups = useMemo(() => groupBy(assetList, 'assetCategory.term'), [assetList]);
   const assetGroupsPrevious = useMemo(
      () => groupBy(previousAssetsData?.assets, 'assetCategory.term'),
      [previousAssetsData],
   );

   const totalCurrent = useMemo(() => {
      return assetGroups?.current ? sumBy(filter(assetGroups?.current, {isRemoved: false}), 'amount') : 0;
   }, [assetGroups]);

   const totalCurrentPrevious = useMemo(() => {
      return assetGroupsPrevious?.current
         ? sumBy(filter(assetGroupsPrevious?.current, {isRemoved: false}), 'amount')
         : 0;
   }, [assetGroupsPrevious]);

   const totalIntermediate = useMemo(() => {
      return assetGroups?.intermediate ? sumBy(filter(assetGroups?.intermediate, {isRemoved: false}), 'amount') : 0;
   }, [assetGroups?.intermediate]);

   const totalIntermediatePrevious = useMemo(() => {
      return assetGroupsPrevious?.intermediate
         ? sumBy(filter(assetGroupsPrevious?.intermediate, {isRemoved: false}), 'amount')
         : 0;
   }, [assetGroupsPrevious?.intermediate]);

   useEffect(() => {
      const historyDate = getValue('historyDate');

      if (historyDate) {
         sessionStorage.filterDate = historyDate ? moment(historyDate).format(MONTH_FORMAT) : undefined;
      }
   }, [getValue]);

   const totalLong = useMemo(() => {
      return assetGroups?.long ? sumBy(filter(assetGroups?.long, {isRemoved: false}), 'amount') : 0;
   }, [assetGroups?.long]);

   const totalLongPrevious = useMemo(() => {
      return assetGroupsPrevious?.long ? sumBy(filter(assetGroupsPrevious?.long, {isRemoved: false}), 'amount') : 0;
   }, [assetGroupsPrevious?.long]);

   const totalAssets = totalLong + totalIntermediate + totalCurrent;
   const totalAssetsPrevious = totalLongPrevious + totalIntermediatePrevious + totalCurrentPrevious || 0;

   // Create the list of assets based on the selected category.
   const assets = useMemo(() => {
      let filteredAssets;

      if (categoryId) {
         if (categoryId === ALL_CATEGORY_OBJECT.id) {
            filteredAssets = filter(assetList, (asset) => asset.isRemoved !== true);
         } else if (categoryId === REMOVED_ASSETS_CATEGORY_OBJECT.id) {
            filteredAssets = filter(assetList, {isRemoved: true});
         } else {
            filteredAssets = filter(assetList, {
               isRemoved: false,
               assetCategoryId: categoryId,
            });
         }
      } else {
         filteredAssets = filter(assetList, (asset) => asset.isRemoved !== true);
      }
      const tableAssets = map(filteredAssets, (asset) => ({
         ...asset,
         removedLabel: asset.isRemoved ? 'removed' : undefined,
         collateralString: asset.isCollateral ? 'Yes' : 'No',
         details: getAssetDetails(asset),
      }));
      return sortBy(tableAssets, ['isRemoved', 'assetCategory.name']);
   }, [assetList, categoryId]);

   const assetsRemoved = useMemo(() => {
      const filteredAssets = filter(assetList, (asset) => asset.isRemoved);
      const tableAssets = map(filteredAssets, (asset) => ({
         ...asset,
         removedLabel: asset.isRemoved ? 'removed' : undefined,
         collateralString: asset.isCollateral ? 'Yes' : 'No',
         details: getAssetDetails(asset),
      }));
      return sortBy(tableAssets, ['isRemoved', 'assetCategory.name']);
   }, [assetList]);

   const assetGroupsByCategory = useMemo(() => groupBy(assets, 'assetCategory.name'), [assets]);

   const assetGroupsByCategoryRemoved = useMemo(() => groupBy(assetsRemoved, 'assetCategory.name'), [assetsRemoved]);

   usePageTitle({titleKey: 'assets.title', values: {month, year}});

   const ref = useRef();

   /**
    * Handle changes to the selected tab.
    *
    * @param event The target of the event that triggered the change.
    * @param value The value of the change.
    */
   const handleTabChange = (event, value) => {
      if (value !== undefined) {
         setSelectedTab(value);
         setSearchParams((params) => omit(params, 'categoryId'));
      }
   };

   /**
    * On select category, close the menu and select the category. Add the category to the location search.
    *
    * @param event The select event.
    * @param category The category selected.
    * @return {(function(): void)|*}
    */
   const handleSelectCategory = (event, category) => {
      setSearchParams((params) => ({...params, categoryId: category?.id}));
   };

   /**
    * On Add Asset, navigate to show the edit drawer.
    */
   const handleAddAsset = useCallback(
      (category) => () => {
         navigate({pathname: EDIT_PATH, search: searchAsString}, {state: {category}});
      },
      [navigate, searchAsString],
   );

   /**
    * On row select, navigate to show the edit drawer for the asset.
    * @param original
    */
   const handleRowSelect = useCallback(
      (original) => {
         navigate({pathname: EDIT_PATH, search: searchAsString}, {state: {id: original?.assetId || original?.id}});
      },
      [navigate, searchAsString],
   );

   /**
    * Submit the asset.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(
      async (event, asset) => {
         event?.stopPropagation();
         event?.preventDefault();

         try {
            const assetEdited = {...asset};
            delete assetEdited.assetCategory;
            delete assetEdited.assetType;
            delete assetEdited.bank;

            let useHistoryDate = asset?.historyDate ? asset?.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(asset?.startDate)) {
               useHistoryDate = moment(asset?.startDate);
            }

            const variables = {
               removedDate: null,
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...assetEdited,
               id: assetEdited?.assetId,
               isCollateral: !assetEdited?.isCollateral,
            };

            await assetCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  asset: {
                     ...asset,
                     collateralString: variables?.isCollateral ? 'Yes' : 'No',
                     isCollateral: variables?.isCollateral,
                  },
               },
               update: cacheUpdate(getAssetUpdateQueries(entityId, historyDate), asset?.id, 'asset'),
               // refetchQueries: () => getAssetRefetchQueries(entityId, variables?.id, historyDate),
            });
         } catch (e) {
            console.log(e);
         }
      },
      [assetCreateUpdate, entityId, historyDate],
   );

   /**
    * Submit the restore asset.
    * @return {Promise<void>}
    */
   const handleSubmitRestored = useCallback(
      async (event, asset) => {
         event?.stopPropagation();
         event?.preventDefault();

         try {
            const assetEdited = {...asset};
            delete assetEdited.assetCategory;
            delete assetEdited.assetType;
            delete assetEdited.bank;

            const removedDate = moment(asset?.removedDate) || moment();
            let useHistoryDate = asset?.historyDate ? asset?.historyDate : moment(historyDate, DATE_DB_FORMAT);

            if (useHistoryDate.isBefore(asset?.startDate)) {
               useHistoryDate = moment(asset?.startDate);
            } else if (useHistoryDate.isAfter(removedDate)) {
               useHistoryDate = removedDate;
            }

            const variables = {
               historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               ...assetEdited,
               id: assetEdited?.assetId,
               isRemoved: false,
               removedDate: null,
            };
            await assetCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  asset: {
                     ...asset,
                     isRemoved: false,
                     removedDate: null,
                  },
               },
               update: cacheUpdate(getAssetUpdateQueries(entityId, historyDate), asset?.id, 'asset'),
               refetchQueries: () => getAssetRefetchQueries(entityId, variables?.id, historyDate),
            });
         } catch (e) {
            console.log(e);
         }
      },
      [assetCreateUpdate, entityId, historyDate],
   );

   const [assetDelete] = useMutationFHG(ASSET_DELETE);
   // remove the asset
   const handleDelete = useCallback(
      async (event, asset) => {
         try {
            event?.stopPropagation();
            event?.preventDefault();

            if (asset.isRemoved) {
               await assetDelete({
                  variables: {id: asset.assetId},
                  optimisticResponse: {asset_Delete: 1},
                  refetchQueries: () => getAssetUpdateQueries(entityId, historyDate),
               });
            } else {
               let useHistoryDate = asset?.historyDate ? asset?.historyDate : moment(historyDate, DATE_DB_FORMAT);

               if (useHistoryDate.isBefore(asset?.startDate)) {
                  useHistoryDate = moment(asset?.startDate);
               }

               const variables = {
                  ...asset,
                  id: asset.assetId,
                  removedDate: moment(historyDate).endOf('month').format('YYYY-MM-DD'),
                  isRemoved: true,
                  assetCategory: asset.assetCategory?.name,
                  bank: asset.bank?.name,
                  historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
               };

               await assetCreateUpdate({
                  variables,
                  optimisticResponse: {
                     __typename: 'Mutation',
                     asset: {
                        ...asset,
                        removedDate: moment(historyDate).endOf('month').format('YYYY-MM-DD'),
                        isRemoved: true,
                     },
                  },
                  update: cacheUpdate(getAssetUpdateQueries(entityId, historyDate), asset?.id, 'asset'),
               });
            }
         } catch (error) {}
      },
      [assetCreateUpdate, assetDelete, entityId, historyDate],
   );

   /**
    * Create the columns for the assets table.
    */
   const columns = useMemo(() => {
      return [
         {
            id: 'description',
            Header: <TypographyFHG id={'assets.description.column'} component={'span'} />,
            accessor: 'description',
            minWidth: (isMobile ? 150 : 300) * SCALE_APP,
            width: (isMobile ? 150 : 300) * SCALE_APP,
            maxWidth: (isMobile ? 150 : 300) * SCALE_APP,
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
            Footer: 'Total',
         },
         {
            id: 'lastUpdated',
            Header: <TypographyFHG id={'asset.lastUpdate.column'} component={'span'} />,
            accessor: 'updatedDateTime',
            minWidth: 125,
            width: 125,
            maxWidth: 125,
            Cell: (row) => <TypographyFHG id={'asset.lastUpdate.cell'} values={{value: moment(row.value)}} />,
         },
         {
            id: 'details',
            Header: <TypographyFHG id={'assets.details.column'} component={'span'} />,
            accessor: 'details',
            minWidth: (isMobile ? 150 : 300) * SCALE_APP,
            width: (isMobile ? 150 : 300) * SCALE_APP,
            maxWidth: (isMobile ? 150 : 300) * SCALE_APP,
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
            id: 'bank',
            Header: <TypographyFHG id={'asset.bankCollateral.column'} />,
            accessor: 'bank.name',
            minWidth: 200,
            width: 200,
            maxWidth: 200,
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
            id: 'collateralString',
            Header: <TypographyFHG id={'assets.collateral.column'} component={'span'} />,
            headerTextAlign: 'center',
            accessor: 'collateralString',
            width: 163 * SCALE_APP,
            minWidth: 163 * SCALE_APP,
            maxWidth: 163 * SCALE_APP,
            Cell: ({row}) => (
               <Grid container justifyContent={'center'}>
                  <Chip
                     disabled={row?.original?.isRemoved}
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
            Header: <TypographyFHG id={'assets.removed.column'} component={'span'} />,
            accessor: 'removedLabel',
            width: 50 * SCALE_APP,
            minWidth: 50 * SCALE_APP,
            maxWidth: 50 * SCALE_APP,
            show: categoryId === REMOVED_ASSETS_CATEGORY_OBJECT?.id,
            Cell: ({row}) => (
               <Grid container justifyContent={'center'}>
                  {row?.original?.isRemoved && <Block color={'error'} />}
               </Grid>
            ),
         },
         {
            id: 'amount',
            Header: <TypographyFHG id={'assets.amount.column'} component={'span'} />,
            accessor: 'amount',
            width: 75 * SCALE_APP,
            minWidth: 75 * SCALE_APP,
            maxWidth: 75 * SCALE_APP,
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter('$#,###,###,##0.', row.values?.amount)}</div>
            ),
            Footer: (info) => {
               // Only calculate total visits if rows change
               const sum = React.useMemo(() => {
                  return info.rows.reduce((sum, row) => (row.values?.[info.column.id] || 0) + sum, 0);
               }, [info.rows, info.column.id]);
               return (
                  <div style={{textAlign: 'right', color: sum >= 0 ? undefined : theme.palette.error.main}}>
                     {numberFormatter(CURRENCY_FORMAT, sum)}
                  </div>
               );
            },
         },
         {
            id: 'remove',
            Header: <TypographyFHG id={'assets.remove.column'} component={'span'} />,
            width: 110 * SCALE_APP,
            minWidth: 110 * SCALE_APP,
            maxWidth: 110 * SCALE_APP,
            Cell: ({row}) => (
               <Box display='flex' justifyContent='center' alignItems='center'>
                  <ConfirmIconButton
                     onConfirm={(e) => handleDelete(e, row.original)}
                     values={{type: 'asset'}}
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [categoryId, theme.palette.table.header.secondary, theme.palette.error.main, handleSubmit]);

   const getAssetRefetchQueries = (entityId, assetId, historyDate) => {
      return [
         // {query: ASSETS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'assets'},
         {query: ASSET_QUERY, variables: {assetId, historyDate}, queryPath: 'asset'},
      ];
   };

   const getAssetUpdateQueries = (entityId, historyDate) => {
      return [{query: ASSETS_ENTITY_QUERY, variables: {entityId, historyDate}, queryPath: 'assets'}];
   };

   const currentAssets = useMemo(() => {
      if (Object.values(assetGroupsByCategory)?.length > 0) {
         return filter(Object.values(assetGroupsByCategory), (item) => item?.[0]?.assetCategory?.term === 'current');
      }
      return [];
   }, [assetGroupsByCategory]);

   const intermediateAssets = useMemo(() => {
      if (Object.values(assetGroupsByCategory)?.length > 0) {
         return filter(
            Object.values(assetGroupsByCategory),
            (item) => item?.[0]?.assetCategory?.term === 'intermediate',
         );
      }
      return [];
   }, [assetGroupsByCategory]);

   const longTermAssets = useMemo(() => {
      if (Object.values(assetGroupsByCategory)?.length > 0) {
         return filter(Object.values(assetGroupsByCategory), (item) => item?.[0]?.assetCategory?.term === 'long');
      }
      return [];
   }, [assetGroupsByCategory]);

   const removedAssets = useMemo(() => Object.values(assetGroupsByCategoryRemoved), [assetGroupsByCategoryRemoved]);

   const currentTab = useMemo(
      () => (
         <>
            {currentAssets?.length > 0 ? (
               currentAssets?.map((data, rowIndex) => (
                  <Stack key={rowIndex}>
                     <TableNewUiFHG
                        key={'Current Assets' + rowIndex}
                        name={'Current Assets'}
                        columns={columns}
                        data={data}
                        title={data?.[0].assetCategory?.name}
                        classes={{
                           headerTextStyle: classes.headerTextStyle,
                           tableStyle: classes.tableStyle,
                           totalFooter: classes.totalFooter,
                        }}
                        allowSearch={true}
                        searchFilter={search}
                        emptyTableMessageKey={entityId !== 'undefined' ? 'asset.na.label' : 'asset.noEntity.label'}
                        onSelect={hasPermission && handleRowSelect}
                        stickyExternal={true}
                        hasBorder={false}
                     >
                        <PermissionAllow permissionName={ASSETS_EDIT}>
                           <ButtonFHG
                              variant={'contained'}
                              labelKey={'asset.add.button'}
                              startIcon={<AddCircleOutline />}
                              onClick={handleAddAsset(data?.[0].assetCategory)}
                              disabled={entityId === 'undefined'}
                           />
                        </PermissionAllow>
                     </TableNewUiFHG>
                  </Stack>
               ))
            ) : (
               <Empty open={!!clientId || !!entityId} titleMessageKey={'asset.noCurrentAssets.label'}>
                  <PermissionAllow permissionName={ASSETS_EDIT}>
                     <ButtonFHG variant='contained' labelKey={'asset.addAssets.button'} onClick={handleAddAsset()} />
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
         currentAssets,
         entityId,
         handleAddAsset,
         handleRowSelect,
         hasPermission,
         search,
      ],
   );

   const intermediateTab = useMemo(
      () => (
         <>
            {intermediateAssets?.length > 0 ? (
               intermediateAssets?.map((data, index) => (
                  <TableNewUiFHG
                     key={'Intermediate Assets' + index}
                     name={'Intermediate Assets'}
                     columns={columns}
                     data={data}
                     title={data?.[0].assetCategory?.name}
                     classes={{
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     searchFilter={search}
                     allowSearch={true}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'asset.na.label' : 'asset.noEntity.label'}
                     onSelect={hasPermission && handleRowSelect}
                     stickyExternal={true}
                     hasBorder={false}
                  >
                     <PermissionAllow permissionName={ASSETS_EDIT}>
                        <ButtonFHG
                           variant={'contained'}
                           labelKey={'asset.add.button'}
                           startIcon={<AddCircleOutline />}
                           onClick={handleAddAsset(data?.[0].assetCategory)}
                           disabled={entityId === 'undefined'}
                        />
                     </PermissionAllow>
                  </TableNewUiFHG>
               ))
            ) : (
               <Empty titleMessageKey={'asset.noIntermediateAssets.label'}>
                  <PermissionAllow permissionName={ASSETS_EDIT}>
                     <ButtonFHG variant='contained' labelKey={'asset.addAssets.button'} onClick={handleAddAsset()} />
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
         handleAddAsset,
         handleRowSelect,
         hasPermission,
         intermediateAssets,
         search,
      ],
   );

   const longTermTab = useMemo(
      () => (
         <>
            {longTermAssets?.length > 0 ? (
               longTermAssets?.map((data, index) => (
                  <TableNewUiFHG
                     key={'Long term Assets' + index}
                     name={'Long term Assets'}
                     columns={columns}
                     data={data}
                     title={data?.[0].assetCategory?.name}
                     classes={{
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     searchFilter={search}
                     allowSearch={true}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'asset.na.label' : 'asset.noEntity.label'}
                     onSelect={handleRowSelect}
                     stickyExternal={true}
                     hasBorder={false}
                  >
                     <ButtonFHG
                        variant={'contained'}
                        labelKey={'asset.add.button'}
                        startIcon={<AddCircleOutline />}
                        onClick={handleAddAsset(data?.[0].assetCategory)}
                        disabled={entityId === 'undefined'}
                     />
                  </TableNewUiFHG>
               ))
            ) : (
               <Empty titleMessageKey={'asset.noLongTermAssets.label'}>
                  <ButtonFHG variant='contained' labelKey={'asset.addAssets.button'} onClick={handleAddAsset()} />
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
         handleAddAsset,
         handleRowSelect,
         longTermAssets,
         search,
      ],
   );

   const removedTab = useMemo(
      () => (
         <>
            {removedAssets?.length > 0 ? (
               removedAssets?.map((data, index) => (
                  <TableNewUiFHG
                     key={'Removed Assets' + index}
                     name={'Removed Assets'}
                     columns={[
                        ...columns.slice(0, columns.length - 1),
                        {
                           id: 'id',
                           Header: <TypographyFHG id={'asset.undo.column'} component={'span'} />,
                           accessor: 'id',
                           width: 75 * SCALE_APP,
                           minWidth: 75 * SCALE_APP,
                           maxWidth: 75 * SCALE_APP,
                           Cell: ({row}) => (
                              <Grid container justifyContent={'center'}>
                                 <IconButton onClick={(event) => handleSubmitRestored(event, row.original)}>
                                    <ReplayIcon />
                                 </IconButton>
                              </Grid>
                           ),
                        },
                     ]}
                     data={data}
                     title={data?.[0].assetCategory?.name}
                     classes={{
                        headerTextStyle: classes.headerTextStyle,
                        tableStyle: classes.tableStyle,
                        totalFooter: classes.totalFooter,
                     }}
                     searchFilter={search}
                     allowSearch={true}
                     emptyTableMessageKey={entityId !== 'undefined' ? 'asset.na.label' : 'asset.noEntity.label'}
                     onSelect={hasPermission && handleRowSelect}
                     stickyExternal={true}
                     hasBorder={false}
                  >
                     <PermissionAllow permissionName={ASSETS_EDIT}>
                        <ButtonFHG
                           variant={'contained'}
                           labelKey={'asset.add.button'}
                           startIcon={<AddCircleOutline />}
                           onClick={handleAddAsset(data?.[0].assetCategory)}
                           disabled={entityId === 'undefined'}
                        />
                     </PermissionAllow>
                  </TableNewUiFHG>
               ))
            ) : (
               <Empty titleMessageKey={'asset.noRemovedTermAssets.label'} />
            )}
         </>
      ),
      [
         classes.headerTextStyle,
         classes.tableStyle,
         classes.totalFooter,
         columns,
         entityId,
         handleAddAsset,
         handleRowSelect,
         handleSubmitRestored,
         hasPermission,
         removedAssets,
         search,
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
                  spacing: 5,
                  height: 'fit-content',
                  maxHeight: '100%',
                  style: {...scaleStyle, width: `${100 / scale}%`, height: `${100 / scale}%`},
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
         name='Assets Component'
         width={'100%'}
         height={'100%'}
         direction={'column'}
         flexWrap={'nowrap'}
         display={'flex'}
         overflow={'hidden'}
      >
         <Header idTitle='assets.title' values={{month, year}}>
            <Box sx={{ml: 'auto !important'}}>{buttonPanel}</Box>
            <ExportChoiceButton selectedIndex={ASSET_INDEX} disabled={assets?.length <= 0} />
         </Header>

         <Grid name={'totalsValuesArea'} spacing={3} overflow='visible' container sx={{mb: 2, mr: -0.5}}>
            <Grid item xs={6} lg={4} xl={3} overflow={'visible'}>
               <OverviewPanel
                  titleKey={'asset.total.title'}
                  value={totalAssets}
                  change={
                     totalAssetsPrevious ? ((totalAssets - totalAssetsPrevious) / totalAssetsPrevious) * 100 : undefined
                  }
                  maxWidth={MAX_WIDTH_OVERVIEW}
                  minWidth={MIN_WIDTH_OVERVIEW}
                  // renderRightBottomIcon={
                  //    <IconButton aria-label='trend analysis icon' onMouseDown={handleShowTrendAnalysis} size='small'>
                  //       <img
                  //          src={TREND_ANALYSIS_ICON}
                  //          alt='trend analysis icon'
                  //          className={`${classes.imageColor} `}
                  //       />
                  //    </IconButton>
                  // }
               />
            </Grid>
            <Grid item xs={6} lg={4} xl={3} overflow='visible'>
               <OverviewPanel
                  titleKey={'asset.totalCurrent.title'}
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
                  titleKey={'asset.totalIntermediate.title'}
                  value={totalIntermediate}
                  change={
                     totalIntermediatePrevious > 0
                        ? ((totalIntermediate - totalIntermediatePrevious) / totalIntermediatePrevious) * 100
                        : undefined
                  }
                  maxWidth={MAX_WIDTH_OVERVIEW}
                  minWidth={MIN_WIDTH_OVERVIEW}
               />
            </Grid>
            <Grid item xs={6} lg={4} xl={3} overflow='visible'>
               <OverviewPanel
                  titleKey={'asset.totalLong.title'}
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
                     key={'categorySelect ' + assetCategoriesMenuItems?.length + ' ' + categoryId}
                     name={'categoryId'}
                     label={'Filter by Category'}
                     defaultValue={categoryId}
                     options={assetCategoriesMenuItems}
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
                  sx={{flex: '0 0', minHeight: 60, mt: 3, '@media (max-height: 600px)': {mt: 1}}}
                  className={classes.tabs}
               >
                  <Tab value={ALL_TAB} label={formatMessage(intl, 'asset.all.tab')} />
                  <Tab value={CURRENT_TAB} label={formatMessage(intl, 'asset.current.tab')} />
                  <Tab value={INTERMEDIATE_TAB} label={formatMessage(intl, 'asset.intermediate.tab')} />
                  <Tab value={LONG_TAB} label={formatMessage(intl, 'asset.long.tab')} />
                  <Tab value={REMOVED_TAB} label={formatMessage(intl, 'asset.removed.tab')} />
                  <Box flex={'1 1'} />
                  <Stack className={classes.filter} direction={'row'} alignItems={'center'} spacing={4} sx={{mb: 2}}>
                     <AutocompleteMatchLXData
                        id={'categorySelect'}
                        sx={{minWidth: 180, mb: 1}}
                        key={'categorySelect ' + assetCategoriesMenuItems?.length + ' ' + categoryId}
                        name={'categoryId'}
                        label={'Filter by Category'}
                        defaultValue={categoryId}
                        options={assetCategoriesMenuItems}
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
               <Stack name='Outer Assets Tabs Frame' overflow={'hidden'} height={'100%'} width={'100%'} flex={'1 1'}>
                  {
                     {
                        [ALL_TAB]: wrapperTab(
                           'All Tab',
                           <>
                              {currentAssets.length === 0 &&
                              intermediateAssets.length === 0 &&
                              longTermAssets.length === 0 ? (
                                 <Empty open={!!clientId || !!entityId} titleMessageKey={'asset.noAssets.label'}>
                                    <PermissionAllow permissionName={ASSETS_EDIT}>
                                       <ButtonFHG
                                          variant='contained'
                                          labelKey={'asset.addAssets.button'}
                                          onClick={handleAddAsset()}
                                       />
                                    </PermissionAllow>
                                 </Empty>
                              ) : (
                                 <>
                                    {currentAssets.length > 0 && currentTab}
                                    {intermediateAssets.length > 0 && intermediateTab}
                                    {longTermAssets.length > 0 && longTermTab}
                                 </>
                              )}
                           </>,
                        ),
                        [CURRENT_TAB]: wrapperTab('Current Tab', currentTab),
                        [INTERMEDIATE_TAB]: wrapperTab('Intermediate Tab', intermediateTab),
                        [LONG_TAB]: wrapperTab('Long term Tab', longTermTab),
                        [REMOVED_TAB]: wrapperTab('Remove assets tab', removedTab),
                     }[selectedTab]
                  }
               </Stack>
            </>
         )}
         <Outlet />
         <Modal
            open={openTrendAnalysis}
            onClose={handleShowTrendAnalysis}
            aria-labelledby='parent-modal-title'
            aria-describedby='parent-modal-description'
         >
            <Box
               style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 10,
                  boxShadow: theme.shadows[5],
                  overflow: 'auto',
                  padding: theme.spacing(3),
               }}
            >
               <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <TypographyFHG
                     variant='h4'
                     id='loanAnalysis.overview.total.assetTrendAnalysis'
                     color='text.primary'
                  />
                  <Box display='flex' justifyContent='space-between' alignItems='center' spacing={1}>
                     <Stack direction={'row'} alignItems={'center'} spacing={4}>
                        <AutocompleteMatchLXData
                           id={'categorySelect'}
                           style={{width: 214}}
                           key={'categorySelect ' + assetCategoriesMenuItems?.length + ' ' + categoryId}
                           name={'categoryId'}
                           label={'Filter by Category'}
                           defaultValue={categoryId}
                           options={assetCategoriesMenuItems}
                           autoFocus={false}
                           disableClearable
                           // onChange={handleSelectCategory}
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
                     <IconButton aria-label='trend analysis icon' onMouseDown={handleShowTrendAnalysis} size='medium'>
                        <img
                           src='/images/close.png'
                           alt='close'
                           style={{
                              width: '14px',
                              height: '14px',
                              cursor: 'pointer',
                           }}
                        />
                     </IconButton>
                  </Box>
               </Box>
               <Box width={600} m={3}>
                  <TrendAnalysisChart totalAssets={totalAssetsTrendAnalysis} />
               </Box>
               <TypographyFHG variant='h6' color='text.primary' fontWeight='bold' textAlign='center'>
                  Months
               </TypographyFHG>
            </Box>
         </Modal>
      </Stack>
   );
}
