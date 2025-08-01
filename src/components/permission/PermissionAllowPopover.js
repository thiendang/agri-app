import {Close} from '@mui/icons-material';
import {Link} from '@mui/material';
import {Alert} from '@mui/material';
import {Popover} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import {useRef} from 'react';
import {Fragment} from 'react';
import {useState} from 'react';
import React from 'react';
import {SCHEDULE_LINK} from '../../Constants';
import TypographyFHG from '../../fhg/components/Typography';
import usePermission from './usePermission';

/**
 * Component to require a permission before allowing the user to interact with the children components. A popover will
 * be displayed if the user doesn't have permission.
 *
 * @param permissionName The name of the permission to require.
 * @param children The children will always be displayed.
 * @return {*|null} The children if the user has permission or null otherwise.
 * @constructor
 */
export default function PermissionAllowPopover({permissionName, children}) {
   const hasPermission = usePermission(permissionName);
   const ref = useRef();

   const [isOpen, setIsOpen] = useState(false);

   const handleClose = () => {
      ref.current = null;
      setIsOpen(false);
   };

   const handleClickCapture = (event) => {
      ref.current = event.currentTarget;
      setIsOpen(true);
   };
   const upgradePopover = () => {
      return (
         <>
            <Popover
               open={isOpen}
               anchorEl={ref.current}
               anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
               }}
               transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
               }}
               onClose={handleClose}
            >
               <Paper>
                  <Alert severity='info'>
                     <TypographyFHG
                        variant={'subtitle1'}
                        hasLineBreaks
                        id={'noPermission.2.message'}
                        sx={{display: 'inline-block', mr: 1}}
                     />
                     <Link
                        href={SCHEDULE_LINK}
                        target='_blank'
                        rel='noreferrer'
                        sx={{fontSize: 14, color: 'rgb(1, 67, 97)'}}
                     >
                        {SCHEDULE_LINK}
                     </Link>
                     <IconButton sx={{position: 'absolute', top: 0, right: 0}} onClick={handleClose}>
                        <Close />
                     </IconButton>
                  </Alert>
               </Paper>
            </Popover>
            <Box onClickCapture={handleClickCapture} sx={{opacity: 0.6}}>
               {children}
            </Box>
         </>
      );
   };

   return hasPermission ? children : upgradePopover();
}
