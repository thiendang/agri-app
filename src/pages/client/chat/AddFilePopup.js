import {Box, Popover} from '@mui/material';
import React, {useMemo, useRef} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import moment from 'moment';
import {FILE_BUCKET, SCALE_APP} from '../../../Constants';
import {Storage} from 'aws-amplify';
import {useRecoilValue} from 'recoil';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import {CHAT_MESSAGE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

export function makeid(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

export const S3_URL = `https://${FILE_BUCKET}.s3.amazonaws.com/`;

/**
 * Component to send file in chat
 *
 * @return {JSX.Element}
 * @constructor
 */
const AddFilePopup = () => {
   const [anchorEl, setAnchorEl] = React.useState(null);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const fileInputRef = useRef(null);

   const imageInputRef = useRef(null);

   const authState = useRecoilValue(userStatus);

   const cognitoSub = useMemo(() => authState?.id, [authState?.id]);

   const [addChatMessage] = useMutationLxFHG(CHAT_MESSAGE_CREATE_UPDATE);

   const {currentChatRoom, getChatRoomById} = useChatRoomHelper();

   const handleFile = async (file) => {
      handleClose();
      let upload = null;
      const ext = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
      try {
         if (typeof file !== 'undefined' && file) {
            const fileName = `${moment().unix() + makeid(5)}.${ext}`;
            const insertKey = `lms/upload/${cognitoSub}/chat/${fileName}`;
            upload = await Storage.put(insertKey, file, {
               level: 'public',
               contentType: file.type,
               errorCallback: (err) => {
                  console.error('Unexpected error while uploading', err);
               },
            });
            const imageUrl = `${S3_URL}${insertKey}`;
            await addChatMessage({
               variables: {
                  chatMessage: {chatRoomId: currentChatRoom?.id, text: '', media: imageUrl},
               },
            });
            await getChatRoomById();
         }
      } catch (err) {
         Storage.cancel(upload);
         console.log(err);
      }
   };

   const handleFileUpload = async () => {
      const file = fileInputRef.current.files[0];
      if (!file) return;
      await handleFile(file);
   };

   const handleImageUpload = async () => {
      const image = imageInputRef.current.files[0];
      if (!image) return;
      await handleFile(image);
   };

   const open = Boolean(anchorEl);
   const id = open ? 'simple-popover' : undefined;

   const intl = useIntl();

   return (
      <>
         <img
            aria-describedby={id}
            onClick={handleClick}
            src='/images/add-file.png'
            alt='add chat'
            style={{
               width: 28 * SCALE_APP,
               height: 28 * SCALE_APP,
               cursor: 'pointer',
            }}
         />
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
               <Box display='flex' flexDirection='row' alignItems='center'>
                  <label for='file-input'>
                     <Box
                        display='flex'
                        flexDirection='row'
                        alignItems='center'
                        sx={{
                           cursor: 'pointer',
                        }}
                     >
                        <img
                           src='/images/file.png'
                           alt='add-file'
                           style={{
                              width: '16.5px',
                              height: '22px',
                           }}
                        />
                        <Box width='6px' />
                        <TypographyFHG variant='fs18700' color='text.green'>
                           {formatMessage(intl, 'chat.addFile')}
                        </TypographyFHG>
                     </Box>
                  </label>
                  <input
                     ref={fileInputRef}
                     id='file-input'
                     type='file'
                     name='file'
                     style={{
                        display: 'none',
                     }}
                     onChange={handleFileUpload}
                     onClick={(e) => (e.target.value = null)}
                     accept='.pdf, text/plain, .xlsx, .docx'
                  />
               </Box>
               <Box height='8px' />
               <Box display='flex' flexDirection='row' alignItems='center'>
                  <label for='image-input'>
                     <Box
                        display='flex'
                        flexDirection='row'
                        alignItems='center'
                        sx={{
                           cursor: 'pointer',
                        }}
                     >
                        <img
                           src='/images/image.png'
                           alt='add-file'
                           style={{
                              width: '16.5px',
                              height: '22px',
                           }}
                        />
                        <Box width='6px' />
                        <TypographyFHG variant='fs18700' color='text.green'>
                           {formatMessage(intl, 'chat.addPhoto')}
                        </TypographyFHG>
                     </Box>
                  </label>
                  <input
                     ref={imageInputRef}
                     id='image-input'
                     type='file'
                     name='image'
                     style={{
                        display: 'none',
                     }}
                     accept='image/png, image/gif, image/jpeg'
                     onChange={handleImageUpload}
                     onClick={(e) => (e.target.value = null)}
                  />
               </Box>
            </Box>
         </Popover>
      </>
   );
};

export default AddFilePopup;
