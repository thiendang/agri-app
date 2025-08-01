import {StyleSheet, Text, View} from '@react-pdf/renderer';
import React from 'react';
import {SPACING_DEFAULT_PDF} from '../../../../Constants';
import {registerInterFont} from '../../../../utils/helpers';
import DividerPdf from './DividerPdf';

registerInterFont();

const styles = StyleSheet.create({
   titleStyle: {
      fontWeight: 500,
      fontSize: 12,
      padding: SPACING_DEFAULT_PDF * 2,
      color: 'rgba(0, 0, 0, 1)',
      fontFamily: 'Inter',
      overflow: 'hidden',
   },
   subtitleStyle: {
      marginTop: SPACING_DEFAULT_PDF,
      marginBottom: SPACING_DEFAULT_PDF,
      marginLeft: SPACING_DEFAULT_PDF * 2,
      color: 'rgba(0, 0, 0, 0.54)',
      fontSize: 10,
      fontFamily: 'Inter',
      fontWeight: '700',
   },
   userStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 3,
      marginBottom: SPACING_DEFAULT_PDF * 2,
      fontSize: 10,
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: 'Inter',
   },
   contentContainer: {
      padding: SPACING_DEFAULT_PDF * 2,
      width: '100%',
   },
   contentTitleStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 3,
      marginRight: SPACING_DEFAULT_PDF * 2,
      fontSize: 10,
      color: 'rgba(0, 0, 0, 1)',
      fontFamily: 'Inter',
      fontWeight: 700,
   },
   contentStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 3,
      marginRight: SPACING_DEFAULT_PDF * 2,
      fontSize: 10,
      color: 'rgba(0, 0, 0, 1)',
      fontFamily: 'Inter',
   },
});

/**
 * Component for the tree node contents to display. Works with accountability chart and is not completely generic.
 *
 * Reviewed: 8/22/2022
 *
 * @param item The item to display.
 * @param labelKey The key of the property to display for the title of the node.
 * @param users The users for the accountability chart.
 * @return {JSX.Element}
 * @constructor
 */
export default function EntityCardPdf({item, labelKey, users}) {
   return (
      <View style={{display: 'flex', flexDirection: 'column', borderRadius: 8}}>
         <Text style={styles.titleStyle}>{item?.name || 'Untitled'}</Text>
         <DividerPdf orientation={'horizontal'} size={1} color={'rgba(0, 0, 0, 0.08)'} />
         <View style={styles.contentContainer}>
            {item?.description && (
               <Text>
                  <Text style={styles.contentTitleStyle}>Description</Text>
                  <Text style={styles.contentStyle}> {item?.description}</Text>
               </Text>
            )}
            {item?.ein && (
               <Text style={{marginTop: 8}}>
                  <Text style={styles.contentTitleStyle}>EIN</Text>
                  <Text style={styles.contentStyle}> {item?.ein}</Text>
               </Text>
            )}
         </View>
      </View>
   );
}
