import {useCallback, useState} from 'react';

export const useGoals = () => {
   const [goals, setGoals] = useState([]);

   const addGoal = useCallback(
      (goal) => {
         setGoals([...goals, goal]);
      },
      [goals]
   );

   const setCompleted = useCallback(
      (id) => () => {
         const list = [...goals];
         const index = list.findIndex((goal) => goal.id === id);
         if (index > -1) {
            list[index].completed = !list[index].completed;
         }
         setGoals(list);
      },
      [goals]
   );

   const editGoal = useCallback(
      (id) => (goal) => {
         const list = [...goals];
         const index = list.findIndex((g) => g.id === id);
         if (index > -1) {
            list[index] = {id, ...goal};
            setGoals(list);
         }
      },
      [goals]
   );

   return {goals, addGoal, setCompleted, editGoal, setGoals};
};
