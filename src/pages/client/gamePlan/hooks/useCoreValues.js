import {useCallback, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {formatMessage} from '../../../../fhg/utils/Utils';

export const useCoreValues = () => {
   const [list, setList] = useState([]);

   const addNewItem = useCallback((item) => {
      setList((prev) => [...prev, item]);
   }, []);

   const intl = useIntl();

   useEffect(() => {
      if (list?.length === 0) {
         setList([
            {
               id: null,
               name: formatMessage(intl, 'gamePlan.coreValue.title.addA'),
               description: formatMessage(intl, 'gamePlan.coreValue.title.addDescription'),
            },
         ]);
      }
   }, [intl, list]);

   const removeItem = useCallback(
      (id) => () => {
         setList((prev) => prev.filter((e) => e.id !== id));
      },
      []
   );

   const updateItem = useCallback(
      (id) => (data) => {
         const listCopy = [...list];
         const index = listCopy.findIndex((e) => e.id === id);
         listCopy[index] = {...listCopy[index], ...data};
         setList(listCopy);
      },
      [list]
   );

   return {list, setList, addNewItem, removeItem, updateItem};
};
