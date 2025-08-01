// noinspection ES6CheckImport
import {Text, Page, StyleSheet, View} from '@react-pdf/renderer';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {HeaderPdf} from '../../../fhg/components/pdf/Header';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {WrapperTable} from '../../../fhg/components/pdf/WrapperTable';
import {round} from '../../../fhg/utils/DataUtil';
import {formatMessage} from '../../../fhg/utils/Utils';
import {registerInterFont} from '../../../utils/helpers';

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'Inter',
      paddingLeft: 10,
      paddingTop: 36,
      paddingBottom: 50,
      paddingRight: 10,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   clientStyleBold: {
      textAlign: 'left',
      fontSize: 7,
      fontWeight: '700',
      color: 'rgba(118, 149, 72, 1)',
   },
});

const tableStyle = StyleSheet.create({
   headerCellStyle: {
      color: 'rgba(118, 149, 72, 1)',
      fontSize: 6,
      borderRadius: 2.07,
      fontWeight: '700',
      textAlign: 'center',
      backgroundColor: 'rgba(118, 149, 72, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 17,
      // marginBottom: 5,
      marginRight: 4,
   },
   tableHeaderStyle: {
      display: 'flex',
      justifyContent: 'space-between',
   },
   footerCellStyle: {
      color: 'rgba(118, 149, 72, 1)',
      fontSize: 7,
      padding: '2 2',
      fontWeight: '700',
      paddingHorizontal: 8,
      paddingVertical: 4,
   },
   cellStyle2: {
      fontSize: 7,
      fontWeight: '400',
      color: '#000',
      backgroundColor: '#FBFBFB',
      paddingVertical: 2,
      paddingHorizontal: 8.26,
   },
});

/**
 * Crop Summary PDF component to display all the crop summary.
 *
 * Reviewed:
 */
