import {Box, Card} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {makeStyles} from '@mui/styles';
import React from 'react';
import {COURSE_WIDTH} from '../../../Constants';
import {COURSE_HEIGHT} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';
import {FILE_BUCKET} from '../../../Constants';
import {NEW_EDIT} from '../../../Constants';
import {EDIT_PATH} from '../../../Constants';
import TypographyFHG from '../../../fhg/components/Typography';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         width: '100%',
         height: '100%',
         border: `1px ${theme.palette.text.green} solid`,
         borderRadius: BORDER_RADIUS_10,
      },
      icon: {
         width: 24,
         height: 24,
         marginRight: 12,
      },
      center: {
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         width: '100%',
         height: '100%',
      },
      cardStyle: {
         borderRadius: BORDER_RADIUS_10,
         width: COURSE_WIDTH,
         height: COURSE_HEIGHT,
         maxWidth: COURSE_WIDTH + 60,
         minWidth: COURSE_WIDTH,

         cursor: 'pointer',
         '& .MuiPaper-root': {
            borderRadius: `${BORDER_RADIUS_10}px !important`,
         },
      },
   };
});

export const S3_URL = `https://${FILE_BUCKET}.s3.amazonaws.com/`;
export function makeid(length) {
   let result = '';
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const charactersLength = characters.length;
   for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/**
 * Component add new course
 *
 * @returns {JSX.Element}
 * @constructor
 */
export const AddNewCourse = ({orderIndex}) => {
   const classes = useStyles();
   const navigate = useNavigateSearch();

   const handleOpen = () => {
      navigate(EDIT_PATH, undefined, {courseId: NEW_EDIT, orderIndex});
   };

   return (
      <Grid xs={12} sm={6} md={4} sx={{flex: '1 1'}} minHeight={429}>
         <Card className={classes.cardStyle}>
            <Box className={classes.container}>
               <Box className={classes.center} onClick={handleOpen}>
                  <img src='/images/plus.png' alt='add course' className={classes.icon} />
                  <TypographyFHG id='knowledgeCenter.addNewCourse' color='text.green' variant='fs18700' />
               </Box>
            </Box>
         </Card>
      </Grid>
   );
};
