import React from 'react';
import {Text, View, Image, StyleSheet} from '@react-pdf/renderer';
import {SMALL_LOGO_WHITE} from '../../Constants';

const styles = StyleSheet.create({
   footerFrame: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: 'center',
   },
   logo: {
      marginLeft: 20,
      width: 82,
      paddingTop: 9,
      paddingBottom: 9,
   },
});

/**
 * Component for the footer in the PDF documents. Displays the logo - page number - date.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function Footer() {
   return (
      <View
         style={[
            styles.footerFrame,
            {
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               flexDirection: 'row',
               paddingRight: 16,
               backgroundColor: '#769548',
            },
         ]}
         fixed
      >
         <Image style={styles.logo} src={SMALL_LOGO_WHITE} />
         <Text style={{color: 'white'}} render={({pageNumber, totalPages}) => `Page ${pageNumber}`} fixed />
      </View>
   );
}
