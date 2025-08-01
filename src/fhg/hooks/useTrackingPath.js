import {PATH_UPDATE} from '../../data/QueriesGL';
import useMutationLxFHG from './data/useMutationFHG';
import {useEffect} from 'react';
import {useCustomSearchParams} from './useCustomSearchParams';
import {useLocation} from 'react-router-dom';

export const useTrackingPath = () => {
   const [trackingPath] = useMutationLxFHG(PATH_UPDATE);

   const location = useLocation();
   const [{clientId}] = useCustomSearchParams();

   useEffect(() => {
      clientId &&
         trackingPath({
            variables: {
               clientId,
               path: location.pathname,
            },
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [trackingPath, clientId, location.pathname]);
};
