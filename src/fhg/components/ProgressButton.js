// eslint-disable-next-line
import {LoadingButton} from '@mui/lab';
import Button, {ButtonProps} from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from './Typography';

/**
 * Button Component to show progress.
 *
 * Reviewed:
 *
 * @param isProgress
 * @param labelKey
 * @param isSpinnerDark Indicates if the spinner should be dark.
 * @param children
 * @param typographyProps
 * @param buttonProperties {ButtonProps}
 * @return {JSX.Element}
 * @constructor
 */
const ProgressButton = React.forwardRef(function ProgressButton(
   {isProgress = false, labelKey, children, color, typographyProps, ...buttonProperties},
   ref
) {
   return (
      <LoadingButton {...buttonProperties} sx={{color, ...(buttonProperties?.sx || {})}} ref={ref} loading={isProgress}>
         {labelKey && <Typography variant={'inherit'} id={labelKey} {...typographyProps} />}
         {children}
      </LoadingButton>
   );
});

ProgressButton.propTypes = {
   isProgress: PropTypes.bool.isRequired, //Indicates if the progress should be showing.
   labelKey: PropTypes.string, // Localization key for the button label.
   typographyProps: PropTypes.any, // The properties for the typography component.
   ...Button.propTypes,
};

export default ProgressButton;
