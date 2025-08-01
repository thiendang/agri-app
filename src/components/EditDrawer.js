import {Drawer} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {EDIT_DRAWER_WIDTH} from '../Constants';
import {APPBAR_SMALL_HEIGHT} from '../Constants';
import {APPBAR_HEIGHT} from '../Constants';
import makeStyles from '@mui/styles/makeStyles';
import {useEffect} from 'react';
import {useNavigationType} from 'react-router-dom';

const useStyles = makeStyles(
   (theme) => ({
      inputStyle: {
         backgroundColor: theme.palette.background.default,
      },
      frameStyle: {
         padding: theme.spacing(4, 2),
      },
      expand: {
         transform: 'rotate(0deg)',
         marginLeft: 'auto',
         transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
         }),
      },
      expandOpen: {
         transform: 'rotate(180deg)',
      },
      titleStyle: {
         paddingTop: theme.spacing(2),
      },
      drawerPaper: (props) => ({
         backgroundColor: props?.backgroundColor || theme.palette.background.paper,
         maxWidth: '100%',
         marginTop: APPBAR_HEIGHT,
         height: `calc(100% - ${APPBAR_HEIGHT}px)`,
         overflow: 'visible',
         [theme.breakpoints.down('md')]: {
            marginTop: APPBAR_SMALL_HEIGHT,
            height: `calc(100% - ${APPBAR_SMALL_HEIGHT}px)`,
         },
      }),
      backdropStyle: {
         marginTop: 0,
         [theme.breakpoints.down('md')]: {
            marginTop: 0,
         },
      },
      closeButtonStyle: {
         '@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)': {
            position: 'absolute',
            top: 0,
            right: 0,
         },
         '@supports not (-ms-high-contrast: none)': {
            position: 'sticky',
         },
         right: 0,
         top: 0,
         marginLeft: 'auto',
         marginBottom: theme.spacing(-6),
         zIndex: 1001,
      },
   }),
   {name: 'EditDrawerStyles'},
);

export default function EditDrawer({open = true, onClose, width, children, ...styleProps}) {
   const classes = useStyles(styleProps);
   const navigate = useNavigate();
   const navigationType = useNavigationType();
   const location = useLocation();

   useEffect(() => {
      //POP only occurs when this URL is reached through browser action. App actions will be 'Replace' or 'Push'.
      if (navigationType === 'POP') {
         navigate(location, {replace: true, state: {}});
      }
   }, [navigate, location, navigationType]);

   return (
      <Drawer
         anchor={'right'}
         open={open}
         className={classes.drawerStyle}
         sx={{
            width,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {width: width || EDIT_DRAWER_WIDTH, boxSizing: 'border-box'},
         }}
         ModalProps={{disableEscapeKeyDown: true, BackdropProps: {className: classes.backdropStyle}}}
      >
         {/*<Toolbar />*/}
         <Box sx={{overflow: 'auto'}}>
            {open && onClose && (
               <IconButton
                  key='close'
                  className={classes.closeButtonStyle}
                  aria-label='Close'
                  color='inherit'
                  onClick={onClose}
                  size='large'
               >
                  <CloseIcon />
               </IconButton>
            )}
            {children}
         </Box>
      </Drawer>
   );
}
