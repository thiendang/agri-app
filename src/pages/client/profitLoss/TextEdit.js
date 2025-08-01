import {Box, ClickAwayListener, Popover, Tooltip} from '@mui/material';
import React, {memo, useEffect, useMemo, useRef} from 'react';
import TextFieldFHG from '../../../components/TextField';
import {makeStyles, withStyles} from '@mui/styles';
import TypographyFHG from '../../../fhg/components/Typography';
import numberFormatter from 'number-formatter';
import {SCALE_APP} from '../../../Constants';
import {Notes} from '@mui/icons-material';
import Grid2 from '../../../fhg/components/Grid';
import TextFieldLF from '../../../components/TextFieldLF';
import useEditData from '../../../fhg/components/edit/useEditData';
import ButtonLF from '../../../components/ButtonLF';
import {useRecoilState} from 'recoil';
import {selectedCellState} from '../../../fhg/components/table/TableNewUiFHG';

const LightTooltip = withStyles((theme) => ({
   tooltip: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1],
      fontSize: 14,
   },
}))(Tooltip);

const useStyles = makeStyles((theme) => ({
   input: {
      marginTop: 0,
      marginBottom: 0,
      fontSize: 18 * SCALE_APP,
      fontWeight: 400,
      '& .MuiInputBase-input': {
         padding: '0px',
         height: '28px',
         color: theme.palette.text.primary,
         width: '100%',
         border: 'unset !important',
         fontSize: '13.5px',
         backgroundColor: 'transparent',
      },
      height: '30px',
      '& .MuiInputBase-root': {
         border: 'none',
      },
      '&:hover .MuiInputBase-root': {
         border: 'none',
      },
      '& .MuiOutlinedInput-root': {
         boxShadow: 'none',
         '& fieldset': {
            border: 'none',
            boxShadow: 'none',
         },
         '&.Mui-focused fieldset': {
            border: 'none',
            boxShadow: 'none',
         },
         '&:hover fieldset': {
            border: 'none',
            boxShadow: 'none',
         },
         '&:hover input': {
            border: 'none',
         },
         '&:focus input': {
            border: '1px solid #434343 !important',
            borderRadius: 8,
            backgroundColor: '#1D1D1D',
         },
      },
   },
   inputRight: {
      '& .MuiOutlinedInput-input': {
         textAlign: 'end',
         backgroundColor: theme.palette.background.default,
         borderRadius: '8px',
      },
   },
   inputLeft: {
      '& .MuiOutlinedInput-input': {
         textAlign: 'start',
         borderRadius: '8px',
         '&:focus': {
            border: `1px solid ${theme.palette.primary.stroke} !important`,
            backgroundColor: theme.palette.background.selectedCellFocus,
            borderRadius: '8px',
         },
      },
   },
   text: {
      textAlign: 'end',
   },
   noteIconStyle: {
      position: 'absolute',
      right: -4,
      top: theme.spacing(-0.5),
      backgroundColor: '#C6D2B8',
      fontSize: 16 * SCALE_APP,
      zIndex: 1,
   },
   editPaper: {
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.default,
      zIndex: `${theme.zIndex.drawer} !important`,
      width: 260 * SCALE_APP + 12,
   },
   popover: {
      pointerEvents: 'none',
   },
   root: {
      zIndex: `${theme.zIndex.drawer + 2} !important`,
   },
   formStyle: {
      maxHeight: '100%',
      overflow: 'visible',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
   },
}));

