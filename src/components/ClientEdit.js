import {lighten} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {map} from 'lodash';
import moment from 'moment';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {DELETE_ICON} from '../Constants';
import {ADMIN_PANEL_MAX_WIDTH} from '../Constants';
import {MONTH_ONLY_FORMAT} from '../Constants';
import {MEMBERSHIP_ALL_QUERY} from '../data/QueriesGL';
import {CLIENT_DELETE} from '../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../data/QueriesGL';
import {getCityCacheQueries} from '../data/QueriesGL';
import {CITY_CREATE_UPDATE} from '../data/QueriesGL';
import {getClientCacheQueries} from '../data/QueriesGL';
import {CITY_STATE_QUERY} from '../data/QueriesGL';
import {CLIENT_CREATE_UPDATE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import AutocompleteMatchLXData from '../fhg/components/edit/AutocompleteMatchLXData';
import Form from '../fhg/components/edit/Form';
import PhoneNumberFieldFHG from '../fhg/components/edit/PhoneNumberFieldFHG';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import MonthPicker from '../fhg/components/MonthPicker';
import ProgressButton from '../fhg/components/ProgressButton';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import useEffectOnceConditional from '../fhg/hooks/useEffectOnceConditional';
import useKeyDown from '../fhg/hooks/useKeyDown';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../fhg/hooks/usePromptFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import {userRoleState} from '../pages/Main';
import Header from './Header';
import TextFieldLF from './TextFieldLF';
import {useLocation} from 'react-router-dom';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         // overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
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
         padding: theme.spacing(0, 2),
      },
      buttonPanelStyle: {
         marginLeft: theme.spacing(-1),
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2, 0),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      spacingSmall: {
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      titleStyle: {},
      frameStyle: {
         padding: theme.spacing(0, 0, 3),
         maxWidth: ADMIN_PANEL_MAX_WIDTH,
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      dividerStyle: {
         marginBottom: theme.spacing(2),
      },
      uploadStyle: {
         position: 'sticky',
         bottom: 0,
         backgroundColor: theme.palette.background.paper,
         marginTop: theme.spacing(2),
      },
      buttonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
         '&.Mui-disabled img': {
            filter: 'grayscale(1)',
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
   }),
   {name: 'EntityEditStyles'},
);

