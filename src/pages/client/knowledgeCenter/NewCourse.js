import {Box, Grid, Stack} from '@mui/material';
import React from 'react';
import Header from '../../../components/Header';
import {makeStyles} from '@mui/styles';
import TypographyFHG from '../../../fhg/components/Typography';
import {AddModule} from './AddModule';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useIntl} from 'react-intl';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         padding: '4px',
      },
      buttonBack: {
         display: 'flex',
         alignItems: 'center',
      },
      backIcon: {
         width: 24,
         height: 20,
      },
   };
});
/**
 * New course component
 *
 * @returns {JSX.Element}
 */
export const NewCourse = () => {
   const classes = useStyles();
   const intl = useIntl();
   return (
      <Stack
         name={'knowledge center sheet root'}
         width={'100%'}
         height={'100%'}
         display={'flex'}
         flexDirection={'column'}
         overflow={'auto'}
         className={classes.container}
      >
         <Box sx={{flexGrow: 1}}>
            <Grid container spacing={2}>
               <Grid item xs={4}>
                  <Box className={classes.buttonBack}>
                     <img src='/images/ic-back.png' alt='back' className={classes.backIcon} />
                     <Box width={12} />
                     <TypographyFHG variant='fs16700' color='text.green'>
                        {formatMessage(intl, 'knowledgeCenter.backToKnowledge')}
                     </TypographyFHG>
                  </Box>
                  <Box height={30} />
                  <Header idTitle='knowledgeCenter.title' />
                  <AddModule />
               </Grid>
               <Grid item xs={8}>
                  <Box>xs=8</Box>
               </Grid>
            </Grid>
         </Box>
      </Stack>
   );
};
