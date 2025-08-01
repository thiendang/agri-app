import {ThemeProvider} from '@aws-amplify/ui-react';
import {Link} from '@aws-amplify/ui-react';
import {Heading} from '@aws-amplify/ui-react';
import {Image} from '@aws-amplify/ui-react';
import {useTheme} from '@aws-amplify/ui-react';
import {Text} from '@aws-amplify/ui-react';
import {View} from '@aws-amplify/ui-react';
import {Authenticator} from '@aws-amplify/ui-react';
import {I18n} from 'aws-amplify';
import './Authenticator.css';
import {CLIENT_SIGNUP_PATH} from '../../../Constants';
import {LOGO_DARK} from '../../../Constants';
import {CLIENT_FREE_TRIAL_PATH} from '../../../Constants';
import {TERMS} from '../../../Constants';
import {PRIVACY_POLICY} from '../../../Constants';
import {SMALL_LOGO} from '../../../Constants';
import {useCustomSearchParams} from '../../hooks/useCustomSearchParams';
import ScrollStack from '../../ScrollStack';
import AuthenticatorInner from './AuthenticatorInner';
import {useLocation} from 'react-router-dom';

I18n.putVocabulariesForLanguage('en', {
   Username: 'Username', // Username label
   Password: 'Password', // Password label
   "1 validation error detected: Value at 'username' failed to satisfy constraint: Member must satisfy regular expression pattern: [\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]+":
      'Username should be alphanumeric and can contain underscore only',
   'PreSignUp failed with error The invite code is not valid.': 'The invite code is not valid.',
});

const formFields = {
   signUp: {
      name: {
         label: 'Name',
         placeholder: 'John Smith',
         order: 1,
         size: 'small',
         isRequired: true,
      },
      email: {
         label: 'Email Address',
         placeholder: 'jsmith@email.com',
         order: 2,
         size: 'small',
         isRequired: true,
      },
      username: {
         label: 'Username',
         order: 3,
         size: 'small',
         isRequired: true,
      },
      password: {
         label: 'Password:',
         placeholder: 'Enter your Password:',
         isRequired: false,
         size: 'small',
         order: 4,
      },
      confirm_password: {
         label: 'Confirm Password:',
         size: 'small',
         order: 5,
      },
      // phone_number: {
      //    label: 'Phone Number',
      //    order: 6,
      //    size: 'small',
      //    placeholder: '316-555-1212',
      //    isRequired: true,
      // },
      'custom:business_name': {
         order: 7,
         name: 'custom:business_name',
         label: 'Business Name',
         placeholder: 'Acme Farms',
         size: 'small',
         isRequired: true,
      },
      // 'custom:address_1': {
      //    order: 8,
      //    name: 'custom:address_1',
      //    label: 'Address',
      //    placeholder: '',
      //    size: 'small',
      //    isRequired: true,
      // },
      // 'custom:address_2': {
      //    order: 9,
      //    name: 'custom:address_2',
      //    label: 'Address Line Two',
      //    placeholder: '',
      //    size: 'small',
      //    isRequired: false,
      // },
      // 'custom:city': {
      //    order: 10,
      //    name: 'custom:city',
      //    label: 'City',
      //    placeholder: '',
      //    size: 'small',
      //    isRequired: true,
      // },
      // 'custom:state': {
      //    order: 11,
      //    name: 'custom:state',
      //    label: 'State',
      //    placeholder: '',
      //    size: 'small',
      //    isRequired: true,
      // },
      // 'custom:zip': {
      //    order: 12,
      //    name: 'custom:zip',
      //    label: 'Zip',
      //    placeholder: '',
      //    size: 'small',
      //    isRequired: true,
      // },
      'custom:freeTrialActive': {
         order: 13,
         name: 'custom:freeTrialActive',
         defaultValue: 'false',
         value: 'false',
         label: '',
         placeholder: '',
         style: {
            display: 'none',
         },
         size: 'small',
         isRequired: true,
      },
      'custom:invite_code': {
         order: 14,
         name: 'custom:invite_code',
         defaultValue: 'false',
         value: 'false',
         label: '',
         placeholder: '',
         style: {
            display: 'none',
         },
         size: 'small',
         isRequired: true,
      },
   },
};

