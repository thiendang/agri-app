import makeStyles from '@mui/styles/makeStyles';
import {DatePicker as DatePickerOriginal} from '@mui/x-date-pickers';
import moment from 'moment';
import React, {useState, useMemo, Fragment} from 'react';
import {useIntl} from 'react-intl';
import TextFieldFHG from '../../components/TextField';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {formatMessage} from '../utils/Utils';
import ValidateTarget from './ValidateTarget';

const useStyles = makeStyles((theme) => ({
   buttonPadding: {
      '& button': {
         padding: theme.spacing(0.5),
      },
      '& > div': {
         paddingRight: 0,
      },
      '& > div > div': {
         marginLeft: 0,
      },
      '& input > div': {
         marginLeft: 0,
      },
   },
}));

/**
 * The TextField with preset formats.
 */
export default function DatePickerFHG({
   name,
   className,
   label,
   labelKey,
   disableToolbar = false,
   format = DATE_FORMAT_KEYBOARD,
   autoOk = true,
   onChange,
   value,
   defaultValue,
   variant = 'inline',
   disableFuture = true,
   InputAdornmentProps = {position: 'start'},
   required,
   custom,
   ...keyboardDatePickerProps
}) {
   const classes = useStyles();
   const intl = useIntl();
   const [isSet, setIsSet] = useState(value !== undefined && value !== null && value !== '');

   return useMemo(() => {
      const currentLabel = label || (labelKey && formatMessage(intl, labelKey)) || undefined;
      const handleChange = (moment) => {
         setIsSet(true);
         onChange && onChange({target: {name}}, moment, 'date-picker');
      };

      return (
         <Fragment>
            <DatePickerOriginal
               name={name}
               className={`${classes.buttonPadding} ${className}`}
               disableToolbar={disableToolbar}
               format={format}
               autoOk={autoOk}
               disableFuture={disableFuture}
               label={currentLabel}
               onChange={handleChange}
               value={isSet || value !== undefined ? value : defaultValue}
               variant={variant}
               InputAdornmentProps={InputAdornmentProps}
               renderInput={(params) => {
                  if (custom)
                     params.inputProps = {
                        ...params.inputProps,
                        value: moment(params.inputProps.value).format(format),
                     };
                  return <TextFieldFHG {...params} variant={keyboardDatePickerProps?.inputVariant} />;
               }}
               required={required}
               {...keyboardDatePickerProps}
            />
            {required && <ValidateTarget name={'validate ' + name} value={isSet ? value : defaultValue} />}
         </Fragment>
      );
   }, [
      label,
      labelKey,
      intl,
      name,
      classes.buttonPadding,
      className,
      disableToolbar,
      format,
      autoOk,
      disableFuture,
      isSet,
      value,
      defaultValue,
      variant,
      InputAdornmentProps,
      required,
      keyboardDatePickerProps,
      onChange,
      custom,
   ]);
}
