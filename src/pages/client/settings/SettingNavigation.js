// import {Divider} from '@mui/material';
import {Stack} from '@mui/material';
import {List} from '@mui/material';
import {makeStyles} from '@mui/styles';
import React from 'react';
import {DrawerMenuButton} from '../../../components/DrawerMenuButton';
// import {SETTINGS_BILLING_PATH} from '../../../Constants';
// import {BILLING_ICON} from '../../../Constants';
import {SETTING_ICON} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {USER_ICON} from '../../../Constants';
import {SETTINGS_PROFILE_PATH} from '../../../Constants';
import {SETTINGS_ACCOUNT_PATH} from '../../../Constants';
import ListItemButtonFHG from '../../../fhg/components/ListItemButtonFHG';
import TypographyFHG from '../../../fhg/components/Typography';

const useStyles = makeStyles((theme) => ({
   imageColor: {
      filter: theme.palette.mode === 'dark' ? 'invert(100%)' : '#2e2e2e',
      '&.selected': {
         filter: 'invert(100%)',
      },
      marginRight: theme.spacing(1.25),
   },
}));

/**
 * The panel to show the user setting options.
 *
 * @return {Element}
 * @constructor
 */
export default function SettingNavigation() {
   const classes = useStyles();

   return (
      <Stack flexDirection={'column'}>
         <Stack flexDirection={'row'} alignItems={'center'}>
            <DrawerMenuButton />
            <TypographyFHG variant={'h5'} style={{fontWeight: 700}} id='settings.navigation.title' />
         </Stack>
         <List dense>
            <ListItemButtonFHG
               primary={'Profile'}
               to={`${SETTINGS_PROFILE_PATH}`}
               searchParamsAllowed={['clientId', 'entityId', 'reportDate']}
               hasSearch={true}
               startIcon={<img src={USER_ICON} alt='user icon' width={18 * SCALE_APP} className={classes.imageColor} />}
            />
            <ListItemButtonFHG
               primary={'Account'}
               to={`./${SETTINGS_ACCOUNT_PATH}`}
               searchParamsAllowed={['clientId', 'entityId', 'reportDate']}
               hasSearch={true}
               startIcon={
                  <img src={SETTING_ICON} alt='setting icon' width={24 * SCALE_APP} className={classes.imageColor} />
               }
            />
            {/*<Divider sx={{my: 0.5}} />*/}
            {/*<ListItemButtonFHG*/}
            {/*   primary={'Billing'}*/}
            {/*   to={`./${SETTINGS_BILLING_PATH}`}*/}
            {/*   searchParamsAllowed={['clientId', 'entityId', 'reportDate']}*/}
            {/*   hasSearch={true}*/}
            {/*   startIcon={*/}
            {/*      <img src={BILLING_ICON} alt='billing icon' width={20 * SCALE_APP} className={classes.imageColor} />*/}
            {/*   }*/}
            {/*/>*/}
         </List>
      </Stack>
   );
}
