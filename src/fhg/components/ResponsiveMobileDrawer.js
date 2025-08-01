import makeStyles from '@mui/styles/makeStyles';
import {Drawer, SwipeableDrawer} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {atom, useRecoilState} from 'recoil';
import {DRAWER_WIDTH, APPBAR_HEIGHT} from '../../Constants';
import useWidthRule from '../hooks/useWidthRule';

export const drawerIsOpenStatus = atom({
   key: 'isDrawerOpen',
   default: true,
});

const useStyles = makeStyles((theme) => ({
   drawer: {
      flex: '1 1',
      height: '100%',
      '@media print': {
         display: 'none',
      },
      [theme.breakpoints.up('md')]: {
         // height: DRAWER_WIDTH,
         flexShrink: 0,
      },
   },
   drawerPaper: {
      maxWidth: '100%',
      height: '100%',
      margin: 0,
      marginTop: APPBAR_HEIGHT,
      [theme.breakpoints.down('md')]: {
         marginTop: 0,
      },
      backgroundImage: 'none',
      // marginLeft: 'auto',
   },
   noBorder: {
      borderRight: 'none',
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
}));

/**
 * Responsive Drawer Component which changes between a permanent drawer above the breakpoint and is temporary at or
 * below the breakpoint. The close button floats above the children and stays at in the top right of the component. The
 * children should allow space in the upper right corner for the close button.
 */
export default function ResponsiveMobileDrawer({children, width, backgroundColor, ModalProps, ...drawerProps}) {
   const classes = useStyles({width});
   const [isDrawerOpen, setIsDrawerOpen] = useRecoilState(drawerIsOpenStatus);
   const isSmallWidth = useWidthRule('down', 'md');
   const drawerWidth = isDrawerOpen ? width || DRAWER_WIDTH : 0;

   return (
      <>
         {isSmallWidth ? (
            <SwipeableDrawer
               variant='temporary'
               anchor='left'
               open={isDrawerOpen}
               onClose={() => setIsDrawerOpen(false)}
               onOpen={() => setIsDrawerOpen(true)}
               PaperProps={{style: {width: drawerWidth, backgroundColor}}}
               classes={{
                  paper: classes.drawerPaper,
                  paperAnchorDockedLeft: classes.noBorder,
               }}
               ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                  ...ModalProps,
               }}
               {...drawerProps}
            >
               {children}
            </SwipeableDrawer>
         ) : (
            <Drawer
               anchor='left'
               sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                     width: drawerWidth,
                     boxSizing: 'border-box',
                     backgroundColor: 'background.default',
                  },
               }}
               variant='persistent'
               open={isDrawerOpen}
               {...drawerProps}
            >
               {children}
            </Drawer>
         )}
      </>
   );
}

ResponsiveMobileDrawer.propTypes = {
   children: PropTypes.any.isRequired, // Children in the drawer.
   width: PropTypes.number, // Width of the draw to override the constant DRAWER_WIDTH.
   backgroundColor: PropTypes.string, // Background color of the drawer.
};
