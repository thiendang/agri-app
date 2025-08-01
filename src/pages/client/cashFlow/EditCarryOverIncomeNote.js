import React, {useRef} from 'react';
import Box from '@mui/material/Box';
import TextFieldLF from '../../../components/TextFieldLF';
import InputAdornment from '@mui/material/InputAdornment';
import {Popover, Tooltip} from '@mui/material';
import {useTheme, withStyles} from '@mui/styles';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import ButtonLF from '../../../components/ButtonLF';
import {Notes} from '@mui/icons-material';

export function EditCarryOverIncomeNote({
   classes,
   entityId,
   handleClose,
   handleCashFlowChange,
   handleFocusEditCarryOver,
   handleBlurEditCarryOver,
   isEditCarryOver,
   handlePopoverClose,
   handleChangeNoteCarryover,
   handleKeydown,
   handleSaveCarryover,
   value,
   disabled,
   title,
   textValue,
}) {
   const selectCellRef = useRef();
   const theme = useTheme();

   return (
      <Box ref={selectCellRef} display='flex' alignItems='center'>
         <TextFieldLF
            key={'carryoverIncome' + entityId}
            sx={{mr: 1, width: 175}}
            isFormattedNumber={true}
            name={'carryoverIncome'}
            labelKey={'cashFlow.carryOverIncome.label'}
            onChange={handleCashFlowChange}
            value={value}
            disabled={disabled}
            inputProps={{
               prefix: '$',
               style: {
                  color: theme.palette.text.primary,
               },
            }}
            fullWidth={false}
            onFocus={handleFocusEditCarryOver}
            onBlur={handleBlurEditCarryOver}
            placeholder={'$100,000'}
            classes={classes}
            InputProps={{
               endAdornment: (
                  <InputAdornment position='end' className={classes.inputAdornmentStyle}>
                     <LightTooltip
                        title={title}
                        placement={'bottom-end'}
                        slotProps={{popper: {style: {width: selectCellRef.current?.clientWidth - 30}}}}
                     >
                        <Notes
                           style={{cursor: 'pointer'}}
                           color={theme.palette.mode === 'dark' ? 'primary' : undefined}
                        />
                     </LightTooltip>
                  </InputAdornment>
               ),
            }}
         />
         {isEditCarryOver && (
            <Popover
               classes={{paper: classes.editPaper, root: classes.root}}
               open={true}
               anchorEl={selectCellRef.current}
               anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
               transformOrigin={{vertical: 'top', horizontal: 'left'}}
               onClose={handlePopoverClose}
               disableRestoreFocus
               hideBackdrop
               sx={{width: selectCellRef.current?.clientWidth}}
            >
               <Grid2 container>
                  <Box className={classes.formStyleNote}>
                     <TextFieldLF
                        key={'carryoverIncomeNote' + entityId}
                        name={'carryoverIncomeNote'}
                        autoFocus
                        onChange={handleChangeNoteCarryover}
                        onKeyDown={handleKeydown}
                        value={textValue}
                        maxRows={4}
                        minRows={1}
                        multiline
                     />
                     <Grid2 container justifyContent={'space-between'}>
                        <Grid2 item>
                           <ButtonLF
                              labelKey={'save.label'}
                              onClick={handleSaveCarryover}
                              className={classes.buttonStyle1}
                           />
                           <ButtonLF
                              labelKey={'cancel.button'}
                              onClick={handleClose}
                              className={classes.buttonStyle1}
                           />
                        </Grid2>
                     </Grid2>
                  </Box>
               </Grid2>
            </Popover>
         )}
      </Box>
   );
}

const LightTooltip = withStyles((theme) => ({
   tooltip: {
      backgroundColor: '#fff',
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 14,
      whiteSpace: 'pre-wrap',
      overflow: 'auto',
      maxHeight: 300,
   },
}))(Tooltip);
