import {adaptV4Theme, createTheme} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import get from 'lodash/get';
import React from 'react';
import NumberFormatCustom from '../fhg/components/NumberFormat';
import useMessage from '../fhg/hooks/useMessage';
import CustomInputTextField from './CustomInputTextField';
import ThemeProvider from './ThemeProvider';
import {StyledEngineProvider} from '@mui/material';

const theme = createTheme(
   adaptV4Theme(
      localStorage.darkMode
         ? {
              palette: {
                 text: {
                    secondary: '#303030',
                    primary: '#9AB96C',
                 },
              },
           }
         : {
              palette: {
                 text: {
                    secondary: '#707070',
                    primary: '#527928',
                 },
              },
           },
   ),
);

/**
 * The TextField with preset formats.
 * @param className ClassName to add to the TextField
 * @param name The name attribute of the TextField
 * @param labelKey The label key for localization lookup.
 * @param placeholderKey The placeholder key for localization lookup.
 * @param helpKey The help key for localization lookup.
 * @param helperText the help text for the TextField. Used as the default if helpKey is given.
 * @param defaultValue The default value of the TextField
 * @param value The value of the TextField. The default if getValue is set.
 * @param getValue The getValue function from useEditData to get the value for the TextField. Takes precedence over
 *   value.
 * @param onChange The callback when the TextField has changed.
 * @param margin The margin attribute for the TextField. Defaults to 'normal'.
 * @param InputLabelProps Extra properties for the InputLabel
 * @param InputProps Extra properties for the InputProps.
 * @param label The text for the label of the TextField
 * @param fullWidth The fullwidth attribute for TextField
 * @param isFormattedNumber Indicates of the TextField contains a number and if it should be formatted.
 * @param variant The variant attribute for TextField. Defaults to 'outlined'.
 * @param size The size attribute for the TextField. Defaults to 'small'.
 * @param labelTemplate The template text for the label key. The name property is inserted in the template at '{name}'.
 * @param editData The useEditData editData for the TextField.
 * @param classesProp as classes. The classes for the TextField.
 * @param internalKey The key for the TextField.
 * @param textFieldProps The extra TextFieldProps not already specified.
 * @param placeholder The placeholder for the text component.
 * @return {JSX.Element}
 * @constructor
 */
export default function TextFieldLF({
   className,
   name,
   labelKey,
   placeholderKey,
   helpKey,
   helperText,
   defaultValue,
   value,
   getValue,
   onChange,
   margin = 'normal',
   InputLabelProps,
   InputProps,
   label,
   fullWidth = true,
   isFormattedNumber,
   variant = 'outlined',
   size = 'small',
   labelTemplate,
   classes: classesProp,
   internalKey,
   placeholder,
   layout,
   scale,
   ...textFieldProps
}) {
   const classes = {...classesProp};
   const useLabelKey = labelTemplate?.format({name}) || labelKey;
   const currentLabel = useMessage(useLabelKey, label);
   const currentPlaceholder = useMessage(placeholderKey) || placeholder;
   const helpText = useMessage(helpKey, helperText) || helperText;

   const useInputProps = {
      ...InputProps,
   };

   if (isFormattedNumber) {
      if (get(InputProps, 'inputComponent') || get(InputProps, 'inputProps.component')) {
         console.log('isFormattedNumber cannot have a different input component.', InputProps);
      }
      useInputProps.inputComponent = CustomInputTextField;
      useInputProps.inputProps = {
         ...get(InputProps, 'inputProps', {}),
         ...(textFieldProps.inputProps || {}),
         component: NumberFormatCustom,
      };
   }

   const textField = (
      <StyledEngineProvider injectFirst>
         <ThemeProvider theme={theme} scale={scale}>
            <TextField
               {...textFieldProps}
               key={'internal' + internalKey}
               name={name}
               className={`${classes.textFieldStyle} ${className}`}
               label={currentLabel}
               placeholder={currentPlaceholder}
               helperText={helpText}
               defaultValue={defaultValue}
               value={getValue ? getValue(name) : value}
               onChange={onChange}
               InputProps={useInputProps}
               InputLabelProps={{
                  ...InputLabelProps,
                  shrink: true,
               }}
               variant={variant}
               size={size}
               margin={margin}
               fullWidth={fullWidth}
            />
         </ThemeProvider>
      </StyledEngineProvider>
   );

   if (layout) {
      return <Grid {...layout}>{textField}</Grid>;
   } else {
      return textField;
   }
}
