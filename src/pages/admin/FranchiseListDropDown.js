import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {omit} from 'lodash';
import React, {useState, useMemo, useEffect} from 'react';
import {useSetRecoilState} from 'recoil';
import {useRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';

import {FRANCHISE_ALL_QUERY} from '../../data/QueriesGL';
import AutocompleteMatchLXData from '../../fhg/components/edit/AutocompleteMatchLXData';
import {userStatus} from '../../fhg/components/security/AuthenticatedUser';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import {userRoleState} from '../Main';
import {entityState} from './EntityListDropDown';

const useStyles = makeStyles(
   () => ({
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
      },
   }),
   {name: 'FranchiseListDropDown'},
);

/**
 * The AppBar with search and export to CSV capabilities.
 */
export default function FranchiseListDropDown() {
   const [{franchiseId}, setSearchParams] = useCustomSearchParams();
   const theme = useTheme();
   const user = useRecoilValue(userStatus);
   const [{isSuperAdmin}, setUserRole] = useRecoilState(userRoleState);
   const setEntityStatus = useSetRecoilState(entityState);

   const [franchiseIdState, setFranchiseIdState] = useState(franchiseId);

   const classes = useStyles();

   const [data] = useQueryFHG(FRANCHISE_ALL_QUERY, {skip: !isSuperAdmin}, 'franchise.type');
   const franchises = useMemo(() => data?.franchises || [], [data]);

   useEffect(() => {
      if (franchiseId && isSuperAdmin) {
         setFranchiseIdState(franchiseId);
         setUserRole((role) => ({
            ...role,
            franchiseId,
         }));
      } else if (localStorage.defaultFranchiseId) {
         setFranchiseIdState(localStorage.defaultFranchiseId);
      } else if (user?.franchiseId) {
         setFranchiseIdState(user?.franchiseId);
      }
      // Don't update for the franchiseId.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isSuperAdmin, setUserRole, user?.franchiseId]);

   const handleChange = (event, value, reason, newValue, name) => {
      if (isSuperAdmin) {
         setFranchiseIdState(newValue[name]);
         localStorage.defaultFranchiseId = newValue[name];
         setUserRole((role) => ({
            ...role,
            franchiseId: newValue[name],
            clientId: null,
            entityId: null,
         }));
         setEntityStatus({
            allEntities: false,
            useSingleEntity: false,
            entities: [],
            clientId: null,
         });

         setSearchParams((params) => ({...omit(params, ['clientId', 'entityId']), ...newValue}));
      }
   };

   const notSelected = useMemo(() => !franchiseIdState || franchiseIdState?.length === 0, [franchiseIdState]);

   if (isSuperAdmin) {
      return (
         <AutocompleteMatchLXData
            key={'franchiseSelect ' + franchises?.length}
            name={'franchiseId'}
            className={`${classes.autocompleteStyle} ${notSelected ? 'error' : ''}`}
            labelKey={'franchise.title.label'}
            options={franchises}
            autoFocus={false}
            disableClearable
            onChange={handleChange}
            value={franchiseIdState}
            variant='outlined'
            placeholder={'Select Licensee'}
            textFieldProps={{variant: 'outlined'}}
            matchSorterProps={{keys: ['name']}}
            noOptionsText={
               <div>
                  <div>No Licensee.</div>
                  <div>Create a new licensee.</div>
               </div>
            }
            inputProps={{style: {backgroundColor: theme.palette.background.default}}}
         />
      );
   }
   return null;
}
