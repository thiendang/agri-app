import {TableFooter} from '@mui/material';
import {Table as MuiTable} from '@mui/material';
import Box from '@mui/material/Box';
import {lighten} from '@mui/material/styles';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import makeStyles from '@mui/styles/makeStyles';
import useTableCopy from '../../hooks/useTableCopy';
import useTablePaste from '../../hooks/useTablePaste';

import {getExpandedRowModel} from '@tanstack/react-table';
import {
   getCoreRowModel,
   getFacetedMinMaxValues,
   getFacetedRowModel,
   getFacetedUniqueValues,
   getFilteredRowModel,
   getGroupedRowModel,
   getSortedRowModel,
   useReactTable,
} from '@tanstack/react-table';

import {flexRender} from '@tanstack/react-table';
import {Fragment} from 'react';
import {useState} from 'react';
import React from 'react';
import {useRecoilState} from 'recoil';
import useEffect from '../../hooks/useEffect';
import {useSkipper} from './Hooks';
import {InputCell} from './InputCell';
import {noteEditStatus} from './TableContainerNewUiFHG';
import {selectedCellState} from './TableNewUiFHG';
import {getTableMeta} from './TableUtils';
import {fuzzyFilter} from './TableUtils';
import {DARK_MODE_COLORS, SCALE_APP} from '../../../Constants';

const EMPTY_OBJECT = {};
const EMPTY_DATA = [];

// const useInputStyles = makeStyles(
//    (theme) => ({
//       inputStyle: {
//          border: 'unset !important',
//          backgroundColor: 'transparent',
//          width: '100%',
//          color: theme.palette.text.primary,
//          '&:focus': {
//             border: `1px solid ${theme.palette.primary.stroke} !important`,
//             backgroundColor: theme.palette.background.selectedCellFocus,
//             borderRadius: '8px',
//          },
//          fontSize: 18 * SCALE_APP,
//          height: '28px',
//       },
//    }),
//    {name: 'TableV8FhgInputStyles'},
// );

function getTableHeaderGroups(table, tableGroup) {
   switch (tableGroup) {
      case 'left':
         return [table.getLeftHeaderGroups(), table.getLeftFooterGroups()];
      case 'right':
         return [table.getRightHeaderGroups(), table.getRightFooterGroups()];
      case 'center':
         return [table.getCenterHeaderGroups(), table.getCenterFooterGroups()];
      default:
         return [table.getHeaderGroups(), table.getFooterGroups()];
   }
}

function getRowGroup(row, tableGroup) {
   switch (tableGroup) {
      case 'left':
         return row.getLeftVisibleCells();
      case 'right':
         return row.getRightVisibleCells();
      case 'center':
         return row.getCenterVisibleCells();
      default:
         return row.getVisibleCells();
   }
}

function FooterRow({footerGroup, footerPropertyName = 'footer', classes}) {
   return (
      <TableRow key={footerGroup.id}>
         {footerGroup.headers.map((column) => {
            if (column?.column?.columnDef?.[footerPropertyName]) {
               return (
                  <TableCell
                     className={`footer-style ${classes.cellFooterStyle}`}
                     key={column.id}
                     colSpan={column.colSpan}
                     style={{
                        height: column?.column?.columnDef?.meta?.height,
                        fontWeight: column?.column?.columnDef?.meta?.bold ? 'bold' : undefined,
                     }}
                  >
                     {column.isPlaceholder
                        ? null
                        : flexRender(column?.column?.columnDef?.[footerPropertyName], column.getContext())}
                  </TableCell>
               );
            } else {
               return null;
            }
         })}
      </TableRow>
   );
}

