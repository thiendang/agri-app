import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {SCALE_APP} from '../../../Constants';
import Grid2 from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import ListDailyTodos from './ListDailyTodos';
import Wrapper from './Wrapper';
import {useTeamTodos} from './hooks/useTeamTodos';
import {listStatusState, LIST_SORT} from './WeeklyTeamMeeting';
import {DELETE_TASK, getTaskQueries, STATUS_GET, TASK_CREATE, TASK_GET, TASK_UPDATE} from '../../../data/QueriesGL';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useSetRecoilState} from 'recoil';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import {cloneDeep, filter, pick} from 'lodash';
import Loading from '../../../fhg/components/Loading';
import {useErrorGamePlan} from './hooks/useError';
import {useTheme} from '@mui/styles';
import {Box, Button, Popover} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useIntl} from 'react-intl';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {validate} from 'uuid';

const DailyTeamToDos = () => {
   const theme = useTheme();
   const {isShowArchived, toggleShowArchived} = useTeamTodos();

   const [sort, setSort] = useState(null);

   const [anchorEl, setAnchorEl] = React.useState(null);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleSort = useCallback(
      (value) => () => {
         setSort((prev) => (prev === value ? null : value));
         handleClose();
      },
      [],
   );

   const open = Boolean(anchorEl);
   const id = open ? 'simple-popover' : undefined;

   const [{entityId, clientId}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);

   const [statusData] = useQueryFHG(STATUS_GET);
   const [todoData, {refetch}] = useQueryFHG(TASK_GET, {
      variables: {
         taskSearch: {
            clientId,
            entityId,
         },
      },
      skip: !validate(entityId),
      pollInterval,
   });
   const [createTask] = useMutationFHG(TASK_CREATE);
   const [updateTask, {loading}] = useMutationFHG(TASK_UPDATE);
   const [deleteTask] = useMutationFHG(DELETE_TASK);

   const statusList = useMemo(() => statusData?.status_All, [statusData?.status_All]);

   const setListStatus = useSetRecoilState(listStatusState);

   useEffect(() => {
      setListStatus(statusList);
   }, [setListStatus, statusList]);

   const listTodos = useMemo(() => todoData?.task_AllWhere || [], [todoData?.task_AllWhere]);

   const {setError} = useErrorGamePlan();

   const intl = useIntl();

   const handleAddTask = useCallback(
      async (data) => {
         try {
            if (!entityId || entityId === 'undefined' || !clientId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.alert.missClient'),
               });
            await createTask({
               variables: {
                  task: {
                     clientId,
                     entityId,
                     ...data,
                     priority: listTodos?.length || 0,
                  },
               },
            });
            refetch({
               taskSearch: {
                  clientId,
                  entityId,
               },
            });
            return true;
         } catch (err) {
            return false;
         }
      },
      [clientId, createTask, entityId, intl, listTodos?.length, refetch, setError],
   );

   const handleUpdateTask = useCallback(
      (taskId) => async (data) => {
         try {
            if (!taskId) return;
            if (!entityId || !clientId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.alert.missClient'),
               });
            await updateTask({
               variables: {
                  taskId,
                  task: {
                     ...data,
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  task_Update: {
                     __typename: 'Task',
                     ...data,
                     id: taskId,
                  },
               },
               update: cacheUpdate(getTaskQueries(clientId, entityId), taskId, 'task_Update'),
            });
            return true;
         } catch (err) {
            return false;
         }
      },
      [entityId, clientId, setError, intl, updateTask],
   );

   const handleRemoveTask = useCallback(
      (taskId) => async () => {
         try {
            if (!taskId) return;
            if (!entityId || !clientId)
               return setError({
                  isShow: true,
                  message: formatMessage(intl, 'gamePlan.alert.missClient'),
               });
            await deleteTask({
               variables: {
                  taskId,
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  task_Delete: {
                     id: taskId,
                  },
               },
               update: (cache, {data}) => {
                  if (data.task_Delete !== 1) return;
                  let query = {
                     query: TASK_GET,
                     variables: {
                        taskSearch: {
                           clientId,
                           entityId,
                        },
                     },
                  };
                  const existing = cache.readQuery(query);
                  const newData = cloneDeep(existing).task_AllWhere;
                  const newList = newData.filter((item) => item.id !== taskId);
                  cache.writeQuery({
                     ...query,
                     data: {task_AllWhere: newList},
                  });
               },
            });
            return true;
         } catch (err) {
            return false;
         }
      },
      [clientId, deleteTask, entityId, intl, setError],
   );

   const handleUpdateIndexMeeting = useCallback(
      (taskId) => async (task, listCurrent) => {
         try {
            if (!taskId) return;
            await updateTask({
               variables: {
                  taskId,
                  task: {
                     ...pick(task, ['priority']),
                  },
               },
               update: (cache, {data}) => {
                  listCurrent.forEach((element, index) => {
                     listCurrent[index] = {...listCurrent[index], priority: index};
                  });
                  cache.writeQuery({
                     query: TASK_GET,
                     variables: {
                        taskSearch: {
                           clientId,
                           entityId,
                        },
                     },
                     data: {task_AllWhere: listCurrent},
                  });
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [clientId, entityId, updateTask],
   );

   const list = useMemo(
      () => (isShowArchived ? filter(listTodos, {isCompleted: true}) : listTodos),
      [isShowArchived, listTodos],
   );

   const titleFilter = useMemo(
      () => (!isShowArchived ? 'gamePlan.teamTodos.viewArchived' : 'gamePlan.teamTodos.viewAll'),
      [isShowArchived],
   );

   return (
      <Grid2 item xs={12}>
         {loading && <Loading />}
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
                  id='gamePlan.teamTodos.title'
                  color='text.primary'
                  style={{
                     fontWeight: 'bold',
                  }}
               />
               <Box display='flex' alignItems='center'>
                  <Button onClick={toggleShowArchived}>
                     <TypographyFHG variant='fs16700' color='primary' id={titleFilter} />
                  </Button>
                  <Box width={50 * SCALE_APP} />
                  <Button onClick={handleClick}>
                     <TypographyFHG variant='fs16700' color='primary' id='gamePlan.teamTodos.sortBy' />
                  </Button>
                  <KeyboardArrowDownRoundedIcon
                     style={{
                        width: 20 * SCALE_APP,
                        height: 20 * SCALE_APP,
                        color: theme.palette.primary.main,
                     }}
                  />
               </Box>
            </Box>
            <Popover
               id={id}
               open={open}
               anchorEl={anchorEl}
               onClose={handleClose}
               anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
               }}
            >
               <Box display='flex' flexDirection='column'>
                  {LIST_SORT.map(({name, value}) => (
                     <Button key={value} onClick={handleSort(value)}>
                        <TypographyFHG variant='fs16700' color={sort === value ? 'secondary' : 'primary'}>
                           {name}
                        </TypographyFHG>
                     </Button>
                  ))}
               </Box>
            </Popover>
            <ListDailyTodos
               data={list}
               onAdd={handleAddTask}
               onUpdate={handleUpdateTask}
               onDelete={handleRemoveTask}
               sortKey={sort}
               onUpdateIndexMeeting={handleUpdateIndexMeeting}
            />
         </Wrapper>
      </Grid2>
   );
};

export default DailyTeamToDos;
