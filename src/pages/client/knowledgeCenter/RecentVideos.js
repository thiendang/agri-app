import {Box, Card} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React, {useState} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import {RecentVideo} from './RecentVideo';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         display: 'flex',
         flexDirection: 'column',
         width: '100%',
      },
      title: {
         color: theme.palette.text.black,
      },
      list: {
         display: 'flex',
         flexDirection: 'row',
         overflow: 'auto',
      },
   };
});
/**
 * List recent video component
 *
 * @returns {JSX.Element}
 */
export const RecentVideos = () => {
   const classes = useStyles();
   const [list, setList] = useState([1, 2, 3, 4, 5, 6]);
   return (
      <Box>
         <Box>
            <TypographyFHG id='knowledgeCenter.recentVideos' variant='fs28700' className={classes.title} />
         </Box>
         <Card className={classes.container}>
            <Box className={classes.list}>
               {list.map((item) => (
                  <RecentVideo key={item} />
               ))}
            </Box>
         </Card>
      </Box>
   );
};
