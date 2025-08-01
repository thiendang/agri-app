import {IconButton, Stack} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useEffect} from 'react';
import React, {useMemo} from 'react';
import {useRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import Empty from '../../../components/Empty';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import Header from '../../../components/Header';
import OverviewPanel from '../../../components/OverviewPanel';
import {AVERAGES_ICON, PERCENT_FORMAT} from '../../../Constants';
import {BALANCE_SHEET_INDEX} from '../../../Constants';
import {CURRENCY_FORMAT} from '../../../Constants';
import {LIABILITIES_PATH} from '../../../Constants';
import {ENTITY_ASSET_PATH} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {BALANCE_REPORT_KMI_DATA_QUERY, BALANCE_SHEET_QUERY, ENTITY_CLIENT_QUERY} from '../../../data/QueriesGL';
import TableBasicContainerFrame from '../../../fhg/components/table/TableBasicContainerFrame';
import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import {entityState} from '../../admin/EntityListDropDown';
import {userRoleState} from '../../Main';
import {validate} from 'uuid';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import _ from 'lodash';

const MAX_WIDTH_OVERVIEW = 190;
const MIN_WIDTH_OVERVIEW = 190;

const useStyles = makeStyles(
   (theme) => ({
      tableStyle: {
         border: '1px solid rgba(194, 197, 200, 0.4)',
         borderRadius: '10px',
      },
   }),
   {name: 'BalanceSheetStyles'},
);

/**
 * Balance sheet component for the current entity.
 *
 * Reviewed: 5/28/21
 */
export default function BalanceSheet() {
   const classes = useStyles();
   const [isShowAverages, setIsShowAverages] = React.useState(false);
   const [{clientId: clientIdProp, search, reportDate}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const navigate = useNavigateSearch();
   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const lastDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
   const [{entities: entityIdList}, setEntityStatus] = useRecoilState(entityState);
   const theme = useTheme();
   const month = moment(date, MONTH_FORMAT)?.format('MMMM');
   const year = moment(date, MONTH_FORMAT)?.year();

   usePageTitle({titleKey: 'balance.title', values: {month, year}});

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});
   const hasEntities = entitiesData?.entities?.length > 0;

   useEffect(() => {
      if (hasEntities) {
         const res = _.find(entitiesData.entities, (entity) => _.includes(entityIdList, entity.id));
         const isConfirmedForKPI = res?.confirmedForKmi || false;
         // setIsShowAverages(isConfirmedForKPI);
      }
   }, [entitiesData, entityIdList, hasEntities]);

   const [balanceSheetData] = useQueryFHG(BALANCE_SHEET_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: entityIdList, date: lastDate},
      skip: entityIdList?.length <= 0,
      pollInterval,
   });

   const {workingCapital, currentRatio, totalEquity, totalLiabilities, totalAssets, equityAssetPercentage} =
      balanceSheetData?.balanceSheet || {};

   const debtAssetRatio = totalLiabilities / totalAssets;

   const assetsCurrent = balanceSheetData?.balanceSheet?.assets?.current?.categories || [{}];
   const assetsIntermediate = balanceSheetData?.balanceSheet?.assets?.intermediate?.categories || [{}];
   const assetsLongTerm = balanceSheetData?.balanceSheet?.assets?.longTerm?.categories || [{}];
   const liabilitiesCurrent = balanceSheetData?.balanceSheet?.liabilities?.current?.categories || [{}];
   const liabilitiesIntermediate = balanceSheetData?.balanceSheet?.liabilities?.intermediate?.categories || [{}];
   const liabilitiesLongTerm = balanceSheetData?.balanceSheet?.liabilities?.longTerm?.categories || [{}];
   const liabilitiesCurrentInterestRate = _.flatMap(liabilitiesCurrent, (item) =>
      item?.liabilities?.map((liability) => liability.interestRate).filter((rate) => rate && rate > 0),
   );
   const liabilitiesIntermediateInterestRate = _.flatMap(liabilitiesIntermediate, (item) =>
      item?.liabilities?.map((liability) => liability.interestRate).filter((rate) => rate && rate > 0),
   );
   const liabilitiesLongTermInterestRate = _.flatMap(liabilitiesLongTerm, (item) =>
      item?.liabilities?.map((liability) => liability.interestRate).filter((rate) => rate && rate > 0),
   );

   const liabilitiesCurrentAverageInterestRate =
      liabilitiesCurrentInterestRate.length === 0
         ? 0
         : _.sum(liabilitiesCurrentInterestRate) / liabilitiesCurrentInterestRate.length;
   const liabilitiesIntermediateAverageInterestRate =
      liabilitiesIntermediateInterestRate.length === 0
         ? 0
         : _.sum(liabilitiesIntermediateInterestRate) / liabilitiesIntermediateInterestRate.length;
   const liabilitiesLongTermAverageInterestRate =
      liabilitiesLongTermInterestRate.length === 0
         ? 0
         : _.sum(liabilitiesLongTermInterestRate) / liabilitiesLongTermInterestRate.length;

   const [balanceReport_KmiData] = useQueryFHG(BALANCE_REPORT_KMI_DATA_QUERY, {
      fetchPolicy: 'cache-and-network',
      variables: {entityId: entityIdList, endDate: lastDate},
      skip: entityIdList?.length <= 0,
      pollInterval,
   });

   const totalAssets_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.totalAssets || 0;
   const totalLiabilities_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.totalLiabilities || 0;
   const totalCurrentLiabilities_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.totalCurrentLiabilities || 0;
   const totalIntermediateLiabilities_Kmi =
      balanceReport_KmiData?.balanceReport_KmiData?.totalIntermediateLiabilities || 0;
   const totalLongTermLiabilities_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.totalLongTermLiabilities || 0;
   const totalEquity_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.totalEquity || 0;
   const currentRatio_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.currentRatio || 0;
   const workingCapital_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.workingCapital || 0;
   const equityAssetRatio_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.equityAssetRatio || 0;
   const debtAssetRatio_Kmi = balanceReport_KmiData?.balanceReport_KmiData?.debtAssetRatio || 0;

   const {buttonPanel, scaleStyle, scale} = useScalePanel(
      {
         position: 'relative',
         top: 'unset',
         right: 'unset',
         backgroundColor: theme.palette.mode === 'dark' ? '#212121' : 'white',
         opacity: 1,
      },
      false,
   );

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: false}));
   }, [setEntityStatus]);

   // Create the asset columns for the table.
   const assetColumns = useMemo(() => {
      return [
         {
            id: 'assets',
            Header: <TypographyFHG id={'balance.assets.label'} component={'span'} />,
            accessor: 'categoryName',
            Footer: 'Total',
            Cell: ({row}) => <div style={{width: '200px'}}>{row.values?.assets}</div>,
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} component={'span'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
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
      ];
   }, [theme.palette.error.main]);

   // Create the asset columns for the table.
   const liabilityColumns = useMemo(() => {
      return [
         {
            id: 'categoryName',
            Header: <TypographyFHG id={'balance.liabilities.label'} component={'span'} />,
            accessor: 'categoryName',
            Footer: 'Total',
            Cell: ({row}) => <div style={{width: '200px'}}>{row.values?.categoryName}</div>,
         },
         {
            id: 'total',
            Header: <TypographyFHG id={'assets.amount.column'} component={'span'} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FORMAT, row.values?.total)}</div>
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
      ];
   }, [theme.palette.error.main]);

   /**
    * On a row click, navigate to the Asset or Liability page with the category selected.
    * @param assetLiabilityPath The path for Asset or Liability.
    * @return {(function(*): void)|*}
    */
   const handleRowSelect = (assetLiabilityPath) => (row) => {
      navigate(`../${assetLiabilityPath}`, undefined, {category: row.categoryName});
   };

   return (
      <Stack
         name={'balance sheet root'}
         width={'100%'}
         height={'100%'}
         direction={'column'}
         wrap={'nowrap'}
         overflow={'visible'}
      >
         {/*Header to filter balance sheet*/}
         <Header
            idTitle='balance.title'
            values={{month, year}}
            // titleExtra={
            //    hasEntities ? (
            //       <CheckboxFHG
            //          name={'isShowAverages'}
            //          onChange={() => setIsShowAverages(!isShowAverages)}
            //          color={'default'}
            //          checked={isShowAverages}
            //          value={'isPrimary'}
            //          marginTop={0}
            //          marginLeft={0}
            //       />
            //    ) : null
            // }
         >
            <Box sx={{ml: 'auto !important'}}>{buttonPanel}</Box>
            <ExportChoiceButton selectedIndex={BALANCE_SHEET_INDEX} />
         </Header>

         {/*Totals and values balance sheet*/}
         <Stack
            name={'totalsValuesArea'}
            gap={2}
            overflow='visible'
            sx={{mb: 3}}
            flexDirection={'row'}
            flexWrap={'wrap'}
         >
            <OverviewPanel
               titleKey={'balance.totalAssets.label'}
               value={totalAssets || 0}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.total.assets.rate.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, totalAssets_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.totalLiabilities.label'}
               value={totalLiabilities || 0}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.total.liabilities.rate.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, totalLiabilities_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.totalEquity.label'}
               value={totalEquity || 0}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               desKey='description.totalEquity'
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.total.equity.rate.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, totalEquity_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.currentRatio.label'}
               value={currentRatio || 0}
               format={PERCENT_FORMAT}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desKey='description.currentRatio'
               desAveragesKey={`balance.average.current.ratio.rate.label`}
               values={{value: numberFormatter(PERCENT_FORMAT, currentRatio_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.workingCapital.label'}
               value={workingCapital || 0}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               desKey='description.workingCapital'
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.working.capital.rate.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, workingCapital_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.equityAsset.label'}
               value={(equityAssetPercentage || 0) * 100}
               format={PERCENT_FORMAT}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               desKey='description.equityAssetRatio'
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.equity.asset.rate.label`}
               values={{value: numberFormatter(PERCENT_FORMAT, equityAssetRatio_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.debtAssetRatio.label'}
               value={(debtAssetRatio || 0) * 100}
               format={PERCENT_FORMAT}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               desKey='description.debtAssetRatio'
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.debt.asset.rate.label`}
               values={{value: numberFormatter(PERCENT_FORMAT, debtAssetRatio_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.average.current.interest.rate.label'}
               value={liabilitiesCurrentAverageInterestRate}
               format={PERCENT_FORMAT}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.current.interest.rate.value.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, totalCurrentLiabilities_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.average.intermediate.interest.rate.label'}
               value={liabilitiesIntermediateAverageInterestRate}
               format={PERCENT_FORMAT}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.intermediate.interest.rate.value.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, totalIntermediateLiabilities_Kmi)}}
            />
            <OverviewPanel
               titleKey={'balance.average.long.term.rate.label'}
               value={liabilitiesLongTermAverageInterestRate}
               format={PERCENT_FORMAT}
               maxWidth={MAX_WIDTH_OVERVIEW}
               minWidth={MIN_WIDTH_OVERVIEW}
               averagesIcon={
                  <IconButton aria-label='averages icon' onMouseDown={() => {}} size='small'>
                     <img src={AVERAGES_ICON} alt='averages icon' className={`${classes.imageColor} `} />
                  </IconButton>
               }
               isShowAverages={isShowAverages}
               desAveragesKey={`balance.average.long.term.rate.value.label`}
               values={{value: numberFormatter(CURRENCY_FORMAT, totalLongTermLiabilities_Kmi)}}
            />
         </Stack>
         {!clientId || !entityIdList?.length > 0 ? (
            <Empty
               titleMessageKey={'empty.noInfo.message'}
               messageKey={
                  !clientId
                     ? !(entityIdList?.length > 0)
                        ? 'empty.selectClientAndEntity.message'
                        : 'empty.selectClient.message'
                     : !(entityIdList?.length > 0)
                       ? 'empty.selectEntity.message'
                       : undefined
               }
               sx={{mt: 4}}
            />
         ) : (
            <Stack
               name={'assetsAndLiabilityTables'}
               flex={'1 1'}
               direction={'column'}
               width={'100%'}
               height={'100%'}
               overflow={'hidden'}
            >
               <Box overflow={'hidden'}>
                  <Grid
                     style={{
                        scrollBehavior: 'smooth',
                        ...scaleStyle,
                        width: `calc(${100 / scale}% + ${16 / scale}px)`,
                        height: `${100 / scale}%`,
                        marginRight: 0,
                     }}
                     container
                     rowSpacing={{xs: 1, lg: 2}}
                     columnSpacing={{xs: 1, lg: 2}}
                     overflow='auto'
                  >
                     {/*Current Assets and Liabilities tables*/}
                     <Grid item xs={12} lg={6}>
                        <TableBasicContainerFrame
                           name={'Current Assets'}
                           data={assetsCurrent}
                           className={classes.tableStyle}
                           stickyTitle
                           titleKey={'balance.currentAsset.label'}
                           columns={assetColumns}
                           searchFilter={search}
                           onSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                        />
                     </Grid>
                     <Grid item xs={12} lg={6}>
                        {/*Current liabilities table*/}
                        <TableBasicContainerFrame
                           name={'Balance Sheet Current Liabilities'}
                           data={liabilitiesCurrent}
                           className={classes.tableStyle}
                           stickyTitle
                           titleKey={'balance.currentLiabilities.label'}
                           columns={liabilityColumns}
                           searchFilter={search}
                           onSelect={handleRowSelect(LIABILITIES_PATH)}
                        />
                     </Grid>
                     <Grid item xs={12} lg={6}>
                        {/*Intermediate Assets and Liabilities tables*/}
                        {/*Intermediate Assets table*/}
                        <TableBasicContainerFrame
                           name={'Intermediate Assets table'}
                           data={assetsIntermediate}
                           className={classes.tableStyle}
                           stickyTitle
                           titleKey={'balance.intermediateTermAsset.label'}
                           columns={assetColumns}
                           searchFilter={search}
                           onSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                        />
                     </Grid>
                     <Grid item xs={12} lg={6}>
                        {/*Intermediate liabilities table*/}
                        <TableBasicContainerFrame
                           name={'Balance Sheet Intermediate Liabilities'}
                           stickyTitle
                           titleKey={'balance.intermediateLiabilities.label'}
                           data={liabilitiesIntermediate}
                           className={classes.tableStyle}
                           columns={liabilityColumns}
                           searchFilter={search}
                           onSelect={handleRowSelect(LIABILITIES_PATH)}
                        />
                     </Grid>
                     <Grid item xs={12} lg={6}>
                        {/*Long term Assets and  Liabilities tables*/}
                        {/*Long term Assets table*/}
                        <TableBasicContainerFrame
                           name={'Balance Sheet Long Term Assets'}
                           data={assetsLongTerm}
                           className={classes.tableStyle}
                           stickyTitle
                           titleKey={'balance.longTermAsset.label'}
                           columns={assetColumns}
                           searchFilter={search}
                           onSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                        />
                     </Grid>
                     <Grid item xs={12} lg={6}>
                        {/*Long term liabilities table*/}
                        <TableBasicContainerFrame
                           name={'Balance Sheet Long term Liabilities'}
                           data={liabilitiesLongTerm}
                           className={classes.tableStyle}
                           stickyTitle
                           titleKey={'balance.longTermLiabilities.label'}
                           columns={liabilityColumns}
                           searchFilter={search}
                           onSelect={handleRowSelect(LIABILITIES_PATH)}
                        />
                     </Grid>
                  </Grid>
               </Box>
            </Stack>
         )}
      </Stack>
   );
}
