import {omit} from 'lodash';
import keys from 'lodash/keys';
import {parse, stringify} from 'query-string';
import {useCallback} from 'react';
import {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {removeEmptyProperties} from '../utils/Utils';
import {allowNavigate} from './useBlocker';

/**
 * Hook to get the search params as an object. Similar to useSearchParams, but converts the search to an object.
 * @param isRemoveEmpty Indicates if null or undefined fields will be removed from the search.
 * @return {any} searchAsObject, setSearchAsObject, searchAsString, removeSearchAsObject
 */
export const useCustomSearchParams = (isRemoveEmpty = false) => {
   const navigate = useNavigate();
   const searchAsString = useMemo(() => window.location.search, [window.location.search]);

   const searchAsObject = useMemo(() => {
      return parse(window.location.search, {parseBooleans: true, parseNumbers: true});
   }, [window.location.search]);

   const setSearchAsObject = useCallback(
      (valueOrFunction, options, withPrompt = true) => {
         const canNavigate = !withPrompt || allowNavigate();
         const searchAsObject = parse(window.location.search, {parseBooleans: true, parseNumbers: true});

         if (canNavigate) {
            let result = typeof valueOrFunction === 'function' ? valueOrFunction(searchAsObject) : valueOrFunction;
            if (isRemoveEmpty) {
               result = removeEmptyProperties(result);
            }
            const search = stringify(result, {skipNull: isRemoveEmpty}) || '';
            navigate({pathname: window.location.pathname, search}, options);
            return search;
         } else {
            return '';
         }
      },
      [isRemoveEmpty, navigate],
   );

   /**
    * Remove the key list from the search arguments.
    * @param keysList The list of keys to remove
    * @param [options] the NavigateOptions for the call to setSearch.
    * @type {(function(*, *): void)|*}
    */
   const removeSearchAsObject = useCallback(
      (keysList, options) => {
         setSearchAsObject((params) => {
            const result = omit(params, keysList);
            return keys(result)?.length !== keys(params)?.length ? result : params;
         }, options);
      },
      [setSearchAsObject],
   );

   return [searchAsObject, setSearchAsObject, searchAsString, removeSearchAsObject];
};
