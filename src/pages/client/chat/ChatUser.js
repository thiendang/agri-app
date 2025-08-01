import {Avatar, Box, Button} from '@mui/material';
import React, {useCallback, useMemo} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import Avatars from './Avatars';
import {useRecoilValue} from 'recoil';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import {PIN_CHAT_ROOM, UN_PIN_CHAT_ROOM} from '../../../data/QueriesGL';
import CircularProgress from '@mui/material/CircularProgress';
import {useToggle} from '../gamePlan/hooks/useToggle';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';
import {AvatarChat} from './AvatarChat';

/**
 *  Component to show chat user info
 * @param size size
 * @param data data user
 * @param selected user selected
 * @param onClick handle click
 * @param isUser flag for avatar of user in list users
 * @param onClickIcon handle click on icon
 * @param isReport flag for report
 * @return {JSX.Element}
 * @constructor
 */
const ChatUser = ({size = 48, data = {}, selected = false, onClick, isUser, onClickIcon, isReport}) => {
   const {name, users} = data;

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const listUser = useMemo(() => (users ?? []).filter((item) => item.id !== cognitoSub), [cognitoSub, users]);

   const isDirection = useMemo(() => listUser.length === 1, [listUser.length]);

   const user = useMemo(() => listUser[0], [listUser]);

   const isAvatars = useMemo(() => users?.length > 1, [users?.length]);

   const {isToggle, toggleOff, toggle} = useToggle();

   const [pinChatRoom] = useMutationLxFHG(PIN_CHAT_ROOM);

   const [unpinChatRoom] = useMutationLxFHG(UN_PIN_CHAT_ROOM);

   const names = useMemo(() => listUser?.map((item) => item.contactName)?.join(', '), [listUser]);

   const {getChatRooms} = useChatRoomHelper();

   const handlePin = useCallback(async () => {
      try {
         toggle();
         if (data?.pinnedByUser) {
            await unpinChatRoom({
               variables: {
                  chatRoomId: data?.id,
               },
            });
         } else {
            await pinChatRoom({
               variables: {
                  chatRoomId: data?.id,
               },
            });
         }
         await getChatRooms();
         toggleOff();
      } catch (error) {
         toggleOff();
      }
   }, [data?.id, data?.pinnedByUser, getChatRooms, pinChatRoom, toggle, toggleOff, unpinChatRoom]);

   const pinnedView = useCallback(() => {
      if (isToggle) {
         return (
            <Box
               flex={0.2}
               display='flex'
               alignItems='center'
               justifyContent='center'
               style={{
                  width: 40,
                  height: 40,
               }}
            >
               <CircularProgress size={14} />
            </Box>
         );
      }
      return (
         <Box
            flex={0.2}
            display='flex'
            alignItems='center'
            justifyContent='center'
            style={{
               width: 40,
               height: 40,
            }}
         >
            <Box
               sx={{
                  cursor: 'pointer',
               }}
               onClick={handlePin}
            >
               {!data?.pinnedByUser ? (
                  <img
                     src='/images/ic-un-pinned.png'
                     alt='ic-un-pinned'
                     style={{
                        width: 26,
                        height: 26,
                     }}
                  />
               ) : (
                  <img
                     src='/images/ic-pinned.png'
                     alt='ic-pinned'
                     style={{
                        width: 30,
                        height: 30,
                     }}
                  />
               )}
            </Box>
         </Box>
      );
   }, [isToggle, handlePin, data?.pinnedByUser]);

   if (isUser)
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
               <img
                  onClick={onClickIcon}
                  src='/images/trash.png'
                  alt='remove user'
                  style={{
                     cursor: 'pointer',
                  }}
               />
               {isReport && (
                  <img
                     onClick={onClickIcon}
                     src='/images/report.png'
                     alt='remove user'
                     style={{
                        cursor: 'pointer',
                        width: 15,
                        height: 17,
                     }}
                  />
               )}
            </Box>
         </Button>
      );
   if (isDirection) {
      return (
         <Box
            display='flex'
            flexDirection='row'
            alignItems={'center'}
            sx={{
               marginBottom: '20px',
            }}
         >
            <Box display='flex' flex={0.8} alignItems={'center'}>
               <Button
                  onClick={onClick}
                  style={{
                     width: '100%',
                  }}
               >
                  <Box display='flex' flexDirection='row' alignItems={'center'} width='100%'>
                     <AvatarChat src={user?.profilePic?.imageS3} size={size} name={user?.contactName} />
                     <Box width='32px' />
                     <Box>
                        <TypographyFHG
                           variant={selected ? 'fs18700' : 'fs18500'}
                           color={selected ? 'text.green' : 'text.black'}
                           style={{
                              textAlign: 'left',
                              lineBreak: 'anywhere',
                           }}
                        >
                           {user.contactName || 'No name'}
                        </TypographyFHG>
                     </Box>
                  </Box>
               </Button>
            </Box>
            {pinnedView()}
         </Box>
      );
   }
   return (
      <Box
         display='flex'
         flexDirection='row'
         alignItems={'center'}
         sx={{
            marginBottom: '20px',
         }}
      >
         <Box display='flex' flex={0.8} alignItems={'center'}>
            <Button
               onClick={onClick}
               style={{
                  width: '100%',
               }}
            >
               <Box display='flex' flexDirection='row' alignItems={'center'} width='100%'>
                  {data?.image ? (
                     <Avatar alt='Avatar' src={data?.image} sx={{width: size, height: size}} />
                  ) : (
                     <>
                        {isAvatars ? (
                           <Avatars
                              size={size}
                              ava1={users[0]?.profilePic?.imageS3}
                              ava2={users[1]?.profilePic?.imageS3}
                              name1={users[0]?.contactName}
                              name2={users[1]?.contactName}
                           />
                        ) : (
                           <AvatarChat
                              src={users?.[0]?.profilePic?.imageS3}
                              size={size}
                              name={users?.[0]?.contactName ?? name}
                           />
                        )}
                     </>
                  )}
                  <Box width='32px' />
                  <Box>
                     <TypographyFHG
                        variant={selected ? 'fs18700' : 'fs18500'}
                        color={selected ? 'text.green' : 'text.black'}
                        style={{
                           textAlign: 'left',
                           lineBreak: 'anywhere',
                        }}
                     >
                        {name || names}
                     </TypographyFHG>
                  </Box>
               </Box>
            </Button>
         </Box>
         {pinnedView()}
      </Box>
   );
};

export default ChatUser;
