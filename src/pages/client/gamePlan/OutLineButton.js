import {Button} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import TypographyFHG from '../../../fhg/components/Typography';

const useStyles = makeStyles((theme) => ({
   cancelButton: {
      border: `2px solid ${theme.palette.primary.main}`,
      borderRadius: BORDER_RADIUS_10,
      width: 200 * SCALE_APP,
      height: 45 * SCALE_APP,
   },
}));

const OutLineButton = ({label, onClick, style, ...props}) => {
   const classes = useStyles();
   return (
      <Button
         variant='outlined'
         className={`${classes.cancelButton} ${style}`}
         color='primary'
         onClick={onClick}
         {...props}
      >
         <TypographyFHG variant='fs14700' color='primary' id={label} />
      </Button>
   );
};

export default OutLineButton;
