import React from 'react';
import {useRecoilValue} from 'recoil';
import {userRoleState} from '../../../pages/Main';

/**
 * Component protected by admin access.
 *
 * @param children The children elements.
 * @return {JSX.Element} The element to use based on privilege.
 * @constructor
 */
export default function AdminAccess({children}) {
   const {isAdmin} = useRecoilValue(userRoleState);

   return isAdmin ? children : null;
}
