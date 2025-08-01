import {SaveOutlined} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import {useCallback} from 'react';
import {useState} from 'react';
import React from 'react';
import {useIntl} from 'react-intl';
import {useNavigate} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import Header from '../../../components/Header';
import TextFieldLF from '../../../components/TextFieldLF';
import {USER_CREATE_UPDATE} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import Form from '../../../fhg/components/edit/Form';
import PhoneNumberFieldFHG from '../../../fhg/components/edit/PhoneNumberFieldFHG';
import useEditData from '../../../fhg/components/edit/useEditData';
import ProgressButton from '../../../fhg/components/ProgressButton';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import PasswordTextField from '../../../fhg/components/security/PasswordTextField';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import ScrollStack from '../../../fhg/ScrollStack';
import {formatMessage} from '../../../fhg/utils/Utils';
import {errorState} from '../../Main';
import {Settings2FA} from './Settings2FA';
import {Auth} from 'aws-amplify';

AccountEdit.propTypes = {};

export default function AccountEdit({props}) {
   const intl = useIntl();
   const navigate = useNavigate();
   const [updateUser] = useMutationLxFHG(USER_CREATE_UPDATE, undefined, undefined, undefined, true);
   const user = useRecoilValue(userStatus);
   const setErrorState = useSetRecoilState(errorState);

   const [isSaving, setIsSaving] = useState(false);
   const [editValues, handleChange, {isChanged = false, setIsChanged, currentValues, defaultValues}] = useEditData(
      user,
      ['id', 'franchiseId'],
   );

   const loading = false;

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

   const handleClose = useCallback(() => {
      navigate('..');
   }, [navigate]);

   /**
    * Submit the user to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);

            if (editValues.password && editValues.currentPassword) {
               const user = await Auth.currentAuthenticatedUser();
               await Auth.changePassword(user, editValues.currentPassword, editValues.password);
               delete editValues.currentPassword;
               delete editValues.password;
            }
            const variables = {...editValues};
            await updateUser({variables}, {cognitoSub: user?.cognitoSub});
            setIsChanged(false);
            handleClose();
         } catch (error) {
            console.log(error);
            setErrorState({
               error,
               errorKey: 'save.error',
               values: {message: error.message},
            });
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [isChanged, editValues, updateUser, setIsChanged, handleClose, setErrorState, currentValues]);

   return (
      <Stack flex={1} flexDirection='column' height={'100%'} width={'100%'} overflow={'hidden'}>
         <Header title={'Account'} sx={{flex: '0 0'}} showDrawerMenuButton={false} />
         <Form
            onSubmit={handleSubmit}
            style={{display: 'flex', flex: '1 1', flexDirection: 'column', overflow: 'hidden'}}
         >
            <ScrollStack width={'100%'} height={'100%'} maxWidth={800} innerStackProps={{pr: 1.5}}>
               <Card sx={{mb: 4, flex: 'none'}}>
                  <CardContent>
                     <TypographyFHG variant={'h6'} sx={{ml: '2px', fontWeight: 'bold'}} id={'settings.login.title'} />
                     <TextFieldLF
                        key={'email' + defaultValues.id}
                        name={'email'}
                        labelTemplate={'client.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.email}
                        value={editValues.email}
                        helperText={formatMessage(intl, 'settings.email.help')}
                     />
                     <PhoneNumberFieldFHG
                        key={'phonePrimary' + defaultValues.id}
                        name='phonePrimary'
                        labelKey={'client.phone.label'}
                        placeholderKey={'phone.placeholder'}
                        disabled={isSaving || defaultValues?.isDeleted}
                        onChange={handleChange}
                        defaultValue={defaultValues.phonePrimary}
                        size={'small'}
                        margin='normal'
                        fullWidth
                     />
                  </CardContent>
               </Card>
               <Card sx={{mb: 4, flex: 'none'}}>
                  <CardContent>
                     <Settings2FA />
                  </CardContent>
               </Card>
               <Card sx={{flex: 'none'}}>
                  <CardContent>
                     <TypographyFHG
                        variant={'h6'}
                        sx={{ml: '2px', fontWeight: 'bold'}}
                        id={'user.changePassword.label'}
                     />
                     <TypographyFHG
                        variant={'subtitle1'}
                        id={'user.changePassword.message'}
                        sx={{color: 'text.grey'}}
                     />
                     <PasswordTextField
                        key={'password' + defaultValues.id}
                        name='password'
                        fullWidth
                        isNew={false}
                        // disabled={loading}
                        onChange={handleChangeCallback}
                        password={editValues.password}
                        confirm={editValues.confirm}
                        current={editValues.current}
                        placeholderKey={'user.changePassword.placeholder'}
                        confirmPlaceholderKey={'user.confirm.label'}
                        confirmCurrentPassword
                     />
                  </CardContent>
               </Card>
            </ScrollStack>
            <Stack flexDirection={'row'} sx={{mt: 4}}>
               <ProgressButton
                  labelKey={'setting.save.label'}
                  variant='contained'
                  type={'submit'}
                  disabled={loading}
                  isProgress={loading}
                  startIcon={<SaveOutlined />}
                  sx={{mr: 3}}
               />
               <ButtonFHG variant='outlined' labelKey='cancel.button' onClick={handleClose} disabled={isSaving} />
            </Stack>
         </Form>
      </Stack>
   );
}
