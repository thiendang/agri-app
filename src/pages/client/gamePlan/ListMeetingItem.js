import React, {memo, useMemo} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TypographyFHG from '../../../fhg/components/Typography';
import EditIcon from './EditIcon';
import FormAddMeeting from './FormAddMeeting';
import {useToggle} from './hooks/useToggle';
import {DATE_SHORT_FORMAT} from '../../../Constants';
import AvatarAssigner from './AvatarAssigner';
import {useRecoilValue} from 'recoil';
import {listStatusState} from './WeeklyTeamMeeting';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, Checkbox, Divider} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

const useStyles = makeStyles((theme) => ({
   input1: {
      backgroundColor: '#E2E8F0',
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      padding: theme.spacing(1.5, 2.5),
      height: 44 * SCALE_APP,
      width: '80%',
   },
   status: {
      backgroundColor: '#E2E8F0',
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      padding: theme.spacing(1.5, 2.5),
      height: 44 * SCALE_APP,
      width: 'auto',
   },
   lineThrough: {
      textDecoration: 'line-through',
   },
}));

const ListMeetingItem = ({data, onUpdate, onDelete, checked, onSelectionChange, isTask}) => {
   const theme = useTheme();
   const classes = useStyles();
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const {note, description, assignee, statusId, dueDate} = data ?? {};

   const listStatus = useRecoilValue(listStatusState);

   const status = useMemo(() => listStatus?.find((item) => item.id === statusId), [listStatus, statusId]);

   const {isToggle, toggle} = useToggle();

   if (isToggle) {
      return (
         <Box display='flex' flex={1} flexDirection='column' marginBottom={2}>
            <FormAddMeeting data={data} onClose={toggle} updatable onSubmit={onUpdate} isTask={isTask} />
            <Divider />
         </Box>
      );
   }

   return (
      <Box display='flex' flexDirection='column' style={{width: '100%'}}>
         <Box height={theme.spacing(1)} />
         <Box display='flex'>
            <Box display='flex' flex={0.4}>
               <Box display='flex'>
                  <Box display='flex' alignItems='center'>
                     {hasPermission && (
                        <DragIndicatorIcon
                           style={{
                              color: theme.palette.primary.main,
                           }}
                        />
                     )}
                     <Checkbox
                        checked={checked}
                        onClick={onSelectionChange}
                        style={{
                           color: theme.palette.primary.main,
                           '&.Mui-checked': {
                              color: theme.palette.primary.main,
                           },
                           '& .MuiSvgIcon-root': {fontSize: 24 * SCALE_APP},
                        }}
                        disabled={!hasPermission}
                     />
                  </Box>
                  <Box display='flex' alignItems='center' marginLeft={1.25}>
                     <TypographyFHG variant='fs18400' color='text.primary' className={checked && classes.lineThrough}>
                        {note}
                     </TypographyFHG>
                  </Box>
                  {hasPermission && (
                     <Box display='flex' alignItems='center' paddingRight={2.5}>
                        <EditIcon onClick={toggle} />
                        <DeleteOutlineOutlinedIcon
                           style={{
                              width: 18 * SCALE_APP,
                              height: 18 * SCALE_APP,
                              color: theme.palette.primary.main,
                              marginLeft: theme.spacing(1.25),
                           }}
                           onClick={onDelete}
                        />
                     </Box>
                  )}
               </Box>
            </Box>
            <Box display='flex' flex={0.2} alignItems='center'>
               <TypographyFHG variant='fs18400' color='text.primary'>
                  {status?.name}
               </TypographyFHG>
               {/* <KeyboardArrowDownRoundedIcon
                  style={{
                     width: '20px',
                     height: '20px',
                     marginLeft: '16px',
                     color: theme.palette.primary.main,
                  }}
               /> */}
            </Box>
            <Box display='flex' flex={0.2} alignItems='center'>
               <EventRoundedIcon
                  style={{
                     width: 17 * SCALE_APP,
                     height: 17 * SCALE_APP,
                     color: theme.palette.primary.main,
                     marginRight: 6 * SCALE_APP,
                  }}
               />
               <TypographyFHG variant='fs18400' color='text.primary'>
                  {dueDate?.format(DATE_SHORT_FORMAT)}
               </TypographyFHG>
            </Box>
            <Box display='flex' flex={0.2} alignItems='center' justifyContent='space-between'>
               <Box display='flex' alignItems='center'>
                  <AvatarAssigner src={assignee?.path_url} />
                  <TypographyFHG variant='fs18400' color='text.primary'>
                     {assignee?.contactName}
                  </TypographyFHG>
               </Box>
            </Box>
         </Box>
         <Box display='flex' marginBottom={1.25} marginTop={1.25} marginLeft={1.25}>
            <TypographyFHG variant='fs16400' color='text.primary' className={checked && classes.lineThrough}>
               {description}
            </TypographyFHG>
         </Box>
         <Box height={theme.spacing(1)} />
         <Divider />
      </Box>
   );
};

export default memo(ListMeetingItem);
