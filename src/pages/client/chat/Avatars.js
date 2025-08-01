import {Box} from '@mui/material';
import React from 'react';
import {AvatarChat} from './AvatarChat';

/**
 * Show users' avatars in group chat
 *
 * @param ava1 url image 1
 * @param ava2 url image 2
 * @param name1 name of user 1
 * @param name2 name of user 2
 * @param size size
 * @return {JSX.Element}
 * @constructor
 */
const Avatars = ({size = 28, ava1, ava2, name1, name2}) => {
   return (
      <Box
         sx={{
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
         }}
      >
         <Box
            sx={{
               position: 'relative',
            }}
         >
            <AvatarChat src={ava1} size={size} name={name1} />
            <Box
               sx={{
                  width: size,
                  height: size,
                  position: 'absolute',
                  top: '8px',
                  left: size > 28 ? '14px' : '10px',
               }}
            >
               <AvatarChat src={ava2} size={size} name={name2} />
            </Box>
         </Box>
      </Box>
   );
};

export default Avatars;
