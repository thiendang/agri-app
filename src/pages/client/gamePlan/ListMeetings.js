import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TypographyFHG from '../../../fhg/components/Typography';
import ListMeetingItem from './ListMeetingItem';
import update from 'immutability-helper';
import DragItem from '../../../fhg/components/list/DragItem';
import {useToggle} from './hooks/useToggle';
import FormAddMeeting from './FormAddMeeting';
import {useSelect} from './hooks/useSelect';
import {debounce, findIndex, sortBy} from 'lodash';
import {useRecoilValue} from 'recoil';
import {listStatusState} from './WeeklyTeamMeeting';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, Button, List} from '@mui/material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';

const useStyles = makeStyles((theme) => ({
   border: {
      padding: theme.spacing(2.5),
      borderRadius: BORDER_RADIUS_10,
      backgroundColor: theme.palette.background.default,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
   },
   item: {
      width: '100%',
   },
   title: {
      fontWeight: '600',
      color: theme.palette.text.primary,
   },
}));

const ListMeetings = ({
   title,
   subTitle,
   data,
   type,
   onAddMeeting,
   onUpdateMeeting,
   onRemoveMeeting,
   onUpdateIndexMeeting,
   sortKey,
}) => {
   const classes = useStyles();
   const theme = useTheme();
   const {isToggle, toggle} = useToggle();
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const listRef = useRef([]);

   const [refresh, setRefresh] = useState(Date.now());

   const {handleSelectionChange, idsSelected, setIdsSelected} = useSelect();

   useEffect(() => {
      setIdsSelected(data?.filter((d) => d.isCompleted).map((d) => d.id));
   }, [data, setIdsSelected]);

   const listStatus = useRecoilValue(listStatusState);

   const handleCompleteTarget = useCallback(
      (id) => async () => {
         const item = data?.find((d) => d.id === id);
         if (item) {
            handleSelectionChange(id)();
            await onUpdateMeeting({
               ...item,
               isCompleted: !item.isCompleted,
               statusId: !item.isCompleted
                  ? listStatus?.find((e) => e.name === 'Completed')?.id
                  : listStatus?.find((e) => e.name === 'In Progress')?.id,
            });
         }
      },
      [data, handleSelectionChange, listStatus, onUpdateMeeting],
   );

   useEffect(() => {
      if (sortKey === 'date') {
         listRef.current = sortBy([...data], 'dueDate');
      }
      if (sortKey === 'assignee') {
         listRef.current = sortBy([...data], 'assignee.contactName');
      }
      if (sortKey === 'status') {
         listRef.current = sortBy(
            [
               ...[...data].map((item) => ({
                  ...item,
                  status: listStatus?.find((s) => s.id === item.statusId)?.name,
               })),
            ],
            'status',
         );
      }
      if (!sortKey) {
         listRef.current = sortBy([...data], 'orderIndex');
      }
      setRefresh(Date.now());
   }, [data, listStatus, sortKey]);

   const move = useCallback((dragIndex, hoverIndex) => {
      const list = [...(listRef.current || [])];

      listRef.current = update(list, {
         $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, list[dragIndex]],
         ],
      });
      setRefresh(Date.now());
   }, []);

   const moveColumn = useCallback(debounce(move, 5), [move]);

   const intl = useIntl();

   const renderAddButton = useCallback(() => {
      return (
         <Box>
            <PermissionAllow permissionName={BUSINESS_PLAN_EDIT}>
               <Button onClick={toggle}>
                  <Box
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                     }}
                  >
                     <ControlPointRoundedIcon
                        style={{
                           width: 27.5 * SCALE_APP,
                           height: 27.5 * SCALE_APP,
                           color: theme.palette.primary.main,
                           marginRight: theme.spacing(1.25),
                        }}
                     />
                     <TypographyFHG variant='fs16700' color='primary'>
                        {type === 'update' && formatMessage(intl, 'gamePlan.meeting.addUpdate')}
                        {type === 'issue' && formatMessage(intl, 'gamePlan.meeting.addIssue')}
                        {type === 'idea' && formatMessage(intl, 'gamePlan.meeting.addIdea')}
                     </TypographyFHG>
                  </Box>
               </Button>
            </PermissionAllow>
         </Box>
      );
   }, [intl, theme.palette.primary.main, toggle, type]);

   const onDrop = useCallback(
      async (v) => {
         const {dropItem} = v ?? {};
         const orderIndex = findIndex(listRef.current, {id: dropItem.id});
         await onUpdateIndexMeeting(dropItem.id)({...dropItem, orderIndex}, listRef.current);
      },
      [onUpdateIndexMeeting],
   );

   return (
      <Box marginTop={2.5} className={classes.border}>
         <Box display='flex' alignItems='center'>
            <TypographyFHG variant='h5' className={classes.title}>
               {title}
            </TypographyFHG>
            <Box width={10 * SCALE_APP} />
            <TypographyFHG variant='fs16700' color={theme.palette.mode === 'dark' ? 'text.primary' : 'text.black05'}>
               {subTitle}
            </TypographyFHG>
         </Box>
         <Box height={23 * SCALE_APP} />
         <Box display='flex' flexDirection='column'>
            <Box display='flex'>
               <Box display='flex' flex={0.4} overflow='hidden'>
                  <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.description' />
               </Box>
               <Box display='flex' flex={0.2}>
                  <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.status' />
               </Box>
               <Box display='flex' flex={0.2}>
                  <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.dueDate' />
               </Box>
               <Box display='flex' flex={0.2}>
                  <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.assignTo' />
               </Box>
            </Box>
            <Box display='flex' flexDirection='column' marginTop={1.25}>
               <List key={refresh} dense>
                  {listRef.current?.map((item, index) => (
                     <DragItem
                        key={item.id}
                        index={index}
                        move={moveColumn}
                        dropItem={item}
                        showDragIndicator={false}
                        className={classes.item}
                        onDrop={onDrop}
                        disable={!hasPermission}
                     >
                        <ListMeetingItem
                           checked={idsSelected.includes(item.id)}
                           data={item}
                           onUpdate={onUpdateMeeting}
                           onDelete={() => onRemoveMeeting(item.id)}
                           onSelectionChange={handleCompleteTarget(item.id)}
                        />
                     </DragItem>
                  ))}
               </List>
            </Box>
            {isToggle && <FormAddMeeting onSubmit={onAddMeeting} onClose={toggle} />}
            {renderAddButton()}
         </Box>
      </Box>
   );
};

export default memo(ListMeetings);
