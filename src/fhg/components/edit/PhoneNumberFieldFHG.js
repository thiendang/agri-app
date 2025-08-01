import isEqual from 'lodash/isEqual';
import {useMemo, useState} from 'react';
import React from 'react';
import TextFieldLF from '../../../components/TextFieldLF';
import useMessage from '../../hooks/useMessage';

import PropTypes from 'prop-types';
import {IMaskInput} from 'react-imask';

/**
 * Component to mask a text input.
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{}> & React.RefAttributes<unknown>>}
 */
export const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
   const {mask, isNumber, onChange, ...other} = props;

   function handleAccept(value) {
      if (!isEqual(value, props.value)) {
         onChange?.({target: {name: props.name, value}});
      }
   }

   return (
      <IMaskInput
         {...other}
         mask={mask}
         definitions={{
            '#': /[1-9]/,
         }}
         inputRef={ref}
         onAccept={handleAccept}
         unmask={isNumber}
         overwrite
      />
   );
});

TextMaskCustom.propTypes = {
   name: PropTypes.string.isRequired,
   onChange: PropTypes.func.isRequired,
};

/**
 * Input Component to enter a phone number.
 *
 * @param name The name of the phone number component for the useEditData.
 * @param label The label of the component,
 * @param labelKey The localization key for the label.
 * @param variant The variant of the TextField of the phone number input.
 * @param placeholderKey The localization key for the placeholder text.
 * @param defaultValue The default value of the phone number input.
 * @param value The value of the phone number input.
 * @param onChange Callback when the phone number input changes.
 * @param [fullWidth=true] Indicates if the component should be full width of parent.
 * @param isNumber Indicates if the phone number is an unformatted number.
 * @param phoneFieldProps All remaining props are passed ot the TextField
 * @return {JSX.Element}
 * @constructor
 */
export default function PhoneNumberFieldFHG({
   name,
   label,
   labelKey,
   variant,
   placeholderKey,
   defaultValue,
   value,
   onChange,
   fullWidth = true,
   isNumber = false,
   ...phoneFieldProps
}) {
   const [internalValue, setInternalValue] = useState(defaultValue || value || '');
   const useLabelKey = useMemo(() => labelKey, [labelKey]);
   const currentLabel = useMessage(useLabelKey, label);
   const currentPlaceholder = useMessage(placeholderKey) || undefined;

   /**
    * Callback when the value changes.
    * @param value The new value.
    */
   const onValueChange = (value) => {
      onChange(value);
      setInternalValue(value.target.value);
   };

   return (
      <TextFieldLF
         {...phoneFieldProps}
         fullWidth={fullWidth}
         name={name}
         label={currentLabel}
         placeholder={currentPlaceholder}
         value={internalValue}
         defaultValue={internalValue}
         onChange={onValueChange}
         inputProps={{mask: '(000) 000-0000', isNumber: isNumber}}
         InputProps={{inputComponent: TextMaskCustom}}
      />
   );
}
