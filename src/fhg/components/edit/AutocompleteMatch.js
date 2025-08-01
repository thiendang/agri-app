import {Autocomplete} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {useState} from 'react';
import React from 'react';
import {matchSorter} from 'match-sorter';
import useEffectOnceConditional from '../../hooks/useEffectOnceConditional';
import {hasValue} from '../../utils/Utils';
import ValidateTarget from '../ValidateTarget';

const useStyles = makeStyles(
   (theme) => ({
      asterisk: {
         '& label:after': {
            content: '"*"',
            marginLeft: 2,
         },
      },
      default: {
         '& input.MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
      },
   }),
   {name: 'AutocompleteMatchStyles'},
);

const filterOptions =
   (setup = {keys: ['label']}, showAll = false) =>
   (options, {inputValue}) => {
      return showAll ? [showAll, ...matchSorter(options, inputValue, setup)] : matchSorter(options, inputValue, setup);
   };

/**
 * The Autocomplete with preset formats.
 */
export default function AutocompleteMatch({
   name,
   defaultValue,
   value,
   required,
   matchSorterProps,
   showAllProps,
   placeholder,
   freeSolo,
   inputValue,
   optionLabelKey = 'name',
   optionValueKey = 'id',
   onInputChange,
   onChange,
   ...props
}) {
   const classes = useStyles();
   const [inputSet, setInputSet] = useState(value || defaultValue);

   // Only allow the inputSet to be set once when defaultValue or value are set for the first time.
   useEffectOnceConditional(() => {
      if (!hasValue(inputSet) && (hasValue(value) || hasValue(defaultValue))) {
         setInputSet(value || defaultValue);
         return true;
      }
      return false;
   }, [inputSet, value, defaultValue]);

   const handleIsOptionEqualToValue = (option, value) => {
      return typeof option === 'object' ? option?.[optionValueKey] === value?.[optionValueKey] : option === value;
   };

   const handleChange = (event, value, reason, details) => {
      if (reason === 'removeOption' || reason === 'clear') {
         if (!props?.multiple || value?.length <= 0) {
            setInputSet(null);
         }
      } else if (reason === 'createOption' || reason === 'selectOption') {
         setInputSet(value);
      }
      onChange?.(event, value, reason, details);
   };

   const handleInputChange = (event, value, reason, options) => {
      onInputChange?.(event, value, reason, options);
      if (freeSolo) {
         setInputSet(reason !== 'reset' && reason !== 'clear' ? value : null);
      }
   };

   const handleGetOptionLabel = (option) => {
      return option?.[optionLabelKey] || props.valueInput;
   };

   const theValue = value === '' ? null : value;

   return (
      <>
         <Autocomplete
            key={'autocomplete ' + name + ' ' + props?.options?.length}
            filterOptions={matchSorterProps !== false ? filterOptions(matchSorterProps, showAllProps) : undefined}
            className={`${classes.default} ${required ? classes.asterisk : undefined}`}
            name={name}
            defaultValue={defaultValue}
            value={theValue}
            placeholder={placeholder}
            isOptionEqualToValue={handleIsOptionEqualToValue}
            freeSolo={freeSolo}
            inputValue={inputValue}
            getOptionLabel={handleGetOptionLabel}
            onInputChange={required ? handleInputChange : onInputChange}
            onChange={required ? handleChange : onChange}
            {...props}
         />
         {required && <ValidateTarget key={'validate ' + name} name={'validate ' + name} value={inputSet} />}
      </>
   );
}
