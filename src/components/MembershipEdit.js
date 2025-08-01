import {lighten} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {useMemo} from 'react';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {MEMBERSHIP_WIDTH} from '../Constants';
import {getMembershipQueries} from '../data/QueriesGL';
import {MEMBERSHIP_CREATE_UPDATE} from '../data/QueriesGL';
import {MEMBERSHIP_BY_ID_QUERY} from '../data/QueriesGL';
import {MEMBERSHIP_DELETE} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import ConfirmButton from '../fhg/components/ConfirmButton';
import Form from '../fhg/components/edit/Form';
import useEditData from '../fhg/components/edit/useEditData';
import Grid from '../fhg/components/Grid';
import Loading from '../fhg/components/Loading';
import ProgressButton from '../fhg/components/ProgressButton';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import useKeyDown from '../fhg/hooks/useKeyDown';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../fhg/hooks/usePromptFHG';
import {cacheDelete} from '../fhg/utils/DataUtil';
import {cacheUpdate} from '../fhg/utils/DataUtil';
import PermissionPanel from '../pages/admin/user/PermissionPanel';
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
         padding: theme.spacing(3, 0),
         maxWidth: MEMBERSHIP_WIDTH,
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

export default function MembershipEdit() {
   const classes = useStyles();
   const theme = useTheme();
   const navigate = useNavigateSearch();
   const location = useLocation();
   const membershipId = location?.state?.membershipId;
   const isNew = membershipId === 'new';

   const editItem = useMemo(() => {
      return {
         name: '',
         description: '',
         stripeProductId: '',
         isDeleted: false,
      };
   }, []);

   const [membershipDelete] = useMutationFHG(MEMBERSHIP_DELETE);

   const [data, {loading}] = useQueryFHG(
      MEMBERSHIP_BY_ID_QUERY,
      {variables: {membershipId}, skip: isNew || !validate(membershipId)},
      'membership.type',
   );
   const [membershipCreateUpdate] = useMutationFHG(MEMBERSHIP_CREATE_UPDATE);

   const [isSaving, setIsSaving] = useState(false);
   const [editValues, handleChange, {isChanged = false, setIsChanged, getValue, defaultValues, resetValues, setValue}] =
      useEditData(isNew ? editItem : undefined);

   useEffect(() => {
      if (!isNew && !membershipId) {
         navigate({pathname: '..', search: ''});
      }
   }, [isNew, membershipId, navigate]);

   useEffect(() => {
      if (data?.membership) {
         resetValues({
            ...data.membership,
         });
      } else if (isNew) {
         resetValues();
      }
   }, [data, isNew, resetValues]);

   const handleClose = useCallback(
      (newId) => {
         navigate(
            '..',
            {replace: true, state: {...location.state, isNew: false}},
            isNew || newId ? {membershipId: newId} : undefined,
            false,
         );
      },
      [isNew, location.state, navigate],
   );

   // Remove the event from being passed to handleClose.
   useKeyDown(() => handleClose());

   /**
    * Submit the membership to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);

            const variables = {id: uuid(), ...editValues};
            await membershipCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  membership: {
                     __typename: 'Membership',
                     ...defaultValues,
                     ...editValues,
                     isDeleted: false,
                  },
               },
               update: cacheUpdate(getMembershipQueries(), editValues.id, 'membership'),
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
   }, [membershipCreateUpdate, handleClose, isChanged, defaultValues, editValues, setIsChanged]);

   /**
    * handleDelete callback when the user deletes a membership.
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
         await membershipDelete({
            variables: {id: editValues.id},
            optimisticResponse: {membership_Delete: 1},
            update: cacheDelete(getMembershipQueries(), editValues.id),
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
      navigate('./', {replace: true, state: {membershipId: 'new'}});
   };

   const handlePermissionChange = (list) => {
      setValue('permissionIdList', list, true);
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
         <Loading isLoading={loading} />
         {!loading && (
            <>
               <Grid item resizable={false} className={classes.infoInnerStyle}>
                  <Header idTitle='membership.title.label' width={'100%'} spacing={2}>
                     {!isNew && (
                        <ConfirmButton
                           className={classes.buttonStyle}
                           onConfirm={handleDelete}
                           values={{
                              type: 'membership',
                              name: getValue('name'),
                           }}
                           size='small'
                           buttonLabelKey={'membership.delete.button'}
                           submitStyle={classes.deleteColorStyle}
                           startIcon={<img alt='delete icon' src={'/images/delete.png'} />}
                           disabled={isSaving || isNew}
                        />
                        // <ConfirmButton
                        //    className={classes.buttonStyle}
                        //    color={theme.palette.error.dark}
                        //    messageKey={'confirmRemoveValue.message'}
                        //    onConfirm={handleDelete}
                        //    values={{
                        //       type: 'membership',
                        //       name: defaultValues?.name,
                        //    }}
                        //    size='large'
                        //    submitStyle={classes.deleteColorStyle}
                        //    buttonTypographyProps={{variant: 'inherit'}}
                        //    disabled={isSaving || isNew}
                        // >
                        //    <img alt='Delete' src={DELETE_ICON} />
                        // </ConfirmButton>
                     )}
                  </Header>
               </Grid>
               <Grid item container resizable>
                  <Form onSubmit={handleSubmit} className={classes.formStyle}>
                     <Grid name={'Membership Edit Root'} container item fullWidth className={classes.infoRootStyle}>
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
                              labelKey={'membership.name.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.name}
                              required
                           />
                           <TextFieldLF
                              key={'description' + defaultValues.id}
                              name={'description'}
                              labelKey={'membership.description.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.description}
                              multiline
                              maxRows={4}
                              minRows={2}
                           />
                           <TextFieldLF
                              key={'stripeProductId' + defaultValues.id}
                              name={'stripeProductId'}
                              labelKey={'membership.stripeProductId.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.stripeProductId}
                           />
                           <PermissionPanel
                              key={'permissionPanel' + defaultValues.id}
                              defaultValues={defaultValues}
                              onChange={handlePermissionChange}
                              // disabled={isAdminUserEdit}
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
            </>
         )}
      </Grid>
   );
}
