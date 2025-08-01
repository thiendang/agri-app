import {Text, View} from '@react-pdf/renderer';
import React from 'react';

export const WrapperTable = ({children, title}) => {
   return (
      <View
         bookmark={title}
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
            {title}
         </Text>
         {children}
      </View>
   );
};
