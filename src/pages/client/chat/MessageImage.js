import {Box, Grid, ListItem} from '@mui/material';
import React, {useMemo} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import moment from 'moment';
import {useIntl} from 'react-intl';
import {downloadBlob, formatMessage} from '../../../fhg/utils/Utils';
import {AvatarChat} from './AvatarChat';
import {getUrlRequest} from '../../../utils/helpers';

/**
 *  Message view for image
 * @param type message type
 * @param data data of message
 * @param read message status
 * @return {JSX.Element}
 * @constructor
 */
const MessageImage = ({type, data, read}) => {
   const dateShow = useMemo(() => {
      if (!data.updatedDateTime) return '';
      const now = moment().format('MM-DD-YYYY');
      const fromMsg = moment(data.updatedDateTime).format('MM-DD-YYYY');
      if (now === fromMsg) return moment(data.updatedDateTime).format('HH:MM A');
      return moment(data.updatedDateTime).format('MM-DD-YYYY HH:MM A');
   }, [data.updatedDateTime]);

   const intl = useIntl();

   async function handleDownload() {
      const fileUrl = data?.media;
      const blob = await getUrlRequest(fileUrl).catch(() => null);
      if (!blob) return;
      downloadBlob(data?.media?.substring(data?.media.lastIndexOf('/') + 1, data?.media?.length));
   }

   if (type === 'guest')
      return (
         <ListItem>
            <Grid container>
               <Box
                  sx={{
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'flex-end',
                     marginRight: '10px',
                  }}
               >
                  <AvatarChat
                     alt='Avatar'
                     src={data?.author?.profilePic?.imageS3}
                     size={40}
                     name={data?.author?.contactName}
                  />
               </Box>
               <Grid
                  item
                  xs={5}
                  sx={{
                     backgroundColor: 'background.lightGreen',
                     padding: '10px',
                     borderRadius: '20px 20px 20px 0px',
                     position: 'relative',
                  }}
               >
                  <img
                     src={data?.media}
                     alt={data?.media}
                     style={{
                        width: '100%',
                     }}
                  />
                  <Box
                     style={{
                        position: 'absolute',
                        left: '4%',
                        bottom: '4%',
                        borderRadius: 18,
                        backgroundColor: 'white',
                        padding: 6,
                        width: 36,
                        height: 36,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                     }}
                     onClick={handleDownload}
                  >
                     <img
                        src='/images/download.png'
                        alt='download'
                        style={{
                           width: 18,
                           height: 18,
                        }}
                     />
                  </Box>
               </Grid>
               <Grid
                  item
                  xs={10}
                  sx={{
                     paddingLeft: '50px',
                  }}
               >
                  <TypographyFHG variant='fs14400' color='text.black' align='right'>
                     {dateShow}
                  </TypographyFHG>
                  <img
                     src='/images/smile.png'
                     alt='smile icon'
                     style={{
                        width: '12.5px',
                        height: '12.5px',
                        marginLeft: '7px',
                     }}
                  />
               </Grid>
            </Grid>
         </ListItem>
      );
   return (
      <ListItem>
         <Grid container>
            <Grid item xs={7} />
            <Grid
               item
               xs={5}
               sx={{
                  backgroundColor: 'primary.green',
                  padding: '10px',
                  borderRadius: '20px 20px 0px 20px',
                  position: 'relative',
               }}
            >
               <img
                  src={data?.media}
                  alt={data?.media}
                  style={{
                     width: '100%',
                  }}
               />
               <Box
                  style={{
                     position: 'absolute',
                     right: '4%',
                     bottom: '4%',
                     borderRadius: 18,
                     backgroundColor: 'white',
                     padding: 6,
                     width: 36,
                     height: 36,
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     cursor: 'pointer',
                  }}
                  onClick={handleDownload}
               >
                  <img
                     src='/images/download.png'
                     alt='download'
                     style={{
                        width: 18,
                        height: 18,
                     }}
                  />
               </Box>
            </Grid>
            <Grid item xs={2} />
            <Grid
               item
               xs={10}
               sx={{
                  textAlign: 'right',
               }}
            >
               <TypographyFHG variant='fs14400' color='text.black' align='right'>
                  {dateShow}
               </TypographyFHG>
               <TypographyFHG variant='fs20700' color='text.black' align='right'>
                  {' • '}
               </TypographyFHG>
               <TypographyFHG variant='fs14700' color='text.black' align='right'>
                  {read ? formatMessage(intl, 'chat.read') : formatMessage(intl, 'chat.sent')}
               </TypographyFHG>
            </Grid>
         </Grid>
      </ListItem>
   );
};

export default MessageImage;
