import {Box, List} from '@mui/material';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import Message from './Message';
import {useRecoilValue} from 'recoil';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';
/**
 *  Show chat messages
 *
 * @return {JSX.Element}
 * @constructor
 */
const ChatMessages = () => {
   const {currentChatRoom} = useChatRoomHelper();

   const usersMap = useMemo(
      () => new Map(currentChatRoom?.users?.map((item) => [item.id, item])),
      [currentChatRoom?.users]
   );
   const messages = useMemo(
      () =>
         currentChatRoom?.chatMessages?.map((item) => ({
            ...item,
            author: usersMap?.get(item.authorId),
         })) || [],
      [currentChatRoom?.chatMessages, usersMap]
   );

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const list = useRef(null);

   const scrollToBottom = () => {
      list.current?.scrollIntoView({behavior: 'smooth'});
   };

   useLayoutEffect(() => {
      setTimeout(() => scrollToBottom(), 500);
   }, [currentChatRoom, messages]);

   return (
      <Box
         display='flex'
         flex={1}
         sx={{
            height: '100%',
            overflow: 'auto',
         }}
      >
         <List
            style={{
               width: '100%',
            }}
         >
            {messages?.reverse().map((item, index) => (
               <Message
                  key={item.id}
                  data={item}
                  type={cognitoSub !== item.authorId ? 'guest' : 'owner'}
                  read={
                     index < messages?.length - 1 ||
                     item?.readUsers?.filter((user) => user.id !== cognitoSub)?.length > 0
                  }
               />
            ))}
            <div ref={list} />
         </List>
      </Box>
   );
};

export default ChatMessages;
