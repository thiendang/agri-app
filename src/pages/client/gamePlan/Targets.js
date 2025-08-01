import React, {useCallback, useEffect, useMemo} from 'react';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import {SCALE_APP} from '../../../Constants';
import Grid from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import ListTargets from './ListTargets';
import Wrapper from './Wrapper';
import {useTargets} from './hooks/useTargets';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {
   DELETE_TARGET,
   DELETE_TARGET_GROUP,
   TARGET_CREATE,
   TARGET_GROUP_CREATE,
   TARGET_GROUP_GET,
   TARGET_GROUP_UPDATE,
   TARGET_UPDATE,
} from '../../../data/QueriesGL';
import {validate} from 'uuid';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import FillButton from './FillButton';
import {useToggle} from './hooks/useToggle';
import FormAddTG from './FormAddTG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import {cloneDeep, findIndex, omit, pick} from 'lodash';
import {useErrorGamePlan} from './hooks/useError';
import Loading from '../../../fhg/components/Loading';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useTheme} from '@mui/styles';
import {Box, Button, Divider} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {useRecoilValue} from 'recoil';
import {listUsersState} from './WeeklyTeamMeeting';

const Targets = () => {
   const theme = useTheme();
   const {targetsLongTerm, targetsShortTerm, setTargetsLongTerm, setTargetsShortTerm} = useTargets();

   const [{entityId}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);

   const [data, {refetch}] = useQueryFHG(TARGET_GROUP_GET, {
      variables: {
         targetGroupSearch: {entityId},
      },
      skip: !validate(entityId),
      pollInterval,
   });

   const users = useRecoilValue(listUsersState);

   useEffect(() => {
      if (Array.isArray(data?.targetGroup_AllWhere)) {
         setTargetsShortTerm(data.targetGroup_AllWhere.filter((item) => item.length === 'short'));
         setTargetsLongTerm(data.targetGroup_AllWhere.filter((item) => item.length === 'long'));
      }
   }, [data?.targetGroup_AllWhere, setTargetsLongTerm, setTargetsShortTerm]);

   const {isToggle: showAddTG, toggle: toggleShowAddTG, toggleOff} = useToggle();
   const [createTG, {loading}] = useMutationFHG(TARGET_GROUP_CREATE);
   const [updateTG, {loading: loadingUpdateTG}] = useMutationFHG(TARGET_GROUP_UPDATE);
   const [createTarget, {loading: loadingCreate}] = useMutationFHG(TARGET_CREATE);
   const [updateTarget, {loading: loadingUpdate}] = useMutationFHG(TARGET_UPDATE);
   const [deleteTarget, {loading: loadingDelete}] = useMutationFHG(DELETE_TARGET);
   const [deleteTargetGroup] = useMutationFHG(DELETE_TARGET_GROUP);

   const hasLoading = useMemo(
      () => loading || loadingCreate || loadingUpdate || loadingDelete || loadingUpdateTG,
      [loading, loadingCreate, loadingDelete, loadingUpdate, loadingUpdateTG],
   );

   const {isToggle: isArchivedShort, toggle: toggleArchiveShort} = useToggle();
   const {isToggle: isArchivedLong, toggle: toggleArchiveLong} = useToggle();

   const {setError} = useErrorGamePlan();

   const intl = useIntl();

   const handleCreateTG = useCallback(
      async (data) => {
         try {
            if (!entityId || entityId === 'undefined')
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await createTG({
               variables: {
                  input: {
                     entityId,
                     ...data,
                     isArchived: false,
                  },
               },
            });
            refetch({targetGroupSearch: {entityId}});
            toggleShowAddTG();
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, setError, intl, createTG, refetch, toggleShowAddTG],
   );

   const handleUpdateTG = useCallback(
      (targetGroupId) => async (data) => {
         try {
            if (!targetGroupId) return;
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await updateTG({
               variables: {
                  targetGroupId,
                  targetGroup: {
                     entityId,
                     ...pick(data, ['length', 'isArchived', 'name', 'description']),
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  targetGroup_Update: {
                     __typename: 'TargetGroup',
                     ...data,
                     id: targetGroupId,
                  },
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, intl, setError, updateTG],
   );

   const handleCreateTarget = useCallback(
      (targetGroupId, orderIndex) => async (data) => {
         try {
            if (!targetGroupId) return;
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await createTarget({
               variables: {
                  input: {
                     entityId,
                     targetGroupId,
                     orderIndex,
                     ...data,
                  },
               },
            });
            refetch({targetGroupSearch: {entityId}});
            return true;
         } catch (error) {
            return false;
         }
      },
      [createTarget, entityId, intl, refetch, setError],
   );

   const handleUpdateTarget = useCallback(
      (targetId) => async (target) => {
         try {
            if (!targetId) return;
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await updateTarget({
               variables: {
                  targetId,
                  input: {
                     ...omit(target, 'data'),
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  target_Update: {
                     __typename: 'Target',
                     ...pick(target, 'data'),
                     ...omit(target, 'data'),
                     assignedToId: target.assignedToId,
                     assignee: users.find((user) => user.id === target.assignedToId),
                     id: targetId,
                  },
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, intl, setError, updateTarget, users],
   );

   const handleUpdateIndexTarget = useCallback(
      (type, groupId) => (targetId) => async (target, listCurrent) => {
         try {
            if (!targetId) return;
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await updateTarget({
               variables: {
                  targetId,
                  input: {
                     ...pick(target, ['orderIndex']),
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  target_Update: {
                     __typename: 'Target',
                     ...target,
                     id: targetId,
                  },
               },
               update: (cache, {data}) => {
                  const existing = cache.readQuery({
                     query: TARGET_GROUP_GET,
                     variables: {
                        targetGroupSearch: {entityId},
                     },
                  });
                  const newData = cloneDeep(existing).targetGroup_AllWhere;
                  const listIndex = findIndex(newData, {length: type, id: groupId});
                  listCurrent.forEach((element, index) => {
                     listCurrent[index] = {...listCurrent[index], orderIndex: index};
                  });
                  newData[listIndex] = {
                     ...newData[listIndex],
                     targets: listCurrent,
                  };
                  cache.writeQuery({
                     query: TARGET_GROUP_GET,
                     variables: {
                        targetGroupSearch: {entityId},
                     },
                     data: {targetGroup_AllWhere: newData},
                  });
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, intl, setError, updateTarget],
   );

   const handleDeleteTarget = useCallback(
      (targetGroupId) => (targetId) => async () => {
         try {
            if (!targetId) return;
            if (!entityId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.goal.error.missEntity'),
               });
            await deleteTarget({
               variables: {
                  targetId,
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  target_Delete: {
                     __typename: 'Target',
                     id: targetId,
                  },
               },
               update: (cache, {data}) => {
                  if (data.target_Delete !== 1) return;
                  const existing = cache.readQuery({
                     query: TARGET_GROUP_GET,
                     variables: {
                        targetGroupSearch: {entityId},
                     },
                  });
                  const newData = cloneDeep(existing).targetGroup_AllWhere;
                  const index = newData.findIndex((item) => item.id === targetGroupId);
                  newData[index].targets = newData[index].targets.filter((item) => item.id !== targetId);
                  cache.writeQuery({
                     query: TARGET_GROUP_GET,
                     variables: {
                        targetGroupSearch: {entityId},
                     },
                     data: {targetGroup_AllWhere: newData},
                  });
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, setError, intl, deleteTarget],
   );

   const handleCompleteTarget = useCallback(
      (targetId) => async (target) => {
         try {
            if (!targetId) return;
            await updateTarget({
               variables: {
                  targetId,
                  input: {
                     isCompleted: !target.isCompleted,
                  },
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [updateTarget],
   );

   const handleDeleteTargetGroup = useCallback(
      (targetGroupId, type) => async () => {
         try {
            if (!targetGroupId) return;
            await deleteTargetGroup({
               variables: {
                  targetGroupId,
               },
            });
            if (type === 'long') {
               setTargetsLongTerm((prev) => prev.filter((item) => item.id !== targetGroupId));
            } else {
               setTargetsShortTerm((prev) => prev.filter((item) => item.id !== targetGroupId));
            }
            return true;
         } catch (error) {
            return false;
         }
      },
      [deleteTargetGroup, setTargetsLongTerm, setTargetsShortTerm],
   );

   return (
      <Grid item xs={12}>
         {hasLoading && <Loading />}
         <Box my='10px'>
            <PermissionAllow permissionName={BUSINESS_PLAN_EDIT}>
               <FillButton label={formatMessage(intl, 'gamePlan.rocks.titleAddGroup')} onClick={toggleShowAddTG} />
            </PermissionAllow>
         </Box>
         {showAddTG && <FormAddTG onClose={toggleOff} onSubmit={handleCreateTG} />}
         <Wrapper>
            <Box
               style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
               }}
               marginBottom={2.5}
            >
               <TypographyFHG
                  variant='h5'
                  id='gamePlan.rocks.shortTerm'
                  color='text.primary'
                  style={{
                     fontWeight: 'bold',
                  }}
               />
               <Button onClick={toggleArchiveShort}>
                  <Box display='flex' alignItems='center'>
                     <TypographyFHG variant='fs16700' color='primary'>
                        {!isArchivedShort ? 'View Archived Rocks' : 'View All Rocks'}
                     </TypographyFHG>
                     <KeyboardArrowDownRoundedIcon
                        style={{
                           width: 20 * SCALE_APP,
                           height: 20 * SCALE_APP,
                           color: theme.palette.primary.main,
                        }}
                     />
                  </Box>
               </Button>
            </Box>
            <Divider />
            {targetsShortTerm?.map((item) => (
               <React.Fragment key={item.id}>
                  <Box height='20px' />
                  <ListTargets
                     group={omit(item, 'targets')}
                     users={users}
                     title={item.name}
                     data={item.targets}
                     onDelete={handleDeleteTargetGroup(item.id, 'short')}
                     onAddTarget={handleCreateTarget(item.id, (item.targets?.length ?? 0) + 1)}
                     onRemoveTargetChild={handleDeleteTarget(item.id)}
                     onUpdateTarget={handleUpdateTarget}
                     onUpdateIndexTarget={handleUpdateIndexTarget('short', item.id)}
                     onCompleteTarget={handleCompleteTarget}
                     onDeleteTargetGroup={handleDeleteTargetGroup(item.id)}
                     onlyCompleted={isArchivedShort}
                     onUpdateTG={handleUpdateTG(item.id)}
                  />
               </React.Fragment>
            ))}
         </Wrapper>
         <Wrapper>
            <Box
               style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
               }}
               marginBottom={2.5}
            >
               <TypographyFHG
                  variant='h5'
                  id='gamePlan.rocks.longTerm'
                  color='text.primary'
                  style={{
                     fontWeight: 'bold',
                  }}
               />
               <Button onClick={toggleArchiveLong}>
                  <Box display='flex' alignItems='center'>
                     <TypographyFHG
                        variant='fs16700'
                        color='primary'
                        id={!isArchivedLong ? 'gamePlan.rocks.viewArchive' : 'gamePlan.rocks.viewAll'}
                     />
                     <KeyboardArrowDownRoundedIcon
                        style={{
                           width: 20 * SCALE_APP,
                           height: 20 * SCALE_APP,
                           color: theme.palette.primary.main,
                        }}
                     />
                  </Box>
               </Button>
            </Box>
            <Divider />
            {targetsLongTerm?.map((item) => (
               <React.Fragment key={item.id}>
                  <Box height={20 * SCALE_APP} />
                  <ListTargets
                     group={omit(item, 'targets')}
                     users={users}
                     title={item.name}
                     data={item.targets}
                     onDelete={handleDeleteTargetGroup(item.id, 'long')}
                     onAddTarget={handleCreateTarget(item.id, (item.targets?.length ?? 0) + 1)}
                     onRemoveTargetChild={handleDeleteTarget(item.id)}
                     onUpdateTarget={handleUpdateTarget}
                     onUpdateIndexTarget={handleUpdateIndexTarget('long', item.id)}
                     onCompleteTarget={handleCompleteTarget}
                     onlyCompleted={isArchivedLong}
                     onUpdateTG={handleUpdateTG(item.id)}
                  />
               </React.Fragment>
            ))}
         </Wrapper>
      </Grid>
   );
};

export default Targets;
