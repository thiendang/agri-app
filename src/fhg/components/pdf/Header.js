import {Image, StyleSheet, Text, View} from '@react-pdf/renderer';
import React, {useMemo} from 'react';
import {Title} from '../../../components/pdf/TableOfContents';
import moment from 'moment';
import {LOGO_LARGE} from '../../../Constants';
import {DATE_DB_FORMAT, MONTH_FORMAT} from '../../../Constants';
import {registerInterFont} from '../../../utils/helpers';

registerInterFont();

const styles = StyleSheet.create({
   fullWidthHeader: {
      flexDirection: 'column',
      display: 'flex',
      width: '100%',
   },
   titleStyle: {
      color: '#000',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Inter',
   },
   dateStyle: {
      fontSize: 8,
      fontWeight: '400',
      color: 'rgba(153, 153, 153, 1)',
      fontFamily: 'Inter',
   },
   entityNameStyle: {
      fontSize: 8,
      fontWeight: '400',
      color: 'rgba(153, 153, 153, 1)',
      fontFamily: 'Inter',
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
      height: 28,
   },
   columnSection: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
   },
});

export const HeaderPdf = ({entityNames, reportDate, title}) => {
   const date = useMemo(() => {
      let d = moment(reportDate, MONTH_FORMAT);
      if (!d.isValid()) {
         d = moment(reportDate, DATE_DB_FORMAT);
      }
      return d.format('MMMM YYYY');
   }, [reportDate]);

   return (
      <View style={styles.fullWidthHeader}>
         <View style={styles.columnSection}>
            <View style={styles.headerStyle}>
               <Title style={styles.titleStyle}>{title}</Title>
               <Text style={styles.entityNameStyle}>{entityNames}</Text>
               <Text style={styles.dateStyle}>{date}</Text>
            </View>
            <View style={styles.imageViewStyle}>
               <Image src={LOGO_LARGE} style={styles.imageStyle} />
            </View>
         </View>
      </View>
   );
};
