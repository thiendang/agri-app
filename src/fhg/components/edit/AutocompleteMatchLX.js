import React from 'react';
import TextFieldFHG from '../../../components/TextField';
import AutocompleteMatch from './AutocompleteMatch';

export default function AutocompleteMatchLX({
   label = '',
   labelKey,
   fullWidth = true,
   textFieldName,
   textFieldSize = 'small',
   value,
   options = [],
   placeholder,
   ...otherProps
}) {
   return (
      <AutocompleteMatch
         key={'autocompleteMatchLx ' + options?.length}
         fullWidth={fullWidth}
         placeholder={placeholder}
         renderInput={(params) => (
            <TextFieldFHG
               placeholder={placeholder}
               {...params}
               name={textFieldName}
               size={textFieldSize}
               labelKey={labelKey}
               label={label}
               inputProps={{
                  ...params.inputProps,
                  autocomplete: 'off', // disable autocomplete and autofill
               }}
            />
         )}
         value={value || null}
         options={options}
         {...otherProps}
      />
   );
}
