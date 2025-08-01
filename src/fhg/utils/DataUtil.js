import {toLower} from 'lodash';
import {has} from 'lodash';
import {isObject} from 'lodash';
import {camelCase} from 'lodash';
import {forEach} from 'lodash';
import {forOwn} from 'lodash';
import {pick} from 'lodash';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import set from 'lodash/set';
import values from 'lodash/values';
import castArray from 'lodash/castArray';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import React from 'react';
import {MAX_TOTAL} from '../../Constants';
import {MAX_AROUND} from '../../Constants';
import {resultOf} from './Utils';
import {removeOne} from './Utils';

/**
 * Update the cache for the list of queries. The query list will have the query, the variables, and the
 * queryPath(optional). If the queryPath isn't specified, the mutationPath will be used
 *
 * @param queryList the list of queries to update. (e.g. {query, variables, queryPath})
 * @param id of the item to update.
 * @param mutationPathProp Property name for the property to update coming back from the mutation.
 * @return {function: void} The function for update.
 */
export const cacheUpdate = (queryList, id, mutationPathProp) => {
   let propQueryList;
   if (isArray(queryList)) {
      propQueryList = queryList;
   } else if (typeof queryList === 'object' && queryList?.updateQueries) {
      propQueryList =
         typeof queryList.updateQueries === 'function' ? queryList.updateQueries() : queryList.updateQueries;
   }
   const useQueryList = castArray(propQueryList);

   if (id !== undefined) {
      return (proxy, {data}) => {
         for (const queryItem of useQueryList) {
            const {query, variables, queryPath = mutationPathProp, mutationPath = mutationPathProp} = queryItem;
            const resultData = get(data, mutationPath);
            try {
               const cachedData = proxy.readQuery({query, variables});
               const itemIndex = findIndex(cachedData?.[queryPath] || [], {id});
               let arr;

               if (itemIndex >= 0) {
                  arr = [...(cachedData?.[queryPath] || [])];
                  arr[itemIndex] = resultData;
               } else {
                  arr = [...(cachedData?.[queryPath] || []), resultData];
               }
               proxy.writeQuery({query, variables, data: {...cachedData, [queryPath]: arr}});
            } catch (e) {
               if (process.env.NODE_ENV !== 'production') {
                  console.log('Failed to update cache.', e);
               }
            }
         }
      };
   } else {
      return cacheAdd(useQueryList, mutationPathProp);
   }
};

/**
 * Add the new item to the cache for the list of queries. The query list will have the query, the variables, and the
 * queryPath(optional). If the queryPath isn't specified, the mutationPath will be used
 *
 * @param queryList the list of queries to add the result item. (e.g. {query, variables, queryPath})
 * @param mutationPath Property name resulting object being updated.
 * @return {function: void} The function for the update.
 */
export const cacheAdd = (queryList, mutationPath) => {
   let propQueryList;
   if (isArray(queryList)) {
      propQueryList = queryList;
   } else if (typeof queryList === 'object' && queryList?.updateQueries) {
      propQueryList =
         typeof queryList.updateQueries === 'function' ? queryList.updateQueries() : queryList.updateQueries;
   }
   const useQueryList = castArray(propQueryList);

   return (proxy, {data}) => {
      for (const queryItem of useQueryList) {
         const {query, variables, queryPath = mutationPath} = queryItem;

         const resultData = get(data, mutationPath);
         // Read the data from our cache for this query.
         const cachedData = proxy.readQuery({query, variables});
         // Write our data back to the cache with the new comment in it
         const newArray = [...(cachedData?.[queryPath] || []), resultData];
         const newData = {...(cachedData || {}), [queryPath]: newArray};
         proxy.writeQuery({query, variables, data: newData});
      }
   };
};

/**
 * Delete the item add the id from the cache for the list of queries. The query list will have the query, the
 * variables, and the queryPath(optional). If the queryPath isn't specified, the path will be used.
 *
 * @param queryList the list of queries to delete the item at id. (e.g. {query, variables, queryPath})
 * @param id The id of the item to delete in the cache.
 * @param [path] Property name resulting object being updated.
 * @return {function: void} Function for update.
 */
