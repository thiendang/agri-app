import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {DELETE_ICON} from '../Constants';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import EditIcon from '../pages/client/gamePlan/EditIcon';
import {userRoleState} from '../pages/Main';

const useStyles = makeStyles((theme) => ({}), {name: 'DeleteEditButtonsStyles'});

DeleteEditButtons.propTypes = {};

export default function DeleteEditButtons({onDelete, onEdit, type, name}) {
   const classes = useStyles();
   const {isSuperAdmin} = useRecoilValue(userRoleState);
   const theme = useTheme();

   if (!isSuperAdmin) {
      return null;
   }
   return (
      <>
         <IconButton size={'small'} onClick={onEdit}>
            <EditIcon marginLeft={0} />
         </IconButton>
         <ConfirmIconButton
            className={classes.buttonStyle}
            color={theme.palette.error.dark}
            messageKey={'confirmRemoveValue.message'}
            onConfirm={onDelete}
            values={{type, name}}
            size='small'
            style={{marginLeft: theme.spacing(1)}}
            submitStyle={classes.deleteColorStyle}
            buttonTypographyProps={{variant: 'inherit'}}
            // disabled={isSaving || isNew}
         >
            <img alt='Delete' src={DELETE_ICON} />
         </ConfirmIconButton>
      </>
   );
}
