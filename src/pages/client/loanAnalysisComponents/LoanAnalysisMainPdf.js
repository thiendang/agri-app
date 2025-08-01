// noinspection ES6CheckImport
import {Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {Title} from '../../../components/pdf/TableOfContents';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {LOGO_LARGE} from '../../../Constants';
import {formatMessage} from '../../../fhg/utils/Utils';
import CurrentAssetsPdf from './CurrentAssetsPdf';
import CurrentLiabilitiesPdf from './CurrentLiabilitiesPdf';
import IntermediateAssetsPdf from './IntermediateAssetsPdf';
import IntermediateLiabilitiesPdf from './IntermediateLiabilitiesPdf';
import LongTermAssetsPdf from './LongTermAssetsPdf';
import LongTermLiabilitiesPdf from './LongTermLiabilitiesPdf';
import {registerInterFont} from '../../../utils/helpers';

function numberStyle(value, defaultStyle, defaultColor = '#6b9241') {
   return {
      ...defaultStyle,
      color: value < 0 ? '#AA0B06' : defaultColor,
   };
}

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'Inter',
      paddingLeft: 21,
      paddingTop: 17,
      paddingBottom: 50,
      marginBottom: 50,
      paddingRight: 21,
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
      color: '#000',
      fontSize: 13,
      fontWeight: 700,
      // marginBottom: 1,
   },
   dateStyle: {
      fontSize: 8,
      fontWeight: '400',
      color: 'rgba(153, 153, 153, 1)',
   },
   entityNameStyle: {
      fontSize: 8,
      fontWeight: '400',
      color: 'rgba(153, 153, 153, 1)',
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
      height: 28,
   },
   labelStyle: {
      color: '#000',
      fontSize: 7,
      fontWeight: '400',
      flexGrow: 0,
      flexShrink: 0,
   },
   labelBoldStyle: {
      color: '#6b9241',
      fontSize: 7,
      fontWeight: 'bold',
      flexGrow: 0,
      flexShrink: 0,
   },
   labelStyleDim: {
      color: '#707070',
      fontSize: 12,
      flexGrow: 0,
      flexShrink: 0,
   },
   column50SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      // marginBottom: 'auto',
   },
   column60SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '60%',
      // marginBottom: 'auto',
   },
   column40SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '40%',
      // marginBottom: 'auto',
   },
   column55SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '49%',
      // marginBottom: 'auto',
   },
   column45SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '49%',
      // marginBottom: 'auto',
   },
   columnSectionLeft: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingRight: 32,
   },
   columnSectionRight: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: 32,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
   borderBottom: {
      borderColor: '#6b9241',
      borderWidth: 1,
   },
   totalRowStyle: {
      display: 'flex',
      fontSize: 10,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'flex-end',
      marginBottom: 8,
      marginTop: 'auto',
   },
   columnHeader: {
      color: 'rgba(118, 149, 72, 1)',
      fontSize: 8,
      fontWeight: '700',
      textAlign: 'center',
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
      fontWeight: '700',
   },
   cellStyle2: {
      fontSize: 5,
      fontWeight: '400',
      color: '#000',
      marginRight: 4,
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function LoanAnalysisMainPdf({
   intl,
   orientation = 'landscape',
   data,
   entityNames = '',
   reportDate,
   bank,
}) {
   const clientLeverage = data?.clientLeverage || 0;
   const totalBankSafetyNet = data?.totalBankSafetyNet || 0;
   const totalLiabilities = data?.liabilities?.totalLiabilities || 0;
   const totalAssets = data?.assets?.totalAssets || 0;

   const currentAssetData = data?.assets?.current;
   const currentLiabilityData = data?.liabilities.current;
   const intermediateAssetData = data?.assets?.intermediate;
   const intermediateLiabilityData = data?.liabilities.intermediate;
   const longTermAssetData = data?.assets?.longTerm;
   const longTermLiabilityData = data?.liabilities.longTerm;

   const currentBankLoanValue = currentAssetData?.bankLoanValue || 0;
   const intermediateBankLoanValue = intermediateAssetData?.bankLoanValue || 0;
   const longTermBankLoanValue = longTermAssetData?.bankLoanValue || 0;

   const totalAvailable = currentBankLoanValue + intermediateBankLoanValue + longTermBankLoanValue;

   const currentLeveragePosition =
      (currentAssetData?.bankLoanValue || 0) - (currentLiabilityData?.subtotalLiabilities || 0);
   const intermediateLeveragePosition =
      (intermediateAssetData?.bankLoanValue || 0) - (intermediateLiabilityData?.subtotalLiabilities || 0);
   const longTermLeveragePosition =
      (longTermAssetData?.bankLoanValue || 0) - (longTermLiabilityData?.subtotalLiabilities || 0);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
         <Footer />
         <View style={styles.fullWidthHeader}>
            <View style={styles.columnSection}>
               <View style={styles.headerStyle}>
                  <Title style={styles.titleStyle}>Borrowing Power</Title>
                  <Text style={styles.entityNameStyle}>{entityNames}</Text>
                  <Text style={styles.dateStyle}>{moment(reportDate).format('MMMM YYYY')}</Text>
                  <Text style={styles.entityNameStyle}>{bank?.name ?? 'All Banks'}</Text>
               </View>
               <View style={styles.imageViewStyle}>
                  <Image src={LOGO_LARGE} style={styles.imageStyle} />
               </View>
            </View>
         </View>
         <View style={[styles.columnSection, {marginBottom: 16, marginTop: 10}]}>
            <View style={styles.column55SectionColumn}>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Asset Borrowing Power</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalAvailable)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelStyle}>Total Liabilities</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLiabilities)}</Text>
               </View>
               <View style={styles.columnSectionLeft}>
                  <Text style={styles.labelBoldStyle}>Total Borrowing Power</Text>
                  <Text style={numberStyle(clientLeverage, styles.labelBoldStyle)}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, clientLeverage)}
                  </Text>
               </View>
            </View>
            <View style={styles.column45SectionColumn}>
               <View style={styles.columnSectionRight}>
                  <Text style={styles.labelStyle}>Total Assets</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalAssets)}</Text>
               </View>
               <View style={styles.columnSectionRight}>
                  <Text style={styles.labelStyle}>Total Liabilities</Text>
                  <Text style={styles.labelStyle}>{numberFormatter(CURRENCY_FULL_FORMAT, totalLiabilities)}</Text>
               </View>
               <View style={styles.columnSectionRight}>
                  <Text style={styles.labelBoldStyle}>Total Bank Safety Net</Text>
                  <Text style={numberStyle(totalBankSafetyNet, styles.labelBoldStyle)}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, totalBankSafetyNet)}
                  </Text>
               </View>
            </View>
         </View>
         <View
            style={{
               width: '100%',
               border: '1px solid rgba(233, 233, 233, 1)',
               padding: 10,
               borderRadius: 4.13,
               marginBottom: 10,
            }}
         >
            <Text
               style={{
                  fontSize: 8,
                  fontWeight: '700',
                  color: '#000',
                  textAlign: 'center',
                  marginBottom: 5,
               }}
            >
               {formatMessage(intl, 'current')}
            </Text>
            <View style={[styles.columnSection, {marginBottom: 8}]} wrap={false}>
               <View style={[styles.column55SectionColumn, {marginRight: 4}]}>
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
                     <Text style={styles.columnHeader}>Assets</Text>
                  </View>
                  <CurrentAssetsPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
               <View style={[styles.column45SectionColumn, {marginLeft: 4}]}>
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
                     <Text style={styles.columnHeader}>Liabilities</Text>
                  </View>
                  <CurrentLiabilitiesPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
            </View>
            <View
               style={[
                  styles.columnSection,
                  {
                     backgroundColor: 'rgba(118, 149, 72, 0.1)',
                     paddingHorizontal: 8,
                     paddingVertical: 3,
                     borderRadius: 2.07,
                  },
               ]}
            >
               <Text style={styles.labelBoldStyle}>{formatMessage(intl, 'loan.currentBorrowingPower.label')}</Text>
               <Text style={numberStyle(currentLeveragePosition, styles.labelBoldStyle)}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, currentLeveragePosition)}
               </Text>
            </View>
         </View>
         <View
            style={{
               width: '100%',
               border: '1px solid rgba(233, 233, 233, 1)',
               padding: 10,
               borderRadius: 4.13,
               marginBottom: 10,
            }}
         >
            <Text
               style={{
                  fontSize: 8,
                  fontWeight: '700',
                  color: '#000',
                  textAlign: 'center',
                  marginBottom: 5,
               }}
            >
               {formatMessage(intl, 'intermediate')}
            </Text>
            <View style={[styles.columnSection, {marginBottom: 8}]} wrap={false}>
               <View style={[styles.column55SectionColumn, {marginRight: 4}]} wrap={false}>
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
                     <Text style={styles.columnHeader}>Assets</Text>
                  </View>
                  <IntermediateAssetsPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
               <View style={[styles.column45SectionColumn, {marginLeft: 4}]}>
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
                     <Text style={styles.columnHeader}>Liabilities</Text>
                  </View>
                  <IntermediateLiabilitiesPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
            </View>
            <View
               style={[
                  styles.columnSection,
                  {
                     backgroundColor: 'rgba(118, 149, 72, 0.1)',
                     paddingHorizontal: 8,
                     paddingVertical: 3,
                     borderRadius: 2.07,
                  },
               ]}
            >
               <Text style={styles.labelBoldStyle}>{formatMessage(intl, 'loan.intermediateBorrowingPower.label')}</Text>
               <Text style={numberStyle(intermediateLeveragePosition, styles.labelBoldStyle)}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, intermediateLeveragePosition)}
               </Text>
            </View>
         </View>
         <View
            style={{
               width: '100%',
               border: '1px solid rgba(233, 233, 233, 1)',
               padding: 10,
               borderRadius: 4.13,
            }}
         >
            <Text
               style={{
                  fontSize: 8,
                  fontWeight: '700',
                  color: '#000',
                  textAlign: 'center',
                  marginBottom: 5,
               }}
            >
               {formatMessage(intl, 'longTerm')}
            </Text>
            <View style={[styles.columnSection, {marginBottom: 8}]}>
               <View style={[styles.column55SectionColumn, {marginRight: 4}]}>
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
                     <Text style={styles.columnHeader}>Assets</Text>
                  </View>
                  <LongTermAssetsPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
               <View style={[styles.column45SectionColumn, {marginLeft: 4}]}>
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
                     <Text style={styles.columnHeader}>Liabilities</Text>
                  </View>
                  <LongTermLiabilitiesPdf intl={intl} data={data} tableStyle={tableStyle} />
               </View>
            </View>
            <View
               style={[
                  styles.columnSection,
                  {
                     backgroundColor: 'rgba(118, 149, 72, 0.1)',
                     paddingHorizontal: 8,
                     paddingVertical: 3,
                     borderRadius: 2.07,
                  },
               ]}
               wrap={false}
            >
               <Text style={styles.labelBoldStyle}>{formatMessage(intl, 'loan.longTermBorrowingPower.label')}</Text>
               <Text style={numberStyle(longTermLeveragePosition, styles.labelBoldStyle)}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, longTermLeveragePosition)}
               </Text>
            </View>
         </View>
      </Page>
   );
}