export function CustomTable({
   name,
   table,
   tableGroup,
   onSelect,
   allowCellSelection = false,
   stickyHeader = true,
   isSortable,
   onScroll,
   onDoubleClick,
   onContextMenu,
   width,
   classes: classesProp,
   ...props
}) {
   const classes = {...useStyles(), ...(classesProp || {})};
   const [headerGroups, footerGroup] = getTableHeaderGroups(table, tableGroup);
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
   const [isEditNote, setIsEditNote] = useRecoilState(noteEditStatus);
   const [isKeyboardRecent, setIsKeyboardRecent] = useState(false);

   // /**
   //  * Select the row on click.
   //  * @param row The row clicked to be selected.
   //  * @return {function(...[*]=)}
   //  */
   // const handleRowClick = useCallback(
   //    (row, index) => () => {
   //       if (!allowCellSelection && !isEditNote) {
   //          setCellSelected((selected) => ({...selected, isRow: !row.getIsSelected(), original: row.original}));
   //          row.toggleSelected();
   //
   //          onSelect && onSelect(row.original);
   //       }
   //    },
   //    [allowCellSelection, isEditNote, onSelect],
   // );

   const handleColumnClick = (column, cell) => () => {
      if (column?.depth > 0) {
         setCellSelected({
            tableName: name,
            rowIndex: -1,
            rowId: undefined,
            columnIndex: cell?.index,
            cellId: cell?.id,
            isRow: false,
            isColumn: true,
         });
      }
   };

   // const handleSelectCell = React.useCallback(
   //    (cellKey, rowIndex, columnIndex, cell) => (event, cellSelected) => {
   //       const row = cell?.row;
   //       // If the cell is already selected before being clicked...
   //       if (cellSelected?.cellId === cell?.id) {
   //          // If the cell is editing and the row is selected, or the column is the category column and cell is not
   //          // being edited and the row is not selected.
   //          if (cellSelected?.isEditing && cellSelected?.isRow) {
   //             setCellSelected((selected) => ({...selected, isRow: false, original: row.original}));
   //          } else if (columnIndex === 0 && !cellSelected?.isEditing) {
   //             setCellSelected((selected) => ({
   //                ...selected,
   //                isColumn: false,
   //                isRow: false,
   //                original: row.original,
   //             }));
   //          }
   //          onSelect?.(undefined, cellKey, rowIndex, columnIndex, cell);
   //          return;
   //       }
   //
   //       if (!isEditNote) {
   //          if (!allowCellSelection) {
   //             setCellSelected((selected) => ({...selected, isRow: !selected.isRow, original: row.original}));
   //             onSelect?.(row.original);
   //          } else {
   //             setCellSelected((selected) => ({
   //                tableName: name,
   //                rowIndex,
   //                rowId: row?.id,
   //                columnIndex,
   //                cellId: cell?.id,
   //                isRow: columnIndex === 0 && !selected.isRow,
   //                original: row.original,
   //             }));
   //             onSelect?.(undefined, cellKey, rowIndex, columnIndex, cell);
   //          }
   //       }
   //    },
   //    [allowCellSelection, isEditNote, onSelect, setCellSelected, name],
   // );

   const rowLength = table.getRowModel()?.rows?.length || 0;

   const handleKeydown = (event) => {
      setIsKeyboardRecent(true);
   };

   const handleMouseMove = (event) => {
      if (Math.abs(event.movementX) > 10 || Math.abs(event.movementY) > 10) {
         setIsKeyboardRecent(false);
      }
   };

   return (
      <TableContainer
         name={name + 'Container' + tableGroup}
         className={stickyHeader ? classes.stickyFrame : ''}
         onScroll={onScroll}
         style={{width, overflow: 'unset'}}
      >
         <MuiTable
            {...(props || {})}
            style={{borderCollapse: stickyHeader ? 'separate' : 'collapse'}}
            stickyHeader={stickyHeader}
         >
            <TableHead className={classes.tableHeadRoot}>
               {headerGroups.map((headerGroup, headerRowIndex) => (
                  <TableRow key={headerGroup.id} className={classes.tableHeadStyle}>
                     {headerGroup.headers.map((header, columnIndex) => {
                        const isSelectedCell =
                           cellSelected?.isColumn &&
                           cellSelected?.tableName === name &&
                           cellSelected?.columnIndex === columnIndex &&
                           header.depth !== 1;

                        return (
                           <TableCell
                              id={header.id}
                              key={header.id}
                              className={`relative header-style row-${headerRowIndex} ${classes.headerStyle} ${
                                 isSelectedCell ? classes.selectedCell : ''
                              }`}
                              style={{
                                 width: header.column.columnDef.meta?.width || header.getSize(),
                                 minWidth: header.column.columnDef.meta?.minWidth || undefined,
                                 maxWidth: header.column.columnDef.meta?.maxWidth || undefined,
                                 height: header.column.columnDef.meta?.headerHeight,
                              }}
                              colSpan={header.colSpan}
                              onClick={handleColumnClick(header.column, header)}
                           >
                              {header.isPlaceholder ? null : (
                                 <>{flexRender(header.column.columnDef?.header, header.getContext())}</>
                              )}
                              {isSortable && header.column.getCanSort() && (
                                 <TableSortLabel
                                    active={header.column.getIsSorted()}
                                    // react-table has an unsorted state which is not treated here
                                    direction={header.column.getIsSorted() || ''}
                                 />
                              )}
                           </TableCell>
                        );
                     })}
                  </TableRow>
               ))}
            </TableHead>
            <TableBody key={'tableBody' + rowLength} className={classes.rowStyle}>
               {rowLength > 0 &&
                  table.getRowModel()?.rows?.map((row) => (
                     <TableRow
                        key={row.id + ' ' + row.original?.id}
                        hover={!allowCellSelection}
                        onContextMenu={(event) => onContextMenu?.(event, row)}
                        selected={
                           !!cellSelected &&
                           cellSelected.isRow &&
                           cellSelected.tableName === name &&
                           row.id === cellSelected.rowId
                        }
                     >
                        {getRowGroup(row, tableGroup).map((cell, cellIndex) => {
                           const isSelected = cellSelected?.tableName === name && cellSelected.cellId === cell.id;
                           const isSelectedCell =
                              isSelected ||
                              (!!cellSelected &&
                                 cellSelected.isColumn &&
                                 cellSelected.columnIndex === cellIndex &&
                                 cellSelected.tableName === name);
                           const isEditable =
                              cell.column.columnDef.meta?.isEditable &&
                              (cellIndex === 0 || !row.getCanExpand()) &&
                              (!!row?.original?.id || cellIndex === 0);

                           return (
                              <TableCell
                                 id={name + '_' + cell.id}
                                 key={cell.id}
                                 {...cell.column.tableCellProps}
                                 className={`cell-style ${classes.cellStyle} 
                                 ${isSelectedCell ? classes.selectedCell : ''} 
                                 ${isEditable ? 'editable' : ''} 
                                 ${isKeyboardRecent ? 'keyboardRecent' : ''} 
                                 ${row.getCanExpand() ? classes.expandCell : ''}`}
                                 style={{
                                    width: cell.column.columnDef.meta?.width || cell.column.getSize(),
                                    minWidth: cell.column.columnDef.meta?.minWidth || undefined,
                                    maxWidth: cell.column.columnDef.meta?.maxWidth || undefined,
                                    height: cell.column.columnDef.meta?.height,
                                    ...(cell.column.columnDef.meta.style || {}),
                                    fontWeight: cell.column.columnDef.meta?.bold ? 'bold' : undefined,
                                 }}
                                 onKeyDownCapture={handleKeydown}
                                 onMouseMove={handleMouseMove}
                                 onDoubleClick={(event) => {
                                    if (!isEditNote) {
                                       onDoubleClick?.(event, row, cell, name);
                                    }
                                 }}
                              >
                                 {flexRender(cell.column.columnDef.cell, {
                                    ...cell.getContext(),
                                    editable: isEditable,
                                    isSelected,
                                    tableName: name,
                                    isEditNote,
                                    setIsEditNote,
                                 })}
                              </TableCell>
                           );
                        })}
                     </TableRow>
                  ))}
            </TableBody>
            {/*{footerGroup?.depth > 0 && (*/}
            <TableFooter>
               {footerGroup?.map((footerGroup, groupIndex) => {
                  if (groupIndex <= 0) {
                     return (
                        <Fragment key={'frag ' + groupIndex}>
                           <FooterRow footerGroup={footerGroup} footerPropertyName={'footer'} classes={classes} />
                           <FooterRow footerGroup={footerGroup} footerPropertyName={'footer2'} classes={classes} />
                           <FooterRow footerGroup={footerGroup} footerPropertyName={'footer3'} classes={classes} />
                           <FooterRow footerGroup={footerGroup} footerPropertyName={'footer4'} classes={classes} />
                        </Fragment>
                     );
                  }
                  return null;
               })}
            </TableFooter>
            {/*)}*/}
         </MuiTable>
      </TableContainer>
   );
}

