import {useRef} from 'react';
import React from 'react';

/**
 * Exactly the same as React.useEffect except the effect function will only be called once. The effect returns true if
 * the condition was met and false otherwise. If the effect doesn't return a value, the effect will only be called once.
 */
export default function useEffectOnceConditional(effect, deps) {
   const testRef = useRef(false);

   React.useEffect(() => {
      if (!testRef.current) {
         const result = effect();
         if (result instanceof Promise) {
            result.then((resultPromise) => {
               testRef.current = testRef.current || resultPromise;
            });
         } else {
            testRef.current = result === undefined ? true : result;
         }
      }
      // eslint-disable-next-line
   }, deps);
}
