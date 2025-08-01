import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {SCALE_APP} from '../Constants';
import {Box} from '@mui/material';
import TypographyFHG from '../fhg/components/Typography';

const useStyles = makeStyles((theme) => ({
   parentStyle: {
      width: '90%',
      backgroundColor: '#d8d8d8',
      borderRadius: 40 * SCALE_APP,
      marginLeft: theme.spacing(2),
      clear: 'both',
   },
   parentStyle2: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      height: '12px',
      borderRadius: 40 * SCALE_APP,
   },
   childStyle: {
      height: '100%',
      borderRadius: 40 * SCALE_APP,
      textAlign: 'right',
      padding: theme.spacing(0.5, 0),
   },
   childStyle2: {
      height: '12px',
      marginRight: theme.spacing(2),
      width: '100%',
      backgroundColor: '#DDE9CD',
      borderRadius: 40 * SCALE_APP,
      textAlign: 'right',
   },
   progressTextStyle: {
      padding: theme.spacing(1),
      color: 'black',
      fontWeight: 400,
      whiteSpace: 'nowrap',
   },
}));

/**
 * Progress bar component.
 * @param bgcolor
 * @param progress
 * @param type
 * @param props
 * @return {React.JSX.Element|null}
 * @constructor
 */
const ProgressBar = ({bgcolor, progress, type = 2, ...props}) => {
   const classes = useStyles();

   if (progress !== undefined) {
      if (type === 2)
         return (
            <Box className={classes.parentStyle2} {...props}>
               <div className={classes.childStyle2}>
                  <Box className={classes.childStyle} width={`${progress * 100}%`} backgroundColor={bgcolor} />
               </div>
               <TypographyFHG variant={'fs14400'} id={'knowledgeCenter.courseProgress.label'} values={{progress}} />
            </Box>
         );

      return (
         <Box className={classes.parentStyle} {...props}>
            <Box className={classes.childStyle} width={`${progress * 100}%`} backgroundColor={bgcolor}>
               <TypographyFHG variant={'fs14400'} id={'knowledgeCenter.courseProgress.label'} values={{progress}} />
            </Box>
         </Box>
      );
   } else {
      return null;
   }
};

export default ProgressBar;