export function CropSummaryPdf({
   intl,
   orientation = 'landscape',
   historyDate,
   cropSummaryData,
   totalCrop,
   fields,
   fieldMetricsCropData,
   dataTotalRevenuePdf,
   totalRevenuePdf,
   fieldMetricsCategoryData,
   totalCostData,
   totalCostPdf,
   costPerUnitData,
   costPerUnitTotalData,
   profitAndLossData,
   profitAndLossTotalData,
   breakevenYieldData,
   breakevenYieldTotalData,
   breakevenPriceData,
   breakevenPriceTotalData,
   showByField,
}) {
   /**
    * Create the columns for the crops summary table.
    */
   const columns = useMemo(() => {
      return [
         {
            accessor: 'name',
            Header: formatMessage(intl, showByField ? 'field' : 'crop'),
            weighting: 5,
            align: 'left',
         },
         {
            accessor: 'acres',
            Header: formatMessage(intl, 'field.acres.label'),
            weighting: 10,
            align: 'right',
         },
         {
            accessor: 'breakeven',
            Header: formatMessage(intl, 'column.breakeven'),
            weighting: 10,
            format: (breakeven) => numberFormatter(CURRENCY_FULL_FORMAT, breakeven),
            align: 'right',
         },
         {
            accessor: 'acp',
            Header: formatMessage(intl, 'acp'),
            weighting: 10,
            format: (acp) => numberFormatter(CURRENCY_FULL_FORMAT, acp),
            align: 'right',
         },
         {
            accessor: 'profitAndLossPerAcre',
            Header: formatMessage(intl, 'column.profit'),
            weighting: 10,
            format: (profitAndLossPerAcre) => numberFormatter(CURRENCY_FULL_FORMAT, profitAndLossPerAcre),
            align: 'right',
         },
         {
            accessor: 'profitAndLoss',
            Header: formatMessage(intl, 'column.total.profit'),
            weighting: 10,
            format: (profitAndLoss) => numberFormatter(CURRENCY_FULL_FORMAT, round(profitAndLoss)),
            align: 'right',
         },
      ];
   }, [intl, showByField]);

   const fieldMetricsCropDataClean = fieldMetricsCropData.map((item) => {
      if (item.type === 'field' || item.type === 'crop') {
         return {...item, total: ''};
      } else {
         fields.forEach((field, index) => {
            item[`value-${index}`] = numberFormatter(item.format, item[`value-${index}`]);
         });
         item.total = numberFormatter(item.format, item.total);
         return item;
      }
   });

   const categoryDataClean = fieldMetricsCategoryData.map((item) => {
      fields.forEach((field, index) => {
         item[`value-${index}`] = numberFormatter(item.format, item[`value-${index}`]);
      });
      item.total = numberFormatter(item.format, item.total);
      return item;
   });

   const columnsProfitLoss = useMemo(() => {
      const columns = fields?.map((field, index) => {
         return {
            accessor: `value-${index}`,
            Header: field.fieldName ? `${field.fieldName} - ${field.cropType}` : field.cropType,
            weighting: 10,
            align: 'right',
            Footer: dataTotalRevenuePdf?.[index] || 0,
         };
      });
      return [
         {
            accessor: 'crop',
            Header: () => null,
            weighting: 10,
            align: 'left',
            Footer: 'Total Revenue',
         },
         ...columns,
         {
            accessor: `total`,
            Header: 'Total',
            weighting: 10,
            align: 'right',
            Footer: totalRevenuePdf,
         },
      ];
   }, [dataTotalRevenuePdf, fields, totalRevenuePdf]);

   const columnsCategories = useMemo(() => {
      const columns = fields?.map((field, index) => {
         return {
            accessor: `value-${index}`,
            Header: field.cropType,
            weighting: 10,
            align: 'right',
            Footer: numberFormatter(CURRENCY_FULL_FORMAT, totalCostData?.[index] || 0),
            Footer2: numberFormatter(CURRENCY_FULL_FORMAT, round(costPerUnitData?.[index] || 0)),
            Footer3: numberFormatter(CURRENCY_FULL_FORMAT, round(profitAndLossData?.[index] || 0)),
            Footer4: numberFormatter(CURRENCY_FULL_FORMAT, round(breakevenYieldData?.[index] || 0)),
            Footer5: numberFormatter(CURRENCY_FULL_FORMAT, round(breakevenPriceData?.[index] || 0)),
         };
      });
      return [
         {
            accessor: 'name',
            Header: () => null,
            weighting: 10,
            align: 'left',
            Footer: 'Total Expense',
            Footer2: 'Cost Per Unit',
            Footer3: 'Profit/Loss',
            Footer4: 'Breakeven Yield',
            Footer5: 'Breakeven Price',
         },
         ...columns,
         {
            accessor: `total`,
            Header: 'Total',
            weighting: 10,
            align: 'right',
            Footer: numberFormatter(CURRENCY_FULL_FORMAT, round(totalCostPdf)),
            Footer2: numberFormatter(CURRENCY_FULL_FORMAT, round(costPerUnitTotalData)),
            Footer3: numberFormatter(CURRENCY_FULL_FORMAT, round(profitAndLossTotalData)),
            Footer4: numberFormatter(CURRENCY_FULL_FORMAT, round(breakevenYieldTotalData)),
            Footer5: numberFormatter(CURRENCY_FULL_FORMAT, round(breakevenPriceTotalData)),
         },
      ];
   }, [
      breakevenPriceData,
      breakevenPriceTotalData,
      breakevenYieldData,
      breakevenYieldTotalData,
      costPerUnitData,
      costPerUnitTotalData,
      fields,
      profitAndLossData,
      profitAndLossTotalData,
      totalCostData,
      totalCostPdf,
   ]);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <HeaderPdf title='Crop Plan Profit & Loss' reportDate={historyDate} />
         <View style={{height: 13}} />
         <WrapperTable title='Crop Summary'>
            <TableToPdf data={cropSummaryData} columns={columns} tableStyle={tableStyle} />
            <View
               style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: '#7695481A',
                  borderRadius: 2.07,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginTop: 8,
               }}
            >
               <Text style={[styles.clientStyleBold]}>{formatMessage(intl, 'column.total')}</Text>
               <Text style={[styles.clientStyleBold]}>{numberFormatter(CURRENCY_FULL_FORMAT, totalCrop ?? 0)}</Text>
            </View>
         </WrapperTable>
         <WrapperTable title=''>
            <TableToPdf
               data={fieldMetricsCropDataClean}
               columns={columnsProfitLoss}
               tableStyle={tableStyle}
               hasFooter
            />
         </WrapperTable>
         <WrapperTable title=''>
            <TableToPdf
               data={categoryDataClean}
               columns={columnsCategories}
               tableStyle={tableStyle}
               hasFooter
               extraFooter={4}
               footerExtraIndexBold={[1]}
            />
         </WrapperTable>
      </Page>
   );
}
