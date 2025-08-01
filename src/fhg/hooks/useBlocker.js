import {every} from 'lodash';
import {mapValues} from 'lodash';
import {keys} from 'lodash';
import {has} from 'lodash';
import {useEffect} from 'react';

const listeners = {};

export const allowNavigate = () => {
   if (keys(listeners)?.length > 0) {
      const values = mapValues(listeners, (fn) => fn() === true);
      return every(values, Boolean);
   }

   return true;
};

const beforeUnload = (e) => {
   // Cancel the event.
   e.preventDefault();
   // Chrome (and legacy IE) requires returnValue to be set.
   e.returnValue = '';
};

function blockNavigation(id, fn) {
   if (listeners.length === 0) {
      window.addEventListener('beforeunload', beforeUnload, {capture: true});
   }
   listeners[id] = fn;

   return () => {
      if (has(listeners, id)) {
         delete listeners[id];
      }
      if (keys(listeners)?.length === 0) {
         window.removeEventListener('beforeunload', beforeUnload, {capture: true});
      }
   };
}

export default function useBlocker(dirty, blocker, id) {
   useEffect(() => {
      if (!dirty) return;
      return blockNavigation(id, blocker);
   }, [blocker, dirty, id]);
}