export const cacheDelete = (queryList, id, path) => {
   const useQueryList = castArray(queryList);

   return (proxy) => {
      for (const queryItem of useQueryList) {
         const {query, variables, queryPath = path} = queryItem;

         const cachedData = proxy.readQuery({query, variables});
         const itemIndex = findIndex(cachedData?.[queryPath], {id});
         if (itemIndex >= 0) {
            const modifiedList = removeOne([...cachedData[queryPath]], itemIndex);
            proxy.writeQuery({
               query,
               variables,
               data: {...cachedData, [queryPath]: modifiedList.length > 0 ? modifiedList : null},
            });
         } else {
            console.log('Failed to delete cached item.', query, variables);
         }
      }
   };
};

/**
 * Update the cache for the list of queries. The query list will have the query, the variables, and the
 * queryPath(optional). If the queryPath isn't specified, the mutationPath will be used
 *
 * @param {object}mutationQuery The mutation for which the cache needs to be updated.
 * @param id of the item to update or the predicate object to find the object to update.
 * @param {object}[variables] The variables for the updateQuery function. If the updateQuery is not a function the
 *   variables will be ignored.
 * @return {function: void} The function for update.
 */
export const cacheUpdateV2 = (mutationQuery, id, variables) => {
   const queryList =
      typeof mutationQuery.updateQueries === 'function'
         ? mutationQuery.updateQueries(variables)
         : mutationQuery.updateQueries;
   const useQueryList = castArray(queryList);

   if (id !== undefined) {
      return (proxy, {data}) => {
         const mutationPath = mutationQuery.path;

         for (const queryItem of useQueryList) {
            const {query, variables, path: queryPath = mutationPath} = queryItem;
            let resultData = get(data, mutationPath);

            // Did the mutation return any data?
            if (resultData) {
               // Is the data coming back from the mutation an array?
               if (isArray(resultData)) {
                  //If one element use the single element.
                  if (resultData?.length === 1) {
                     resultData = resultData[0];
                  } else {
                     console.log('resultData from the mutation is an array with more than one item.', resultData);
                  }
               }
               try {
                  const cachedData = proxy.readQuery({query, variables});
                  if (cachedData) {
                     const itemIndex = findIndex(cachedData[queryPath], isObject(id) ? id : {id});
                     let arr;

                     if (itemIndex >= 0) {
                        arr = [...cachedData[queryPath]];
                        arr[itemIndex] = resultData;
                     } else {
                        arr = [...(cachedData[queryPath] || []), resultData];
                     }
                     proxy.writeQuery({query, variables, data: {...cachedData, [queryPath]: arr}});
                  } else {
                     if (process.env.NODE_ENV !== 'production') {
                        console.log('Failed to update cache.', variables);
                     }
                  }
               } catch (e) {
                  if (process.env.NODE_ENV !== 'production') {
                     console.log('Failed to update cache.', e);
                  }
               }
            } else {
               console.log('Could not get the result from the mutation data. Check the mutation path', mutationPath);
            }
         }
      };
   } else {
      return cacheAdd(mutationQuery, variables);
   }
};

/**
 * Add the new item to the cache for the list of queries. The query list will have the query, the variables, and the
 * queryPath(optional). If the queryPath isn't specified, the mutationPath will be used
 *
 * @param mutationQuery The mutation for which the cache needs to have the new item added.
 * @param variables The variables for the update queries.
 * @param isArray Indicates if the result data to be written back is an array
 * @return {function(*): void} The function to update the cache.
 */
