import {Collapse} from '@mui/material';
import {Stack} from '@mui/material';
import {Alert, Switch, TextField} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, {useCallback, useEffect, useState} from 'react';
import TypographyFHG from '../../../fhg/components/Typography';
import {Auth} from 'aws-amplify';
import QRCode from 'qrcode';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../fhg/utils/Utils';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import {NOMFA, SOFTWARE_TOKEN_MFA} from '../../../Constants';

const issuer = 'AWSCognito';

export const Settings2FA = () => {
   const intl = useIntl();
   const [isVerifyingToken, setIsVerifyingToken] = useState(false);
   const [qrCode, setQrCode] = useState('');
   const [token, setToken] = useState('');
   const [errorMessage, setErrorMessage] = useState('');

   const [authState, setAuthState] = useState(null);

   const [enable, setEnable] = useState(false);
   const [open, setOpen] = useState(false);

   const getTotpCode = (issuer, username, secret) =>
      encodeURI(`otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`);

   useEffect(() => {
      setEnable(authState?.preferredMFA === SOFTWARE_TOKEN_MFA);
   }, [authState?.preferredMFA]);

   const getAuth = useCallback(async () => {
      try {
         setAuthState(await Auth.currentAuthenticatedUser());
      } catch (error) {
         setAuthState(null);
      }
   }, []);

   useEffect(() => {
      getAuth();
   }, [getAuth]);

   const totpUsername = authState?.getUsername() || '';

   const generateQRCode = useCallback(
      async (currentUser) => {
         try {
            const newSecretKey = await Auth.setupTOTP(currentUser);
            const totpCode = getTotpCode(issuer, totpUsername, newSecretKey);
            const qrCodeImageSource = await QRCode.toDataURL(totpCode);
            setQrCode(qrCodeImageSource);
         } catch (error) {
            console.error(error);
         }
      },
      [totpUsername],
   );

   const verifyTotpToken = async () => {
      // After verifying, user will have TOTP account in his TOTP-generating app (like Google Authenticator)
      // Use the generated one-time password to verify the setup
      setErrorMessage('');
      setIsVerifyingToken(true);
      Auth.verifyTotpToken(authState, token)
         .then(async () => {
            await Auth.setPreferredMFA(authState, 'TOTP');
            await getAuth();
            setOpen(false);
         })
         .catch((e) => {
            if (/Code mismatch/.test(e.toString())) {
               const errorMessage = formatMessage(intl, 'totp.mismatch', undefined, undefined);
               setErrorMessage(errorMessage);
            } else {
               setErrorMessage(e.message);
            }
         })
         .finally(() => setIsVerifyingToken(false));
   };

   useEffect(() => {
      if (!authState) {
         return;
      }
      generateQRCode(authState);
   }, [generateQRCode, authState]);

   const isValidToken = () => {
      return /^\d{6}$/gm.test(token);
   };

   return (
      <Stack flexDirection={'column'}>
         <TypographyFHG
            id='twoAuth.title'
            className='title-page'
            variant='h6'
            color='text.primary'
            component={'span'}
            style={{
               ml: '2px',
               fontWeight: 'bold',
            }}
         />
         <Stack flexDirection={'row'}>
            <FormControlLabel
               value='end'
               sx={{ml: -1}}
               control={
                  <Switch
                     checked={enable}
                     onChange={async (event) => {
                        setEnable(event.target.checked);
                        if (event.target.checked) {
                           setOpen(true);
                        } else {
                           setOpen(false);
                           setEnable(false);
                           await Auth.setPreferredMFA(authState, NOMFA);
                           await getAuth();
                        }
                     }}
                  />
               }
               label={formatMessage(intl, 'twoAuth.label')}
               labelPlacement='end'
            />
            <TypographyFHG
               variant={'subtitle1'}
               id={'twoAuth.message'}
               sx={{alignSelf: 'center', color: 'text.grey'}}
            />
         </Stack>
         <Collapse in={open} mountOnEnter>
            <Stack flexDirection={'column'} maxWidth={228} gap={2} mt={2}>
               <img data-amplify-qrcode src={qrCode} alt='qr code' width='228' height='228' />
               <TextField
                  variant='outlined'
                  onChange={(e) => {
                     setToken(e.target.value);
                  }}
                  placeholder='Enter the 6-digit code'
                  sx={{mb: 2}}
               />
               {errorMessage && (
                  <Alert
                     variant='filled'
                     severity='error'
                     onClose={() => {
                        setErrorMessage('');
                     }}
                     sx={{mb: 2}}
                  >
                     {errorMessage}
                  </Alert>
               )}
               <ButtonFHG
                  type='submit'
                  color='primary'
                  variant='contained'
                  size={'large'}
                  labelKey={isVerifyingToken ? 'totp.verifying' : 'totp.verify'}
                  disabled={!isValidToken() || isVerifyingToken}
                  onClick={verifyTotpToken}
               />
            </Stack>
         </Collapse>
      </Stack>
   );
};
