import React, {useCallback, useEffect, useRef, useState} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TypographyFHG from '../../../fhg/components/Typography';
import EditIcon from './EditIcon';
import ListTargetItem from './ListTargetItem';
import update from 'immutability-helper';
import DragItem from '../../../fhg/components/list/DragItem';
import {useToggle} from './hooks/useToggle';
import FormAddTarget from './FormAddTarget';
import {useSelect} from './hooks/useSelect';
import {debounce, findIndex, sortBy} from 'lodash';
import FormAddTG from './FormAddTG';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, Button, IconButton, List} from '@mui/material';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const useStyles = makeStyles((theme) => ({
   border: {
      padding: theme.spacing(2.5),
      borderRadius: BORDER_RADIUS_10,
      backgroundColor: theme.palette.background.default,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
   },
   trashIcon: {
      height: 15 * SCALE_APP,
      width: 18 * SCALE_APP,
      color: theme.palette.primary.main,
   },
   item: {
      width: '100%',
   },
}));

const ListTargets = ({
   title,
   data,
   onDelete,
   onAddTarget,
   onRemoveTargetChild,
   onUpdateTarget,
   users,
   onUpdateIndexTarget,
   onCompleteTarget,
   onlyCompleted,
   group,
   onUpdateTG,
}) => {
   const classes = useStyles();
   const [open, setOpen] = React.useState(true);
   const theme = useTheme();
   const {isToggle, toggle} = useToggle();
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const {handleSelectionChange, idsSelected, setIdsSelected} = useSelect();

   useEffect(() => {
      setIdsSelected(data?.filter((d) => d.isCompleted).map((d) => d.id));
   }, [data, setIdsSelected]);

   const listRef = useRef([]);

   const [refresh, setRefresh] = useState(Date.now());

   const handleCompleteTarget = useCallback(
      (id) => async () => {
         const item = data?.find((d) => d.id === id);
         if (item) {
            handleSelectionChange(id)();
            await onCompleteTarget(item.id)(item);
         }
      },
      [data, handleSelectionChange, onCompleteTarget],
   );

   useEffect(() => {
      if (onlyCompleted) {
         listRef.current = sortBy(
            [...data].filter((item) => item.isCompleted),
            'orderIndex',
         );
      } else {
         listRef.current = sortBy([...data], 'orderIndex');
      }
      setRefresh(Date.now());
   }, [data, onlyCompleted]);

   const toggleOpen = useCallback(() => {
      setOpen((prevOpen) => !prevOpen);
   }, []);

   const move = useCallback((dragIndex, hoverIndex) => {
      const list = [...(listRef.current || [])];

      listRef.current = update(list, {
         $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, list[dragIndex]],
         ],
      });
      setImmediate(() => setRefresh(Date.now()));
   }, []);

   const moveColumn = useCallback(debounce(move, 5), [move]);

   const onDrop = useCallback(
      async (v) => {
         const {dropItem} = v ?? {};
         const orderIndex = findIndex(listRef.current, {id: dropItem.id});
         await onUpdateIndexTarget(dropItem.id)({...dropItem, orderIndex}, listRef.current);
      },
      [onUpdateIndexTarget],
   );

   const {isToggle: showEditTG, toggle: toggleEditTG, toggleOff} = useToggle();

   const handleUpdateTG = useCallback(
      async (data) => {
         return await onUpdateTG({...group, ...data});
      },
      [group, onUpdateTG],
   );

   const renderAddButton = useCallback(() => {
      if (hasPermission) {
         return (
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
                  <TypographyFHG variant='fs16700' color='primary' id='gamePlan.rocks.titleAdd' />
               </Box>
            </Button>
         );
      } else {
         return null;
      }
   }, [hasPermission, theme.palette.primary.main, toggle]);

   return (
      <Box className={classes.border}>
         <Box display='flex' justifyContent='space-between'>
            <Box display='flex' alignItems='center'>
               <TypographyFHG variant='fs20700' color='text.primary'>
                  {title}
               </TypographyFHG>
               {open && hasPermission && (
                  <>
                     <IconButton onClick={toggleEditTG}>
                        <EditIcon />
                     </IconButton>
                     <IconButton onClick={onDelete} sx={{ml: 1.25}}>
                        <img src='/images/trash.png' className={classes.trashIcon} alt='question' />
                     </IconButton>
                  </>
               )}
            </Box>
            <Box display='flex' alignItems='center'>
               <KeyboardArrowDownRoundedIcon
                  style={{
                     width: 20 * SCALE_APP,
                     height: 20 * SCALE_APP,
                  }}
                  onClick={toggleOpen}
               />
            </Box>
         </Box>
         {open && (
            <>
               {showEditTG && <FormAddTG data={group} onClose={toggleOff} onSubmit={handleUpdateTG} />}
               <Box display='flex' marginTop={1.875}>
                  <Box display='flex' flex={0.5}>
                     <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.description' />
                  </Box>
                  <Box display='flex' flex={0.25}>
                     <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.dueDate' />
                  </Box>
                  <Box display='flex' flex={0.2}>
                     <TypographyFHG variant='fs18500' color='primary' id='gamePlan.task.assignTo' />
                  </Box>
               </Box>
               <Box display='flex' flexDirection='column' key={refresh} marginTop={1.25}>
                  <List key={refresh} dense>
                     {listRef.current?.map((item, index) => (
                        <DragItem
                           className={classes.item}
                           key={item.id}
                           index={index}
                           move={moveColumn}
                           dropItem={item}
                           showDragIndicator={false}
                           onDrop={onDrop}
                           disable={!hasPermission}
                        >
                           <ListTargetItem
                              data={item}
                              checked={idsSelected.includes(item.id)}
                              onSelectionChange={handleCompleteTarget(item.id)}
                              onRemoveTargetChild={onRemoveTargetChild(item.id)}
                              onUpdateTarget={onUpdateTarget(item.id)}
                              users={users}
                           />
                        </DragItem>
                     ))}
                  </List>
               </Box>
               {isToggle && <FormAddTarget onClose={toggle} onSubmit={onAddTarget} users={users} />}
               {renderAddButton()}
            </>
         )}
      </Box>
   );
};

export default ListTargets;