// export function InputCell({getValue, row, column, table, onBlur, editable, canFocus}) {
//    const [{search}] = useCustomSearchParams();
//
//    const {index, original} = row;
//    const {id} = column;
//
//    const classes = useInputStyles();
//
//    const valueRef = useRef(getValue());
//    const [isFocused, setIsFocused] = useState(false);
//    const [isChanged, setIsChanged] = useState(false);
//
//    const [, setRefresh] = useState();
//
//    const refInput = useRef();
//    const setShowEdit = useSetRecoilState(editCellState);
//    const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
//
//    useEffect(() => {
//       if (canFocus) {
//          refInput.current?.focus();
//       } else if (document.activeElement === refInput.current) {
//          // There is a race condition and bluring can occur too soon so that the edit cell retains focus.
//          delay(() => {
//             refInput.current?.blur();
//          }, 100);
//       }
//    }, [canFocus]);
//
//    /**
//     * Callback to handle Escape, Enter and Tab to move the focus of the selected cell.
//     * @type {(function(*): void)|*}
//     */
//    const handleEditingKeyClick = useCallback(
//       (event) => {
//          const offset = event.shiftKey ? -1 : 1;
//
//          if (event.key === 'Enter') {
//             event?.preventDefault();
//             event?.stopPropagation();
//             if (document.activeElement === refInput.current) {
//                refInput.current?.blur();
//             } else {
//                handleBlur();
//             }
//
//             if (row.index >= 0) {
//                const newRow = table.getRowModel()?.rows?.[row.index + offset];
//                setCellSelected((cellSelected) => ({
//                   ...cellSelected,
//                   cellId: newRow?.id + '_' + column?.id,
//                   selectedId: newRow?.id + '_' + column?.id,
//                   rowIndex: row.index + offset,
//                }));
//             }
//          } else if (event.key === 'Tab') {
//             event?.preventDefault();
//             event?.stopPropagation();
//             if (document.activeElement === refInput.current) {
//                refInput.current?.blur();
//             } else {
//                handleBlur();
//             }
//
//             if (cellSelected?.columnIndex) {
//                const columnIndex = cellSelected.columnIndex + offset;
//                const newColumn = table.getVisibleLeafColumns()?.[columnIndex];
//                setCellSelected((cellSelected) => ({
//                   ...cellSelected,
//                   cellId: row.id + '_' + newColumn.id,
//                   selectedId: row.id + '_' + newColumn.id,
//                   columnIndex,
//                }));
//             }
//          }
//       },
//       [row, column, table, setShowEdit, onBlur, cellSelected?.rowIndex, cellSelected?.columnIndex, setCellSelected],
//    );
//
//    // When the input is blurred, we'll call our table meta's updateData function
//    const handleBlur = () => {
//       setIsFocused(false);
//       if (isChanged) {
//          const validValue = (isFormattedNumber || format) && isNaN(valueRef.current) ? 0 : valueRef.current;
//          setIsChanged(false);
//          table.options.meta?.updateData(
//             index,
//             id,
//             validValue,
//             original,
//             column.parent.id,
//             column.columnDef?.meta?.field,
//          );
//       }
//       onBlur?.();
//    };
//
//    const format = column?.columnDef?.meta?.format;
//    const isFormattedNumber = column?.columnDef?.meta?.isFormattedNumber || format;
//    let inputProps;
//    // const isFormattedNumber = false;
//    // const format = undefined;
//    if (isFormattedNumber) {
//       inputProps = {
//          'data-index': row?.index,
//          'data-type': 'number',
//          pattern: '^[0-9,]+$',
//          title: 'Enter a valid number.',
//          allowNegative: column?.columnDef?.meta?.allowNegative ?? true,
//       };
//    } else {
//       inputProps = {};
//    }
//
//    if (!isFocused && search) {
//       return getMarkedValue2(numberFormatter(format, valueRef.current === 0 ? undefined : valueRef.current), search);
//    }
//
//    if (!editable) return valueRef.current;
//    const validValue =
//       (isFormattedNumber || format) && isNaN(valueRef.current) && valueRef.current !== '.' && valueRef.current !== '-'
//          ? ''
//          : valueRef.current === 0
//            ? ''
//            : valueRef.current;
//    return (
//       <input
//          ref={refInput}
//          className={classes.inputStyle}
//          style={{textAlign: isFormattedNumber ? 'right' : undefined}}
//          placeholder={column?.columnDef?.meta?.placeholder}
//          {...inputProps}
//          value={format && !isFocused && validValue !== '' ? numberFormatter(format, validValue) : validValue}
//          onChange={(e) => {
//             // Refresh to update the value display, since this is a controlled component.
//             setRefresh(Date.now());
//             setIsChanged(true);
//             valueRef.current = format ? parseNumber(e.target.value) : e.target.value;
//          }}
//          onFocus={({target}) => {
//             setIsFocused(true);
//             target.select();
//          }}
//          onBlur={handleBlur}
//          onKeyDown={handleEditingKeyClick}
//       />
//    );
// }

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
   minWidth: 30,
   maxWidth: 400,
   cell: InputCell,
};

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         '& .MuiTypography-root': {
            display: 'inline-block',
         },
         cursor: 'pointer',
         textAlign: 'center',
         whiteSpace: 'nowrap',
         backgroundColor: `${theme.palette.background.paper2} !important`,
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         borderRight: `1px solid ${theme.palette.primary.stroke2} !important`,
      },
      tableHeadStyle: {
         backgroundColor: `${theme.palette.background.paper2} !important`,
      },
      rowStyle: {
         '& tr:nth-of-type(odd)': {
            backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_1 : '#fafafa',
         },
         '& tr:nth-of-type(even)': {
            backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_1 : 'white',
         },
      },
      selectedRow: {
         '& .MuiTableRow-root.Mui-selected': {
            backgroundColor: `${theme.palette.background.selectedRow} !important`,
         },
      },
      selectedCell: {
         backgroundColor: `${theme.palette.background.selectedCell} !important`,
         '&:hover': {
            //TODO check this color in dark mode.
            background: `${lighten(theme.palette.background.selectedCell, 0.1)} !important`,
         },
      },
      cellFooterStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         backgroundColor:
            theme.palette.mode === 'dark' ? `${DARK_MODE_COLORS.Background_1} !important` : '#fff !important',
         borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(224, 224, 224, 1)'
         }`,
         borderRight: `1px solid ${
            theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Card_2_Stroke : 'rgba(224, 224, 224, 1)'
         } !important`,
         fontWeight: 'bold !important',
      },
      selected: {
         backgroundColor: `#f0f6e9 !important`,
      },
      expandCell: {
         fontWeight: 'bold',
      },
   }),
   {name: 'TableV8FhgStyles'},
);

