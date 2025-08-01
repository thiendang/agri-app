import {Box} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React from 'react';
import {SCALE_APP} from '../../../Constants';

const useStyles = makeStyles((theme) => ({
   avatar: {
      width: 26 * SCALE_APP,
      height: 26 * SCALE_APP,
      borderRadius: '100%',
      marginRight: theme.spacing(0.75),
      backgroundColor: '#E5E5E5',
   },
}));

const AvatarAssigner = ({src}) => {
   const classes = useStyles();
   if (!src) return <Box className={classes.avatar} />;
   return <img className={classes.avatar} src={src} alt='avatar' />;
};

export default AvatarAssigner;
