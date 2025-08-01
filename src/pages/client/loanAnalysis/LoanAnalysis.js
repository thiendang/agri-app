import {FormControlLabel, IconButton, Paper, Switch} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {Tab} from '@mui/material';
import {Stack} from '@mui/material';
import {Tabs} from '@mui/material';
import Hidden from '@mui/material/Hidden';
import Grid from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import {useMemo, useState} from 'react';
import React from 'react';
import {useIntl} from 'react-intl';
import {FormattedNumber} from 'react-intl';
import {atom, useRecoilState, useSetRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import Empty from '../../../components/Empty';
import {BORDER_RADIUS_16, DARK_MODE_COLORS, SCALE_APP, TREND_ANALYSIS_ICON} from '../../../Constants';
import {LOAN_ANALYSIS_INDEX} from '../../../Constants';
import {LIABILITIES_PATH} from '../../../Constants';
import {ENTITY_ASSET_PATH} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {
   ASSET_CATEGORY_QUERY,
   BALANCE_REPORT_KMI_DATA_QUERY,
   BANK_ALL_WHERE_QUERY,
   LOAN_ANALYSIS_QUERY,
} from '../../../data/QueriesGL';
import useEditData from '../../../fhg/components/edit/useEditData';
import TableContainerFrame from '../../../fhg/components/table/TableContainerFrame';

import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import {formatMessage} from '../../../fhg/utils/Utils';
import {entityState} from '../../admin/EntityListDropDown';
import {userRoleState} from '../../Main';
import CurrentAssets from '../loanAnalysisComponents/CurrentAssets';
import CurrentLiabilities from '../loanAnalysisComponents/CurrentLiabilities';
import IntermediateAssets from '../loanAnalysisComponents/IntermediateAssets';
import IntermediateLiabilities from '../loanAnalysisComponents/IntermediateLiabilities';
import LongTermAssets from '../loanAnalysisComponents/LongTermAssets';
import LongTermLiabilities from '../loanAnalysisComponents/LongTermLiabilities';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import Header from '../../../components/Header';
import Overview from './Overview';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import {filter, sortBy} from 'lodash';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import ScrollStack from '../../../fhg/ScrollStack';
import OverviewPanel from '../../../components/OverviewPanel';
import TrendAnalysisChart from './TrendAnalysisChart';

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: 'rgba(223,235,209,0.35)',
         padding: theme.spacing(0, 2),
         boxShadow: theme.shadows[1],
         marginLeft: theme.spacing(2),
      },
      headerTextStyle: {
         fontWeight: 600,
         color: 'black',
      },
      headerBoldTextStyle: {
         fontSize: `${1.2 * SCALE_APP}rem`,
         fontWeight: 'bold',
      },
      totalsFrameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      tabsFrameStyle: {
         padding: theme.spacing(0),
      },
      tabContentFrameStyle: {
         height: 'calc(100% - 79px)',
         overflow: 'auto',
      },
      rowSpacing: {
         marginBottom: theme.spacing(4),
         paddingBottom: theme.spacing(2),
         paddingRight: theme.spacing(2),
         backgroundColor: '#FAFAFA',
         padding: theme.spacing(3),
         borderRadius: '10px',
      },
      rowSpacingLast: {
         paddingRight: theme.spacing(2),
         paddingBottom: theme.spacing(2),
         backgroundColor: '#FAFAFA',
         padding: theme.spacing(3),
         borderRadius: '10px',
      },
      pr3: {
         paddingRight: theme.spacing(3),
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
      summaryPaperStyle: {
         marginTop: theme.spacing(1),
         width: '100%',
         padding: theme.spacing(1),
         border: `1px solid ${theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : theme.palette.divider}`,
         borderRadius: '8px',
         backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_1 : '#FFF',
         ...(theme.palette.mode !== 'dark' && {
            borderTop: '2px solid rgba(194, 197, 200, 0.8)',
            borderBottom: '2px solid rgba(194, 197, 200, 0.8)',
         }),
      },
      icon: {
         width: '18px',
         height: '18px',
      },
      button: {
         cursor: 'pointer',
         width: '32px',
         height: '32px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         borderRadius: '5px',
      },
      titleStyle: {
         width: '50%',
         paddingLeft: theme.spacing(1.5),
      },
      inputAutoCompleteStyle: {
         minWidth: 140,
         '& input.MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
         maxWidth: '200px',
         '& .MuiTextField-root': {
            marginBottom: 0,
         },
      },
   }),
   {name: 'LoanAnalysisStyles'},
);

