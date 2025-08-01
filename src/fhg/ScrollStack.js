import Stack from '@mui/material/Stack';
import React from 'react';

export default function ScrollStack({innerStackProps, overflow = 'auto', children, ...props}) {
   return (
      <Stack
         name='Scroll Stack'
         {...props}
         overflow={'hidden'}
         style={{scrollBehavior: 'smooth', ...(props?.style || {})}}
      >
         <Stack name='Scroll Stack Inner' overflow={overflow} {...innerStackProps}>
            {children}
         </Stack>
      </Stack>
   );
}
