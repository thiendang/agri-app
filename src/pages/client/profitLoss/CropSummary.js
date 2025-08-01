import {Box, Stack} from '@mui/material';
import {makeStyles} from '@mui/styles';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {FormattedNumber} from 'react-intl';
import {BORDER_RADIUS_10, CURRENCY_FULL_FORMAT, MONTH_FORMAT, NUMBER_FULL_FORMAT, SCALE_APP} from '../../../Constants';
import TableStickyContainerFrame from '../../../fhg/components/table/TableStickyContainerFrame';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import TableNewUiFHG from '../../../fhg/components/table/TableNewUiFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {uniqBy} from 'lodash';

const useStyles = makeStyles(
   (theme) => ({
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
            backgroundColor: '#FAFAFA',
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
      frameStyle: {
         padding: theme.spacing(2, 3, 2, 2),
      },
      date: {
         '& > .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeEnd.MuiIconButton-sizeMedium': {
            marginRight: '0px',
            color: theme.palette.primary.main,
         },
      },
      root: {
         backgroundColor: theme.palette.background.default,
         // paddingTop: '20px',
         display: 'flex',
         overflow: 'auto',
      },
      search: {
         alignItems: 'center',
         display: 'flex',
         height: '44px',
         paddingLeft: '10px',
         paddingRight: '10px',
         boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
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
      button: {
         marginRight: theme.spacing(1),
         boxShadow: theme.shadows[5],
         margin: 2,
      },
      headerStyle: {
         textAlign: 'center',
         fontWeight: '700',
         backgroundColor: '#EDF1EA',
         border: '1px solid rgba(224, 224, 224, 1)',
         borderLeft: '0px',
         borderBottom: '0px',
      },
      summaryPaperStyle: {
         backgroundColor: theme.palette.background.paper3,
         paddingLeft: '16px',
         paddingRight: '16px',
         borderBottom: `1px solid ${theme.palette.primary.stroke3}`,
      },
      headerBoldTextStyle: {
         fontWeight: '700',
         fontSize: 20 * SCALE_APP,
         fontFamily: '"Inter", "Arial", "Roboto", "Helvetica", sans-serif',
      },
      summaryColumnNoBorder: {
         paddingTop: '5px',
         paddingBottom: '5px',
      },
   }),
   {name: 'FieldMetricsStyle'},
);

const useTableStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: `${theme.palette.background.paper4} !important`,
         whiteSpace: 'nowrap',
         textAlign: 'end',
         position: 'sticky',
         left: 0,
         top: '0px !important',
      },
      tableHeadRoot: {
         top: 0,
         position: 'sticky',
         zIndex: theme.zIndex.drawer - 1,
      },
      tableRoot: {
         margin: 0,
         backgroundColor: theme.palette.background.paper4,
         // border: '1px solid rgba(194, 197, 200, 0.4)',
      },
      totalTableRoot: {
         margin: 0,
         backgroundColor: theme.palette.background.paper4,
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
      stickyFrame: {
         overflowX: 'auto',
         '& td:first-child': {
            position: 'sticky',
            left: 0,
            zIndex: 2,
            backgroundColor: 'inherit',
         },
         '& th:first-child': {
            zIndex: 2,
         },
         '& thead': {
            backgroundColor: 'inherit',
         },
      },
      help: {
         cursor: 'pointer',
      },
      headerStyleNoHeader: {
         display: 'none',
      },
   }),
   {name: 'tableStyles'},
);

