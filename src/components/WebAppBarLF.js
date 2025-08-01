import {RemoveRounded} from '@mui/icons-material';
import {AddRounded} from '@mui/icons-material';
import Menu from '@mui/icons-material/Menu';
import {Stack, styled} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import {clamp} from 'lodash';
import {indexOf} from 'lodash';
import {useState} from 'react';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import {SCALE_APP} from '../Constants';
import {ZOOM_OPTIONS} from '../Constants';
import {LOGO} from '../Constants';
import {APPBAR_SMALL_HEIGHT} from '../Constants';
import {APPBAR_HEIGHT} from '../Constants';
import {DRAWER_WIDTH} from '../Constants';
import {ENTITY_CLIENT_QUERY} from '../data/QueriesGL';
import Grid from '../fhg/components/Grid';
import {HideOnScroll} from '../fhg/components/HideOnScroll';
import {drawerIsOpenStatus} from '../fhg/components/ResponsiveMobileDrawer';
import SearchField from '../fhg/components/SearchField';
import {authenticationDataStatus} from '../fhg/components/security/AuthenticatedUser';
import Typography from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import find from 'lodash/find';
import {useEffect} from 'react';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useDebounce from '../fhg/hooks/useDebounce';
import {userRoleState} from '../pages/Main';

// search
import IconButton from '@mui/material/IconButton';
import {Person} from '@mui/icons-material';
import useWidthRule from '../fhg/hooks/useWidthRule';
import {Auth} from 'aws-amplify';
import {userStatus} from '../fhg/components/security/AuthenticatedUser';

const AppBar = styled(MuiAppBar, {
   shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
   transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
   }),
   ...(open && {
      [theme.breakpoints.up('md')]: {
         width: `calc(100% - ${DRAWER_WIDTH}px)`,
         marginLeft: `${DRAWER_WIDTH}px`,
         transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
         }),
      },
   }),
}));

