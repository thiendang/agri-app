import {AddCircleOutline} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {List} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {sortBy} from 'lodash';
import filter from 'lodash/filter';
import {useMemo} from 'react';
import React from 'react';
import {Outlet} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {ADMIN_USERS_WIDTH} from '../Constants';
import {SUPER_ADMIN_GROUP} from '../Constants';
import {USER_EDIT} from '../Constants';
import {LOGIN_USER_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ListItemButtonFHG from '../fhg/components/ListItemButtonFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePageTitle from '../fhg/hooks/usePageTitle';
import ScrollStack from '../fhg/ScrollStack';
import {userRoleState} from '../pages/Main';
import Empty from './Empty';
import Header from './Header';
import {useLocation} from 'react-router-dom';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(0, 2),
      },
      listStyle: {
         borderRight: '1px solid lightgray',
         overflow: 'hidden',
         height: '100%',
      },
   }),
   {name: 'UsersStyles'},
);

export default function Users() {
   const [{search}] = useCustomSearchParams();
   const classes = useStyles();
   const navigate = useNavigateSearch();

   const location = useLocation();
   const userId = location?.state?.id;
   const {isSuperAdmin, franchiseId} = useRecoilValue(userRoleState);

   const [userData] = useQueryFHG(
      LOGIN_USER_QUERY,
      {variables: {franchiseId}, skip: !validate(franchiseId)},
      'user.type',
   );
   usePageTitle({titleKey: 'user.title2.label'});

   const filteredUsers = useMemo(() => {
      let users = [];

      if (userData?.users) {
         const filteredUsers = isSuperAdmin
            ? userData?.users
            : filter(
                 userData?.users,
                 (user) => user.roles?.[0]?.name !== SUPER_ADMIN_GROUP && user.franchiseId === franchiseId,
              );
         return sortBy(filteredUsers, 'contactName');
      }
      return users;
   }, [userData?.users]);

   const sortedUsers = useMemo(() => {
      let users = [];

      if (filteredUsers?.length > 0) {
         if (search) {
            users = filter(filteredUsers, (user) => user.contactName?.includes(search));
         } else {
            users = filteredUsers;
         }
      }
      return users;
   }, [search, filteredUsers]);

   const handleNewUser = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      navigate(USER_EDIT, {state: {id: 'new'}});
   };

   return (
      <SplitPane
         split={'vertical'}
         maxSize={ADMIN_USERS_WIDTH * 1.25}
         minSize={ADMIN_USERS_WIDTH * 0.75}
         defaultSize={ADMIN_USERS_WIDTH}
         pane1Style={{overflow: 'hidden'}}
      >
         <Stack className={classes.listStyle} direction={'column'}>
            <Header
               idTitle={'user.adminTitle.label'}
               width={'100%'}
               spacing={1}
               sx={{pl: 2, justifyContent: 'space-between'}}
            >
               <ButtonFHG labelKey='user.new.button' startIcon={<AddCircleOutline />} onClick={handleNewUser} />
            </Header>
            <Empty
               open={filteredUsers?.length > 0 && sortedUsers?.length <= 0 && search?.length > 0}
               titleMessageKey={'empty.search.title'}
               messageKey={'empty.users.message'}
               messageValues={{count: filteredUsers?.length}}
               imageScale={75}
            />
            <ScrollStack className={classes.root}>
               <List dense>
                  {sortedUsers.map((user) => (
                     <ListItemButtonFHG
                        key={user?.id}
                        state={{id: user.id}}
                        to={USER_EDIT}
                        selected={userId === user.id}
                        primary={user.contactName || user.username}
                     />
                  ))}
               </List>
            </ScrollStack>
         </Stack>
         <Outlet />
      </SplitPane>
   );
}