export default function ClientEdit() {
   const [{franchiseId, clientId}, setUserRole] = useRecoilState(userRoleState);
   const classes = useStyles();
   const theme = useTheme();
   const navigate = useNavigateSearch();

   const location = useLocation();
   const isNew = location?.state?.isNew;

   const editItem = {
      id: uuid(),
      name: '',
      addressLineOne: '',
      addressLineTwo: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      cityId: '',
      stateId: '',
      zipCode: '',
      franchiseId,
      startMonth: moment(`1/1/${new Date().getFullYear()}`),
      isDeleted: false,
   };

   const [optionsData] = useQueryFHG(CITY_STATE_QUERY, undefined, 'options.type');
   const [cityCreateUpdate] = useMutationFHG(CITY_CREATE_UPDATE);
   const [clientDelete] = useMutationFHG(CLIENT_DELETE);
   const [{memberships = []} = {}] = useQueryFHG(MEMBERSHIP_ALL_QUERY);

   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {variables: {clientId}, skip: isNew || !validate(clientId)},
      'client.type',
   );
   const [clientCreateUpdate] = useMutationFHG(CLIENT_CREATE_UPDATE);

   const [isSaving, setIsSaving] = useState(false);
   const [
      editValues,
      handleChange,
      {isChanged = false, setIsChanged, defaultValues, resetValues, handleInputChange, handleDateChange},
   ] = useEditData(isNew ? editItem : undefined, ['id', 'franchiseId']);
   const [isPickerOpen, setIsPickerOpen] = useState(false);

   useEffectOnceConditional(() => {
      if (clientData?.client) {
         resetValues({
            ...clientData.client,
            startMonth: moment(`${clientData.client.startMonth || 1}/1/${new Date().getFullYear()}`),
            membershipIdList: map(clientData.client.memberships, 'id'),
         });
         return true;
      }
      return false;
   }, [clientData, resetValues]);

   useEffect(() => {
      if (isNew) {
         resetValues();
      }
   }, [isNew]);

   const handleClose = useCallback(
      (clientId) => {
         navigate('..', {replace: true, state: {isNew: false}}, undefined, false);
         if (clientId) {
            setUserRole((role) => ({...role, clientId}));
         }
      },
      [navigate],
   );

   // Remove the event from being passed to handleClose.
   useKeyDown(() => handleClose());

   /**
    * Submit the client to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);
            if (editValues.city) {
               const variables = {id: uuid(), name: editValues.city};
               await cityCreateUpdate({
                  variables,
                  optimisticResponse: {
                     city: {
                        ...variables,
                        __typename: 'City',
                     },
                     __typename: 'Mutation',
                  },
                  update: cacheUpdate(getCityCacheQueries(), variables.id, 'city'),
               });
               editValues.cityId = variables.id;
            }

            const variables = {
               ...editValues,
               startMonth: moment(editValues.startMonth || defaultValues.startMonth).format(MONTH_ONLY_FORMAT),
            };
            await clientCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  client: {
                     __typename: 'Client',
                     ...defaultValues,
                     ...editValues,
                     isDeleted: false,
                  },
               },
               update: cacheUpdate(getClientCacheQueries(franchiseId), editValues.id, 'client'),
            });
            setIsChanged(false);
            handleClose(editValues.id);
         } catch (e) {
            //Intentionally left blank
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [clientCreateUpdate, handleClose, isChanged, cityCreateUpdate, defaultValues, editValues, setIsChanged]);

   /**
    * handleDelete callback when the user deletes a client.
    * @param event The click event
    * @return {Promise<void>}
    */
   const handleDelete = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      setIsSaving(true);
      (async () => {
         try {
            await clientDelete({
               variables: {id: editValues.id},
               optimisticResponse: {client_Delete: 1},
               update: cacheDelete(getClientCacheQueries(franchiseId), editValues.id),
            });
            setUserRole((role) => ({...role, clientId: null}));
            await navigate('..', {replace: true, state: {clientId: null}}, {clientId: null}, false);
         } finally {
            setIsSaving(false);
         }
      })();
   };

   usePromptFHG(isChanged);

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         <Header idTitle='client.title.label' width={'100%'} sx={{ml: 2}} showDrawerMenuButton={false}>
            <ConfirmIconButton
               className={classes.buttonStyle}
               color={theme.palette.error.dark}
               messageKey={'confirmRemoveValue.message'}
               onConfirm={handleDelete}
               values={{
                  type: 'client',
                  name: defaultValues?.name,
               }}
               size='small'
               style={{marginLeft: 'auto', marginRight: theme.spacing(4)}}
               submitStyle={classes.deleteColorStyle}
               buttonTypographyProps={{variant: 'inherit'}}
               disabled={isSaving || isNew}
            >
               <img alt='Delete' src={DELETE_ICON} />
            </ConfirmIconButton>
         </Header>

         <Grid item container resizable>
            <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
               <Grid name={'Client Edit Root'} container item fullWidth className={classes.infoRootStyle}>
                  <Grid
                     name={'Task Edit Inner'}
                     container
                     item
                     fullWidth
                     className={classes.infoInnerStyle}
                     overflow={'visible'}
                  >
                     <TextFieldLF
                        key={'name' + defaultValues.id}
                        name={'name'}
                        autoFocus
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.name}
                        value={editValues.name}
                        required
                     />
                     <TextFieldLF
                        key={'contactName' + defaultValues.id}
                        name={'contactName'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.contactName}
                        value={editValues.contactName}
                     />
                     <PhoneNumberFieldFHG
                        id={'test'}
                        key={'phone' + defaultValues.id}
                        name='phone'
                        labelKey={'client.phone.label'}
                        placeholderKey={'phone.placeholder'}
                        disabled={isSaving || defaultValues?.isDeleted}
                        onChange={handleChange}
                        defaultValue={defaultValues.phone}
                        value={editValues.phone}
                        size={'small'}
                        margin='normal'
                        fullWidth
                     />
                     <TextFieldLF
                        key={'email' + defaultValues.id}
                        name={'email'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.email}
                        value={editValues.email}
                     />
                     <TextFieldLF
                        key={'addressLineOne' + defaultValues.id}
                        name={'addressLineOne'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.addressLineOne}
                        value={editValues.addressLineOne}
                     />
                     <TextFieldLF
                        key={'addressLineTwo' + defaultValues.id}
                        name={'addressLineTwo'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.addressLineTwo}
                        value={editValues.addressLineTwo}
                     />
                     <AutocompleteMatchLXData
                        key={'cityId' + defaultValues.id}
                        name={'cityId'}
                        textFieldName={'city'}
                        matchSorterProps={{keys: ['name']}}
                        options={optionsData?.cities}
                        labelKey={'client.cityId.label'}
                        onChange={handleChange}
                        onInputChange={handleInputChange('city')}
                        disableClearable={false}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        defaultValue={defaultValues.cityId}
                        // value={editValues.cityId}
                        fullWidth
                        freeSolo
                     />
                     <Grid container direction={'row'} wrap={'nowrap'} fullWidth>
                        <Grid item xs={8} style={{marginRight: theme.spacing(1)}}>
                           <AutocompleteMatchLXData
                              key={'stateId' + defaultValues.id + ' ' + optionsData?.states?.length}
                              name={'stateId'}
                              options={optionsData?.states}
                              disableClearable={false}
                              matchSorterProps={{keys: ['name']}}
                              labelKey={'client.stateId.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.stateId}
                              value={editValues.stateId}
                           />
                        </Grid>
                        <Grid item xs={4}>
                           <TextFieldLF
                              key={'zipCode' + defaultValues.id}
                              name={'zipCode'}
                              labelTemplate={'client.{name}.label'}
                              inputProps={{
                                 'data-type': 'number',
                                 maxLength: 5,
                                 pattern: '[0-9]{5}',
                                 title: 'Five digit zip code',
                              }}
                              onChange={handleChange}
                              defaultValue={defaultValues.zipCode}
                              value={editValues.zipCode}
                              fullWidth={false}
                           />
                        </Grid>
                     </Grid>
                     <MonthPicker
                        key={'startMonth' + defaultValues.id}
                        name={'startMonth'}
                        format={MONTH_ONLY_FORMAT}
                        labelKey={'client.startMonth.label'}
                        defaultValue={defaultValues?.startMonth || moment('1', 'M')}
                        value={editValues.startMonth}
                        onChange={handleDateChange}
                        disabled={isSaving}
                        required
                     />
                     <TextFieldLF
                        key={'stripeCustomerId' + defaultValues.id}
                        name={'stripeCustomerId'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.stripeCustomerId}
                        value={editValues.stripeCustomerId}
                     />
                     <AutocompleteMatchLXData
                        key={'membershipIdList ' + defaultValues?.id + ' ' + memberships?.length}
                        name={'membershipIdList'}
                        defaultValue={defaultValues?.membershipIdList}
                        options={memberships}
                        disableClearable={false}
                        onChange={handleChange}
                        matchSorterProps={{keys: ['name']}}
                        labelKey={'membership.memberships.label'}
                        fullWidth
                        multiple
                     />
                  </Grid>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  justifyContent={'space-between'}
                  overflow={'visible'}
                  resizable={false}
                  alignItems={'center'}
               >
                  <Grid item>
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
                  </Grid>
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
