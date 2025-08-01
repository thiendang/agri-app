import {Grid, useMediaQuery} from '@mui/material';
import React, {useEffect} from 'react';
import ListChatRooms from './ListChatRooms';
import {makeStyles} from '@mui/styles';
import Conversation from './Conversation';
import {useState} from 'react';
import AddChatRoom from './AddChatRoom';
import {useRecoilValue} from 'recoil';
import {TYPE_RIGHT, typeForRightSideStore} from './stores';
import ReportUserChat from './ReportUserChat';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {useSubscriptionChat} from '../../../fhg/hooks/useSubscriptionChat';

const useStyles = makeStyles((theme) => ({
   container: {
      justifyContent: 'center',
      margin: theme.spacing(10),
      [theme.breakpoints.down('md')]: {
         margin: theme.spacing(8, 0),
      },
      '& > .MuiGrid-item': {
         paddingLeft: '0px !important',
         paddingTop: '0px !important',
      },
      backgroundColor: 'white',
   },
}));

export const VIEW = {
   chat: 'chat',
   new: 'view',
   list: 'list',
};

/**
 * Chat page
 *
 * @return {JSX.Element}
 * @constructor
 */
const Chat = () => {
   const classes = useStyles();
   const [showRight, setShowRight] = useState(false);
   const typeForRightSide = useRecoilValue(typeForRightSideStore);
   const [isShowListRoom, setShowListChatRoom] = useState(true);
   useSubscriptionChat();

   const [{chatId}] = useCustomSearchParams();

   useEffect(() => {
      if (chatId) setShowView(VIEW.chat);
   }, [chatId]);

   const [showView, setShowView] = useState(VIEW.list);

   const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

   if (isXs)
      return (
         <Grid className={classes.container} container>
            {showView === VIEW.list && (
               <ListChatRooms
                  show={showView === VIEW.list}
                  setShowView={setShowView}
                  onShowRight={() => setShowRight((prev) => !prev)}
                  isXs={isXs}
               />
            )}
            {showView === VIEW.chat && (
               <Conversation
                  show={showView === VIEW.chat}
                  setShowView={setShowView}
                  onShowRight={() => setShowRight((prev) => true)}
                  isXs={isXs}
               />
            )}
            {showView === VIEW.new && (
               <AddChatRoom
                  show={showView === VIEW.new}
                  setShowView={setShowView}
                  onCloseRight={() => setShowRight(false)}
                  isXs={isXs}
               />
            )}
         </Grid>
      );

   return (
      <Grid className={classes.container} container>
         <ListChatRooms
            isShowListRoom={isShowListRoom}
            show={true}
            onShowRight={() => setShowRight((prev) => !prev)}
            hideListChat={() => setShowListChatRoom(false)}
            showListChat={() => setShowListChatRoom(true)}
         />
         <Conversation
            show={true}
            isShowListRoom={isShowListRoom}
            showListChat={() => setShowListChatRoom(true)}
            onShowRight={() => setShowRight(() => true)}
            showAdd={showRight && typeForRightSide !== TYPE_RIGHT.report}
         />
         <AddChatRoom
            show={showRight && typeForRightSide !== TYPE_RIGHT.report}
            onCloseRight={() => setShowRight(false)}
         />
         {showRight && typeForRightSide === TYPE_RIGHT.report && (
            <ReportUserChat
               show={showRight && typeForRightSide === TYPE_RIGHT.report}
               onCloseRight={() => setShowRight(false)}
            />
         )}
      </Grid>
   );
};

export default Chat;