const defaultComponents = {
   Header() {
      const {tokens} = useTheme();

      return (
         <View
            textAlign='center'
            style={{
               backgroundColor: tokens.colors.background.primary,
            }}
            padding={tokens.space.small}
            width={'100%'}
         >
            <Image
               alt='logo'
               src={localStorage.darkMode !== 'false' ? LOGO_DARK : SMALL_LOGO}
               height={'56px'}
               style={{marginTop: 'auto', marginBottom: 'auto'}}
            />
         </View>
      );
   },

   SignUp: {
      FormFields() {
         return (
            <ScrollStack height={'100%'} width={'100%'} innerStackProps={{spacing: 0.1}} flex={'1 1'}>
               {/* Re-use default `Authenticator.SignUp.FormFields` */}
               <Authenticator.SignUp.FormFields />
            </ScrollStack>
         );
      },
      Footer() {
         const {tokens} = useTheme();
         return (
            <View
               textAlign='center'
               padding={`0 ${tokens.space.large} ${tokens.space.small}`}
               className={'login-border'}
            >
               <Text as={'span'}>By clicking "Create Account" you agree to the&nbsp;</Text>
               <Link className={'styled-link'} href={PRIVACY_POLICY} isExternal={true}>
                  Privacy Policy&nbsp;
               </Link>
               <Text as={'span'}>and&nbsp;</Text>
               <Link className={'styled-link'} href={TERMS}>
                  Terms of Service
               </Link>
            </View>
         );
      },
   },
   SignIn: {
      Header() {
         const {tokens} = useTheme();
         return (
            <Heading
               color={'black'}
               style={{fontWeight: 'bold'}}
               padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
               level={7}
            >
               <Text textAlign={'center'}>Sign in with an existing account</Text>
            </Heading>
         );
      },
      Footer() {
         const {tokens} = useTheme();
         return (
            <View
               textAlign='center'
               padding={`0 ${tokens.space.large} ${tokens.space.small}`}
               className={'login-border'}
            >
               <Text as={'span'}>By clicking "Sign in" you agree to the&nbsp;</Text>
               <Link className={'styled-link'} href={PRIVACY_POLICY} isExternal={true}>
                  Privacy Policy&nbsp;
               </Link>
               <Text as={'span'}>and&nbsp;</Text>
               <Link className={'styled-link'} href={TERMS}>
                  Terms of Service
               </Link>
            </View>
         );
      },
   },
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
export default function AuthenticatorFHG({theme, components = defaultComponents, children}) {
   const location = useLocation();
   const [{code, type}] = useCustomSearchParams();

   if (location?.pathname?.includes?.(CLIENT_SIGNUP_PATH)) {
      const isClientUserInvite = type === 'c';
      formFields.signUp['custom:freeTrialActive'].defaultValue = 'false';
      formFields.signUp['custom:freeTrialActive'].value = 'false';
      formFields.signUp['custom:invite_code'].defaultValue = code;
      formFields.signUp['custom:invite_code'].value = code;
      if (isClientUserInvite) {
         delete formFields.signUp['custom:business_name'];
      }
   } else if (location?.pathname?.includes?.(CLIENT_FREE_TRIAL_PATH)) {
      formFields.signUp['custom:freeTrialActive'].defaultValue = 'true';
      formFields.signUp['custom:freeTrialActive'].value = 'true';
   } else {
      formFields.signUp['custom:freeTrialActive'].defaultValue = 'false';
      formFields.signUp['custom:freeTrialActive'].value = 'false';
   }

   return (
      <Authenticator.Provider>
         <ThemeProvider
            theme={theme}
            colorMode={localStorage.darkMode !== 'false' ? 'dark' : 'light'}
            style={{overflow: 'hidden'}}
         >
            <AuthenticatorInner components={components} formFields={formFields}>
               {children}
            </AuthenticatorInner>
         </ThemeProvider>
      </Authenticator.Provider>
   );
}
