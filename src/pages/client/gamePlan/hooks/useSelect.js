import {useCallback, useState} from 'react';

export const useSelect = () => {
   const [idsSelected, setIdsSelected] = useState([]);

   const handleSelectionChange = useCallback(
      (i) => () => {
         if (idsSelected.includes(i)) {
            setIdsSelected(idsSelected.filter((id) => i !== id));
         } else {
            setIdsSelected([...idsSelected, i]);
         }
      },
      [idsSelected]
   );

   return {idsSelected, handleSelectionChange, setIdsSelected};
};
