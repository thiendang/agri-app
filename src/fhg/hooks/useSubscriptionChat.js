import {useSubscription} from '@apollo/client';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {useEffect, useMemo} from 'react';
import {useChatRoomHelper} from './useChatRoomHelper';
import {listChatRoomsStore} from '../../pages/client/chat/stores';
import {
   ADDED_TO_ROOM_SUBSCRIPTION,
   CREATE_ROOM_SUBSCRIPTION,
   DROPPED_FROM_ROOM_SUBSCRIPTION,
   MESSAGE_POSTED_SUBSCRIPTION,
   MESSAGE_READ_SUBSCRIPTION,
   RENAME_ROOM_SUBSCRIPTION,
} from '../../data/QueriesGL';
import {userStatus} from '../components/security/AuthenticatedUser';

export const useSubscriptionChat = () => {
   const {getChatRoomById, currentChatRoom, setCurrentChatId} = useChatRoomHelper();

   const setListChatRooms = useSetRecoilState(listChatRoomsStore);

   const {data: dataNewChat} = useSubscription(MESSAGE_POSTED_SUBSCRIPTION, {
      variables: {
         chatRoomId: currentChatRoom?.id,
      },
      skip: !currentChatRoom?.id,
      shouldResubscribe: true,
   });

   useSubscription(MESSAGE_READ_SUBSCRIPTION, {
      variables: {
         chatRoomId: currentChatRoom?.id,
      },
      skip: !currentChatRoom?.id,
      shouldResubscribe: true,
      onData: () => {
         getChatRoomById();
      },
   });

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const {data: dataAddedRoom} = useSubscription(ADDED_TO_ROOM_SUBSCRIPTION, {
      variables: {
         userId: cognitoSub,
      },
      skip: !cognitoSub,
      shouldResubscribe: true,
   });

   const {data: dataDroppedRoom} = useSubscription(DROPPED_FROM_ROOM_SUBSCRIPTION, {
      variables: {
         userId: cognitoSub,
      },
      skip: !cognitoSub,
      shouldResubscribe: true,
   });

   const {data: dataNewChatRoom} = useSubscription(CREATE_ROOM_SUBSCRIPTION, {
      shouldResubscribe: true,
   });

   const {data: dataRenameChatRoom} = useSubscription(RENAME_ROOM_SUBSCRIPTION, {
      shouldResubscribe: true,
   });

   const {getChatRooms} = useChatRoomHelper();

   useEffect(() => {
      const chat = dataDroppedRoom?.chatRoom_DroppedFromRoom;
      if (chat) {
         // check if in list rooms => remove
         setListChatRooms((prev) => {
            const index = prev.findIndex((item) => item.id === chat.id);
            if (index > -1) {
               return prev.filter((item) => item.id !== chat.id);
            }
            return prev;
         });
         // check if in current chat => replace = list[0]
         if (currentChatRoom?.id === chat.id) {
            setCurrentChatId(null);
         }
      }
   }, [currentChatRoom?.id, dataDroppedRoom?.chatRoom_DroppedFromRoom, setCurrentChatId, setListChatRooms]);

   useEffect(() => {
      if (
         dataAddedRoom?.chatRoom_AddedToRoom ||
         dataRenameChatRoom?.chatRoom_Renamed ||
         dataNewChatRoom?.chatRoom_Created
      ) {
         getChatRooms();
      }
   }, [
      dataAddedRoom?.chatRoom_AddedToRoom,
      dataNewChatRoom?.chatRoom_Created,
      dataRenameChatRoom?.chatRoom_Renamed,
      getChatRooms,
   ]);

   useEffect(() => {
      if (dataNewChat?.chatMessage_MessagePosted) {
         if (dataNewChat?.chatMessage_MessagePosted?.authorId !== cognitoSub) {
            getChatRoomById();
         }
      }
   }, [cognitoSub, dataNewChat, getChatRoomById]);
};
