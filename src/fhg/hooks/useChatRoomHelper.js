import {useCallback, useMemo} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import useLazyQueryFHG from './data/useLazyQueryFHG';
import {CHAT_ROOM_ALL_WHERE, CHAT_ROOM_BY_ID_QUERY} from '../../data/QueriesGL';
import {listChatRoomsStore} from '../../pages/client/chat/stores';
import {userStatus} from '../components/security/AuthenticatedUser';
import {useCustomSearchParams} from './useCustomSearchParams';
import useQueryFHG from './data/useQueryFHG';
import {validate} from 'uuid';
import {find} from 'lodash';

export const useChatRoomHelper = () => {
   const [{chatId}, setSearchParams] = useCustomSearchParams();
   const [data, {refetch}] = useQueryFHG(CHAT_ROOM_BY_ID_QUERY, {
      variables: {
         chatRoomId: chatId,
      },
      skip: !validate(chatId),
      fetchPolicy: 'cache-and-network',
   });

   const getChatRoomById = useCallback(async () => {
      await refetch();
   }, [refetch]);

   const [getChatRoomsQuery] = useLazyQueryFHG(CHAT_ROOM_ALL_WHERE, {
      fetchPolicy: 'cache-and-network',
   });

   const setListChatRooms = useSetRecoilState(listChatRoomsStore);

   const authInfo = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authInfo?.id, [authInfo?.id]);

   const setCurrentChatId = useCallback((id) => setSearchParams((prev) => ({...prev, chatId: id})), [setSearchParams]);

   const getChatRooms = useCallback(
      async (params) => {
         const {data} = await getChatRoomsQuery({
            variables: {
               offset: 0,
               includeDeleted: false,
               chatRoomSearch: {},
               userId: [cognitoSub],
               memberOnly: false,
               sortOrder: [
                  {
                     fieldName: 'updatedDateTime',
                     direction: 'DESC',
                  },
               ],
               ...params,
            },
            fetchPolicy: 'cache-and-network',
         });
         let list = [...(data?.chatRooms || [])];
         setListChatRooms(list);
         const current = data?.chatRoom ? find(list, {id: data.chatRoom.id}) : list[0];
         setCurrentChatId(current?.id);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [cognitoSub, getChatRoomsQuery, setListChatRooms]
   );

   return {getChatRoomById, getChatRooms, currentChatRoom: data?.chatRoom, setCurrentChatId};
};
