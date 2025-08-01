import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import * as PropTypes from 'prop-types';
import React, {useState} from 'react';
import TypographyFHG from './Typography';

CheckboxFHG.propTypes = {
   name: PropTypes.string.isRequired,
   checked: PropTypes.bool,
   labelKey: PropTypes.string,
   defaultChecked: PropTypes.bool,
   onChange: PropTypes.func,
   label: PropTypes.string,
   ...Checkbox.propTypes,
};

/**
 * The Checkbox with preset formats.
 */
export default function CheckboxFHG({
   name,
   checked,
   labelKey,
   defaultChecked,
   onChange,
   label,
   classes: classesProp = {},
   fullWidth,
   marginTop,
   marginLeft,
   marginRight,
   labelPlacement,
   labelStyle,
   ...checkboxProps
}) {
   const classes = classesProp;

   const [isSet, setIsSet] = useState(checked !== undefined && checked !== null);

   const handleChange = (event) => {
      setIsSet(true);
      onChange && onChange(event);
   };

   return (
      <FormControlLabel
         className={classes.checkboxStyle}
         sx={{
            ml: marginLeft !== undefined ? marginLeft : -1,
            mr: marginRight !== undefined ? marginRight : undefined,
            mt: marginTop !== undefined ? marginTop : 2,
            width: fullWidth ? '100%' : undefined,
         }}
         control={
            <Checkbox
               name={name}
               checked={isSet ? checked : defaultChecked || false}
               onChange={handleChange}
               {...checkboxProps}
            />
         }
         label={
            <TypographyFHG id={labelKey} color='text.primary' style={labelStyle}>
               {label}
            </TypographyFHG>
         }
         labelPlacement={labelPlacement}
      />
   );
}
