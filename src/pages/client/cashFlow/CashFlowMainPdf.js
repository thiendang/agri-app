// noinspection ES6CheckImport
import {Text, Page, StyleSheet, View} from '@react-pdf/renderer';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {MONTHS_CONVERT} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {HeaderPdf} from '../../../fhg/components/pdf/Header';
import {WrapperTable} from '../../../fhg/components/pdf/WrapperTable';
import {registerInterFont} from '../../../utils/helpers';
import {SHOW_ACTUALS, SHOW_PROJECTED} from './CashFlow';

function numberColor(value = 0, currentColor = '#6b9241') {
   return value >= 0 ? currentColor : '#AA0B06';
}

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'Inter',
      paddingLeft: 18,
      paddingTop: 20,
      paddingBottom: 50,
      marginBottom: 8,
      paddingRight: 18,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: 1710,
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
      color: '#6b9241',
      fontSize: 7,
      flexGrow: 0,
      flexShrink: 0,
      fontWeight: '700',
   },
   labelStyle1: {
      color: '#000',
      fontSize: 7,
      flexGrow: 0,
      flexShrink: 0,
      fontWeight: '400',
   },
   column50SectionColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      // marginBottom: 'auto',
   },
   column33SectionColumn: {
      display: 'flex',
      flexDirection: 'row',
      // flexGrow: 1,
      // flexShrink: 1,
      width: '32%',
      marginRight: '1%',
      border: '1px solid rgba(241, 244, 237, 1)',
      padding: '8px',
      borderRadius: 2.07,
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
   columnSectionLeft: {
      display: 'flex',
      flexDirection: 'column',
      width: '50%',
      justifyContent: 'space-between',
      paddingRight: 8,
   },
   columnSectionMiddle: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: 8,
      paddingRight: 8,
   },
   columnSectionRight: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: 8,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'start',
   },
   tableHeaderStyle: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      // justifyContent: 'space-between',
   },
   totalRowStyle: {
      display: 'flex',
      fontSize: 12,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'flex-end',
      marginBottom: 8,
      marginTop: 'auto',
   },
   columnHeader: {
      color: '#000000',
      fontFamily: 'Inter',
      fontSize: 12,
   },
});

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed:
 */
