import {Menu} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import React from 'react';
import {useRecoilState} from 'recoil';
import {drawerIsOpenStatus} from '../fhg/components/ResponsiveMobileDrawer';

export const DrawerMenuButton = () => {
   const [isDrawerOpen, setIsDrawerOpen] = useRecoilState(drawerIsOpenStatus);

   const handleMenuClick = () => {
      setIsDrawerOpen(!isDrawerOpen);
   };
   return (
      <>
         {!isDrawerOpen && (
            <IconButton edge='start' size='small' color='primary' onClick={handleMenuClick} sx={{zIndex: 1102, mr: 2}}>
               <Menu />
            </IconButton>
         )}
      </>
   );
};