const TextEdit = ({
   value,
   ipRef,
   isNumber,
   format,
   onUpdate,
   alignLeft,
   notes,
   id,
   onFocus,
   onBlur,
   hasNote,
   updateNote,
   placeholder,
   alwaysEdit,
   cost,
   onCanEdit,
}) => {
   const classes = useStyles();
   const [clicked, setClicked] = React.useState(false);

   const [text, setText] = React.useState(value);

   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);

   const handleSave = () => {
      updateNote(cost)(getValue('notes'));
      setCellSelected(undefined);
      setDefaultValues(getValue('notes'));
      setClicked(false);
   };

   const [, /*editValues*/ handleChange, {getValue, setDefaultValues, resetValues}] = useEditData(notes);

   useEffect(() => {
      setDefaultValues({notes});
   }, [notes, setDefaultValues]);

   const handleKeydown = (event) => {
      if (event?.key === 'Escape') {
         handleClose(event);
      }
   };

   const handleClose = (event) => {
      setCellSelected(undefined);
      setClicked(false);
   };

   const handleDelete = (event) => {
      updateNote(cost)('');
      setCellSelected(undefined);
      setDefaultValues('');
      setClicked(false);
      resetValues();
   };

   const isSelected = cellSelected === id;

   const anchorRef = useRef();

   const handleHoverClose = () => {};

   return (
      <div
         ref={ipRef || anchorRef}
         onClick={(event) => {
            if ((onCanEdit && onCanEdit(event)) || !onCanEdit) {
               setClicked(true);
               onFocus && onFocus();
            }
         }}
         style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: alignLeft ? 'flex-start' : 'flex-end',
            position: 'relative',
         }}
      >
         {clicked || alwaysEdit ? (
            <TextFieldFHG
               placeholder={placeholder}
               autoFocus={!alwaysEdit && !isSelected}
               isFormattedNumber={isNumber}
               className={`${classes.input} ${alignLeft ? classes.inputLeft : classes.inputRight}`}
               value={text}
               defaultValue={value}
               onChange={(e) => {
                  setText(e.target.value);
               }}
               onBlur={(e) => {
                  e?.preventDefault();
                  e?.stopPropagation();
                  if (text !== value) {
                     onUpdate(text);
                  }
                  setClicked(false);
                  onBlur && onBlur(e);
               }}
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     e?.preventDefault();
                     e?.stopPropagation();
                     if (text !== value) {
                        onUpdate(text);
                     }
                     setClicked(false);
                  }

                  if (e.key === 'Tab') {
                     e.preventDefault();
                     e.stopPropagation();
                     if (text !== value) {
                        onUpdate(text);
                     }
                     setClicked(false);
                  }
               }}
            />
         ) : (
            <Box
               sx={{
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
               }}
            >
               <TypographyFHG variant='fs18400' color='text.primary'>
                  {format ? numberFormatter(format, text) : text}
               </TypographyFHG>
            </Box>
         )}
         {notes && (
            <ClickAwayListener onClickAway={handleHoverClose} disableReactTree={true}>
               <LightTooltip title={notes}>
                  <Notes
                     // onClick={handleNotesClick(cell.id)}
                     className={classes.noteIconStyle}
                     // onDoubleClick={handleOpenEdit}
                  />
               </LightTooltip>
            </ClickAwayListener>
         )}
         {hasNote && isSelected && (
            <Popover
               key={`${id}-popover`}
               classes={{paper: classes.editPaper, root: classes.root}}
               open={hasNote && isSelected}
               anchorEl={hasNote && isSelected && (ipRef || anchorRef).current}
               anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
               transformOrigin={{vertical: 'top', horizontal: 'left'}}
               onClose={handleClose}
               hideBackdrop
               disableAutoFocus={true}
               disableEnforceFocus={true}
            >
               <Grid2 container key={`${id}-content`}>
                  <Box className={classes.formStyle}>
                     <TextFieldLF
                        name={'notes'}
                        onChange={handleChange}
                        onKeyDown={handleKeydown}
                        defaultValue={notes}
                        value={getValue('notes')}
                        maxRows={4}
                        minRows={1}
                        multiline
                     />
                     <Grid2 container justifyContent={'space-between'}>
                        <Grid2 item>
                           <ButtonLF labelKey={'save.label'} onClick={handleSave} className={classes.buttonStyle} />
                           <ButtonLF labelKey={'cancel.button'} onClick={handleClose} className={classes.buttonStyle} />
                        </Grid2>
                        <Grid2 item>
                           <ButtonLF
                              labelKey={'delete.button'}
                              onClick={handleDelete}
                              disabled={!getValue('notes')}
                              className={classes.buttonStyle}
                           />
                        </Grid2>
                     </Grid2>
                  </Box>
               </Grid2>
            </Popover>
         )}
      </div>
   );
};

export default memo(TextEdit);