export default function CashFlowMainPdf({
   intl,
   orientation = 'landscape',
   cashFlowData,
   entityNames = '',
   reportDate,
   operatingLoanLimit,
   actualOperatingLoanBalance,
   yearEndActualBalance,
   yearEndProjectedBalance,
   carryoverIncome,
   isCashOnly,
   yearEndActualCashBalance,
   yearEndProjectedCashBalance,
   isCashShow,
   showCashFlowColumn
}) {
   const months = useMemo(
      () => [...(cashFlowData?.cashFlow?.monthOrder ?? []), 'annual'],
      [cashFlowData?.cashFlow?.monthOrder],
   );
   const showActual = showCashFlowColumn === SHOW_ACTUALS || showCashFlowColumn !== SHOW_PROJECTED
   const showProjection = showCashFlowColumn === SHOW_PROJECTED || showCashFlowColumn !== SHOW_ACTUALS
   return (
      <>
         <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
            <Footer />
            <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Cash Flow' />
            <View style={[styles.columnSection, {width: '100%', marginVertical: '15px'}]}>
               <View style={styles.column33SectionColumn}>
                  <View style={styles.columnSectionLeft}>
                     <Text style={styles.labelStyle}>Actual YTD Cash flow</Text>
                     <Text
                        style={[
                           styles.labelStyle,
                           {color: numberColor(cashFlowData?.cashFlow?.actualYTDCashFlow, '#6b9241')},
                        ]}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, cashFlowData?.cashFlow?.actualYTDCashFlow || 0)}
                     </Text>
                  </View>
                  <View style={styles.columnSectionLeft}>
                     <Text style={styles.labelStyle}>Projected YTD Cash flow</Text>
                     <Text
                        style={[
                           styles.labelStyle,
                           {color: numberColor(cashFlowData?.cashFlow?.expectedYTDCashFlow, '#6b9241')},
                        ]}
                     >
                        {numberFormatter(CURRENCY_FULL_FORMAT, cashFlowData?.cashFlow?.expectedYTDCashFlow || 0)}
                     </Text>
                  </View>
               </View>
               <View style={styles.column33SectionColumn}>
                  <View style={styles.columnSectionLeft}>
                     <Text style={styles.labelStyle1}>Year-end Actual LOC Balance</Text>
                     <Text style={[styles.labelStyle1, {color: numberColor(yearEndActualBalance, '#6b9241')}]}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, yearEndActualBalance)}
                     </Text>
                  </View>
                  <View style={styles.columnSectionLeft}>
                     <Text style={styles.labelStyle1}>Year-end Projected LOC Balance</Text>
                     <Text
                        style={[
                           styles.labelStyle1,
                           {color: numberColor(yearEndProjectedBalance > 0 ? yearEndProjectedBalance : 0, '#6b9241')},
                        ]}
                     >
                        {numberFormatter(
                           CURRENCY_FULL_FORMAT,
                           yearEndProjectedBalance > 0 ? yearEndProjectedBalance : 0,
                        )}
                     </Text>
                  </View>
               </View>
               {/*  */}
               {isCashShow && (
                  <View style={styles.column33SectionColumn}>
                     <View style={styles.columnSectionLeft}>
                        <Text style={styles.labelStyle1}>Year-end Actual Cash Balance</Text>
                        <Text style={[styles.labelStyle1, {color: numberColor(yearEndActualCashBalance, '#6b9241')}]}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, yearEndActualCashBalance || 0)}
                        </Text>
                     </View>
                     <View style={styles.columnSectionLeft}>
                        <Text style={styles.labelStyle1}>Year-end Projected Cash Balance</Text>
                        <Text style={[styles.labelStyle1, {color: numberColor(yearEndProjectedCashBalance, '#6b9241')}]}>
                           {numberFormatter(CURRENCY_FULL_FORMAT, yearEndProjectedCashBalance || 0)}
                        </Text>
                     </View>
                  </View>
               )}
            </View>
            <View style={[styles.columnSection, {width: '100%', marginBottom: '15px'}]}>
               <View style={styles.column33SectionColumn}>
                  <View style={styles.columnSectionMiddle}>
                     <Text style={styles.labelStyle1}>Operating Loan Limit</Text>
                     <Text style={[styles.labelStyle1, {color: numberColor(operatingLoanLimit, '#000')}]}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, operatingLoanLimit)}
                     </Text>
                  </View>
               </View>
               <View style={styles.column33SectionColumn}>
                  <View style={styles.columnSectionMiddle}>
                     <Text style={styles.labelStyle1}>
                        {isCashOnly ? 'Cash Account Balance - January 1st' : 'Operating Loan Balance - January 1st'}
                     </Text>
                     <Text style={[styles.labelStyle1, {color: numberColor(actualOperatingLoanBalance, '#000')}]}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, actualOperatingLoanBalance)}
                     </Text>
                  </View>
               </View>
               <View style={styles.column33SectionColumn}>
                  <View style={styles.columnSectionMiddle}>
                     <Text style={styles.labelStyle1}>Carryover Income</Text>
                     <Text style={[styles.labelStyle1, {color: numberColor(carryoverIncome, '#000')}]}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, carryoverIncome)}
                     </Text>
                  </View>
               </View>
            </View>
            {showProjection ? <WrapperTable title='Projected Income'>
               <View
                  style={{
                     display: 'flex',
                     width: '100%',
                     flexDirection: 'row',
                  }}
               >
                  <View
                     style={{
                        display: 'flex',
                        flex: 100 / 14,
                        marginRight: 4,
                        flexDirection: 'column',
                     }}
                  >
                     <View
                        style={{
                           height: 13,
                           width: '100%',
                           marginBottom: 8,
                        }}
                     />
                     {cashFlowData?.cashFlow?.income?.map((item) => (
                        <View
                           key={item.typeName}
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: '#000',
                              }}
                           >
                              {item.typeName}
                           </Text>
                        </View>
                     ))}
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Total Income
                        </Text>
                     </View>
                  </View>
                  {months?.map((item) => (
                     <View
                        key={item}
                        style={{
                           display: 'flex',
                           flexDirection: 'column',
                           border: '1px solid rgba(241, 244, 237, 1)',
                           borderRadius: 2.07,
                           flex: 100 / 14,
                           marginRight: 4,
                        }}
                     >
                        <View
                           style={{
                              height: 13,
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 8,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {MONTHS_CONVERT[item]}
                           </Text>
                        </View>
                        {cashFlowData?.cashFlow?.income?.map((item1) => (
                           <View
                              key={item1[item]?.id}
                              style={{
                                 height: 15,
                                 width: '100%',
                                 display: 'flex',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 marginBottom: 4,
                              }}
                           >
                              <Text
                                 style={{
                                    fontSize: 5,
                                    fontWeight: '400',
                                    color: '#000',
                                 }}
                              >
                                 {numberFormatter(CURRENCY_FULL_FORMAT, item1[item]?.expected)}
                              </Text>
                           </View>
                        ))}
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(
                                 CURRENCY_FULL_FORMAT,
                                 cashFlowData?.cashFlow.incomeGlobal[item]?.expected,
                              )}
                           </Text>
                        </View>
                     </View>
                  ))}
               </View>
            </WrapperTable> : null}
            {showActual ? <WrapperTable title='Actual Income'>
               <View
                  style={{
                     display: 'flex',
                     width: '100%',
                     flexDirection: 'row',
                  }}
               >
                  <View
                     style={{
                        display: 'flex',
                        flex: 100 / 14,
                        marginRight: 4,
                        flexDirection: 'column',
                     }}
                  >
                     <View
                        style={{
                           height: 13,
                           width: '100%',
                           marginBottom: 8,
                        }}
                     />
                     {cashFlowData?.cashFlow?.income?.map((item) => (
                        <View
                           key={item.typeName}
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: '#000',
                              }}
                           >
                              {item.typeName}
                           </Text>
                        </View>
                     ))}
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Total Income
                        </Text>
                     </View>
                  </View>
                  {months?.map((item) => (
                     <View
                        key={item}
                        style={{
                           display: 'flex',
                           flexDirection: 'column',
                           border: '1px solid rgba(241, 244, 237, 1)',
                           borderRadius: 2.07,
                           flex: 100 / 14,
                           marginRight: 4,
                        }}
                     >
                        <View
                           style={{
                              height: 13,
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 8,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {MONTHS_CONVERT[item]}
                           </Text>
                        </View>
                        {cashFlowData?.cashFlow?.income?.map((item1) => (
                           <View
                              key={item1[item]?.id}
                              style={{
                                 height: 15,
                                 width: '100%',
                                 display: 'flex',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 marginBottom: 4,
                              }}
                           >
                              <Text
                                 style={{
                                    fontSize: 5,
                                    fontWeight: '400',
                                    color: '#000',
                                 }}
                              >
                                 {numberFormatter(CURRENCY_FULL_FORMAT, item1[item]?.actual)}
                              </Text>
                           </View>
                        ))}
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(CURRENCY_FULL_FORMAT, cashFlowData?.cashFlow.incomeGlobal[item]?.actual)}
                           </Text>
                        </View>
                     </View>
                  ))}
               </View>
            </WrapperTable> : null}
         </Page>
         {showProjection ? <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
            <Footer />
            <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Cash Flow' />
            <View style={{height: 15}} />
            <WrapperTable title='Projected Expenses'>
               <View
                  style={{
                     display: 'flex',
                     width: '100%',
                     flexDirection: 'row',
                  }}
               >
                  <View
                     style={{
                        display: 'flex',
                        flex: 100 / 14,
                        marginRight: 4,
                        flexDirection: 'column',
                     }}
                  >
                     <View
                        style={{
                           height: 13,
                           width: '100%',
                           marginBottom: 8,
                        }}
                     />
                     {cashFlowData?.cashFlow?.expenses?.map((item) => (
                        <View
                           key={item.typeName}
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: '#000',
                              }}
                           >
                              {item.typeName}
                           </Text>
                        </View>
                     ))}
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Total Expenses
                        </Text>
                     </View>
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Net Cash Flow
                        </Text>
                     </View>
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Operating Loan Balance
                        </Text>
                     </View>
                  </View>
                  {months?.map((item) => (
                     <View
                        key={item}
                        style={{
                           display: 'flex',
                           flexDirection: 'column',
                           border: '1px solid rgba(241, 244, 237, 1)',
                           borderRadius: 2.07,
                           flex: 100 / 14,
                           marginRight: 4,
                        }}
                     >
                        <View
                           style={{
                              height: 13,
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 8,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {MONTHS_CONVERT[item]}
                           </Text>
                        </View>
                        {cashFlowData?.cashFlow?.expenses?.map((item1) => (
                           <View
                              key={item1[item]?.id}
                              style={{
                                 height: 15,
                                 width: '100%',
                                 display: 'flex',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 marginBottom: 4,
                              }}
                           >
                              <Text
                                 style={{
                                    fontSize: 5,
                                    fontWeight: '400',
                                    color: '#000',
                                 }}
                              >
                                 {numberFormatter(CURRENCY_FULL_FORMAT, item1[item]?.expected)}
                              </Text>
                           </View>
                        ))}
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(
                                 CURRENCY_FULL_FORMAT,
                                 cashFlowData?.cashFlow.expenseGlobal[item]?.expected,
                              )}
                           </Text>
                        </View>
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(
                                 CURRENCY_FULL_FORMAT,
                                 cashFlowData?.cashFlow.netCashFlow[item]?.expected,
                              )}
                           </Text>
                        </View>
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(
                                 CURRENCY_FULL_FORMAT,
                                 cashFlowData?.cashFlow.operatingLoanBalance[item]?.expected,
                              )}
                           </Text>
                        </View>
                     </View>
                  ))}
               </View>
            </WrapperTable>
         </Page> : null}
         {showActual ? <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
            <Footer />
            <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Cash Flow' />
            <View style={{height: 15}} />
            <WrapperTable title='Actual Expenses'>
               <View
                  style={{
                     display: 'flex',
                     width: '100%',
                     flexDirection: 'row',
                  }}
               >
                  <View
                     style={{
                        display: 'flex',
                        flex: 100 / 14,
                        marginRight: 4,
                        flexDirection: 'column',
                     }}
                  >
                     <View
                        style={{
                           height: 13,
                           width: '100%',
                           marginBottom: 8,
                        }}
                     />
                     {cashFlowData?.cashFlow?.expenses?.map((item) => (
                        <View
                           key={item.typeName}
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: '#000',
                              }}
                           >
                              {item.typeName}
                           </Text>
                        </View>
                     ))}
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Total Income
                        </Text>
                     </View>
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Net Cash Flow
                        </Text>
                     </View>
                     <View
                        style={{
                           height: 15,
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start',
                           marginBottom: 4,
                        }}
                     >
                        <Text
                           style={{
                              fontSize: 5,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                           }}
                        >
                           Operating Loan Balance
                        </Text>
                     </View>
                  </View>
                  {months?.map((item) => (
                     <View
                        key={item}
                        style={{
                           display: 'flex',
                           flexDirection: 'column',
                           border: '1px solid rgba(241, 244, 237, 1)',
                           borderRadius: 2.07,
                           flex: 100 / 14,
                           marginRight: 4,
                        }}
                     >
                        <View
                           style={{
                              height: 13,
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 8,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {MONTHS_CONVERT[item]}
                           </Text>
                        </View>
                        {cashFlowData?.cashFlow?.expenses?.map((item1) => (
                           <View
                              key={item1[item]?.id}
                              style={{
                                 height: 15,
                                 width: '100%',
                                 display: 'flex',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 marginBottom: 4,
                              }}
                           >
                              <Text
                                 style={{
                                    fontSize: 5,
                                    fontWeight: '400',
                                    color: '#000',
                                 }}
                              >
                                 {numberFormatter(CURRENCY_FULL_FORMAT, item1[item]?.actual)}
                              </Text>
                           </View>
                        ))}
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(
                                 CURRENCY_FULL_FORMAT,
                                 cashFlowData?.cashFlow.expenseGlobal[item]?.actual,
                              )}
                           </Text>
                        </View>
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(CURRENCY_FULL_FORMAT, cashFlowData?.cashFlow.netCashFlow[item]?.actual)}
                           </Text>
                        </View>
                        <View
                           style={{
                              height: 15,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 4,
                           }}
                        >
                           <Text
                              style={{
                                 fontSize: 5,
                                 fontWeight: '700',
                                 color: 'rgba(118, 149, 72, 1)',
                              }}
                           >
                              {numberFormatter(
                                 CURRENCY_FULL_FORMAT,
                                 cashFlowData?.cashFlow.operatingLoanBalance[item]?.actual,
                              )}
                           </Text>
                        </View>
                     </View>
                  ))}
               </View>
            </WrapperTable>
         </Page> : null}
      </>
   );
}
