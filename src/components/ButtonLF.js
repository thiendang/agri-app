import makeStyles from '@mui/styles/makeStyles';
import {forwardRef} from 'react';
import React from 'react';
import ButtonFHG from '../fhg/components/ButtonFHG';

const useStyles = makeStyles(
   () => ({
      buttonStyle: {
         textDecoration: 'underline',
         '&:hover': {
            textDecoration: 'underline',
         },
      },
   }),
   {name: 'ButtonLFStyles'},
);

const ButtonLF = forwardRef(function ButtonLF({labelKey, children, ...buttonProps}, ref) {
   const classes = useStyles();

   return (
      <ButtonFHG
         ref={ref}
         labelKey={labelKey}
         color='primary'
         size='large'
         className={classes.buttonStyle}
         {...buttonProps}
      />
   );
});

export default ButtonLF;
