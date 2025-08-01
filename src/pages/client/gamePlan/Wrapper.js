import {Box} from '@mui/material';
import {useTheme} from '@mui/styles';
import React from 'react';
import {useMemo} from 'react';
import {DARK_MODE_COLORS, SCALE_APP} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';

const Wrapper = ({children, sx = {}}) => {
   const theme = useTheme();
   const container = useMemo(
      () => ({
         margin: 4 * SCALE_APP,
         marginTop: '0px',
         marginBottom: theme.spacing(2.5),
         padding: theme.spacing(4, 5),
         backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_1 : theme.palette.background.main,
         boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
         borderRadius: BORDER_RADIUS_10,
      }),
      [theme],
   );
   return <Box style={{...container, ...sx}}>{children}</Box>;
};

export default Wrapper;
