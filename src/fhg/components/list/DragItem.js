import {useTheme} from '@mui/styles';
import {useRef} from 'react';
import React from 'react';
import {useDrop} from 'react-dnd';
import {useDrag} from 'react-dnd';
import {Box} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {useSetRecoilState} from 'recoil';
import {atom} from 'recoil';

const ITEM_TYPE = 'dragItem';
export const VERTICAL_LAYOUT = 'vertical';
export const GRID_LAYOUT = 'grid';

export const draggingState = atom({
   key: 'draggingState',
   default: false,
});

/**
 * Drag and drop list item component.
 *
 * @param index The index of the drag item in the list.
 *
 * @param dropItem The item to be drag and drop.
 * @param children The children components.
 * @param move The move function to move the item to the new location in the list.
 * @param onEnd The callback when the drop occurs.
 * @param disable Indicates if the drag and drop should be disabled
 * @param className The className of the CSS for the outer box.
 * @param showDragIndicator Indicates if the drage indicator should be shown.
 * @param onDrop Callback when the item is dropped.
 * @param onBegin Callback when the item is beginning to be dragged.
 * @param itemType The type of item being dragged.
 * @returns {JSX.Element} The resulting component.
 * @constructor
 */
export default function DragItem({
   index,
   dropItem,
   children,
   move,
   onEnd,
   disable,
   className,
   showDragIndicator = true,
   onDrop,
   onBegin,
   itemType = ITEM_TYPE,
   layout = VERTICAL_LAYOUT,
}) {
   const ref = useRef();
   const theme = useTheme();
   const setIsDragging = useSetRecoilState(draggingState);

   const style = {
      padding: theme.spacing(0.5),
      cursor: !disable ? 'pointer' : 'default',
   };

   const [, drop] = useDrop(() => ({
      accept: itemType,
      hover(item, monitor) {
         if (!ref.current) {
            return;
         }
         const dragIndex = item.index;
         const hoverIndex = index;
         // Don't replace items with themselves
         if (dragIndex === hoverIndex) {
            return;
         }
         // Determine rectangle on screen
         const hoverBoundingRect = ref.current?.getBoundingClientRect();
         if (layout === VERTICAL_LAYOUT) {
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
               return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
               return;
            }
         } else if (layout === GRID_LAYOUT) {
            // intentionally left blank for now.
         }

         // Time to actually perform the action
         move?.(dragIndex, hoverIndex);
         // Note: we're mutating the monitor item here!
         // Generally it's better to avoid mutations,
         // but it's good here for the sake of performance
         // to avoid expensive index searches.
         item.index = hoverIndex;
      },
      drop: (item) => onDrop?.(item, index),
   }));

   const [{isDragging}, drag] = useDrag(
      () => ({
         type: itemType,
         canDrag: () => !disable,
         item: () => {
            onBegin?.(dropItem, index);
            setIsDragging(true);
            return {dropItem, index};
         },
         end: (item) => {
            setIsDragging(false);
            onEnd?.(item);
         },
         collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            isDidDrop: monitor.didDrop(),
         }),
      }),
      [disable],
   );

   const opacity = isDragging ? 0.4 : 1;

   // Combine all the refs so only one is needed for both drag and drop targets.
   drag(drop(ref));

   return (
      <Box ref={ref} alignItems={'center'} display={'flex'} style={{...style, opacity}} className={className}>
         {showDragIndicator && (
            <DragIndicatorIcon
               style={{color: disable ? '#dcdcdc' : '#707070', cursor: !disable ? 'move' : undefined}}
            />
         )}
         {children}
      </Box>
   );
}
