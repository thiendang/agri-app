import {Box, Button} from '@mui/material';
import React from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import {useSetRecoilState} from 'recoil';
import {TYPE_RIGHT, typeForRightSideStore} from './stores';
import {makeStyles} from '@mui/styles';
import {ADD_CHAT_IMAGE, SCALE_APP} from '../../../Constants';

const useStyles = makeStyles((theme) => ({
   button: {
      width: '100%',
   },
}));

/**
 * Button component to add new chat room
 *
 * @param onClick handle add new chat room.
 * @return {JSX.Element}
 * @constructor
 */
const AddChatButton = ({onClick}) => {
   const setTypeForRightSide = useSetRecoilState(typeForRightSideStore);
   const classes = useStyles();
   return (
      <Button
         onClick={() => {
            setTypeForRightSide(TYPE_RIGHT.new);
            onClick();
         }}
         className={classes.button}
      >
         <Box display='flex' flex={1} flexDirection='row' alignItems='center'>
            <img
               src={ADD_CHAT_IMAGE}
               alt='add user'
               style={{
                  width: 48 * SCALE_APP,
                  height: 48 * SCALE_APP,
               }}
            />
            <Box width='27px' />
            <TypographyFHG variant='fs18500' color='text.green' id='chat.createChat' />
         </Box>
      </Button>
   );
};

export default AddChatButton;
