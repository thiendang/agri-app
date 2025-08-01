import {Box} from '@mui/material';
import React from 'react';
import TextFieldLF from './TextFieldLF';
import TextAreaField from './TextAreaField';
import ModalDialog from '../fhg/components/dialog/ModalDialog';
import useMutationLxFHG from '../fhg/hooks/data/useMutationFHG';
import {FEEDBACK_CREATE} from '../data/QueriesGL';
import {useState} from 'react';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles((theme) => ({
   input: {
      '& .MuiOutlinedInput-root': {
         color: `${theme.palette.text.primary} !important`,
      },
   },
}));

export const ProvideFeedbackModal = ({open, handleClose, id, onSuccess}) => {
   const classes = useStyles();
   const [subject, setSubject] = React.useState('');
   const [content, setContent] = React.useState('');

   const [loading, setLoading] = useState(false);

   const [createFeedback] = useMutationLxFHG(FEEDBACK_CREATE);

   const handleSubmit = async () => {
      try {
         setLoading(true);
         await createFeedback({
            variables: {
               feedback: {
                  subject,
                  text: content,
               },
            },
         });
         handleClose();
         onSuccess();
      } finally {
         setLoading(false);
      }
   };

   return (
      <ModalDialog
         open={open}
         onClose={handleClose}
         titleKey='feedback.label'
         submitKey='feedback.button.label'
         onSubmit={handleSubmit}
         isSaving={loading}
         isForm
      >
         <Box
            sx={{
               width: '350px',
               display: 'flex',
               flexDirection: 'column',
            }}
         >
            <Box sx={{pt: 0.5, pb: 0}}>
               <TextFieldLF
                  className={classes.input}
                  required
                  placeholderKey='feedback.subject.hint'
                  onChange={(e) => setSubject(e.target.value)}
               />
            </Box>
            <Box>
               <TextAreaField
                  className={classes.input}
                  required
                  placeholderKey='feedback.content.hint'
                  onChange={(e) => setContent(e.target.value)}
               />
            </Box>
         </Box>
      </ModalDialog>
   );
};
