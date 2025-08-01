import {Box, FormControlLabel, Radio, RadioGroup} from '@mui/material';
import {makeStyles, useTheme} from '@mui/styles';
import React, {useCallback} from 'react';
import TextFieldLF from '../../../components/TextFieldLF';
import {BORDER_RADIUS_20} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import Grid2 from '../../../fhg/components/Grid';
import FillButton from './FillButton';
import {useToggle} from './hooks/useToggle';
import OutLineButton from './OutLineButton';
import Wrapper from './Wrapper';

const useStyles = makeStyles((theme) => ({
   border: {
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
      padding: theme.spacing(2.5),
      borderRadius: BORDER_RADIUS_20,
      backgroundColor: theme.palette.background.default,
   },
   input: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      height: 42 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      width: '100%',
      margin: '0px',
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   title: {
      '& .MuiTypography-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
}));

const FormAddTG = ({onClose, onSubmit, data}) => {
   const theme = useTheme();
   const classes = useStyles(theme);

   const [name, setName] = React.useState(data?.name || '');
   const [description, setDescription] = React.useState(data?.description || '');
   const [length, setLength] = React.useState(data?.length || 'long');
   const {isToggle, toggle} = useToggle();

   const handleSubmit = useCallback(async () => {
      toggle();
      const done = await onSubmit({name, description, length});
      toggle();
      if (done) {
         onClose();
      }
   }, [toggle, onSubmit, name, description, length, onClose]);

   return (
      <Grid2 item xs={12}>
         <Wrapper>
            <Box>
               <TextFieldLF
                  placeholderKey='gamePlan.goal.name'
                  value={name}
                  className={classes.input}
                  onChange={(e) => setName(e.target.value)}
                  required
               />
            </Box>
            <Box mt='10px'>
               <TextFieldLF
                  value={description}
                  placeholderKey='gamePlan.meeting.placeholderDescription'
                  className={classes.input}
                  onChange={(e) => setDescription(e.target.value)}
                  required
               />
            </Box>
            <Box mt={1.25}>
               <RadioGroup
                  row
                  defaultValue={length ?? 'long'}
                  name='radio-buttons-group'
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
               >
                  <FormControlLabel className={classes.title} value='long' control={<Radio />} label='Long' />
                  <FormControlLabel className={classes.title} value='short' control={<Radio />} label='Short' />
               </RadioGroup>
            </Box>
            <Box display='flex' justifyContent='end' marginTop={20 / 8}>
               <OutLineButton label='cancel.button' onClick={onClose} />
               <Box width={10 * SCALE_APP} />
               <FillButton label='save.label' onClick={handleSubmit} disabled={isToggle} loading={isToggle} />
            </Box>
         </Wrapper>
      </Grid2>
   );
};

export default FormAddTG;
