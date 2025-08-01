import Menu from '@mui/icons-material/Menu';
import {Stack} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import {MenuItem} from '@mui/material';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import Toolbar from '@mui/material/Toolbar';
import Person from '@mui/icons-material/Person';
import {Auth} from 'aws-amplify';
import React, {useState, Fragment} from 'react';
import {useNavigate} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useRecoilState, atom, useRecoilValue} from 'recoil';
import {SCALE_APP} from '../../Constants';
import {LOGO, APPBAR_HEIGHT, APPBAR_SMALL_HEIGHT, DEFAULT_PATH} from '../../Constants';
import Grid from './Grid';
import {drawerIsOpenStatus} from './ResponsiveMobileDrawer';
import {authenticationDataStatus} from './security/AuthenticatedUser';
import {userStatus} from './security/AuthenticatedUser';
import Typography from './Typography';
import useWidthRule from '../hooks/useWidthRule';

export const titleStatus = atom({
   key: 'titleStatus',
   default: {
      titleKey: undefined,
      titleValues: undefined,
      titleUrl: undefined,
      subtitleKey: undefined,
      subtitleValues: undefined,
      showTitles: false,
      videoId: undefined,
      helpKey: undefined,
      showSelect: true,
   },
});

const useStyles = makeStyles((theme) => ({
   appBar: {
      zIndex: theme.zIndex.drawer + 1,
      flex: '0 0 auto',
      height: APPBAR_HEIGHT,
      [theme.breakpoints.down('md')]: {
         height: APPBAR_SMALL_HEIGHT,
         paddingLeft: theme.spacing(0),
         paddingRight: theme.spacing(0),
      },
      position: 'relative',
      [theme.breakpoints.up('sm')]: {
         paddingLeft: theme.spacing(1),
         paddingRight: theme.spacing(1),
      },
   },
   toolBarStyle: {
      [theme.breakpoints.up('md')]: {
         height: APPBAR_HEIGHT,
         minHeight: APPBAR_HEIGHT,
      },
      [theme.breakpoints.down('md')]: {
         height: APPBAR_SMALL_HEIGHT,
         minHeight: APPBAR_SMALL_HEIGHT,
      },
      [theme.breakpoints.down('md')]: {
         paddingLeft: 2,
         paddingRight: 2,
      },
   },
   imageStyle: {
      display: 'block',
      height: 'calc(4vw + 18px)',
      maxHeight: 58 * SCALE_APP,
      minHeight: 38 * SCALE_APP,
   },
   iconStyle: {
      [theme.breakpoints.down('md')]: {
         fontSize: `${2 * SCALE_APP}rem`,
      },
   },
   titleStyle: {
      // width: '100%',
      color: theme.palette.text.primary,
   },
   subtitleStyle: {
      width: '100%',
      color: theme.palette.text.primary,
      textTransform: 'uppercase',
      marginTop: theme.spacing(3),
   },
   selectStyle: {
      '& .MuiOutlinedInput-notchedOutline': {
         border: 'unset',
      },
   },
}));

/**
 * The AppBar with search and export to CSV capabilities.
 */
export default function WebAppBar({children}) {
   const classes = useStyles();
   const navigate = useNavigate();
   const isSmallWidth = useWidthRule('down', 'xs');
   const user = useRecoilValue(userStatus);
   const [isDrawerOpen, setIsDrawerOpen] = useRecoilState(drawerIsOpenStatus);
   const setAuthStateData = useSetRecoilState(authenticationDataStatus);

   const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
   const [{titleKey, titleValues, titleUrl, subtitleKey, subtitleValues, showTitles}] = useRecoilState(titleStatus);

   const handleClose = () => {
      setIsAccountMenuOpen(false);
   };

   const handleMenu = () => {
      setIsAccountMenuOpen(true);
   };

   const handleLogoutChange = (event) => {
      if (event.target.value === 'logout') {
         Auth.signOut();
         setAuthStateData({});
      }
   };

   const handleClick = (event) => {
      event.stopPropagation();
      event.preventDefault();

      navigate(DEFAULT_PATH);
   };

   const handleMenuClick = () => {
      setIsDrawerOpen(!isDrawerOpen);
   };

   const LinkComponent = titleUrl ? Link : Fragment;
   const toProp = titleUrl ? {to: titleUrl} : {};

   return (
      <AppBar position='relative' color={'inherit'} className={classes.appBar}>
         <Toolbar className={classes.toolBarStyle}>
            <Grid container justifyContent={'space-between'} alignItems={'center'} direction={'row'} wrap={'nowrap'}>
               <Grid
                  item
                  container
                  fullWidth={false}
                  alignItems={'center'}
                  direction={'row'}
                  wrap={'nowrap'}
                  resizable={false}
               >
                  <Grid item>
                     {!isDrawerOpen && (
                        <IconButton edge='start' size='small' color='primary' onClick={handleMenuClick}>
                           <Menu />
                        </IconButton>
                     )}
                  </Grid>
                  <Grid item fullHeight resizable={false}>
                     <img alt='' className={classes.imageStyle} src={LOGO} onClick={handleClick} />
                  </Grid>
                  <Box sx={{display: {xs: 'none', sm: 'block'}}}>
                     <Grid item resizable={false}>
                        {process.env.REACT_APP_VERSION}
                     </Grid>
                  </Box>
               </Grid>
               {showTitles && titleKey && (
                  <Grid name={'TitleCard-title'} item className={classes.titleGridStyle} resizable fullWidth={false}>
                     <LinkComponent {...toProp}>
                        <Typography
                           id={titleKey}
                           values={titleValues}
                           className={classes.titleStyle}
                           variant={'h5'}
                           align={'center'}
                        />
                     </LinkComponent>
                     {subtitleKey && (
                        <Typography
                           id={subtitleKey}
                           values={subtitleValues}
                           className={classes.subtitleStyle}
                           variant={'subtitle1'}
                           noWrap
                           align={'center'}
                        />
                     )}
                  </Grid>
               )}
               {children}
               <Stack
                  name='select menu frame'
                  alignItems={'center'}
                  direction={'column'}
                  wrap={'nowrap'}
                  flex={'0 0 auto'}
               >
                  <FormControl className={classes.formControl}>
                     <Select
                        open={isAccountMenuOpen}
                        className={classes.selectStyle}
                        onClose={handleClose}
                        onOpen={handleMenu}
                        renderValue={() => (
                           <Grid container wrap={'nowrap'} direction={'row'} alignItems={'center'}>
                              <Person fontSize={isSmallWidth ? 'default' : 'large'} color={'primary'} />
                              <Box sx={{display: {xs: 'none', lg: 'block'}}}>
                                 <Typography variant={'body2'} color={'primary'}>
                                    {user?.contactName || user?.username}
                                 </Typography>
                              </Box>
                           </Grid>
                        )}
                        disableUnderline={true}
                        displayEmpty={true}
                        value={''}
                        onChange={handleLogoutChange}
                     >
                        <MenuItem value='logout'>
                           <Typography id='path.logout' />
                        </MenuItem>
                     </Select>
                  </FormControl>
               </Stack>
            </Grid>
         </Toolbar>
      </AppBar>
   );
}
