import React from 'react';
import {SCALE_APP} from '../Constants';
import TypographyFHG from '../fhg/components/Typography';
import VideoHelpButton from '../fhg/components/VideoHelpButton';
import {Box, Stack} from '@mui/material';
import {DrawerMenuButton} from './DrawerMenuButton';

/**
 * Component to display the Header for each page.
 * @param idTitle The local key for the title.
 * @param videoId The id of the video help file.
 * @param values The values for the message.
 * @param children Children components.
 * @param props other props are passed to the outer stack.
 * @return {JSX.Element}
 * @constructor
 */
const Header = ({
   idTitle,
   videoId = null,
   values,
   children,
   title,
   boxProps = {},
   showDrawerMenuButton = true,
   titleExtra = null,
   ...props
}) => {
   return (
      <Stack
         name='TitleFrame'
         className='title-page-margin'
         spacing={3}
         direction={'row'}
         alignItems={'center'}
         flex={'0 0'}
         {...props}
      >
         <Box display='flex' alignItems='center'>
            {showDrawerMenuButton && <DrawerMenuButton />}
            <TypographyFHG
               className='title-page'
               variant='h4'
               component={'span'}
               id={idTitle}
               values={values}
               color='text.primary'
               style={{
                  fontWeight: 'bold',
               }}
               {...boxProps}
            >
               {title}
            </TypographyFHG>
            {titleExtra}
            <Box width={videoId ? 32 * SCALE_APP : 0} />
            <VideoHelpButton videoId={videoId} />
         </Box>
         {children}
      </Stack>
   );
};

export default Header;
