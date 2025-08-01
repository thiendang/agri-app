import {Avatar} from '@mui/material';
import {MenuItem} from '@mui/material';
import {Menu} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import {lighten} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {Delete} from '@mui/icons-material';
import {MoreVert} from '@mui/icons-material';
import {Remove} from '@mui/icons-material';
import {PersonAdd} from '@mui/icons-material';
import {findIndex} from 'lodash';
import {map} from 'lodash';
import {differenceBy} from 'lodash';
import {clone} from 'lodash';
import {createRef, useEffect, useRef} from 'react';
import {Fragment} from 'react';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {v4 as uuid} from 'uuid';
import {ACCOUNTABILITY_CHART_EDIT} from '../../../components/permission/PermissionAllow';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import TextFieldLF from '../../../components/TextFieldLF';
import {SCALE_APP} from '../../../Constants';
import {USER_DELETE} from '../../../data/QueriesGL';
import {getUserCacheQueries} from '../../../data/QueriesGL';
import {USER_CREATE_UPDATE} from '../../../data/QueriesGL';
import {SEAT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../../../data/QueriesGL';
import ConfirmMenuItem from '../../../fhg/components/ConfirmMenuItem';
import useEditData from '../../../fhg/components/edit/useEditData';
import Grid from '../../../fhg/components/Grid';
import MenuItemModal from '../../../fhg/components/MenuItemModal';
import Typography from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {findById} from '../../../fhg/utils/Utils';
import {removeOne} from '../../../fhg/utils/Utils';
import {stringAvatar} from '../../../fhg/utils/Utils';
import {userRoleState} from '../../Main';
import {useTheme} from '@mui/styles';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         width: 300 * SCALE_APP,
      },
      dividerStyle: {
         marginBottom: theme.spacing(0.5),
      },
      subtitleStyle: {
         color: theme.palette.text.primary,
         fontSize: 14 * SCALE_APP,
      },
      listItemStyle: {
         color: theme.palette.text.primary,
         fontSize: 14 * SCALE_APP,
      },
      personAddStyle: {
         color: 'black',
         marginLeft: theme.spacing(1),
         '&:hover': {
            color: theme.palette.primary.light,
         },
      },
      fadeArea: {
         '&:hover $fadeIn': {
            opacity: 1,
            transition: '0.3s',
            transitionDelay: '0.1s',
         },
      },
      fadeIn: {
         opacity: 0,
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.6),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: 'purple',
         },
      },
      menuItemStyle: {
         paddingRight: theme.spacing(0.5),
      },
   }),
   {name: 'SeatCardStyles'},
);

/**
 * Card to show the accountability chart seat.
 *
 * @param item The data item with the seat information.
 * @return {JSX.Element}
 * @constructor
 */
