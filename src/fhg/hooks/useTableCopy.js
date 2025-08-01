import numberFormatter from 'number-formatter';
import {useRecoilValue} from 'recoil';
import {selectedCellState} from '../components/table/TableNewUiFHG';
import {useEffect, useRef} from 'react';
import {MONTHS_CONVERT} from '../../Constants';

/**
 * Hook to copy a row, a column or a cell in a react-table.
 * The selection is indicated by the recoil value for selectedCellState.
 *
 * @param isEnabled Is the copy enabled.
 * @param table The react-table from which to copy.
 * @param tableName The name of the table. Handles multiple tables on the same page using the same hook. cellSelected
 *                   will distinguish the selection.
 */
export default function useTableCopy({isEnabled = true, table, tableName}) {
   const cellSelected = useRecoilValue(selectedCellState);
   const isInitializedRef = useRef(false);

   useEffect(() => {
      // Copy an entire table row. Handles expanded rows.
      async function handleRowCopy(event) {
         if (cellSelected?.isRow) {
            // find the selected row. This can be an expanded or non-expanded row since rowId will work for either.
            const row = table.getRow(cellSelected.rowId);
            const data = [];
            const allCells = row.getVisibleCells();

            // For each cell in the selected row...
            for (let i = 0; i < allCells.length; i++) {
               const cell = allCells[i];
               // format the cells based on the meta data format.
               const {format} = cell.column.columnDef.meta;
               data[i] = format ? numberFormatter(format, cell.getValue()) : cell.getValue();
            }
            await navigator.clipboard.writeText(data.join('\t') ?? '');

            event.stopPropagation();
            event.preventDefault();
         }
      }

      /**
       * Copy an entire column in a table.
       * @param event The copy event.
       * @return {Promise<void>}
       */
      async function handleColumnCopy(event) {
         /**
          * Get the user-viewable Field label from the field name.
          * @param fieldName the field name to get the label from.
          * @return {string} The Field label.
          */
         function getFieldLabel(fieldName) {
            switch (fieldName) {
               case 'expected':
                  return 'Projected';
               case 'expectedPercent':
                  return 'Projected Percent';
               case 'actual':
                  return 'Actual';
               case 'actualPercent':
                  return 'Actual Percent';
               default:
                  console.error('fieldName is not valid for getFieldLabel', fieldName);
            }
         }

         if (cellSelected.columnIndex >= 0 && cellSelected.isColumn) {
            const leafColumns = table.getAllLeafColumns();
            const column = leafColumns[cellSelected.columnIndex];
            const rows = table.getRowModel().rows;
            let index = 1;
            const {field, format} = column.columnDef.meta;

            const data = [`${MONTHS_CONVERT[column.parent.id]} ${getFieldLabel(field)} ${cellSelected.tableName} `];
            for (const row of rows) {
               data[index++] = format ? numberFormatter(format, row.getValue(column.id)) : row.getValue(column.id);
            }
            await navigator.clipboard.writeText(data.join('\r\n') ?? '');
            event?.stopPropagation();
            event?.preventDefault();
         }
      }

      /**
       * Copy a row, a column or a selected cell. Uses cellSelected to indicate what should be copied.
       * @param event The copy event.
       * @return {Promise<void>}
       */
      const handleCopy = async (event) => {
         if (tableName === cellSelected?.tableName) {
            if (cellSelected?.isRow) {
               await handleRowCopy(event);
            } else if (cellSelected?.isColumn) {
               await handleColumnCopy(event);
            } else if (event.srcElement.dataset.isEdit === 'false' && event.srcElement.dataset.isSelected === 'true') {
               await navigator.clipboard.writeText(event.srcElement?.value ?? '');
               event.stopPropagation();
               event.preventDefault();
            }
         }
      };

      if (isEnabled) {
         if (!isInitializedRef.current) {
            isInitializedRef.current = true;

            window.addEventListener('copy', handleCopy);

            return () => {
               isInitializedRef.current = false;
               window.removeEventListener('copy', handleCopy);
            };
         }
      } else if (isInitializedRef.current) {
         isInitializedRef.current = false;
         window.removeEventListener('copy', handleCopy);
      }
   }, [
      cellSelected?.columnIndex,
      cellSelected?.isColumn,
      cellSelected?.isRow,
      cellSelected?.tableName,
      isEnabled,
      table,
   ]);
}
