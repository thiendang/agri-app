import {Stack} from '@mui/material';
import React from 'react';
import {useMatch} from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import Header from '../../../components/Header';
import {KNOWLEDGE_LIBRARY_FULL_PATH} from '../../../Constants';
import {COURSE_PATH} from '../../../Constants';
import {userRoleState} from '../../Main';
import {MyCourses} from './MyCourses';

/**
 * Knowledge Center Dashboard
 *
 * @returns {JSX.Element}
 */
export const KnowledgeCenter = () => {
   const {isSuperAdmin, isClientSignup} = useRecoilValue(userRoleState);
   const courseRouteMatch = useMatch({
      path: `/${KNOWLEDGE_LIBRARY_FULL_PATH}/${COURSE_PATH}`,
      end: false,
      caseSensitive: true,
   });

   return (
      <Stack
         name={'knowledge center sheet root'}
         className={'knowledgeCenter'}
         width={'100%'}
         height={'100%'}
         flexDirection={'column'}
         overflow={'hidden'}
         sx={{p: 0.5}}
      >
         <Outlet />
         {!courseRouteMatch && (
            <Stack height={'100%'} width={'100%'} overflow={'hidden'}>
               <Header idTitle='knowledgeCenter.title' />
               <MyCourses />
            </Stack>
         )}
      </Stack>
   );
};
