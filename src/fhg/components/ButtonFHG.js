// eslint-disable-next-line
import Button, {ButtonProps} from '@mui/material/Button';
import * as PropTypes from 'prop-types';
import React from 'react';
import TypographyFHG from './Typography';

/**
 *
 * @param labelKey {string}
 * @param buttonProps {ButtonProps}
 * @return {JSX.Element}
 * @constructor
 */
const ButtonFHG = React.forwardRef(function ButtonFHG({labelKey, typographyProps, ...buttonProps}, ref) {
   return (
      <Button {...buttonProps} ref={ref}>
         <TypographyFHG variant={'inherit'} {...typographyProps} id={labelKey} />
      </Button>
   );
});
ButtonFHG.propTypes = {
   labelKey: PropTypes.string,
};

export default ButtonFHG;
