import React, {useCallback, useEffect} from 'react';
import TextFieldLF from '../../../components/TextFieldLF';
import TextAreaField from '../../../components/TextAreaField';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import OutLineButton from './OutLineButton';
import FillButton from './FillButton';
import Form from '../../../fhg/components/edit/Form';
import {useToggle} from './hooks/useToggle';
import {makeStyles} from '@mui/styles';
import {Box, Divider} from '@mui/material';

// import {TextAreaField} from '@aws-amplify/ui-react'

const useStyles = makeStyles((theme) => ({
   input1: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: 0,
      fontSize: 18 * SCALE_APP,
      height: 42 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      margin: 0,
      marginBottom: theme.spacing(1.25),
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   input2: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: 0,
      fontSize: 18 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      margin: 0,
      marginBottom: theme.spacing(1.25),
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
   cancelButton: {
      border: `2px solid ${theme.palette.secondary.main}`,
      borderRadius: BORDER_RADIUS_10,
      width: 200 * SCALE_APP,
      height: 45 * SCALE_APP,
      marginRight: theme.spacing(1.25),
   },
   saveButton: {
      borderRadius: BORDER_RADIUS_10,
      width: 200 * SCALE_APP,
      backgroundColor: theme.palette.secondary.main,
      height: 45 * SCALE_APP,
   },
}));

const FormAddCoreValue = ({onCancel, onSubmit, data = {}, onCreate, isNew}) => {
   const classes = useStyles();
   const [name, setName] = React.useState('');
   const [description, setDescription] = React.useState('');
   const {isToggle, toggle} = useToggle();

   useEffect(() => {
      if (!data?.id) return;
      setName(data?.name ?? '');
      setDescription(data?.description ?? '');
   }, [data]);

   const handleSubmit = useCallback(
      async (e) => {
         e.preventDefault();
         if (!data?.id && !isNew) {
            toggle();
            await onCreate({name, description});
            toggle();
            return;
         }
         toggle();
         const done = await onSubmit({...data, name, description});
         toggle();
         if (done) {
            setName('');
            setDescription('');
            onCancel();
         }
      },
      [description, name, onSubmit, data, onCreate, isNew, onCancel, toggle],
   );

   return (
      <Box display='flex' flexDirection='column' marginTop={1.25}>
         <Form onSubmit={handleSubmit}>
            <TextFieldLF
               className={classes.input1}
               placeholderKey='gamePlan.vision.placeholder'
               onChange={(e) => setName(e.target.value)}
               value={name}
               required
            />
            <TextAreaField
               labelHidden
               className={classes.input2}
               placeholderKey='gamePlan.vision.placeholderDescription'
               onChange={(e) => setDescription(e.target.value)}
               value={description}
            />
            <Box display='flex' justifyContent='end' marginBottom={1.25}>
               <OutLineButton label='cancel.button' onClick={onCancel} />
               <Box width={10 * SCALE_APP} />
               <FillButton label='save.label' type='submit' disabled={isToggle} />
            </Box>
            <Divider />
            <Box height={10 * SCALE_APP} />
         </Form>
      </Box>
   );
};

export default FormAddCoreValue;
