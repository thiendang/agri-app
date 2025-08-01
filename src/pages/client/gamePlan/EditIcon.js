import {useTheme} from '@mui/styles';
import React from 'react';
import {SCALE_APP} from '../../../Constants';

const EditIcon = ({onClick, marginLeft}) => {
   const theme = useTheme();
   return (
      <img
         onClick={onClick}
         src='/images/edit.png'
         style={{
            width: 16 * SCALE_APP,
            height: 15 * SCALE_APP,
            marginLeft: marginLeft === undefined ? theme.spacing(1.75) : marginLeft,
            cursor: 'pointer',
         }}
         alt='edit'
      />
   );
};

export default EditIcon;
