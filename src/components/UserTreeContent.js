import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {useTheme} from '@mui/material/styles';
import * as PropTypes from 'prop-types';
import React from 'react';
import {USER_EDIT} from '../Constants';
import {getLoginUserByClientCacheQueries} from '../data/QueriesGL';
import {USER_DELETE} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import {cacheDelete} from '../fhg/utils/DataUtil';
import EditIcon from '../pages/client/gamePlan/EditIcon';

UserTreeContent.propTypes = {
   classes: PropTypes.any,
   onClick: PropTypes.func,
   user: PropTypes.any,
   onConfirm: PropTypes.func,
   theme: PropTypes.any,
};

export default function UserTreeContent({user, classes}) {
   const [{clientId}] = useCustomSearchParams();
   const navigate = useNavigateSearch();
   const theme = useTheme();

   const [userDelete] = useMutationFHG(USER_DELETE);

   const handleEditUser = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      navigate(USER_EDIT, {replace: true, state: {id: user.id}});
   };

   const handleDeleteUser = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await userDelete({
         variables: {id: user.id},
         optimisticResponse: {user_Delete: 1},
         update: cacheDelete(getLoginUserByClientCacheQueries(clientId), user.id),
      });
   };

   return (
      <Stack direction={'row'} justifyContent={'space-between'} className={classes.fadeArea}>
         <TypographyFHG
            variant='subtitle1'
            color={'textPrimary'}
            className={classes.treeLabelStyle}
            onClick={handleEditUser}
         >
            {user?.contactName || user?.username}
         </TypographyFHG>
         <Stack flexDirection={'row'} sx={{mr: 2}}>
            <IconButton size={'small'} onClick={handleEditUser} sx={{width: 32, height: 32}}>
               <EditIcon marginLeft={0} />
            </IconButton>
            <ConfirmIconButton
               className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
               onConfirm={handleDeleteUser}
               sx={{width: 32, height: 32}}
               values={{type: 'user', name: user.contactName}}
               messageKey={'confirmRemoveValue.message'}
               size={'small'}
               submitStyle={classes.deleteColorStyle}
            >
               <img src={'/images/delete.png'} />
            </ConfirmIconButton>
         </Stack>
      </Stack>
   );
}
