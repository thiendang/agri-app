import {GroupAdd} from '@mui/icons-material';
import {AddCircleOutline} from '@mui/icons-material';
import {Stack} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import {lighten, useTheme} from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import * as PropTypes from 'prop-types';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {CLIENT_INVITE} from '../Constants';
import {SCALE_APP} from '../Constants';
import {CLIENT_EDIT} from '../Constants';
import {USER_EDIT} from '../Constants';
import {TASK_EDIT} from '../Constants';
import {INVITE_ALL_WHERE_QUERY} from '../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../data/QueriesGL';
import {TASK_CLIENT_QUERY} from '../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ListItemButtonFHG from '../fhg/components/ListItemButtonFHG';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import ScrollStack from '../fhg/ScrollStack';
import EditIcon from '../pages/client/gamePlan/EditIcon';
import {userRoleState} from '../pages/Main';
import {ClientTreeContent} from './ClientTreeContent';
import Header from './Header';
import filter from 'lodash/filter';
import {validate} from 'uuid';

export const USER_NODE = 'users';

const useStyles = makeStyles(
   (theme) => ({
      inputStyle: {
         backgroundColor: theme.palette.background.default,
      },
      frameStyle: {
         padding: theme.spacing(1, 2, 4),
      },
      expand: {
         transform: 'rotate(0deg)',
         marginLeft: 'auto',
         transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
         }),
      },
      expandOpen: {
         transform: 'rotate(180deg)',
      },
      titleStyle: {
         paddingTop: theme.spacing(2),
         // position: 'relative',
      },
      fadeArea: {
         '&:hover $fadeIn': {
            opacity: 1,
         },
      },
      fadeIn: {
         opacity: 0,
      },
      labelRoot: {
         '&:hover $fadeIn': {
            opacity: 1,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.dark, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.dark, 0.6),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      buttonStyle: {
         height: 42 * SCALE_APP,
         zIndex: 1000,
      },
      treeLabelStyle: {
         cursor: 'pointer',
      },
      progressStyle: {},
      imageStyle: {
         display: 'block',
         height: 'calc(3vw + 18px)',
         maxHeight: 64 * SCALE_APP,
         minHeight: 37 * SCALE_APP,
      },
   }),
   {name: 'AdminDrawerStyles'},
);

