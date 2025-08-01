import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import {InputAdornment} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {useTheme} from '@mui/styles';
import {useRef} from 'react';
import React, {useState, Fragment, useEffect} from 'react';
import useMessage from '../fhg/hooks/useMessage';
import {editChange} from '../fhg/utils/Utils';
import TextFieldFHG from './TextFieldLF';

/**
 * The TextField with preset formats.
 */
export default function PasswordTextFieldLF({password, confirm, margin, onChange, isNew, disabled, ...props}) {
   const theme = useTheme();
   const [showPassword, setShowPassword] = useState(false);
   // const [editValues, setEditValues] = useState({});
   const confirmLabel = useMessage('user.confirm.label');
   const changePasswordLabel = useMessage('user.changePassword.label');
   const editValuesRef = useRef({});
   const [helperText, setHelperText] = useState();

   useEffect(() => {
      const target = document.getElementById('confirm_password');
      const targetPassword = document.getElementById('password');

      const match =
         !editValuesRef.current?.password ||
         // prettier-ignore
         editValuesRef.current?.password?.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\(\)@$!%*?&])[A-Za-z\d\(\)@$!%*?&-]{8,}$/);
      const helperText = !match
         ? 'Password must contain at least 8 characters with one or more uppercase, lowercase, number and symbol.'
         : '';
      setHelperText(helperText);
      if (targetPassword) {
         targetPassword.setCustomValidity(helperText);
      }
      if (target) {
         target.setCustomValidity(
            editValuesRef.current.confirm !== editValuesRef.current.password
               ? 'Confirm does not match the password.'
               : '',
         );
      }
   }, [editValuesRef.current.confirm, editValuesRef.current.password, password, confirm]);

   const handleShowPasswordClick = () => {
      setShowPassword(!showPassword);
   };

   const handleChange = (event) => {
      editValuesRef.current = {...editValuesRef.current, ...editChange(event)};
      onChange?.(event);
   };

   return (
      <Fragment>
         <FormControlLabel
            label={changePasswordLabel}
            sx={{
               width: '100%',
               '&.MuiFormControlLabel-root': {marginLeft: 0, marginRight: '-2px'},
               '& .MuiFormControlLabel-label': {width: '100%'},
               '& .MuiFormControl-root.MuiTextField-root': {paddingLeft: 0, marginTop: theme.spacing(1)},
            }}
            labelPlacement='top'
            control={
               <TextFieldFHG
                  name='password'
                  inputProps={{
                     pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\(\\)@$!%*?&])[A-Za-z\\d\\(\\)@$!%*?&-]{8,}$',
                     title: 'Password must contain at least 8 characters with one or more uppercase, lowercase, number and symbol.',
                  }}
                  // labelKey={isNew ? 'user.password.label' : 'user.changePassword.label'}
                  fullWidth
                  required={isNew}
                  disabled={disabled}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  onChange={handleChange}
                  defaultValue={password}
                  margin={margin}
                  helperText={helperText}
                  // eslint-disable-next-line
                  InputProps={{
                     'aria-label': 'Password',
                     id: 'password',
                     endAdornment: (
                        <InputAdornment position='end'>
                           <IconButton
                              aria-label='Toggle password visibility'
                              onMouseDown={handleShowPasswordClick}
                              disabled={disabled}
                              size='large'
                           >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                           </IconButton>
                        </InputAdornment>
                     ),
                  }}
                  {...props}
               />
            }
         ></FormControlLabel>
         {!showPassword && (
            <FormControlLabel
               label={confirmLabel}
               sx={{
                  width: '100%',
                  '&.MuiFormControlLabel-root': {marginRight: 0, marginLeft: 0},
                  '& .MuiFormControlLabel-label': {width: '100%'},
                  '& .MuiFormControl-root.MuiTextField-root': {marginTop: theme.spacing(1)},
               }}
               labelPlacement='top'
               control={
                  <TextFieldFHG
                     name='confirm'
                     type={'password'}
                     required={isNew}
                     onChange={handleChange}
                     defaultValue={confirm}
                     autoComplete='current-password'
                     fullWidth
                     disabled={disabled}
                     InputProps={{id: 'confirm_password', name: 'confirm'}}
                     {...props}
                  />
               }
            />
         )}
      </Fragment>
   );
}
