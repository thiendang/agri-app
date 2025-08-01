import {AddCircleOutline} from '@mui/icons-material';
import {List} from '@mui/material';
import {Stack} from '@mui/material';
import React from 'react';
import {Outlet} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {FRANCHISE_INVITE} from '../Constants';
import {INVITE_ALL_WHERE_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ListItemButtonFHG from '../fhg/components/ListItemButtonFHG';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import ScrollStack from '../fhg/ScrollStack';
import {userRoleState} from '../pages/Main';
import Header from './Header';

const POLL_INTERVAL = 1000 * 60 * 10;

FranchiseInvite.propTypes = {};

export default function FranchiseInvite({props}) {
   const [{franchiseId: franchiseIdProp}] = useCustomSearchParams();
   const {franchiseId: franchiseIdState} = useRecoilValue(userRoleState);
   const franchiseId = franchiseIdProp || franchiseIdState;
   const location = useLocation();

   const navigate = useNavigateSearch();

   const [{invitations = []} = {}] = useQueryFHG(
      INVITE_ALL_WHERE_QUERY,
      {
         variables: {franchiseId: franchiseId, clientId: null},
         skip: !validate(franchiseId),
         pollInterval: POLL_INTERVAL,
      },
      'invite.type',
   );

   const handleInvite = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(`./${FRANCHISE_INVITE}`, {replace: true}, undefined, undefined, undefined, 'invitationId');
   };

   return (
      <Stack direction={'column'} sx={{mt: 1}} maxWidth={500} maxHeight={'100%'}>
         <Outlet />
         <Header idTitle={'franchise.invite.title'} width={'100%'} spacing={1}>
            <ButtonFHG labelKey='franchise.invite.button' startIcon={<AddCircleOutline />} onClick={handleInvite} />
         </Header>
         <ScrollStack>
            <List dense sx={{mb: 0}}>
               {invitations?.length > 0 ? (
                  invitations.map((invitation) => (
                     <ListItemButtonFHG
                        key={invitation?.id}
                        state={{id: invitation?.id}}
                        to={FRANCHISE_INVITE}
                        search={{invitationId: invitation?.id}}
                        selected={location?.state?.id === invitation?.id}
                        primary={invitation?.toEmail}
                        secondary={invitation?.inviteUsed ? 'Used' : invitation?.inviteSent ? 'Sent' : 'Not Sent'}
                        sx={{py: 0}}
                        dense
                     />
                  ))
               ) : (
                  <TypographyFHG id='franchise.noInvitations.label' variant={'h6'} sx={{color: 'text.grey'}} />
               )}
            </List>
         </ScrollStack>
      </Stack>
   );
}
