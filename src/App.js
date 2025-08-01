import '@aws-amplify/ui-react/styles.css';
import {LocalizationProvider} from '@mui/x-date-pickers';
import CssBaseline from '@mui/material/CssBaseline';
import StylesProvider from '@mui/styles/StylesProvider';
import React, {useState, Suspense} from 'react';
import {IntlProvider} from 'react-intl';
import ErrorBoundary from './components/ErrorBoundary';
import {FILE_BUCKET} from './Constants';
import Loading from './fhg/components/Loading';
import AuthenticatorFHG from './fhg/components/security/Authenticator';
import {useEffect} from 'react';
import Main from './pages/Main';
import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
import awsProductionConfig from './aws-production-exports';
import {authenticatorTheme} from './components/theme/authenticatorTheme';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(
   {
      frameStyle: {
         height: `100vh`,
         overflow: 'hidden',
         '& > div': {
            height: '100%',
            overflow: 'hidden',
         },
      },
   },
   {name: 'AppStyles'},
);

const config = process.env.REACT_APP_POOL === 'production' ? awsProductionConfig : awsconfig;
Amplify.configure(config);
Amplify.configure({
   Storage: {
      bucket: FILE_BUCKET, //REQUIRED -  Amazon S3 bucket
      region: 'us-east-2',
      customPrefix: {
         public: '',
         protected: '',
         private: '',
      },
   },
   Analytics: {
      // OPTIONAL - disable Analytics if true
      disabled: true,
   },
});

const formats = {
   number: {
      USD: {
         style: 'currency',
         currency: 'USD',
      },
   },
};

/**
 * App component. Responsible for initializing AWS, GraphQL and Intl (localization). App can be displayed without
 * authorization. Main is displayed when authorized.
 *
 * @return {JSX.Element|null}
 * @constructor
 */
export default function App() {
   const classes = useStyles();
   const [messages, setMessages] = useState({});

   useEffect(() => {
      import('./messages/en-US').then((messages) => {
         setMessages(messages.default);
      });
   }, []);

   if (Object.keys(messages).length > 0) {
      return (
         <Suspense fallback={<Loading isLoading />}>
            <ErrorBoundary>
               <IntlProvider messages={messages} locale={'en'} formats={formats}>
                  <StylesProvider>
                     <LocalizationProvider dateAdapter={AdapterMoment}>
                        <div className={classes.frameStyle}>
                           <AuthenticatorFHG
                              theme={authenticatorTheme}
                              colorMode={localStorage.darkMode !== false ? 'dark' : 'system'}
                           >
                              <CssBaseline />
                              <Main />
                           </AuthenticatorFHG>
                        </div>
                     </LocalizationProvider>
                  </StylesProvider>
               </IntlProvider>
            </ErrorBoundary>
         </Suspense>
      );
   } else {
      return null;
   }
}
