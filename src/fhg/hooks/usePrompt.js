import {useCallback} from 'react';
import useBlocker from './useBlocker';

export default function usePrompt(message, dirty = true, id) {
   useBlocker(
      dirty,
      useCallback(() => {
         if (dirty) {
            return window.confirm(message);
         }
         return true;
      }, [dirty, message]),
      id
   );
}
