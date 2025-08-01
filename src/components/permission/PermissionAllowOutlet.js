import {Link} from '@mui/material';
import {Alert} from '@mui/material';
import {Snackbar} from '@mui/material';
import React from 'react';
import {useMemo} from 'react';
import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {SCHEDULE_LINK} from '../../Constants';
import TypographyFHG from '../../fhg/components/Typography';
import usePermission from './usePermission';

/**
 * Component to require a permission to show the Outlet.
 * @param permissionName the permission to require.
 * @param showUpgradeMessage Indicates if the upgrade snackbar should be shown to the user.
 * @return {JSX.Element|null} The Outlet if the user has permission or null otherwise.
 * @constructor
 */
export default function PermissionAllowOutlet({permissionName, showUpgradeMessage = false}) {
   const hasPermission = usePermission(permissionName);
   const [isOpen, setIsOpen] = useState(true);

   const handleClose = () => {
      setIsOpen(false);
   };

   const upgradeSnackbar = useMemo(() => {
      if (showUpgradeMessage) {
         return (
            <Snackbar open={isOpen} onClose={handleClose}>
               <Alert severity='info'>
                  <TypographyFHG variant={'subtitle1'} hasLineBreaks id={'noPermission.2.message'} />
                  <Link href={SCHEDULE_LINK} target='_blank' rel='noreferrer' />
               </Alert>
            </Snackbar>
         );
      } else {
         return null;
      }
   }, [isOpen, showUpgradeMessage]);

   return hasPermission ? <Outlet /> : upgradeSnackbar;
}
