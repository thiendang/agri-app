import {Box, Grid, Slide} from '@mui/material';
import React, {useMemo} from 'react';
import ChatHead from './ChatHead';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import {makeStyles} from '@mui/styles';
import {VIEW} from './Chat';
import {useRecoilValue} from 'recoil';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

const useStyles = makeStyles((theme) => ({
   container: {
      backgroundColor: theme.palette.background.main,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #CBD5E1',
      height: '100%',
      borderRadius: theme.spacing(0, 4, 4, 0),
      [theme.breakpoints.down('md')]: {
         borderLeft: '0px solid #CBD5E1',
         borderRadius: theme.spacing(4),
      },
   },
}));

/**
 * Component show all functions of chat
 * @param isXs check xs size
 * @param show flag show sidebar
 * @param showAdd flag show add chat room view
 * @param isShowListRoom flag show list chat room
 * @param onShowRight handle show sidebar
 * @param setShowView handle show new/edit view
 * @return {JSX.Element}
 * @constructor
 */
const Conversation = ({onShowRight, isXs, setShowView, show, showAdd, isShowListRoom}) => {
   const classes = useStyles();
   const {currentChatRoom} = useChatRoomHelper();

   const [{}, setSearchParams] = useCustomSearchParams();

   const users = useMemo(() => currentChatRoom?.users || [], [currentChatRoom?.users]);

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const listUser = useMemo(() => (users ?? []).map((item) => item.id), [users]);

   const inRoom = useMemo(() => listUser?.includes(cognitoSub), [cognitoSub, listUser]);

   const isOwner = useMemo(
      () => currentChatRoom?.createdByUserId === cognitoSub,
      [cognitoSub, currentChatRoom?.createdByUserId],
   );

   return (
      <Slide direction='left' in={show} mountOnEnter unmountOnExit>
         <Grid
            item
            xs={
               isXs
                  ? 12
                  : !isShowListRoom && !showAdd
                  ? 11.5
                  : showAdd && !isShowListRoom
                  ? 8.5
                  : !showAdd && isShowListRoom
                  ? 9
                  : 6
            }
            className={classes.container}
         >
            {isXs && (
               <Box
                  onClick={() => {
                     setShowView && setShowView(VIEW.list);
                     setSearchParams((prev) => {
                        if (prev?.chatId) {
                           delete prev.chatId;
                        }
                        return prev;
                     });
                  }}
                  style={{
                     padding: '16px',
                     cursor: 'point',
                  }}
               >
                  <img src='/images/back.png' alt='back icon' />
               </Box>
            )}
            {currentChatRoom && (
               <>
                  <ChatHead onShowRight={onShowRight} setShowView={setShowView} />
                  <ChatMessages />
                  {(inRoom || isOwner) && <ChatInput />}
               </>
            )}
         </Grid>
      </Slide>
   );
};

export default Conversation;
