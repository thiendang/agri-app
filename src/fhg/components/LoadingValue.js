import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles(
   (theme) => ({
      progressStyle: {
         zIndex: theme.zIndex.mobileStepper - 1,
      },
   }),
   {name: 'loadingStyles'},
);

/**
 * Component to show the error messages and loading spinner.
 *
 * Note:
 *    Message is the default property in values.
 */
function LoadingValue({
   isLoading = true,
   showChildrenOnLoad = false,
   children,
   classes: classesProp = {},
   ...progressProps
}) {
   const classes = useStyles();

   if (!showChildrenOnLoad) {
      if (isLoading) {
         return <CircularProgress className={classes.progressStyle} size={15} thickness={2.5} {...progressProps} />;
      } else {
         return children;
      }
   } else {
      return (
         <Box
            name={'Progress frame'}
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            overflow={'hidden'}
            width={'100%'}
         >
            {children}
            {isLoading && (
               <CircularProgress className={classes.progressStyle} size={15} thickness={2.5} {...progressProps} />
            )}
         </Box>
      );
   }
}

LoadingValue.propTypes = {
   isLoading: PropTypes.bool, // Indicates if the data is still loading.
};

export default LoadingValue;
