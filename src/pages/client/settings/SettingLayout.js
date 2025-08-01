import Box from '@mui/material/Box';
import React from 'react';
import {Outlet} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {useRecoilValue} from 'recoil';
import useWidthRule from '../../../fhg/hooks/useWidthRule';
import {darkModeAtom} from './Appearance';
import SettingNavigation from './SettingNavigation';
import '../../../pages/admin/ReactSplitPane.css';

export default function SettingLayout({props}) {
   const isSmallWidth = useWidthRule('down', 'md');
   const darkMode = useRecoilValue(darkModeAtom);

   return (
      <SplitPane
         split={'vertical'}
         className={darkMode ? 'dark-mode' : ''}
         maxSize={240}
         minSize={130}
         defaultSize={isSmallWidth ? 150 : 210}
         pane1Style={{overflow: 'hidden'}}
         pane2Style={{overflow: 'hidden', height: 'calc(100% - 12px)'}}
      >
         <Box p={2}>
            <SettingNavigation />
         </Box>
         <Box p={4} height={'100%'} width={'100%'} overflow={'hidden'} name={'settingLayoutPane2'}>
            <Outlet />
         </Box>
      </SplitPane>
   );
}
