import {lazy} from 'react';
import React from 'react';
import {Routes, Route} from 'react-router-dom';
import FranchiseInvite from '../../components/FranchiseInvite';
import {FRANCHISE_INVITE} from '../../Constants';
import {CLIENT_INVITE} from '../../Constants';
import {ADMIN_MEMBERSHIP_PATH} from '../../Constants';
import {MEMBERSHIP_EDIT} from '../../Constants';
import {SECTION_PATH} from '../../Constants';
import {ADMIN_COURSES_PATH} from '../../Constants';
import {useRecoilValue} from 'recoil';
import Franchises from '../../components/Franchises';
import {ADMIN_FRANCHISES_PATH} from '../../Constants';
import {FEEDBACK_PATH} from '../../Constants';
import {FRANCHISE_EDIT} from '../../Constants';
import {ADMIN_USER_OLD} from '../../Constants';
import {FOLDER_OLD} from '../../Constants';
import {FOLDER_EDIT} from '../../Constants';
import {FOLDER_PATH} from '../../Constants';
import {CLIENT_EDIT} from '../../Constants';
import {TASK_EDIT} from '../../Constants';
import {USER_EDIT} from '../../Constants';
import {ADMIN_USERS_PATH} from '../../Constants';
import {ADMIN_SETUP_PATH} from '../../Constants';
import Redirect from '../../fhg/components/Redirect';
import {userRoleState} from '../Main';
import SectionEdit from '../client/knowledgeCenter/SectionEdit';
import ClientSetup from './ClientSetup';
import {Feedback} from '../client/feedback/Feedback';

const ClientEdit = lazy(() => import('../../components/ClientEdit'));
const ClientInvite = lazy(() => import('../../components/ClientInvite'));
const MembershipEdit = lazy(() => import('../../components/MembershipEdit'));
const Memberships = lazy(() => import('../../components/Memberships'));
const FranchiseEdit = lazy(() => import('../../components/FranchiseEdit'));
const TaskEdit = lazy(() => import('../../components/TaskEdit'));
const UserEdit = lazy(() => import('./user/UserEdit'));
const FolderEdit = lazy(() => import('../../components/folders/FolderEdit'));
const Users = lazy(() => import('../../components/Users'));
const Folders = lazy(() => import('../../components/folders/Folders'));

/**
 * Main component accessible only if the user has been authenticated as an admin. Contains the routing for the admin
 * paths.
 *
 * Reviewed:
 */
export default function AdminMain({isExecutive}) {
   const {isSuperAdmin} = useRecoilValue(userRoleState);

   return (
      <Routes>
         <Route path={FOLDER_PATH} element={isSuperAdmin ? <Folders /> : null}>
            <Route exact path={FOLDER_EDIT} element={<FolderEdit />} />
            <Route exact path={FOLDER_OLD} element={<Redirect to={`../${FOLDER_EDIT}`} />} />
         </Route>
         <Route path={ADMIN_USERS_PATH} element={isExecutive ? <Users /> : null}>
            <Route exact path={USER_EDIT} element={isExecutive ? <UserEdit isAdminUserEdit /> : null} />
            <Route exact path={ADMIN_USER_OLD} element={<Redirect to={`../${USER_EDIT}`} />} />
         </Route>
         <Route path={ADMIN_FRANCHISES_PATH} element={isSuperAdmin ? <Franchises /> : null}>
            <Route path={FRANCHISE_EDIT} element={isSuperAdmin ? <FranchiseEdit /> : null} />
         </Route>
         <Route path={ADMIN_MEMBERSHIP_PATH} element={isSuperAdmin ? <Memberships /> : null}>
            <Route path={MEMBERSHIP_EDIT} element={isSuperAdmin ? <MembershipEdit /> : null} />
         </Route>
         <Route path={ADMIN_SETUP_PATH} element={<ClientSetup />}>
            <Route path={CLIENT_EDIT} element={<ClientEdit />} />
            <Route path={CLIENT_INVITE} element={<ClientInvite />} />
            <Route path={USER_EDIT} element={<UserEdit />} />
            <Route path={TASK_EDIT} element={<TaskEdit />} />
         </Route>
         <Route path={FRANCHISE_INVITE} element={<FranchiseInvite isFranchise={true} />}>
            <Route path={FRANCHISE_INVITE} element={<ClientInvite isFranchise={true} />} />
         </Route>
         <Route exact path={FEEDBACK_PATH} element={<Feedback />} />

         <Route path={`${ADMIN_COURSES_PATH}/${SECTION_PATH}`} element={isSuperAdmin ? <SectionEdit /> : null} />
      </Routes>
   );
}
