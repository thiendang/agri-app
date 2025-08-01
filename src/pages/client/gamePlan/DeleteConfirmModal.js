import {Box, Button, Modal} from '@mui/material';
import {makeStyles, useTheme} from '@mui/styles';
import React from 'react';
import {BORDER_RADIUS} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import TypographyFHG from '../../../fhg/components/Typography';

const useStyles = makeStyles((theme) => ({
   textCenter: {
      textAlign: 'center',
   },
}));

const DeleteConfirmModal = ({open, onClose, onDelete}) => {
   const theme = useTheme();
   const classes = useStyles(theme);

   return (
      <Modal open={open} onClose={onClose}>
         <Box
            style={{
               position: 'absolute',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               width: 400 * SCALE_APP,
               backgroundColor: theme.palette.background.default,
               boxShadow: 24,
               borderRadius: BORDER_RADIUS,
            }}
            padding={4}
            display='flex'
            flexDirection='column'
            alignItems='center'
         >
            <TypographyFHG variant='h5' id='gamePlan.rocks.deleteRock' color='text.primary' />
            <Box height={28 * SCALE_APP} />
            <TypographyFHG
               variant='fs18400'
               color='text.primary'
               className={classes.textCenter}
               id='gamePlan.rocks.deleteMessage'
            />
            <Box height={35 * SCALE_APP} />
            <Button color='primary' variant='contained' onClick={onDelete}>
               <TypographyFHG variant='fs16700' color='white' id='gamePlan.rocks.confirm' />
            </Button>
            <Box height={20 * SCALE_APP} />
            <Button onClick={onClose}>
               <TypographyFHG variant='fs16700' color='primary' id='gamePlan.rocks.cancel' />
            </Button>
         </Box>
      </Modal>
   );
};

export default DeleteConfirmModal;
