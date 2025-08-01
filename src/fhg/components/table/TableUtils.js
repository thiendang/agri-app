import {sortingFns} from '@tanstack/react-table';
import {rankItem, compareItems} from '@tanstack/match-sorter-utils';
import React from 'react';

export const fuzzyFilter = (row, columnId, value, addMeta) => {
   // Rank the item
   const itemRank = rankItem(row.getValue(columnId), value);

   // Store the ranking info
   addMeta(itemRank);

   // Return if the item should be filtered in/out
   return itemRank.passed;
};

export const fuzzySort = (rowA, rowB, columnId) => {
   let dir = 0;

   // Only sort by rank if the column has ranking information
   if (rowA.columnFiltersMeta[columnId]) {
      dir = compareItems(rowA.columnFiltersMeta[columnId], rowB.columnFiltersMeta[columnId]);
   }

   // Provide an alphanumeric fallback for when the item ranks are equal
   return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export function EditableCell({getValue, row: {index, original}, column: {id, isEditable}, table}) {
   const initialValue = getValue();
   // We need to keep and update the state of the cell normally
   const [value, setValue] = React.useState(initialValue);

   // When the input is blurred, we'll call our table meta's updateData function
   const onBlur = () => {
      table.options.meta.updateData(index, id, value, original);
   };

   // If the initialValue is changed external, sync it up with our state
   React.useEffect(() => {
      setValue(initialValue);
   }, [initialValue]);

   if (table.options.meta.updateData && isEditable) {
      return <input value={value} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />;
   } else {
      return initialValue;
   }
}

export const getTableMeta = (setData, skipAutoResetPageIndex) => ({
   updateData: (rowIndex, columnId, value, row, parentId, fieldId, parentTypeId) => {
      // Skip age index reset until after next rerender
      skipAutoResetPageIndex();
      setData?.(rowIndex, columnId, value, row, parentId, fieldId, parentTypeId);
   },
});
