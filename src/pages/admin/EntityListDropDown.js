import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {map, pullAll} from 'lodash';
import {pullAllBy} from 'lodash';
import {castArray} from 'lodash';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import split from 'lodash/split';
import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {useRecoilValue} from 'recoil';
import {atom} from 'recoil';
import {useRecoilState} from 'recoil';

import {validate} from 'uuid';
import {ENTITY_CLIENT_QUERY} from '../../data/QueriesGL';
import AutocompleteMatchLXData from '../../fhg/components/edit/AutocompleteMatchLXData';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import useEffect from '../../fhg/hooks/useEffect';
import {findByIdByValueOrder} from '../../fhg/utils/Utils';
import {formatMessage} from '../../fhg/utils/Utils';
import {userStatus} from '../../fhg/components/security/AuthenticatedUser';
import {useLocation} from 'react-router-dom';
import {BALANCE_SHEET_PATH} from '../../Constants';

export const entityState = atom({
   key: 'entityState',
   default: {allEntities: false, useSingleEntity: false, entities: [], clientId: null},
});

const useStyles = makeStyles(
   (theme) => ({
      autocompleteStyle: {
         '& div[data-tag-index]': {
            backgroundColor: theme.palette.mode !== 'dark' ? 'rgba(223,235,209,0.35)' : '#4C5343',
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
export default function EntityListDropDown() {
   const [{clientId: clientIdProp, entityId}, setSearchParams, , removeSearch] = useCustomSearchParams();
   const intl = useIntl();

   const [entityStatus, setEntityStatus] = useRecoilState(entityState);

   const user = useRecoilValue(userStatus);

   const clientId = useMemo(() => clientIdProp || user?.clientId, [clientIdProp, user?.clientId]);

   const classes = useStyles();
   const theme = useTheme();

   // const [entityIdState, setEntityIdState] = useState(!!entityId ? castArray(entityId) : null);

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {
      variables: {clientId},
      skip: !validate(clientId),
   });
   const entityList = useMemo(
      () => (clientId ? sortBy(entitiesData?.entities || [], 'name') : []),
      [clientId, entitiesData?.entities],
   );

   // If the entityStatus isn't initialized, initialize it. If the client selection changes, delete the entity list.
   useEffect(() => {
      function getDefaultEntity() {
         let useEntity;

         if (entityId) {
            useEntity = findByIdByValueOrder(entityList, castArray(entityId));
         }
         if (!useEntity || useEntity?.length === 0) {
            useEntity = find(entityList, {isPrimary: true});
            if (!useEntity) {
               if (localStorage.defaultEntityId) {
                  if (localStorage.defaultEntityId !== '-1') {
                     const listDefaultEntityId = split(localStorage.defaultEntityId, ',');
                     useEntity = findByIdByValueOrder(entityList, listDefaultEntityId);
                     if (!(useEntity?.length > 0)) {
                        useEntity = entityList?.[0];
                     }
                  }
               } else {
                  useEntity = entityList?.[0];
               }
            }
         }
         return useEntity;
      }

      if (entityList?.length > 0) {
         // If the entityStatus is not initialized, initialize it from the search params.
         if (!entityStatus?.clientId && !!clientId) {
            let useEntity = getDefaultEntity();

            setEntityStatus((status) => ({
               ...status,
               allEntities: entityId === 0,
               clientId,
               entities: entityId === 0 ? map(entityList, 'id') : map(castArray(useEntity), 'id'),
            }));

            // Since the entityId wasn't set, add it to the URL.
            if (entityId === undefined) {
               setSearchParams((params) => ({...params, entityId: map(castArray(useEntity), 'id')}));
            }

            // If the entityStatus is initialized, but the client changed, remove the entity list.
         } else if (
            entityStatus?.clientId &&
            clientId !== entityStatus?.clientId &&
            (entityId !== undefined || entityStatus?.allEntities || entityStatus.entities?.length > 0)
         ) {
            let useEntity = find(entityList, {isPrimary: true});
            if (!useEntity || useEntity?.length === 0) {
               useEntity = find(entityList, {id: localStorage.defaultEntityId}) || entityList?.[0];
            }
            const entityId = useEntity?.id;
            setSearchParams((params) => ({...params, entityId}));

            setEntityStatus((status) => ({
               ...status,
               allEntities: false,
               clientId,
               entities: castArray(entityId),
            }));
         } else if (!entityId) {
            let useEntity = getDefaultEntity();

            setEntityStatus((status) => ({
               ...status,
               allEntities: entityId === 0,
               clientId,
               entities: entityId === 0 ? map(entityList, 'id') : map(castArray(useEntity), 'id'),
            }));

            // Since the entityId wasn't set, add it to the URL.
            setSearchParams((params) => ({...params, entityId: map(castArray(useEntity), 'id')}));
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [clientId, entityId, entityList, entityStatus?.clientId]);

   const entities = useMemo(() => {
      if (entityList?.length > 0) {
         if (entityStatus.useSingleEntity) {
            return entityList;
         }
         return [{id: 0, isDefault: 0, name: 'All Businesses'}, ...entityList];
      } else {
         return [];
      }
   }, [entityList, entityStatus.useSingleEntity]);

   // if the useSingleEntity changed, ensure only one entity is selected.
   useEffect(() => {
      // if the list of entities has been received from server
      if (entities?.length > 0) {
         // If the dropdown should only allow a single entity and more than one entity is currently selected.
         if (entityStatus.useSingleEntity && (entityStatus?.entities?.length > 1 || entityId === 0)) {
            // Use the first selected entity.
            const useEntity = entityStatus?.entities?.[0] || entities?.[0]?.id;
            setSearchParams((params) => ({...params, entityId: useEntity}));
            setEntityStatus((status) => ({...status, allEntities: false, clientId, entities: [useEntity]}));
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [clientId, entities, entityStatus]);

   const handleEntityChange = (event, value, reason, newValue, name) => {
      if (reason === 'selectOption') {
         const allEntityItem = find(value, {id: 0});
         const allEntities = entityStatus.useSingleEntity || entityStatus.allEntities ? false : allEntityItem;

         // If "All Businesses" remove all other entities from the list and select only "All Businesses".
         if (allEntities) {
            setSearchParams((params) => {
               return {...params, [name]: [0]};
            });
            setEntityStatus((status) => ({...status, allEntities: true, clientId, entities: map(entityList, 'id')}));
         } else {
            // If an entity was selected but "All Businesses" was already selected, remove "All Businesses".
            if (allEntityItem) {
               pullAllBy(value, [allEntityItem], 'id');
               pullAll(newValue[name], [0]);

               //If only a single entity allowed and more than one entity is selected, remove the previous one.
            } else if (entityStatus.useSingleEntity && value?.length > 1) {
               value.shift();
               newValue[name]?.shift();
            }
            setSearchParams((params) => {
               return {...params, ...newValue};
            });

            localStorage.defaultEntityId = newValue?.entityId;
            setEntityStatus((status) => ({
               ...status,
               allEntities: false,
               clientId,
               entities: Array.isArray(newValue?.entityId) ? newValue?.entityId : [newValue?.entityId],
            }));
         }
      } else if (reason === 'removeOption') {
         setSearchParams((params) => {
            return {...params, ...newValue};
         });
         localStorage.defaultEntityId =
            !newValue?.entityId || !newValue?.entityId?.length === 0 ? '-1' : newValue?.entityId;
         setEntityStatus((status) => ({
            ...status,
            allEntities: false,
            clientId,
            entities: Array.isArray(newValue?.entityId) ? newValue?.entityId : [newValue?.entityId],
         }));
      }
   };
   const isValueSingle = !(entityStatus?.entities?.length > 1) ? entityStatus.useSingleEntity : false;
   const notSelected = useMemo(() => !(entityStatus?.entities?.length > 0), [entityStatus?.entities?.length]);

   if (entities?.length > 0 && entityStatus.useSingleEntity === isValueSingle) {
      return (
         <AutocompleteMatchLXData
            id={'entitySelect'}
            key={'entitySelect ' + entities?.length}
            name={'entityId'}
            className={`${classes.autocompleteStyle} ${notSelected ? 'error' : ''}`}
            multiple={!entityStatus.useSingleEntity}
            options={entities}
            labelKey={
               !entityId
                  ? 'contract.option.business'
                  : entityStatus.useSingleEntity
                    ? 'entity.title.label'
                    : 'balance.entities.label'
            }
            autoFocus={false}
            disableClearable
            onChange={handleEntityChange}
            value={
               isValueSingle
                  ? entityStatus?.entities?.[0] || entities?.[0]?.id
                  : entityStatus.allEntities
                    ? [entities?.[0]?.id]
                    : entityStatus?.entities
            }
            textFieldProps={{variant: 'outlined'}}
            matchSorterProps={{keys: ['isDefault', 'name']}}
            noOptionsText={
               <div>
                  <div>No Businesses.</div>
                  <div>Create a new Business.</div>
               </div>
            }
            placeholder={formatMessage(intl, 'contract.option.business')}
            inputProps={{style: {backgroundColor: theme.palette.background.default}}}
         />
      );
   }
   return null;
}
