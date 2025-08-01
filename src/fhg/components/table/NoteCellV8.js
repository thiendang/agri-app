import {darken} from '@mui/material';
import {Paper} from '@mui/material';
import Popper from '@mui/material/Popper';
import {delay} from 'lodash';
import {useEffect} from 'react';
import React, {useMemo, useRef, useState, useCallback} from 'react';
import {EDIT_ICON} from '../../../Constants';
import {DELETE_ICON} from '../../../Constants';
// import useEffect from '../../hooks/useEffectDebugCount';
import {getScrollParent} from '../../utils/Utils';
import ButtonFHG from '../ButtonFHG';
import ConfirmButton from '../ConfirmButton';
import useEditData from '../edit/useEditData';
import {ClickAwayListener, Popover, Tooltip} from '@mui/material';
import {Notes} from '@mui/icons-material';
import Grid from '../Grid';
import Form from '../edit/Form';
import TextFieldLF from '../../../components/TextFieldLF';
import ButtonLF from '../../../components/ButtonLF';
import * as PropTypes from 'prop-types';
import {InputCell} from './InputCell';
import makeStyles from '@mui/styles/makeStyles';
import {SCALE_APP} from '../../../Constants';
import withStyles from '@mui/styles/withStyles';
import Box from '@mui/material/Box';

const NOTE_ENTER = 900;
const NOTE_EXIT = 400;

const LightTooltip = withStyles((theme) => ({
   tooltip: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1],
      fontSize: 14,
   },
}))(Tooltip);

