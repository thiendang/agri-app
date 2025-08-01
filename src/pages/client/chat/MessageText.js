import {Box, Grid, ListItem} from '@mui/material';
import React, {useMemo} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import moment from 'moment';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {AvatarChat} from './AvatarChat';

/**
 *  Message view for text
 * @param type message type
 * @param data data of message
 * @param read message status
 * @return {JSX.Element}
 * @constructor
 */
const MessageText = ({type, data, read}) => {
   const dateShow = useMemo(() => {
      if (!data.updatedDateTime) return '';
      const now = moment().format('MM-DD-YYYY');
      const fromMsg = moment(data.updatedDateTime).format('MM-DD-YYYY');
      if (now === fromMsg) return moment(data.updatedDateTime).format('HH:MM A');
      return moment(data.updatedDateTime).format('MM-DD-YYYY HH:MM A');
   }, [data.updatedDateTime]);

   const intl = useIntl();

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
                  xs={10}
                  sx={{
                     backgroundColor: '#F1F4ED',
                     padding: '20px',
                     borderRadius: '20px 20px 20px 0px',
                  }}
               >
                  <TypographyFHG variant='fs18400' color='text.black'>
                     {data?.text}
                  </TypographyFHG>
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
            <Grid item xs={2} />
            <Grid
               item
               xs={10}
               sx={{
                  backgroundColor: '#769548',
                  padding: '20px',
                  borderRadius: '20px 20px 0px 20px',
               }}
            >
               <TypographyFHG variant='fs18400' color='text.white'>
                  {data?.text}
               </TypographyFHG>
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

export default MessageText;
