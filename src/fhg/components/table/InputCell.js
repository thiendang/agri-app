import makeStyles from '@mui/styles/makeStyles';
import {delay} from 'lodash';
import {isEqual} from 'lodash';
import {clamp} from 'lodash';
import debounce from 'lodash/debounce';
import findIndex from 'lodash/findIndex';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import {useCallback} from 'react';
import {useEffect} from 'react';
import {useRef} from 'react';
import {useRecoilState} from 'recoil';
import {SCALE_APP} from '../../../Constants';
import {useCustomSearchParams} from '../../hooks/useCustomSearchParams';
// import useEffect from '../../hooks/useEffectDebugCount';
import {getMarkedValue2} from '../../utils/DataUtil';
import memoize from 'fast-memoize';
import {parseNumber} from '../../utils/Utils';
import {selectedCellState} from './TableNewUiFHG';
import './InputCell.css';

const numberFormatterMemo = memoize((format, value) => {
   return numberFormatter(format, value);
});

const useStyles = makeStyles(
   (theme) => ({
      inputStyle: {
         border: 'unset !important',
         backgroundColor: 'transparent',
         width: '100%',
         color: theme.palette.text.primary,
         fontSize: 18 * SCALE_APP,
         height: '28px',
      },
      editStyle: {
         border: `1px solid ${theme.palette.primary.stroke} !important`,
         backgroundColor: theme.palette.background.selectedCellFocus,
         borderRadius: '8px',
      },
   }),
   {name: 'InputCellStyle'},
);