export default function CropSummary({showByField, setShowByField, cropsData, fieldData, scaleStyle, scale}) {
   const [{reportDate}] = useCustomSearchParams();

   const tableClasses = useTableStyles();

   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const month = moment(date, MONTH_FORMAT)?.format('MMMM');
   const year = moment(date, MONTH_FORMAT)?.year();
   usePageTitle({titleKey: 'loan.title', values: {month, year}});

   const {fieldMetricsGroup: fieldMetricsField, fieldMetricsGroupTotals: fieldMetricsFieldTotals} = useMemo(
      () => fieldData ?? {},
      [fieldData],
   );

   const fieldsList = useMemo(
      () =>
         uniqBy(fieldMetricsField, 'id')?.map((item) => ({
            id: item?.id,
            name: item?.fieldName ? `${item.fieldName} - ${item.cropType}` : item?.cropType,
            acres: item?.acres ?? 0,
            acp: item?.projectedAcp ?? 0,
            profitAndLossPerAcre: item?.projectedProfitAndLossPerAcre ?? 0,
            breakeven: item?.projectedBreakevenYield || item?.actualBreakevenYield || 0,
            breakevenPrice: item?.projectedBreakevenPrice || item?.actualBreakevenPrice || 0,
            profitAndLoss: item?.projectedProfitAndLoss ?? 0,
         })) ?? [],
      [fieldMetricsField],
   );

   const {fieldMetricsGroup: fieldMetricsCrop, fieldMetricsGroupTotals: fieldMetricsCropTotals} = cropsData ?? {};

   const cropsList = useMemo(
      () =>
         uniqBy(fieldMetricsCrop, 'cropTypeId')?.map((item) => ({
            id: item?.id,
            name: item?.cropType,
            acres: item?.acres ?? 0,
            acp: item?.projectedAcp ?? 0,
            profitAndLossPerAcre: item?.projectedProfitAndLossPerAcre ?? 0,
            breakeven: item?.actualBreakevenYield || item?.projectedBreakevenYield || 0,
            breakevenPrice: item?.projectedBreakevenPrice || item?.actualBreakevenPrice || 0,
            profitAndLoss: item?.projectedProfitAndLoss ?? 0,
         })) ?? [],
      [fieldMetricsCrop],
   );

   const totalProfitLoss = useMemo(
      () =>
         !showByField
            ? fieldMetricsCropTotals?.projectedProfitAndLoss ?? 0
            : fieldMetricsFieldTotals?.projectedProfitAndLoss ?? 0,
      [fieldMetricsCropTotals?.projectedProfitAndLoss, fieldMetricsFieldTotals?.projectedProfitAndLoss, showByField],
   );

   const dataTable = useMemo(() => (showByField ? fieldsList : cropsList), [fieldsList, cropsList, showByField]);

   const classes = useStyles();

   const cropSummaryColumns = useMemo(() => {
      return [
         {
            Header: <TypographyFHG id={showByField ? 'field' : 'crop'} className={classes.headerBoldTextStyle} />,
            accessor: 'name',
            Cell: ({row}) => <div>{row.values?.name}</div>,
         },
         {
            Header: () => <TypographyFHG id={'fieldMetrics.acres.column'} className={classes.headerBoldTextStyle} />,
            accessor: 'acres',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(NUMBER_FULL_FORMAT, row.values?.acres)}</div>
            ),
         },
         {
            Header: <TypographyFHG id={'column.average.cash.price'} className={classes.headerBoldTextStyle} />,
            accessor: 'acp',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, row.values?.acp)}</div>
            ),
         },
         {
            Header: <TypographyFHG id={'column.breakeven'} className={classes.headerBoldTextStyle} />,
            accessor: 'breakeven',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(NUMBER_FULL_FORMAT, row.values?.breakeven)}</div>
            ),
         },
         {
            Header: <TypographyFHG id={'column.breakevenPrice'} className={classes.headerBoldTextStyle} />,
            accessor: 'breakevenPrice',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.breakevenPrice)}
               </div>
            ),
         },
         {
            Header: <TypographyFHG id={'column.profit'} className={classes.headerBoldTextStyle} />,
            accessor: 'profitAndLossPerAcre',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.profitAndLossPerAcre)}
               </div>
            ),
         },
         {
            Header: <TypographyFHG id={'column.total.profit'} className={classes.headerBoldTextStyle} />,
            accessor: 'profitAndLoss',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.profitAndLoss)}
               </div>
            ),
         },
      ];
   }, [classes.headerBoldTextStyle, showByField]);

   return (
      <Stack
         name='Crops Tab'
         className={classes.tableStyle}
         direction={'column'}
         innerStackProps={{
            style: {...scaleStyle, width: `${100 / scale}%`, height: `${100 / scale}%`},
         }}
      >
         <TableStickyContainerFrame
            titleKey={'crop.summary'}
            stickyTitle
            style={{
               border: 'none',
               width: '100%',
            }}
            titleStyle={{left: '8px !important'}}
            header={
               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     width: '100%',
                     justifyContent: 'flex-end',
                     py: 2,
                  }}
               >
                  <ButtonFHG
                     variant='contained'
                     color='primary'
                     size='large'
                     className={'button-title'}
                     labelKey={showByField ? 'show.crop' : 'show.field'}
                     onClick={() => {
                        setShowByField(!showByField);
                     }}
                  />
               </Box>
            }
         >
            <Stack width='100%'>
               <TableNewUiFHG
                  classes={{
                     root: tableClasses.tableRoot,
                     headerStyle: tableClasses.headerStyle,
                     tableStyle: tableClasses.tableStyle,
                     stickyFrame: tableClasses.stickyFrame,
                     totalFooter: tableClasses.totalFooter,
                  }}
                  data={dataTable}
                  columns={cropSummaryColumns}
                  stickyLeftColumn
                  stickyHeader
               />
            </Stack>
            <Box className={classes.summaryPaperStyle}>
               <Stack
                  name={'Current Leverage'}
                  display={'flex'}
                  width={'100%'}
                  justifyContent={'space-between'}
                  wrap={'nowrap'}
                  flexDirection={'row'}
                  className={classes.summaryColumnNoBorder}
               >
                  <TypographyFHG id={'total'} color='primary.green' className={classes.headerBoldTextStyle} />
                  <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                     <FormattedNumber value={totalProfitLoss} style='currency' currency='USD' />
                  </TypographyFHG>
               </Stack>
            </Box>
         </TableStickyContainerFrame>
      </Stack>
   );
}
