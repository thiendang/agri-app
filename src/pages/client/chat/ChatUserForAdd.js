import React from 'react';
import {Box, Button, Radio} from '@mui/material';
import TypographyFHG from '../../../fhg/components/Typography';
import {AvatarChat} from './AvatarChat';

/**
 *  Show chat user when adding a new chat room
 * @param size size
 * @param data data user
 * @param selected user selected
 * @param onClick handle click
 * @return {JSX.Element}
 * @constructor
 */
const ChatUserForAdd = ({size = 48, data = {}, selected = false, onClick}) => {
   return (
      <Button
         style={{
            marginBottom: '20px',
            width: '100%',
         }}
         onClick={onClick}
      >
         <Box display='flex' flexDirection='row' alignItems={'center'} width='100%'>
            <AvatarChat src={data?.profilePic?.imageS3} size={size} name={data?.contactName} />
            <Box width='32px' />
            <TypographyFHG
               variant={selected ? 'fs18700' : 'fs18500'}
               color={selected ? 'text.green' : 'text.black'}
               style={{
                  textAlign: 'left',
               }}
            >
               {data.contactName || 'No name'}
            </TypographyFHG>
            <Box
               sx={{
                  display: 'flex',
                  flex: 1,
               }}
            />
            <Radio checked={selected} />
         </Box>
      </Button>
   );
};

export default ChatUserForAdd;
