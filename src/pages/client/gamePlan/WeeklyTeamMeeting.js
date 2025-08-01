import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {SCALE_APP} from '../../../Constants';
import Grid2 from '../../../fhg/components/Grid';
import TypographyFHG from '../../../fhg/components/Typography';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import ListMeetings from './ListMeetings';
import Wrapper from './Wrapper';
import {useMeetingList} from './hooks/useTeamMeeting';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {
   DELETE_MEETING,
   getTeamMeetingQueries,
   MEETING_NOTE_CREATE,
   MEETING_NOTE_UPDATE,
   STATUS_GET,
   TEAM_MEETING_GET,
} from '../../../data/QueriesGL';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {validate} from 'uuid';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import {filter, pick} from 'lodash';
import {atom, useSetRecoilState} from 'recoil';
import {useErrorGamePlan} from './hooks/useError';
import Loading from '../../../fhg/components/Loading';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useTheme} from '@mui/styles';
import {Box, Button, Popover} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {cacheDelete} from '../../../fhg/utils/DataUtil';

export const LIST_SORT = [
   {
      name: 'Date',
      value: 'date',
   },
   {
      name: 'Assignee',
      value: 'assignee',
   },
   {
      name: 'Status',
      value: 'status',
   },
];

export const listUsersState = atom({
   key: 'listUsers',
   default: [],
});

export const listStatusState = atom({
   key: 'listStatus',
   default: [],
});

