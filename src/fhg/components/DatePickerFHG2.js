import {Close} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import {InputAdornment} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {DatePicker} from '@mui/x-date-pickers';
import moment from 'moment';
import {useMemo} from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import React, {forwardRef} from 'react';
import TextFieldFHG from '../../components/TextField';
import {DATE_DB_FORMAT} from '../../Constants';
import useMessage from '../hooks/useMessage';
import ValidateTarget from './ValidateTarget';
import makeStyles from '@mui/styles/makeStyles';
import {useTheme} from '@mui/styles';

const useStyles = makeStyles(
   () => ({
      endStyle: {
         marginTop: 12,
         '& .MuiInputAdornment-positionEnd': {width: 60},
      },
   }),
   {name: 'DatePickerFhg2Styles'},
);

/**
 * DatePicker component that handles clearable and default styles.
 * @param name Name of the component.
 * @param value The value of the component.
 * @param onChange Callback when the value changes.
 * @param variant The variant of the TextField.
 * @param disabled If true, the picker and text field are disabled.
 * @param clearable If true, the value can be cleared by pressing the 'X' button.
 * @param helperText The helper text for the TextField
 * @param FormHelperTextProps The FormHelperTextProps for the TextField
 * @param initialFormat The format when initially set (i.e. usually the server format).
 * @param props The other props are passed to the DatePicker.
 * @returns {JSX.Element}
 * @constructor
 */
const DatePickerFHG = forwardRef(function DatePickerFHG(
   {
      name,
      value,
      onChange,
      variant,
      disabled,
      clearable,
      error,
      helperText,
      FormHelperTextProps,
      format,
      label,
      labelKey,
      isDateOnly = true,
      inputVariant,
      onError,
      onAccept,
      margin,
      fullWidth,
      defaultValue,
      required = false,
      initialFormat = DATE_DB_FORMAT,
      minDate,
      maxDate,
      layout,
      ...props
   },
   ref,
) {
   const classes = useStyles();
   const currentLabel = useMessage(labelKey, label);
   const [date, setDate] = useState(calculateDates(value, defaultValue));
   const useMinDate = useMemo(() => calculateDate(minDate, defaultValue), [minDate]);
   const useMaxDate = useMemo(() => calculateDate(maxDate, defaultValue), [maxDate]);

   function calculateDates(date, defaultValue) {
      return calculateDate(date || defaultValue);
   }

   function calculateDate(date) {
      let useDate;

      if (date && format) {
         if (isDateOnly) {
            useDate = moment.utc(date, format);
         } else {
            useDate = moment(date, format);
         }
         if (!useDate.isValid()) {
            useDate = moment(date, initialFormat);
         }
      } else {
         useDate = date || null;
      }
      return useDate;
   }

   useEffect(() => {
      const date = calculateDates(value, defaultValue);
      setDate(date);
   }, [format, isDateOnly, value, defaultValue]);

   const handleDateAccept = (date) => {
      handleDateChange(date);
      onAccept?.(date);
   };

   const handleDateChange = (date) => {
      setDate(date);
      if (!date?.isValid()) {
         onError(date);
      }
      onChange(format ? moment(date).format(format) : date, name);
   };

   const ignoreDateChange = (date, otherParams) => {
      if (otherParams.validationError === null) {
         if (date?.isValid()) {
            setDate(date);
            onChange(format ? moment(date).format(format) : date, name);
         }
      }
   };

   const handleClear = () => {
      setDate(null);
      onChange(null, name);
   };

   let inputProps = {};

   if (clearable) {
      inputProps = {
         endAdornment: (
            <InputAdornment key='clear' position='end' style={{width: '20px'}}>
               <IconButton onMouseDown={handleClear} disabled={disabled} size={'small'} edge={'start'}>
                  <Close />
               </IconButton>
            </InputAdornment>
         ),
      };
   }

   const theme = useTheme();

   const dateField = (
      <>
         <DatePicker
            className={classes.endStyle}
            name={name}
            ref={ref}
            onAccept={handleDateAccept}
            onChange={ignoreDateChange}
            value={date}
            minDate={useMinDate}
            maxDate={useMaxDate}
            disabled={disabled}
            {...props}
            style={{marginTop: margin !== 'none' ? 12 : undefined}}
            label={currentLabel}
            slotProps={{
               textField: {
                  size: 'small',
                  helperText,
                  labelKey,
                  fullWidth,
                  margin,
                  variant: props?.inputVariant,
                  style: props?.style,
               },
               mobilePaper: {
                  style: {
                     backgroundColor: theme.palette.background.paper4,
                  },
               },
            }}
            slots={{textField: TextFieldFHG}}
            renderInput={(params) => (
               <TextFieldFHG
                  {...params}
                  margin={margin}
                  fullWidth={fullWidth}
                  InputProps={{
                     ...(params?.InputProps || {}),
                     endAdornment: [inputProps.endAdornment, params?.InputProps?.endAdornment],
                  }}
                  error={error}
                  FormHelperTextProps={FormHelperTextProps}
                  helperText={helperText}
                  variant={inputVariant || variant}
                  style={props?.style}
               />
            )}
            required={required}
         />
         {required && (
            <ValidateTarget
               name={'createdDateTime'}
               value={typeof date === 'object' ? !!date?.isValid() : false}
               validationMessage={'Enter a valid date.'}
            />
         )}
      </>
   );
   if (layout) {
      return <Grid {...layout}>{dateField}</Grid>;
   } else {
      return dateField;
   }
});

export default DatePickerFHG;
