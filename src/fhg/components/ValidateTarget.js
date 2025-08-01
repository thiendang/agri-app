import React from 'react';

/**
 * The component used as a placeholder for not implemented components.
 *
 * Reviewed: 6/22/20
 */
export default function ValidateTarget({name, top, value, width = 5, validationMessage, values}) {
   const setInvalid = (event) => {
      if (!value && validationMessage) {
         const useMessage = values ? validationMessage.format(values) : validationMessage;

         event.target.setCustomValidity(useMessage);
      } else {
         event.target.setCustomValidity('');
      }
   };

   const clear = (event) => {
      event.target.setCustomValidity('');
   };

   return (
      <input
         aria-invalid='false'
         id={name}
         name='confirm'
         type='text'
         required
         value={value || ''}
         tabIndex={-1}
         onInvalid={setInvalid}
         onChange={clear}
         style={{
            display: 'block',
            width,
            height: 1,
            padding: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative',
            border: 'none',
            top,
            zIndex: -1,
            outline: 'unset',
            background: 'transparent',
         }}
      />
   );
}