export const cacheAddV2 = (mutationQuery, variables, isArray = false) => {
   const queryList =
      typeof mutationQuery.updateQueries === 'function'
         ? mutationQuery.updateQueries(variables)
         : mutationQuery.updateQueries;
   const useQueryList = castArray(queryList);

   return (proxy, {data}) => {
      const mutationPath = mutationQuery.path;
      for (const queryItem of useQueryList) {
         const {query, variables} = queryItem;
         let {queryPath = mutationPath} = queryItem;
         let newArray;

         const resultData = get(data, mutationPath);
         if (resultData) {
            // Read the data from our cache for this query.
            const cachedData = proxy.readQuery({query, variables});

            if (cachedData) {
               // Use the query path from the query definition alias or the cachedData.
               if (!queryPath) {
                  queryPath =
                     query.definitions[0].selectionSet.selections[0].alias.value || Object.keys(cachedData)?.[0];
                  if (process.env.REACT_APP_POOL !== 'production') {
                     console.log('cacheAdd - queryPath not set. Using the value ', queryPath);
                  }
               }
               // Check for missing or incorrect queryPath.
               if (process.env.REACT_APP_POOL !== 'production' && !has(cachedData, queryPath)) {
                  console.log(
                     'cacheAdd - updateQuery does not have queryPath - ' + queryPath + '.',
                     query?.definitions?.[0]?.name?.value,
                  );
               }
               const listCacheData = get(cachedData, queryPath, []);
               // Write our data back to the cache with the new item in it
               if (isArray) {
                  newArray = [...listCacheData, ...resultData];
               } else {
                  newArray = [...(listCacheData || []), resultData];
               }
               const newData = queryPath.includes('.')
                  ? set(cachedData, queryPath, newArray)
                  : {...cachedData, [queryPath]: newArray};
               proxy.writeQuery({query, variables, data: {...newData}});
            } else {
               console.log('cacheAdd - Query not found', query?.definitions?.[0]?.name?.value, variables);
            }
         } else {
            console.log('Could not get the result from the mutation data. Check the mutation path', mutationPath);
         }
      }
   };
};

export const cacheDeleteV2 = (mutationQuery, id, deleteIdKey = 'id', variables) => {
   const queryList =
      typeof mutationQuery.updateQueries === 'function'
         ? mutationQuery.updateQueries(variables)
         : mutationQuery.updateQueries;
   const useQueryList = castArray(queryList);

   return (proxy) => {
      const mutationPath = mutationQuery.path;

      for (const queryItem of useQueryList) {
         const {query, variables, queryPath = mutationPath} = queryItem;

         const cachedData = proxy.readQuery({query, variables});
         if (cachedData) {
            const itemIndex = findIndex(cachedData[queryPath], {[deleteIdKey]: id});
            if (itemIndex >= 0) {
               const modifiedList = removeOne([...cachedData[queryPath]], itemIndex);
               proxy.writeQuery({
                  query,
                  variables,
                  data: {...cachedData, [queryPath]: modifiedList.length > 0 ? modifiedList : null},
               });
            }
         } else {
            console.log('cacheDelete - Query not found', query?.definitions?.[0]?.name?.value, variables);
         }
      }
   };
};

function removeTotalRowFunctionIfNoData(columns, data) {
   if (columns?.length > 0 && data?.length === 0) {
      for (const column of columns) {
         if (column.totalsRowFunction === 'sum') {
            delete column.totalsRowFunction;
         }
      }
   }
}
/**
 * A table for an Excel spreadsheet.
 *
 * @param name The name of the table.
 * @param worksheet The worksheet of the spreadsheet.
 * @param columns The columns for the table.
 * @param data The data properties must match the columns in order. For example the first column will be the first
 *        property in the object
 * @param location The location of the cell (e.g. 'A1').
 * @param showRowStripes Indicates if the stripes should be used in the table.
 * @param style
 * @param properties Optional properties of the data to be shown in the table
 * @param isAccessor Indicates if 'accessor' property is used to find data.
 * @param totalsRow Indicates if there is a totals row
 * @param hasGetAccessor Indicates if the columns use a getAccessor function to find the data.
 */
