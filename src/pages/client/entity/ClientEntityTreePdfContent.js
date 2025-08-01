// noinspection ES6CheckImport
import {Image, View} from '@react-pdf/renderer';
import React from 'react';
import TreeEntityItemPdf from '../../../fhg/components/pdf/tree/TreeEntityItemPdf';
import {BIG_LOGO_ICON} from '../../../Constants';

/**
 * Asset PDF table component to display all the current entity Assets.
 *
 * Reviewed: 8/22/2022
 */
export default function ClientEntityTreePdfContent({root, labelKey, itemsKey, users}) {
   return (
      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
         <TreeEntityItemPdf item={root} labelKey={labelKey} itemsKey={itemsKey} users={users} />
         <Image
            src={BIG_LOGO_ICON}
            style={{
               position: 'absolute',
               alignSelf: 'center',
               zIndex: -1,
               width: '100%',
               height: '100%',
               objectFit: 'contain',
            }}
         />
      </View>
   );
}
