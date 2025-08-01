import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {orderBy} from 'lodash';
import {find} from 'lodash';
import {omit} from 'lodash';
import React, {useState, useMemo, useEffect} from 'react';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import {CLIENT_EDIT} from '../../Constants';
import {ADMIN_SETUP_PATH} from '../../Constants';
import {ADMIN_FULL_PATH} from '../../Constants';

import {CLIENT_ALL_WHERE_QUERY} from '../../data/QueriesGL';
import AutocompleteMatchLXData from '../../fhg/components/edit/AutocompleteMatchLXData';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../fhg/hooks/useNavigateSearch';
import {userRoleState} from '../Main';

const useStyles = makeStyles(
   (theme) => ({
      autocompleteStyle: {
         '& div[data-tag-index="0"]': {
            backgroundColor: 'rgba(223,235,209,0.35)',
         },
         '&:not(.Mui-focused).error .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
            border: '1px red solid',
            boxShadow: '0px 4px 10px rgb(251 188 188 / 60%)',
         },
         '& .Mui-focused.MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
            border: 'none',
         },
         '& .MuiChip-label': {
            color: theme.palette.mode !== 'dark' ? '#000' : '#fff',
            fontSize: '14px',
            fontWeight: '600',
         },
         '& .MuiInputBase-input': {
            color: theme.palette.mode !== 'dark' ? '#000' : '#fff',
            fontSize: '14px',
            fontWeight: '600',
         },
         '& .Mui-focused': {
            borderColor: 'green',
         },
      },
   }),
   {name: 'ClientListDropDown'},
);

/**
 * The AppBar with search and export to CSV capabilities.
 */
export default function ClientListDropDown() {
   const [{franchiseId: franchiseIdProp, clientId}, setSearchParams] = useCustomSearchParams();
   const [{franchiseId: franchiseIdRole, clientId: clientIdUser, isAdmin}, setUserRole] = useRecoilState(userRoleState);
   const theme = useTheme();
   const navigate = useNavigateSearch();
   const franchiseId = franchiseIdProp || franchiseIdRole;

   const [clientIdState, setClientIdState] = useState(clientId);

   const classes = useStyles();

   const [data, {loading}] = useQueryFHG(
      CLIENT_ALL_WHERE_QUERY,
      {variables: {franchiseId, isBank: false}, skip: !isAdmin || !validate(franchiseId)},
      'client.type',
   );

   const clients = useMemo(() => {
      if (franchiseId && data?.clients?.length > 0) {
         return orderBy(data?.clients, ['freeTrialActive', 'isFreemium', 'name'], ['desc', 'desc', 'asc']);
      }
      return [];
   }, [data?.clients, franchiseId]);

   useEffect(() => {
      // If admin and fetch returned clients, and there is no clientId in the URL.
      if (isAdmin && clients.length > 0 && clientId === undefined) {
         // Precedence order is localStorage and then first client in the list.
         const first = find(clients, {id: localStorage.defaultClientId}) || clients[0];
         setClientIdState(first.id);
         setUserRole((role) => ({...role, clientId: clientId ?? first.id}));

         if (clientId) {
            setSearchParams((params) => ({...params, clientId}));
         } else {
            setSearchParams((params) => ({...omit(params, 'entityId'), ...{clientId: first.id}}));
         }
      }
   }, [clients, isAdmin, clientId]);

   useEffect(() => {
      if (isAdmin && data && !(data?.clients?.length > 0) && !loading) {
         navigate(`../${ADMIN_FULL_PATH}/${ADMIN_SETUP_PATH}/${CLIENT_EDIT}`);
      }
   }, [data, isAdmin, loading, navigate]);

   useEffect(() => {
      if (isAdmin) {
         setClientIdState(clientId);
      }
   }, [clientId, isAdmin]);

   useEffect(() => {
      if (clientId && isAdmin) {
         setClientIdState(clientId);
         setUserRole((role) => ({...role, clientId}));
      } else if (clientIdUser) {
         setClientIdState(clientIdUser);
      } else {
         setClientIdState(undefined);
      }
   }, [clientId, clientIdUser, isAdmin, setUserRole]);

   const handleChange = (event, value, reason, newValue, name) => {
      if (isAdmin) {
         setClientIdState(newValue[name]);
         localStorage.defaultClientId = newValue[name];
         setUserRole((role) => ({...role, clientId: newValue[name]}));
         setSearchParams((params) => ({...omit(params, 'entityId'), ...newValue}));
      }
   };

   const notSelected = useMemo(() => !clientIdState || clientIdState?.length === 0, [clientIdState]);

   if (isAdmin && clients?.length > 0 && franchiseId) {
      return (
         <AutocompleteMatchLXData
            key={'clientSelect ' + clients?.length}
            name={'clientId'}
            className={`${classes.autocompleteStyle} ${notSelected ? 'error' : ''}`}
            labelKey={'setup.client.label'}
            options={clients}
            autoFocus={false}
            disableClearable
            onChange={handleChange}
            value={clientIdState}
            variant='outlined'
            placeholder={'Select Client'}
            textFieldProps={{variant: 'outlined'}}
            matchSorterProps={false}
            groupBy={(option) => {
               if (option.freeTrialActive) {
                  return 'Free Trial';
               } else if (!!option.isFreemium) {
                  return 'Freemium';
               }
               return 'Subscription';
            }}
            noOptionsText={
               <div>
                  <div>No Clients.</div>
                  <div>Create a new client.</div>
               </div>
            }
            inputProps={{style: {backgroundColor: theme.palette.background.default}}}
         />
      );
   }
   return null;
}
