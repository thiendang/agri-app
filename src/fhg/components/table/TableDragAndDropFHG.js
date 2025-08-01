import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import findIndex from 'lodash/findIndex';
import {Fragment} from 'react';
import {useCallback} from 'react';
import {useMemo} from 'react';
import React, {useState, useEffect, useRef} from 'react';
import {useGlobalFilter, useSortBy, useTable} from 'react-table';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import Grid from '../Grid';
import TypographyFHG from '../Typography';
import DragCell from './DragCell';
import TableSearchToolbar from './TableSearchToolbar';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         borderRadius: BORDER_RADIUS_10,
         background: theme.palette.background.paper3,
         border: '1px solid rgba(194, 197, 200, 0.4)',
         padding: theme.spacing(3),
         '& .MuiTypography-body2': {
            color: theme.palette.text.primary,
         },
      },
      noPanelRoot: {
         padding: theme.spacing(1),
      },
      headerStyle: {
         cursor: 'pointer',
         textAlign: 'center',
         backgroundColor: theme.palette.background.paper2,
         borderBottom: `${theme.palette.mode === 'dark' ? 0 : 1}px solid ${theme.palette.secondary.light1} !important`,
         borderRight: `1px solid ${theme.palette.primary.stroke} !important`,
      },
      headerRowStyle: {
         '& p': {
            display: 'inline-block',
         },
      },
      rowStyle: {
         '& tr:nth-of-type(odd):not(.Mui-selected)': {
            backgroundColor: '#fafafa',
         },
         '& tr:nth-of-type(even):not(.Mui-selected)': {
            backgroundColor: 'white',
         },
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         '&.editable': {
            color: 'black',
         },
         '&:hover.editable': {
            backgroundColor: '#f0f6e9',
            cursor: 'pointer',
         },
         '&:hover:not(.editable)': {
            backgroundColor: '#f0f0f0',
            cursor: 'default',
         },
      },
      cellFooterStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         borderRight: '2px solid rgba(0, 0, 0, 0.12)',
      },
      selected: {
         backgroundColor: `${theme.palette.action.selected} !important`,
      },
      stickyExternal: {
         overflow: 'unset',
         backgroundColor: 'inherit',
      },
      stickyFrame: {
         overflow: 'unset',
         '& table': {
            '& thead > tr': {
               position: 'sticky',
               left: 0,
               top: 0,
            },
            '& tbody > tr, tfoot > tr': {
               position: 'sticky',
               left: 0,
            },
            '& tfoot > tr > td': {
               backgroundColor: 'white !important',
            },
            '& td:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
            },
            '& th:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
            },
         },
      },
   }),
   {name: 'TableDragAndDropFHGStyles'},
);

/**
 * The table component that handles dragging and dropping.
 *
 * Reviewed:
 *
 * @param titleKey The message key for the title.
 * @param title The title for the table.
 * @param columns The columns for the table.
 * @param data The data for the table.
 * @param updateMyData  Callback when a cell is edited.
 * @param skipPageReset Indicates that the page reset should be skipped.
 * @param onSelect Callback when an item is selected.
 * @param selectId The current selection item ID.
 * @param searchFilter The current search filter for external search.
 * @param allowSearch Indicates if the search header bar is shown
 * @param stickyHeader Indicates if the header of the table is sticky.
 * @param hasOuterPanel True if the table needs to have an outer panel. False if the outer panel is supplied externally.
 * @param classesProp Classes to be added to the classed for the table.
 * @param onDoubleClick Callback when the table row is double-clicked.
 * @param globalFilterParam The search text.
 * @param emptyTableMessageKey The message key for an empty table.
 * @param isLoading Indicates if the data for the table is still loading.
 * @param onContextMenu Callback when the table row has a content menu request.
 * @param onKeyDown Callback when a key is pressed with focus within the table outer frame.
 * @param refreshTime Timestomp that updates for force a refresh of the table.
 * @param children The children components for the header. NOTE: will not display if allowSearch is false.
 * @return {*}
 * @constructor
 */
