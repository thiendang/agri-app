// noinspection ES6CheckImport
import {Text, Page, StyleSheet, View} from '@react-pdf/renderer';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import Footer from '../../../components/pdf/Footer';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import TableToPdf from '../../../fhg/components/pdf/TableToPdf';
import {HeaderPdf} from '../../../fhg/components/pdf/Header';
import {WrapperTable} from '../../../fhg/components/pdf/WrapperTable';
import {registerInterFont} from '../../../utils/helpers';

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'Inter',
      paddingLeft: 20,
      paddingTop: 20,
      paddingBottom: 50,
      paddingRight: 20,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   fullWidthHeader: {
      flexDirection: 'row',
      display: 'flex',
      width: '50%',
      marginBottom: 30,
      marginTop: 15,
      justifyContent: 'flex-start',
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
   headerTitleStyle1: {
      color: '#6b9241',
      fontSize: 7,
      fontWeight: '700',
   },
   headerTitleStyle: {
      color: '#707070',
      fontSize: 7,
      fontWeight: '400',
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
export default function AssetsPdfTable({
   assets,
   orientation = 'landscape',
   columns,
   totalCurrent,
   totalIntermediate,
   totalLong,
   entityName = '',
   historyDate,
}) {
   const currents = useMemo(() => assets?.filter((item) => item.assetCategory?.term === 'current'), [assets]);
   const intermediates = useMemo(() => assets?.filter((item) => item.assetCategory?.term === 'intermediate'), [assets]);
   const longs = useMemo(() => assets?.filter((item) => item.assetCategory?.term === 'long'), [assets]);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1} wrap>
         <Footer />
         <HeaderPdf entityNames={entityName} reportDate={historyDate} title='Schedule of Assets' />
         <View style={styles.fullWidthHeader}>
            <View style={styles.headerStyle}>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     width: '100%',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                  }}
               >
                  <Text style={styles.headerTitleStyle}>Total Current Assets</Text>
                  <Text style={styles.headerTitleStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalCurrent)}</Text>
               </View>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     width: '100%',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                  }}
               >
                  <Text style={styles.headerTitleStyle}>Total Intermediate Assets</Text>
                  <Text style={styles.headerTitleStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediate)}
                  </Text>
               </View>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     width: '100%',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                  }}
               >
                  <Text style={styles.headerTitleStyle}>Total Long Term Assets</Text>
                  <Text style={styles.headerTitleStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLong)}</Text>
               </View>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     width: '100%',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                  }}
               >
                  <Text style={styles.headerTitleStyle1}>Total Assets</Text>
                  <Text style={styles.headerTitleStyle1}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalLong + totalIntermediate + totalCurrent)}
                  </Text>
               </View>
            </View>
         </View>
         <WrapperTable title='Current'>
            <TableToPdf data={currents} columns={columns} tableStyle={tableStyle} />
         </WrapperTable>
         <WrapperTable title='Intermediate'>
            <TableToPdf data={intermediates} columns={columns} tableStyle={tableStyle} />
         </WrapperTable>
         <WrapperTable title='Long Term'>
            <TableToPdf data={longs} columns={columns} tableStyle={tableStyle} />
         </WrapperTable>
      </Page>
   );
}
