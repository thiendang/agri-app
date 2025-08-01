// noinspection ES6CheckImport
import {Text, Page, StyleSheet, Image, View} from '@react-pdf/renderer';
import numberFormatter from 'number-formatter';
import React from 'react';
import {CURRENCY_FULL_FORMAT, PERCENT_FORMAT_BEFORE} from '../../../Constants';
import Html from 'react-pdf-html';
import Footer from '../../../components/pdf/Footer';
import {convertTimeToLongFormat, generateHtml, registerInterFont} from '../../../utils/helpers';
import {sortBy} from 'lodash';
import {HeaderPdf} from '../../../fhg/components/pdf/Header';

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      paddingLeft: 10,
      paddingTop: 36,
      paddingBottom: 50,
      paddingRight: 10,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
      fontFamily: 'Inter',
   },
   title: {
      fontFamily: 'Inter',
      textAlign: 'center',
      color: '#000',
      fontSize: 8,
      fontWeight: '700',
   },
});

/**
 * Business Game Plan PDF component.
 *
 */
export function GamePlanPdf({
   orientation = 'landscape',
   entityNames,
   coreValues,
   ourWhyText,
   whoWeServe,
   goals,
   rocks,
   reportDate,
}) {
   const rocksShort = rocks.filter((item) => item.length === 'short');
   const rocksLong = rocks.filter((item) => item.length === 'long');

   return (
      <>
         <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
            <Footer />
            <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Business Game Plan - Vision' />
            <View
               style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: 20,
               }}
            >
               <View
                  style={{
                     flex: 1 / 3,
                     display: 'flex',
                  }}
               >
                  <View
                     style={{
                        borderWidth: 1,
                        borderColor: '#E9E9E9',
                        borderRadius: 20,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        marginRight: 15,
                     }}
                  >
                     <View
                        style={{
                           display: 'flex',
                           flexDirection: 'row',
                           alignItems: 'center',
                           marginBottom: 5,
                        }}
                     >
                        <Image
                           src='/images/corevalue.png'
                           style={{
                              width: 15,
                              height: 15,
                              objectFit: 'contain',
                              marginRight: 5,
                           }}
                        />
                        <Text
                           style={{
                              fontSize: 14,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                              fontFamily: 'Inter',
                           }}
                        >
                           Core Values
                        </Text>
                     </View>
                     <Text
                        style={{
                           fontSize: 8,
                           fontWeight: '400',
                           color: 'rgba(0, 0, 0, 1)',
                           fontFamily: 'Inter',
                        }}
                     >
                        Core values can look like anything, for example, do the right thing, lead by example, etc.
                     </Text>
                     <View style={{height: 18}} />
                     {coreValues?.map((item, index) => (
                        <View
                           key={item.id}
                           style={{
                              display: 'flex',
                              flexDirection: 'row',
                              marginBottom: 18,
                           }}
                        >
                           <View
                              style={{
                                 width: 4,
                                 height: 4,
                                 borderRadius: 2,
                                 backgroundColor: 'rgba(118, 149, 72, 1)',
                                 marginTop: 4,
                              }}
                           />
                           <View
                              style={{
                                 display: 'flex',
                                 flex: 1,
                                 flexDirection: 'column',
                                 marginLeft: 6,
                              }}
                           >
                              <Text style={{fontSize: 10, fontWeight: '700', color: '#000', fontFamily: 'Inter'}}>
                                 {item.name}
                              </Text>
                              <Text style={{fontSize: 8, fontWeight: '400', color: '#000', fontFamily: 'Inter'}}>
                                 {item.description}
                              </Text>
                           </View>
                        </View>
                     ))}
                  </View>
               </View>
               <View
                  style={{
                     flex: 1 / 3,
                     display: 'flex',
                  }}
               >
                  <View
                     style={{
                        borderWidth: 1,
                        borderColor: '#E9E9E9',
                        borderRadius: 20,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        marginRight: 15,
                     }}
                  >
                     <View
                        style={{
                           display: 'flex',
                           flexDirection: 'row',
                           alignItems: 'center',
                           marginBottom: 5,
                        }}
                     >
                        <Image
                           src='/images/ourwhy.png'
                           style={{
                              width: 15,
                              height: 15,
                              objectFit: 'contain',
                              marginRight: 5,
                           }}
                        />
                        <Text
                           style={{
                              fontSize: 14,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                              fontFamily: 'Inter',
                           }}
                        >
                           Our Why
                        </Text>
                     </View>
                     <Text
                        style={{
                           fontSize: 8,
                           fontWeight: '400',
                           color: 'rgba(0, 0, 0, 1)',
                           fontFamily: 'Inter',
                        }}
                     >
                        Why does your company exists? God gave you this business for a reason, why is that? Think deeply
                        about this.
                     </Text>
                     <View style={{height: 18}} />
                     <Html style={{fontSize: 8}}>{generateHtml(ourWhyText)}</Html>
                  </View>
               </View>
               <View
                  style={{
                     flex: 1 / 3,
                     display: 'flex',
                  }}
               >
                  <View
                     style={{
                        borderWidth: 1,
                        borderColor: '#E9E9E9',
                        borderRadius: 20,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        marginRight: 15,
                     }}
                  >
                     <View
                        style={{
                           display: 'flex',
                           flexDirection: 'row',
                           alignItems: 'center',
                           marginBottom: 5,
                        }}
                     >
                        <Image
                           src='/images/ourwhy.png'
                           style={{
                              width: 15,
                              height: 15,
                              objectFit: 'contain',
                              marginRight: 5,
                           }}
                        />
                        <Text
                           style={{
                              fontSize: 14,
                              fontWeight: '700',
                              color: 'rgba(118, 149, 72, 1)',
                              fontFamily: 'Inter',
                           }}
                        >
                           Who We Serve
                        </Text>
                     </View>
                     <Text
                        style={{
                           fontSize: 8,
                           fontWeight: '400',
                           color: 'rgba(0, 0, 0, 1)',
                           fontFamily: 'Inter',
                        }}
                     >
                        Let’s talk about who you service as a company. Be specific here according to target market and
                        geographic location.
                     </Text>
                     <View style={{height: 18}} />
                     <Html style={{fontSize: 8}}>{generateHtml(whoWeServe)}</Html>
                  </View>
               </View>
            </View>
         </Page>
         <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
            <Footer />
            <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Business Game Plan - Goals' />
            <View
               style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: '#E9E9E9',
                  borderRadius: 4,
                  padding: 10,
                  marginTop: 20,
                  display: 'flex',
                  flexDirection: 'column',
               }}
            >
               <Text style={styles.title}>Goals</Text>
               <View
                  style={{
                     width: '100%',
                     display: 'flex',
                     flexDirection: 'row',
                     marginTop: 5,
                     flexWrap: 'wrap',
                     rowGap: 8,
                  }}
               >
                  {goals.map((item) => (
                     <View key={item.id} style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
                        <View
                           style={{
                              width: '99%',
                              borderWidth: 1,
                              borderColor: 'rgba(241, 244, 237, 1)',
                              borderRadius: 5,
                           }}
                        >
                           <View
                              style={{
                                 width: '100%',
                                 backgroundColor: 'rgba(118, 149, 72, 0.1)',
                                 borderRadius: 4,
                                 paddingBottom: 5,
                                 paddingTop: 5,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'center',
                                    fontSize: 8,
                                    fontWeight: '700',
                                    color: '#769548',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.name}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '100%',
                                 padding: 4,
                                 backgroundColor: '#fff',
                                 display: 'flex',
                                 flexDirection: 'row',
                                 alignItems: 'center',
                              }}
                           >
                              <Text style={{fontSize: 5, fontWeight: '700', color: '#000', fontFamily: 'Inter'}}>
                                 Future Date{' '}
                              </Text>
                              <Text style={{fontSize: 5, fontWeight: '400', color: '#000', fontFamily: 'Inter'}}>
                                 {convertTimeToLongFormat(item.futureDate)}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '100%',
                                 padding: 4,
                                 backgroundColor: '#fff',
                                 display: 'flex',
                                 flexDirection: 'row',
                                 alignItems: 'center',
                              }}
                           >
                              <Text style={{fontSize: 5, fontWeight: '700', color: '#000', fontFamily: 'Inter'}}>
                                 Revenue:{' '}
                              </Text>
                              <Text style={{fontSize: 5, fontWeight: '400', color: '#000', fontFamily: 'Inter'}}>
                                 {numberFormatter(CURRENCY_FULL_FORMAT, item.revenue)}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '100%',
                                 backgroundColor: '#fff',
                                 display: 'flex',
                                 flexDirection: 'row',
                                 justifyContent: 'space-between',
                              }}
                           >
                              <View style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
                                 <View
                                    style={{
                                       width: '99%',
                                       backgroundColor: 'rgba(118, 149, 72, 0.1)',
                                       borderRadius: 2,
                                       paddingBottom: 5,
                                       paddingTop: 5,
                                    }}
                                 >
                                    <Text
                                       style={{
                                          textAlign: 'center',
                                          fontSize: 6,
                                          fontWeight: '700',
                                          color: '#769548',
                                          fontFamily: 'Inter',
                                       }}
                                    >
                                       Profit
                                    </Text>
                                 </View>
                                 <View style={{width: '99%'}}>
                                    <View
                                       style={{
                                          width: '100%',
                                          padding: 4,
                                          backgroundColor: '#fff',
                                          display: 'flex',
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                       }}
                                    >
                                       <Text
                                          style={{
                                             fontSize: 5,
                                             fontWeight: '700',
                                             color: '#000',
                                             fontFamily: 'Inter',
                                          }}
                                       >
                                          Net %
                                       </Text>
                                       <Text
                                          style={{
                                             fontSize: 5,
                                             fontWeight: '400',
                                             color: '#000',
                                             textAlign: 'right',
                                             fontFamily: 'Inter',
                                          }}
                                       >
                                          {numberFormatter(PERCENT_FORMAT_BEFORE, item.profitNetPercent)}
                                       </Text>
                                    </View>
                                    <View
                                       style={{
                                          width: '100%',
                                          padding: 4,
                                          backgroundColor: '#fff',
                                          display: 'flex',
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                       }}
                                    >
                                       <Text
                                          style={{
                                             fontSize: 5,
                                             fontWeight: '700',
                                             color: '#000',
                                             fontFamily: 'Inter',
                                          }}
                                       >
                                          Net $
                                       </Text>
                                       <Text
                                          style={{
                                             fontSize: 5,
                                             fontWeight: '400',
                                             color: '#000',
                                             textAlign: 'right',
                                             fontFamily: 'Inter',
                                          }}
                                       >
                                          {numberFormatter(CURRENCY_FULL_FORMAT, item.profitNetDollars)}
                                       </Text>
                                    </View>
                                 </View>
                              </View>
                              <View style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
                                 <View
                                    style={{
                                       width: '100%',
                                       backgroundColor: 'rgba(118, 149, 72, 0.1)',
                                       borderRadius: 2,
                                       paddingBottom: 5,
                                       paddingTop: 5,
                                    }}
                                 >
                                    <Text
                                       style={{
                                          textAlign: 'center',
                                          fontSize: 6,
                                          fontWeight: '700',
                                          color: '#769548',
                                          fontFamily: 'Inter',
                                       }}
                                    >
                                       Goals
                                    </Text>
                                 </View>
                                 <View style={{width: '100%'}}>
                                    <Html style={{fontSize: 5}}>{generateHtml(item.summary)}</Html>
                                 </View>
                              </View>
                           </View>
                        </View>
                     </View>
                  ))}
               </View>
            </View>
         </Page>
         <Page size='LETTER' orientation={orientation} style={styles.generalInformation1}>
            <Footer />
            <HeaderPdf entityNames={entityNames} reportDate={reportDate} title='Business Game Plan - Rocks' />
            <View
               style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: '#E9E9E9',
                  borderRadius: 4,
                  padding: 10,
                  marginTop: 20,
                  display: 'flex',
                  flexDirection: 'column',
               }}
            >
               <Text style={styles.title}>Short Term Rocks</Text>
               {rocksShort.map((item) => (
                  <View key={item.id} style={{width: '100%', display: 'flex', flexDirection: 'column', marginTop: 5}}>
                     <View
                        style={{
                           width: '99%',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           borderRadius: 4,
                           paddingBottom: 5,
                           paddingTop: 5,
                        }}
                     >
                        <Text
                           style={{
                              textAlign: 'center',
                              fontSize: 8,
                              fontWeight: '700',
                              color: '#769548',
                              fontFamily: 'Inter',
                           }}
                        >
                           {item.name}
                        </Text>
                     </View>
                     <View
                        style={{
                           width: '99%',
                           display: 'flex',
                           flexDirection: 'row',
                           justifyContent: 'space-between',
                           marginTop: 4,
                        }}
                     >
                        <View
                           style={{
                              width: '33%',
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              borderRadius: 4,
                              paddingBottom: 5,
                              paddingTop: 5,
                           }}
                        >
                           <Text
                              style={{
                                 textAlign: 'center',
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: '#769548',
                                 fontFamily: 'Inter',
                              }}
                           >
                              Description
                           </Text>
                        </View>
                        <View
                           style={{
                              width: '33%',
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              borderRadius: 4,
                              paddingBottom: 5,
                              paddingTop: 5,
                           }}
                        >
                           <Text
                              style={{
                                 textAlign: 'center',
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: '#769548',
                                 fontFamily: 'Inter',
                              }}
                           >
                              Due date
                           </Text>
                        </View>
                        <View
                           style={{
                              width: '33%',
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              borderRadius: 4,
                              paddingBottom: 5,
                              paddingTop: 5,
                           }}
                        >
                           <Text
                              style={{
                                 textAlign: 'center',
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: '#769548',
                                 fontFamily: 'Inter',
                              }}
                           >
                              Assign To:
                           </Text>
                        </View>
                     </View>
                     {sortBy(item.targets ?? [], 'orderIndex').map((item) => (
                        <View
                           key={item.id}
                           style={{
                              width: '99%',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginTop: 4,
                           }}
                        >
                           <View
                              style={{
                                 width: '33%',
                                 borderRadius: 4,
                                 paddingBottom: 3,
                                 paddingTop: 3,
                                 paddingHorizontal: 4,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'left',
                                    fontSize: 6,
                                    fontWeight: '400',
                                    color: '#000',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.note}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '33%',
                                 borderRadius: 4,
                                 paddingBottom: 3,
                                 paddingTop: 3,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'center',
                                    fontSize: 6,
                                    fontWeight: '400',
                                    color: '#000',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.dueDate}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '33%',
                                 borderRadius: 4,
                                 paddingBottom: 3,
                                 paddingTop: 3,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'center',
                                    fontSize: 6,
                                    fontWeight: '400',
                                    color: '#000',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.assignee?.contactName}
                              </Text>
                           </View>
                        </View>
                     ))}
                  </View>
               ))}
            </View>
            <View
               style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: '#E9E9E9',
                  borderRadius: 4,
                  padding: 10,
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
               }}
            >
               <Text style={styles.title}>Long Term Rocks</Text>
               {rocksLong.map((item) => (
                  <View key={item.id} style={{width: '100%', display: 'flex', flexDirection: 'column', marginTop: 5}}>
                     <View
                        style={{
                           width: '99%',
                           backgroundColor: 'rgba(118, 149, 72, 0.1)',
                           borderRadius: 4,
                           paddingBottom: 5,
                           paddingTop: 5,
                        }}
                     >
                        <Text
                           style={{
                              textAlign: 'center',
                              fontSize: 8,
                              fontWeight: '700',
                              color: '#769548',
                              fontFamily: 'Inter',
                           }}
                        >
                           {item.name}
                        </Text>
                     </View>
                     <View
                        style={{
                           width: '99%',
                           display: 'flex',
                           flexDirection: 'row',
                           justifyContent: 'space-between',
                           marginTop: 4,
                        }}
                     >
                        <View
                           style={{
                              width: '33%',
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              borderRadius: 4,
                              paddingBottom: 5,
                              paddingTop: 5,
                           }}
                        >
                           <Text
                              style={{
                                 textAlign: 'center',
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: '#769548',
                                 fontFamily: 'Inter',
                              }}
                           >
                              Description
                           </Text>
                        </View>
                        <View
                           style={{
                              width: '33%',
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              borderRadius: 4,
                              paddingBottom: 5,
                              paddingTop: 5,
                           }}
                        >
                           <Text
                              style={{
                                 textAlign: 'center',
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: '#769548',
                                 fontFamily: 'Inter',
                              }}
                           >
                              Due date
                           </Text>
                        </View>
                        <View
                           style={{
                              width: '33%',
                              backgroundColor: 'rgba(118, 149, 72, 0.1)',
                              borderRadius: 4,
                              paddingBottom: 5,
                              paddingTop: 5,
                           }}
                        >
                           <Text
                              style={{
                                 textAlign: 'center',
                                 fontSize: 6,
                                 fontWeight: '700',
                                 color: '#769548',
                                 fontFamily: 'Inter',
                              }}
                           >
                              Assign To:
                           </Text>
                        </View>
                     </View>
                     {sortBy(item.targets ?? [], 'orderIndex').map((item) => (
                        <View
                           key={item.id}
                           style={{
                              width: '99%',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginTop: 4,
                           }}
                        >
                           <View
                              style={{
                                 width: '33%',
                                 borderRadius: 4,
                                 paddingBottom: 3,
                                 paddingTop: 3,
                                 paddingHorizontal: 4,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'left',
                                    fontSize: 6,
                                    fontWeight: '400',
                                    color: '#000',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.note}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '33%',
                                 borderRadius: 4,
                                 paddingBottom: 3,
                                 paddingTop: 3,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'center',
                                    fontSize: 6,
                                    fontWeight: '400',
                                    color: '#000',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.dueDate}
                              </Text>
                           </View>
                           <View
                              style={{
                                 width: '33%',
                                 borderRadius: 4,
                                 paddingBottom: 3,
                                 paddingTop: 3,
                              }}
                           >
                              <Text
                                 style={{
                                    textAlign: 'center',
                                    fontSize: 6,
                                    fontWeight: '400',
                                    color: '#000',
                                    fontFamily: 'Inter',
                                 }}
                              >
                                 {item.assignee?.contactName}
                              </Text>
                           </View>
                        </View>
                     ))}
                  </View>
               ))}
            </View>
         </Page>
      </>
   );
}
