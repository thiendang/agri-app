import {useRef} from 'react';
import React from 'react';

const MAX_COUNT = 8;
const MIN_COUNT = 2;
const MAX_TIME = 10000;

/**
 * Hook to call onClose when escape is pressed, and onSubmit when the enter key is pressed.
 */
function useEffect(effect, deps) {
   const testRef = useRef({count: 0, lastTime: 0}).current;

   React.useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
         let useTime = testRef.lastTime;
         testRef.lastTime = Date.now();

         if (Date.now() - useTime > MAX_TIME) {
            if (testRef.count >= MIN_COUNT) {
               console.log(`Count for UseEffect.`, testRef.count, effect);
            }
            testRef.count = 0;
         }
         testRef.count += 1;
         if (testRef.count >= MAX_COUNT) {
            console.log(Date.now() - useTime);
            debugger;
            console.log(`Exceeded count for UseEffect.`, testRef.count);
            console.log(effect);
            testRef.count = 0;
         }
      } else {
         console.log('Remove TestEffect for production systems.');
      }
      const endFunction = effect();
      return () => {
         if (testRef.count >= MIN_COUNT) {
            console.log(`FINAL Count for UseEffect.`, testRef.count, effect);
         }
         endFunction?.();
      };
      // eslint-disable-next-line
   }, deps);
}

export default useEffect;
