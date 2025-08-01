import {Tooltip} from '@mui/material';
import Stack from '@mui/material/Stack';
import {lighten} from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import {castArray} from 'lodash';
import {indexOf} from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment/moment';
import {useMemo} from 'react';
import {useRef} from 'react';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {USER_NODE} from '../../../components/AdminDrawer';
import TextFieldLF from '../../../components/TextFieldLF';
import {CLIENT_SIGNUP_GROUP} from '../../../Constants';
import {DARK_MODE_COLORS, AGRI_APP_FRANCHISE} from '../../../Constants';
import {CLIENT_GROUP} from '../../../Constants';
import {ADMIN_GROUP} from '../../../Constants';
import {SUPER_ADMIN_GROUP} from '../../../Constants';
import {ADMIN_PANEL_MAX_WIDTH_NEW_UI} from '../../../Constants';
import {CLIENT_EXTEND_FREE_TRIAL} from '../../../data/QueriesGL';
import {CLIENT_ACTIVATE_FREE_TRIAL} from '../../../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {FRANCHISE_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {ROLE_ALL_QUERY} from '../../../data/QueriesGL';
import {getLoginUserCacheQueries} from '../../../data/QueriesGL';
import {USER_DELETE} from '../../../data/QueriesGL';
import {USER_CLIENT_QUERY} from '../../../data/QueriesGL';
import {USER_CREATE_UPDATE} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import ConfirmButton from '../../../fhg/components/ConfirmButton';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import Form from '../../../fhg/components/edit/Form';
import useEditData from '../../../fhg/components/edit/useEditData';
import ProgressButton from '../../../fhg/components/ProgressButton';
import {authenticationDataStatus} from '../../../fhg/components/security/AuthenticatedUser';
import PasswordTextField from '../../../fhg/components/security/PasswordTextField';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import useKeyDown from '../../../fhg/hooks/useKeyDown';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../../../fhg/hooks/usePromptFHG';
import useResize from '../../../fhg/hooks/useResize';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {findByProperty} from '../../../fhg/utils/Utils';
import {formatMessage} from '../../../fhg/utils/Utils';
import {userRoleState} from '../../Main';
import PermissionPanel from './PermissionPanel';
import isArray from 'lodash/isArray';
import {useTheme} from '@mui/styles';

