import {Alert, Box, Button, Grid, List, Slide, Snackbar} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React, {useCallback, useEffect, useState} from 'react';
import ChatUser from './ChatUser';
import TypographyFHG from '../../../fhg/components/Typography';
import TextAreaField from '../../../components/TextAreaField';
import Loading from '../../../fhg/components/Loading';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

const useStyles = makeStyles((theme) => ({
   search: {
      borderWidth: 1,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      height: '100%',
      borderRadius: '10px',
      paddingLeft: '20px',
      paddingRight: '20px',
   },
   input: {
      backgroundColor: 'white',
      height: '100%',
      width: '100%',
   },
   listUser: {
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      paddingLeft: '20px',
      paddingRight: '20px',
      marginLeft: '20px',
      marginRight: '20px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
      borderRadius: '10px',
      paddingTop: '12px',
      marginTop: '20px',
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
      paddingTop: '15px',
      paddingLeft: '20px',
      paddingRight: '20px',
      display: 'flex',
      alignItems: 'center',
   },
}));

/**
 *  Report user view
 * @param onShowRight handle show sidebar
 * @param setShowView handle show report view
 * @return {JSX.Element}
 * @constructor
 */
const ReportUserChat = ({onCloseRight, show}) => {
   const classes = useStyles();

   const {currentChatRoom} = useChatRoomHelper();

   const [listUsers, setListUsers] = useState([]);

   const [selected, setSelected] = useState([]);

   const [reason, setReason] = useState('');

   const [success, setSuccess] = useState(false);
   const [hasError, setHasError] = useState(false);

   useEffect(() => {
      setListUsers(currentChatRoom?.users);
   }, [currentChatRoom?.users]);

   const selectUser = useCallback(
      (id) => () => setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])),
      []
   );

   const intl = useIntl();

   return (
      <Slide direction='left' in={show} mountOnEnter unmountOnExit>
         <Grid
            item
            xs={3}
            style={{
               backgroundColor: 'background.main',
               display: 'flex',
               flexDirection: 'column',
               height: '100%',
            }}
         >
            <Box className={classes.header}>
               <TypographyFHG variant='fs24500' color='text.black'>
                  {formatMessage(intl, 'chat.report')}
               </TypographyFHG>
               <img
                  src='/images/close.png'
                  alt='close'
                  style={{
                     width: '14px',
                     height: '14px',
                     cursor: 'pointer',
                  }}
                  onClick={onCloseRight}
               />
            </Box>
            <Box className={classes.members}>
               <TypographyFHG variant='fs20700' color='text.black'>
                  {formatMessage(intl, 'chat.members')}
               </TypographyFHG>
            </Box>
            <Box className={classes.listUser}>
               <List>
                  {listUsers?.map((item) => (
                     <ChatUser
                        key={item.id}
                        size={36}
                        data={item}
                        isUser
                        onClick={selectUser(item.id)}
                        isReport
                        selected={selected.includes(item.id)}
                     />
                  ))}
               </List>
            </Box>
            <Box className={classes.members}>
               <TypographyFHG variant='fs14400' color='text.black'>
                  {formatMessage(intl, 'chat.reason.message')}
               </TypographyFHG>
            </Box>
            <Box className={classes.search}>
               <TextAreaField
                  className={classes.input}
                  placeholder=''
                  disableUnderline
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
               />
            </Box>
            <Box className={classes.save}>
               <Button
                  variant='contained'
                  style={{
                     width: '200px',
                  }}
               >
                  <TypographyFHG variant='fs16700'>{formatMessage(intl, 'chat.send')}</TypographyFHG>
               </Button>
            </Box>
            {<Loading isLoading={false} hasBackdrop />}
            <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
               <Alert
                  onClose={() => setSuccess(false)}
                  severity='success'
                  sx={{width: '100%', backgroundColor: 'primary.dark', color: 'text.white'}}
               >
                  {formatMessage(intl, 'chat.reportDone')}
               </Alert>
            </Snackbar>
            <Snackbar open={hasError} autoHideDuration={3000} onClose={() => setHasError(false)}>
               <Alert onClose={() => setHasError(false)} severity='error'>
                  {formatMessage(intl, 'chat.reportFailed')}
               </Alert>
            </Snackbar>
         </Grid>
      </Slide>
   );
};

export default ReportUserChat;
