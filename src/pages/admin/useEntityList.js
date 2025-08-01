// import {useTheme} from '@mui/material/styles';
// import makeStyles from '@mui/styles/makeStyles';
// import {map, pullAll} from 'lodash';
// import {pullAllBy} from 'lodash';
// import {castArray} from 'lodash';
// import find from 'lodash/find';
// import sortBy from 'lodash/sortBy';
// import React, {useMemo} from 'react';
// import {useRecoilValue} from 'recoil';
// import {atom} from 'recoil';
// import {useRecoilState} from 'recoil';
//
// import {validate} from 'uuid';
// import {ENTITY_CLIENT_QUERY} from '../../data/QueriesGL';
// import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
// import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
// import useEffect from '../../fhg/hooks/useEffect';
// import {userRoleState} from '../Main';
//
// export const entityState = atom({
//    key: 'entityState',
//    default: {allEntities: false, useSingleEntity: true, entities: [], clientId: null},
// });
//
// const useStyles = makeStyles(
//    () => ({
//       autocompleteStyle: {
//          '& div[data-tag-index="0"]': {
//             backgroundColor: 'rgba(223,235,209,0.35)',
//          },
//          '&:not(.Mui-focused).error .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
//             border: '1px red solid',
//             boxShadow: '0px 4px 10px rgb(251 188 188 / 60%)',
//          },
//          '& .Mui-focused.MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
//             border: 'none',
//          },
//       },
//    }),
//    {name: 'ClientListDropDown'}
// );
//
// /**
//  * The AppBar with search and export to CSV capabilities.
//  */
// export default function useEntityList() {
//    const [{clientId: clientIdProp, entityId}, setSearchParams, , removeSearch] = useCustomSearchParams();
//    const {clientId: userClientId} = useRecoilValue(userRoleState);
//    const clientId = userClientId || clientIdProp;
//
//    const [entityStatus, setEntityStatus] = useRecoilState(entityState);
//
//    const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {
//       variables: {clientId},
//       skip: !validate(clientId),
//    });
//    const entityList = useMemo(
//       () => (clientId ? sortBy(entitiesData?.entities || [], 'name') : []),
//       [clientId, entitiesData?.entities]
//    );
//
//    // If the entityStatus isn't initialized, initialize it. If the client selection changes, delete the entity list, unless "All Businesses" is selected.
//    useEffect(() => {
//       // If the entityStatus is not initialized, initialize it from the search params.
//       if (!entityStatus?.clientId && !!clientId) {
//          setEntityStatus((status) => ({
//             ...status,
//             allEntities: entityId === 0,
//             clientId,
//             entities: entityId === 0 ? map(castArray(entityId) : [],
//          }));
//
//          // If the entityStatus is initialized, but the clientId has changed, remove the entity list.
//       } else if (
//          entityStatus?.clientId &&
//          clientId !== entityStatus?.clientId &&
//          entityId !== undefined &&
//          entityId !== 0
//       ) {
//          removeSearch('entityId');
//          setEntityStatus((status) => ({...status, allEntities: false, clientId, entities: []}));
//       }
//    }, [clientId, entityId, entityStatus?.clientId, removeSearch]);
//
//    const entities = useMemo(() => {
//       if (entityList?.length > 0) {
//          if (entityStatus.useSingleEntity) {
//             return entityList;
//          }
//          return [{id: 0, isDefault: 0, name: 'All Businesses'}, ...entityList];
//       } else {
//          return [];
//       }
//    }, [entityList, entityStatus.useSingleEntity]);
//
//    // if the useSingleEntity changed, ensure only one entity is selected.
//    useEffect(() => {
//       // if the list of entities has been received from server
//       if (entities?.length > 0) {
//          // If the dropdown should only allow a single entity and more than one entity is currently selected.
//          if (entityStatus.useSingleEntity && (entityStatus?.entities?.length > 1 || entityId === 0)) {
//             // Use the first selected entity.
//             const useEntity = entityStatus.entities[0];
//
//             setSearchParams((params) => ({...params, entityId: useEntity}));
//             setEntityStatus((status) => ({...status, allEntities: false, clientId, entities: [useEntity]}));
//          }
//       }
//    }, [clientId, entities, entityId, entityStatus?.entities, entityStatus?.useSingleEntity]);
//
//    // if "All Businesses" is selected, ensure the entities are from the correct client.
//    useEffect(() => {
//       // if the list of entities has been received from server
//       if (entities?.length > 0) {
//          // if entityStatus is initialized, and the client changed for "All Businesses", get the new entities.
//          if (entityStatus?.clientId && clientId && clientId !== entityStatus?.clientId && entityId === 0) {
//            setEntityStatus((status) => ({
//                ...status,
//                allEntities: true,
//                entities: map(entityList, 'id'),
//                clientId,
//             }));
//          }
//       }
//    }, [clientId, entities, entityId, entityList, entityStatus.useSingleEntity, setEntityStatus, setSearchParams]);
//
//    const handleEntityChange = (event, value, reason, newValue, name) => {
//       if (reason === 'selectOption') {
//          const allEntityItem = find(value, {id: 0});
//          const allEntities = entityStatus.useSingleEntity || entityStatus.allEntities ? false : allEntityItem;
//
//          // If "All Businesses" remove all other entities from the list and select only "All Businesses".
//          if (allEntities) {
//             setSearchParams((params) => {
//                return {...params, [name]: [0]};
//             });
//             debugger;
//             setEntityStatus((status) => ({...status, allEntities: true, clientId, entities: map(entityList, 'id')}));
//          } else {
//             // If an entity  was selected but "All Businesses" was already selected, remove "All Businesses".
//             if (allEntityItem) {
//                pullAllBy(value, [allEntityItem], 'id');
//                pullAll(newValue[name], [0]);
//
//                //If only a single entity allowed and more than one entity is selected, remove the previous one.
//             } else if (entityStatus.useSingleEntity && value?.length > 1) {
//                value.shift();
//                newValue[name]?.shift();
//             }
//             setSearchParams((params) => {
//                return {...params, ...newValue};
//             });
//
//             if (value && value?.length > 0) {
//                localStorage.primaryEntity = value[0].id;
//             }
//             setEntityStatus((status) => ({...status, allEntities: false, clientId, entities: newValue?.entityId}));
//          }
//       } else if (reason === 'removeOption') {
//          setSearchParams((params) => {
//             return {...params, ...newValue};
//          });
//          if (value && value?.length > 0) {
//             localStorage.primaryEntity = value[0].id;
//          }
//          setEntityStatus((status) => ({...status, allEntities: false, clientId, entities: newValue?.entityId}));
//       }
//    };
//
// }
