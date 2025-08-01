import {Box, Grid, IconButton, List, Slide} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React, {useEffect, useMemo} from 'react';
import ChatUser from './ChatUser';
import AddChatButton from './AddChatButton';
import {useRecoilValue} from 'recoil';
import {listChatRoomsStore} from './stores';
import {VIEW} from './Chat';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import MenuIcon from '@mui/icons-material/Menu';
import RemoveIcon from '@mui/icons-material/Close';
import TypographyFHG from '../../../fhg/components/Typography';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useChatRoomHelper} from '../../../fhg/hooks/useChatRoomHelper';

const useStyles = makeStyles((theme) => ({
   search: {
      borderWidth: 1,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      [theme.breakpoints.down('md')]: {
         paddingTop: '0px',
      },
   },
   input: {
      backgroundColor: 'white',
      // height: '47px',
      width: '90%',
      borderRadius: '10px',
   },
   listUser: {
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      paddingLeft: '12px',
      paddingRight: '12px',
   },
   addChat: {
      marginTop: '12px',
      paddingBottom: '24px',
      paddingLeft: '12px',
      paddingRight: '12px',
      [theme.breakpoints.down('md')]: {
         paddingLeft: '12px',
         paddingRight: '12px',
      },
   },
   container: {
      backgroundColor: theme.palette.background.main,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRadius: theme.spacing(4, 0, 0, 4),
      [theme.breakpoints.down('md')]: {
         borderRadius: theme.spacing(4),
      },
   },
}));
/**
 *  Show chat rooms
 * @param isXs check xs size
 * @param show flag show sidebar
 * @param showAdd flag show add chat room view
 * @param isShowListRoom flag show list chat room
 * @param onShowRight handle show sidebar
 * @param setShowView handle show new/edit view
 * @param hideListChat handle hide list chat room
 * @param showListChat handle show list chat room
 * @return {JSX.Element}
 * @constructor
 */
const ListChatRooms = ({onShowRight, isXs, setShowView, show, hideListChat, isShowListRoom, showListChat}) => {
   const classes = useStyles();

   const [{search}] = useCustomSearchParams();

   const {getChatRooms, setCurrentChatId, currentChatRoom} = useChatRoomHelper();

   useEffect(() => {
      let params = {
         chatRoomSearch: {
            name: [search],
         },
      };
      if (!search) {
         params = {
            chatRoomSearch: {},
         };
      }
      getChatRooms(params);
   }, [getChatRooms, search]);

   const listChatRoom = useRecoilValue(listChatRoomsStore);

   const listChatRoomPinned = useMemo(() => listChatRoom?.filter((item) => !!item.pinnedByUser), [listChatRoom]);

   const listChatRoomAll = useMemo(() => listChatRoom?.filter((item) => !item.pinnedByUser), [listChatRoom]);

   const intl = useIntl();

   if (!isShowListRoom && !isXs) {
      return (
         <Grid item xs={0.5}>
            <Box paddingTop='12px'>
               <IconButton onClick={showListChat}>
                  <MenuIcon />
               </IconButton>
            </Box>
         </Grid>
      );
   }

   return (
      <Slide direction='right' in={show} mountOnEnter unmountOnExit>
         <Grid item xs={isXs ? 12 : 3} className={classes.container}>
            {!isXs && (
               <Box paddingTop='12px' paddingLeft='12px'>
                  <IconButton onClick={hideListChat}>
                     <RemoveIcon />
                  </IconButton>
               </Box>
            )}
            {/* <Box className={classes.search}>
               <TextFieldFHG
                  className={classes.input}
                  placeholder='Search'
                  disableUnderline
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position='start'>
                           <SearchIcon />
                        </InputAdornment>
                     ),
                  }}
                  onChange={(e) => setKeyword(e.target.value)}
               />
            </Box> */}
            <Box className={classes.addChat}>
               <AddChatButton
                  onClick={() => {
                     setShowView && setShowView(VIEW.new);
                     onShowRight();
                  }}
               />
            </Box>
            <Box className={classes.listUser}>
               {listChatRoomPinned?.length > 0 && (
                  <>
                     <TypographyFHG color='text.black' variant='fs16700'>
                        {formatMessage(intl, 'chat.pinChat')}
                     </TypographyFHG>
                     <List>
                        {listChatRoomPinned?.map((item) => (
                           <ChatUser
                              key={item.id}
                              data={item}
                              selected={currentChatRoom?.id === item.id && !isXs}
                              onClick={() => {
                                 setCurrentChatId(item.id);
                                 setShowView && setShowView(VIEW.chat);
                              }}
                           />
                        ))}
                     </List>
                  </>
               )}
               <TypographyFHG color='text.black' variant='fs16700'>
                  {formatMessage(intl, 'chat.allChat')}
               </TypographyFHG>
               <List>
                  {listChatRoomAll?.map((item) => (
                     <ChatUser
                        key={item.id}
                        data={item}
                        selected={currentChatRoom?.id === item.id && !isXs}
                        onClick={() => {
                           setCurrentChatId(item.id);
                           setShowView && setShowView(VIEW.chat);
                        }}
                     />
                  ))}
               </List>
            </Box>
         </Grid>
      </Slide>
   );
};

export default ListChatRooms;
