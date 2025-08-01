import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import Typography from '../Typography';
import {BORDER_RADIUS_16} from '../../../Constants';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         borderRadius: BORDER_RADIUS_16,
         background: theme.palette.background.paper3,
         border: `1px solid ${theme.palette.primary.stroke3}`,
      },
   }),
   {name: 'TableContainerFrameStyle'},
);

export default function TableContainerFrame({
   title,
   titleKey,
   titleKey1,
   titleHeader,
   stickyTitle = false,
   top = 0,
   titleStyle = {},
   contentStyle = {},
   children,
   header,
   ...props
}) {
   const theme = useTheme();
   const classes = useStyles();

   return (
      <Box
         {...props}
         className={classes.root}
         padding={3}
         paddingTop={0}
         display={'flex'}
         flexDirection={'column'}
         backgroundColor={theme.palette.background.paper}
         borderRadius={BORDER_RADIUS_16}
      >
         <Box
            display={'flex'}
            flex={'1 1'}
            position={'sticky'}
            left={24}
            top={top}
            width={'100%'}
            zIndex={1200}
            backgroundColor={theme.palette.background.paper3}
         >
            {(titleKey || title || titleHeader) && (
               <Box
                  display={'flex'}
                  flexDirection={'row'}
                  gap={3}
                  width={'100%'}
                  className={`${theme.palette.background.paper3} ${stickyTitle ? 'sticky' : ''}`}
                  paddingY={3}
               >
                  <Box className={titleStyle}>
                     {(titleKey || title) && (
                        <Typography
                           variant='h5'
                           id={titleKey}
                           sx={{flex: '0 0 auto', fontWeight: '600', color: 'text.primary'}}
                        >
                           {title}
                        </Typography>
                     )}
                  </Box>
                  <Box className={titleStyle}>
                     {titleKey1 && (
                        <Typography
                           variant='h5'
                           id={titleKey1}
                           sx={{flex: '0 0 auto', fontWeight: '600', color: 'text.primary'}}
                        />
                     )}
                  </Box>
               </Box>
            )}
            {header}
         </Box>
         <Box flex={'1 1'} style={{...contentStyle}}>
            {children}
         </Box>
      </Box>
   );
}
