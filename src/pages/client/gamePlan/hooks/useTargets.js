import {useCallback, useState} from 'react';

export const useTargets = () => {
   const [targetsShortTerm, setTargetsShortTerm] = useState([]);

   const [targetsLongTerm, setTargetsLongTerm] = useState([]);

   const removeShortItems = useCallback(
      (id) => () => {
         setTargetsShortTerm(targetsShortTerm.filter((target) => target.id !== id));
      },
      [targetsShortTerm]
   );

   const removeLongItems = useCallback(
      (id) => () => {
         setTargetsLongTerm(targetsLongTerm.filter((target) => target.id !== id));
      },
      [targetsLongTerm]
   );

   const changeTargetArchive = useCallback(
      (id, isLong) => (idTarget) => {
         const list = isLong ? [...targetsLongTerm] : [...targetsShortTerm];
         const parent = list.find((target) => target.id === idTarget);
         const targetIndex = parent?.data?.findIndex((target) => target.id === id);
         if (targetIndex > -1) {
            parent.data[targetIndex].archive = !parent.data[targetIndex].archive;
         }
         if (isLong) setTargetsLongTerm(list);
         else setTargetsShortTerm(list);
      },
      [targetsLongTerm, targetsShortTerm]
   );

   const removeTargetChild = useCallback(
      (id, isLong) => (idTarget) => {
         const list = isLong ? [...targetsLongTerm] : [...targetsShortTerm];
         const index = list.findIndex((target) => target.id === id);
         list[index].data = list[index].data.filter((item) => item.id !== idTarget);
         if (isLong) setTargetsLongTerm(list);
         else setTargetsShortTerm(list);
      },
      [targetsLongTerm, targetsShortTerm]
   );

   const addTarget = useCallback(
      (id, isLong) => (data) => {
         const list = isLong ? [...targetsLongTerm] : [...targetsShortTerm];
         const index = list.findIndex((target) => target.id === id);
         list[index].data.push(data);
         if (isLong) setTargetsLongTerm(list);
         else setTargetsShortTerm(list);
      },
      [targetsLongTerm, targetsShortTerm]
   );

   const updateTarget = useCallback(
      (id, isLong) => (idTarget) => (data) => {
         const list = isLong ? [...targetsLongTerm] : [...targetsShortTerm];
         const index = list.findIndex((target) => target.id === id);
         const indexChild = list[index].data.findIndex((item) => item.id === idTarget);
         list[index].data[indexChild] = {...list[index].data[indexChild], ...data};
         if (isLong) setTargetsLongTerm(list);
         else setTargetsShortTerm(list);
      },
      [targetsLongTerm, targetsShortTerm]
   );

   return {
      targetsShortTerm,
      targetsLongTerm,
      removeShortItems,
      removeLongItems,
      changeTargetArchive,
      addTarget,
      removeTargetChild,
      updateTarget,
      setTargetsShortTerm,
      setTargetsLongTerm,
   };
};
