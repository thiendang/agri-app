import {useToggle} from './useToggle';

export const useMeetingList = () => {
   const {isToggle: isShowResolved, toggle: toggleShowResolved} = useToggle();

   return {isShowResolved, toggleShowResolved};
};
