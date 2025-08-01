import {Box, Button, Popover} from '@mui/material';
import React, {useCallback, useMemo} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {typeForRightSideStore, listChatRoomsStore, TYPE_RIGHT} from './stores';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import {CHAT_ROOM_DELETE, JOIN_CHAT_ROOM, LEAVE_USER_CHAT_ROOM} from '../../../data/QueriesGL';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import {VIEW} from './Chat';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

/**
 *  Option button component
 * @param onShowRight handle show sidebar
 * @param setShowView handle show new/edit view
 * @return {JSX.Element}
 * @constructor
 */
const MoreButton = ({onShowRight, setShowView}) => {
   const [anchorEl, setAnchorEl] = React.useState(null);

   const setTypeForRightSide = useSetRecoilState(typeForRightSideStore);

   const {getChatRooms, setCurrentChatId} = useChatRoomHelper();

   const {currentChatRoom, getChatRoomById} = useChatRoomHelper();

   const users = useMemo(() => currentChatRoom?.users || [], [currentChatRoom?.users]);

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const listUser = useMemo(() => (users ?? []).map((item) => item.id), [users]);

   const inRoom = useMemo(() => listUser?.includes(cognitoSub), [cognitoSub, listUser]);

   const [deleteChatRoom] = useMutationLxFHG(CHAT_ROOM_DELETE);

   const setListChatRooms = useSetRecoilState(listChatRoomsStore);

   const isOwner = useMemo(
      () => currentChatRoom?.createdByUserId === cognitoSub,
      [cognitoSub, currentChatRoom?.createdByUserId]
   );

   const [leaveUserChatRoom] = useMutationLxFHG(LEAVE_USER_CHAT_ROOM);
   const [joinUserChatRoom] = useMutationLxFHG(JOIN_CHAT_ROOM);

   const handleJoinChatRoom = useCallback(async () => {
      handleClose();
      await joinUserChatRoom({
         variables: {
            chatRoomId: currentChatRoom?.id,
         },
      });
      await getChatRoomById();
      setShowView?.(VIEW.list);
      getChatRooms();
   }, [joinUserChatRoom, currentChatRoom?.id, getChatRoomById, setShowView, getChatRooms]);

   const handleDeleteChatRoom = useCallback(async () => {
      handleClose();
      try {
         if (isOwner) {
            await deleteChatRoom({
               variables: {
                  chatRoomId: currentChatRoom?.id,
               },
            });
         } else {
            await leaveUserChatRoom({
               variables: {
                  chatRoomId: currentChatRoom?.id,
               },
            });
         }
         setListChatRooms((prev) => prev.filter((item) => item.id !== currentChatRoom?.id));
         setCurrentChatId(null);
         setShowView?.(VIEW.list);
      } catch (error) {}
   }, [
      isOwner,
      setListChatRooms,
      setShowView,
      setCurrentChatId,
      deleteChatRoom,
      currentChatRoom?.id,
      leaveUserChatRoom,
   ]);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const open = Boolean(anchorEl);
   const id = open ? 'simple-popover' : undefined;

   const intl = useIntl();

   return (
      <>
         <Button onClick={handleClick}>
            <img
               src='/images/three-dot.png'
               alt='option'
               style={{
                  height: '6px',
               }}
            />
         </Button>
         <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
               vertical: 'top',
               horizontal: 'left',
            }}
         >
            <Box display='flex' flexDirection='column' width='188px' margin='8px'>
               <Button onClick={handleClose}>
                  <Box display='flex' flexDirection='row' alignItems='center'>
                     <img
                        src='/images/notify.png'
                        alt='add-file'
                        style={{
                           width: '13.5px',
                        }}
                     />
                     <Box width='6px' />
                     <TypographyFHG variant='fs18700' color='text.green'>
                        {formatMessage(intl, 'chat.muteNotification')}
                     </TypographyFHG>
                  </Box>
               </Button>
               {isOwner && (
                  <>
                     <Button>
                        <Box
                           display='flex'
                           flexDirection='row'
                           alignItems='center'
                           onClick={() => {
                              setTypeForRightSide(TYPE_RIGHT.editing);
                              onShowRight();
                              handleClose();
                              setShowView?.(VIEW.new);
                           }}
                        >
                           <img
                              src='/images/edit.png'
                              alt='add-file'
                              style={{
                                 width: '13.5px',
                              }}
                           />
                           <Box width='6px' />
                           <TypographyFHG variant='fs18700' color='text.green'>
                              {formatMessage(intl, 'chat.editChat')}
                           </TypographyFHG>
                        </Box>
                     </Button>
                     <Box height='8px' />
                  </>
               )}
               {!inRoom && !isOwner && (
                  <Button onClick={handleJoinChatRoom}>
                     <Box display='flex' flexDirection='row' alignItems='center'>
                        <Box width='6px' />
                        <TypographyFHG variant='fs18700' color='text.green'>
                           {formatMessage(intl, 'chat.join')}
                        </TypographyFHG>
                     </Box>
                  </Button>
               )}
               {inRoom && !isOwner && (
                  <Button onClick={handleDeleteChatRoom}>
                     <Box display='flex' flexDirection='row' alignItems='center'>
                        <Box width='6px' />
                        <TypographyFHG variant='fs18700' color='text.green'>
                           {formatMessage(intl, 'chat.leave')}
                        </TypographyFHG>
                     </Box>
                  </Button>
               )}
               {isOwner && (
                  <Button onClick={handleDeleteChatRoom}>
                     <Box display='flex' flexDirection='row' alignItems='center'>
                        <img
                           src='/images/delete.png'
                           alt='add-file'
                           style={{
                              width: '12px',
                           }}
                        />
                        <Box width='6px' />
                        <TypographyFHG variant='fs18700' color='text.green'>
                           {formatMessage(intl, 'chat.delete')}
                        </TypographyFHG>
                     </Box>
                  </Button>
               )}
               {!isOwner && inRoom && (
                  <>
                     <Box height='8px' />
                     <Button
                        onClick={() => {
                           setTypeForRightSide(TYPE_RIGHT.report);
                           onShowRight();
                           handleClose();
                        }}
                     >
                        <Box display='flex' flexDirection='row' alignItems='center'>
                           <img
                              src='/images/report.png'
                              alt='add-file'
                              style={{
                                 width: '15px',
                              }}
                           />
                           <Box width='6px' />
                           <TypographyFHG variant='fs18700' color='text.green'>
                              {formatMessage(intl, 'chat.report')}
                           </TypographyFHG>
                        </Box>
                     </Button>
                  </>
               )}
            </Box>
         </Popover>
      </>
   );
};

export default MoreButton;
