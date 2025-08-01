import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';

useScrollTrigger.propTypes = {
   ref: PropTypes.any.isRequired, //Ref to the component to check for width changes.
   defaultWidth: PropTypes.number, // The number to initialize the width to before it can get the actual width.
   delay: PropTypes.number, // The number delay the resize checks.
};

const defaultTarget = typeof window !== 'undefined' ? window : null;
/**
 * Hook trigger when the target scrolls beyond the threshold.
 *
 * @param options the options:
 *                    target - The node to monitor for scrolling
 *                    threshold - Change the trigger value when the vertical scroll strictly crosses this threshold
 *                                (exclusive).
 *                    removeThreshold - After trigger how far can scroll decrease before considered a trigger change.
 *                                      (Used when the scrolling div shrinks). offset - The distance the scrollTop will
 *                                      be adjusted when the trigger is set. This allows for the target div to shrink
 *                                      based on the scroll change and not cause the trigger to be removed.
 *                     offset - The distance to adjust the scrollTop after the trigger. This allows the target to this this is at testsetrtsdaffd dasd
 *                              shrink and not cause an immediate removal of the trigger.
 * @return {unknown}
 */
export default function useScrollTrigger({target = defaultTarget, threshold = 30, removeThreshold = 4, offset = 20}) {
   const [isTriggered, setIsTriggered] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         setIsTriggered((isTriggered) => {
            if (!isTriggered && target?.scrollTop > threshold) {
               target.scrollTop += offset;
               return true;
            }

            if (isTriggered && target?.scrollTop < removeThreshold) {
               target.scrollTop -= offset;
               return false;
            }

            return isTriggered;
         });
      };

      handleScroll();
      target?.addEventListener('scroll', handleScroll, {
         passive: true,
      });
      return () =>
         target?.removeEventListener('scroll', handleScroll, {
            passive: true,
         });
   }, [removeThreshold, target, threshold]);

   return isTriggered;
}
