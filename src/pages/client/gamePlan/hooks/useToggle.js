import {useCallback, useState} from 'react';

export const useToggle = () => {
   const [isToggle, setIsToggle] = useState(false);

   const toggle = useCallback(() => {
      setIsToggle((preIsToggle) => !preIsToggle);
   }, []);

   const toggleOff = useCallback(() => setIsToggle(false), []);

   return {isToggle, toggle, toggleOff};
};
