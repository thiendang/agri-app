import {Button} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import TypographyFHG from '../../../fhg/components/Typography';

const useStyles = makeStyles((theme) => ({
   saveButton: {
      borderRadius: BORDER_RADIUS_10,
      width: 200 * SCALE_APP,
      backgroundColor: theme.palette.primary.main,
      height: 45 * SCALE_APP,
   },
}));

const FillButton = ({label, onClick, style, ...props}) => {
   const classes = useStyles();
   return (
      <Button
         variant='contained'
         className={`${classes.saveButton} ${style}`}
         color='primary'
         onClick={onClick}
         {...props}
      >
         <TypographyFHG variant='fs14700' color='text.white' id={label} />
      </Button>
   );
};

export default FillButton;