const TRIAL_DAY_DEFAULT = 13;

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         paddingLeft: theme.spacing(0.5),
         height: 'fit-content',
         overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
         minWidth: 270,
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)})`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 0.5, 2),
         overflow: 'auto',
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(1, 0, 0, 0),
         padding: theme.spacing(0, 2),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(0, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
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
            '& img': {
               filter: 'invert(100%)',
            },
         },
      },
   }),
   {name: 'UserEditStyles'},
);

export default function UserEdit({isAdminUserEdit = false}) {
   const classes = useStyles();
   const ref = useRef();
   const {clientId: userClientId, isAdmin, isExecutive, isSuperAdmin, franchiseId} = useRecoilValue(userRoleState);
   const clientId = isAdminUserEdit ? undefined : userClientId;
   const [isSmall, setIsSmall] = useState(false);

   const pollInterval = useRecoilValue(pollState);

   useResize(ref, true, false, (width) => setIsSmall(width < 420), 40, undefined, undefined, true);

   const intl = useIntl();
   const navigate = useNavigateSearch();
   const editItem = {
      name: '',
      username: '',
      clientId,
      isDeleted: false,
   };

   const location = useLocation();
   const userId = location?.state?.id;
   const isNew = userId === 'new';

   const [legacyFranchiseId, setLegacyFranchiseId] = useState();

   const [userData, {refetch}] = useQueryFHG(
      USER_CLIENT_QUERY,
      {
         variables: {clientId, id: userId},
         skip: isNew || !(isAdminUserEdit || validate(clientId)) || !userId,
         pollInterval,
         onCompleted: (data) => {
            if (data?.users?.length > 0) {
               let user = {...data.users[0]};

               if (user?.client?.freeTrialActive) {
                  user.trialDays = moment(data?.users[0].client.freeTrialExpires).diff(moment(), 'days');
               }
               user.freeTrialActive = user?.client?.freeTrialActive;

               resetValues(user);
            }
         },
      },
      'user.type',
   );

   const [userCreateUpdate] = useMutationFHG(USER_CREATE_UPDATE);
   const [userDelete] = useMutationFHG(USER_DELETE);

   const [data] = useQueryFHG(ROLE_ALL_QUERY);
   useQueryFHG(
      FRANCHISE_ALL_WHERE_QUERY,
      {
         variables: {name: AGRI_APP_FRANCHISE},
         skip: !isSuperAdmin,
         pollInterval,
         onCompleted: (data) => {
            setLegacyFranchiseId(data?.franchises?.[0]?.id);
         },
      },
      'franchise.type',
   );
   const [{client} = {}] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {variables: {clientId}, skip: !validate(clientId)},
      'client.type',
   );

   const [activate] = useMutationFHG(CLIENT_ACTIVATE_FREE_TRIAL);
   const [extend] = useMutationFHG(CLIENT_EXTEND_FREE_TRIAL);

   const [isSaving, setIsSaving] = useState(false);

   const [
      editValues,
      handleChange,
      {isChanged = false, defaultValues, currentValues, resetValues, getValue, setValue},
   ] = useEditData(isNew ? editItem : undefined, ['id', 'clientId', 'roleIdList', 'permissionIdList']);

   const filteredRoles = useMemo(() => {
      let roles = [];

      if (data?.roles?.length > 0) {
         if (!isAdminUserEdit) {
            roles = findByProperty(data?.roles, [CLIENT_GROUP, CLIENT_SIGNUP_GROUP], 'name');
         } else if (isSuperAdmin && legacyFranchiseId === franchiseId) {
            roles = findByProperty(data?.roles, [SUPER_ADMIN_GROUP, ADMIN_GROUP], 'name');
         } else if (isAdmin) {
            roles = findByProperty(data?.roles, [ADMIN_GROUP], 'name');
         }

         roles = cloneDeep(roles);
         for (const role of roles) {
            switch (role.name) {
               case CLIENT_GROUP:
                  role.label = 'Client';
                  break;
               case CLIENT_SIGNUP_GROUP:
                  role.label = 'Freemium';
                  break;
               case SUPER_ADMIN_GROUP:
                  role.label = 'Super Admin';
                  break;
               case ADMIN_GROUP:
                  role.label = 'Admin';
                  break;
               default:
                  role.label = 'Unknown';
                  break;
            }
         }
      }
      return roles;
   }, [data?.roles, franchiseId, isAdmin, isAdminUserEdit, isSuperAdmin, legacyFranchiseId]);

   usePromptFHG(isChanged);
   const authState = useRecoilValue(authenticationDataStatus);

   const handleClose = useCallback(() => {
      if (!isAdminUserEdit) {
         navigate('..', {replace: true, state: {nodeIdOpen: USER_NODE}}, {id: undefined}, false);
      } else {
         navigate('..', {replace: true}, {id: undefined}, false);
      }
   }, [isAdminUserEdit, navigate]);

   useEffect(() => {
      if (isNew) {
         resetValues();
      } else if (!userId) {
         handleClose();
      }
   }, [isNew, userId, resetValues, handleClose]);

   useKeyDown(handleClose);

   const isFreemiumRole = useMemo(() => {
      if (filteredRoles?.length > 0 && currentValues?.roleIdList?.length > 0) {
         const freemiumRole = findByProperty(filteredRoles, [CLIENT_SIGNUP_GROUP], 'name')?.[0];
         return indexOf(castArray(currentValues?.roleIdList), freemiumRole?.id) !== -1;
      }
      return false;
   }, [filteredRoles, currentValues?.roleIdList]);

   /**
    * Submit the user.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);
            const variables = {
               id: uuid(),
               ...editValues,
               roleIdList: filteredRoles?.length === 1 ? [filteredRoles?.[0]?.id] : editValues?.roleIdList,
               franchiseId,
               trialDays: undefined,
               freeTrialActive: undefined,
            };

            // editValues.roleIdList is already an array at least in Joni's error, so wrapping with an additional array triggers a gql type validation error
            await userCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  user: {
                     __typename: 'User',
                     ...defaultValues,
                     ...variables,
                     clientId: getValue('clientId') || '',
                     isDeleted: false,
                  },
               },
            });

            if (isFreemiumRole && editValues?.freeTrialActive) {
               await activate({variables: {clientId}});
            }
            if (
               isFreemiumRole &&
               editValues?.trialDays !== undefined &&
               editValues?.trialDays !== defaultValues?.trialDays
            ) {
               await extend({
                  variables: {
                     clientId,
                     days:
                        editValues?.trialDays -
                        (defaultValues?.trialDays !== undefined ? defaultValues?.trialDays : TRIAL_DAY_DEFAULT),
                  },
               });
            }

            await refetch({clientId, id: variables.id});
            await refetch({clientId, id: undefined});
            setIsSaving(false);
            handleClose();
         } catch (e) {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      activate,
      isFreemiumRole,
      isChanged,
      editValues,
      filteredRoles,
      franchiseId,
      userCreateUpdate,
      defaultValues,
      getValue,
      refetch,
      handleClose,
      extend,
      clientId,
   ]);

   const handleDelete = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsSaving(true);

      await userDelete({
         variables: {id: userId},
         optimisticResponse: {user_Delete: 1},
         update: cacheDelete(getLoginUserCacheQueries(clientId || null), userId),
      });
      await refetch({clientId, id: userId});
      await refetch({clientId, id: undefined});

      setIsSaving(false);
      handleClose();
   };

   /**
    * Handle onChange events for the password. Check if the password and confirm match.
    *
    * @param event The event that changed the input.
    * @param value The value if the component is an Autocomplete
    * @param name
    * @param reason The reason of the value change if Autocomplete
    */
   const handleChangeCallback = useCallback(
      (event, value, reason, newValue, name) => {
         handleChange(event, value, reason, newValue, name);

         if (name === 'password') {
            const target = document.getElementById('confirm_password');
            if (target) {
               target.setCustomValidity(
                  this.state.confirm !== this.state.password
                     ? formatMessage(intl, 'user.confirmMismatch.message', 'Confirm does not match the password.')
                     : '',
               );
            }
         }
      },
      [handleChange, intl],
   );

   const handlePermissionChange = (list) => {
      setValue('permissionIdList', list, true);
   };

   const theme = useTheme();

   return (
      <Stack
         ref={ref}
         direction={'column'}
         overflow={'hidden'}
         maxWidth={ADMIN_PANEL_MAX_WIDTH_NEW_UI}
         height={'100%'}
         sx={{px: 2, pb: 2}}
      >
         <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Stack flexDirection={'row'} alignItems={'center'}>
               {/*<Box position={'relative'}>*/}
               {/*   <Avatar*/}
               {/*      alt='Remy Sharp'*/}
               {/*      sx={{top: 0, left: 0, width: 125, height: 125, mr: 3}}*/}
               {/*      src='/images/Jace.png'*/}
               {/*   />*/}
               {/*   <Box*/}
               {/*      position={'absolute'}*/}
               {/*      display='flex'*/}
               {/*      alignItems={'center'}*/}
               {/*      justifyContent={'center'}*/}
               {/*      right={0}*/}
               {/*      bottom={0}*/}
               {/*   >*/}
               {/*      <CameraIcon></CameraIcon>*/}
               {/*      <img alt='camera' src={'/images/Camera.svg'} style={{position: 'absolute'}} />*/}
               {/*      <img alt='camera background' src={'/images/CameraCircle.png'} />*/}
               {/*   </Box>*/}
               {/*</Box>*/}
               <TypographyFHG
                  className='title-page'
                  variant='h4'
                  component={'span'}
                  id={'user.title.label'}
                  color={'text.primary'}
                  style={{fontWeight: 'bold'}}
               />
            </Stack>

            {defaultValues?.username !== authState?.username && (
               <ConfirmButton
                  className={classes.buttonStyle}
                  onConfirm={handleDelete}
                  values={{
                     type: isAdminUserEdit ? 'admin user' : 'user',
                     name: getValue('contactName'),
                  }}
                  size='small'
                  buttonLabelKey={'user.delete.button'}
                  submitStyle={classes.deleteColorStyle}
                  startIcon={<img alt='delete icon' src={'/images/delete.png'} />}
                  disabled={isSaving || isNew}
               />
            )}
         </Stack>

         <Form onSubmit={handleSubmit} className={classes.formStyle}>
            <Grid
               name={'User Edit Inner'}
               container
               width={'100%'}
               className={classes.infoInnerStyle}
               rowSpacing={1}
               columnSpacing={2}
               flex={'1 1'}
            >
               <TextFieldLF
                  key={'contactName' + defaultValues.id}
                  name={'contactName'}
                  autoFocus
                  labelTemplate={'user.{name}.label'}
                  onChange={handleChange}
                  defaultValue={defaultValues.contactName}
                  value={editValues.contactName}
                  required
                  layout={{xs: 12, sm: isSmall ? 12 : 6, lg: 6}}
               />
               <CheckboxFHG
                  key={'noEmail ' + defaultValues.id}
                  name={'noEmail'}
                  defaultChecked={defaultValues.noEmail}
                  checked={editValues.noEmail}
                  onChange={handleChange}
                  labelKey={'user.noEmail.label'}
                  marginTop={0}
                  marginLeft={0}
               />
               {!getValue('noEmail') && (
                  <TextFieldLF
                     key={'email' + defaultValues.id}
                     name={'email'}
                     labelTemplate={'user.{name}.label'}
                     onChange={handleChange}
                     defaultValue={defaultValues.email}
                     value={editValues.email}
                     required
                     layout={{xs: 12, sm: isSmall ? 12 : 6}}
                     sx={{
                        '& .Mui-disabled': {
                           color: `${
                              theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(0, 0, 0, 0.87)'
                           } !important`,
                           '& .Mui-required': {
                              color: `${
                                 theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(0, 0, 0, 0.87)'
                              } !important`,
                           },
                        },
                     }}
                  />
               )}
               <TextFieldLF
                  key={'username' + defaultValues.id}
                  name={'username'}
                  labelTemplate={'user.{name}.label'}
                  onChange={handleChange}
                  defaultValue={defaultValues.username}
                  value={editValues.username}
                  disabled={!isNew}
                  helperText={!isNew ? 'Username cannot be changed' : undefined}
                  required
                  layout={{xs: 12, sm: isSmall ? 12 : 6}}
               />
               {filteredRoles?.length > 1 && (
                  <AutocompleteMatchLXData
                     key={'roleIdList' + defaultValues.id + ' ' + filteredRoles?.length}
                     name={'roleIdList'}
                     options={filteredRoles}
                     disableClearable
                     matchSorterProps={{keys: ['label']}}
                     optionLabelKey={'label'}
                     labelKey={'user.role.label'}
                     onChange={handleChange}
                     defaultValue={defaultValues?.roleIdList?.[0]}
                     value={isArray(editValues?.roleIdList) ? editValues?.roleIdList?.[0] : editValues?.roleIdList}
                     fullWidth
                     layout={{xs: 12, sm: isSmall ? 12 : 6}}
                  />
               )}
               {isFreemiumRole && (
                  <CheckboxFHG
                     key={'freeTrialActive ' + defaultValues.id}
                     name={'freeTrialActive'}
                     defaultChecked={defaultValues?.freeTrialActive}
                     checked={currentValues?.freeTrialActive}
                     onChange={handleChange}
                     labelKey={'free.activate.button'}
                     disabled={userData?.users[0]?.client?.freeTrialActive}
                     marginTop={0}
                     marginLeft={0}
                  />
               )}
               {isFreemiumRole && currentValues?.freeTrialActive && (
                  <TextFieldLF
                     key={'trialDays' + defaultValues.id}
                     name={'trialDays'}
                     labelKey={'free.trialDays.label'}
                     onChange={handleChange}
                     defaultValue={defaultValues.trialDays === undefined ? TRIAL_DAY_DEFAULT : defaultValues.trialDays}
                     layout={{xs: 12, sm: isSmall ? 12 : 6, lg: 6}}
                     type='number'
                  />
               )}

               <PasswordTextField
                  key={'password' + defaultValues.id}
                  name='password'
                  fullWidth
                  isNew={isNew}
                  disabled={isSaving}
                  onChange={handleChangeCallback}
                  password={editValues.password}
                  confirm={editValues.confirm}
                  layout={{xs: 12, sm: isSmall ? 12 : 6}}
               />
               {isAdminUserEdit && isSuperAdmin && (
                  <>
                     <Tooltip title={formatMessage(intl, 'user.executive.tooltip')} enterDelay={800}>
                        <CheckboxFHG
                           key={'isExecutive ' + defaultValues.id}
                           name={'isExecutive'}
                           defaultChecked={defaultValues.isExecutive}
                           checked={editValues.isExecutive}
                           onChange={handleChange}
                           labelKey={'user.isExecutive.label'}
                           marginTop={0}
                           marginLeft={0}
                           disabled={!isExecutive}
                        />
                     </Tooltip>
                  </>
               )}
               <Grid width={'100%'}>
                  <PermissionPanel
                     defaultValues={defaultValues}
                     onChange={handlePermissionChange}
                     disabled={isAdminUserEdit}
                     membershipIdList={client?.membershipIdList}
                     isNew={isNew}
                  />
               </Grid>
            </Grid>
            <Stack
               direction={'row'}
               width={'100%'}
               className={classes.buttonPanelStyle}
               alignItems={'center'}
               flex={'0 0 auto'}
            >
               <ProgressButton
                  isProgress={isSaving}
                  variant='text'
                  color='primary'
                  type={'submit'}
                  size='large'
                  labelKey='save.label'
                  disabled={isSaving}
               />
               <ButtonFHG
                  variant='text'
                  size={'large'}
                  labelKey={'cancel.button'}
                  disabled={isSaving}
                  onClick={() => handleClose()}
               />
            </Stack>
         </Form>
      </Stack>
   );
}