export const createTable = (
   name,
   worksheet,
   columns,
   data,
   location,
   showRowStripes = false,
   style = {},
   properties,
   isAccessor = false,
   totalsRow = true,
   hasGetAccessor = false,
) => {
   let rows;

   if (hasGetAccessor) {
      rows = map(data, (item) => {
         let modifiedItem = {};
         for (const column of columns) {
            modifiedItem[column.accessor] = get(item, column.getAccessor || column.accessor);
         }
         return values(modifiedItem);
      });
   } else {
      if (isAccessor) {
         properties = map(columns, 'accessor');
      }

      if (data.length > 0) {
         rows = properties?.length > 0 ? map(data, (item) => values(pick(item, properties))) : map(data, values);
      } else {
         rows = [];
         let rowData = [];
         for (let i = 0; i < properties.length; i++) {
            rowData.push('');
         }

         rows.push(rowData);
      }
   }

   removeTotalRowFunctionIfNoData(columns, data);

   worksheet.addTable({
      name,
      ref: location,
      headerRow: true,
      totalsRow,
      style: {
         theme: 'TableStyleLight15',
         showRowStripes: true,
         // ...style,
      },
      columns,
      rows,
   });
};

/**
 * A table for an Excel spreadsheet.
 *
 * @param worksheet The worksheet of the spreadsheet.
 * @param columns The columns for the table.
 * @param data The data properties must match the columns in order. For example the first column will be the first
 *        property in the object
 * @param location The location of the cell (e.g. 'A1').
 * @param style
 * @param properties Optional properties of the data to be shown in the table
 */
export const createTableLx = ({name, worksheet, columns, data, style, properties, ...tableProps}) => {
   let rows = map(data, (item) => {
      let modifiedItem = {};
      for (const column of columns) {
         const value = column.value ? resultOf(column.value, item) : get(item, column.getAccessor || column.accessor);
         modifiedItem[column.accessor] = value === undefined || value === null ? '' : value;
      }
      return values(modifiedItem);
   });
   const useColumns = map(columns, (column) => pick(column, ['name', 'totalsRowFunction', 'style', 'totalsRowLabel']));

   if (!rows || rows.length === 0) {
      let modifiedItem = {};
      for (const column of columns) {
         modifiedItem[column.accessor] = column.totalsRowFunction ? 0 : '';
      }
      rows = [values(modifiedItem)];
   }

   worksheet.addTable({
      ...tableProps,
      name: camelCase(name),
      style: {
         theme: 'TableStyleLight15',
         showRowStripes: true,
         // ...style,
      },
      columns: useColumns,
      rows,
   });
};

export function PMT(interestRate = 0, numberOfPeriods = 1, presentValue = 0, futureValue = 0, paymentType = 0) {
   if (!presentValue && !futureValue) {
      return undefined;
   }
   if (numberOfPeriods <= 0) {
      return undefined;
   }
   if (interestRate === 0) {
      return -(presentValue + futureValue) / numberOfPeriods;
   }

   const pvif = Math.pow(1 + interestRate, numberOfPeriods);
   let payment = (interestRate / (pvif - 1)) * -(presentValue * pvif + futureValue);

   if (paymentType === 1) {
      payment /= 1 + interestRate;
   }

   return payment;
}

export function round(x, isRounding = true) {
   return !isRounding ? x : Math.round(x * 100) / 100;
}

/**
 * Assign the fields from all items. Priority is left to right. If the field has a value it will not be overwritten.
 * @param primary The most important priority object. Set fields will not be overwritten.
 * @param items Array of items to provide values.
 */
export function assign(primary, ...items) {
   const result = {...primary};

   forEach(items, (item) => {
      forOwn(item, (value, key) => {
         if (result[key] === undefined) {
            result[key] = value;
         }
      });
   });
   return result;
}