const useStyles = makeStyles(
   (theme) => ({
      editPaper: {
         padding: theme.spacing(1),
         backgroundColor: theme.palette.background.default,
         zIndex: `${theme.zIndex.drawer} !important`,
         width: 260 * SCALE_APP + 12,
      },
      noteIconStyle: {
         position: 'absolute',
         right: theme.spacing(-0.5),
         top: theme.spacing(-0.5),
         backgroundColor: theme.palette.mode === 'dark' ? darken('#C6D2B8', 0.5) : '#C6D2B8',
         fontSize: 16 * SCALE_APP,
         zIndex: 1,
      },
      root: {
         zIndex: `${theme.zIndex.drawer + 2} !important`,
      },
      popperStyle: {
         '&.MuiPopper-root': {
            zIndex: theme.zIndex.modal - 1,
         },
      },
      formStyle: {
         maxHeight: '100%',
         overflow: 'visible',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
   }),
   {name: 'NotesStyles'},
);

/**
 * Component to show a table cell that has a cash flow note.
 * @param data The cell data.
 * @return {Element} The Note Cell.
 * @constructor
 */
export default function NoteCellV8(data) {
   const {onChange, row, cell, tableName, isEditNote, setIsEditNote, isSelected, getValue: getDataValue} = data;
   const classes = useStyles();

   const notes = useMemo(
      () =>
         cell.column.columnDef?.meta?.field === 'actual'
            ? cell.row.original[cell.column?.parent?.id]?.noteActual
            : cell.row.original[cell.column?.parent?.id]?.noteExpected,
      [cell.column.columnDef?.meta?.field, cell.column?.parent?.id, cell.row.original],
   );
   const hasNote = notes?.length > 0;

   const [noteClicked, setNoteClicked] = useState(false);
   const [showToolbar, setShowToolbar] = useState(false);
   const showToolbarRef = useRef(false);
   const inToolbarRef = useRef(false);

   const scrollInitialized = useRef();
   const anchorRef = useRef();
   const popperRef = useRef();
   const timerRef = useRef();
   const openConfirmRef = useRef(false);
   const canExpand = row.getCanExpand();

   const [, /*editValues*/ handleChange, {getValue, setDefaultValues}] = useEditData(notes);

   const showPopper = useMemo(
      () => showToolbar && !isEditNote && anchorRef.current && (hasNote || !!getDataValue()),
      [getDataValue, isEditNote, showToolbar, hasNote],
   );

   const setShowPopper = useCallback((delayTime = NOTE_ENTER) => {
      showToolbarRef.current = true;
      if (delayTime > 0) {
         delay(() => {
            if (showToolbarRef.current) {
               setShowToolbar(true);
            }
         }, delayTime);
      } else {
         setShowToolbar(true);
      }
   }, []);

   const hidePopper = useCallback((delayTime = NOTE_EXIT) => {
      showToolbarRef.current = false;
      if (delayTime > 0) {
         delay(() => {
            if (!showToolbarRef.current && !inToolbarRef.current) {
               setShowToolbar(false);
            }
         }, delayTime);
      } else {
         setShowToolbar(false);
      }
   }, []);

   /**
    * Hide the toolbar if the cell has become selected, but the row can be expanded.
    */
   useEffect(() => {
      if (isSelected) {
         if (showToolbar && canExpand) {
            hidePopper();
         }
      }
   }, [isSelected, hidePopper, canExpand, showToolbar]);

   /**
    * Add the scroll and mouse move listeners, so that the toolbar is shown when hovering over cell.
    */
   useEffect(() => {
      function handleScroll() {
         hidePopper(0);
      }

      if (anchorRef && showPopper) {
         if (!scrollInitialized.current) {
            scrollInitialized.current = getScrollParent(anchorRef.current);
            scrollInitialized.current.addEventListener('scroll', handleScroll);
         }
      } else if (scrollInitialized.current) {
         scrollInitialized.current.removeEventListener('scroll', handleScroll);
         scrollInitialized.current = null;
      }
      return () => {
         if (scrollInitialized.current) {
            scrollInitialized.current.removeEventListener('scroll', handleScroll);
            scrollInitialized.current = null;
         }
      };
   }, [anchorRef, showPopper, hidePopper]);

   /**
    * When the new note button is clicked, turn on note editing.
    * @return {Promise<void>}
    */
   const handleAddNote = useCallback(async () => {
      setIsEditNote({cellId: cell?.id, tableName});
      inToolbarRef.current = false;
      hidePopper();
   }, [setIsEditNote, hidePopper, cell?.id, tableName]);

   /**
    * Update the default values when the notes change.
    */
   useEffect(() => {
      setDefaultValues({notes});
   }, [notes, setDefaultValues]);

   /**
    * Callback to close the edit note and the popover.
    *
    * @param event The click or mouse event
    */
   function handleClose(event) {
      event?.stopPropagation();
      event?.preventDefault();
      setIsEditNote(false);
      handlePopoverClose(event, undefined, false);
   }

   /**
    * Callback to close the popover.
    *
    * @param event The event used to close the popover.
    * @param reason The reason the popover is closing.
    * @param isEditNoteParam  Indicates if the note is being edited.
    */
   function handlePopoverClose(event, reason, isEditNoteParam = isEditNote) {
      if (!isEditNoteParam) {
         setNoteClicked(false);
         setIsEditNote(false);
      }
   }

   /**
    * Callback when a note is clicked.
    * @return {(function(): void)|*}
    */
   function handleNotesClick() {
      setNoteClicked(true);
   }

   /**
    * Callback to close the popup when the note is clicked.
    */
   function handleClickAway() {
      if (noteClicked && !isEditNote) {
         setNoteClicked(false);
      }
   }

   /**
    * Callback to save the note.
    * @param event The event causing the note to be saved.
    */
   function handleSave(event) {
      event?.stopPropagation();
      event?.preventDefault();
      handleClose();
      onChange?.(getValue('notes'), cell, tableName, row?.original);
   }

   /**
    * Callback when the key is down.
    * @param event The keydown event.
    */
   function handleKeydown(event) {
      if (event?.key === 'Escape') {
         handleClose(event);
      }
   }

   /**
    * Callback when the outer box has a keydown.
    * Close the toolbar whenever a key is pressed.
    */
   function handleBoxKeydown() {
      hidePopper();
   }

   /**
    * Callback when the user deletes a note.
    * @param event The event causing the delete.
    */
   function handleDelete(event) {
      event?.stopPropagation();
      event?.preventDefault();

      inToolbarRef.current = false;
      hidePopper();
      openConfirmRef.current = false;
      handleClose();
      onChange?.(null, cell, tableName, row?.original);
   }

   /**
    * Callback to stop showing the toolbar.
    */
   function handleEndShowToolbar() {
      hidePopper();
   }

   const startTimer = useCallback(() => {
      timerRef.current = delay(() => {
         if (!inToolbarRef.current) {
            hidePopper();
         } else {
            startTimer();
         }
      }, 4000);
   }, [hidePopper]);

   /**
    * Callback to start showing the toolbar.
    */
   const handleStartShowToolbar = useCallback(
      (event, delayTime = NOTE_ENTER) => {
         if (!isSelected) {
            if (!showToolbar || !timerRef.current) {
               if (!row.getCanExpand()) {
                  setShowPopper(delayTime);
               }
               if (!timerRef.current) {
                  startTimer();
               }
            }
         } else if (!showToolbar && !row.getCanExpand()) {
            setShowPopper(delayTime);
         }
      },
      [showToolbar, row, isSelected, setShowPopper, startTimer],
   );

   return (
      <Box
         // key={'note ' + cell?.id}
         ref={anchorRef}
         style={{width: '100%', position: 'relative', height: '100%'}}
         onKeyDown={handleBoxKeydown}
         onMouseEnter={handleStartShowToolbar}
         onMouseLeave={handleEndShowToolbar}
      >
         <Box style={{width: '100%', position: 'relative', height: 1, marginTop: 2}}>
            {notes && (
               <ClickAwayListener onClickAway={handleClickAway} disableReactTree={true}>
                  <LightTooltip title={!isEditNote && getValue('notes')}>
                     <Notes onClick={handleNotesClick} className={classes.noteIconStyle} />
                  </LightTooltip>
               </ClickAwayListener>
            )}
            {isEditNote && isEditNote?.cellId === cell?.id && isEditNote?.tableName === tableName && (
               <Popover
                  classes={{paper: classes.editPaper, root: classes.root}}
                  open
                  anchorEl={anchorRef.current}
                  anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                  transformOrigin={{vertical: 'top', horizontal: 'left'}}
                  onClose={handlePopoverClose}
                  disableRestoreFocus
                  hideBackdrop
               >
                  {isEditNote && onChange ? (
                     <Grid container key={`${cell?.column?.id}-modal`}>
                        <Form onSubmit={handleSave} className={classes.formStyle}>
                           <TextFieldLF
                              name={'notes'}
                              autoFocus
                              onChange={handleChange}
                              onKeyDown={handleKeydown}
                              value={getValue('notes')}
                              maxRows={4}
                              minRows={1}
                              multiline
                           />
                           <Grid container justifyContent={'space-between'}>
                              <Grid item>
                                 <ButtonLF
                                    labelKey={'save.label'}
                                    onClickCapture={handleSave}
                                    onClick={handleSave}
                                    onMouseDown={handleSave}
                                    type={'submit'}
                                    className={classes.buttonStyle}
                                 />
                                 <ButtonLF
                                    labelKey={'cancel.button'}
                                    onClickCapture={handleClose}
                                    onClick={handleClose}
                                    onMouseDown={handleClose}
                                    className={classes.buttonStyle}
                                 />
                              </Grid>
                              <Grid item>
                                 <ButtonLF
                                    labelKey={'delete.button'}
                                    onClickCapture={handleDelete}
                                    onClick={handleDelete}
                                    onMouseDown={handleDelete}
                                    disabled={!getValue('notes')}
                                    className={classes.buttonStyle}
                                 />
                              </Grid>
                           </Grid>
                        </Form>
                     </Grid>
                  ) : (
                     getValue('notes')
                  )}
               </Popover>
            )}
            {showPopper && (
               <Popper
                  open={true}
                  anchorEl={anchorRef.current}
                  placement={'top-start'}
                  className={classes.popperStyle}
                  modifiers={[
                     {
                        name: 'offset',
                        options: {
                           offset: [anchorRef.current.clientWidth / 2 + (hasNote && !!getDataValue() ? -88 : -44), 10],
                        },
                     },
                  ]}
               >
                  <Paper
                     ref={popperRef}
                     sx={{
                        p: 1,
                        bgcolor: 'background.default',
                        display: 'flex',
                        flex: '0 0',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                     }}
                     spacing={1}
                     elevation={2}
                     onMouseEnter={() => (inToolbarRef.current = true)}
                     onMouseLeave={() => (inToolbarRef.current = false)}
                  >
                     <ConfirmButton
                        edge='start'
                        color='error'
                        buttonLabelKey={'cashFlow.deleteNote.label'}
                        messageKey={'confirmRemoveValue.message'}
                        className={classes.deleteButtonStyle}
                        startIcon={<img alt='delete' src={DELETE_ICON} />}
                        onClickCapture={() => {
                           openConfirmRef.current = true;
                           if (timerRef.current) {
                              clearTimeout(timerRef.current);
                              timerRef.current = null;
                           }
                        }}
                        onCancel={() => {
                           openConfirmRef.current = false;
                           hidePopper();
                        }}
                        onConfirm={handleDelete}
                        values={{type: 'note', name: notes}}
                        size={'small'}
                        sx={{display: hasNote ? undefined : 'none', mr: 1}}
                     />
                     {!!getDataValue() && (
                        <ButtonFHG
                           edge='end'
                           labelKey={hasNote ? 'cashFlow.editNote.label' : 'cashFlow.addNote.label'}
                           color='primary'
                           onClick={handleAddNote}
                           startIcon={<img alt='edit' src={EDIT_ICON} />}
                           size={'small'}
                        />
                     )}
                  </Paper>
               </Popper>
            )}
         </Box>
         <InputCell {...data} />
      </Box>
   );
}

NoteCellV8.propTypes = {
   cellKey: PropTypes.any,
   selected: PropTypes.bool,
   editNote: PropTypes.bool,
   notes: PropTypes.any,
};
