import React, {useCallback} from 'react';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import FillButton from './FillButton';
import OutLineButton from './OutLineButton';
import Editor from './Editor';
import Form from '../../../fhg/components/edit/Form';
import {useToggle} from './hooks/useToggle';
import {makeStyles} from '@mui/styles';
import {Box} from '@mui/material';

const useStyles = makeStyles((theme) => ({
   input1: {
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      marginBottom: theme.spacing(1.25),
      height: 42 * SCALE_APP,
      backgroundColor: theme.palette.background.default,
      margin: '0px',
      color: 'red',
   },
   input2: {
      backgroundColor: '#E2E8F0',
      borderRadius: BORDER_RADIUS_10,
      borderWidth: '0px',
      fontSize: 18 * SCALE_APP,
      padding: theme.spacing(1.5, 2.5),
      marginBottom: theme.spacing(1.25),
      height: 236 * SCALE_APP,
      color: 'secondary',
   },
   editor: {
      position: 'relative',
      '& .text-editor > .toolbar-common': {
         height: 45 * SCALE_APP,
         position: 'absolute',
         display: 'flex',
         alignItems: 'center',
         width: '100%',
         bottom: -50 * SCALE_APP,
      },
   },
}));

const FormAddOurWhy = ({data, onSubmit, onCancel}) => {
   const classes = useStyles();
   const [title, setTitle] = React.useState(data.title);
   const [content, setContent] = React.useState(data.content);
   const {isToggle, toggle} = useToggle();

   const handleSubmit = useCallback(
      async (e) => {
         e.preventDefault();
         toggle();
         const done = await onSubmit({
            title,
            content,
         })();
         toggle();
         done && onCancel();
      },
      [content, onSubmit, title, onCancel, toggle]
   );

   return (
      <Box display='flex' flexDirection='column' marginTop={1.25}>
         <Form onSubmit={handleSubmit}>
            <Box className={classes.editor}>
               <Editor onChange={setContent} value={content} id='FormAddOurWhy' />
            </Box>
            <Box display='flex' justifyContent='end' marginBottom={10 / 8} marginTop={10 / 8}>
               <OutLineButton label='cancel.button' onClick={onCancel} />
               <Box width={10 * SCALE_APP} />
               <FillButton type='submit' label='save.label' disabled={isToggle} />
            </Box>
         </Form>
      </Box>
   );
};

export default FormAddOurWhy;
