import {Tab, Tabs} from '@mui/material';
import React from 'react';
import {GAME_PLAN_TABBAR} from '../../../Constants';
import {makeStyles} from '@mui/styles';

const useStyles = makeStyles((theme) => ({
   tabs: {
      '& .MuiTab-textColorPrimary': {
         color: theme.palette.text.primary,
      },
      '& .Mui-selected': {
         color: '#769548',
      },
   },
}));

export default function ColorTabs({onChangeTab}) {
   const [value, setValue] = React.useState(0);

   const classes = useStyles();

   const handleChange = (event, newValue) => {
      setValue(newValue);
      onChangeTab(newValue);
   };

   return (
      <Tabs name='Tab buttons' value={value} onChange={handleChange} className={classes.tabs}>
         {GAME_PLAN_TABBAR.map((tab, index) => (
            <Tab value={index} label={tab} />
         ))}
      </Tabs>
   );
}
