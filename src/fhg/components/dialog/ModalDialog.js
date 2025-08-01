import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, {useEffect, useCallback} from 'react';
import CircularProgressWithLabel from '../CircularProgressWithLabel';
import Grid from '../Grid';
import ProgressButton from '../ProgressButton';
import Typography from '../Typography';

const useStyles = makeStyles(
   (theme) => ({
      contentStyle: {
         flex: '1 1 auto',
         overflow: 'auto',
         '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
      },
      contentStyleNoScroll: {
         '&:first-child': {
            paddingTop: theme.spacing(1.25),
         },
         flex: '1 1 auto',
         overflow: 'hidden',
         display: 'flex',
         paddingLeft: theme.spacing(1.25),
         paddingRight: theme.spacing(1.25),
         paddingBottom: 0,
      },
      spinnerMargin: {
         marginLeft: theme.spacing(0.5),
      },
      actionStyle: {
         margin: 0,
         padding: theme.spacing(1),
         flex: '0 0 auto',
         '& .Mui-disabled': {
            color: theme.palette.primary.stroke,
         },
      },
      fatButtonStyle: {
         margin: `0 0 0 ${theme.spacing(1)} !important`,
         width: 'unset',
         height: 'unset',
         '@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)': {
            width: 'auto',
            height: 'auto',
            padding: `${theme.spacing(1.5, 3)} !important`,
         },
      },
      titleStyle: {
         borderBottom: '1px solid #BFBAAE',
         flex: '0 0 auto',
         textTransform: 'capitalize',
         display: 'flex',
         flexDirection: 'row',
      },
      innerStyle: {
         paddingTop: theme.spacing(1),
         height: '100%',
      },
      noScroll: {
         flex: '0 0 auto',
      },
      formStyle: {
         overflow: 'hidden',
         display: 'flex',
         flexDirection: 'column',
      },
      container: {
         backgroundColor: theme.palette.background.default,
      },
   }),
   {name: 'ModalDialogStyles'},
);

/**
 * The New User dialog which creates a new user.
 * @param slotProps Properties for the different slots.
 * Note: only submitButton has been implemented.
 *
 */
export default function ModalDialog({
   open,
   titleKey,
   title,
   titleValues,
   titleVariant = 'h6',
   header,
   submitKey,
   messageKey,
   message,
   messageValues,
   messageVariant = 'subtitle1',
   cancelKey,
   submitColor,
   onClose,
   onSubmit,
   maxWidth,
   fullWidth,
   submitColorStyle,
   cancelColorStyle,
   disableBackdropClick,
   buttons,
   contentsScroll,
   fullScreen,
   isForm,
   isSaving,
   isEnabled,
   TransitionComponent,
   children,
   fullHeight,
   hideBackdrop,
   progressPercent,
   classes: classesProp,
   slotProps = {},
   ...dialogProps
}) {
   const classes = {...useStyles(), ...(classesProp || {})};
   const handleSubmit = useCallback(
      (event) => {
         event.preventDefault();

         onSubmit && onSubmit(event);
      },
      [onSubmit],
   );

   const handleKey = useCallback(
      (event) => {
         if (!event.defaultPrevented && open) {
            if (event.key === 'Escape' && onClose) {
               event.preventDefault();
               onClose(event);
            } else if (!isForm && event.key === 'Enter') {
               event.preventDefault();
               event.stopPropagation();
               handleSubmit(event);
            }
         }
      },
      [handleSubmit, isForm, onClose, open],
   );

   /**
    * Handles keydown events for Escape and Enter.
    */
   useEffect(() => {
      document.addEventListener('keydown', handleKey, false);

      // Cleanup the listener when this component is removed.
      return () => {
         document.removeEventListener('keydown', handleKey, false);
      };
   }, [isForm, onClose, open, handleSubmit, handleKey]);

   const handleClickSubmit = (event) => {
      if (!event.isDefaultPrevented()) {
         handleSubmit(event);
      }
   };
   if (open) {
      return (
         <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            onKeyDown={handleKey}
            fullWidth={fullWidth}
            fullScreen={fullScreen}
            hideBackdrop={hideBackdrop}
            TransitionComponent={TransitionComponent}
            {...dialogProps}
         >
            <form onSubmit={isForm ? handleClickSubmit : null} className={classes.container}>
               <Grid container direction={'column'} wrap={'nowrap'} fullHeight={fullHeight}>
                  {(title || titleKey) && (
                     <DialogTitle className={classes.titleStyle}>
                        <Typography
                           className={classes.titleTypography}
                           variant={titleVariant}
                           id={titleKey}
                           values={titleValues}
                           hasBold
                           color='text.primary'
                        >
                           {title}
                        </Typography>
                        {header}
                     </DialogTitle>
                  )}
                  <DialogContent className={contentsScroll ? classes.contentStyle : classes.contentStyleNoScroll}>
                     <Grid
                        container
                        className={contentsScroll ? classes.innerStyle : classes.noScroll}
                        direction={'column'}
                        wrap={'nowrap'}
                        fullHeight={fullHeight}
                     >
                        {messageKey && (
                           <Typography id={messageKey} variant={messageVariant} values={messageValues} hasBold>
                              {message}
                           </Typography>
                        )}
                        {children}
                     </Grid>
                  </DialogContent>
                  {(buttons || onClose || onSubmit) && (
                     <DialogActions className={classes.actionStyle} spacing={1}>
                        {buttons}
                        {onClose && (
                           <Button
                              className={`${classes.fatButtonStyle} button ${cancelColorStyle}`}
                              disabled={isSaving}
                              onClick={onClose}
                           >
                              <Typography color='inherit' id={cancelKey} />
                           </Button>
                        )}
                        {!!onSubmit && !progressPercent && (
                           <Button
                              className={`${classes.fatButtonStyle} button ${submitColorStyle}`}
                              type='submit'
                              variant={'contained'}
                              disabled={isSaving || !isEnabled}
                              onClick={!isForm ? handleClickSubmit : undefined}
                              {...slotProps.submitButton}
                              // color={submitColor}
                           >
                              <Typography color='inherit' id={submitKey} values={titleValues} />
                              {isSaving && (
                                 <CircularProgress className={classes.spinnerMargin} size={15} thickness={2.5} />
                              )}
                           </Button>
                        )}
                        {!!onSubmit && progressPercent && (
                           <ProgressButton
                              className={`${classes.fatButtonStyle} button ${submitColorStyle}`}
                              isProgress={isSaving}
                              variant='contained'
                              loadingIndicator={
                                 <CircularProgressWithLabel
                                    value={progressPercent}
                                    size={25}
                                    thickness={3}
                                    width={64}
                                 />
                              }
                              color='primary'
                              type={'submit'}
                              labelKey={submitKey}
                              disabled={isSaving}
                              {...slotProps?.submitButton}
                           />
                        )}
                     </DialogActions>
                  )}
               </Grid>
            </form>
         </Dialog>
      );
   } else {
      return null;
   }
}

