import findIndex from 'lodash/findIndex';
import {useMemo} from 'react';
import {useRecoilValue} from 'recoil';
import {userStatus} from '../../fhg/components/security/AuthenticatedUser';

/**
 * Hook to determine if the user has the given permission.
 * @param permissionName The permission name to check.
 * @param allowEmpty Indicates if permission is allowed if the permissionName is not set.
 * @return {boolean|boolean} Indicates if the user has the permission.
 */
export default function usePermission(permissionName, allowEmpty) {
   const user = useRecoilValue(userStatus);

   return useMemo(() => {
      if (allowEmpty === true && !permissionName) {
         return true;
      }
      return user?.jointPermissions?.length > 0 ? findIndex(user?.jointPermissions, {name: permissionName}) >= 0 : true;
   }, [user, permissionName, allowEmpty]);
}
