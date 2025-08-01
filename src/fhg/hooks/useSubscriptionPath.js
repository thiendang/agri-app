import {useRecoilState} from 'recoil';
import {atom} from 'recoil';
import {POLL_INTERVAL_DURATION} from '../../Constants';
import {PATH_READ_SUBSCRIPTION} from '../../data/QueriesGL';
import {useEffect} from 'react';
import {useCustomSearchParams} from './useCustomSearchParams';
import {useSubscription} from '@apollo/client';
import {useLocation} from 'react-router-dom';

export const pollState = atom({
   key: 'pollState',
   default: 0,
});

export const useSubscriptionPath = () => {
   const [{clientId}] = useCustomSearchParams();
   const [pollInterval, setPollInterval] = useRecoilState(pollState);

   const location = useLocation();
   const {data: dataPath} = useSubscription(PATH_READ_SUBSCRIPTION, {
      variables: {clientId},
      shouldResubscribe: true,
   });

   useEffect(() => {
      if (dataPath) {
         const data = dataPath?.establishViewSync;
         const pathStats = data?.pathStats?.find((stats) => stats.id === location.pathname);
         const userCount = pathStats?.userCount || 0;

         if (data?.path === location.pathname && userCount > 1) {
            if (pollInterval === 0) {
               setPollInterval(POLL_INTERVAL_DURATION);
            }
         } else if (pollInterval !== 0) {
            setPollInterval(0);
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [clientId, dataPath, location.pathname, pollInterval, setPollInterval]);
};
