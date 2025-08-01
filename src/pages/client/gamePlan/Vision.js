import React, {useCallback, useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {BORDER_RADIUS_10, DARK_MODE_COLORS} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import Grid from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import CoreValueItem from './CoreValueItem';
import FormAddCoreValue from './FormAddCoreValue';
import FormAddOurWhy from './FormAddOurWhy';
import FormAddWhoWeServe from './FormAddWhoWeServe';
import EditIcon from './EditIcon';
import {useToggle} from './hooks/useToggle';
import {useOurWhy} from './hooks/useOurWhy';
import {useWhoWeServe} from './hooks/useWhoWeServe';
import DragItem from '../../../fhg/components/list/DragItem';
import update from 'immutability-helper';
import {useRef} from 'react';
import {useMemo} from 'react';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import {
   CORE_VALUE_CREATE,
   CORE_VALUE_DELETE,
   CORE_VALUE_GET,
   CORE_VALUE_UPDATE,
   ENTITY_BY_ID_QUERY,
   ENTITY_UPDATE,
   getCoreValuesCacheQueries,
} from '../../../data/QueriesGL';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import Loading from '../../../fhg/components/Loading';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {validate} from 'uuid';
import {debounce, filter, findIndex, omit, pick, sortBy} from 'lodash';
import {convertTimeToShortFormat, createUUID, getLatestDate} from '../../../components/utils/helpers';
import {useErrorGamePlan} from './hooks/useError';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, Button, List} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import {cacheDelete} from '../../../fhg/utils/DataUtil';

const useStyles = makeStyles((theme) => ({
   view: {
      backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_1 : '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
   },
   list: {
      paddingLeft: '0px !important',
   },
   item: {
      listStyleType: 'none',
      width: '100%',
      padding: '0px !important',
   },
   listContainer: {
      backgroundColor: 'red',
   },
   modal: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      boxShadow: 24,
      padding: theme.spacing(4),
      borderRadius: 5 * SCALE_APP,
   },
   editor: {
      color: theme.palette.text.primary,
      fontSize: 18 * SCALE_APP,
   },
   title: {
      fontWeight: '600',
      color: theme.palette.text.primary,
   },
}));

