import {useCallback, useState} from 'react';

export const useEmptyVision = () => {
   const [isEmptyVision, setIsEmptyVision] = useState(true);
   const [showWelcome, setShowWelcome] = useState(true);

   const hideWelcome = useCallback(() => setShowWelcome(false), []);
   return {isEmptyVision, setIsEmptyVision, showWelcome, setShowWelcome, hideWelcome};
};
