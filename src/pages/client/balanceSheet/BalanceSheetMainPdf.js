// noinspection ES6CheckImport
import {Text, Page, StyleSheet, View} from '@react-pdf/renderer';
import {sumBy} from 'lodash';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../../fhg/utils/Utils';
import {HeaderPdf} from '../../../fhg/components/pdf/Header';
import {WrapperTable} from '../../../fhg/components/pdf/WrapperTable';
import {registerInterFont} from '../../../utils/helpers';

function numberStyle(value = 0) {
   return {
      color: value < 0 ? '#AA0B06' : '#6b9241',
      fontSize: 7,
      flexGrow: 0,
      flexShrink: 0,
      fontWeight: '700',
   };
}

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'Inter',
      paddingLeft: 18,
      paddingTop: 36,
      paddingBottom: 50,
      paddingRight: 18,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   fullWidthHeader: {
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   titleStyle: {
      color: '#6b9241',
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 16,
      // marginBottom: 1,
   },
   dateStyle: {
      fontSize: 12,
      marginBottom: 16,
   },
   entityNameStyle: {
      fontSize: 12,
   },
   headerStyle: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
   },
   imageViewStyle: {
      display: 'flex',
      flexGrow: 0,
      flexShrink: 0,
      // width: '50%',
   },
   imageStyle: {
      marginLeft: 'auto',
      width: 310,
   },
   labelStyle: {
      color: '#000',
      fontSize: 7,
      flexGrow: 0,
      flexShrink: 0,
      fontWeight: '400',
   },
   labelStyleGreen: {
      color: 'rgba(118, 149, 72, 1)',
      fontSize: 7,
      flexGrow: 0,
      flexShrink: 0,
      fontWeight: '700',
   },
   column50SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
   },
   column30SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '30%',
   },
   columnSectionLeft: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingRight: 8,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
   totalRowStyle: {
      display: 'flex',
      fontSize: 12,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 8,
      marginTop: 'auto',
   },
   columnHeader: {
      color: '#000000',
      fontFamily: 'Inter',
      fontSize: 14,
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
      marginBottom: 5,
      marginRight: 4,
   },
   tableHeaderStyle: {
      display: 'flex',
      justifyContent: 'space-between',
   },
   footerCellStyle: {
      color: 'rgba(118, 149, 72, 1)',
      fontSize: 6,
      padding: '2 2',
      fontWeight: '700',
   },
   cellStyle2: {
      fontSize: 7,
      fontWeight: '400',
      color: '#000',
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function BalanceSheetMainPdf({intl, orientation = 'portrait', data, entityNames = '', reportDate}) {
   // Create the asset columns for the table.
   const assetColumns = useMemo(() => {
      return [
         {
            id: 'currentAssets',
            Header: formatMessage(intl, 'balance.currentAsset.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the intermediate assets table.
   const assetIntermediateColumns = useMemo(() => {
      return [
         {
            id: 'intermediate',
            Header: formatMessage(intl, 'balance.intermediateTermAsset.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the long term assets table.
   const assetLongTermColumns = useMemo(() => {
      return [
         {
            id: 'longTerm',
            Header: formatMessage(intl, 'balance.longTermAsset.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the asset columns for the table.
   const liabilityColumns = useMemo(() => {
      return [
         {
            id: 'currentLiabilities',
            Header: formatMessage(intl, 'balance.currentLiabilities.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the intermediate liabilities table.
   const liabilityIntermediateColumns = useMemo(() => {
      return [
         {
            id: 'intermediateLiabilities',
            Header: formatMessage(intl, 'balance.intermediateLiabilities.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // Create the columns for the long term liabilities table.
   const liabilityLongTermColumns = useMemo(() => {
      return [
         {
            id: 'longTermLiabilities',
            Header: formatMessage(intl, 'balance.longTermLiabilities.label'),
            accessor: 'categoryName',
            weighting: 66,
         },
         {
            id: 'total',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'total',
            align: 'right',
            weighting: 33,
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   const assetsCurrent = data?.assets?.current?.categories || [{}];
   const assetsIntermediate = data?.assets?.intermediate?.categories || [{}];
   const assetsLongTerm = data?.assets?.longTerm?.categories || [{}];
   const liabilitiesCurrent = data?.liabilities?.current?.categories || [{}];
   const liabilitiesIntermediate = data?.liabilities?.intermediate?.categories || [{}];
   const liabilitiesLongTerm = data?.liabilities?.longTerm?.categories || [{}];
   const totalCurrentAssets = sumBy(assetsCurrent, 'total');
   const totalIntermediateAssets = sumBy(assetsIntermediate, 'total');
   const totalLongTermAssets = sumBy(assetsLongTerm, 'total');
   const totalCurrentLiabilities = sumBy(liabilitiesCurrent, 'total');
   const totalIntermediateLiabilities = sumBy(liabilitiesIntermediate, 'total');
   const totalLongTermLiabilities = sumBy(liabilitiesLongTerm, 'total');

   const {workingCapital, currentRatio, totalEquity, totalLiabilities, totalAssets, equityAssetPercentage} = data || {};

   const debtAssetRatio = totalLiabilities / totalAssets;

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Balance Sheet' />
         <View style={[styles.columnSection, {marginVertical: 15}]}>
            <View style={styles.column30SectionColumn}>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Assets</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalAssets)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Liabilities</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLiabilities)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyleGreen}>Total Equity</Text>
                  <Text style={numberStyle(totalEquity)}>{numberFormatter(CURRENCY_FULL_FORMAT, totalEquity)}</Text>
               </View>
            </View>
            <View style={styles.column30SectionColumn}>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyle}>Current Ratio</Text>
                  <Text style={styles.labelStyle}>{numberFormatter('##0.0#', currentRatio)}</Text>
               </View>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyle}>Working Capital</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, workingCapital)}</Text>
               </View>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyleGreen}>Equity/Asset Ratio</Text>
                  <Text style={numberStyle(equityAssetPercentage)}>
                     {numberFormatter('##0.0#%', equityAssetPercentage ? equityAssetPercentage * 100 : 0)}
                  </Text>
               </View>
               <View style={styles.columnSection}>
                  <Text style={styles.labelStyleGreen}>Debt/Asset Ratio</Text>
                  <Text style={numberStyle(debtAssetRatio)}>
                     {numberFormatter('##0.0#%', debtAssetRatio ? debtAssetRatio * 100 : 0)}
                  </Text>
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]}>
            <WrapperTable title='Current'>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                  }}
               >
                  <View style={[styles.column50SectionColumn, {marginRight: 4}]}>
                     <View
                        style={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           paddingVertical: 4.5,
                           borderRadius: 4.13,
                           marginBottom: 5,
                        }}
                     >
                        <Text
                           style={{
                              color: 'rgba(118, 149, 72, 1)',
                              fontSize: 8,
                              fontWeight: '700',
                           }}
                        >
                           Assets
                        </Text>
                     </View>
                     <TableToPdf data={assetsCurrent} columns={assetColumns} tableStyle={tableStyle} />
                     <View style={styles.totalRowStyle}>
                        <Text style={styles.labelStyleGreen}>Total</Text>
                        <Text style={styles.labelStyleGreen}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, totalCurrentAssets)}
                        </Text>
                     </View>
                  </View>
                  <View style={[styles.column50SectionColumn, {marginLeft: 4}]}>
                     <View
                        style={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           paddingVertical: 4.5,
                           borderRadius: 4.13,
                           marginBottom: 5,
                        }}
                     >
                        <Text
                           style={{
                              color: 'rgba(118, 149, 72, 1)',
                              fontSize: 8,
                              fontWeight: '700',
                           }}
                        >
                           Liabilities
                        </Text>
                     </View>
                     <TableToPdf data={liabilitiesCurrent} columns={liabilityColumns} tableStyle={tableStyle} />
                     <View style={styles.totalRowStyle}>
                        <Text style={styles.labelStyleGreen}>Total</Text>
                        <Text style={styles.labelStyleGreen}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, totalCurrentLiabilities)}
                        </Text>
                     </View>
                  </View>
               </View>
            </WrapperTable>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]}>
            <WrapperTable title='Intermediate'>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                  }}
               >
                  <View style={[styles.column50SectionColumn, {marginRight: 4}]}>
                     <View
                        style={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           paddingVertical: 4.5,
                           borderRadius: 4.13,
                           marginBottom: 5,
                        }}
                     >
                        <Text
                           style={{
                              color: 'rgba(118, 149, 72, 1)',
                              fontSize: 8,
                              fontWeight: '700',
                           }}
                        >
                           Assets
                        </Text>
                     </View>
                     <TableToPdf data={assetsIntermediate} columns={assetIntermediateColumns} tableStyle={tableStyle} />
                     <View style={styles.totalRowStyle}>
                        <Text style={[styles.labelStyle, {marginRight: 8}]}>Total</Text>
                        <Text style={styles.labelStyle}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediateAssets)}
                        </Text>
                     </View>
                  </View>
                  <View style={[styles.column50SectionColumn, {marginLeft: 4}]}>
                     <View
                        style={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           paddingVertical: 4.5,
                           borderRadius: 4.13,
                           marginBottom: 5,
                        }}
                     >
                        <Text
                           style={{
                              color: 'rgba(118, 149, 72, 1)',
                              fontSize: 8,
                              fontWeight: '700',
                           }}
                        >
                           Liabilities
                        </Text>
                     </View>
                     <TableToPdf
                        data={liabilitiesIntermediate}
                        columns={liabilityIntermediateColumns}
                        tableStyle={tableStyle}
                     />
                     <View style={styles.totalRowStyle}>
                        <Text style={styles.labelStyleGreen}>Total</Text>
                        <Text style={styles.labelStyleGreen}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediateLiabilities)}
                        </Text>
                     </View>
                  </View>
               </View>
            </WrapperTable>
         </View>
         <View style={[styles.columnSection, {marginBottom: 8}]}>
            <WrapperTable title='Long Term'>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                  }}
               >
                  <View style={[styles.column50SectionColumn, {marginRight: 4}]}>
                     <View
                        style={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           paddingVertical: 4.5,
                           borderRadius: 4.13,
                           marginBottom: 5,
                        }}
                     >
                        <Text
                           style={{
                              color: 'rgba(118, 149, 72, 1)',
                              fontSize: 8,
                              fontWeight: '700',
                           }}
                        >
                           Assets
                        </Text>
                     </View>
                     <TableToPdf data={assetsLongTerm} columns={assetLongTermColumns} tableStyle={tableStyle} />
                     <View style={styles.totalRowStyle}>
                        <Text style={styles.labelStyleGreen}>Total</Text>
                        <Text style={styles.labelStyleGreen}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, totalLongTermAssets)}
                        </Text>
                     </View>
                  </View>
                  <View style={[styles.column50SectionColumn, {marginLeft: 4}]}>
                     <View
                        style={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           paddingVertical: 4.5,
                           borderRadius: 4.13,
                           marginBottom: 5,
                        }}
                     >
                        <Text
                           style={{
                              color: 'rgba(118, 149, 72, 1)',
                              fontSize: 8,
                              fontWeight: '700',
                           }}
                        >
                           Liabilities
                        </Text>
                     </View>
                     <TableToPdf
                        data={liabilitiesLongTerm}
                        columns={liabilityLongTermColumns}
                        tableStyle={tableStyle}
                     />
                     <View style={styles.totalRowStyle}>
                        <Text style={styles.labelStyleGreen}>Total</Text>
                        <Text style={styles.labelStyleGreen}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, totalLongTermLiabilities)}
                        </Text>
                     </View>
                  </View>
               </View>
            </WrapperTable>
         </View>
      </Page>
   );
}
