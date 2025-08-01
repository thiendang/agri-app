import {Stack} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {findIndex} from 'lodash';
import {filter} from 'lodash';
import sumBy from 'lodash/sumBy';
import numberFormatter from 'number-formatter';
import {useMemo} from 'react';
import React from 'react';
import {useGlobalFilter, useSortBy, useTable} from 'react-table';
import {atom} from 'recoil';
import {BORDER_RADIUS_10, BORDER_RADIUS_16, DARK_MODE_COLORS} from '../../../Constants';
import {CURRENCY_FORMAT} from '../../../Constants';
import {useEffect} from 'react';
import Grid from '../Grid';
import TypographyFHG from '../Typography';
import StaticCell from './StaticCell';
import TableContainerNewUiFHG from './TableContainerNewUiFHG';
import TableSearchToolbar from './TableSearchToolbar';

const EMPTY_DATA = [{}];

export const editCellState = atom({
   key: 'editCellState',
   default: false,
});

export const selectedCellState = atom({
   key: 'selectedCellState',
   default: undefined,
});

const columnHasFooter = (column) => {
   if (column.Footer) {
      return true;
   } else if (column.columns?.length > 0) {
      for (const columnItem of column.columns) {
         if (columnHasFooter(columnItem)) {
            return true;
         }
      }
      return false;
   } else {
      return false;
   }
};

const useStyles = makeStyles(
   (theme) => ({
      root: {
         borderRadius: BORDER_RADIUS_16,
         backgroundColor: theme.palette.background.paper3,
         // border: `1px solid rgba(194, 197, 200, 0.4)`,
         padding: theme.spacing(0, 3, 3),
      },
      noPanelRoot: {
         padding: theme.spacing(1),
      },
      totalFooter: {
         display: 'flex',
         cursor: 'default',
      },
      '&:hover .MuiTableBody-root': {
         backgroundColor: 'unset !important',
      },
   }),
   {name: 'TableNewUiFhgStyles'},
);

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
   minWidth: 30,
   maxWidth: 400,
   Cell: StaticCell,
};

const defaultPropGetter = () => ({});
const EMPTY_OBJECT = {};

/**
 * The table component that handles searching (filtering) and selection.
 *
 * Reviewed: 4/14/20
 *
 * @param titleKey The message key for the title.
 * @param title The title text.
 * @param columns The columns for the table.
 * @param data The data for the table.
 * @param updateMyData  Callback when a cell is edited.
 * @param skipPageReset Indicates that the page reset should be skipped.
 * @param onSelect Callback when an item is selected.
 * @param selectId The current selection item ID.
 * @param allowCellSelection Indicates if cells can be selected.
 * @param searchFilter The search text to filter by within the table.
 * @param allowSearch IGNORED. No longer in use.
 * @param stickyHeader Indicates if the header of the table is sticky.
 * @param stickyExternal Indicates if there is a sticky external component. Makes all the overflow unset.
 * @param stickyLeftColumn Indicates if the left column is sticky.
 * @param classesProp The classes to override the table classes.
 * @param emptyTableMessageKey Message Key for message displayed when the table is empty
 * @param hasBorder Indicates if the table has a shadow
 * @param totalPath Path in the row.values to the total value to display.
 * @param onChangeNotes Callback when the notes change.
 * @param name Name of the table.
 * @param isEditOnSingleClick Indicates if a single click edits or double click.
 * @param onScroll Callback when the TableContainer scrolls.
 * @param getCellProps Gets extra properties for the cells not specified in the column.
 * @param onDoubleClick Callback when the table row is double-clicked.
 * @param onContextMenu Callback when the table row has a content menu request.
 * @param hasOuterPanel True if the table needs to have an outer panel. False if the outer panel is supplied externally.
 * @param sx The sx param for the outer frame Stack.
 * @param children The children components. The children of the table displayed in the search bar.
 * @param noHeader
 * @param rerender
 * @param isSortable Indicates if the table data can be sorted.
 * @return {*}
 * @constructor
 */
