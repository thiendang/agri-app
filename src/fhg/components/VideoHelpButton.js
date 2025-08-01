import {Box, Popover} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import {useEffect} from 'react';
import {useState} from 'react';
import React, {Fragment} from 'react';
import Grid from './Grid';
import TypographyFHG from './Typography';

const useStyles = makeStyles(
   (theme) => ({
      paper: {
         padding: theme.spacing(1, 3, 1, 1),
         backgroundColor: '#f1f1f1',
         maxWidth: 300,
      },
      paragraphStyle: {
         '& p:first-of-type': {
            display: 'block',
            marginBlockStart: '0',
            marginBlockEnd: '1em',
            marginInlineStart: '0',
            marginInlineEnd: '0px',
         },
      },
      frameStyle: {
         margin: 'auto !important',
      },
      playIcon: {
         marginLeft: '13px',
         height: '15px',
         width: '18px',
      },
      subTitle: {
         marginLeft: '8px',
         fontWeight: '700',
         fontSize: '18px',
      },
   }),
   {name: 'InfoPopupStyles'}
);

/**
 * Component to show help on hover.
 *
 * @param labelKey The key of the help text.
 * @param videoId The wistia media hashed ID.
 * @return {JSX.Element|null}
 * @constructor
 */
export default function VideoHelpButton({labelKey = 'help.training.label', videoId}) {
   const classes = useStyles();
   const [anchorEl, setAnchorEl] = useState(null);
   const [delayOpenTarget, setDelayOpenTarget] = useState(false);
   const [timoutOutState, setTimoutOutState] = useState();

   useEffect(() => {
      if (!document.getElementById('wistia_script')) {
         const wistiaScript = document.createElement('script');
         wistiaScript.id = 'wistia_script';
         wistiaScript.type = 'text/javascript';
         wistiaScript.src = 'https://fast.wistia.com/assets/external/E-v1.js';
         wistiaScript.async = true;
         document.body.appendChild(wistiaScript);
      }
      if (!document.getElementById('wistia_medias_script')) {
         //     <script src="https://fast.wistia.com/embed/medias/kvooi0oe1v.jsonp" async></script>
         const wistiaMediasScript = document.createElement('script');
         wistiaMediasScript.id = 'wistia_medias_script';
         wistiaMediasScript.src = `https://fast.wistia.com/embed/medias/${videoId}.jsonp`;
         wistiaMediasScript.async = true;
         document.body.appendChild(wistiaMediasScript);
      }
   }, [videoId]);

   useEffect(() => {
      if (delayOpenTarget) {
         setTimoutOutState(
            setTimeout(() => {
               if (delayOpenTarget) {
                  setAnchorEl(delayOpenTarget);
               }
            }, 600)
         );
      } else if (timoutOutState) {
         clearTimeout(timoutOutState);
         setTimoutOutState(undefined);
      }
   }, [delayOpenTarget]);

   const handlePopoverOpenImmediate = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handlePopoverClose = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setAnchorEl(null);
      setDelayOpenTarget(undefined);
      if (timoutOutState) {
         clearTimeout(timoutOutState);
         setTimoutOutState(undefined);
      }
   };

   const open = Boolean(anchorEl);

   if (videoId) {
      return (
         <Fragment>
            <Box display='flex' alignItems='center'>
               <img src='/images/play.png' className={classes.playIcon} alt='question' />
               <TypographyFHG
                  className={classes.subTitle}
                  id='help.training.label'
                  color='primary'
                  onClick={handlePopoverOpenImmediate}
               />
            </Box>

            <Popover
               id={'InfoPopover' + videoId}
               classes={{
                  paper: classes.paper,
               }}
               open={open}
               anchorEl={anchorEl}
               anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
               }}
               transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
               }}
               onClose={handlePopoverClose}
               disableRestoreFocus
            >
               <Grid container direction={'column'}>
                  {labelKey && (
                     <Grid item>
                        <TypographyFHG id={labelKey} className={classes.paragraphStyle} hasLineBreaks />
                     </Grid>
                  )}
                  <Grid item className={classes.frameStyle}>
                     <div
                        className={`wistia_embed wistia_async_${videoId} popover=true popoverAnimateThumbnail=true`}
                        onClick={handlePopoverClose}
                        style={{
                           margin: 'auto',
                           display: 'inline-block',
                           height: '84px',
                           position: 'relative',
                           width: '150px',
                        }}
                     >
                        &nbsp;
                     </div>
                  </Grid>
               </Grid>
               <CloseIcon
                  style={{right: 0, top: 0, position: 'absolute', float: 'right'}}
                  onClick={handlePopoverClose}
               />
            </Popover>
         </Fragment>
      );
   } else {
      return null;
   }
}
