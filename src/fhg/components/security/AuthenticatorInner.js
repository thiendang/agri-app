import {Heading, Image, Text, Authenticator, Flex, Link, useAuthenticator, useTheme} from '@aws-amplify/ui-react';
import Stack from '@mui/material/Stack';
import {Auth, I18n} from 'aws-amplify';
import {useMatch} from 'react-router-dom';
import {CLIENT_SIGNUP_PATH} from '../../../Constants';
import {BLURRED_BACKGROUND_DARK} from '../../../Constants';
import {CLIENT_FREE_TRIAL_PATH} from '../../../Constants';
import {CLIENT_FREEMIUM_PATH} from '../../../Constants';
import {BLURRED_BACKGROUND} from '../../../Constants';
import {METRICS_LOGO} from '../../../Constants';
import AuthenticatedUser from './AuthenticatedUser';
import './Authenticator.css';

I18n.putVocabulariesForLanguage('en', {
   Username: 'Username', // Username label
   Password: 'Password', // Password label
});

function Header() {
   const {tokens} = useTheme();

   return (
      <Image alt='logo' src={METRICS_LOGO} width={300} padding={tokens.space.medium} style={{alignSelf: 'center'}} />
   );
}
function Footer() {
   const {tokens} = useTheme();

   return (
      <Flex justifyContent='center' padding={tokens.space.small}>
         <Text>&copy; All Rights Reserved</Text>
      </Flex>
   );
}
function SignInHeader() {
   const {tokens} = useTheme();

   return (
      <Heading level={3} padding={`${tokens.space.xl} ${tokens.space.xl} 0`}>
         Sign in to your Account
      </Heading>
   );
}
function SignUpHeader() {
   const {tokens} = useTheme();

   return (
      <Heading level={3} padding={`${tokens.space.xl} ${tokens.space.xl} 0`}>
         Sign UP!!!!!
      </Heading>
   );
}

function SignInFooter() {
   const {toResetPassword} = useAuthenticator();
   const {tokens} = useTheme();

   return (
      <Flex justifyContent='center' padding={`0 0 ${tokens.space.small}`}>
         <Link onClick={toResetPassword}>Reset your password</Link>
      </Flex>
   );
}

function SignUpFooter() {
   const {toResetPassword} = useAuthenticator();
   const {tokens} = useTheme();

   return (
      <Flex justifyContent='center' padding={`0 0 ${tokens.space.small}`}>
         <Text>By clicking "Create Account" you agree to the</Text>
         <Link onClick={toResetPassword}>Privacy Policy</Link>
      </Flex>
   );
}
const testComponents = {
   Header,
   SignIn: {
      Header: SignInHeader,
      Footer: SignInFooter,
   },
   SignUp: {
      Header() {
         const {tokens} = useTheme();

         return (
            <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
               Create a new account
            </Heading>
         );
      },
   },
   Footer,
};

/**
 * Authenticator for the app. The children won't be displayed until the user has logged in.
 *
 * @param theme The theme for the AWS authentication.
 * @param components The components for the AWS authentication.
 * @param children
 * @return {JSX.Element}
 * @constructor
 */
export default function AuthenticatorInner({formFields, components = testComponents, children}) {
   const {authStatus} = useAuthenticator();
   const signupMatch = useMatch({path: CLIENT_SIGNUP_PATH, end: false});
   const freemiumMatch = useMatch({path: CLIENT_FREEMIUM_PATH});
   const freeTrialMatch = useMatch({path: CLIENT_FREE_TRIAL_PATH});
   const showCreateAccount = !!freemiumMatch || !!freeTrialMatch || !!signupMatch;

   const services = {
      async handleSignUp(data) {
         const {username, password, attributes} = data;
         const newUser = await Auth.signUp({
            username,
            password,
            attributes,
            autoSignIn: {
               enabled: true,
            },
         });
         window.fbq('track', 'CompleteRegistration', {
            event: 'Successfully creates freemium or free trial account',
         });
         return newUser;
      },
   };

   return (
      <Stack
         direction={'row'}
         display={'flex'}
         // sx={{bgcolor: '#08213F'}}
         height={'100%'}
         width={'100%'}
         overflow='hidden'
         style={{
            backgroundImage:
               authStatus === 'unauthenticated'
                  ? `url('${localStorage.darkMode !== 'false' ? BLURRED_BACKGROUND_DARK : BLURRED_BACKGROUND}')`
                  : undefined,
         }}
      >
         <Stack flex={'1 1'} height={'100%'} width={'100%'} overflow='hidden'>
            <Authenticator
               components={components}
               formFields={formFields}
               initialState={showCreateAccount ? 'signUp' : 'signIn'}
               services={services}
            >
               {(authState) => <AuthenticatedUser authState={authState}>{children}</AuthenticatedUser>}
            </Authenticator>
         </Stack>
      </Stack>
   );
}
