import React, {useCallback, useState} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import DatePickerFHG from '../../../fhg/components/DatePickerFHG';
import TextFieldLF from '../../../components/TextFieldLF';
import moment from 'moment';
import OutLineButton from './OutLineButton';
import FillButton from './FillButton';
import {DATE_SHORT_FORMAT} from '../../../Constants';
import {useToggle} from './hooks/useToggle';
import {makeStyles, useTheme} from '@mui/styles';
import {Box, MenuItem, Select} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

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
   datePicker: {
      margin: '0px',
      width: 150 * SCALE_APP,
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
   inputAdornment: {
      '& > .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeStart.MuiIconButton-sizeMedium': {
         color: theme.palette.primary.main,
      },
   },
}));

const FormAddTarget = ({data, onClose, onSubmit, updated, users = []}) => {
   const theme = useTheme();
   const classes = useStyles();
   const [date, setDate] = useState(moment(data?.dueDate));
   const [assigner, setAssigner] = useState(data?.assignee);
   const [description, setDescription] = useState(data?.note);

   const {isToggle, toggle} = useToggle();

   const handleSubmit = useCallback(
      async (e) => {
         e.preventDefault();
         let done = false;
         toggle();
         if (updated) {
            done = await onSubmit({
               data,
               note: description,
               assignedToId: assigner?.id,
               dueDate: date,
            });
         } else {
            done = await onSubmit({
               note: description,
               assignedToId: assigner?.id,
               dueDate: date,
            });
         }
         toggle();
         if (done) {
            onClose();
         }
      },
      [assigner, date, description, onClose, onSubmit, toggle, updated, data],
   );

   return (
      <Box flex={1} display='flex' flexDirection='column' paddingBottom={1.5} paddingTop={1.5}>
         <Box display='flex'>
            <Box display='flex' flex={0.5}>
               <TextFieldLF
                  value={description}
                  className={classes.input}
                  placeholderKey='gamePlan.target.placeholder'
                  onChange={(e) => setDescription(e.target.value)}
               />
            </Box>
            <Box display='flex' flex={0.25} alignItems='flex-start' flexDirection={'column'}>
               <DatePickerFHG
                  className={classes.datePicker}
                  showToolbar={false}
                  value={date}
                  onChange={(event, value, reason, newValue, name) => {
                     setDate(value);
                  }}
                  custom
                  format={DATE_SHORT_FORMAT}
                  disableFuture={false}
                  InputAdornmentProps={{
                     position: 'start',
                     className: classes.inputAdornment,
                  }}
               />
            </Box>
            <Box display='flex' flex={0.25} alignItems='center'>
               <Select
                  disableUnderline
                  required
                  className={classes.input2}
                  value={assigner?.id}
                  onChange={(e) => {
                     setAssigner(users?.find((a) => a.id === e.target.value));
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
               >
                  {users?.map((item) => (
                     <MenuItem key={item.id} value={item.id}>
                        {item.contactName}
                     </MenuItem>
                  ))}
               </Select>
            </Box>
         </Box>
         <Box display='flex' justifyContent='end' marginTop={5}>
            <OutLineButton label='cancel.button' onClick={onClose} />
            <Box width={10 * SCALE_APP} />
            <FillButton label='save.label' onClick={handleSubmit} disabled={isToggle} />
         </Box>
      </Box>
   );
};

export default FormAddTarget;