const useStyles = makeStyles(
   (theme) => ({
      appBarStyle: {
         zIndex: theme.zIndex.drawer - 1,
         display: 'flex',
         flexDirection: 'row',
         alignItems: 'center',
         marginBottom: 2,
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
      buttonStyle: {
         marginRight: theme.spacing(2),
         [theme.breakpoints.down('lg')]: {
            marginRight: theme.spacing(1),
            padding: theme.spacing(0.5),
         },
         [theme.breakpoints.down('md')]: {
            marginRight: theme.spacing(0),
            padding: theme.spacing(0.5),
         },
      },
      titleStyle: {
         color: theme.palette.text.primary,
      },
      hyphenStyle: {
         lineHeight: '44px',
         marginTop: 'auto',
         marginBottom: 'auto',
      },
      placeholderStyle: {
         color: '#707070 !important',
      },
      entityStyle: {
         textDecoration: 'underline',
         marginLeft: theme.spacing(1),
      },
      rootSearch: {
         padding: '2px 4px',
         display: 'flex',
         alignItems: 'center',
         width: '90%',
         height: '40px',
         margin: '1px auto',
      },
      searchDiv: {
         width: '100%',
      },
      input: {
         marginLeft: theme.spacing(1),
         flex: 1,
      },
      divider: {
         height: 28,
         margin: 4,
      },
      selectStyle: {
         '& .MuiOutlinedInput-notchedOutline': {
            border: 'unset',
         },
      },
      imageStyle: {
         display: 'block',
         height: 'calc(3vw + 18px)',
         maxHeight: 53,
         minHeight: 37,
         marginRight: 16,
      },
      formControl: {
         '& .MuiSelect-select': {
            boxShadow: '0px 4px 10px #FFF !important',
         },
      },
   }),
   {name: 'WebAppBarKLAStyles'},
);

/**
 * The AppBar with search and export to CSV capabilities.
 */
export default function WebAppBarLF() {
   const [{clientIdProp, entityId}] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const setAuthStateData = useSetRecoilState(authenticationDataStatus);
   const [zoomIndex, setZoomIndex] = useState(indexOf(ZOOM_OPTIONS, SCALE_APP));
   const [showZoom, setShowZoom] = useState();

   const reloadDebounced = useDebounce(() => {
      window.location.reload();
   }, 2000);

   const clientId = userClientId || clientIdProp;
   const classes = useStyles();

   const [isDrawerOpen, setIsDrawerOpen] = useRecoilState(drawerIsOpenStatus);
   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {variables: {clientId}, skip: !validate(clientId)});

   const [, setSelectedEntity] = useState(find(entitiesData?.entities, {id: entityId}));

   useEffect(() => {
      if (entityId && entitiesData?.entities?.length > 0) {
         setSelectedEntity(find(entitiesData.entities, {id: entityId}));
      } else {
         setSelectedEntity(undefined);
      }
   }, [entityId, entitiesData]);

   const handleMenuClick = () => {
      setIsDrawerOpen(!isDrawerOpen);
   };

   const handleLogoutChange = (event) => {
      if (event.target.value === 'logout') {
         Auth.signOut();
         setAuthStateData({});
      }
   };

   const handleCloseMenu = () => {
      setIsAccountMenuOpen(false);
   };

   const handleOpenMenu = (event) => {
      if (event.shiftKey) {
         setShowZoom(true);
      }
      setIsAccountMenuOpen(true);
   };

   const handleZoomIn = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setZoomIndex((zoomIndex) => clamp(zoomIndex + 1, 0, ZOOM_OPTIONS?.length - 1));
      sessionStorage.scaleApp = ZOOM_OPTIONS[Math.round(clamp(zoomIndex + 1, 0, ZOOM_OPTIONS?.length - 1))];
      reloadDebounced();
   };

   const handleZoomOut = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setZoomIndex((zoomIndex) => clamp(zoomIndex - 1, 0, ZOOM_OPTIONS?.length - 1));
      sessionStorage.scaleApp = ZOOM_OPTIONS[Math.round(clamp(zoomIndex - 1, 0, ZOOM_OPTIONS?.length - 1))];
      reloadDebounced();
   };

   const user = useRecoilValue(userStatus);
   const isSmallWidth = useWidthRule('down', 'xs');
   const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

   return (
      <HideOnScroll>
         <AppBar className={classes.appBarStyle} open={isDrawerOpen} elevation={12}>
            {!isDrawerOpen && (
               <>
                  <IconButton edge='start' size='small' color='primary' onClick={handleMenuClick}>
                     <Menu />
                  </IconButton>
                  <img alt='' className={classes.imageStyle} src={LOGO} />
               </>
            )}
            <SearchField />
            <Stack
               name='select menu frame'
               alignItems={'center'}
               direction={'row'}
               justifyContent={'flex-end'}
               wrap={'nowrap'}
               flex={1}
            >
               <FormControl>
                  <Select
                     open={isAccountMenuOpen}
                     className={classes.selectStyle}
                     onClose={handleCloseMenu}
                     onOpen={handleOpenMenu}
                     variant='standard'
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
                     {showZoom && (
                        <Stack flexDirection={'row'} sx={{mx: 2.5}}>
                           <Typography sx={{mr: 1}}>Zoom:</Typography>
                           <Typography sx={{mr: 0.5}}>{`${Math.round(
                              (+sessionStorage.scaleApp || 0.75) * 100,
                           )}%`}</Typography>
                           <AddRounded sx={{mr: 0.5}} onClick={handleZoomIn} />
                           <RemoveRounded sx={{mr: 1}} onClick={handleZoomOut} />
                        </Stack>
                     )}
                     <MenuItem value='logout'>
                        <Typography id='path.logout' />
                     </MenuItem>
                  </Select>
               </FormControl>
            </Stack>
         </AppBar>
      </HideOnScroll>
   );
}
