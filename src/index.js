import {makeVar} from '@apollo/client';
import {Auth} from '@aws-amplify/auth';
import {StyledEngineProvider} from '@mui/material';
import {lazy} from 'react';
import React from 'react';
import './index.css';
import App from './App';
import {INTERCOM_APP_ID, LOGO, WSENDPOINT} from './Constants';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import Loading from './fhg/components/Loading';
import SuspenseLx from './fhg/components/SuspenseLx';
import reportWebVitals from './reportWebVitals';
import {RetryLink} from '@apollo/client/link/retry';
import {setContext} from '@apollo/client/link/context';
import {split, HttpLink, ApolloClient, InMemoryCache, ApolloLink, ApolloProvider} from '@apollo/client';
import {getMainDefinition} from '@apollo/client/utilities';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';
import localForage from 'localforage';

import {ENDPOINT} from './Constants';
import QueueLink from 'apollo-link-queue';
import {createRoot} from 'react-dom/client';
const RecoilRoot = lazy(() => import('./packageExports/RecoilRoot'));
const BrowserRouter = lazy(() => import('./packageExports/BrowserRouter'));
const ThemeProvider = lazy(() => import('./components/ThemeProvider'));

export const undoRedoRefreshVar = makeVar(Date.now());

/*
Auth: {
         // REQUIRED - Amazon Cognito Identity Pool ID
         identityPoolId: 'us-east-2:fc2ef06e-cf67-4b73-9da8-090e59828afe',
         // REQUIRED - Amazon Cognito Region
         region: 'us-east-2',
         // OPTIONAL - Amazon Cognito User Pool ID
         userPoolId: 'us-east-2_juU9d1lC5',
         // OPTIONAL - Amazon Cognito Web Client ID
         userPoolWebClientId: '730rts1ddvhja0k0nv09hvthm2',
},
 */

const getAccessToken = () => {
   return Auth.currentSession()
      .then((session) => {
         return session.accessToken.jwtToken;
      })
      .catch((error) => {
         if (error !== 'No current user') {
            console.log(error);
            throw error;
         }
      });
};

/**
 * Header for all graphql calls to add the access token.
 */
const authLink = setContext(async (_, {headers}) => {
   let token = await getAccessToken();

   if (process.env.REACT_APP_POOL === 'test') {
      return {
         headers: {
            ...headers,
            localreferer: window.location.href,
            // eslint-disable-next-line
            accesstoken: token || '',
         },
      };
   }

   return {
      headers: {
         ...headers,
         // eslint-disable-next-line
         accesstoken: token || '',
      },
   };
});
//Set the Index DB name to Photos.
localForage.config({
   name: 'Photos',
});

const undoRedoRefreshLink = new ApolloLink((operation, forward) => {
   const definition = getMainDefinition(operation.query);
   const isMutation = definition.kind === 'OperationDefinition' && definition.operation === 'mutation';

   if (isMutation && definition.name.value !== 'updatePath') {
      undoRedoRefreshVar(Date.now());
   }
   return forward(operation);
});

const queueLink = new QueueLink();
window.addEventListener('offline', () => queueLink.close());
window.addEventListener('online', () => queueLink.open());

const httpLink = new ApolloLink.from([
   new RetryLink(),
   queueLink,
   authLink,
   undoRedoRefreshLink,
   new HttpLink({uri: ENDPOINT}),
]);

const wsLink = new GraphQLWsLink(
   createClient({
      url: WSENDPOINT,
      connectionParams: async () => {
         const token = await getAccessToken();
         return {
            accesstoken: token,
         };
      },
   }),
);

// Determine the link to used based on the operation definition
//    (allows use of the WB link for subscriptions without affecting the main graphql link)
const splitLink = split(
   ({query}) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
   },
   wsLink,
   httpLink,
);

const client = new ApolloClient({
   link: splitLink,
   cache: new InMemoryCache(),
});

// Add the format command for adding parameters to strings. For Example:
//    'This is a test: {testName}'.format({testName: 'Test Hello World'})
if (!String.prototype.format) {
   // eslint-disable-next-line
   String.prototype.format = function (values) {
      return this.replace(/{(\w+)}/g, function (match, key) {
         return typeof values[key] !== 'undefined' ? values[key] : match;
      });
   };
}

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

let img = new Image();
img.src = LOGO;

// intercom
window.Intercom('boot', {
   app_id: INTERCOM_APP_ID,
});

root.render(
   <React.StrictMode>
      <SuspenseLx fallback={<Loading isLoading />}>
         <DndProvider backend={HTML5Backend}>
            <RecoilRoot>
               <ApolloProvider client={client}>
                  <BrowserRouter>
                     <StyledEngineProvider injectFirst>
                        <ThemeProvider>
                           <App />
                        </ThemeProvider>
                     </StyledEngineProvider>
                  </BrowserRouter>
               </ApolloProvider>
            </RecoilRoot>
         </DndProvider>
      </SuspenseLx>
   </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