export default function TableNewUiFHG({
   titleKey,
   title,
   columns,
   data,
   updateMyData,
   skipPageReset,
   onSelect,
   selectId,
   allowCellSelection = false,
   searchFilter,
   allowSearch,
   stickyHeader = true,
   stickyExternal = true,
   stickyLeftColumn = false,
   classes: classesProp = EMPTY_OBJECT,
   emptyTableMessageKey,
   hasBorder = false,
   totalPath,
   onChangeNotes,
   name,
   isEditOnSingleClick = false,
   onScroll,
   getCellProps = defaultPropGetter,
   onDoubleClick,
   onContextMenu,
   hasOuterPanel = true,
   sx,
   children,
   noHeader,
   rerender,
   isSortable = true,
   className: classNameProp = '',
   ...props
}) {
   const classes = {...useStyles(), ...classesProp};

   // Use the state and functions returned from useTable to build your UI
   const {
      getTableProps,
      headerGroups,
      footerGroups,
      prepareRow,
      rows,
      preGlobalFilteredRows,
      setGlobalFilter,
      setHiddenColumns,
      state: {globalFilter},
   } = useTable(
      {
         columns,
         data: data || EMPTY_DATA,
         defaultColumn: defaultColumn,
         autoResetPage: !skipPageReset,
         // updateMyData isn't part of the API, but
         // anything we put into these options will
         // automatically be available on the instance.
         // That way we can call this function from our
         // cell renderer!
         updateMyData,
         isEditOnSingleClick,
         tableName: name,
      },
      useGlobalFilter,
      useSortBy,
   );

   const totalTable = useMemo(() => {
      return totalPath && rows
         ? sumBy(rows, (row) => {
              return row?.values?.[totalPath];
           })
         : 0;
   }, [rows, totalPath]);

   const hasFooter = useMemo(() => {
      return findIndex(columns, columnHasFooter) >= 0;
   }, [columns]);

   useEffect(() => {
      const hiddenColumns = filter(columns, (column) => column.show === false).map((column) => column.id);
      setHiddenColumns(hiddenColumns);
   }, [columns, setHiddenColumns]);

   /**
    * Set the global filter from the search filter when the search filter changes.
    */
   useEffect(() => {
      if (searchFilter !== undefined) {
         setGlobalFilter(searchFilter);
      }
   }, [searchFilter, setGlobalFilter]);

   return (
      <Stack
         name={'TableNewFHG Root Grid'}
         direction={'column'}
         flexWrap={'nowrap'}
         className={`${classNameProp} ${hasOuterPanel ? classes.root : classes.noPanelRoot}`}
         overflowY={stickyExternal ? 'unset' : 'hidden'}
         overflowX={'hidden'}
         sx={sx}
         {...props}
      >
         {(title || titleKey || children) && (
            <TableSearchToolbar
               titleKey={titleKey}
               title={title}
               allowSearch={false}
               preGlobalFilteredRows={preGlobalFilteredRows}
               setGlobalFilter={setGlobalFilter}
               globalFilter={globalFilter}
            >
               {children}
            </TableSearchToolbar>
         )}
         <TableContainerNewUiFHG
            key={'table ' + name + ' ' + searchFilter + rerender}
            name={name}
            headerGroups={headerGroups}
            footerGroups={footerGroups}
            prepareRow={prepareRow}
            getTableProps={getTableProps}
            rows={rows}
            onSelect={onSelect}
            selectId={selectId}
            allowCellSelection={allowCellSelection}
            stickyHeader={stickyHeader}
            classes={classesProp}
            emptyTableMessageKey={emptyTableMessageKey}
            hasFooter={hasFooter}
            hasBorder={hasBorder}
            onChangeNotes={onChangeNotes}
            getCellProps={getCellProps}
            stickyLeftColumn={stickyLeftColumn}
            onScroll={onScroll}
            stickyExternal={stickyExternal}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            noHeader={noHeader}
            isSortable={isSortable}
         />
         {totalPath && (
            <Grid
               item
               container
               resizable={false}
               className={classes.totalFooter}
               justifyContent={'flex-end'}
               overflowY={stickyExternal ? 'unset' : 'hidden'}
               overflowX={'hidden'}
            >
               <Grid item style={{position: 'sticky', right: 0}}>
                  <TypographyFHG
                     variant={'subtitle1'}
                     color={'textSecondary'}
                     style={{
                        textAlign: 'right',
                        paddingTop: 8,
                        paddingRight: 16,
                        fontSize: 18,
                        fontWeight: 'bold',
                        height: 36,
                     }}
                  >
                     Total {numberFormatter(CURRENCY_FORMAT, totalTable)}
                  </TypographyFHG>
               </Grid>
            </Grid>
         )}
      </Stack>
   );
}
