import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {useOutlet} from 'react-router-dom';
import EditDrawer from '../../../components/EditDrawer';
import {SEAT_DRAWER_WIDTH} from '../../../Constants';
import Grid from '../../../fhg/components/Grid';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import ClientEntityTree from './ClientEntityTree';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         display: 'flex',
         height: '100%',
         position: 'relative',
      },
      contentStyle: {
         position: 'relative',
         padding: theme.spacing(0, 3, 4),
         [theme.breakpoints.up('md')]: {
            padding: theme.spacing(0, 0.375, 2),
         },
         overflow: 'auto',
         maxHeight: '100%',
      },
   }),
   {name: 'ClientEntitiesStyles'},
);

/**
 * Client Entities Tree component for the clients. Displays two levels at the client level and at the entity level.
 *
 * Reviewed:
 */
export default function ClientEntities() {
   const classes = useStyles();
   const outletElement = useOutlet();

   usePageTitle({titleKey: 'balance.entities.label'});

   return (
      <Grid container className={classes.root} fullHeight>
         {outletElement && (
            <EditDrawer open={true} width={SEAT_DRAWER_WIDTH}>
               {outletElement}
            </EditDrawer>
         )}

         <ClientEntityTree />
      </Grid>
   );
}
