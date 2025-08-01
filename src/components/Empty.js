import {Stack} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {NETWORKING_IMG} from '../Constants';
import {GEARS_IMG} from '../Constants';
import TypographyFHG from '../fhg/components/Typography';
import {useTheme} from '@mui/styles';

const useStyles = makeStyles(() => ({}), {name: 'EmptyStyles'});

Empty.propTypes = {};

export default function Empty({
   open = true,
   titleMessageKey = 'empty.noInfo.message',
   messageKey,
   messageValues,
   innerImage = NETWORKING_IMG,
   height = '100%',
   imageScale,
   children,
   ...stackProps
}) {
   const classes = useStyles();

   const theme = useTheme();

   if (open) {
      return (
         <Stack
            width={'100%'}
            height={height}
            display={'flex'}
            direction={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            position={'relative'}
            {...stackProps}
         >
            <Stack
               justifyContent={'center'}
               alignItems={'center'}
               sx={{mb: imageScale ? (4 * imageScale) / 100 : 4}}
               style={{transform: `scale(${imageScale}%)`}}
            >
               <img alt='' src={GEARS_IMG} />
               <img alt='' src={innerImage} style={{position: 'absolute'}} />
            </Stack>
            <Stack direction={'column'} alignItems={'center'}>
               <TypographyFHG variant={'h5'} id={titleMessageKey} style={{fontWeight: 700}} sx={{mb: 2}} />
               {messageKey && (
                  <TypographyFHG color='text.primary' variant={'subtitle1'} id={messageKey} values={messageValues} />
               )}
            </Stack>
            {children}
         </Stack>
      );
   }
   return null;
}
