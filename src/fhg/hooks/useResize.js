import {delay as delayed} from 'lodash';

import debounce from 'lodash/debounce';
import {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {useRecoilValue} from 'recoil';
import {drawerIsOpenStatus} from '../components/ResponsiveMobileDrawer';

useResize.propTypes = {
   ref: PropTypes.any.isRequired, //Ref to the component to check for width changes.
   defaultWidth: PropTypes.number, // The number to initialize the width to before it can get the actual width.
   delay: PropTypes.number, // The number delay the resize checks.
};

/**
 * Hook to get the clientWidth on resize of the window.
 *
 * @param ref The dom element on which to base the size.
 * @param isWidthChanged Indicates if the width should trigger onChange events.
 * @param isHeightChanged Indicates if the height should trigger onChange events.
 * @param defaultWidth The starting width before a resize event occurs.
 * @param defaultHeight The starting height before a resize event occurs.
 * @param onChange The callback when a resize event occurs
 * @param delay The debounce delay before calling onChange
 * @param listenForClientDrawerChange Indicates if the client drawer open or close should trigger a resize event.
 * @return {unknown}
 */
export default function useResize(
   ref,
   isWidthChanged,
   isHeightChanged,
   onChange = null,
   delay = 500,
   defaultWidth = undefined,
   defaultHeight = undefined,
   listenForClientDrawerChange = false
) {
   const [width, setWidth] = useState(defaultWidth);
   const [height, setHeight] = useState(defaultHeight);
   const isDrawerOpen = useRecoilValue(drawerIsOpenStatus);

   // Listen for changes to the client drawer.
   useEffect(() => {
      if (listenForClientDrawerChange) {
         delayed(handleResize, 400);
      }
   }, [isDrawerOpen, listenForClientDrawerChange]);

   /**
    * Callback when the window size changes.
    */
   const handleResize = () => {
      let didWidthChange = false;
      let didHeightChange = false;

      // Only trigger onChange when width is needed and the width changed.
      if (isWidthChanged && width !== ref?.current?.clientWidth) {
         setWidth(ref?.current?.clientWidth);
         didWidthChange = true;
      }

      // Only trigger onChange when height is needed and the height changed.
      if (isHeightChanged && height !== ref?.current?.clientHeight) {
         setHeight(ref?.current?.clientHeight);
         didHeightChange = true;
      }

      // If something changed that is needed call onChange.
      if (didWidthChange || didHeightChange) {
         onChange?.(ref?.current?.clientWidth, ref?.current?.clientHeight);
      }
   };

   // When the ref is set set the height and width;
   useEffect(() => {
      if (ref.current) {
         handleResize();
         // setWidth(ref?.current.clientWidth);
         // setHeight(ref?.current.clientHeight);
      }
   }, [ref]);

   // Debounce the check for resize to avoid continual changes.
   const handleResizeDebounced = useRef(debounce(handleResize, delay)).current;

   useEffect(() => {
      window.addEventListener('resize', handleResizeDebounced);
      return () => window.removeEventListener('resize', handleResizeDebounced);
   }, [handleResizeDebounced]);

   return {width, height};
}
