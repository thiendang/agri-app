import {Box, Switch} from '@mui/material';
import React from 'react';
import {DrawerMenuButton} from '../../../components/DrawerMenuButton';
import TypographyFHG from '../../../fhg/components/Typography';
import {atom, useRecoilState} from 'recoil';

export const darkModeAtom = atom({
   key: 'darkMode',
   default: localStorage.getItem('darkMode') === 'true',
});

const Appearance = () => {
   const [darkMode, setDarkMode] = useRecoilState(darkModeAtom);

   return (
      <Box>
         <DrawerMenuButton />
         <TypographyFHG
            id='appearance.title'
            className='title-page'
            variant='h4'
            color='text.primary'
            component={'span'}
            style={{
               fontWeight: 'bold',
            }}
         />
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               marginTop: 4,
            }}
         >
            <TypographyFHG
               id='dark.mode'
               variant='label'
               color='text.primary'
               style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
               }}
            />
            <Switch
               checked={darkMode}
               onChange={async (event) => {
                  setDarkMode(event.target.checked);
                  localStorage.setItem('darkMode', event.target.checked);
               }}
            />
         </Box>
      </Box>
   );
};

export default Appearance;
