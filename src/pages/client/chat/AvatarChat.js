import {Avatar, Box} from '@mui/material';
import React from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import {getInitialsName} from '../../../components/utils/helpers';

/**
 * Show user avatar
 *
 * @param src url image
 * @param name user's name
 * @param size size
 * @return {JSX.Element}
 * @constructor
 */
export const AvatarChat = ({src, name, size}) => {
   return (
      <>
         {src ? (
            <Avatar alt='Avatar' src={src} sx={{width: size, height: size}} />
         ) : (
            <Box
               sx={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#bdbdbd',
               }}
            >
               <TypographyFHG variant='fs16700' color='white'>
                  {getInitialsName(name ?? '')}
               </TypographyFHG>
            </Box>
         )}
      </>
   );
};
