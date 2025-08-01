import {Stack} from '@mui/material';
import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {SCALE_APP} from '../Constants';
import TypographyFHG from '../fhg/components/Typography';

const useStyles = makeStyles(
   (theme) => ({
      cardStyle: {
         height: 'max-content',
         padding: theme.spacing(1),
         transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),
         '@media (max-height: 600px)': {
            height: 100,
         },
      },
      titleStyle: {
         fontSize: 18 * SCALE_APP,
         fontWeight: 600,
         color: theme.palette.text.primary,
         marginBottom: theme.spacing(2),
      },
   }),
   {name: 'HeaderPanelStyles'},
);

HeaderPanel.propTypes = {};

export default function HeaderPanel({
   titleKey,
   title,
   maxWidth = 372,
   minWidth = 240,
   height = 'auto',
   dense = false,
   variant = undefined,
   children,
   ...props
}) {
   const classes = useStyles();

   return (
      <Card
         className={classes.cardStyle}
         sx={{maxWidth, minWidth, width: '100%', height}}
         overflow={'hidden'}
         square={false}
         {...props}
      >
         <CardContent
            sx={{
               height: '100%',
               py: dense ? 2 : 4,
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
               alignContent: 'center',
            }}
         >
            {/*<Header>*/}
            <TypographyFHG id={titleKey} className={classes.titleStyle} variant={variant}>
               {title}
            </TypographyFHG>
            <Stack direction={'row'} justifyContent={'space-between'} height={'fit-content'} flexWrap={'wrap'}>
               {children}
            </Stack>
            {/*</Header>*/}
         </CardContent>
      </Card>
   );
}
