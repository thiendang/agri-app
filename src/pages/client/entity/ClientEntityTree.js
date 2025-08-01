import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import groupBy from 'lodash/groupBy';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import Header from '../../../components/Header';
import {BUSINESS_STRUCTURE_INDEX, DARK_MODE_COLORS, DATE_DB_FORMAT, SCALE_APP} from '../../../Constants';
import {ENTITIES_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import {EDIT_PATH} from '../../../Constants';
import {PASSIVE_ROOT_ID} from '../../../Constants';
import {ACTIVE_ROOT_ID} from '../../../Constants';
import {ROOT_ID} from '../../../Constants';
import {ENTITY_EDIT} from '../../../Constants';
import {ENTITY_CREATE_UPDATE} from '../../../data/QueriesGL';
import {ENTITY_DELETE} from '../../../data/QueriesGL';
import {getEntityCacheQueries} from '../../../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../../../data/QueriesGL';
import TreeViewFHG from '../../../fhg/components/tree/TreeViewFHG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {removeOne} from '../../../fhg/utils/Utils';
import EntityCard from '../../admin/EntityCard';
import {userRoleState} from '../../Main';
import {entityState} from '../../admin/EntityListDropDown';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import Grid from '../../../fhg/components/Grid';
import {useTheme} from '@mui/styles';
import moment from 'moment';

const STATIC_NODE_HEIGHT = 120 * SCALE_APP;

const useStyles = makeStyles(
   (theme) => ({
      root: {
         display: 'flex',
         height: '100%',
         position: 'relative',
         flexDirection: 'column',
      },
      headerStyle: {
         zIndex: theme.zIndex.drawer,
         position: 'absolute',
         top: 0,
         left: 0,
         background: theme.palette.background.default,
         '& .title-page-margin': {
            marginBottom: theme.spacing(1),
         },
      },
      contentStyle: {
         position: 'relative',
         padding: theme.spacing(6, 3),
         [theme.breakpoints.down('md')]: {
            padding: `${theme.spacing(2)} 3px`,
         },
         overflow: 'auto',
         maxHeight: '100%',
      },
      exportButtonStyle: {
         zIndex: theme.zIndex.drawer,
         left: 0,
         right: 0,
         '& .title-page-margin': {
            marginBottom: theme.spacing(0.5),
         },
         '& .title-page': {
            background: theme.palette.background.default,
         },
         overflow: 'visible',
      },
   }),
   {name: 'DashboardStyles'},
);

/**
 * ClientEntityTree component for the clients. Displays two levels at the client level and at the entity level.
 *
 * Reviewed: 5/28/21
 */
export default function ClientEntityTree() {
   const [{clientId: clientIdProp, entityId, search}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const hasPermission = usePermission(ENTITIES_EDIT);
   const historyDate = moment().startOf('month').format(DATE_DB_FORMAT);
   const clientId = userClientId || clientIdProp;
   const classes = useStyles();
   const navigate = useNavigateSearch();
   const location = useLocation();

   const setEntityStatus = useSetRecoilState(entityState);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   const [entitiesData] = useQueryFHG(ENTITY_CLIENT_QUERY, {
      variables: {clientId},
      skip: !validate(clientId),
      pollInterval,
   });
   const [entityDelete] = useMutationFHG(ENTITY_DELETE);
   const [entityCreateUpdate] = useMutationFHG(ENTITY_CREATE_UPDATE);
   const [newEntity, setNewEntity] = useState();

   useEffect(() => {
      if (newEntity && location?.state?.edit !== ENTITY_EDIT) {
         removeOne(newEntity?.entity?.entities, newEntity?.entity?.entities.length - 1);
         setNewEntity(undefined);
      }
   }, [newEntity, location.state]);

   const [rootEntity, setRootEntity] = useState({
      id: ROOT_ID,
      name: 'Agri Game Plan',
      isEditable: false,
      hasAdd: false,

      height: 220 * SCALE_APP,
      entities: [
         {
            id: ACTIVE_ROOT_ID,
            name: 'Active Income',
            height: STATIC_NODE_HEIGHT,
            isActive: true,
            isEditable: false,
            entities: [],
         },
         {
            id: PASSIVE_ROOT_ID,
            name: 'Passive Income',
            height: STATIC_NODE_HEIGHT,
            isActive: false,
            isEditable: false,
            entities: [],
         },
      ],
   });

   useEffect(() => {
      if (entitiesData?.entities) {
         const entities = cloneDeep(entitiesData.entities);
         const entitiesGroupBy = groupBy(entities, 'entityId');

         for (const [id, childEntities] of Object.entries(entitiesGroupBy)) {
            if (id !== null && id !== 'null') {
               const entitiesGroupByElement = find(entities, {id});

               if (entitiesGroupByElement) {
                  entitiesGroupByElement.entities = childEntities;
               } else {
                  console.log('Could not find element.', id);
               }
            }
         }

         const topGroupBy = groupBy(entitiesGroupBy['null'], 'isActive');
         setRootEntity({
            id: ROOT_ID,
            name: 'Agri Game Plan',
            isEditable: false,
            hasAdd: false,
            height: STATIC_NODE_HEIGHT,
            entities: [
               {
                  id: ACTIVE_ROOT_ID,
                  name: 'Active Income',
                  isActive: true,
                  height: STATIC_NODE_HEIGHT,
                  isEditable: false,
                  entities: topGroupBy.true,
               },
               {
                  id: PASSIVE_ROOT_ID,
                  name: 'Passive Income',
                  isActive: false,
                  height: STATIC_NODE_HEIGHT,
                  isEditable: false,
                  entities: topGroupBy.false,
               },
            ],
         });
      }
   }, [entitiesData?.entities]);

   const handleAdd = (entity) => {
      const parentEntityId = entity?.id !== ACTIVE_ROOT_ID && entity?.id !== PASSIVE_ROOT_ID ? entity?.id : undefined;
      const newEntity = {
         clientId,
         ein: '',
         entityId: parentEntityId,
         isActive: entity?.isActive,
         isDeleted: false,
         name: 'Untitled',
         files: [],
      };

      setNewEntity({newEntity, entity});
      if (!entity.entities) {
         entity.entities = [newEntity];
      } else {
         entity.entities.push(newEntity);
      }

      // setDefaultExpanded([entity?.id]);
      navigate(EDIT_PATH, {
         replace: true,
         state: {edit: ENTITY_EDIT, parentEntityId, id: undefined, isActive: entity?.isActive},
      });
   };

   const handleEdit = (entity) => {
      navigate(EDIT_PATH, {replace: true, state: {edit: ENTITY_EDIT, id: entity?.id}});
   };

   const handleDelete = async (entity) => {
      if (entity?.id) {
         await entityDelete({
            variables: {id: entity?.id},
            optimisticResponse: {entity_Delete: 1},
            update: cacheDelete(getEntityCacheQueries(clientId), entity.id),
         });
      }
   };

   const handleMove = async (droppedItem, parentItem) => {
      if (droppedItem?.id !== parentItem?.id) {
         try {
            const entityId =
               parentItem?.id !== ACTIVE_ROOT_ID && parentItem?.id !== PASSIVE_ROOT_ID ? parentItem?.id : null;
            let variables = {
               id: droppedItem?.id,
               entityId,
               isActive: parentItem?.isActive,
            };

            await entityCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  entity: {
                     __typename: 'Entity',
                     ...droppedItem,
                     ...variables,
                     isDeleted: false,
                  },
               },
            });
         } catch (e) {
            //Intentionally left blank
         }
      }
   };

   const theme = useTheme();

   usePageTitle({titleKey: 'balance.entities.label'});

   const {scaleStyle, buttonPanel} = useScalePanel({
      top: 0,
      backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_2 : 'white',
      opacity: 1,
      position: 'relative',

      propertyKey: 'businessStructure',
   });

   return (
      <Grid container className={classes.root} fullHeight>
         <Box name={'HeaderFrame'} className={classes.exportButtonStyle}>
            <Header
               idTitle='entity.chart.title'
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
               }}
            >
               <Box flex={1} display='flex' flexDirection='row' alignItems='center' justifyContent='flex-end'>
                  {buttonPanel}
                  <ExportPdfChoiceButton
                     clientId={clientId}
                     selectedIndex={BUSINESS_STRUCTURE_INDEX}
                     entityIds={entityId}
                     historyDate={historyDate}
                     itemsKey={'entities'}
                  />
               </Box>
            </Header>
         </Box>
         <Grid name='Business Structure Chart Grid' container item resizable className={classes.contentStyle}>
            <Box
               name='ScaleFrame'
               // height={'100%'}
               width={'100%'}
               position={'relative'}
               overflow={'hidden'}
               flex={'1 1 0%'}
               display={'flex'}
            >
               <Box name='Scale Grid' overflow={'auto'} width={'100%'} display={'flex'}>
                  <Box name='Scale Contents' marginLeft='auto' marginRight='auto' style={{...scaleStyle}}>
                     <TreeViewFHG
                        key={'TreeView' + clientId}
                        expandAll={true}
                        ContentComponent={EntityCard}
                        confirmRemoveTitleKey={'entity.confirmRemoveValue.title'}
                        confirmRemoveMessageKey={'entity.confirmRemoveValue.message'}
                        item={rootEntity}
                        labelKey={'name'}
                        itemsKey={'entities'}
                        parentKey={'entityId'}
                        onEdit={hasPermission && handleEdit}
                        onAdd={hasPermission && handleAdd}
                        onMove={hasPermission && handleMove}
                        onDelete={hasPermission && handleDelete}
                        height={220 * SCALE_APP}
                        width={260 * SCALE_APP}
                        search={search}
                     />
                  </Box>
               </Box>
            </Box>
         </Grid>
      </Grid>
   );
}
