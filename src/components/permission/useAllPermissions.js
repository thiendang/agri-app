import {map} from 'lodash';
import {useMemo} from 'react';
import {PERMISSION_ALL_QUERY} from '../../data/QueriesGL';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';

/**
 * Hook containing the current user's permission list.
 * @return {unknown} Array of permissions. For example: [permissionIdList, permissionList]
 */
export default function useAllPermissionList() {
   const [data] = useQueryFHG(PERMISSION_ALL_QUERY, undefined, 'permission.type');

   return useMemo(() => {
      if (data?.permissions.length > 0) {
         return [map(data?.permissions, 'id'), data?.permissions];
      }

      return [];
   }, [data?.permissions]);
}
