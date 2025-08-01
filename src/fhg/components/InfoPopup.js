import {IconButton} from '@mui/material';
import {Popover} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {HelpOutline} from '@mui/icons-material';
import {useState} from 'react';
import React, {Fragment} from 'react';
import TypographyFHG from './Typography';

const useStyles = makeStyles(
   (theme) => ({
      popover: {
         pointerEvents: 'none',
      },
      paper: {
         padding: theme.spacing(1),
         backgroundColor: theme.palette.background.paper4,
      },
   }),
   {name: 'InfoPopupStyles'},
);

/**
 * Component to show help on hover.
 *
 * @param labelKey The key of the help text.
 *
 * @return {JSX.Element|null}
 * @constructor
 */
export default function InfoPopup({labelKey, icon, values = ''}) {
   const classes = useStyles();
   const [anchorEl, setAnchorEl] = useState(null);

   const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handlePopoverClose = () => {
      setAnchorEl(null);
   };

   const open = Boolean(anchorEl);

   if (labelKey) {
      return (
         <Fragment>
            <IconButton size={'small'} onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
               {icon ? (
                  icon
               ) : (
                  <HelpOutline
                     style={{
                        color: '#769548',
                     }}
                  />
               )}
            </IconButton>
            <Popover
               id='mouse-over-popover'
               className={classes.popover}
               classes={{
                  paper: classes.paper,
               }}
               open={open}
               anchorEl={anchorEl}
               anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
               }}
               transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
               }}
               onClose={handlePopoverClose}
               disableRestoreFocus
            >
               <TypographyFHG id={labelKey} hasLineBreaks values={values} />
            </Popover>
         </Fragment>
      );
   } else {
      console.log('InfoPopup must have a labelKey');
      return null;
   }
}
