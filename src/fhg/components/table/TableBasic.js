import {TableFooter} from '@mui/material';
import {TableCell} from '@mui/material';
import {TableRow} from '@mui/material';
import {TableContainer} from '@mui/material';
import {TableHead} from '@mui/material';
import {TableBody} from '@mui/material';
import {Table as MuiTable} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {makeStyles} from '@mui/styles';
import {useState} from 'react';
import {useCallback} from 'react';
import {useEffect} from 'react';
import {useGlobalFilter} from 'react-table';
import {useExpanded} from 'react-table';
import {useTable} from 'react-table';
import {SCALE_APP} from '../../../Constants';

const EMPTY_DATA = [{}];

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         '& .MuiTypography-root': {
            display: 'inline-block',
         },

         cursor: 'pointer',
         textAlign: 'center',
         whiteSpace: 'nowrap',
         backgroundColor: theme.palette.background.paper2,
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         borderRight: `1px solid ${theme.palette.primary.stroke2} !important`,
      },
      rowStyle: {
         '& tr:nth-of-type(odd):not(.Mui-selected)': {
            backgroundColor: theme.palette.background.paper2,
         },
         '& tr:nth-of-type(even):not(.Mui-selected)': {
            backgroundColor: theme.palette.background.paper2,
         },
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         color: theme.palette.text.primary,
         borderRight: `1px solid ${theme.palette.primary.stroke} !important`,
      },
      cellFooterStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         backgroundColor: theme.palette.background.paper2,
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         borderRight: `1px solid ${theme.palette.primary.stroke2} !important`,
      },
   }),
   {name: 'TableBasicStyles'},
);

export default function TableBasic({
   columns: userColumns,
   data,
   getSubRows,
   classes: classesProp,
   className,
   searchFilter,
   onSelect,
   hasBorder = true,
   ...props
}) {
   const theme = useTheme();
   const classes = {...useStyles(), ...(classesProp || {})};
   const [selectedIndex, setSelectedIndex] = useState(-1);

   const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      footerGroups,
      rows,
      prepareRow,
      setGlobalFilter,

      state: {expanded, globalFilter},
   } = useTable(
      {
         columns: userColumns,
         data: data || EMPTY_DATA,
         getSubRows,
      },
      useGlobalFilter,
      useExpanded, // Use the useExpanded plugin hook
   );

   /**
    * Set the global filter from the search filter when the search filter changes.
    */
   useEffect(() => {
      setGlobalFilter(searchFilter);
   }, [searchFilter, setGlobalFilter]);

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowClick = useCallback(
      (row) => () => {
         setSelectedIndex(row.index);
         onSelect?.(row.original);
      },
      [onSelect],
   );

   return (
      <TableContainer style={{flex: '1 1'}} className={className}>
         <MuiTable {...getTableProps()} {...(props || {})}>
            <TableHead>
               {headerGroups.map((headerGroup) => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                     {headerGroup.headers.map((column) => (
                        <TableCell {...column.getHeaderProps({className: classes.headerStyle})} variant={'head'}>
                           {column.render('Header')}
                        </TableCell>
                     ))}
                  </TableRow>
               ))}
            </TableHead>
            <TableBody {...getTableBodyProps()} className={classes.rowStyle}>
               {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                     <TableRow {...row.getRowProps()} onClick={handleRowClick(row)} selected={i === selectedIndex}>
                        {row.cells.map((cell) => {
                           return (
                              <TableCell
                                 {...cell.getCellProps()}
                                 className={classes.cellStyle}
                                 variant={'body'}
                                 style={{
                                    ...(cell.column?.style || {}),
                                    minWidth: cell.column.minWidth || undefined,
                                    maxWidth: cell.column.maxWidth || undefined,
                                    width: cell.column.width || undefined,
                                    borderRight: !hasBorder ? undefined : `1px solid ${theme.palette.divider}`,
                                 }}
                              >
                                 {cell.render('Cell')}
                              </TableCell>
                           );
                        })}
                     </TableRow>
                  );
               })}
            </TableBody>

            {footerGroups?.length > 0 && (
               <TableFooter>
                  {footerGroups?.map((group) => (
                     <TableRow {...group.getFooterGroupProps()}>
                        {group.headers?.map((column, index) => (
                           <TableCell
                              {...column.getFooterProps()}
                              className={classes.cellFooterStyle}
                              style={{
                                 borderRight: hasBorder
                                    ? `1px solid ${theme.palette.divider}`
                                    : `1px solid ${theme.palette.divider}`,
                              }}
                           >
                              {column.render('Footer')}
                           </TableCell>
                        ))}
                     </TableRow>
                  ))}
               </TableFooter>
            )}
         </MuiTable>
      </TableContainer>
   );
}
