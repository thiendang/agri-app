import {Box} from '@mui/material';
import React, {useMemo} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import MoreButton from './MoreButton';
import Avatars from './Avatars';
import {useRecoilValue} from 'recoil';
import moment from 'moment';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {AvatarChat} from './AvatarChat';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

/**
 *  Header of chat view
 *
 * @param onShowRight handle show sidebar
 * @param setShowView handle show new/edit view
 * @return {JSX.Element}
 * @constructor
 */
const ChatHead = ({onShowRight, setShowView}) => {
   const {currentChatRoom} = useChatRoomHelper();
   const users = useMemo(() => currentChatRoom?.users || [], [currentChatRoom?.users]);
   const isAvatars = useMemo(() => users?.length > 1, [users?.length]);

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const listUser = useMemo(() => (users ?? []).filter((item) => item.id !== cognitoSub), [cognitoSub, users]);

   const isDirection = useMemo(() => listUser.length === 1, [listUser.length]);

   const user = useMemo(() => listUser[0], [listUser]);

   const names = useMemo(() => listUser?.map((item) => item.contactName)?.join(', '), [listUser]);

   const intl = useIntl();

   return (
      <Box
         display='flex'
         alignItems='center'
         paddingLeft='19px'
         paddingRight='19px'
         justifyContent='space-between'
         paddingTop='12px'
      >
         {isDirection ? (
            <Box display='flex' alignItems='center'>
               <AvatarChat alt='Avatar' src={user?.profilePic?.imageS3} name={user?.contactName} size={30} />
               <Box display='flex' flexDirection='column' marginLeft='19px'>
                  <TypographyFHG variant='fs18700' color='text.black'>
                     {user?.contactName || 'No Name'}
                  </TypographyFHG>
                  <TypographyFHG variant='fs14400' color='text.black'>
                     {currentChatRoom?.chatMessages?.[0]?.updatedDateTime
                        ? `Active ${moment(currentChatRoom?.chatMessages?.[0]?.updatedDateTime).fromNow()}`
                        : ''}
                  </TypographyFHG>
               </Box>
            </Box>
         ) : (
            <Box display='flex' alignItems='center'>
               {currentChatRoom?.image ? (
                  <AvatarChat alt='Avatar' src={currentChatRoom?.image} name={currentChatRoom?.name || names} />
               ) : (
                  <>
                     {isAvatars ? (
                        <Avatars
                           ava1={users[0]?.profilePic?.imageS3}
                           ava2={users[1]?.profilePic?.imageS3}
                           name1={users[0]?.contactName}
                           name2={users[1]?.contactName}
                        />
                     ) : (
                        <AvatarChat alt='Avatar' src={users?.[0]?.profilePic?.imageS3} name={users?.[0]?.contactName} />
                     )}
                  </>
               )}
               <Box display='flex' flexDirection='column' marginLeft='19px'>
                  <TypographyFHG variant='fs18700' color='text.black'>
                     {currentChatRoom?.name || names}
                  </TypographyFHG>
                  <TypographyFHG variant='fs14400' color='text.black'>
                     {currentChatRoom?.chatMessages?.[0]?.updatedDateTime
                        ? `${formatMessage(intl, 'chat.active')} ${moment(
                             currentChatRoom?.chatMessages?.[0]?.updatedDateTime
                          ).fromNow()}`
                        : ''}
                  </TypographyFHG>
               </Box>
            </Box>
         )}
         <MoreButton onShowRight={onShowRight} setShowView={setShowView} />
      </Box>
   );
};

export default ChatHead;
