import {Alert, Box, Button, Grid, List, Slide, Snackbar, Switch} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import TextFieldFHG from '../../../components/TextField';
import ChatUser from './ChatUser';
import TypographyFHG from '../../../fhg/components/Typography';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {typeForRightSideStore, listChatRoomsStore, TYPE_RIGHT} from './stores';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import {
   CHAT_ROOM_CREATE,
   CHAT_ROOM_DELETE,
   CHAT_ROOM_UPDATE,
   REMOVE_USER_CHAT_ROOM,
   USER_CLIENT_QUERY,
} from '../../../data/QueriesGL';
import TextFieldLF from '../../../components/TextFieldLF';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import ChatUserForAdd from './ChatUserForAdd';
import Loading from '../../../fhg/components/Loading';
import {TYPE_CHAT} from '../../../Constants';
import {VIEW} from './Chat';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';
import {userRoleState} from '../../Main';

const useStyles = makeStyles((theme) => ({
   search: {
      borderWidth: 1,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
   },
   input: {
      backgroundColor: 'white',
      height: '47px',
      width: '90%',
      borderRadius: '10px',
   },
   listUser: {
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      paddingLeft: '20px',
      paddingRight: '20px',
   },
   listUserNoMT: {
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      marginTop: '6px',
      paddingLeft: '20px',
   },
   save: {
      paddingTop: '24px',
      paddingLeft: '12px',
      paddingRight: '12px',
      display: 'flex',
      justifyContent: 'center',
   },
   header: {
      paddingTop: '20px',
      paddingLeft: '20px',
      paddingRight: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   members: {
      paddingLeft: '20px',
      paddingRight: '20px',
      display: 'flex',
      alignItems: 'center',
   },
   addUser: {
      paddingLeft: '20px',
      paddingRight: '20px',
   },
}));

/**
 * Component to add new chat room
 *
 * @param onCloseRight handle hide after create
 * @param isXs check xs size
 * @param setShowView handle show view create/edit chat room
 * @param show flag show hide view
 * @return {JSX.Element}
 * @constructor
 */
const AddChatRoom = ({onCloseRight, isXs, setShowView, show}) => {
   const classes = useStyles();

   const {getChatRoomById, getChatRooms, currentChatRoom, setCurrentChatId} = useChatRoomHelper();

   const [listUsers, setListUsers] = useState([]);

   const [nameRoom, setNameRoom] = useState('');

   const [updateChatRoom, {loading: loadingUpdate}] = useMutationLxFHG(CHAT_ROOM_UPDATE);

   const [createChatRoom, {loading: loadingCreate}] = useMutationLxFHG(CHAT_ROOM_CREATE);

   const typeForRightSide = useRecoilValue(typeForRightSideStore);

   const isEditing = useMemo(() => typeForRightSide === TYPE_RIGHT.editing, [typeForRightSide]);

   useEffect(() => {
      if (!isEditing) {
         setNameRoom('');
         setListUsers([]);
      }
   }, [isEditing, show]);

   const setListChatRooms = useSetRecoilState(listChatRoomsStore);

   const [success, setSuccess] = useState(false);
   const [hasError, setHasError] = useState(false);
   const [needAddMember, setNeedAddMember] = useState(false);

   const [removeUsersMutation] = useMutationLxFHG(REMOVE_USER_CHAT_ROOM);

   const authInfo = useRecoilValue(userStatus);

   const {isAdmin} = useRecoilValue(userRoleState);

   const [isPrivate, setIsPrivate] = useState(false);

   useEffect(() => {
      setIsPrivate(currentChatRoom?.type === TYPE_CHAT.private);
   }, [currentChatRoom?.type]);

   useEffect(() => {
      isEditing && setListUsers(currentChatRoom?.users?.filter((item) => item?.id !== authInfo?.id));
   }, [currentChatRoom?.users, isEditing, authInfo?.id]);

   useEffect(() => {
      isEditing && setNameRoom(currentChatRoom?.name);
   }, [currentChatRoom?.name, isEditing]);

   useEffect(() => {
      isEditing && !currentChatRoom && onCloseRight();
   }, [currentChatRoom, onCloseRight, isEditing]);

   const intl = useIntl();

   const [deleteChatRoom] = useMutationLxFHG(CHAT_ROOM_DELETE);

   const handleUpdate = useCallback(async () => {
      try {
         let image = currentChatRoom?.image ?? '';
         if (isEditing) {
            const listCurrent = listUsers?.map((user) => user?.id);
            const listCurrentNotOwner = currentChatRoom?.users?.filter((item) => item?.id !== authInfo?.id);
            const listDeleted = (currentChatRoom?.users?.filter((item) => item?.id !== authInfo?.id) || [])
               ?.filter((item) => !listCurrent.includes(item?.id))
               ?.map((item) => item?.id);
            await removeUsersMutation({
               variables: {
                  chatRoomId: currentChatRoom?.id,
                  userId: listDeleted,
               },
               skip: listDeleted?.length === 0,
            });
            if (listCurrentNotOwner.length === listDeleted.length) {
               await deleteChatRoom({
                  variables: {
                     chatRoomId: currentChatRoom?.id,
                  },
               });
               setListChatRooms((prev) => prev.filter((item) => item.id !== currentChatRoom?.id));
               setCurrentChatId(null);
            } else {
               await updateChatRoom({
                  variables: {
                     chatRoomId: currentChatRoom?.id,
                     chatRoom: {
                        name: nameRoom,
                        type: !isAdmin || (isAdmin && isPrivate) ? TYPE_CHAT.private : TYPE_CHAT.public,
                        image,
                     },
                     userId: listCurrent,
                  },
               });
               setListChatRooms((prev) => {
                  const index = prev.findIndex((item) => item?.id === currentChatRoom?.id);
                  const news = [...prev];
                  if (index !== -1) {
                     news[index] = {...news[index], name: nameRoom, image};
                  }
                  return news;
               });
               getChatRoomById();
            }
            await getChatRooms();
            onCloseRight();
         } else {
            const listUser = listUsers?.map((user) => user?.id) || [];
            if (listUser.length === 0) {
               setNeedAddMember(true);
               return;
            }
            const newChatRoom = await createChatRoom({
               variables: {
                  chatRoom: {
                     image,
                     name: nameRoom,
                     type: !isAdmin || (isAdmin && isPrivate) ? TYPE_CHAT.private : TYPE_CHAT.public,
                  },
                  userId: listUser,
               },
            });
            onCloseRight();
            if (newChatRoom?.data?.chatRoom_Create) {
               setCurrentChatId(newChatRoom.data.chatRoom_Create.id);
               setListChatRooms((prev) => [newChatRoom?.data?.chatRoom_Create, ...prev]);
               await getChatRooms();
            }
         }
      } catch (error) {
         setHasError(true);
      }
   }, [
      currentChatRoom?.image,
      currentChatRoom?.users,
      currentChatRoom?.id,
      isEditing,
      listUsers,
      removeUsersMutation,
      onCloseRight,
      setListChatRooms,
      getChatRoomById,
      getChatRooms,
      authInfo?.id,
      deleteChatRoom,
      updateChatRoom,
      nameRoom,
      isAdmin,
      isPrivate,
      createChatRoom,
      setCurrentChatId,
   ]);

   const removeUser = useCallback((id) => () => setListUsers((prev) => prev.filter((item) => item?.id !== id)), []);

   const [showAdd, setShowAdd] = useState(false);

   const [userData] = useQueryFHG(
      USER_CLIENT_QUERY,
      {
         fetchPolicy: 'no-cache',
      },
      'chat.type'
   );

   const [keyword, setKeyword] = useState('');

   const allUsers = useMemo(
      () =>
         (userData?.users || [])?.filter((item) =>
            (item.contactName || '')?.toLowerCase()?.includes(keyword?.toLowerCase())
         ),
      [keyword, userData?.users]
   );

   const selectUser = useCallback(
      (user) => () =>
         setListUsers((prev) =>
            prev.findIndex((item) => item?.id === user?.id) > -1
               ? prev.filter((item) => item?.id !== user?.id)
               : [...prev, user]
         ),
      []
   );

   return (
      <Slide direction='left' in={show} mountOnEnter unmountOnExit>
         <Grid
            item
            xs={isXs ? 12 : 3}
            style={{
               backgroundColor: 'background.main',
               display: 'flex',
               flexDirection: 'column',
               height: '100%',
            }}
         >
            <Box className={classes.header}>
               <TypographyFHG variant='fs24500' color='text.black'>
                  {isEditing ? formatMessage(intl, 'chat.editChat') : formatMessage(intl, 'chat.newChat')}
               </TypographyFHG>
               <img
                  src='/images/close.png'
                  alt='close'
                  style={{
                     width: '14px',
                     height: '14px',
                     cursor: 'pointer',
                  }}
                  onClick={() => {
                     setShowView && setShowView(isEditing ? VIEW.chat : VIEW.list);
                     onCloseRight();
                  }}
               />
            </Box>
            <Box className={classes.search}>
               {listUsers?.length > 1 ? (
                  <TextFieldFHG
                     className={classes.input}
                     placeholder='Chat Name'
                     disableUnderline
                     value={nameRoom}
                     onChange={(e) => setNameRoom(e.target.value)}
                  />
               ) : (
                  <Box height={12} />
               )}
            </Box>
            <Box className={classes.members}>
               <TypographyFHG variant='fs20700' color='text.black'>
                  {formatMessage(intl, 'chat.members')}
               </TypographyFHG>
               <Button onClick={() => setShowAdd(true)}>
                  <img
                     src='/images/add-file.png'
                     alt='add member'
                     style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '7px',
                        marginLeft: '4px',
                     }}
                  />
                  <TypographyFHG variant='fs16700' color='text.green'>
                     {formatMessage(intl, 'chat.addMembers')}
                  </TypographyFHG>
               </Button>
            </Box>
            <Box
               sx={{
                  display: 'flex',
                  height: 0,
                  flex: 1,
                  flexDirection: 'column',
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
                  marginLeft: '20px',
                  marginRight: '20px',
                  borderRadius: '10px',
                  marginTop: !showAdd ? '12px' : '0px',
               }}
            >
               {showAdd && (
                  <Box
                     display='flex'
                     flexDirection='column'
                     sx={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        borderRadius: '10px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                     }}
                  >
                     <Box
                        display='flex'
                        flexDirection='row'
                        justifyContent='space-between'
                        alignItems='center'
                        sx={{
                           marginBottom: '12px',
                        }}
                     >
                        <Box display='flex' flexDirection='row' alignItems='center' flex={1}>
                           <TypographyFHG variant='fs14400'>{formatMessage(intl, 'chat.add')}:</TypographyFHG>
                           <Box width='14px' />
                           <TextFieldLF
                              style={{
                                 margin: '0px',
                              }}
                              value={keyword}
                              onChange={(e) => setKeyword(e.target.value)}
                           />
                        </Box>
                        <Box width='14px' />
                        <img
                           onClick={() => setShowAdd(false)}
                           src='/images/close.png'
                           alt='close'
                           style={{
                              width: '14px',
                              height: '14px',
                              cursor: 'pointer',
                           }}
                        />
                     </Box>
                     <TypographyFHG variant='fs18700' color='text.black'>
                        {formatMessage(intl, 'chat.suggested')}
                     </TypographyFHG>
                  </Box>
               )}
               {showAdd ? (
                  <Box className={classes.listUserNoMT}>
                     <List>
                        {allUsers?.map((item) => (
                           <ChatUserForAdd
                              key={item?.id}
                              size={36}
                              data={item}
                              selected={listUsers?.findIndex((user) => user?.id === item?.id) > -1}
                              onClick={selectUser(item)}
                           />
                        ))}
                     </List>
                  </Box>
               ) : (
                  <Box className={classes.listUser}>
                     <List>
                        {listUsers?.map((item) => (
                           <ChatUser
                              key={item?.id}
                              size={36}
                              data={item}
                              isUser
                              isEditing={isEditing}
                              onClickIcon={removeUser(item?.id)}
                           />
                        ))}
                     </List>
                  </Box>
               )}
            </Box>
            {isAdmin && (
               <Box
                  sx={{
                     paddingLeft: '20px',
                     paddingTop: '16px',
                  }}
               >
                  <TypographyFHG variant='fs16700' color='text.black'>
                     {formatMessage(intl, 'chat.private')}
                  </TypographyFHG>
                  <Switch checked={isPrivate} onChange={(e) => setIsPrivate(!isPrivate)} />
               </Box>
            )}
            <Box className={classes.save}>
               <Button
                  disabled={loadingUpdate}
                  onClick={handleUpdate}
                  variant='contained'
                  style={{
                     width: '200px',
                  }}
               >
                  <TypographyFHG variant='fs16700'>{formatMessage(intl, 'chat.save')}</TypographyFHG>
               </Button>
            </Box>
            {<Loading isLoading={loadingUpdate || loadingCreate} hasBackdrop />}
            <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
               <Alert
                  onClose={() => setSuccess(false)}
                  severity='success'
                  sx={{width: '100%', backgroundColor: 'primary.dark', color: 'text.white'}}
               >
                  {isEditing ? formatMessage(intl, 'chat.changeDone') : formatMessage(intl, 'chat.createDone')}
               </Alert>
            </Snackbar>
            <Snackbar open={hasError} autoHideDuration={3000} onClose={() => setHasError(false)}>
               <Alert onClose={() => setHasError(false)} severity='error'>
                  {isEditing ? formatMessage(intl, 'chat.changeFailed') : formatMessage(intl, 'chat.createFailed')}
               </Alert>
            </Snackbar>
            <Snackbar open={needAddMember} autoHideDuration={3000} onClose={() => setNeedAddMember(false)}>
               <Alert onClose={() => setNeedAddMember(false)} severity='error'>
                  {formatMessage(intl, 'chat.addMember.message')}
               </Alert>
            </Snackbar>
         </Grid>
      </Slide>
   );
};

export default AddChatRoom;