export default function TableDragAndDropFHG({
   titleKey,
   title,
   columns,
   data = [{}],
   updateMyData,
   skipPageReset,
   onSelect,
   selectId,
   searchFilter,
   allowSearch,
   stickyHeader,
   hasOuterPanel = true,
   classes: classesProp,
   onDoubleClick,
   globalFilter: globalFilterParam,
   emptyTableMessageKey,
   isLoading,
   onContextMenu,
   onKeyDown,
   refreshTime,
   isDragDisabled = false,
   children,
}) {
   // Use the state and functions returned from useTable to build your UI
   const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      rows,
      preGlobalFilteredRows,
      setGlobalFilter,
      state: {globalFilter},
   } = useTable(
      {
         columns,
         data,
         globalFilter: globalFilterParam,
         autoResetPage: !skipPageReset,
         // updateMyData isn't part of the API, but
         // anything we put into these options will
         // automatically be available on the instance.
         // That way we can call this function from our
         // cell renderer!
         updateMyData,
      },
      useGlobalFilter,
      useSortBy,
   );
   const theme = useTheme();

   const [selectedIndex, setSelectedIndex] = useState(-1);

   const selectRef = useRef();
   const classes = {...useStyles(), ...(classesProp || {})};

   useEffect(() => {
      if (selectId && rows?.length > 0) {
         const index = findIndex(rows, (row) => row?.original?.key === selectId);

         if (index !== selectedIndex) {
            setSelectedIndex(index);
         }
      }
   }, [selectId, rows]);

   /**
    * Set the global filter from the search filter when the search filter changes.
    */
   useEffect(() => {
      if (searchFilter !== undefined) {
         setGlobalFilter(searchFilter);
      }
   }, [searchFilter, setGlobalFilter]);

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowClick = useCallback(
      (row) => (event) => {
         setSelectedIndex(row.index);
         onSelect && onSelect(row.original, row.index, event);
      },
      [onSelect],
   );

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowDoubleClick = useCallback(
      (row) => (event) => {
         onDoubleClick?.(row.original, row.index, event);
      },
      [onDoubleClick],
   );

   const toolbar = useMemo(() => {
      return (
         <TableSearchToolbar
            titleKey={titleKey}
            title={title}
            preGlobalFilteredRows={preGlobalFilteredRows}
            setGlobalFilter={setGlobalFilter}
            globalFilter={globalFilter}
         >
            {children}
         </TableSearchToolbar>
      );
   }, [children, globalFilter, preGlobalFilteredRows, setGlobalFilter, title, titleKey]);

   return (
      <Box
         name={'TableDragAndDropFHG Root Grid'}
         direction={'column'}
         height={'100%'}
         width={'100%'}
         wrap={'nowrap'}
         className={hasOuterPanel ? classes.root : classes.noPanelRoot}
         overflow={'hidden'}
         onKeyDown={onKeyDown}
      >
         {allowSearch && toolbar}
         <TableContainer onKeyDown={onKeyDown} style={{overflow: 'auto', height: '100%'}}>
            <Table {...getTableProps()} stickyHeader={stickyHeader}>
               <TableHead>
                  {headerGroups.map((headerGroup) => (
                     <TableRow {...headerGroup.getHeaderGroupProps({className: classes.headerRowStyle})}>
                        {headerGroup.headers.map((column, index) => (
                           <Fragment key={'hg ' + index}>
                              {column.show !== false && (
                                 <TableCell
                                    {...(column.id === 'selection'
                                       ? column.getHeaderProps({className: classes.headerStyle})
                                       : column.getHeaderProps(
                                            column.getSortByToggleProps({className: classes.headerStyle}),
                                         ))}
                                    style={{
                                       fontWeight: !column.depth ? 600 : 400,
                                       borderRight: `1px solid ${theme.palette.divider}`,
                                    }}
                                 >
                                    {column.render('Header')}
                                    {column.id !== 'selection' ? (
                                       <TableSortLabel
                                          active={column.isSorted}
                                          // react-table has an unsorted state which is not treated here
                                          direction={column.isSortedDesc ? 'desc' : 'asc'}
                                       />
                                    ) : null}
                                 </TableCell>
                              )}
                           </Fragment>
                        ))}
                     </TableRow>
                  ))}
               </TableHead>
               <TableBody {...getTableBodyProps()} className={classes.rowStyle}>
                  {rows.map((row, i) => {
                     prepareRow(row);
                     const rowProps = row.getRowProps();
                     const rowId = rowProps.key + row?.original?.key + refreshTime;
                     return (
                        <TableRow
                           {...row.getRowProps()}
                           {...rowProps}
                           key={rowId}
                           id={rowId}
                           onClick={handleRowClick(row)}
                           onDoubleClick={onDoubleClick ? handleRowDoubleClick(row) : undefined}
                           onContextMenu={(event) => onContextMenu?.(event, row)}
                           selected={i === selectedIndex}
                           ref={i === selectedIndex ? selectRef : undefined}
                        >
                           {row.cells.map((cell) => {
                              if (cell?.column?.show !== false) {
                                 if (cell?.column?.isDraggable && !isDragDisabled) {
                                    const cellProps = cell.getCellProps();

                                    return (
                                       <DragCell
                                          cell={cell}
                                          row={row}
                                          {...cellProps}
                                          key={rowId + cellProps.key}
                                          id={rowId + cellProps.key}
                                       />
                                    );
                                 } else {
                                    return (
                                       <TableCell
                                          {...cell.getCellProps()}
                                          style={{
                                             whiteSpace: 'nowrap',
                                             padding: theme.spacing(0.75, 2),
                                             fontSize: 18 * SCALE_APP,
                                          }}
                                       >
                                          {cell.render('Cell')}
                                       </TableCell>
                                    );
                                 }
                              }
                           })}
                        </TableRow>
                     );
                  })}
               </TableBody>
            </Table>
            {rows?.length <= 0 && !isLoading && emptyTableMessageKey && (
               <Grid container justifyContent={'center'} style={{margin: theme.spacing(2)}}>
                  <TypographyFHG
                     variant='body2'
                     id={emptyTableMessageKey}
                     color={'textPrimary'}
                     style={{marginLeft: 'auto', marginRight: 'auto'}}
                  />
               </Grid>
            )}
         </TableContainer>
      </Box>
   );
}
