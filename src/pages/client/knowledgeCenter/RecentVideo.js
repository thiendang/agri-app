import {Box} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         marginRight: 24,
         marginTop: '28px',
         marginLeft: '28px',
         paddingBottom: '28px',
      },
      video: {
         width: 220,
         height: 165,
         borderRadius: 10,
         backgroundColor: theme.palette.primary.green,
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
      },
      title: {
         color: theme.palette.text.black,
      },
   };
});
/**
 * Recent video component
 *
 * @returns {JSX.Element}
 */
export const RecentVideo = () => {
   const classes = useStyles();
   const intl = useIntl();
   return (
      <Box className={classes.container}>
         <Box className={classes.video}>
            <img
               src='/images/play-rounded.png'
               alt='play'
               style={{
                  width: 91,
                  height: 91,
               }}
            />
         </Box>
         <TypographyFHG variant='fs14700' color='text.black'>
            {formatMessage(intl, 'knowledgeCenter.recentVideo')}
         </TypographyFHG>
      </Box>
   );
};
