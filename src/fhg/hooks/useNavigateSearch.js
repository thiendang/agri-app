import {omit} from 'lodash';
import {isObject} from 'lodash';
import {parse} from 'query-string';
import {stringify} from 'query-string';
import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {allowNavigate} from './useBlocker';

/**
 * The component is like the react-router-dom useNavigate except that it allows the search to be changed at the same
 * time as navigate to a new location. In react-router-dom useNavigate and useSearch are separate are cause two
 * separate navigations.
 *
 * Reviewed:
 */
export default function useNavigateSearch(removeEmptySearchParams = false) {
   const navigate = useNavigate();

   /**
    * Function returned by the hook.
    * @param pathname same as useNavigate
    * @param [options] same as useNavigate
    * @param [searchObject] the new search as an object.
    *    NOTE: This is ADDED to the search params and doesn't replace them.
    * @param [withPrompt=true] Indicates that navigate should continue with prompting the user about changes.
    * @param removeProperties(deprecated) List of strings of property names to be removed. Use removeEmptySearchParams =
    *   true and set params to be removed to null.
    */
   return useCallback(
      async (
         pathname,
         options = undefined,
         searchObject = {},
         withPrompt = true,
         hasSearch = true,
         removeProperties,
      ) => {
         const canNavigate = !withPrompt || allowNavigate();

         if (canNavigate) {
            let useSearchObject = {...searchObject};
            let searchParamsObject = parse(window.location.search);
            if (removeProperties) {
               searchParamsObject = omit(searchParamsObject, removeProperties);
            }
            const search =
               typeof searchObject === 'object'
                  ? stringify({...searchParamsObject, ...useSearchObject}, {skipNull: removeEmptySearchParams})
                  : searchObject;
            const usePath = hasSearch ? (isObject(pathname) ? pathname : {pathname, search}) : pathname;
            navigate(usePath, options);
         }
      },
      [removeEmptySearchParams, navigate],
   );
}
