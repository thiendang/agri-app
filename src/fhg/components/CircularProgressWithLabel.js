import makeStyles from '@mui/styles/makeStyles';
import * as React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const useStyles = makeStyles(
   (theme) => ({
      progressStyle: {
         zIndex: 5000,
      },
   }),
   {name: 'CircularProgressWithLabelStyles'}
);

export default function CircularProgressWithLabel({value, ...props}) {
   const classes = useStyles();
   return (
      <Box sx={{position: 'relative', display: 'inline-flex'}} alignItems={'center'} justifyContent={'center'}>
         <CircularProgress
            variant='determinate'
            className={classes.progressStyle}
            size={25}
            thickness={3}
            value={value}
            {...props}
         />
         <Box
            sx={{
               top: 0,
               left: 0,
               bottom: 0,
               right: 0,
               position: 'absolute',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
            }}
         >
            <Typography variant='caption' component='div' color='text.secondary'>
               {`${Math.round(value)}%`}
            </Typography>
         </Box>
      </Box>
   );
}

CircularProgressWithLabel.propTypes = {
   /**
    * The value of the progress indicator for the determinate variant.
    * Value between 0 and 100.
    * @default 0
    */
   value: PropTypes.number.isRequired,
};
