import {Card} from '@mui/material';
import {Stack} from '@mui/material';
import {styled} from '@mui/material';
import {clamp} from 'lodash';
import {useCallback} from 'react';
import {useRef} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useRecoilState} from 'recoil';
import {useSetRecoilState, atom} from 'recoil';
import {BLURRED_BACKGROUND_DARK} from '../../../Constants';
import {SMALL_LOGO} from '../../../Constants';
import {BLURRED_BACKGROUND} from '../../../Constants';
import {CLIENT_SIGNUP_GROUP} from '../../../Constants';
import {INTERCOM_API_BASE, INTERCOM_APP_ID, SUPER_ADMIN_GROUP} from '../../../Constants';
import {CLIENT_GROUP} from '../../../Constants';
import {ADMIN_GROUP} from '../../../Constants';
import {USER_CLIENT_QUERY} from '../../../data/QueriesGL';
import {userRoleState} from '../../../pages/Main';
import useQueryFHG from '../../hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../hooks/useCustomSearchParams';
import moment from 'moment';
import LinearProgress, {linearProgressClasses} from '@mui/material/LinearProgress';
import useEffectOnceConditional from '../../hooks/useEffectOnceConditional';
import ButtonFHG from '../ButtonFHG';
import TypographyFHG from '../Typography';
// import {useLocation} from 'react-router-dom';

const CREATE_ACCOUNT_TIME = 65; // in seconds

const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
   height: 18,
   borderRadius: 9,
   [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.primary.dark,
   },
   [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 9,
      backgroundColor: theme.palette.primary.light,
   },
}));
export const userGroupsState = atom({
   key: 'userGroupsStateKey',
   default: {groups: [], signOut: undefined},
});

export const authenticationDataStatus = atom({
   key: 'authenticationData',
   default: {},
});

export const userStatus = atom({
   key: 'userStatus',
   default: {},
});