function getTruncatedText(text, search, maxAround, maxTotal) {
   /**
    * Truncate a string to by putting an ellipsis in the middle if text is too long.
    * @param text The full text string
    * @param position The starting position to consider.
    * @param index The ending position of the string to consider.
    * @return {TaggedString | string} The truncated string.
    */
   function truncateString(text, position, index) {
      // If the string between the last found (or start) and the new found (or end) is too long...
      if (index - position > maxAround * 2) {
         // match exactly maxAround chars look for next word break, capture everything between, look for word
         // break followed by exactly maxAround chars.
         const regEx = new RegExp(`(.{${maxAround}}\\S*\\b)(.*)(\\b\\S*.{${maxAround}})`);
         let truncatedText = text.substring(position, index);
         // Replace the capture with the ellipsis
         truncatedText = truncatedText.replace(regEx, '$1 … $3');

         truncatedText += text.substring(index, index + search.length);
         return truncatedText;
      } else {
         return text.substring(position, index + search.length);
      }
   }

   if (search && (!maxTotal || text?.length > maxTotal) && maxAround) {
      let position = 0;
      let truncatedText = '';
      const searchLowercase = toLower(search);
      const textLowercase = toLower(text);

      while (position < text.length) {
         const index = textLowercase.indexOf(searchLowercase, position);
         //Was the search text found?
         if (index >= 0) {
            // Is the string between the last found(or beginning) and the search string too long?
            truncatedText += truncateString(text, position, index);
            position = index + search.length;
         } else if (position > 0) {
            truncatedText += truncateString(text, position, text.length);
            position = text.length;
         } else {
            position = text.length;
         }
      }
      if (maxTotal > 0 && truncatedText?.length > maxTotal) {
         return truncatedText.substring(0, maxTotal) + '…';
      } else {
         return truncatedText;
      }
   } else {
      return text;
   }
}

/**
 * Get the Cell HTML with markings for search, for formatted values.  For example, the value = 1,000, original = 1000 and the search text is 1000.
 *
 * @param value The formatted value
 * @param original The original value used for the search without formatting.
 * @param search The search text.
 * @return {React.JSX.Element|*} The HTML for the cell.
 */
export function getMarkedWholeCell(value, original, search) {
   if (!search || value === undefined || original === undefined) {
      return value;
   } else {
      const i = getMarkedWholeMessage(value, original, search);
      return <div className={'mark-style'} dangerouslySetInnerHTML={{__html: i}} />;
   }
}

export function getMarkedCell(row, search) {
   return !search || row?.value === undefined ? (
      row?.value
   ) : (
      // Mark the search text in the row value.
      <div className={'mark-style'} dangerouslySetInnerHTML={{__html: getMarkedMessage(row?.value, search)}} />
   );
}

export function getMarkedCell2(row, search) {
   const value = '' + row?.getValue();
   return getMarkedValue2(value, search);
}

export function getMarkedValue2(value, search) {
   return !search || value === undefined ? (
      value
   ) : (
      // Mark the search text in the row value.
      <div className={'mark-style'} dangerouslySetInnerHTML={{__html: getMarkedMessage(value, '' + search)}} />
   );
}
export function getMarkedMessage(message = '', search, maxAround = MAX_AROUND, maxTotal = MAX_TOTAL) {
   if (message?.length > 0 && search?.length > 0 && maxAround > 0 && maxTotal > 0) {
      const shortenedMessage = getTruncatedText(message, search, maxAround, maxTotal);
      if (shortenedMessage?.length > 0) {
         const regEx = new RegExp(`(${search})`, 'ig');
         return shortenedMessage.replace(regEx, `<mark>$1</mark>`);
      }
   }
   return message;
}

export function getMarkedWholeMessage(message = '', text, search) {
   if (
      message &&
      String(message).length > 0 &&
      search &&
      String(search).length > 0 &&
      text &&
      String(text).length > 0
   ) {
      const regEx = new RegExp(String(search), 'i');
      const isFound = String(text).match(regEx);

      if (isFound) {
         return `<mark>${String(message)}</mark>`;
      }
   }
   return message;
}