export default function SeatCard({item}) {
   const [{clientId: clientIdProp, entityId}] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const classes = useStyles();

   const [userData] = useQueryFHG(
      USER_CLIENT_QUERY,
      {variables: {clientId, includeNonCognito: true}, skip: !clientId},
      'user.type',
   );
   const [userCreateUpdate] = useMutationFHG(USER_CREATE_UPDATE);
   const [userDelete] = useMutationFHG(USER_DELETE);
   const [seatCreateUpdate] = useMutationFHG(SEAT_CREATE_UPDATE);

   const [editValues, handleChange, {resetValues}] = useEditData();

   const [openMenu, setOpenMenu] = useState(false);
   const [users, setUsers] = useState([]);

   const anchorElRef = useRef(null);

   const hasPermission = usePermission(ACCOUNTABILITY_CHART_EDIT);

   /**
    * Initialize the users based on the item userIdList.
    */
   useEffect(() => {
      const users = findById(userData?.users, item?.userIdList);
      setUsers(users ? users : []);
   }, [userData?.users, item?.userIdList]);

   /**
    * Show the add user menu for the component in the event.
    * @param event The mouse click event.
    */
   const handleAddUser = (event) => {
      setOpenMenu(true);
      anchorElRef.current = event.currentTarget;
   };

   /**
    * Close both menus if the user clicks away or selects a user.
    */
   const handleClose = () => {
      setMenuStatus(new Map(userOptions?.map((item) => [item.id, false])));
      setOpenMenu(false);
   };

   /**
    * Submit the set user to the server.
    *
    * @param user The user to submit.
    * @return {(function(): Promise<void>)|*}
    */
   const handleSetUser = (user) => async () => {
      if (menuStatus.get(user.id)) return;
      const userIds = clone(users);
      userIds.push(user);
      setUsers(userIds);
      setOpenMenu(false);
      let variables = {id: item.id, userIdList: map(userIds, 'id')};
      await seatCreateUpdate({
         variables,
         optimisticResponse: {
            __typename: 'Mutation',
            seat: {
               __typename: 'Seat',
               ...item,
               ...variables,
               entityId,
               isDeleted: false,
            },
         },
      });
   };

   const handleNewUser = async () => {
      const variables = {id: uuid(), ...editValues, clientId};
      try {
         const result = await userCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               user: {
                  __typename: 'User',
                  cognitoSub: null,
                  isExecutive: false,
                  email: null,
                  ...variables,
                  isDeleted: false,
               },
            },
            update: cacheUpdate(getUserCacheQueries(clientId || null), variables.id, 'user'),
         });
         resetValues();
         await handleSetUser(result?.data?.user)();
      } catch (e) {
         console.log(e);
      }
   };

   const closeUserMenu = () => {
      setOpenMenu(false);
   };

   /**
    * Deletes the user from the users and userIds and submits the userIds in a mutation to the server.
    * @param user The deleted user.
    * @return {(function(): Promise<void>)|*}
    */
   const handleRemoveUser = (user) => async () => {
      const usersClone = clone(users);
      const index = findIndex(usersClone, {id: user?.id});

      if (index >= 0) {
         removeOne(usersClone, index);
         setUsers(usersClone);

         let variables = {id: item.id, userIdList: map(usersClone, 'id')};
         await seatCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               seat: {
                  __typename: 'Seat',
                  ...item,
                  ...variables,
                  entityId,
                  isDeleted: false,
               },
            },
            // update: isNew ? cacheUpdate(getSeatCacheQueries(clientId), editValues.id, 'seat') : undefined,
         });
      } else {
         console.log('Could not remove user', user, 'at index', index);
      }
   };

   /**
    * List of users not already selected for the seat.
    * @type {unknown[]}
    */
   const userOptions = useMemo(() => differenceBy(userData?.users, users, 'id'), [userData?.users, users]);

   const [listRefs, setListRefs] = useState(null);

   const [menuStatus, setMenuStatus] = useState(new Map());

   useEffect(() => {
      setMenuStatus(new Map(userOptions?.map((item) => [item.id, false])));
      setListRefs(new Map(userOptions?.filter((user) => !user?.username)?.map((item) => [item.id, createRef()])));
   }, [userOptions]);

   const handleVerticalMenuClick = (id) => (event) => {
      event.stopPropagation();
      event.preventDefault();
      setMenuStatus((prev) => {
         const news = new Map(userOptions?.map((item) => [item.id, false]));
         news.set(id, true);
         return news;
      });
   };

   const handleCancel = (id) => (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setMenuStatus(new Map(userOptions?.map((item) => [item.id, false])));
      setOpenMenu(false);
   };

   const handleDelete = (userId) => async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      await userDelete({
         variables: {id: userId},
         optimisticResponse: {user_Delete: 1},
         update: cacheDelete(getUserCacheQueries(clientId || null), userId),
      });
      setOpenMenu(false);
      setMenuStatus(new Map(userOptions?.map((item) => [item.id, false])));
   };

   const theme = useTheme();

   return (
      <Grid item fullHeight style={{display: 'flex', flexDirection: 'column'}}>
         <Stack display={'flex'} flexDirection={'row'} alignItems='center' mb={2} flexWrap={'wrap'}>
            {users?.map((user) => (
               <Box key={'frame ' + user?.id} display={'flex'} alignItems='center' marginTop={1}>
                  <Box position={'relative'} className={classes.fadeArea}>
                     <Tooltip title={user?.contactName}>
                        <Avatar
                           variant='square'
                           {...stringAvatar(user?.contactName, {
                              backgroundColor: theme.palette.background.avatar,
                           })}
                        />
                     </Tooltip>
                     {hasPermission && (
                        <IconButton
                           size={'small'}
                           style={{position: 'absolute', right: -2, top: -8}}
                           className={classes.fadeIn}
                           onClick={handleRemoveUser(user)}
                        >
                           <Remove
                              color={'primary'}
                              style={{
                                 fontSize: `${1.1 * SCALE_APP}rem`,
                                 backgroundColor: 'white',
                                 borderRadius: '50%',
                                 border: '1px solid',
                              }}
                           />
                        </IconButton>
                     )}
                  </Box>
                  {users.length === 1 && <Typography className={classes.listItemStyle}>{user?.contactName}</Typography>}
               </Box>
            ))}
            <Fragment>
               {userData?.users?.length > 0 ? (
                  <>
                     {userOptions?.length > 0 && hasPermission && (
                        <IconButton
                           onClick={handleAddUser}
                           size={'small'}
                           className={classes.personAddStyle}
                           ref={anchorElRef}
                        >
                           <PersonAdd style={{color: theme.palette.text.primary}} />
                        </IconButton>
                     )}
                     {!(users?.length > 0) && hasPermission && (
                        <Box
                           ref={anchorElRef}
                           component={'span'}
                           fontSize={12 * SCALE_APP}
                           ml={2}
                           style={{cursor: 'pointer', color: theme.palette.text.primary}}
                           onClick={handleAddUser}
                        >
                           Click to add seat holder
                        </Box>
                     )}
                     <PermissionAllow permissionName={ACCOUNTABILITY_CHART_EDIT}>
                        <Menu
                           anchorEl={anchorElRef.current}
                           keepMounted
                           open={openMenu}
                           onClose={handleClose}
                           transformOrigin={{
                              vertical: 'top',
                              horizontal: 'center',
                           }}
                        >
                           {userOptions?.map((user) => (
                              <MenuItem
                                 key={'UserKey-' + user?.id}
                                 value={user?.id}
                                 onClick={handleSetUser(user)}
                                 className={classes.menuItemStyle}
                              >
                                 <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                                    {user?.contactName}
                                    {!user?.username && (
                                       <>
                                          <MoreVert
                                             ref={listRefs?.get(user.id)}
                                             onClick={handleVerticalMenuClick(user.id)}
                                          />
                                          <Menu
                                             open={menuStatus.get(user.id)}
                                             anchorEl={listRefs?.get(user.id)?.current}
                                             onClose={handleClose}
                                          >
                                             <ConfirmMenuItem
                                                messageKey='confirmRemoveValue.message'
                                                color={'error'}
                                                onConfirm={handleDelete(user?.id)}
                                                onCancel={handleCancel(user?.id)}
                                                values={{type: 'person', name: user?.contactName}}
                                                size='small'
                                                submitStyle={classes.deleteColorStyle}
                                                startIcon={Delete}
                                                buttonTypographyProps={{variant: 'inherit'}}
                                             />
                                          </Menu>
                                       </>
                                    )}
                                 </Box>
                              </MenuItem>
                           ))}
                           <MenuItemModal
                              key={'UserKey Add user'}
                              titleKey={'seat.person.title'}
                              buttonLabelKey={'seat.person.title'}
                              menuLabelKey={'seat.person.label'}
                              onClick={closeUserMenu}
                              onConfirm={handleNewUser}
                           >
                              <TextFieldLF
                                 name={'contactName'}
                                 autoFocus
                                 labelKey='seat.name.label'
                                 placeholderKey='seat.person.placeholder'
                                 value={editValues.contactName}
                                 onChange={handleChange}
                              />
                           </MenuItemModal>
                        </Menu>
                     </PermissionAllow>
                  </>
               ) : (
                  <Box component={'span'} fontSize={12 * SCALE_APP} ml={2}>
                     Add users to the client to add a seat holder
                  </Box>
               )}
            </Fragment>
         </Stack>
         <Divider light className={classes.dividerStyle} />
         <Typography id={'seat.responsibilities.label'} className={classes.subtitleStyle} />
         <Box overflow={'auto'} flex={'1 1 auto'}>
            <ul style={{marginTop: 4 * SCALE_APP, marginLeft: -8 * SCALE_APP, marginBottom: 4 * SCALE_APP}}>
               {item?.responsibilities?.length > 0 &&
                  item?.responsibilities.map((responsibility) => (
                     <li
                        key={'li ' + responsibility.name}
                        style={{fontSize: 14 * SCALE_APP, color: theme.palette.text.primary, lineBreak: 'anywhere'}}
                     >
                        <p
                           style={{
                              lineBreak: 'auto',
                              wordBreak: 'break-word',
                              marginBottom: '-10px',
                           }}
                        >
                           {responsibility.name}
                        </p>
                     </li>
                  ))}
            </ul>
         </Box>
      </Grid>
   );
}
