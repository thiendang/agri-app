import {useRecoilValue} from 'recoil';
import {userRoleState} from '../../pages/Main';

/**
 * Component to require a super admin permission before showing the children components.
 * @param children The children to display if user has permission.
 * @return {*|null} The children if the user has permission or null otherwise.
 * @constructor
 */
export default function PermissionSuperAdmin({children}) {
   const {isSuperAdmin} = useRecoilValue(userRoleState);

   return isSuperAdmin ? children : null;
}
