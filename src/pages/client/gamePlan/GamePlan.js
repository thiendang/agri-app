import {Stack} from '@mui/material';
import ScrollStack from '../../../fhg/ScrollStack';
import Header from './Header';
import TabBar from './TabBar';
import {lazy, Suspense, useCallback, useEffect, useState} from 'react';
import Loading from '../../../fhg/components/Loading';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {useLoadUser} from './hooks/useLoadUsers';
import {useSetRecoilState} from 'recoil';
import {entityState} from '../../admin/EntityListDropDown';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import Empty from '../../../components/Empty';

const Vision = lazy(() => import('./Vision'));
const Goals = lazy(() => import('./Goals'));
const Targets = lazy(() => import('./Targets'));
const WeeklyTeamMeeting = lazy(() => import('./WeeklyTeamMeeting'));
const DailyTeamToDos = lazy(() => import('./DailyTeamToDos'));

function TabPanel(props) {
   const {children, value, index, ...other} = props;
   return (
      <div
         role='tabpanel'
         hidden={value !== index}
         id={`simple-tabpanel-${index}`}
         aria-labelledby={`simple-tab-${index}`}
         {...other}
      >
         <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
   );
}

export default function GamePlan() {
   usePageTitle({titleKey: 'gamePlan.title'});
   const [currentTab, setCurrentTab] = useState(0);

   const setEntityStatus = useSetRecoilState(entityState);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   useLoadUser();

   const handleChangeTab = useCallback((tab) => {
      setCurrentTab(tab);
   }, []);

   const [{entityId, clientId}] = useCustomSearchParams();

   return (
      <Stack flexDirection={'column'} overflow='hidden' width={'100%'} height={'100%'} display={'flex'}>
         <Header />
         {!clientId || typeof entityId === 'undefined' ? (
            <Empty
               titleMessageKey={'empty.noInfo.message'}
               messageKey={
                  !clientId
                     ? typeof entityId === 'undefined'
                        ? 'empty.selectClientAndEntity.message'
                        : 'empty.selectClient.message'
                     : typeof entityId === 'undefined'
                     ? 'empty.selectEntity.message'
                     : undefined
               }
               sx={{mt: 4}}
            />
         ) : (
            <>
               <TabBar onChangeTab={handleChangeTab} />
               <ScrollStack height={'100%'} width={'100%'} innerStackProps={{sx: {pb: 2}}}>
                  <TabPanel value={currentTab} index={0}>
                     <Vision />
                  </TabPanel>
                  <TabPanel value={currentTab} index={1}>
                     <Goals />
                  </TabPanel>
                  <TabPanel value={currentTab} index={2}>
                     <Targets />
                  </TabPanel>
                  <TabPanel value={currentTab} index={3}>
                     <WeeklyTeamMeeting />
                  </TabPanel>
                  <TabPanel value={currentTab} index={4}>
                     <DailyTeamToDos />
                  </TabPanel>
               </ScrollStack>
            </>
         )}
      </Stack>
   );
}
