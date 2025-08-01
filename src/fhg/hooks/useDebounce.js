import debounce from 'lodash/debounce';
import {useRef, useEffect} from 'react';

const EMPTY_ARRAY = [];

/**
 * Debounce the callback. The debounced function comes with a cancel method to cancel delayed invocations and a flush
 * method to immediately invoke them.
 *
 * @param callback The function to debounce
 * @param debounceWait Milliseconds to delay
 * @param dependencies dependency list to use to update the callback function.
 * @param options The options object.
 *      Config options:
 *          leading – Specify invoking on the leading edge of the timeout.
 *          maxWait – The maximum time func is allowed to be delayed before it’s invoked.
 *          trailing – Specify invoking on the trailing edge of the timeout (default true).
 * @return {undefined} The debounced function.
 */
export default function useDebounce(callback, debounceWait = 750, dependencies = EMPTY_ARRAY, options) {
   const ref = useRef();

   useEffect(() => {
      ref.current = debounce(callback, debounceWait, options);
   }, [callback, debounceWait, dependencies, options]);

   return ref.current;
}
