import Box from '@mui/material/Box';
import React from 'react';

import useScalePanel from '../hooks/useScalePanel';
import {useTheme} from '@mui/styles';
import {DARK_MODE_COLORS} from '../../Constants';

/**
 * Scale Panel component that scales the children. The zoom in/out and clear buttons are displayed in the upper right.
 *
 * Reviewed:
 */
export default function ScalePanel({name, style = {}, children}) {
   const propertyKey = name + 'Scale';
   const theme = useTheme();

   const {scaleStyle, buttonPanel} = useScalePanel({
      backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_2 : 'white',
      opacity: 1,
      propertyKey,
   });

   return (
      <Box
         name='ScaleFrame'
         height={'100%'}
         width={'100%'}
         position={'relative'}
         overflow={'hidden'}
         flex={'1 1 0%'}
         display={'flex'}
      >
         {buttonPanel}
         <Box name='Scale Grid' overflow={'auto'} width={'100%'} display={'flex'}>
            <Box name='Scale Contents' marginLeft='auto' marginRight='auto' style={{...scaleStyle, ...style}}>
               {children}
            </Box>
         </Box>
      </Box>
   );
}
