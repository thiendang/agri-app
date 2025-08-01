import {useEffect, useMemo} from 'react';
import {useSetRecoilState} from 'recoil';
import {USER_CLIENT_QUERY} from '../../../../data/QueriesGL';
import useQueryFHG from '../../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../../fhg/hooks/useCustomSearchParams';
import {listUsersState} from '../WeeklyTeamMeeting';

export const useLoadUser = () => {
   const [{clientId}] = useCustomSearchParams();

   const [dataUser] = useQueryFHG(USER_CLIENT_QUERY, {
      variables: {
         clientId,
      },
   });

   const users = useMemo(() => {
      return dataUser?.users;
   }, [dataUser?.users]);

   const setListUsers = useSetRecoilState(listUsersState);

   useEffect(() => {
      setListUsers(users);
   }, [setListUsers, users]);
};
