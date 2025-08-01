import {styled} from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import moment from 'moment';
import {useRef} from 'react';
import React, {Suspense, lazy} from 'react';
import {Navigate} from 'react-router-dom';
import {useMatch} from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import ClientDrawer from '../components/ClientDrawer';
import HubspotContactForm from '../components/HubspotContactForm';
import {ASSETS_VIEW} from '../components/permission/PermissionAllow';
import {LOAN_ANALYSIS_VIEW} from '../components/permission/PermissionAllow';
import usePermission from '../components/permission/usePermission';
import {SETTINGS_PROFILE_FULL_PATH} from '../Constants';
import {CLIENT_SIGNUP_PATH} from '../Constants';
import {DATE_DB_FORMAT} from '../Constants';
import {KNOWLEDGE_LIBRARY_PATH} from '../Constants';
import {TOOL_FULL_PATH} from '../Constants';
import {ENTITY_ASSET_PATH} from '../Constants';
import {CLIENT_FREEMIUM_PATH} from '../Constants';
import {CLIENT_FREE_TRIAL_PATH} from '../Constants';
import {BUSINESS_FULL_PATH} from '../Constants';
import {DRAWER_WIDTH} from '../Constants';
import {LOAN_ANALYSIS_PATH} from '../Constants';
import {CLIENT_DASHBOARD_PATH} from '../Constants';
import {ADMIN_PATH} from '../Constants';
import {DEFAULT_PATH} from '../Constants';
import Loading from '../fhg/components/Loading';
import ProgressIndicator from '../fhg/components/ProgressIndicator';
import ErrorStateSnackbar from '../fhg/components/ErrorStateSnackbar';
import {useEffect} from 'react';
import Redirect from '../fhg/components/Redirect';
import {drawerIsOpenStatus} from '../fhg/components/ResponsiveMobileDrawer';
import AdminAccess from '../fhg/components/security/AdminAccess';
import {atom} from 'recoil';
import {userStatus} from '../fhg/components/security/AuthenticatedUser';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import UndeleteSnackbar from '../fhg/UndeleteSnackbar';
import {useTrackingPath} from '../fhg/hooks/useTrackingPath';
import {useSubscriptionPath} from '../fhg/hooks/useSubscriptionPath';

const AdminMain = lazy(() => import('./admin/AdminMain'));
const ClientMain = lazy(() => import('./client/ClientMain'));

export const userRoleState = atom({
   key: 'userRole',
   default: {
      isClientSignup: false,
      isClient: false,
      isAdmin: false,
      isSuperAdmin: false,
      isExecutive: false,
      clientId: null,
      hubspotFormCompleted: null,
      franchiseId: null,
   },
});

export const reportDateState = atom({
   key: 'reportDateState',
   default: true,
});

export const errorState = atom({
   key: 'error',
   default: {
      errorKey: undefined,
      errorMessage: undefined,
      errorInfo: undefined,
      error: undefined,
      values: undefined,
      enableRefresh: true,
   },
});

const MainStyled = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})(({theme, open}) => ({
   flexGrow: 1,
   padding: `${theme.spacing(2)} !important`,
   [theme.breakpoints.up('lg')]: {
      padding: `${theme.spacing(3)} !important`,
   },
   position: 'relative',
   overflow: 'hidden',
   transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
   }),
   marginLeft: 0,
   ...(open && {
      [theme.breakpoints.up('md')]: {
         transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
         }),
         marginLeft: `${DRAWER_WIDTH}px`,
      },
   }),
}));

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed: 5/28/21
 */
export default function Main() {
   const [{entityId}] = useCustomSearchParams();
   const userRole = useRecoilValue(userRoleState);
   const isDrawerOpen = useRecoilValue(drawerIsOpenStatus);
   const hasLoanAnalysisPermission = usePermission(LOAN_ANALYSIS_VIEW);
   const hasAssetsPermission = usePermission(ASSETS_VIEW);
   const isNavigatedRef = useRef(false);

   useTrackingPath();
   useSubscriptionPath();

   const navigate = useNavigateSearch();
   const routeMatch = useMatch({path: CLIENT_DASHBOARD_PATH + '/*'});
   const routeSignupMatch = useMatch({path: CLIENT_SIGNUP_PATH + '/*'});

   const {isAdmin, isClient, isClientSignup, clientId, isExecutive, isSuperAdmin, hubspotFormCompleted} = userRole;
   const user = useRecoilValue(userStatus);

   useEffect(() => {
      if (
         !isNavigatedRef.current &&
         !isAdmin &&
         !isSuperAdmin &&
         clientId &&
         entityId &&
         (!routeMatch || routeMatch.params['*']?.length <= 0)
      ) {
         //If the user was created no longer than 72 hours ago, go to the knowledge center unless we have already
         // directed them there.
         if (
            localStorage.hasLoggedIn !== 'true' &&
            moment(user.createdDateTime, DATE_DB_FORMAT).add(72, 'hours').isSameOrAfter(moment())
         ) {
            localStorage.hasLoggedIn = true;
            navigate(`${TOOL_FULL_PATH}/${KNOWLEDGE_LIBRARY_PATH}`, {replace: true});
         } else if (hasLoanAnalysisPermission) {
            navigate(`${BUSINESS_FULL_PATH}/${LOAN_ANALYSIS_PATH}`, {replace: true});
         } else if (hasAssetsPermission) {
            navigate(`${BUSINESS_FULL_PATH}/${ENTITY_ASSET_PATH}`, {replace: true});
         } else {
            console.log('Cannot redirect to loan analysis nor assets.');
         }
         isNavigatedRef.current = true;
      }
   }, [clientId, navigate, entityId, isAdmin, isSuperAdmin, routeMatch]);

   if (isAdmin || isSuperAdmin || (isClient && clientId)) {
      let defaultPath =
         isAdmin || isSuperAdmin
            ? ADMIN_PATH
            : LOAN_ANALYSIS_PATH.replace(':clientId', clientId).replace(':entityId', localStorage.entityId);

      return (
         <Suspense fallback={<Loading isLoading />}>
            <Box display='flex' flexDirection='column' overflow='hidden' height={'100%'}>
               <CssBaseline />
               <ProgressIndicator isGlobal={true} />
               <UndeleteSnackbar />
               <ErrorStateSnackbar />
               <ClientDrawer />
               <MainStyled open={isDrawerOpen}>
                  {isClientSignup &&
                     !hubspotFormCompleted &&
                     !routeSignupMatch &&
                     !(localStorage.showHubspot === 'false') && <HubspotContactForm />}

                  <Routes>
                     <Route path={`${CLIENT_DASHBOARD_PATH}/*`} element={<ClientMain />} />
                     <Route
                        path={`${ADMIN_PATH}/*`}
                        element={
                           <AdminAccess>
                              <AdminMain isExecutive={isExecutive} />
                           </AdminAccess>
                        }
                     />
                     <Route
                        exact
                        path={CLIENT_SIGNUP_PATH + '/*'}
                        element={<Redirect to={SETTINGS_PROFILE_FULL_PATH} />}
                     />
                     <Route exact path={CLIENT_FREE_TRIAL_PATH} element={<Redirect to={`/${defaultPath}`} />} />
                     <Route exact path={CLIENT_FREEMIUM_PATH} element={<Redirect to={`/${defaultPath}`} />} />
                     <Route path={DEFAULT_PATH} element={() => <Navigate to={defaultPath} />} />
                  </Routes>
               </MainStyled>
            </Box>
         </Suspense>
      );
   } else {
      return null;
   }
}