export function InputCell({getValue, row, column, table, cell, editable, isSelected, tableName, onSelect}) {
   const classes = useStyles();
   const [{search}] = useCustomSearchParams();

   const {index} = row;
   const {id} = column;
   const format = column?.columnDef?.meta?.format;

   const valueRef = useRef(getValue());
   const formatValueRef = useRef(
      valueRef.current === '' || valueRef.current === 0 ? '' : numberFormatterMemo(format, getValue()),
   );

   const isChangedRef = useRef(false);
   const lastUpdateRef = useRef();

   const refInput = useRef();
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
   const isFormattedNumber = column?.columnDef?.meta?.isFormattedNumber || format;
   const isFocused = useMemo(() => isSelected && cellSelected?.isEditing === true, [isSelected, cellSelected]);

   useEffect(() => {
      const currentValue = getValue();
      if (valueRef.current !== currentValue && !isChangedRef.current) {
         valueRef.current = currentValue;
      }
   }, [getValue]);

   useEffect(() => {
      if (isSelected && document.activeElement !== refInput.current) {
         refInput.current?.focus();

         if (!isFocused && editable) {
            refInput.current?.select();
         }
      }
   }, [editable, isSelected, isFocused]);

   /**
    * Function to scroll the cell into view horizontally
    * NOTE: Assumes 'income' is the ID of the left most element that is sticky and 'Income_0_annual_expected'
    * is the ID of the right most element that is sticky.
    * @type {(function(*): void)|*}
    */
   const handleHorizontalScroll = useCallback((id) => {
      const element = document.getElementById(id);
      const elementRight = document.getElementById('Income_0_annual_expected');
      const elementLeft = document.getElementById('income');
      if (element && elementRight && elementLeft) {
         const clientRect = element.getClientRects()?.[0];
         const rightRect = elementRight.getClientRects()?.[0];
         const scrollRightAmount = clientRect.right - rightRect.left;

         if (scrollRightAmount > 0) {
            const offset = scrollRightAmount + clientRect.width / 2;
            document.getElementsByName('Scroll Stack Inner')?.[0]?.scrollBy(offset, 0);
         } else {
            const leftRect = elementLeft.getClientRects()?.[0];
            const scrollLeftAmount = clientRect.left - leftRect.right;
            if (scrollLeftAmount < 0) {
               const offset = scrollLeftAmount - clientRect.width / 2;
               document.getElementsByName('Scroll Stack Inner')?.[0]?.scrollBy(offset, 0);
            }
         }
      }
   }, []);

   /**
    * Function to handle vertical scrolling the cell into the visible area.
    * NOTE: Assumes the element ID 'income' is the top most element that is sticky and there no sticky footers.
    * @type {(function(*): void)|*}
    */
   const handleVerticalScroll = useCallback((id, tableName) => {
      const element = document.getElementById(id);
      const elementTop = document.getElementById(tableName === 'Income' ? 'income' : 'expense');
      if (element) {
         // This works for scrolling lower cells into view because there are no sticky footers.
         element.scrollIntoViewIfNeeded?.(true);

         // Check if cell is above the lowest sticky header.
         const clientRect = element.getBoundingClientRect();
         const topRect = elementTop.getBoundingClientRect();
         const scrollTopAmount = clientRect.top - topRect.bottom;

         if (scrollTopAmount < 0) {
            const offset = scrollTopAmount - clientRect.height / 2;
            document.getElementsByName('Scroll Stack Inner')?.[0]?.scrollBy(0, offset);
         }
      }
   }, []);

   const submitValueDebounced = useRef(
      debounce((event, doCheckLast, value, parentTypeId, isChanged) => {
         if (isChanged) {
            const validValue = (isFormattedNumber || format) && (!value || isNaN(value)) ? 0 : value;
            const nextUpdate = {
               index,
               id,
               validValue,
               row,
               parentId: column.parent.id,
               field: column.columnDef?.meta?.field,
               parentTypeId,
            };

            isChangedRef.current = false;
            if (!doCheckLast || !isEqual(lastUpdateRef.current, nextUpdate)) {
               lastUpdateRef.current = nextUpdate;
               table.options.meta?.updateData(
                  index,
                  id,
                  validValue,
                  row,
                  column.parent.id,
                  column.columnDef?.meta?.field,
                  parentTypeId,
               );
            }
         }
      }, 10000),
   ).current;

   // When the input is blurred, we'll call our table meta's updateData function
   const handleBlur = useCallback(() => {
      setCellSelected((selected) => ({...selected, isEditing: false}));
      submitValueDebounced?.flush?.();
   }, [submitValueDebounced, setCellSelected]);

   /**
    * Callback to handle Escape, Enter and Tab to move the focus of the selected cell.
    * @type {(function(*): void)|*}
    */
   const handleEditingKeyClick = useCallback(
      (event) => {
         const offset = event.shiftKey || event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;

         if (event.key === 'Escape') {
            event?.preventDefault();
            event?.stopPropagation();
            submitValueDebounced?.cancel?.();
            setCellSelected((selected) => ({...selected, isEditing: false}));
         } else if (event.key === 'Enter' || (!isFocused && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))) {
            event?.preventDefault();
            event?.stopPropagation();
            submitValueDebounced.flush();

            if (event.key === 'Enter' && row.getCanExpand()) {
               row?.toggleExpanded(!row?.getIsExpanded());
            } else if (row.index >= 0) {
               const rowModel = table.getRowModel()?.rows;
               const rowIndex = findIndex(rowModel, {id: row.id});
               const newCellIndex = clamp(rowIndex + offset, 0, rowModel?.length - 2);
               const newRow = rowModel?.[newCellIndex];

               setCellSelected((cellSelected) => ({
                  ...cellSelected,
                  cellId: newRow?.id + '_' + column?.id,
                  rowId: newRow?.id,
                  isEditing: false,
                  isRow: false,
               }));
               handleVerticalScroll(tableName + '_' + newRow?.id + '_' + column?.id, tableName);
            }
         } else if (event.key === 'Tab' || (!isFocused && (event.key === 'ArrowRight' || event.key === 'ArrowLeft'))) {
            event?.preventDefault();
            event?.stopPropagation();

            submitValueDebounced.flush();
            if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && row.getCanExpand()) {
               row?.toggleExpanded(event.key === 'ArrowRight');
            } else {
               const rowAllCells = row.getVisibleCells();
               const cellIndex = findIndex(rowAllCells, {id: cell?.id});
               const newCellIndex = clamp(cellIndex + offset, 0, rowAllCells?.length - 1);
               const nextCell = rowAllCells[newCellIndex];

               if (newCellIndex >= 0 && nextCell.column.columnDef.meta.isEditable) {
                  setCellSelected((cellSelected) => ({
                     ...cellSelected,
                     cellId: nextCell.id,
                     columnIndex: newCellIndex,
                     isRow: false,
                     isEditing: false,
                  }));
                  handleHorizontalScroll(tableName + '_' + row.id + '_' + nextCell?.column?.id);
               }
            }
         } else if (event.key === 'Backspace' && !isFocused && editable) {
            event.currentTarget?.select();
            valueRef.current = '';
         } else if (
            ((event.keyCode >= 48 && event.keyCode <= 57) ||
               (event.keyCode >= 96 && event.keyCode <= 105) ||
               event.keyCode === 187 ||
               event.keyCode === 189 ||
               event.keyCode === 190) &&
            !isFocused &&
            isSelected
         ) {
            if (!editable) {
               event.stopPropagation();
               event.preventDefault();
            }
         } else if (!editable) {
            event.stopPropagation();
            event.preventDefault();
         }
      },
      [
         submitValueDebounced,
         isFocused,
         isSelected,
         row,
         table,
         setCellSelected,
         handleVerticalScroll,
         tableName,
         column?.id,
         cell?.id,
         handleHorizontalScroll,
         editable,
      ],
   );

   const handleClick = useCallback(
      (event) => {
         if (isSelected) {
            if (cellSelected?.isEditing !== true) {
               setCellSelected((selected) => ({...selected, isEditing: true, isRow: false}));
               refInput.current.focus();
               refInput.current.select();
            }
         } else {
            const rowAllCells = row.getVisibleCells();
            const cellIndex = findIndex(rowAllCells, {id: cell?.id});

            if (cellIndex >= 0 && editable) {
               const newCellSelected = {
                  tableName,
                  rowId: row.id,
                  columnIndex: cellIndex,
                  cellId: cell?.id,
                  isEditing: false,
                  isRow: false,
                  original: row.original,
               };

               setCellSelected(newCellSelected);
               onSelect?.(event, newCellSelected, row);
               delay(() => {
                  const componenent = document.getElementById('InputCell ' + cell?.id + tableName);
                  if (componenent) {
                     componenent.focus();
                     componenent.select();
                  }
               }, 10);
            }
         }
      },
      [cell?.id, cellSelected?.isEditing, isSelected, onSelect, row, setCellSelected, tableName],
   );

   let inputProps;

   if (isFormattedNumber) {
      inputProps = {
         'data-index': row?.index,
         'data-type': 'number',
         pattern: '^[0-9,]+$',
         title: 'Enter a valid number.',
         // allowNegative: column?.columnDef?.meta?.allowNegative ?? true,
      };
   } else {
      inputProps = {};
   }

   if (!isFocused && search) {
      return getMarkedValue2(numberFormatter(format, valueRef.current === 0 ? undefined : valueRef.current), search);
   }

   const validValue =
      (isFormattedNumber || format) && isNaN(valueRef.current) && valueRef.current !== '.'
         ? ''
         : valueRef.current === 0
           ? ''
           : valueRef.current;

   return (
      <input
         id={'InputCell ' + cell?.id + tableName}
         key={'InputCell ' + cell?.id + tableName}
         name={'InputCell ' + cell?.id}
         data-is-edit={isFocused}
         data-is-selected={isSelected}
         ref={refInput}
         className={`${classes.inputStyle} ${isFocused ? classes.editStyle : 'focusStyle'}`}
         style={{textAlign: isFormattedNumber ? 'right' : undefined}}
         placeholder={row.depth === 0 ? column?.columnDef?.meta?.placeholder : column?.columnDef?.meta?.subPlaceholder}
         {...inputProps}
         defaultValue={!isFocused ? formatValueRef.current : validValue}
         value={!isFocused && !isSelected ? formatValueRef.current : undefined}
         onChange={(e) => {
            if (editable) {
               isChangedRef.current = true;
               valueRef.current = format ? parseNumber(e.target.value) : e.target.value;
               formatValueRef.current =
                  valueRef.current === '' || valueRef.current === ''
                     ? ''
                     : numberFormatterMemo(format, valueRef.current);
               submitValueDebounced(
                  e,
                  true,
                  valueRef.current,
                  row.getParentRow()?.original?.typeId,
                  isChangedRef.current,
               );
            }
         }}
         onMouseDown={handleClick}
         onBlur={handleBlur}
         onKeyDown={isSelected ? handleEditingKeyClick : undefined}
      />
   );
}
