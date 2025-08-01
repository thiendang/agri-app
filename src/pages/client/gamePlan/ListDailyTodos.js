import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TypographyFHG from '../../../fhg/components/Typography';
import ListMeetingItem from './ListMeetingItem';
import update from 'immutability-helper';
import DragItem from '../../../fhg/components/list/DragItem';
import {useToggle} from './hooks/useToggle';
import FormAddMeeting from './FormAddMeeting';
import {debounce, findIndex, sortBy} from 'lodash';
import {useRecoilValue} from 'recoil';
import {listStatusState} from './WeeklyTeamMeeting';
import {useSelect} from './hooks/useSelect';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, Button, List} from '@mui/material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';

const useStyles = makeStyles((theme) => ({
   item: {
      width: '100%',
   },
}));

const ListDailyTodos = ({data, onUpdate, onDelete, onAdd, sortKey, onUpdateIndexMeeting}) => {
   const theme = useTheme();
   const classes = useStyles();
   const listRef = useRef([]);
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const {isToggle, toggle} = useToggle();

   const [refresh, setRefresh] = useState(Date.now());

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

   const listStatus = useRecoilValue(listStatusState);

   const onDrop = useCallback(
      async (v) => {
         const {dropItem} = v ?? {};
         const orderIndex = findIndex(listRef.current, {id: dropItem.id});
         await onUpdateIndexMeeting(dropItem.id)({...dropItem, orderIndex}, listRef.current);
      },
      [onUpdateIndexMeeting]
   );

   const {handleSelectionChange, idsSelected, setIdsSelected} = useSelect();

   useEffect(() => {
      setIdsSelected(data?.filter((d) => d.isCompleted).map((d) => d.id));
   }, [data, setIdsSelected]);

   const handleCompleteTarget = useCallback(
      (id) => async () => {
         const item = data?.find((d) => d.id === id);
         if (item) {
            handleSelectionChange(id)();
            await onUpdate(id)({
               isCompleted: !item.isCompleted,
               statusId: !item.isCompleted
                  ? listStatus?.find((e) => e.name === 'Completed')?.id
                  : listStatus?.find((e) => e.name === 'In Progress')?.id,
            });
         }
      },
      [data, handleSelectionChange, listStatus, onUpdate]
   );

   useEffect(() => {
      const list = [...data]?.map((item) => ({
         ...item,
         note: item.subject,
         assignee: item.user,
         orderIndex: item.priority,
      }));
      if (sortKey === 'date') {
         listRef.current = sortBy([...list], 'dueDate');
      }
      if (sortKey === 'assignee') {
         listRef.current = sortBy([...list], 'assignee.contactName');
      }
      if (sortKey === 'status') {
         listRef.current = sortBy(
            [
               ...list.map((item) => ({
                  ...item,
                  status: listStatus?.find((s) => s.id === item.statusId)?.name,
               })),
            ],
            'status'
         );
      }
      if (!sortKey) {
         listRef.current = sortBy([...list], 'orderIndex');
      }
      setRefresh(Date.now());
   }, [data, listStatus, sortKey]);

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
                     <TypographyFHG variant='fs16700' color='primary' id='gamePlan.task.titleAdd' />
                  </Box>
               </Button>
            </PermissionAllow>
         </Box>
      );
   }, [theme.palette.primary.main, toggle]);

   return (
      <Box marginTop={2.5}>
         <Box display='flex' flexDirection='column'>
            <Box display='flex'>
               <Box display='flex' flex={0.4}>
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
                           data={item}
                           onUpdate={onUpdate(item.id)}
                           onDelete={onDelete(item.id)}
                           isTask
                           checked={idsSelected.includes(item.id)}
                           onSelectionChange={handleCompleteTarget(item.id)}
                        />
                     </DragItem>
                  ))}
               </List>
            </Box>
            {isToggle && <FormAddMeeting onClose={toggle} onSubmit={onAdd} isTask />}
            {renderAddButton()}
         </Box>
      </Box>
   );
};

export default memo(ListDailyTodos);