const WeeklyTeamMeeting = () => {
   const theme = useTheme();
   const {isShowResolved, toggleShowResolved} = useMeetingList();
   const [{entityId}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);
   const [updates, {refetch: refetchUpdates}] = useQueryFHG(TEAM_MEETING_GET, {
      variables: {teamMeetingNoteSearch: {entityId, category: 'update'}},
      skip: !validate(entityId),
      pollInterval,
   });
   const [ideas, {refetch: refetchIdeas}] = useQueryFHG(TEAM_MEETING_GET, {
      variables: {teamMeetingNoteSearch: {entityId, category: 'idea'}},
      skip: !validate(entityId),
      pollInterval,
   });
   const [issues, {refetch: refetchIssues}] = useQueryFHG(TEAM_MEETING_GET, {
      variables: {teamMeetingNoteSearch: {entityId, category: 'issue'}},
      skip: !validate(entityId),
      pollInterval,
   });

   const [sort, setSort] = useState(null);

   const [createMeetingNote, {loading}] = useMutationFHG(MEETING_NOTE_CREATE);
   const [updateMeetingNote, {loading: loadingUpdate}] = useMutationFHG(MEETING_NOTE_UPDATE);
   const [deleteMeetingNote, {loading: loadingDelete}] = useMutationFHG(DELETE_MEETING);
   const [statusData] = useQueryFHG(STATUS_GET);

   const hasLoading = useMemo(() => loading || loadingDelete, [loading, loadingDelete]);

   const statusList = useMemo(() => statusData?.status_All, [statusData?.status_All]);

   const setListStatus = useSetRecoilState(listStatusState);

   useEffect(() => {
      setListStatus(statusList);
   }, [setListStatus, statusList]);

   const {setError} = useErrorGamePlan();

   const intl = useIntl();

   const handleDeleteMeeting = useCallback(
      (type) => async (teamMeetingNoteId) => {
         try {
            if (!teamMeetingNoteId) return;
            if (!entityId || entityId === 'undefined')
               return setError({isShow: true, message: formatMessage(intl, 'gamePlan.goal.error.missEntity')});
            await deleteMeetingNote({
               variables: {
                  teamMeetingNoteId,
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  teamMeetingNote_Delete: {
                     id: teamMeetingNoteId,
                  },
               },
               update: cacheDelete(getTeamMeetingQueries(entityId, type), teamMeetingNoteId, 'teamMeetingNote_Delete'),
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, setError, intl, deleteMeetingNote],
   );

   const handleAddMeeting = useCallback(
      (type) => async (meeting) => {
         let data = updates;
         if (type === 'idea') data = ideas;
         if (type === 'issue') data = issues;
         try {
            if (!entityId)
               return setError({isShow: true, message: formatMessage(intl, 'gamePlan.goal.error.missEntity')});
            await createMeetingNote({
               variables: {
                  input: {
                     entityId,
                     assignedToId: meeting.assignedToId,
                     statusId: meeting.statusId,
                     category: type,
                     orderIndex: data?.teamMeetingNote_AllWhere?.length ?? 0,
                     note: meeting.note,
                     dueDate: meeting.dueDate,
                     isCompleted: meeting.isCompleted,
                     description: meeting.description,
                  },
               },
            });
            if (type === 'update') {
               refetchUpdates({teamMeetingNoteSearch: {entityId, category: 'update'}});
            }
            if (type === 'idea') {
               refetchIdeas({teamMeetingNoteSearch: {entityId, category: 'idea'}});
            }
            if (type === 'issue') {
               refetchIssues({teamMeetingNoteSearch: {entityId, category: 'issue'}});
            }
            return true;
         } catch (error) {
            return false;
         }
      },
      [
         createMeetingNote,
         entityId,
         ideas,
         intl,
         issues,
         refetchIdeas,
         refetchIssues,
         refetchUpdates,
         setError,
         updates,
      ],
   );

   const handleUpdateMeeting = useCallback(
      (type) => async (meeting) => {
         try {
            if (!meeting) return;
            if (!entityId)
               return setError({isShow: true, message: formatMessage(intl, 'gamePlan.goal.error.missEntity')});
            await updateMeetingNote({
               variables: {
                  teamMeetingNoteId: meeting.id,
                  teamMeetingNote: {
                     entityId,
                     assignedToId: meeting.assignedToId,
                     statusId: meeting.statusId,
                     category: type,
                     note: meeting.note,
                     dueDate: meeting.dueDate,
                     isCompleted: meeting.isCompleted,
                     description: meeting.description,
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  teamMeetingNote_Update: {
                     __typename: 'TeamMeetingNote',
                     ...meeting,
                  },
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, intl, setError, updateMeetingNote],
   );

   const handleUpdateIndexMeeting = useCallback(
      (type) => (teamMeetingNoteId) => async (teamMeetingNote, listCurrent) => {
         try {
            if (!teamMeetingNoteId) return;
            await updateMeetingNote({
               variables: {
                  teamMeetingNoteId,
                  teamMeetingNote: {
                     ...pick(teamMeetingNote, ['orderIndex']),
                  },
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  teamMeetingNote_Update: {
                     __typename: 'TeamMeetingNote',
                     ...teamMeetingNote,
                     id: teamMeetingNoteId,
                  },
               },
               update: (cache, {data}) => {
                  listCurrent.forEach((element, index) => {
                     listCurrent[index] = {...listCurrent[index], orderIndex: index};
                  });
                  cache.writeQuery({
                     query: TEAM_MEETING_GET,
                     variables: {teamMeetingNoteSearch: {entityId, category: type}},
                     data: {teamMeetingNote_AllWhere: listCurrent},
                  });
               },
            });
            return true;
         } catch (error) {
            return false;
         }
      },
      [entityId, updateMeetingNote],
   );

   const [anchorEl, setAnchorEl] = React.useState(null);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const open = Boolean(anchorEl);
   const id = open ? 'simple-popover' : undefined;

   const handleSort = useCallback(
      (value) => () => {
         setSort((prev) => (prev === value ? null : value));
         handleClose();
      },
      [],
   );

   const listUpdates = useMemo(
      () =>
         isShowResolved
            ? filter(updates?.teamMeetingNote_AllWhere || [], {isCompleted: true})
            : updates?.teamMeetingNote_AllWhere || [],
      [isShowResolved, updates?.teamMeetingNote_AllWhere],
   );

   const listIdeas = useMemo(
      () =>
         isShowResolved
            ? filter(ideas?.teamMeetingNote_AllWhere || [], {isCompleted: true})
            : ideas?.teamMeetingNote_AllWhere || [],
      [ideas?.teamMeetingNote_AllWhere, isShowResolved],
   );

   const listIssues = useMemo(
      () =>
         isShowResolved
            ? filter(issues?.teamMeetingNote_AllWhere || [], {isCompleted: true})
            : issues?.teamMeetingNote_AllWhere || [],
      [isShowResolved, issues?.teamMeetingNote_AllWhere],
   );

   const issueSubTitle = useMemo(
      () =>
         `${issues?.teamMeetingNote_AllWhere?.length ?? 0} ${formatMessage(
            intl,
            issues?.teamMeetingNote_AllWhere?.length > 1
               ? 'gamePlan.meeting.title.issues'
               : 'gamePlan.meeting.title.issue',
         )}`,
      [intl, issues?.teamMeetingNote_AllWhere?.length],
   );

   const ideaSubTitle = useMemo(
      () =>
         `${ideas?.teamMeetingNote_AllWhere?.length ?? 0} ${formatMessage(
            intl,
            ideas?.teamMeetingNote_AllWhere?.length > 1
               ? 'gamePlan.meeting.title.ideas'
               : 'gamePlan.meeting.title.idea',
         )}`,
      [ideas?.teamMeetingNote_AllWhere?.length, intl],
   );

   const updateSubTitle = useMemo(
      () =>
         `${updates?.teamMeetingNote_AllWhere?.length ?? 0} ${formatMessage(
            intl,
            updates?.teamMeetingNote_AllWhere?.length > 1
               ? 'gamePlan.meeting.title.updates'
               : 'gamePlan.meeting.title.update',
         )}`,
      [intl, updates?.teamMeetingNote_AllWhere?.length],
   );

   return (
      <Grid2 item xs={12}>
         {(hasLoading || loadingUpdate) && <Loading />}
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
                  id='gamePlan.meeting.title'
                  color='text.primary'
                  style={{
                     fontWeight: 'bold',
                  }}
               />
               <Box display='flex' alignItems='center'>
                  <Button>
                     <TypographyFHG variant='fs16700' color='primary' onClick={toggleShowResolved}>
                        {formatMessage(
                           intl,
                           !isShowResolved ? 'gamePlan.meeting.title.showRevolved' : 'gamePlan.meeting.title.showAll',
                        )}
                     </TypographyFHG>
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
            <ListMeetings
               title={formatMessage(intl, 'gamePlan.meeting.title.updates')}
               subTitle={updateSubTitle}
               data={listUpdates}
               type='update'
               onAddMeeting={handleAddMeeting('update')}
               onUpdateMeeting={handleUpdateMeeting('update')}
               onRemoveMeeting={handleDeleteMeeting('update')}
               onUpdateIndexMeeting={handleUpdateIndexMeeting('update')}
               sortKey={sort}
            />
            <ListMeetings
               title={formatMessage(intl, 'gamePlan.meeting.title.ideas')}
               subTitle={ideaSubTitle}
               data={listIdeas}
               type='idea'
               onAddMeeting={handleAddMeeting('idea')}
               onUpdateMeeting={handleUpdateMeeting('idea')}
               onRemoveMeeting={handleDeleteMeeting('idea')}
               onUpdateIndexMeeting={handleUpdateIndexMeeting('idea')}
               sortKey={sort}
            />
            <ListMeetings
               title={formatMessage(intl, 'gamePlan.meeting.title.issues')}
               subTitle={issueSubTitle}
               data={listIssues}
               type='issue'
               onAddMeeting={handleAddMeeting('issue')}
               onUpdateMeeting={handleUpdateMeeting('issue')}
               onRemoveMeeting={handleDeleteMeeting('issue')}
               onUpdateIndexMeeting={handleUpdateIndexMeeting('issue')}
               sortKey={sort}
            />
         </Wrapper>
      </Grid2>
   );
};

export default WeeklyTeamMeeting;
