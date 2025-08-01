import React, {useCallback, useState} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import DatePickerFHG from '../../../fhg/components/DatePickerFHG';
import TextFieldLF from '../../../components/TextFieldLF';
import moment from 'moment';
import OutLineButton from './OutLineButton';
import FillButton from './FillButton';
import {DATE_SHORT_FORMAT} from '../../../Constants';
import Form from '../../../fhg/components/edit/Form';
import {useToggle} from './hooks/useToggle';
import {useRecoilValue} from 'recoil';
import {listStatusState, listUsersState} from './WeeklyTeamMeeting';
import TextAreaField from '../../../components/TextAreaField';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, MenuItem, Select} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ErrorModal from './ErrorModal';

const useStyles = makeStyles((theme) => ({
   input: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      height: 42 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      width: '80%',
      margin: '0px',
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   input2: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      // height: 100 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      width: '100%',
      margin: '0px',
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   assignees: {
      backgroundColor: theme.palette.background.default,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      height: 40 * SCALE_APP,
      width: '100%',
      padding: theme.spacing(0, 1.25),
      '& .MuiOutlinedInput-input': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   status: {
      backgroundColor: theme.palette.background.default,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      height: 40 * SCALE_APP,
      width: '90%',
      padding: theme.spacing(0, 1.25),
      '& .MuiOutlinedInput-input': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   datePicker: {
      margin: '0px',
      width: '90%',
      '& button': {
         padding: '16px',
      },
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
      '& .MuiSvgIcon-fontSizeMedium': {
         color: theme.palette.text.primary,
      },
   },
   lineThrough: {
      textDecoration: 'line-through',
   },
   width100: {
      width: '100%',
   },
   inputAdornment: {
      '& > .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeStart.MuiIconButton-sizeMedium': {
         color: theme.palette.primary.main,
      },
   },
}));

const FormAddMeeting = ({data, onClose, onSubmit, updatable, isTask}) => {
   const theme = useTheme();
   const {description: descriptionInit, dueDate, assignee, statusId, note: noteInit, id, isCompleted} = data ?? {};
   const classes = useStyles();
   const [date, setDate] = useState(moment(dueDate));
   const [assigner, setAssigner] = useState(assignee);
   const [status, setStatus] = useState(statusId);
   const [note, setNote] = useState(noteInit);
   const [description, setDescription] = useState(descriptionInit ?? '');
   const {isToggle, toggle} = useToggle();

   const statusList = useRecoilValue(listStatusState);

   const listUsers = useRecoilValue(listUsersState);

   const [hasError, setHasError] = useState(false);

   const handleSubmit = useCallback(
      async (e) => {
         e.preventDefault();
         let done = false;
         if (!date.isValid()) {
            setHasError(true);
            return;
         }
         toggle();
         if (updatable) {
            const statusItem = statusList?.find((e) => e.id === status);
            const completed = statusItem?.name === 'Completed';
            let payload = {
               id,
               note,
               description,
               isCompleted: completed,
               dueDate: date,
               assignedToId: assigner?.id,
               statusId: status,
            };
            if (isTask) {
               payload = {
                  subject: note,
                  description,
                  isCompleted: completed,
                  dueDate: date,
                  userId: assigner?.id,
                  statusId: status,
               };
            }
            done = await onSubmit(payload);
         } else {
            let payload = {
               note,
               description,
               isCompleted: false,
               dueDate: date,
               assignedToId: assigner?.id,
               statusId: status,
            };
            if (isTask) {
               payload = {
                  subject: note,
                  description,
                  isCompleted: false,
                  dueDate: date,
                  userId: assigner?.id,
                  statusId: status,
               };
            }
            done = await onSubmit(payload);
         }
         toggle();
         done && onClose();
      },
      [toggle, updatable, onClose, statusList, id, note, description, date, assigner?.id, status, isTask, onSubmit],
   );

   return (
      <Box flex={1} display='flex' flexDirection='column' paddingBottom={1.5} paddingTop={1.5}>
         <Form onSubmit={handleSubmit}>
            <Box display='flex'>
               <Box display='flex' flex={0.4}>
                  <TextFieldLF
                     defaultValue={note}
                     className={classes.input}
                     placeholderKey='gamePlan.meeting.placeholder'
                     onChange={(e) => setNote(e.target.value)}
                     required
                  />
               </Box>
               <Box display='flex' flex={0.2}>
                  <Select
                     disableUnderline
                     className={classes.status}
                     value={status}
                     onChange={(e) => {
                        setStatus(statusList?.find((a) => a.id === e.target.value)?.id);
                     }}
                     IconComponent={(props) => (
                        <KeyboardArrowDownRoundedIcon
                           {...props}
                           style={{
                              width: 20 * SCALE_APP,
                              height: 20 * SCALE_APP,
                              color: theme.palette.primary.main,
                           }}
                        />
                     )}
                     required
                  >
                     {statusList?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                           {item.name}
                        </MenuItem>
                     ))}
                  </Select>
               </Box>
               <Box display='flex' flex={0.2} alignItems='center' flexDirection={'column'}>
                  <DatePickerFHG
                     className={classes.datePicker}
                     showToolbar={false}
                     defaultValue={date}
                     value={date}
                     onChange={(event, value, reason, newValue, name) => {
                        setDate(value);
                     }}
                     custom
                     format={DATE_SHORT_FORMAT}
                     required
                     disableFuture={false}
                     InputAdornmentProps={{
                        position: 'start',
                        className: classes.inputAdornment,
                     }}
                  />
               </Box>
               <Box display='flex' flex={0.2} alignItems='center'>
                  <Select
                     disableUnderline
                     className={classes.assignees}
                     value={assigner?.id}
                     onChange={(e) => {
                        setAssigner(listUsers?.find((a) => a.id === e.target.value));
                     }}
                     IconComponent={(props) => (
                        <KeyboardArrowDownRoundedIcon
                           {...props}
                           style={{
                              width: 20 * SCALE_APP,
                              height: 20 * SCALE_APP,
                              color: theme.palette.primary.main,
                           }}
                        />
                     )}
                     required
                  >
                     {listUsers?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                           {item.contactName}
                        </MenuItem>
                     ))}
                  </Select>
               </Box>
            </Box>
            <Box
               display='flex'
               flex={1}
               style={{
                  alignItems: 'center',
                  justifyContent: 'center',
               }}
               marginTop={2}
            >
               <TextAreaField
                  defaultValue={description}
                  className={classes.input2}
                  onChange={(e) => setDescription(e.target.value)}
                  // required
               />
            </Box>
            <Box display='flex' justifyContent='end' marginTop={18}>
               <OutLineButton label='cancel.button' onClick={onClose} />
               <Box width='10px' />
               <FillButton label='save.label' type='submit' disabled={isToggle} />
            </Box>
         </Form>
         <ErrorModal open={hasError} message='Please select a valid date' onClose={() => setHasError(false)} />
      </Box>
   );
};

export default FormAddMeeting;
