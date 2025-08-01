import React from 'react';
import {SCALE_APP} from '../../../Constants';
import {BUSINESS_PLAN_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TypographyFHG from '../../../fhg/components/Typography';
import EditIcon from './EditIcon';
import {useToggle} from './hooks/useToggle';
import FormAddTarget from './FormAddTarget';
import AvatarAssigner from './AvatarAssigner';
import DeleteConfirmModal from './DeleteConfirmModal';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, Checkbox} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

const useStyles = makeStyles((theme) => ({
   lineThrough: {
      textDecoration: 'line-through',
   },
}));

const ListTargetItem = ({data, onSelectionChange, checked, onRemoveTargetChild, onUpdateTarget, users}) => {
   const {note, dueDate, assignee} = data ?? {};
   const classes = useStyles();
   const theme = useTheme();
   const {isToggle, toggle} = useToggle();
   const {isToggle: showModalDelete, toggle: toggleModalShowDelete} = useToggle();
   const hasPermission = usePermission(BUSINESS_PLAN_EDIT);

   const intl = useIntl();

   if (isToggle) return <FormAddTarget data={data} onClose={toggle} onSubmit={onUpdateTarget} updated users={users} />;
   return (
      <Box flex={1} display='flex' paddingBottom={1.5} paddingTop={1.5}>
         <Box display='flex' flex={0.5}>
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
                     onClick={onSelectionChange}
                     checked={checked}
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
                  <Box display='flex' alignItems='center'>
                     <EditIcon onClick={toggle} />
                     <DeleteOutlineOutlinedIcon
                        style={{
                           width: 18 * SCALE_APP,
                           height: 18 * SCALE_APP,
                           color: theme.palette.primary.main,
                           marginLeft: theme.spacing(1.25),
                        }}
                        onClick={toggleModalShowDelete}
                     />
                  </Box>
               )}
            </Box>
         </Box>
         <Box display='flex' flex={0.25} alignItems='center'>
            <EventRoundedIcon
               style={{
                  width: 17 * SCALE_APP,
                  height: 17 * SCALE_APP,
                  color: theme.palette.primary.main,
                  marginRight: 6 * SCALE_APP,
               }}
            />
            <TypographyFHG variant='fs18400' color='text.primary'>
               {dueDate?.format('M-DD-YY')}
            </TypographyFHG>
         </Box>
         <Box display='flex' flex={0.25} alignItems='center' justifyContent='space-between'>
            <Box display='flex' alignItems='center'>
               <AvatarAssigner src={assignee?.path_url} />
               <TypographyFHG variant='fs18400' color='text.primary'>
                  {assignee?.contactName ?? formatMessage(intl, 'gamePlan.meeting.noName')}
               </TypographyFHG>
            </Box>
         </Box>
         <DeleteConfirmModal
            open={showModalDelete}
            onClose={toggleModalShowDelete}
            onDelete={() => {
               onRemoveTargetChild();
               toggleModalShowDelete();
            }}
         />
      </Box>
   );
};

export default ListTargetItem;
