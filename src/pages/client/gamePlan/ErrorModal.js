import {Box, Button, Modal} from '@mui/material';
import {useTheme} from '@mui/styles';
import React from 'react';
import {SCALE_APP} from '../../../Constants';
import TypographyFHG from '../../../fhg/components/Typography';

const ErrorModal = ({open, onClose, message}) => {
   const theme = useTheme();

   return (
      <Modal open={open} onClose={onClose}>
         <Box
            sx={{
               position: 'absolute',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               width: 400 * SCALE_APP,
               backgroundColor: theme.palette.background.default,
               boxShadow: 24,
               borderRadius: 5 * SCALE_APP,
            }}
            padding={2}
            display='flex'
            flexDirection='column'
            alignItems='center'
         >
            <TypographyFHG variant='fs20700' color='black'>
               {message}
            </TypographyFHG>
            <Box height={20 * SCALE_APP} />
            <Button color='error' variant='contained' onClick={onClose}>
               <TypographyFHG variant='fs20700' color='white' id='gamePlan.ok' />
            </Button>
         </Box>
      </Modal>
   );
};

export default ErrorModal;
