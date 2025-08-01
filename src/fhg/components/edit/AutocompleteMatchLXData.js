import Grid from '@mui/material/Unstable_Grid2';
import {isEqual} from 'lodash';
import {map} from 'lodash';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import {useMemo} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import TextFieldFHG from '../../../components/TextField';
import {findByIdByValueOrder} from '../../utils/Utils';
import AutocompleteMatchLX from './AutocompleteMatchLX';

export default function AutocompleteMatchLXData({
   name,
   label = '',
   labelKey,
   fullWidth = true,
   textFieldName,
   textFieldSize = 'small',
   onChange,
   defaultValue,
   value,
   options = [],
   textFieldProps,
   layout,
   objectValueKey = 'id',
   placeholder,
   multiple,
   ...otherProps
}) {
   const [autoCompleteValue, setAutoCompleteValue] = useState();

   useEffect(() => {
      if (options?.length > 0 && defaultValue && (value === undefined || value === '')) {
         if (!multiple) {
            const foundDefaultValue = find(options, {[objectValueKey]: defaultValue});
            setAutoCompleteValue(foundDefaultValue);
         } else {
            setAutoCompleteValue(findByIdByValueOrder(options, defaultValue));
         }
      }
   }, [options, defaultValue, value, objectValueKey, multiple]);

   useEffect(() => {
      if (options?.length > 0 && value !== undefined) {
         if (!multiple) {
            const valueObject = find(options, {[objectValueKey]: value});
            setAutoCompleteValue(valueObject || null);
         } else if (!isEqual(autoCompleteValue, value)) {
            setAutoCompleteValue(findByIdByValueOrder(options, value));
         }
      } else if (options?.length > 0 && defaultValue !== undefined) {
         if (!multiple) {
            const valueObject = find(options, {[objectValueKey]: defaultValue});
            setAutoCompleteValue(valueObject || null);
         } else if (!isEqual(autoCompleteValue, defaultValue)) {
            setAutoCompleteValue(findByIdByValueOrder(options, defaultValue));
         }
      } else if (value === undefined && !defaultValue && !autoCompleteValue) {
         setAutoCompleteValue(multiple ? [] : null);
      }
      // autoCompleteValue causes change on every render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [options, value, defaultValue, objectValueKey, multiple]);

   const autoComplete = useMemo(() => {
      const handleAutocompleteChange = (name) => (event, value, reason) => {
         let newValue;
         if (reason === 'selectOption') {
            if (multiple) {
               if (isArray(value)) {
                  newValue = {[name]: map(value, 'id')};
               } else {
                  newValue = {[name]: [value[objectValueKey]]};
               }
            } else {
               newValue = {[name]: value[objectValueKey]};
            }
         } else if (reason === 'clear') {
            newValue = {[name]: null};
         } else if (reason === 'removeOption' && multiple && isArray(value)) {
            newValue = {[name]: map(value, 'id')};
            if (textFieldName) {
               newValue[textFieldName] = null;
            }
         }

         onChange?.(event, value, reason, newValue, name);
         setAutoCompleteValue(value);
      };

      return (
         <AutocompleteMatchLX
            key={'AutocompleteMatchLxKey ' + options?.length}
            name={name}
            multiple={multiple}
            fullWidth={fullWidth}
            renderInput={(params) => (
               <TextFieldFHG
                  placeholder={placeholder}
                  {...params}
                  name={textFieldName}
                  size={textFieldSize}
                  labelKey={labelKey}
                  label={label}
                  {...textFieldProps}
                  InputLabelProps={{style: {zIndex: 100}}}
                  inputProps={{
                     ...params.inputProps,
                     autoComplete: 'off', // disable autocomplete and autofill
                  }}
               />
            )}
            options={options}
            {...otherProps}
            onChange={handleAutocompleteChange(name)}
            value={autoCompleteValue || (multiple ? [] : null)}
            sx={{
               '& + .MuiAutocomplete-popper .MuiAutocomplete-option': {
                  backgroundColor: '#363636',
               },
            }}
         />
      );
   }, [
      options,
      name,
      multiple,
      fullWidth,
      otherProps,
      autoCompleteValue,
      onChange,
      objectValueKey,
      placeholder,
      textFieldName,
      textFieldSize,
      labelKey,
      label,
      textFieldProps,
   ]);

   if (layout) {
      return <Grid {...layout}>{autoComplete}</Grid>;
   } else {
      return autoComplete;
   }
}
