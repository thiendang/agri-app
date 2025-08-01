import {Box, Card} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React from 'react';
import TypographyFHG from '../../../fhg/components/Typography';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         padding: '28px',
      },
      icon: {
         width: 24,
         height: 24,
      },
   };
});
/**
 * Component add module
 *
 * @returns {JSX.Element}
 * @constructor
 */
export const AddModule = () => {
   const classes = useStyles();
   return (
      <Card className={classes.container}>
         <Box display='flex'>
            <TypographyFHG id='knowledgeCenter.modules' variant='fs28700' color='text.black' />
            <Box width={30} />
            <Box display='flex' alignItems='center'>
               <img src='/images/plus.png' alt='add' className={classes.icon} />
               <Box width={4} />
               <TypographyFHG id='knowledgeCenter.addModules' variant='fs16700' color='text.green' />
            </Box>
         </Box>
      </Card>
   );
};
