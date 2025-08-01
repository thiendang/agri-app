import {atom, useRecoilState} from 'recoil';

export const errorForGamePlan = atom({
   key: 'errorForGamePlan',
   default: {
      isShow: false,
      message: 'Please select an entity',
   },
});

export const useErrorGamePlan = () => {
   const [error, setError] = useRecoilState(errorForGamePlan);
   return {error, setError};
};
