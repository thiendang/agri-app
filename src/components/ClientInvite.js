import {Stack} from '@mui/material';
import {lighten} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, {useState, useCallback} from 'react';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import {DELETE_ICON} from '../Constants';
import {ADMIN_PANEL_MAX_WIDTH} from '../Constants';
import {INVITE_CREATE_UPDATE} from '../data/QueriesGL';
import {INVITE_ALL_WHERE_QUERY} from '../data/QueriesGL';
import {INVITE_DELETE} from '../data/QueriesGL';
import ConfirmIconButton from '../fhg/components/ConfirmIconButton';
import ModalDialog from '../fhg/components/dialog/ModalDialog';
import useEditData from '../fhg/components/edit/useEditData';
import TypographyFHG from '../fhg/components/Typography';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useEffectOnceConditional from '../fhg/hooks/useEffectOnceConditional';
import useKeyDown from '../fhg/hooks/useKeyDown';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../fhg/hooks/usePromptFHG';
import {userRoleState} from '../pages/Main';
import TextFieldLF from './TextFieldLF';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
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
   {name: 'ClientInviteStyles'},
);

export default function ClientInvite({isFranchise = false}) {
   const [{invitationId, franchiseId: franchiseIdProps, clientId}] = useCustomSearchParams();
   const [{franchiseId: franchiseIdState}, setUserRole] = useRecoilState(userRoleState);
   const franchiseId = franchiseIdProps || franchiseIdState;
   const classes = useStyles();
   const theme = useTheme();
   const navigate = useNavigateSearch();
   const isNew = !invitationId;

   const editItem = {
      id: uuid(),
      toEmail: '',
      franchiseId,
      clientId: isFranchise ? null : clientId,
      isDeleted: false,
   };

   const [inviteDelete] = useMutationFHG(INVITE_DELETE);

   const [inviteData, {loading}] = useQueryFHG(
      INVITE_ALL_WHERE_QUERY,
      {
         variables: {id: invitationId},
         skip: isNew || !validate(invitationId),
      },
      'invite.type',
   );
   const [inviteCreateUpdate] = useMutationFHG(INVITE_CREATE_UPDATE, undefined, undefined, undefined, true);

   const [isSaving, setIsSaving] = useState(false);
   const [editValues, handleChange, {currentValues, isChanged = false, setIsChanged, defaultValues, resetValues}] =
      useEditData(editItem, ['id', 'franchiseId', 'clientId']);

   useEffectOnceConditional(() => {
      if (inviteData?.invitations?.length > 0) {
         resetValues({...inviteData.invitations[0]});
         return true;
      }
      return false;
   }, [inviteData, resetValues]);

   // useEffect(() => {
   //    if (isNew) {
   //       resetValues();
   //    }
   // }, [isNew, resetValues]);

   const handleClose = useCallback(() => {
      navigate('..', {replace: true, state: {isNew: false}}, undefined, false);
   }, [franchiseId, isFranchise, navigate]);

   // Remove the event from being passed to handleClose.
   useKeyDown(() => handleClose());

   /**
    * Submit the client to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      try {
         setIsSaving(true);

         const variables = {...currentValues};
         if (!isNew) {
            variables.inviteSent = false;
         }
         await inviteCreateUpdate(
            {
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  client: {
                     __typename: 'Invite',
                     ...currentValues,
                     isDeleted: false,
                  },
               },
            },
            {clientId, franchiseId},
         );
         setIsChanged(false);
         handleClose();
      } catch (e) {
         //Intentionally left blank
      } finally {
         setIsSaving(false);
      }
   }, [currentValues, isNew, inviteCreateUpdate, setIsChanged, handleClose, editValues.id]);

   /**
    * handleDelete callback when the user deletes a client.
    * @param event The click event
    * @return {Promise<void>}
    */
   const handleDelete = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      setIsSaving(true);
      (async () => {
         try {
            await inviteDelete(
               {variables: {id: currentValues.id}, optimisticResponse: {invite_Delete: 1}},
               {clientId, franchiseId},
            );
            setUserRole((role) => ({...role, clientId: null}));
            await navigate('..', {replace: true, state: {clientId}}, {clientId}, false);
         } finally {
            setIsSaving(false);
         }
      })();
   };

   usePromptFHG(isChanged);
   if (isNew || !loading) {
      return (
         <ModalDialog
            open
            titleKey={'client.invitTitle.label'}
            onClose={handleClose}
            cancelKey={inviteData?.invitations?.[0]?.inviteUsed ? 'close.button' : 'cancel.button'}
            onSubmit={inviteData?.invitations?.[0]?.inviteUsed ? undefined : handleSubmit}
            submitKey={
               inviteData?.invitations?.[0]?.inviteUsed
                  ? 'cancel'
                  : inviteData?.invitations?.[0]?.inviteSent
                    ? 'resend.button'
                    : 'send.button'
            }
            maxWidth={'sm'}
            fullWidth={true}
            titleVariant={'h4'}
            header={
               <Stack
                  ml={2}
                  p={1}
                  // borderRadius={BORDER_RADIUS_10}
                  bgcolor={
                     isNew
                        ? 'warning'
                        : inviteData?.invitations?.[0]?.inviteSent
                          ? inviteData?.invitations?.[0]?.inviteUsed
                             ? 'background.selectedCell'
                             : 'background.expandCell'
                          : 'background.paper'
                  }
                  width={'fit-content'}
                  height={30}
                  alignItems={'center'}
                  justifyContent={'center'}
               >
                  <TypographyFHG sx={{whiteSpace: 'nowrap'}}>
                     {isNew
                        ? 'New'
                        : inviteData?.invitations?.[0]?.inviteSent
                          ? inviteData?.invitations?.[0]?.inviteUsed
                             ? 'Used'
                             : 'Sent'
                          : 'Not Sent'}
                  </TypographyFHG>
               </Stack>
            }
            isForm
         >
            <Stack
               width={'100%'}
               height={'100%'}
               direction={'row'}
               overflow={'hidden'}
               wrap={'nowrap'}
               alignItems={'baseline'}
            >
               <TextFieldLF
                  key={'toEmail' + defaultValues.id}
                  name={'toEmail'}
                  autoFocus
                  labelTemplate={'client.{name}.label'}
                  onChange={handleChange}
                  defaultValue={defaultValues.toEmail}
                  value={editValues.toEmail}
                  required
                  disabled={inviteData?.invitations?.[0]?.inviteSent}
               />
               <ConfirmIconButton
                  className={classes.buttonStyle}
                  color={theme.palette.error.dark}
                  messageKey={'confirmRemoveValue.message'}
                  onConfirm={handleDelete}
                  values={{
                     type: 'invitation',
                     name: defaultValues?.toEmail,
                  }}
                  size='small'
                  style={{marginLeft: 'auto', marginRight: theme.spacing(4)}}
                  submitStyle={classes.deleteColorStyle}
                  buttonTypographyProps={{variant: 'inherit'}}
                  disabled={isSaving || isNew}
               >
                  <img alt='Delete' src={DELETE_ICON} />
               </ConfirmIconButton>
            </Stack>
         </ModalDialog>
      );
   }
   return null;
}