export default function AdminDrawer() {
   const {clientId} = useRecoilValue(userRoleState);
   const classes = useStyles();
   const navigate = useNavigateSearch();
   const theme = useTheme();

   const location = useLocation();
   const isNew = location?.state?.isNew;

   const [data] = useQueryFHG(CLIENT_BY_ID_QUERY, {variables: {clientId}, skip: !clientId || isNew}, 'client.type');

   const [clientIdState, setClientIdState] = useState(clientId);
   const [selectedClient, setSelectedClient] = useState();

   const [userData] = useQueryFHG(
      USER_CLIENT_QUERY,
      {variables: {clientId: clientIdState}, skip: !validate(clientIdState)},
      'user.type',
   );
   const [taskData] = useQueryFHG(
      TASK_CLIENT_QUERY,
      {variables: {clientId: clientIdState}, skip: !validate(clientIdState)},
      'task.type',
   );
   const [inviteData] = useQueryFHG(
      INVITE_ALL_WHERE_QUERY,
      {variables: {clientId}, skip: !validate(clientId)},
      'invite.type',
   );

   const users = useMemo(() => filter(userData?.users || [], (user) => !!user?.username), [userData?.users]);
   const tasks = useMemo(() => taskData?.tasks || [], [taskData?.tasks]);
   const invitations = useMemo(() => inviteData?.invitations || [], [inviteData?.invitations]);

   useEffect(() => {
      setClientIdState(clientId);
      setSelectedClient(clientId ? data?.client : undefined);
   }, [clientId, data?.client]);

   const handleNewClient = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(CLIENT_EDIT, {replace: true, state: {isNew: true}});
   };

   const handleNewUser = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(USER_EDIT, {replace: true, state: {id: 'new'}});
   };

   const handleNewTask = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(TASK_EDIT, {replace: true});
   };

   const handleEditClient = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(CLIENT_EDIT, {replace: true, state: {isNew: false}});
   };

   const handleInviteClient = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(CLIENT_INVITE, {replace: true}, undefined, undefined, undefined, 'invitationId');
   };

   return (
      <Stack flexDirection={'column'} overflow={'hidden'} height={'100%'}>
         <Header idTitle='setup.client.label' width={'100%'} spacing={1} sx={{flexWrap: 'wrap'}}>
            <IconButton size={'small'} sx={{mr: 1}} onClick={handleEditClient}>
               <EditIcon marginLeft={0} />
            </IconButton>
            <Box flex={'1 1'} />
            <ButtonFHG startIcon={<AddCircleOutline />} onClick={handleNewClient} labelKey={'client.new.button'} />
         </Header>

         <ScrollStack backgroundColor={theme.palette.background.default} width={'100%'} height={'100%'}>
            <Stack
               backgroundColor={theme.palette.background.default}
               width={'100%'}
               height={'fit-content'}
               // overflow={'hidden'}
            >
               {selectedClient && (
                  <>
                     {/*<Stack direction={'column'} justifyContent={'flex-start'}>*/}
                     <ClientTreeContent classes={classes} client={selectedClient} />

                     <Stack flexDirection={'row'} sx={{mt: 3}}>
                        <TypographyFHG variant={'fs24500'} id={'user.title2.label'} color='text.primary' />
                        <ButtonFHG
                           name={'New User'}
                           labelKey='user.new.button'
                           startIcon={<AddCircleOutline />}
                           className={classes.buttonStyle}
                           onClick={handleNewUser}
                           sx={{ml: 2}}
                        />
                     </Stack>
                     {users.map((user) => (
                        <ListItemButtonFHG
                           key={user?.id}
                           state={{id: user?.id}}
                           to={USER_EDIT}
                           selected={location?.state?.id === user?.id}
                           primary={user?.contactName || user?.username}
                           sx={{py: 0}}
                           dense
                        />
                     ))}

                     <Stack flexDirection={'row'} sx={{mt: 3}}>
                        <TypographyFHG variant={'fs24500'} id={'task.titlePlural.label'} color='text.primary' />
                        <ButtonFHG
                           name={'New Task'}
                           labelKey='task.new.button'
                           startIcon={<AddCircleOutline />}
                           className={classes.buttonStyle}
                           onClick={handleNewTask}
                           sx={{ml: 2}}
                        />
                     </Stack>
                     {tasks.map((task) => (
                        <ListItemButtonFHG
                           key={task?.id}
                           state={{id: task?.id}}
                           to={TASK_EDIT}
                           selected={location?.state?.id === task?.id}
                           primary={task?.subject}
                           sx={{py: 0}}
                           dense
                        />
                     ))}

                     <Stack flexDirection={'row'} sx={{mt: 3}}>
                        <TypographyFHG variant={'fs24500'} id={'client.invitation.title'} color='text.primary' />
                        <ButtonFHG
                           name={'New Invite'}
                           labelKey='client.newInvitation.label'
                           startIcon={<AddCircleOutline />}
                           className={classes.buttonStyle}
                           onClick={handleInviteClient}
                           sx={{ml: 2}}
                        />
                     </Stack>
                     {invitations.map((invitation) => (
                        <ListItemButtonFHG
                           key={invitation?.id}
                           state={{id: invitation?.id}}
                           to={CLIENT_INVITE}
                           search={{invitationId: invitation?.id}}
                           selected={location?.state?.id === invitation?.id}
                           primary={invitation?.toEmail}
                           secondary={invitation?.inviteUsed ? 'Used' : invitation?.inviteSent ? 'Sent' : 'Not Sent'}
                           sx={{py: 0}}
                           dense
                        >
                           {}
                        </ListItemButtonFHG>
                     ))}
                     {/*</Stack>*/}
                  </>
               )}
            </Stack>
         </ScrollStack>
      </Stack>
   );
}

AdminDrawer.propTypes = {
   replaceValue: PropTypes.any,
   location: PropTypes.any,
   onClick: PropTypes.func,
};
