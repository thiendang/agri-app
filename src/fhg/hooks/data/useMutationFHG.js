import {useMutation} from '@apollo/client';
import uniqueId from 'lodash/uniqueId';
import {useCallback} from 'react';
import {useState, useRef} from 'react';
import {useIntl} from 'react-intl';
import {useSetRecoilState} from 'recoil';
import {errorState} from '../../../pages/Main';
import {cacheAddV2} from '../../utils/DataUtil';
import {cacheUpdateV2} from '../../utils/DataUtil';
import {cacheDeleteV2} from '../../utils/DataUtil';
import {formatMessage} from '../../utils/Utils';
import {useEffect} from 'react';
import useProgress from '../useProgress';

export const CREATE_UPDATE_ACTION = 'createUpdate';
export const DELETE_ACTION = 'delete';
// export const SORT_ACTION = 'sort';
export const UNDELETE_ACTION = 'undelete';
export const COPY_ACTION = 'copy';
export const UNDO_ACTION = 'undo';
export const REDO_ACTION = 'redo';
export const ACTIVATE_FREE_TRIAL_ACTION = 'activate free trial';
export const EXTEND_FREE_TRIAL_ACTION = 'extend free trial';

/**
 * Hook for useMutation that updates the cache for add and delete queries. Update mutations should automatically update
 * cache without this update.
 *
 * NOTE:
 * 1) Assumes that the result of the mutation only has a single property. (e.g. {data: {operators: {...}}})
 * 2) Updates ONLY the FIRST property in an updateQuery. The first property is assumed to be a list and adds the result
 *    property to the list. Other properties in the original query are copied to the updated cache item.
 *
 * Reviewed:
 *
 * @param mutation The graphql mutation.
 *    typeKey - The localization key for the type of the object
 *    actionType - The localization key for the action type (e.g. create, update, delete).
 *    resultType - The type of the return from the mutation.
 *    path - The path of the mutation (e.g. entityCashFlow for entityCashFlow: entityCashFlow_CreateUpdate)
 * @param [options] The options for the mutation.
 * @param [showLoading] Indicates if the progress should be shown.
 * @param [useOptimisticResponse] Indicates if the optimistic response should be added to the options.
 * @param [isUpdate] Indicates if the cache needs to be updated. Update handles both update and add. Should be true if
 *    updateVariables will be used and the mutation is not Delete or if the updateCache must always be called.
 * @return
 */
export default function useMutationLxFHG(
   mutation,
   options,
   showLoading,
   useOptimisticResponse = true,
   isUpdate = false,
) {
   const theUniqueId = useRef(uniqueId()).current;
   const intl = useIntl();
   const [, /*Unused*/ setProgress] = useProgress(theUniqueId);

   const setErrorState = useSetRecoilState(errorState);

   const [lastMessage, setLastMessage] = useState('');

   useEffect(() => {
      return () => {
         setProgress(false);
      };
   }, [setProgress]);

   const [mutationFunction, result] = useMutation(mutation?.mutation, options);
   const {loading, error, data} = result;

   useEffect(() => {
      if (error) {
         const type = formatMessage(intl, mutation?.typeKey);
         const action = formatMessage(intl, mutation?.actionKey || CREATE_UPDATE_ACTION);
         const errorMessage = formatMessage(intl, 'action.error', undefined, {type, action});

         if (errorMessage !== lastMessage) {
            console.log(error);
            setLastMessage(errorMessage);
            setErrorState({error, errorMessage, errorKey: undefined});
         }
      } else if (lastMessage !== undefined) {
         setLastMessage(undefined);
      }
   }, [error, setErrorState, lastMessage, intl, mutation?.actionKey, mutation?.typeKey]);

   useEffect(() => {
      if (showLoading) {
         setProgress(loading);
      }
   }, [loading, setProgress, showLoading]);

   /**
    * The mutation function similar to the function returned by useMutation.
    * @param options - The options like useMutation.
    * @param [updateVariables] - The variables to use for the update queries.
    * @param [isNew] - Indicates if the mutation is adding a new item.
    * @param [defaultValues] - The defaultValues used in the optimistic response.
    * @type {function(*, *, *, {}=): Promise<any>}
    */
   const mutationFunctionFHG = useCallback(
      (options, updateVariables = undefined, isNew = false, defaultValues = {}) => {
         if (useOptimisticResponse) {
            if (!mutation.resultType) {
               if ((mutation.resultType = mutation?.mutation?.definitions?.length > 1)) {
                  mutation.resultType = mutation?.mutation?.definitions?.[1]?.typeCondition?.name?.value;
               } else {
                  mutation.resultType = mutation?.mutation?.definitions?.[0].selectionSet.selections[0].name.value;
               }
            }

            if (!mutation.path) {
               if (mutation?.mutation?.definitions?.[0]?.selectionSet?.selections?.[0]?.alias) {
                  mutation.path = mutation?.mutation?.definitions?.[0]?.selectionSet?.selections?.[0]?.alias?.value;
               } else {
                  mutation.path = mutation?.mutation?.definitions?.[0].selectionSet.selections[0].name.value;
               }
            }

            if (!options?.refetchQueries && mutation?.refetchQueries) {
               options.refetchQueries = mutation?.refetchQueries(updateVariables);
            }

            if (!options?.update && mutation.updateQueries) {
               if (isNew) {
                  options.update = cacheAddV2(mutation, updateVariables || options.variables);
               } else if (isUpdate) {
                  options.update = cacheUpdateV2(mutation, options.variables?.id, updateVariables);
               } else if (mutation.actionKey === DELETE_ACTION) {
                  options.update = cacheDeleteV2(mutation, options.variables.id, undefined, updateVariables);
               } else {
                  console.log('CAVEAT!!! useMutationFHG does not have settings to update');
               }
            }

            if (!options?.optimisticResponse && options?.variables && mutation.path && mutation.resultType) {
               if (mutation.actionKey === DELETE_ACTION) {
                  options.optimisticResponse = {[mutation.path]: 1};
               } else if (mutation.resultType) {
                  options.optimisticResponse = {
                     __typename: 'Mutation',
                     [mutation.path]: {
                        __typename: mutation.resultType,
                        ...defaultValues,
                        ...options.variables,
                        isDeleted: false,
                     },
                  };
               }
            } else if (!!options?.optimisticResponse) {
               console.log('optimisticResponse - custom response will override', options?.optimisticResponse);
            } else if (!options?.variables) {
               console.log('optimisticResponse - variables not set', options?.variables);
            } else if (!mutation.path) {
               console.log('optimisticResponse - path not defined in mutation', mutation.path);
            } else if (!mutation.resultType) {
               console.log('optimisticResponse - resultType not defined in mutation', mutation.resultType);
            }
         }

         return mutationFunction(options);
      },
      [isUpdate, mutation, mutationFunction, useOptimisticResponse],
   );

   return [mutationFunctionFHG, result];
}
