import {AddCircleOutline} from '@mui/icons-material';
import {lighten} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {useMemo} from 'react';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {DELETE_ICON} from '../Constants';
import {ADMIN_PANEL_MAX_WIDTH} from '../Constants';
import {FRANCHISE_DELETE} from '../data/QueriesGL';
import {FRANCHISE_BY_ID_QUERY} from '../data/QueriesGL';
import {getCityCacheQueries} from '../data/QueriesGL';
import {CITY_CREATE_UPDATE} from '../data/QueriesGL';
import {getFranchiseCacheQueries} from '../data/QueriesGL';
import {CITY_STATE_QUERY} from '../data/QueriesGL';
import {FRANCHISE_CREATE_UPDATE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import AutocompleteMatchLXData from '../fhg/components/edit/AutocompleteMatchLXData';
import Form from '../fhg/components/edit/Form';
import PhoneNumberFieldFHG from '../fhg/components/edit/PhoneNumberFieldFHG';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import ProgressButton from '../fhg/components/ProgressButton';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useKeyDown from '../fhg/hooks/useKeyDown';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../fhg/hooks/usePromptFHG';
import ScrollStack from '../fhg/ScrollStack';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import {userRoleState} from '../pages/Main';
import Header from './Header';
import TextFieldLF from './TextFieldLF';

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
         padding: theme.spacing(0, 0, 2),
         maxWidth: ADMIN_PANEL_MAX_WIDTH + 100,
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

export default function FranchiseEdit() {
   const [{franchiseId: franchiseIdProp}] = useCustomSearchParams();
   const {franchiseId: franchiseIdState} = useRecoilValue(userRoleState);
   const franchiseId = franchiseIdProp || franchiseIdState;

   const classes = useStyles();
   const theme = useTheme();
   const navigate = useNavigateSearch();
   const location = useLocation();
   const isNew = franchiseId === 'new';

   const editItem = useMemo(() => {
      return {
         name: '',
         addressLineOne: '',
         addressLineTwo: '',
         contactName: '',
         phone: '',
         email: '',
         cityId: '',
         stateId: '',
         zipCode: '',
         isDeleted: false,
      };
   }, []);

   const [optionsData] = useQueryFHG(CITY_STATE_QUERY, undefined, 'options.type');
   const [cityCreateUpdate] = useMutationFHG(CITY_CREATE_UPDATE);
   const [franchiseDelete] = useMutationFHG(FRANCHISE_DELETE);

   const [franchiseData] = useQueryFHG(
      FRANCHISE_BY_ID_QUERY,
      {variables: {franchiseId}, skip: isNew || !validate(franchiseId)},
      'franchise.type',
   );
   const [franchiseCreateUpdate] = useMutationFHG(FRANCHISE_CREATE_UPDATE);

   const [isSaving, setIsSaving] = useState(false);
   const [editValues, handleChange, {isChanged = false, setIsChanged, defaultValues, resetValues, handleInputChange}] =
      useEditData(isNew ? editItem : undefined);
   const [isPickerOpen, setIsPickerOpen] = useState(false);

   useEffect(() => {
      if (!isNew && !franchiseId) {
         navigate({pathname: '..', search: ''});
      }
   }, [isNew, franchiseId, navigate]);

   useEffect(() => {
      if (franchiseData?.franchise) {
         resetValues({
            ...franchiseData.franchise,
         });
      } else if (isNew) {
         resetValues();
      }
   }, [franchiseData, isNew, resetValues]);

   const handleClose = useCallback(
      (newId) => {
         navigate(
            '../..',
            {replace: true, state: {...location.state, isNew: false}},
            isNew || newId ? {franchiseId: newId} : undefined,
            false,
         );
      },
      [isNew, location.state, navigate],
   );

   // Remove the event from being passed to handleClose.
   useKeyDown(() => handleClose());

   /**
    * Submit the franchise to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);
            if (editValues.city && !editValues?.cityId) {
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

            const variables = {id: uuid(), ...editValues};
            await franchiseCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  franchise: {
                     __typename: 'Franchise',
                     ...defaultValues,
                     ...editValues,
                     isDeleted: false,
                  },
               },
               update: cacheUpdate(getFranchiseCacheQueries(), editValues.id, 'franchise'),
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
   }, [franchiseCreateUpdate, handleClose, isChanged, cityCreateUpdate, defaultValues, editValues, setIsChanged]);

   /**
    * handleDelete callback when the user deletes a franchise.
    * @param event The click event
    * @return {Promise<void>}
    */
   const handleDelete = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      setIsSaving(true);
      try {
         await franchiseDelete({
            variables: {id: editValues.id},
            optimisticResponse: {franchise_Delete: 1},
            update: cacheDelete(getFranchiseCacheQueries(), editValues.id),
         });
         handleClose();
      } finally {
         setIsSaving(false);
      }
   };

   const handleNew = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate('./', {replace: true, state: {franchiseId: 'new'}});
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
         <Grid item resizable={false} className={classes.infoInnerStyle}>
            <Header idTitle='franchise.title.label' width={'100%'} spacing={2}>
               {!isNew && (
                  <>
                     <ButtonFHG
                        startIcon={<AddCircleOutline />}
                        onClick={handleNew}
                        labelKey={'franchise.new.button'}
                     />
                     <ConfirmIconButton
                        className={classes.buttonStyle}
                        color={theme.palette.error.dark}
                        messageKey={'confirmRemoveValue.message'}
                        onConfirm={handleDelete}
                        values={{
                           type: 'licensee',
                           name: defaultValues?.name,
                        }}
                        size='large'
                        submitStyle={classes.deleteColorStyle}
                        buttonTypographyProps={{variant: 'inherit'}}
                        disabled={isSaving || isNew}
                     >
                        <img alt='Delete' src={DELETE_ICON} />
                     </ConfirmIconButton>
                  </>
               )}
            </Header>
         </Grid>
         <ScrollStack>
            <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
               <Grid name={'Franchise Edit Root'} container item fullWidth className={classes.infoRootStyle}>
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
                        labelTemplate={'franchise.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.name}
                        value={editValues.name}
                        required
                     />
                     <TextFieldLF
                        key={'contactName' + defaultValues.id}
                        name={'contactName'}
                        labelTemplate={'franchise.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.contactName}
                        value={editValues.contactName}
                     />
                     <PhoneNumberFieldFHG
                        id={'test'}
                        key={'phone' + defaultValues.id}
                        name='phone'
                        labelKey={'franchise.phone.label'}
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
                        labelTemplate={'franchise.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.addressLineOne}
                        value={editValues.addressLineOne}
                     />
                     <TextFieldLF
                        key={'addressLineTwo' + defaultValues.id}
                        name={'addressLineTwo'}
                        labelTemplate={'franchise.{name}.label'}
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
                        labelKey={'franchise.cityId.label'}
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
                              labelKey={'franchise.stateId.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.stateId}
                              value={editValues.stateId}
                           />
                        </Grid>
                        <Grid item xs={4}>
                           <TextFieldLF
                              key={'zipCode' + defaultValues.id}
                              name={'zipCode'}
                              labelTemplate={'franchise.{name}.label'}
                              inputProps={{
                                 // 'data-type': 'number',
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
         </ScrollStack>
      </Grid>
   );
}
