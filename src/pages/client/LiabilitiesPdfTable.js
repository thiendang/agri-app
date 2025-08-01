// noinspection ES6CheckImport
import {Font, Text, Page, StyleSheet, View} from '@react-pdf/renderer';
import {indexOf} from 'lodash';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import Footer from '../../components/pdf/Footer';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import TableToPdf from '../../fhg/components/pdf/TableToPdf';
import {useEffect} from 'react';
import {HeaderPdf} from '../../fhg/components/pdf/Header';
import {WrapperTable} from '../../fhg/components/pdf/WrapperTable';
import {registerInterFont} from '../../utils/helpers';

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
      flexDirection: 'row',
      display: 'flex',
      width: '50%',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 15,
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
   imageStyle: {
      display: 'flex',
      flexGrow: 0,
      flexShrink: 0,
      // width: '50%',
   },
   headerTitleStyle1: {
      color: '#6b9241',
      fontSize: 7,
      fontWeight: '700',
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
      marginRight: 4,
   },
});

/**
 * Liabilities table component to display all the current user Liabilities.
 *
 * Reviewed: 5/28/21
 */
export default function LiabilitiesPdfTable({
   liabilities,
   orientation = 'landscape',
   columns,
   total,
   entityName = '',
   historyDate,
}) {
   const currents = useMemo(
      () => liabilities?.filter((item) => item.liabilityCategory?.term === 'current'),
      [liabilities],
   );
   const intermediates = useMemo(
      () => liabilities?.filter((item) => item.liabilityCategory?.term === 'intermediate'),
      [liabilities],
   );
   const longs = useMemo(() => liabilities?.filter((item) => item.liabilityCategory?.term === 'long'), [liabilities]);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <HeaderPdf entityNames={entityName} reportDate={historyDate} title='Schedule of Liabilities' />
         <View style={styles.fullWidthHeader}>
            <Text style={styles.headerTitleStyle1}>Total Liabilities</Text>
            <Text style={styles.headerTitleStyle1}>{numberFormatter(CURRENCY_FULL_FORMAT, total)}</Text>
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
