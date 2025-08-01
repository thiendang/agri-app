import findIndex from 'lodash/findIndex';
import numberFormatter from 'number-formatter';
import {isFirefox} from 'react-dnd-html5-backend/dist/BrowserDetector';
import {useRecoilValue} from 'recoil';
import {selectedCellState} from '../components/table/TableNewUiFHG';
import {useEffect, useRef} from 'react';
import {removeOne} from '../utils/Utils';
import {parseNumber} from '../utils/Utils';

const pasteLineEnding = isFirefox() ? '\n' : '\r\n';

/**
 * Hook to copy a row, a column or a cell in a react-table.
 * The selection is indicated by the recoil value for selectedCellState.
 *
 * @param isEnabled Is the copy enabled.
 * @param table The react-table from which to copy.
 * @param tableName The name of the table. Handles multiple tables on the same page using the same hook. cellSelected
 *                   will distinguish the selection.
 * @param onPasteColumn Callback to handle pasting a column.
 * @param onPasteRow Callback to perform pasting a row.
 */
export default function useTablePaste({isEnabled = true, table, tableName, onPasteColumn, onPasteRow}) {
   const cellSelected = useRecoilValue(selectedCellState);
   const isInitializedRef = useRef(false);

   useEffect(() => {
      // Paste an entire table row. Handles expanded rows.
      async function handleRowPaste(event, pastedText) {
         if (cellSelected?.rowId) {
            let pastedColumns = pastedText.split('\t');
            pastedColumns = pastedColumns.map((column) => parseNumber(column, true));
            const fromGG = pastedColumns.length >= 1 && pastedColumns.length <= 60;

            if (fromGG) {
               if (pastedColumns?.[0] === null) {
                  removeOne(pastedColumns, 0);
               }

               // Start with the selected column unless it is 0, which is the category column. If so, we skip it.
               let columnIndex =
                  cellSelected?.columnIndex === 0 || cellSelected?.columnIndex === undefined
                     ? 1
                     : cellSelected?.columnIndex;

               const row = table.getRow(cellSelected.rowId);
               const leafColumns = table.getAllLeafColumns();

               let index = 0;
               const accumulatedPasteData = {};

               for (const pastedColumn of pastedColumns) {
                  if (columnIndex < leafColumns?.length) {
                     onPasteRow(
                        index,
                        leafColumns[columnIndex],
                        row,
                        pastedColumn,
                        accumulatedPasteData,
                        pastedColumns?.length <= index + 1,
                        columnIndex,
                        tableName,
                     );
                     index += 1;
                     columnIndex += 1;
                  } else {
                     break;
                  }
               }
               event?.stopPropagation();
               event?.preventDefault();
            }
         }
      }

      async function handleColumnPaste(event, pastedText) {
         if (cellSelected?.columnIndex > 0) {
            let pastedRows = pastedText.split(pasteLineEnding);
            pastedRows = pastedRows.map((col) => parseNumber(col, true));
            let fromGG = pastedRows.length >= 1;

            if (fromGG) {
               const leafColumns = table.getAllLeafColumns();
               const column = leafColumns[cellSelected.columnIndex];

               let index = 0;
               const accumulatedPasteData = {};
               const rows = table.getRowModel().rows;

               let rowIndex = findIndex(rows, {id: cellSelected.rowId});

               if (rowIndex < 0) {
                  rowIndex = 0;
               }

               let rowCountCanPaste = 0;
               for (let i = rowIndex; i < rows.length && rowCountCanPaste < pastedRows.length; i += 1) {
                  if (!rows[i].getCanExpand() && rows[i]?.original?.id) {
                     rowCountCanPaste++;
                  }
               }

               for (const pastedRow of pastedRows) {
                  while (rows[rowIndex].getCanExpand()) {
                     rowIndex++;
                  }
                  const isLastRow = rowCountCanPaste <= index + 1;
                  onPasteColumn(
                     index,
                     column,
                     rows[rowIndex],
                     pastedRow,
                     accumulatedPasteData,
                     isLastRow,
                     cellSelected.columnIndex,
                     tableName,
                  );
                  if (isLastRow) {
                     break;
                  }
                  rowIndex += 1;
                  index += 1;
               }
               event?.stopPropagation();
               event?.preventDefault();
            }
         }
      }

      /**
       * Copy a row, a column or a selected cell. Uses cellSelected to indicate what should be copied.
       * @param event The copy event.
       * @return {Promise<void>}
       */
      const handlePaste = async (event) => {
         if (tableName === cellSelected?.tableName) {
            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            let isEditPaste = false;

            if (pastedText !== undefined) {
               if (pastedText.indexOf('\n') >= 0) {
                  await handleColumnPaste(event, pastedText);
               } else if (pastedText.indexOf('\t') >= 0) {
                  await handleRowPaste(event, pastedText);
               } else if (
                  event.srcElement.dataset.isEdit === 'false' &&
                  event.srcElement.dataset.isSelected === 'true'
               ) {
                  await handleRowPaste(event, pastedText);
               } else {
                  isEditPaste = true;
               }
               if (!isEditPaste) {
                  event.stopPropagation();
                  event.preventDefault();
               }
            }
         }
      };

      if (isEnabled) {
         if (!isInitializedRef.current) {
            isInitializedRef.current = true;

            window.addEventListener('paste', handlePaste);

            return () => {
               isInitializedRef.current = false;
               window.removeEventListener('paste', handlePaste);
            };
         }
      } else if (isInitializedRef.current) {
         isInitializedRef.current = false;
         window.removeEventListener('paste', handlePaste);
      }
   }, [
      cellSelected?.columnIndex,
      cellSelected?.isColumn,
      cellSelected?.isRow,
      cellSelected?.tableName,
      isEnabled,
      table,
      tableName,
   ]);
}
