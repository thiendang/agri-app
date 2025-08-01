// import React from 'react';
// import {Outlet} from 'react-router-dom';
// import useHasAccess from '../../hooks/useHasAccess';
//
// /**
//  * An outlet component that only displays the outlet if the user has the required groups.
//  * @return {JSX.Element|null} Outlet if the user has access, message if logged in and null if not logged in.
//  * @constructor
//  */
// export default function PrivilegeOutlet({requiredGroups}) {
//    const {hasAccess, isLoggedIn} = useHasAccess(requiredGroups);
//
//    // If the user has access allow the outlet.
//    if (hasAccess) {
//       return <Outlet />;
//       // If the user is logged in, display the message to gain access.
//    } else if (isLoggedIn) {
//       return (
//          <div style={{padding: 16}}>
//             <div style={{fontSize: 20}}>No Permissions</div>
//             <div style={{fontSize: 14}}>Check with your administrator to get permission to view this application</div>
//          </div>
//       );
//       // If the user isn't logged in yet, they may have access, but prevent display of the outlet until they are logged in.
//    } else {
//       return null;
//    }
// }
