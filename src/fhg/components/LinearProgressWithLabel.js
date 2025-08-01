import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LinearProgressWithLabel(props) {
   return (
      <Box display='flex' alignItems='center'>
         <Box width='100%' mr={1} style={{width: 100 * SCALE_APP}}>
            <LinearProgress variant='determinate' {...props} />
         </Box>
         <Box minWidth={35}>
            <Typography variant='body2' color='textSecondary'>{`${Math.round(props.value)}%`}</Typography>
         </Box>
      </Box>
   );
}
LinearProgressWithLabel.propTypes = {
   /**
    * The value of the progress indicator for the determinate variant.
    * Value between 0 and 100.
    */
   value: PropTypes.number.isRequired,
};
