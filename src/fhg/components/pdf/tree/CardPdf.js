import React from 'react';
import {Text, StyleSheet, View} from '@react-pdf/renderer';
import {SPACING_DEFAULT_PDF} from '../../../../Constants';
import DividerPdf from './DividerPdf';
import ListItem from './ListItem';
import {registerInterFont} from '../../../../utils/helpers';

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
   responsibilityStyle: {
      marginLeft: SPACING_DEFAULT_PDF * 3,
      marginRight: SPACING_DEFAULT_PDF * 2,
      fontSize: 10,
      color: 'rgba(0, 0, 0, 0.87)',
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
export default function CardPdf({item, labelKey, users}) {
   return (
      <View style={{display: 'flex', flexDirection: 'column', borderRadius: 8}}>
         <Text style={styles.titleStyle}>{item?.[labelKey] || 'Untitled'}</Text>
         <DividerPdf orientation={'horizontal'} size={1} color={'rgba(0, 0, 0, 0.08)'} />
         <Text style={styles.subtitleStyle}>Roles & Responsibilities</Text>
         <View style={{width: '100%', paddingRight: 14}}>
            {item?.responsibilities?.length > 0 &&
               item?.responsibilities.map((responsibility) => (
                  <ListItem key={'li ' + responsibility}>{responsibility?.name}</ListItem>
               ))}
         </View>
      </View>
   );
}
