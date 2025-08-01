import {Box, InputAdornment} from '@mui/material';
import React, {useCallback, useRef, useState} from 'react';
import TextFieldFHG from '../../../components/TextField';
import {makeStyles} from '@mui/styles';
import AddFilePopup from './AddFilePopup';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import {CHAT_MESSAGE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

const useStyles = makeStyles((theme) => ({
   input: {
      borderRadius: '60px',
      overflow: 'hidden',
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
      '& > .Mui-focused': {
         borderWidth: '0px !important',
      },
   },
}));
/**
 *  Component to input chat message
 *
 * @return {JSX.Element}
 * @constructor
 */
const ChatInput = () => {
   const classes = useStyles();
   const [addChatMessage] = useMutationLxFHG(CHAT_MESSAGE_CREATE_UPDATE);

   const [message, setMessage] = useState('');

   const {currentChatRoom, getChatRoomById} = useChatRoomHelper();

   const input = useRef(null);

   const handleSend = useCallback(async () => {
      if (!message || !currentChatRoom?.id) return;
      await addChatMessage({
         variables: {
            chatMessage: {chatRoomId: currentChatRoom?.id, text: message, media: ''},
         },
         skip: !currentChatRoom?.id,
      });
      getChatRoomById();
      setMessage('');
   }, [message, currentChatRoom?.id, getChatRoomById, addChatMessage]);

   const onKeyUp = useCallback(
      (event) => {
         if (event.charCode === 13) {
            handleSend();
         }
      },
      [handleSend]
   );

   return (
      <Box
         display='flex'
         alignItems='center'
         sx={{
            backgroundColor: 'background.default',
            paddingLeft: '9px',
         }}
      >
         <TextFieldFHG
            ref={input}
            name='message'
            className={classes.input}
            InputProps={{
               startAdornment: (
                  <InputAdornment position='start'>
                     <AddFilePopup />
                  </InputAdornment>
               ),
            }}
            focused={false}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            onKeyPress={onKeyUp}
         />
         <Box
            display='flex'
            alignItems='center'
            sx={{
               marginTop: '8px',
               marginLeft: '12px',
            }}
         >
            <img
               onClick={handleSend}
               src='/images/send.png'
               alt='send message'
               style={{
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
               }}
            />
         </Box>
      </Box>
   );
};

export default ChatInput;
