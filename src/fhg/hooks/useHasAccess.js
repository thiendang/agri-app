// import {intersection} from 'lodash';
// import castArray from 'lodash/castArray';
// import {useMemo} from 'react';
// import {useRecoilValue} from 'recoil';
// import {authenticationDataStatus} from '../components/security/AuthenticatedUser';
// import {userGroupsState} from '../components/security/AuthenticatedUser';
//
// /**
//  * Hook to determine user access. If the user has the required groups hasAccess is true.
//  * @param requiredGroups The group or list of groups required to give access.
//  * @return {{hasAccess: boolean, isLoggedIn: boolean}} hasAccess indicate is the user has a required group and
//  *  isLoggedIn indicates if the user is logged in.
//  */
// export default function useHasAccess(requiredGroups = []) {
//    const {groups} = useRecoilValue(userGroupsState);
//    const {username} = useRecoilValue(authenticationDataStatus);
//
//    return useMemo(() => {
//       const useRequiredGroups = castArray(requiredGroups);
//
//       if (process.env.NODE_ENV !== 'production' && useRequiredGroups.length <= 0) {
//          console.log('Has Access needs a list of groups.');
//       }
//       return {
//          hasAccess: intersection(useRequiredGroups, groups || [])?.length > 0,
//          isLoggedIn: username !== undefined,
//          username,
//       };
//    }, [groups, requiredGroups, username]);
// }