export default function AuthenticatedUser({authState, children}) {
   const [{franchiseId}, setSearchParams] = useCustomSearchParams();
   const [userGroups, setUserGroups] = useRecoilState(userGroupsState);
   const [userRole, setUserRole] = useRecoilState(userRoleState);
   const [authStateData, setAuthStateData] = useRecoilState(authenticationDataStatus);
   const [isInitialized, setIsInitialized] = useState(false);
   const setUserStatus = useSetRecoilState(userStatus);
   const [timerCount, setTimerCount] = useState(0);
   const timerCountRef = useRef(0);
   const intervalRef = useRef();
   const navigate = useNavigate();

   const groups = authState?.user?.signInUserSession?.idToken?.payload?.['cognito:groups'] ?? [];
   const isClientSignup = groups.indexOf(CLIENT_SIGNUP_GROUP) >= 0;

   let [data, {loading}] = useQueryFHG(
      USER_CLIENT_QUERY,
      {
         variables: {cognitoSub: authState?.user?.attributes?.sub},
         //  86400 seconds in a day converted to milliseconds and check 4 times a day
         pollInterval: (86400 / 4) * 1000,
         skip: !authState?.user?.attributes?.sub,
      },
      'user.type',
   );

   useEffect(() => {
      if (!!data?.users?.[0]) {
         setUserStatus(data?.users?.[0]);
      }
   }, [data?.users?.[0]]);

   useEffectOnceConditional(() => {
      if (isClientSignup) {
         intervalRef.current = setInterval(() => {
            setTimerCount((count) => count + 1);
            timerCountRef.current += 1;
            if ((timerCountRef.current > CREATE_ACCOUNT_TIME || !loading) && intervalRef.current) {
               console.log('Stop interval timer for authenticatedUser');
               clearInterval(intervalRef.current);
               intervalRef.current = null;
            }
         }, 1000);
         return true;
      } else {
         return false;
      }
   }, [isClientSignup, timerCount, setTimerCount, loading]);

   useEffect(() => {
      async function effect() {
         if (!!authState && !!data) {
            const groups = authState?.user?.signInUserSession?.idToken?.payload?.['cognito:groups'] ?? [];
            setUserGroups({groups, signOut: authState.signOut});
            const isSuperAdmin = groups.indexOf(SUPER_ADMIN_GROUP) >= 0;
            const isAdmin = groups.indexOf(ADMIN_GROUP) >= 0 || isSuperAdmin;
            const isClient = groups.indexOf(CLIENT_GROUP) >= 0 || groups.indexOf(CLIENT_SIGNUP_GROUP) >= 0;
            const isClientSignup = groups.indexOf(CLIENT_SIGNUP_GROUP) >= 0;

            if (
               isSuperAdmin !== userRole.isSuperAdmin ||
               isAdmin !== userRole.isAdmin ||
               isClient !== userRole.isClient ||
               isClientSignup !== userRole.isClientSignup
            ) {
               setUserRole({isSuperAdmin, isAdmin, isClient, isClientSignup});
            }

            if (authStateData.username !== authState?.user?.username) {
               setAuthStateData({username: authState?.user?.username, cognitoSub: authState?.user?.attributes?.sub});

               const user = data?.users?.[0];

               if (user) {
                  setUserRole((role) => ({
                     ...role,
                     clientId: user.clientId,
                     franchiseId: user.franchiseId,
                     isExecutive: user.isExecutive,
                     isClient: !!user.clientId,
                     ...user?.client,
                  }));

                  const searchParams = {};

                  if (isSuperAdmin && user?.franchiseId) {
                     // Precedence order is franchise id on: URL, localStorage, user franchise id.
                     searchParams.franchiseId = franchiseId || localStorage.defaultFranchiseId || user?.franchiseId;
                  }
                  if (!isAdmin && user?.clientId) {
                     searchParams.clientId = user?.clientId;
                  }
                  setSearchParams((params) => ({...params, ...searchParams}));

                  //intercom
                  window.Intercom('boot', {
                     api_base: INTERCOM_API_BASE,
                     app_id: INTERCOM_APP_ID,
                     name: user?.username,
                     email: user?.email,
                     created_at: moment(user?.createdDateTime).unix(),
                  });

                  setUserStatus(user);
                  // if (
                  //    location.pathname.includes(CLIENT_FREE_TRIAL_PATH) ||
                  //    location.pathname.includes(CLIENT_FREEMIUM_PATH)
                  // ) {
                  //    navigate(DEFAULT_PATH, {replace: true});
                  // }
               } else {
                  console.log('Could not find user');
               }
            } else {
               const user = data?.users?.[0];

               if (user) {
                  setUserRole((role) => ({
                     ...role,
                     clientId: user.clientId,
                     franchiseId: user.franchiseId,
                     isExecutive: user.isExecutive,
                     isClient: !!user.clientId,
                     ...user?.client,
                  }));
                  setUserStatus(user);
               }
            }
            setIsInitialized(true);
         }
      }
      effect();
   }, [authState, data]);

   const handleLogout = useCallback(() => {
      if (intervalRef.current) {
         clearInterval(intervalRef.current);
         intervalRef.current = null;
      }

      if (userGroups?.signOut) {
         userGroups?.signOut?.();
         navigate('/');
      }
      window.location.reload();
   }, [userGroups]);

   if (!loading && authState && isInitialized && (isClientSignup || data)) {
      return children;
   } else if ((loading && isClientSignup) || (isClientSignup && !loading && (!data || data?.users?.length <= 0))) {
      const percent = clamp((timerCount / CREATE_ACCOUNT_TIME) * 100, 100);
      if (percent > 3) {
         return (
            <Stack
               name='isClientSetupProgressFrame'
               className={'clientSetupProgressFrame'}
               width={'100%'}
               height={'100%'}
               justifyContent='center'
               alignItems={'center'}
               style={{
                  backgroundImage: `url('${localStorage.darkMode !== 'false' ? BLURRED_BACKGROUND_DARK : BLURRED_BACKGROUND}')`,
               }}
            >
               <Card sx={{width: 490, height: 330, p: 4, borderRadius: 8}} elevation={4}>
                  <Stack
                     flexDirection={'column'}
                     alignItems={'center'}
                     justifyContent={'space-between'}
                     height={'100%'}
                  >
                     <Stack flexDirection={'column'} alignItems={'center'} width={'100%'}>
                        <img
                           alt='logo'
                           src={SMALL_LOGO}
                           height={'56px'}
                           style={{marginTop: 'auto', marginBottom: 24}}
                        />
                        <TypographyFHG variant='h4' sx={{mb: 1}}>
                           Setting up account
                        </TypographyFHG>
                        <BorderLinearProgress variant='determinate' value={percent} sx={{width: '90%'}} />
                     </Stack>
                     {percent >= 100 && (
                        <TypographyFHG
                           id='accountSetup.tooLong.message'
                           variant='h6'
                           sx={{mt: 1, mb: 1}}
                           values={{
                              email: <a href={`mailto:support@agriapp.com`}>support@agriapp.com</a>,
                           }}
                        />
                     )}
                     <ButtonFHG
                        color='primary'
                        variant='contained'
                        labelKey={'close.button'}
                        size={'large'}
                        onClick={handleLogout}
                        sx={{fontSize: 16, fontWeight: 'bold', mt: 'auto', borderRadius: 2, width: '100%'}}
                     />
                  </Stack>
               </Card>
            </Stack>
         );
      }
   }
   return null;
}
