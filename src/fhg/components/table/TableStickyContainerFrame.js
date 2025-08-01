import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {BORDER_RADIUS_16} from '../../../Constants';
import Typography from '../Typography';
import './TableBasicContainerFrame.css';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         borderRadius: BORDER_RADIUS_16,
         background: theme.palette.background.paper3,
         border: `1px solid ${theme.palette.primary.stroke3}`,
      },
      titleStyle: {
         position: 'sticky',
         paddingTop: theme.spacing(2),
         top: 28,
         left: 24,
         zIndex: 1299,
         alignItems: 'center',
      },
   }),
   {name: 'TableStickyContainerFrameStyle'},
);

export default function TableStickyContainerFrame({
   title,
   titleKey,
   titleHeader,
   stickyTitle = false,
   top = 0,
   left = 0,
   contentStyle = {},
   children,
   header,
   headerStyle = {},
   titleStyle = {},
   isDisabledSpacer = false,
   ...props
}) {
   const theme = useTheme();
   const classes = useStyles();

   return (
      <Stack
         name={'stickyContainerFrameOuter'}
         {...props}
         padding={0}
         mb={3}
         flexDirection={'row'}
         className={classes.root}
         bgcolor={'background.default'}
      >
         {/* Box on the left to provide rounded corners by sticky position. */}
         <Box
            name={'left box back'}
            height={'auto'}
            position='sticky'
            left={0}
            width={18}
            bgcolor={'background.default'}
            zIndex={theme.zIndex.drawer - 1}
            sx={{
               borderTopLeftRadius: BORDER_RADIUS_16,
               borderBottomLeftRadius: BORDER_RADIUS_16,
            }}
         >
            <Box
               name={'left box front with border'}
               height={'100%'}
               width={'100%'}
               // mb={-2}
               bgcolor={'background.paper3'}
               sx={{
                  borderTopLeftRadius: BORDER_RADIUS_16,
                  borderBottomLeftRadius: BORDER_RADIUS_16,
               }}
            />
         </Box>
         <Stack
            name={'TitleAndContentFrame'}
            {...props}
            padding={0}
            flexDirection={'column'}
            bgcolor={'background.default'}
            sx={{
               borderTopLeftRadius: BORDER_RADIUS_16,
               borderTopRightRadius: BORDER_RADIUS_16,
            }}
         >
            <Box
               display={'flex'}
               flex={'1 1'}
               position={'sticky'}
               padding={1}
               left={left}
               top={top}
               width={'100%'}
               zIndex={theme.zIndex.drawer}
               sx={headerStyle}
               bgcolor={'background.paper3'}
            >
               {(titleKey || title || titleHeader) && (
                  <Box
                     pr={4}
                     pl={1}
                     paddingY={2}
                     display={'flex'}
                     flexDirection={'row'}
                     bgcolor={'background.paper3'}
                     className={`${classes.titleStyle} ${stickyTitle ? 'sticky' : ''}`}
                     sx={titleStyle}
                  >
                     {(titleKey || title) && (
                        <Typography
                           variant='h5'
                           id={titleKey}
                           sx={{flex: '0 0 auto', fontWeight: '600', color: 'text.primary'}}
                        >
                           {title}
                        </Typography>
                     )}
                     {titleHeader}
                  </Box>
               )}
               {header}
            </Box>
            {children}
            {!isDisabledSpacer && (
               <Box
                  name='Spacer for border at bottom of children'
                  height={18}
                  bgcolor={'background.paper3'}
                  width={'100%'}
               />
            )}
         </Stack>
         {/* Box on the right to provide rounded corners by sticky position. */}
         <Box
            name={'right box back'}
            height={'auto'}
            position='sticky'
            right={0}
            width={18}
            bgcolor={'background.default'}
            zIndex={theme.zIndex.drawer - 1}
         >
            <Box
               name={'right box front with border'}
               height={'100%'}
               width={'100%'}
               bgcolor={'background.paper3'}
               sx={{
                  borderTopRightRadius: BORDER_RADIUS_16,
                  borderBottomRightRadius: BORDER_RADIUS_16,
               }}
            />
         </Box>
      </Stack>
   );
}