ModalDialog.propTypes = {
   message: PropTypes.string, // Message to be displayed to the user. Use either message or messageKey but
   //    not both.
   messageKey: PropTypes.string, // Message key of the message to be displayed to the user.
   onSubmit: PropTypes.func, // Called when the user submits/confirms.
   onClose: PropTypes.func, // Called when the user closes/cancels.
   open: PropTypes.bool, // Indicates if the dialog should be open or not.
   title: PropTypes.string, // Title for the confirmation dialog.
   titleKey: PropTypes.string, // Localization key for the Title for the confirmation dialog.
   titleValues: PropTypes.object, // Values for the Title for the confirmation dialog.
   submitLabel: PropTypes.string, // Label for the submit button.
   submitKey: PropTypes.string, // Localization key for the submit button label.
   cancelLabel: PropTypes.string, // Label for the cancel button.
   cancelKey: PropTypes.string, // Localization key for the cancel button label.
   cancelColorStyle: PropTypes.string, // The class specifying the color of the cancel button. Needs color and
   //    background color for all states (e.g. primary-color-button).
   messageValues: PropTypes.object, // Localization messageValues for the message.
   isSaving: PropTypes.bool, // Indicates if the saving progress should be shown.
   isEnabled: PropTypes.bool, // Indicates if the submit button can be enabled. It won't be enabled if
   // isSaving is true.
   submitColorStyle: PropTypes.string, // The class specifying the color of the submit button. Needs color and
   //    background color for all states (e.g. primary-color-button).
   maxWidth: PropTypes.string, // The maximum width of the dialog.
   children: PropTypes.any, // Optional children components.
   isForm: PropTypes.bool, // Is the modal containing a form? If not, the enter key is handled.
   useCaptureKeydown: PropTypes.bool,
   contentsScroll: PropTypes.bool,
};

ModalDialog.defaultProps = {
   open: true,
   isSaving: false,
   isEnabled: true,
   submitLabel: 'OK',
   submitKey: 'ok.button',
   cancelLabel: 'Cancel',
   cancelKey: 'cancel.button',
   submitColorStyle: 'primary-color-button',
   cancelColorStyle: 'minimal-cancel-button',
   maxWidth: 'md',
   isForm: false,
   useCaptureKeydown: true,
   contentsScroll: true,
};