// Passed to be used in other tables.
const useTableStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: theme.palette.mode === 'dark' ? '#1D1D1D !important' : '#FFFFFF !important',
         whiteSpace: 'nowrap',
         borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(224, 224, 224, 1)'
         }`,
         borderRight: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(224, 224, 224, 1)'
         } !important`,
      },
      tableHeadRoot: {
         top: 0,
         position: 'sticky',
         zIndex: theme.zIndex.drawer - 1,
      },
      tableRoot: {
         margin: 0,
         overflow: 'auto',
         backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_1 : '#FAFAFA',
         border: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(194, 197, 200, 0.4)'
         }`,
         borderRadius: '10px',
      },
      tableHeaderStyle: {
         backgroundColor: '#F0F6E9 !important',
      },
      footerStyle: {
         cursor: 'default',
         fontSize: 18 * SCALE_APP,
      },
      frameStyle: {
         boxShadow: theme.shadows[2],
         backgroundColor: 'white',
         margin: 2,
      },
      help: {
         cursor: 'pointer',
      },
   }),
   {name: 'tableStyles'},
);

const ASSET_TAB = 'asset';
const DEBT_TAB = 'debt';
const REMOVED_ASSETS_CATEGORY = 'Removed Assets';
const REMOVED_ASSETS_CATEGORY_OBJECT = {id: 2, _default: -2, name: REMOVED_ASSETS_CATEGORY};
const ALL_CATEGORY = 'All Categories';
const ALL_CATEGORY_ID = 1;
const ALL_CATEGORY_OBJECT = {id: ALL_CATEGORY_ID, _default: -1, name: ALL_CATEGORY};

export const bankStore = atom({
   key: 'bankStore',
   default: null,
});

/**
 * The Tab to show the asset loan position.
 * @param loanData The report data.
 * @param onRowSelect Callback when a row is selected.
 * @return {JSX.Element|null}
 * @constructor
 */
function AssetLoanTab({loanData, onRowSelect}) {
   const tableClasses = useTableStyles();
   const theme = useTheme();
   const isSmallWidth = useMediaQuery(theme.breakpoints.down('md'));

   // Only display the page when all the data is loaded.
   if (!loanData) {
      return null;
   }
   const currentData = loanData?.loanAnalysis?.assets?.current;
   const intermediateData = loanData?.loanAnalysis?.assets?.intermediate;
   const longTermData = loanData?.loanAnalysis?.assets?.longTerm;

   return (
      <Stack flexDirection={'column'} spacing={2}>
         <TableContainerFrame name={'Current Assets and Liabilities tables'} gap={3}>
            <CurrentAssets
               classes={tableClasses}
               data={currentData}
               onRowSelect={onRowSelect}
               isSmallWidth={isSmallWidth}
            />
         </TableContainerFrame>
         <TableContainerFrame name={'Current Assets and Liabilities tables'} gap={3}>
            <IntermediateAssets
               classes={tableClasses}
               data={intermediateData}
               onRowSelect={onRowSelect}
               isSmallWidth={isSmallWidth}
            />
         </TableContainerFrame>
         <TableContainerFrame name={'Current Assets and Liabilities tables'} gap={3}>
            <LongTermAssets
               classes={tableClasses}
               data={longTermData}
               onRowSelect={onRowSelect}
               isSmallWidth={isSmallWidth}
            />
         </TableContainerFrame>
      </Stack>
   );
}

function LiabilityLoanTab({loanData, onRowSelect}) {
   const tableClasses = useTableStyles();

   if (!loanData) {
      return null;
   }
   const currentData = loanData?.loanAnalysis?.liabilities?.current;
   const intermediateData = loanData?.loanAnalysis?.liabilities?.intermediate;
   const longTermData = loanData?.loanAnalysis?.liabilities?.longTerm;

   return (
      <Stack flexDirection={'column'} spacing={2}>
         <TableContainerFrame name={'Current Assets and Liabilities tables'} gap={3}>
            <CurrentLiabilities classes={tableClasses} data={currentData} onRowSelect={onRowSelect} />
         </TableContainerFrame>
         <TableContainerFrame name={'Current Assets and Liabilities tables'} gap={3}>
            <IntermediateLiabilities classes={tableClasses} data={intermediateData} onRowSelect={onRowSelect} />
         </TableContainerFrame>
         <TableContainerFrame name={'Current Assets and Liabilities tables'} gap={3}>
            <LongTermLiabilities classes={tableClasses} data={longTermData} onRowSelect={onRowSelect} />
         </TableContainerFrame>
      </Stack>
   );
}

/**
 * Loan Analysis component to display loan analysis for an entity.
 *
 * Reviewed:
 */
export default function LoanAnalysis() {
   const intl = useIntl();
   const [{clientId: clientIdProp, reportDate}, setSearchParams, , removeSearch] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const navigate = useNavigateSearch();
   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const lastDate = moment(date, MONTH_FORMAT).endOf('month').format(DATE_DB_FORMAT);
   const classes = useStyles();
   const tableClasses = useTableStyles();
   const month = moment(date, MONTH_FORMAT)?.format('MMMM');
   const year = moment(date, MONTH_FORMAT)?.year();
   usePageTitle({titleKey: 'loan.title', values: {month, year}});
   const theme = useTheme();
   const [{entities: entityIdList}, setEntityStatus] = useRecoilState(entityState);
   const pollInterval = useRecoilValue(pollState);

   const [isGraph, setIsGraph] = useState(
      !localStorage.getItem('isGraph') ? true : localStorage.getItem('isGraph') === 'true',
   );

   const [editValues, handleChange] = useEditData({isPotentialBorrowingPower: false}, ['entityId']);

   const [loanAnalysisData] = useQueryFHG(LOAN_ANALYSIS_QUERY, {
      fetchPolicy: 'no-cache',
      variables: {entityId: entityIdList, date: lastDate},
      skip: entityIdList?.length <= 0,
      pollInterval,
   });

   const [bankData] = useQueryFHG(BANK_ALL_WHERE_QUERY, {
      variables: {clientId},
      skip: !clientId,
      pollInterval,
   });
   const banks = useMemo(() => sortBy(bankData?.banks || [], 'name'), [bankData]);
   const [bank, setBank] = useState(null);

   const setBankStore = useSetRecoilState(bankStore);

   useEffect(() => {
      removeSearch(['bankId']);
   }, [removeSearch]);

   useEffect(() => {
      setBankStore({id: null, name: 'All Banks'});
   }, [setBankStore]);

   const data = useMemo(() => {
      if (loanAnalysisData && bank) {
         return {
            loanAnalysis: loanAnalysisData?.loanAnalysis?.bankDetails?.find((item) => item.id === bank),
         };
      }
      return loanAnalysisData;
   }, [bank, loanAnalysisData]);

   const [selectedTab, setSelectedTab] = useState(ASSET_TAB);
   const assetsField = editValues?.isPotentialBorrowingPower ? 'assetsPBP' : 'assets';
   const assetObject = data?.loanAnalysis?.[assetsField];
   const liabilitiesField = editValues?.isPotentialBorrowingPower ? 'liabilitiesPBP' : 'liabilities';
   const liabilitiesObject = data?.loanAnalysis?.[liabilitiesField];
   const clientLeverage =
      data?.loanAnalysis?.[editValues?.isPotentialBorrowingPower ? 'potentialBorrowingPower' : 'clientLeverage'] || 0;
   const totalBankSafetyNet =
      data?.loanAnalysis?.[editValues?.isPotentialBorrowingPower ? 'totalBankSafetyNetPBP' : 'totalBankSafetyNet'] || 0;
   const currentBankLoanValue = assetObject?.current?.bankLoanValue || 0;
   const intermediateBankLoanValue = assetObject?.intermediate?.bankLoanValue || 0;
   const longTermBankLoanValue = assetObject?.longTerm?.bankLoanValue || 0;

   const totalAvailable = currentBankLoanValue + intermediateBankLoanValue + longTermBankLoanValue;
   const totalAssets = assetObject?.totalAssets || 0;
   const totalLiabilities = liabilitiesObject?.totalLiabilities || 0;

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

   /**
    * Handle changes to the selected tab.
    *
    * @param event The target of the event that triggered the change.
    * @param value The value of the change.
    */
   const handleTabChange = (event, value) => {
      setSelectedTab(value);
   };

   const handleRowSelect = (assetLiabilityPath) => (row) => {
      navigate(`../${assetLiabilityPath}`, undefined, {category: row.categoryName});
   };

   const currentLiabilitiesData = liabilitiesObject?.current;
   const intermediateLiabilitiesData = liabilitiesObject?.intermediate;
   const longTermLiabilitiesData = liabilitiesObject?.longTerm;
   const currentAssetsData = assetObject?.current;
   const intermediateAssetsData = assetObject?.intermediate;
   const longTermAssetsData = assetObject?.longTerm;

   const currentLeveragePosition =
      (currentAssetsData?.bankLoanValue || 0) - (currentLiabilitiesData?.subtotalLiabilities || 0);
   const intermediateLeveragePosition =
      (intermediateAssetsData?.bankLoanValue || 0) - (intermediateLiabilitiesData?.subtotalLiabilities || 0);
   const longTermLeveragePosition =
      (longTermAssetsData?.bankLoanValue || 0) - (longTermLiabilitiesData?.subtotalLiabilities || 0);
   return (
      <Stack
         name={'loan sheet root'}
         width={'100%'}
         height={'100%'}
         direction={'column'}
         wrap={'nowrap'}
         overflow={'hidden'}
      >
         {/*Header to filter loan analysis*/}
         <Header idTitle='loanAnalysis.title' values={{year}}>
            <Stack flexDirection={'row'} justifyItems={'space-between'} flex={'1 1 '}>
               <Box
                  sx={{
                     ml: 'auto !important',
                     display: 'flex',
                     flexDirection: 'row',
                     columnGap: 2,
                     alignItems: 'center',
                  }}
               >
                  <Box
                     onClick={() => {
                        setIsGraph(false);
                        localStorage.setItem('isGraph', 'false');
                     }}
                     className={classes.button}
                     sx={{
                        backgroundColor: !isGraph ? theme.palette.primary.main : theme.palette.background.default,
                     }}
                  >
                     <FormatListNumberedOutlinedIcon
                        className={classes.icon}
                        color={!isGraph || theme.palette.mode === 'dark' ? 'background' : 'secondary'}
                     />
                  </Box>
                  <Box
                     onClick={() => {
                        setIsGraph(true);
                        localStorage.setItem('isGraph', 'true');
                     }}
                     className={classes.button}
                     sx={{
                        backgroundColor: isGraph ? theme.palette.primary.main : theme.palette.background.default,
                     }}
                  >
                     <AssessmentOutlinedIcon
                        className={classes.icon}
                        color={isGraph || theme.palette.mode === 'dark' ? 'background' : 'secondary'}
                     />
                  </Box>
                  {buttonPanel}
                  <ExportChoiceButton selectedIndex={LOAN_ANALYSIS_INDEX} disabled={!data} />
               </Box>
            </Stack>
         </Header>
         <Stack
            flexDirection={'row'}
            flexWrap={'wrap'}
            justifyContent={'space-between'}
            width={'100%'}
            gap={{xs: 1, md: 3}}
         >
            <Overview
               isGraph={isGraph}
               clientLeverage={clientLeverage}
               totalBankSafetyNet={totalBankSafetyNet}
               totalLiabilities={totalLiabilities}
               totalAvailable={totalAvailable}
               totalAssets={totalAssets}
               isPotentialBorrowingPower={editValues.isPotentialBorrowingPower}
            />
            <Stack name='LoanAnalysis control frame' flexDirection={'row'} alignItems={'flex-end'} mb={{xs: 1, md: 3}}>
               <FormControlLabel
                  style={{
                     borderRadius: '7.5px',
                     boxShadow: theme.palette.mode !== 'dark' && '0px 4px 10px rgba(0, 0, 0, 0.1)',
                     border: theme.palette.mode === 'dark' && `2px solid ${theme.palette.primary.stroke}`,
                     paddingLeft: 2,
                     paddingRight: 14,
                     marginTop: 2,
                     height: 34.25,
                     color: theme.palette.text.primary,
                     width: '100%',
                     minWidth: 'max-content',
                     marginLeft: 8,
                     '& .MuiTypography-root': {
                        whiteSpace: 'nowrap',
                     },
                  }}
                  control={
                     <Switch
                        checked={editValues.isPotentialBorrowingPower}
                        onChange={handleChange}
                        name='isPotentialBorrowingPower'
                        color='primary'
                        size='small'
                     />
                  }
                  label={formatMessage(intl, 'loan.potentialBorrowingPower.label')}
               />
               <AutocompleteMatchLXData
                  className={classes.inputAutoCompleteStyle}
                  id={'categorySelect'}
                  sx={{width: 214}}
                  key={'bankSelect ' + banks?.length}
                  name={'bankId'}
                  label={'Filter by bank'}
                  defaultValue={bank}
                  options={banks}
                  autoFocus={false}
                  value={bank}
                  disableClearable
                  onChange={(e, b) => {
                     const id = [{id: null, name: 'All Banks'}, ...banks]?.find((a) => a.id === b.id)?.id;
                     setBankStore(b);
                     setBank(id);
                     setSearchParams((prev) => ({...prev, bankId: id}));
                  }}
                  textFieldProps={{variant: 'outlined'}}
                  matchSorterProps={{keys: ['_default', 'name']}}
                  showAllProps={{id: null, name: 'All Banks'}}
                  noOptionsText={
                     <div>
                        <div>No banks.</div>
                     </div>
                  }
                  inputProps={{style: {backgroundColor: theme.palette.background.default}}}
               />
            </Stack>
         </Stack>
         {!clientId || !(entityIdList?.length > 0) ? (
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
            <>
               <Hidden lgUp>
                  <Tabs
                     value={selectedTab}
                     onChange={handleTabChange}
                     style={{width: '100%'}}
                     // sx={{flex: '0 0', minHeight: 70}}
                  >
                     <Tab label={formatMessage(intl, 'loan.assetPosition.tab')} value={ASSET_TAB} />
                     <Tab label={formatMessage(intl, 'loan.debtPosition.tab')} value={DEBT_TAB} />
                  </Tabs>
                  <Grid
                     name={'Tab frame'}
                     container
                     className={classes.tabContentFrameStyle}
                     height={`${100 / scale}%`}
                     width={`${100 / scale}%`}
                     style={scaleStyle}
                  >
                     {
                        {
                           [ASSET_TAB]: (
                              <AssetLoanTab loanData={data} onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)} />
                           ),
                           [DEBT_TAB]: (
                              <LiabilityLoanTab loanData={data} onRowSelect={handleRowSelect(LIABILITIES_PATH)} />
                           ),
                        }[selectedTab]
                     }
                  </Grid>
               </Hidden>
               <Hidden mdDown>
                  <ScrollStack
                     sx={{
                        '&.MuiStack-root': {
                           borderTopLeftRadius: 10,
                           borderTopRightRadius: 10,
                        },
                        my: 1,
                     }}
                     flex={'1 1'}
                     height={'fit-content'}
                     width={'100%'}
                     direction={'column'}
                     innerStackProps={{
                        style: {...scaleStyle, width: `${100 / scale}%`, height: `${100 / scale}%`, gap: theme.spacing(3)},
                     }}
                  >
                     <TableContainerFrame
                        titleStyle={classes.titleStyle}
                        titleKey={'loan.assetPosition.tab'}
                        titleKey1={'loan.debtPosition.tab'}
                        name={'Current Assets and Liabilities tables'}
                        borderRadius={BORDER_RADIUS_16}
                        stickyTitle
                     >
                        <Stack flexDirection={'row'} gap={3}>
                           <CurrentAssets
                              classes={{
                                 root: tableClasses.tableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                              }}
                              data={currentAssetsData}
                              onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                              width={'50%'}
                           />
                           <CurrentLiabilities
                              classes={{
                                 root: tableClasses.tableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                              }}
                              data={currentLiabilitiesData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                              width={'50%'}
                           />
                        </Stack>
                        <Paper className={classes.summaryPaperStyle} elevation={0}>
                           <Stack
                              name={'Current Leverage'}
                              display={'flex'}
                              width={'100%'}
                              justifyContent={'space-between'}
                              wrap={'nowrap'}
                              flexDirection={'row'}
                           >
                              <TypographyFHG
                                 id={'loan.currentBorrowingPower.label'}
                                 color='primary.green'
                                 className={classes.headerBoldTextStyle}
                                 variant='h6'
                              />
                              <TypographyFHG
                                 color='primary.green'
                                 className={classes.headerBoldTextStyle}
                                 variant='h6'
                                 style={{
                                    color: currentLeveragePosition >= 0 ? undefined : theme.palette.error.main,
                                 }}
                              >
                                 <FormattedNumber
                                    value={currentLeveragePosition}
                                    // eslint-disable-next-line react/style-prop-object
                                    style='currency'
                                    currency='USD'
                                 />
                              </TypographyFHG>
                           </Stack>
                        </Paper>
                     </TableContainerFrame>
                     <TableContainerFrame
                        name={'Intermediate Assets and Liabilities tables'}
                        gap={3}
                        borderRadius={BORDER_RADIUS_16}
                     >
                        <Stack name={'Intermediate tables'} flexDirection={'row'} gap={3}>
                           <IntermediateAssets
                              classes={{
                                 root: tableClasses.tableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                              }}
                              data={intermediateAssetsData}
                              onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                              width={'50%'}
                           />
                           <IntermediateLiabilities
                              classes={{
                                 root: tableClasses.tableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                              }}
                              data={intermediateLiabilitiesData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                              width={'50%'}
                           />
                        </Stack>
                        <Paper className={classes.summaryPaperStyle} elevation={0}>
                           <Stack
                              name={'Intermediate Leverage'}
                              display={'flex'}
                              width={'100%'}
                              justifyContent={'space-between'}
                              wrap={'nowrap'}
                              flexDirection={'row'}
                           >
                              <TypographyFHG
                                 id={'loan.intermediateBorrowingPower.label'}
                                 color='primary.green'
                                 className={classes.headerBoldTextStyle}
                                 variant='h6'
                              />
                              <TypographyFHG
                                 color='primary.green'
                                 className={classes.headerBoldTextStyle}
                                 variant='h6'
                                 style={{
                                    color: intermediateLeveragePosition >= 0 ? undefined : theme.palette.error.main,
                                 }}
                              >
                                 <FormattedNumber
                                    value={intermediateLeveragePosition}
                                    // eslint-disable-next-line react/style-prop-object
                                    style='currency'
                                    currency='USD'
                                 />
                              </TypographyFHG>
                           </Stack>
                        </Paper>
                     </TableContainerFrame>
                     <TableContainerFrame
                        name={'Long Term Assets and Liabilities tables'}
                        gap={3}
                        borderRadius={BORDER_RADIUS_16}
                     >
                        <Stack name={'Intermediate tables'} flexDirection={'row'} gap={3}>
                           <LongTermAssets
                              classes={{
                                 root: tableClasses.tableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                              }}
                              data={longTermAssetsData}
                              onRowSelect={handleRowSelect(ENTITY_ASSET_PATH)}
                              width={'50%'}
                           />
                           <LongTermLiabilities
                              classes={{
                                 root: tableClasses.tableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                              }}
                              data={longTermLiabilitiesData}
                              onRowSelect={handleRowSelect(LIABILITIES_PATH)}
                              width={'50%'}
                           />
                        </Stack>
                        <Paper className={classes.summaryPaperStyle} elevation={0} style={{marginBottom: 2}}>
                           <Stack
                              name={'Long Term Leverage'}
                              display={'flex'}
                              width={'100%'}
                              justifyContent={'space-between'}
                              wrap={'nowrap'}
                              flexDirection={'row'}
                           >
                              <TypographyFHG
                                 id={'loan.longTermBorrowingPower.label'}
                                 color='primary.green'
                                 className={classes.headerBoldTextStyle}
                                 variant='h6'
                              />
                              <TypographyFHG
                                 color='primary.green'
                                 className={classes.headerBoldTextStyle}
                                 variant='h6'
                                 style={{
                                    color: longTermLeveragePosition >= 0 ? undefined : theme.palette.error.main,
                                 }}
                              >
                                 <FormattedNumber
                                    value={longTermLeveragePosition}
                                    // eslint-disable-next-line react/style-prop-object
                                    style='currency'
                                    currency='USD'
                                 />
                              </TypographyFHG>
                           </Stack>
                        </Paper>
                     </TableContainerFrame>
                  </ScrollStack>
               </Hidden>
            </>
         )}
      </Stack>
   );
}