export default function TableV8FHG({
   name,
   columns,
   data,
   searchFilter,
   onScroll,
   onSelect,
   sorting,
   onSortingChange,
   isSortable,
   allowCellSelection = false,
   stickyHeader = true,
   onDoubleClick,
   onContextMenu,
   updateData,
   hasPinning,
   pinnedColumns,
   className,
   classes: classesProp = EMPTY_OBJECT,
   hiddenColumns = [],
   getSubRows,
   expandRow,
   expanded: expandedProp,
   onRowExpanded,
   onPasteColumn,
   onPasteRow,
}) {
   const classes = {...useStyles(), ...classesProp};
   const [globalFilter, setGlobalFilter] = React.useState(searchFilter);
   const [rowSelection, setRowSelection] = React.useState({});
   const [columnVisibility, setColumnVisibility] = useState({});
   const [columnPinning, setColumnPinning] = React.useState(pinnedColumns);
   const [, /*autoResetPageIndex*/ skipAutoResetPageIndex] = useSkipper();
   const [centerTableVisibility, setCenterTableVisibility] = React.useState(true);
   const [sortingLocal, setSortingLocal] = useState();
   const [expanded, setExpanded] = React.useState({});

   useEffect(() => {
      setColumnPinning(pinnedColumns);
   }, [pinnedColumns]);

   useEffect(() => {
      setGlobalFilter(searchFilter);
   }, [searchFilter]);

   const handleSubRows = (row) => row.subRows;

   const handleExpandRow = (state) => {
      if (!onRowExpanded) {
         setExpanded(state);
      } else {
         const row = {};
         onRowExpanded?.(state, row, table, name);
      }
   };

   const table = useReactTable({
      data: data || EMPTY_DATA,
      columns,
      defaultColumn,
      enableRowSelection: true,
      enableMultiRowSelection: false,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFacetedMinMaxValues: getFacetedMinMaxValues(),
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: fuzzyFilter,
      enableColumnResizing: true,
      columnResizeMode: 'onChange',
      onColumnVisibilityChange: setColumnVisibility,
      onColumnPinningChange: setColumnPinning,
      onRowSelectionChange: setRowSelection,
      onSortingChange: !!onSortingChange ? onSortingChange : isSortable ? setSortingLocal : undefined,
      // Provide our updateData function to our table meta
      meta: {name, ...getTableMeta(updateData, skipAutoResetPageIndex)},
      state: {
         // grouping,
         // columnFilters,
         sorting: !!sorting ? sorting : isSortable ? sortingLocal : undefined,
         globalFilter,
         columnVisibility,
         columnPinning,
         rowSelection,
         expanded: expandedProp && Object.keys(expandedProp)?.length > 0 ? expandedProp : expanded,
      },
      // debugTable: true,
      // debugHeaders: true,
      // debugColumns: true,
      getSubRows: getSubRows || handleSubRows,
      getExpandedRowModel: getExpandedRowModel(),
      onExpandedChange: handleExpandRow,
   });
   useTableCopy({isEnabled: true, table, tableName: name});
   useTablePaste({isEnabled: true, table, tableName: name, onPasteColumn, onPasteRow});

   useEffect(() => {
      let centerTableVisibility = false;
      table.getAllLeafColumns().forEach((column) => {
         if (hiddenColumns.some((hiddenColumn) => column.id === hiddenColumn)) {
            column.getToggleVisibilityHandler()({
               target: {
                  checked: false,
               },
            });
         } else {
            if (
               !pinnedColumns?.left?.some((pinnedColumn) => pinnedColumn === column.id) &&
               !pinnedColumns?.right?.some((pinnedColumn) => pinnedColumn === column.id)
            ) {
               centerTableVisibility = true;
            }
            column.getToggleVisibilityHandler()({
               target: {
                  checked: true,
               },
            });
         }
      });

      setCenterTableVisibility(centerTableVisibility);
   }, [hiddenColumns, table, pinnedColumns]);

   useEffect(() => {
      if (expandRow) {
         const row = table.getRow(expandRow);

         if (!row?.getIsExpanded()) {
            row?.toggleExpanded(true);
         }
         onRowExpanded?.(undefined, row, table, name);
      }
   }, [expandRow, name, onRowExpanded, table]);

   // const centerTableInstance = useMemo(() => {
   const centerTableInstance = (
      <CustomTable
         name={name}
         key={'centerTable'}
         className={`centerTable ${className} ${classes.selectedRow}`}
         table={table}
         isSortable={sorting || isSortable}
         tableGroup={undefined}
         onSelect={onSelect}
         onScroll={onScroll}
         onDoubleClick={onDoubleClick}
         classes={classesProp}
         allowCellSelection={allowCellSelection}
         stickyHeader={stickyHeader}
      />
   );
   // }, [
   //    allowCellSelection,
   //    className,
   //    classes.selectedRow,
   //    classesProp,
   //    isSortable,
   //    name,
   //    onDoubleClick,
   //    onScroll,
   //    onSelect,
   //    sorting,
   //    stickyHeader,
   //    table,
   // ]);
   //
   if (hasPinning) {
      return (
         <Box
            className={`${className} ${classes.selectedRow}`}
            name='pinning frame'
            flexDirection='row'
            width={'100%'}
            height={'100%'}
            // overflow={'hidden'}
            display={'flex'}
            flexWrap={'nowrap'}
         >
            <CustomTable
               name={name}
               key={'left-table'}
               className={'left-table'}
               table={table}
               tableGroup={'left'}
               isSortable={sorting || isSortable}
               onDoubleClick={onDoubleClick}
               width={'max-content'}
               classes={classesProp}
               allowCellSelection={allowCellSelection}
               stickyHeader={stickyHeader}
            />
            {centerTableVisibility && (
               <CustomTable
                  name={name}
                  key={'center-table'}
                  className={'center-table'}
                  table={table}
                  tableGroup={'center'}
                  onSelect={onSelect}
                  onScroll={onScroll}
                  isSortable={sorting || isSortable}
                  onDoubleClick={onDoubleClick}
                  onContextMenu={onContextMenu}
                  classes={classesProp}
                  allowCellSelection={allowCellSelection}
                  stickyHeader={stickyHeader}
               />
            )}

            <CustomTable
               name={name}
               key={'right-table'}
               className={'right-table'}
               table={table}
               tableGroup={'right'}
               // onScroll={onScroll}
               isSortable={sorting || isSortable}
               onDoubleClick={onDoubleClick}
               width={'max-content'}
               classes={classesProp}
               allowCellSelection={allowCellSelection}
               stickyHeader={stickyHeader}
            />
         </Box>
      );
   } else {
      return centerTableInstance;
   }
}
