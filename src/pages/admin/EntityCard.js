import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {SCALE_APP} from '../../Constants';
import Grid from '../../fhg/components/Grid';
import Typography from '../../fhg/components/Typography';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         width: 300 * SCALE_APP,
      },
      dividerStyle: {
         marginBottom: theme.spacing(0.5),
         marginTop: theme.spacing(0.5),
      },
      subtitleStyle: {
         position: 'sticky',
         top: 0,
         backgroundColor: 'inherit',
         color: theme.palette.text.primary,
         fontSize: 14 * SCALE_APP,
         fontWeight: '700',
      },
      listItemStyle: {
         color: theme.palette.text.primary,
         fontSize: 14 * SCALE_APP,
      },
   }),
   {name: 'EntityCardStyles'},
);

export default function EntityCard({item}) {
   const classes = useStyles();
   const theme = useTheme();

   return (
      // <Grid item fullHeight style={{display: 'flex', flexDirection: 'column', height: 'fit-content'}}>
      <Grid item fullHeight style={{display: 'flex', flexDirection: 'column'}} overflow={'auto'}>
         {item?.description && (
            <>
               <Typography
                  id={'entity.description.label'}
                  className={classes.subtitleStyle}
                  style={{marginRight: theme.spacing(1)}}
               />
               <Typography className={classes.listItemStyle}>{item?.description}</Typography>
            </>
         )}
         {item?.ein && (
            <Box
               display={'flex'}
               flexDirection={'row'}
               alignItems='center'
               mb={1}
               style={{backgroundColor: 'inherit', position: 'sticky', top: 0}}
            >
               <Typography
                  id={'entity.ein.label'}
                  className={classes.subtitleStyle}
                  style={{marginRight: theme.spacing(1)}}
               />
               <Typography className={classes.listItemStyle}>{item?.ein}</Typography>
            </Box>
         )}
      </Grid>
   );
}
