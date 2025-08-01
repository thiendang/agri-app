import {useToggle} from './useToggle';

export const useTeamTodos = () => {
   const {isToggle: isShowArchived, toggle: toggleShowArchived} = useToggle();
   return {isShowArchived, toggleShowArchived};
};
