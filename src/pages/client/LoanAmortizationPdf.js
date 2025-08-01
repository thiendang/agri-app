// noinspection ES6CheckImport
import {Text, Page, StyleSheet, View, Document} from '@react-pdf/renderer';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../components/pdf/Footer';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {PERCENT_FORMAT} from '../../Constants';
import {PERCENT_SHORT_FORMAT} from '../../Constants';
import TableToPdf from '../../fhg/components/pdf/TableToPdf';
import {formatMessage} from '../../fhg/utils/Utils';
import {TableOfContents, TableOfContentsProvider} from '../../components/pdf/TableOfContents';
import {round} from '../../fhg/utils/DataUtil';
import TitlePage from '../../components/pdf/TitlePageV2';
import {HeaderPdf} from '../../fhg/components/pdf/Header';
import {WrapperTable} from '../../fhg/components/pdf/WrapperTable';
import {PAYMENT_TYPE} from './LoanAmortization';
import {registerInterFont} from '../../utils/helpers';

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
   fullWidthHeader: {
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   titleStyle1: {
      color: '#6b9241',
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 16,
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
   },
   imageStyle: {
      marginLeft: 'auto',
      width: 310,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
   columnHeader: {
      color: '#000000',
      fontFamily: 'Inter',
      fontSize: 14,
   },
   section: {
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: 'merriweather',
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
      '@media orientation portrait': {
         height: '60%',
      },
   },
   logo: {
      '@media orientation portrait': {
         marginBottom: 30,
         width: 300,
      },
      '@media orientation: landscape': {
         marginLeft: 'auto',
         marginRight: 'auto',
         marginBottom: 10,
         width: 400,
      },
   },
   titleStyle: {
      fontSize: 20,
      textAlign: 'center',
      paddingLeft: 20,
      paddingRight: 20,
      '@media orientation portrait': {
         marginBottom: 23,
      },
      '@media orientation: landscape': {
         marginBottom: 10,
      },
   },
   timeStyle: {
      fontSize: 13,
      textAlign: 'center',
   },
   clientStyle: {
      textAlign: 'left',
      fontSize: 7,
      fontWeight: '400',
   },
   clientStyleBold: {
      textAlign: 'left',
      marginLeft: 20,
      fontSize: 7,
      fontWeight: '700',
      color: 'rgba(118, 149, 72, 1)',
   },
   summary: {
      textAlign: 'left',
      marginLeft: 20,
      marginTop: 20,
      marginBottom: 20,
      fontSize: 22,
      fontWeight: 'bold',
   },
   rowInfo: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
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
 * Contracts PDF component to display all the contracts.
 *
 * Reviewed:
 */
export function LoanAmortizationPdf({
   intl,
   orientation = 'landscape',
   data = [],
   title,
   clientData,
   info,
   historyDate,
}) {
   /**
    * Create the columns for the contracts table.
    */
   const columns = useMemo(() => {
      const columns = [
         {
            accessor: 'number',
            Header: formatMessage(intl, 'amortization.number.column'),
            weighting: 5,
            align: 'right',
         },
         {
            accessor: 'dueDate',
            Header: formatMessage(intl, 'amortization.dueDate.column'),
            weighting: 10,
            format: (dueDate) => moment(dueDate).format(DATE_FORMAT_KEYBOARD),
            align: 'center',
         },
         {
            accessor: 'paymentDue',
            Header: formatMessage(intl, 'amortization.paymentDue.column'),
            weighting: 10,
            format: (paymentDue) => numberFormatter(CURRENCY_FULL_FORMAT, paymentDue),
            align: 'right',
         },
         {
            accessor: 'additionalPayment',
            Header: formatMessage(intl, 'amortization.additionalPayment.column'),
            weighting: 10,
            format: (additionalPayment) => numberFormatter(CURRENCY_FULL_FORMAT, additionalPayment),
            align: 'right',
         },
         {
            accessor: 'interest',
            Header: formatMessage(intl, 'amortization.interest.column'),
            weighting: 10,
            format: (interest) => numberFormatter(CURRENCY_FULL_FORMAT, interest),
            align: 'right',
         },
         {
            accessor: 'principal',
            Header: formatMessage(intl, 'amortization.principal.column'),
            weighting: 10,
            format: (principal) => numberFormatter(CURRENCY_FULL_FORMAT, round(principal)),
            align: 'right',
         },
         {
            accessor: 'balance',
            Header: formatMessage(intl, 'amortization.balance.column'),
            weighting: 10,
            format: (balance) => numberFormatter(CURRENCY_FULL_FORMAT, round(balance)),
            align: 'right',
         },
      ];

      return columns;
   }, [intl]);

   return (
      <Document title={title}>
         <TitlePage
            intl={intl}
            orientation={'landscape'}
            types={null}
            entityNames={'Loan Calculator'}
            clientData={clientData}
            historyDate={historyDate}
         />
         <TableOfContentsProvider>
            <TableOfContents intl={intl} orientation={'landscape'} title='Loan Calculator' historyDate={historyDate} />
            <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
               <Footer />
               <HeaderPdf title='Loan Calculator' reportDate={historyDate} />
               <View style={{height: 13}} />
               <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View
                     style={{
                        display: 'flex',
                        flex: 0.5,
                     }}
                  >
                     <WrapperTable title='Variables'>
                        <View
                           style={{
                              display: 'flex',
                              flexDirection: 'row',
                           }}
                        >
                           <View
                              style={{
                                 display: 'flex',
                                 flex: 0.5,
                              }}
                           >
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.loanAmount.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(CURRENCY_FULL_FORMAT, info?.loanAmount)}
                                 </Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.firstPaymentDate.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.firstPaymentDate}</Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.paymentType.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.paymentType ?? PAYMENT_TYPE[0]}</Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.rounding.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.rounding ? 'Rounding' : ''}</Text>
                              </View>
                           </View>
                           <View style={{width: 4}} />
                           <View
                              style={{
                                 display: 'flex',
                                 flex: 0.5,
                              }}
                           >
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.annualInterestRate.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(PERCENT_SHORT_FORMAT, info?.annualInterestRate ?? 0)}
                                 </Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.terms.title')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.termYears ?? 0}</Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.paymentFrequency.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.paymentFrequency}</Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.compoundPeriod.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.compoundPeriod}</Text>
                              </View>
                           </View>
                        </View>
                     </WrapperTable>
                  </View>
                  <View style={{width: 4}} />
                  <View
                     style={{
                        display: 'flex',
                        flex: 0.5,
                     }}
                  >
                     <WrapperTable title='Summary'>
                        <View
                           style={{
                              display: 'flex',
                              flexDirection: 'row',
                           }}
                        >
                           <View
                              style={{
                                 display: 'flex',
                                 flex: 0.5,
                              }}
                           >
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.annualPayment.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(CURRENCY_FULL_FORMAT, info?.payment)}
                                 </Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.ratePerPeriod.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(PERCENT_FORMAT, info?.ratePerPeriod)}
                                 </Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.scheduledPayments.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.scheduledNumberOfPayments}</Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.actualPayments.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>{info?.actualNumberOfPayments}</Text>
                              </View>
                           </View>
                           <View style={{width: 4}} />
                           <View
                              style={{
                                 display: 'flex',
                                 flex: 0.5,
                              }}
                           >
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.totalPayments.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(CURRENCY_FULL_FORMAT, info?.totalPayments)}
                                 </Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.totalInterest.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(CURRENCY_FULL_FORMAT, info?.totalInterest)}
                                 </Text>
                              </View>
                              <View style={styles.rowInfo}>
                                 <Text style={[styles.clientStyle]}>
                                    {formatMessage(intl, 'amortization.estimatedInterestSavings.label')}
                                 </Text>
                                 <Text style={[styles.clientStyleBold]}>
                                    {numberFormatter(CURRENCY_FULL_FORMAT, info?.estimatedInterestSavings)}
                                 </Text>
                              </View>
                           </View>
                        </View>
                     </WrapperTable>
                  </View>
               </View>
               <WrapperTable title='Payments'>
                  <TableToPdf data={data} columns={columns} tableStyle={tableStyle} />
               </WrapperTable>
            </Page>
         </TableOfContentsProvider>
      </Document>
   );
}
