import {CalendarMonth} from '@mui/icons-material';
import {ClickAwayListener} from '@mui/material';
import {Paper} from '@mui/material';
import {Popover} from '@mui/material';
import {InputAdornment} from '@mui/material';
import {MonthCalendar} from '@mui/x-date-pickers/MonthCalendar';
import moment from 'moment';
import {useEffect} from 'react';
import {useCallback} from 'react';
import {useState} from 'react';
import {useRef} from 'react';
import React from 'react';
import TextFieldFHG from '../../components/TextField';
import ValidateTarget from './ValidateTarget';

/**
 * Input Component to select a single month of the year.
 *
 * NOTE: This doesn't handle selecting the year.
 *
 * @param labelKey The language key of the label.
 * @param label The label used if a label key isn't given.
 * @param name The name of the component to be used in the useEditData.
 * @param value the value for the month picker.
 * @param defaultValue The default value for the month picker.
 * @param required Indicates if the component value is required for submit.
 * @param format The format of the date.
 * @param onChange Callback when a month value is selected.
 * @param disabled Indicates if the component is disabled.
 * @return {JSX.Element}
 * @constructor
 */
export default function MonthPicker({
   labelKey,
   label,
   name,
   value,
   defaultValue,
   required,
   format,
   onChange,
   disabled,
}) {
   const anchorRef = useRef(null);
   const [monthValue, setMonthValue] = useState(moment(defaultValue).format(format));
   const [isSet, setIsSet] = useState(false);
   const [open, setOpen] = useState();

   useEffect(() => {
      if (!isSet && format) {
         setMonthValue(moment(defaultValue).format(format));
      }
   }, [defaultValue]);

   /**
    * Callback when the month is changed.
    * @type {(function(*): void)|*}
    */
   const handleChange = useCallback((date) => {
      setMonthValue(moment(date).format(format));
      setIsSet(true);
      onChange?.(date, name);
      handleClose();
   }, []);

   /**
    * Close the Excel document selection popover.
    */
   const handleClose = () => {
      setOpen(false);
   };

   const handleOpen = (event) => {
      setOpen(true);
      anchorRef.current = event.currentTarget;
   };
   const useValue = isSet ? value : defaultValue;

   return (
      <>
         <TextFieldFHG
            ref={anchorRef}
            value={monthValue}
            label={label}
            labelKey={labelKey}
            onClick={handleOpen}
            disabled={disabled}
            InputProps={{
               startAdornment: (
                  <InputAdornment position='start' style={{cursor: 'pointer'}}>
                     <CalendarMonth />
                  </InputAdornment>
               ),
            }}
         />
         {required && <ValidateTarget name={'validate ' + name} value={isSet ? value : defaultValue} />}

         <Popover
            open={open}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'center',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'center',
            }}
            anchorEl={anchorRef.current}
         >
            <Paper>
               <ClickAwayListener onClickAway={handleClose}>
                  <MonthCalendar onChange={handleChange} value={useValue} />
               </ClickAwayListener>
            </Paper>
         </Popover>
      </>
   );
}
