import IconButton from '@mui/material/IconButton';
import {InputAdornment} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {useRef} from 'react';
import React, {useState, Fragment, useEffect} from 'react';
import TextFieldLF from '../../../components/TextFieldLF';
import {editChange} from '../../utils/Utils';

/**
 * The TextField with preset formats.
 */
export default function PasswordTextField({
   password,
   confirm,
   margin,
   onChange,
   isNew,
   disabled,
   placeholderKey,
   confirmPlaceholderKey,
   confirmCurrentPassword = false,
   ...props
}) {
   const [showPassword, setShowPassword] = useState(false);
   // const [editValues, setEditValues] = useState({});
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
         {confirmCurrentPassword && (
            <TextFieldLF
               id={'currentPassword'}
               name={'currentPassword'}
               placeholderKey={'client.currentPassword.placeholder'}
               labelTemplate={'client.{name}.label'}
               type={'password'}
               autoComplete='current-password'
               onChange={handleChange}
            />
         )}
         <TextFieldLF
            name='password'
            inputProps={{
               pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\(\\)@$!%*?&])[A-Za-z\\d\\(\\)@$!%*?&-]{8,}$',
               title: 'Password must contain at least 8 characters with one or more uppercase, lowercase, number and symbol.',
            }}
            labelKey={isNew ? 'user.password.label' : 'user.newPassword.label'}
            fullWidth
            required={isNew}
            disabled={disabled || (confirmCurrentPassword && !editValuesRef.current.currentPassword)}
            type={showPassword ? 'text' : 'password'}
            autoComplete='new-password'
            onChange={handleChange}
            defaultValue={password}
            margin={margin}
            helperText={helperText}
            placeholderKey={placeholderKey}
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
         {!showPassword && (
            <TextFieldLF
               name='confirm'
               labelKey={'user.confirm.label'}
               type={'password'}
               required={isNew}
               onChange={handleChange}
               defaultValue={confirm}
               autoComplete='current-password'
               fullWidth
               disabled={disabled || (confirmCurrentPassword && !editValuesRef.current.currentPassword)}
               placeholderKey={confirmPlaceholderKey}
               InputProps={{id: 'confirm_password', name: 'confirm'}}
               {...props}
            />
         )}
      </Fragment>
   );
}