const Vision = () => {
   const theme = useTheme();
   const classes = useStyles();
   const {isToggle, toggle} = useToggle();
   const {editable, toggleEditable} = useOurWhy();
   const {toggleEditableWhoWeServe, editableWhoWeServe} = useWhoWeServe();
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const [{entityId}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);

   const [createCoreValueQuery, {loading}] = useMutationFHG(CORE_VALUE_CREATE);
   const [updateCoreValueQuery, {loading: loadingUpdate}] = useMutationFHG(CORE_VALUE_UPDATE);
   const [deleteCoreValueQuery, {loading: loadingDelete}] = useMutationFHG(CORE_VALUE_DELETE);
   const [data, {loading: loadingGet, refetch}] = useQueryFHG(CORE_VALUE_GET, {
      variables: {coreValueSearch: {entityId}},
      skip: !validate(entityId),
      pollInterval,
   });
   const [entityData] = useQueryFHG(
      ENTITY_BY_ID_QUERY,
      {variables: {entityId}, skip: !validate(entityId), pollInterval},
      'entity.type',
   );

   const [entityUpdate] = useMutationFHG(ENTITY_UPDATE);

   const {ourWhyHeader, ourWhyText, whoWeServe, whyUpdateDateTime, whoUpdateDateTime} = entityData?.entity ?? {};

   const {setError} = useErrorGamePlan();

   const intl = useIntl();

   useEffect(() => {
      if (entityId === 'undefined' || typeof entityId === 'undefined') {
         return setError({
            isShow: true,
            message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
         });
      }
   }, [entityId, intl, setError]);

   const handleUpdateOurWhy = useCallback(
      (data) => async () => {
         try {
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await entityUpdate({
               variables: {
                  entityId,
                  entity: {
                     ...pick(entityData?.entity, ['name']),
                     ourWhyHeader: data.title,
                     ourWhyText: data.content,
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  entity_Update: {
                     __typename: 'Entity',
                     ...entityData?.entity,
                     ourWhyHeader: data.title,
                     ourWhyText: data.content,
                  },
               },
            });
            return true;
         } catch (err) {
            return false;
         }
      },
      [entityId, setError, intl, entityUpdate, entityData?.entity],
   );

   const handleUpdateWhoWeServe = useCallback(
      (content) => async () => {
         try {
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await entityUpdate({
               variables: {
                  entityId,
                  entity: {
                     ...pick(entityData?.entity, ['name']),
                     whoWeServe: content,
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  entity_Update: {
                     __typename: 'Entity',
                     ...entityData?.entity,
                     whoWeServe: content,
                  },
               },
            });
            return true;
         } catch (err) {
            return false;
         }
      },
      [entityId, setError, intl, entityUpdate, entityData?.entity],
   );

   const deleteItem = useCallback(
      (id) => async () => {
         try {
            if (!id) return;
            await deleteCoreValueQuery({
               variables: {
                  coreValueId: id,
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  coreValue_Delete: {
                     __typename: 'CoreValue',
                     id,
                  },
               },
               update: cacheDelete(getCoreValuesCacheQueries(entityId), id, 'coreValue_Delete'),
            });
         } catch (error) {}
      },
      [deleteCoreValueQuery, entityId],
   );

   const updateItem = useCallback(
      (id) => async (data) => {
         try {
            if (!id) return;
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await updateCoreValueQuery({
               variables: {
                  coreValueId: id,
                  coreValue: {
                     entityId,
                     name: data?.name,
                     description: data?.description,
                     orderIndex: data?.orderIndex ?? 0,
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  coreValue_Update: {
                     ...data,
                     id,
                  },
               },
               update: (cache, {data}) => {
                  const newList = [...responsibilitiesRef.current];
                  newList.forEach((element, index) => {
                     newList[index] = {
                        ...newList[index],
                        orderIndex: index,
                     };
                  });
                  const index = newList.findIndex((item) => item.id === id);
                  if (index > -1) {
                     newList[index] = {
                        ...newList[index],
                        ...omit(data?.coreValue_Update || {}, ['orderIndex']),
                     };
                  }
                  cache.writeQuery({
                     query: CORE_VALUE_GET,
                     variables: {coreValueSearch: {entityId}},
                     data: {coreValue_AllWhere: newList},
                  });
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, intl, setError, updateCoreValueQuery],
   );

   const addItem = useCallback(
      async (item) => {
         try {
            const list = data?.coreValue_AllWhere || [];
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await createCoreValueQuery({
               variables: {
                  input: {...item, entityId, orderIndex: filter(list, (e) => !!e.id).length},
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  coreValue_Create: {
                     ...data,
                     __typename: 'CoreValue',
                     id: createUUID(),
                  },
               },
            });
            refetch({coreValueSearch: {entityId}});
            return true;
         } catch (err) {
            return false;
         }
      },
      [createCoreValueQuery, data, entityId, intl, refetch, setError],
   );

   const responsibilitiesRef = useRef([]);

   const [refresh, setRefresh] = useState(Date.now());

   useEffect(() => {
      const list = data?.coreValue_AllWhere || [];
      responsibilitiesRef.current = sortBy([...list], ['orderIndex']);
      setRefresh(Date.now());
   }, [data?.coreValue_AllWhere]);

   const onDrop = useCallback(
      async (v) => {
         const {dropItem} = v ?? {};
         const orderIndex = findIndex(responsibilitiesRef.current, {id: dropItem.id});
         await updateItem(dropItem.id)({...dropItem, orderIndex: orderIndex});
      },
      [updateItem],
   );

   const move = useCallback((dragIndex, hoverIndex) => {
      const responsibilities = [...(responsibilitiesRef.current || [])];
      responsibilitiesRef.current = update(responsibilities, {
         $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, responsibilities[dragIndex]],
         ],
      });
      setRefresh(Date.now());
   }, []);

   const moveColumn = useCallback(debounce(move, 5), [move]);

   const container = useMemo(
      () => ({
         margin: theme.spacing(0.5),
         marginTop: 0,
         marginBottom: theme.spacing(2.5),
         padding: theme.spacing(4, 5),
         backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_1 : theme.palette.background.main,
         boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
         borderRadius: BORDER_RADIUS_10,
      }),
      [theme],
   );

   const hasLoading = useMemo(
      () => loading || loadingGet || loadingDelete || loadingUpdate,
      [loading, loadingGet, loadingDelete, loadingUpdate],
   );

   const time = useMemo(
      () => getLatestDate(data?.coreValue_AllWhere?.map((item) => item.updatedDateTime)),
      [data?.coreValue_AllWhere],
   );

   const renderState = useCallback(() => {
      return (
         <Grid item xs={12}>
            <Box style={container}>
               <Box
                  style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                  }}
               >
                  <TypographyFHG variant='h5' id='gamePlan.coreValue.title' className={classes.title} />
                  <TypographyFHG variant='fs14400' color='text.primary'>
                     {`${formatMessage(intl, 'gamePlan.goal.lastEdit')} ${convertTimeToShortFormat(time)}`}
                  </TypographyFHG>
               </Box>
               <List key={refresh} dense>
                  {responsibilitiesRef.current?.map((item, index) => (
                     <DragItem
                        key={item.id}
                        index={index}
                        className={classes.item}
                        move={moveColumn}
                        dropItem={item}
                        showDragIndicator={false}
                        onDrop={onDrop}
                        disable={!hasPermission}
                     >
                        <CoreValueItem
                           data={item}
                           onRemove={deleteItem}
                           onUpdate={updateItem(item.id)}
                           onCreate={addItem}
                           loading={loading}
                        />
                     </DragItem>
                  ))}
               </List>
               {isToggle && <FormAddCoreValue onCancel={toggle} onSubmit={addItem} isNew />}
               <Box
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                  }}
                  marginLeft={5}
               >
                  <PermissionAllow permissionName={BUSINESS_PLAN_EDIT}>
                     <Button onClick={toggle}>
                        <AddCircleOutlineRoundedIcon
                           style={{
                              color: theme.palette.primary.main,
                              width: 20 * SCALE_APP,
                              height: 20 * SCALE_APP,
                              marginRight: theme.spacing(1),
                           }}
                        />
                        <TypographyFHG variant='fs16700' color='primary' id='gamePlan.coreValue.title.add' />
                     </Button>
                  </PermissionAllow>
               </Box>
            </Box>
         </Grid>
      );
   }, [
      container,
      intl,
      time,
      refresh,
      isToggle,
      toggle,
      addItem,
      theme,
      classes.item,
      moveColumn,
      onDrop,
      deleteItem,
      updateItem,
      loading,
      hasPermission,
   ]);

   const renderMiddle = useCallback(() => {
      return (
         <Grid item xs={12}>
            <Box style={container}>
               <Box
                  style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                  }}
               >
                  <TypographyFHG variant='h5' id='gamePlan.coreValue.title.coreMission' className={classes.title} />
                  <Box display='flex' alignItems='center'>
                     <TypographyFHG variant='fs14400' color='text.primary'>
                        {formatMessage(intl, 'gamePlan.goal.lastEdit')} {convertTimeToShortFormat(whyUpdateDateTime)}
                     </TypographyFHG>
                     <PermissionAllow permissionName={BUSINESS_PLAN_EDIT}>
                        <EditIcon onClick={toggleEditable} />
                     </PermissionAllow>
                  </Box>
               </Box>
               <Box marginTop={47 / 8} paddingLeft={3.875}>
                  {editable ? (
                     <FormAddOurWhy
                        data={{
                           title: ourWhyHeader,
                           content: ourWhyText,
                        }}
                        onSubmit={handleUpdateOurWhy}
                        onCancel={toggleEditable}
                        loading={hasLoading}
                     />
                  ) : (
                     <div
                        dangerouslySetInnerHTML={{__html: ourWhyText?.replaceAll('<a href="', '<a href="//')}}
                        className={classes.editor}
                     />
                  )}
               </Box>
            </Box>
         </Grid>
      );
   }, [
      container,
      intl,
      whyUpdateDateTime,
      toggleEditable,
      theme,
      editable,
      ourWhyHeader,
      ourWhyText,
      handleUpdateOurWhy,
      hasLoading,
      classes.editor,
   ]);

   const renderBottom = useCallback(() => {
      return (
         <Grid
            item
            xs={12}
            style={{
               paddingBottom: 8,
            }}
         >
            <Box style={container}>
               <Box
                  style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                  }}
               >
                  <TypographyFHG variant='h5' id='gamePlan.coreValue.title.whoWeServe' className={classes.title} />
                  <Box display='flex' alignItems='center'>
                     <TypographyFHG variant='fs14400' color='text.primary'>
                        {formatMessage(intl, 'gamePlan.goal.lastEdit')} {convertTimeToShortFormat(whoUpdateDateTime)}
                     </TypographyFHG>
                     <PermissionAllow permissionName={BUSINESS_PLAN_EDIT}>
                        <EditIcon onClick={toggleEditableWhoWeServe} />
                     </PermissionAllow>
                  </Box>
               </Box>
               <Box
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                  }}
                  marginTop={5.875}
                  paddingLeft={3.875}
               >
                  {editableWhoWeServe ? (
                     <FormAddWhoWeServe
                        data={whoWeServe}
                        onSubmit={handleUpdateWhoWeServe}
                        onCancel={toggleEditableWhoWeServe}
                        loading={hasLoading}
                     />
                  ) : (
                     <div
                        dangerouslySetInnerHTML={{
                           __html: whoWeServe?.replaceAll('<a href="', '<a href="//'),
                        }}
                        className={classes.editor}
                     />
                  )}
               </Box>
            </Box>
         </Grid>
      );
   }, [
      container,
      intl,
      whoUpdateDateTime,
      toggleEditableWhoWeServe,
      theme,
      editableWhoWeServe,
      whoWeServe,
      handleUpdateWhoWeServe,
      hasLoading,
      classes.editor,
   ]);

   return (
      <Grid item container>
         {hasLoading && <Loading />}
         {renderState()}
         {renderMiddle()}
         {renderBottom()}
      </Grid>
   );
};

export default Vision;
