import {ClickAwayListener} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {Tooltip} from '@mui/material';
import {TableFooter} from '@mui/material';
import {Popover} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import MaUTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import {Notes} from '@mui/icons-material';
import findIndex from 'lodash/findIndex';
import * as PropTypes from 'prop-types';
import React, {useState, useRef, Fragment, useCallback} from 'react';
import {useRecoilValue} from 'recoil';
import {atom} from 'recoil';
import {useRecoilState} from 'recoil';
import ButtonLF from '../../../components/ButtonLF';
import TextFieldLF from '../../../components/TextFieldLF';
import {useEffect} from 'react';
import {SCALE_APP} from '../../../Constants';
import {BORDER_RADIUS} from '../../../Constants';
// import useEffect from '../../hooks/useEffect';
import {resultOf} from '../../utils/Utils';
import Form from '../edit/Form';
import useEditData from '../edit/useEditData';
import Grid from '../Grid';
import TypographyFHG from '../Typography';
import {selectedCellState} from './TableNewUiFHG';

const LightTooltip = withStyles((theme) => ({
   tooltip: {
      backgroundColor: theme.palette.background.default,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 14,
      whiteSpace: 'pre-wrap',
   },
}))(Tooltip);

const useStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         '& .MuiTypography-root': {
            display: 'inline-block',
         },

         cursor: 'pointer',
         textAlign: 'center',
         whiteSpace: 'nowrap',
         backgroundColor: `${theme.palette.background.paper4} !important`,
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         borderRight: `1px solid ${theme.palette.primary.stroke2} !important`,
      },
      rowStyle: {
         '& tr:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.paper3,
         },
         '& tr:nth-of-type(even)': {
            backgroundColor: theme.palette.background.paper4,
         },
         '& tr:hover:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.paper3,
         },
         '& tr:hover:nth-of-type(even)': {
            backgroundColor: theme.palette.background.paper4,
         },
         '& td:hover': {
            backgroundColor: `${theme.palette.background.selectedRow} !important`,
         },
         '& td:focus-within': {
            backgroundColor: `${theme.palette.background.selectedRow} !important`,
         },
      },
      cellStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         '&.editable': {
            color: theme.palette.text.primary,
         },
         '&:hover.editable': {
            backgroundColor: theme.palette.background.transparent,
            cursor: 'pointer',
         },
         '&:hover:not(.editable)': {
            backgroundColor: theme.palette.background.transparent2,
            cursor: 'default',
         },
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         color: theme.palette.text.primary,
         borderRight: `1px solid ${theme.palette.primary.stroke} !important`,
      },
      cellFooterStyle: {
         whiteSpace: 'nowrap',
         padding: theme.spacing(1, 1, 0.5),
         fontSize: 18 * SCALE_APP,
         backgroundColor: theme.palette.background.paper4,
         borderBottom: `1px solid ${theme.palette.primary.stroke2}`,
         borderRight: `1px solid ${theme.palette.primary.stroke2} !important`,
      },
      selected: {
         backgroundColor: `#eeeeee !important`,
      },
      stickyExternal: {
         overflowX: 'auto',
         overflowY: 'unset',
         border: '1px solid rgba(194, 197, 200, 0.4)',
         borderRadius: '10px',

         backgroundColor: 'inherit',
      },
      stickyFrame: {
         overflow: 'unset',
         '& table': {
            height: 36,
            '& .MuiTableRow-head': {
               zIndex: theme.zIndex.drawer - 1,
            },
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
               // backgroundColor: 'white !important',
            },
            '& td:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: 'inherit',
               borderLeft: `1px solid ${theme.palette.divider}`,
               borderRight: `1px solid ${theme.palette.divider}`,
            },
            '&:not(.singleColumnMonth) td:nth-of-type(even):not(:first-child)': {
               borderRight: `1px solid ${theme.palette.divider}`,
            },
            '&:not(.singleColumnMonth) td:nth-of-type(odd):not(:first-child)': {
               borderRight: `1px solid ${theme.palette.divider}`,
            },
            '&.singleColumnMonth td:not(:first-child)': {
               borderRight: `1px solid ${theme.palette.divider}`,
            },
            '& th:first-child': {
               position: 'sticky',
               left: 0,
               zIndex: theme.zIndex.modal - 1,
               backgroundColor: theme.palette.table.header.primary,
               borderLeft: `1px solid ${theme.palette.divider}`,
               borderRight: `2px solid ${theme.palette.divider}`,
               borderTopLeftRadius: `${0} !important`,
            },
            '& th': {
               borderTop: `1px solid ${theme.palette.divider}`,
            },
            '& td': {
               borderTop: `1px solid ${theme.palette.divider}`,
            },
         },
      },
      buttonStyle: {
         padding: theme.spacing(0.5),
      },
   }),
   {name: 'TableContainerFHGStyles'},
);

const useNoteStyles = makeStyles(
   (theme) => ({
      editPaper: {
         padding: theme.spacing(1),
         backgroundColor: theme.palette.background.default,
         zIndex: `${theme.zIndex.drawer} !important`,
         width: 260 * SCALE_APP + 12,
      },
      popover: {
         pointerEvents: 'none',
      },
      noteIconStyle: {
         position: 'absolute',
         right: theme.spacing(-0.5),
         top: theme.spacing(-0.5),
         backgroundColor: '#C6D2B8',
         fontSize: 16 * SCALE_APP,
         zIndex: theme.zIndex.drawer,
      },
      root: {
         zIndex: `${theme.zIndex.drawer + 2} !important`,
      },
      formStyle: {
         maxHeight: '100%',
         overflow: 'visible',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
   }),
   {name: 'NotesStyles'},
);

export const noteEditStatus = atom({
   key: 'noteEditStatus',
   default: false,
});

function NoteCell({onChange, notes, selected, cellKey, anchorRef}) {
   const classes = useNoteStyles();
   const [open, setOpen] = useState();
   const [noteClicked, setNoteClicked] = useState(false);
   const [isEditNote, setIsEditNote] = useRecoilState(noteEditStatus);

   const [, /*editValues*/ handleChange, {getValue, setDefaultValues}] = useEditData(notes);

   useEffect(() => {
      setDefaultValues({notes});
   }, [notes, setDefaultValues]);

   const handleClose = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setIsEditNote(false);
      handlePopoverClose(event, undefined, false);
   };

   const handleSave = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      handleClose();
      onChange?.(getValue('notes'));
   };

   const handlePopoverClose = (event, reason, isEditNoteParam = isEditNote) => {
      if (!isEditNoteParam) {
         setOpen(undefined);
         setNoteClicked(false);
         setIsEditNote(false);
      }
   };

   const handleNotesClick = (cellKey) => () => {
      if (!isEditNote) {
         setOpen(cellKey);
         setNoteClicked(true);
      }
   };

   const handleHoverClose = () => {
      if (noteClicked && !isEditNote) {
         setOpen(undefined);
         setNoteClicked(false);
      }
   };

   const handleHoverClose1 = () => {
      if (noteClicked && !isEditNote) {
         setNoteClicked(false);
         setOpen(undefined);
      }
   };

   const handleKeydown = (event) => {
      if (event?.key === 'Escape') {
         handleClose(event);
      }
   };

   /**
    * Open the note edit. Only open if listening for the onChange.
    */
   const handleOpenEdit = () => {
      if (onChange) {
         setIsEditNote(true);
      }
   };

   const handleDelete = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      handleClose();
      onChange?.(null);
   };

   return (
      <div style={{width: '100%', position: 'relative', height: 1}}>
         {notes && (
            <ClickAwayListener onClickAway={handleHoverClose1} disableReactTree={true}>
               <LightTooltip title={!isEditNote && getValue('notes')}>
                  <Notes
                     onClick={handleNotesClick(cellKey)}
                     className={classes.noteIconStyle}
                     onDoubleClick={handleOpenEdit}
                  />
               </LightTooltip>
            </ClickAwayListener>
         )}
         {selected && isEditNote && (
            <Popover
               // className={!noteClicked ? classes.popover : undefined}
               classes={{paper: classes.editPaper, root: classes.root}}
               open={selected && isEditNote}
               anchorEl={selected && isEditNote && anchorRef.current}
               anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
               transformOrigin={{vertical: 'top', horizontal: 'left'}}
               onClose={handlePopoverClose}
               disableRestoreFocus
               hideBackdrop
            >
               {isEditNote && onChange ? (
                  <Grid container>
                     <Form onSubmit={handleSave} className={classes.formStyle}>
                        <TextFieldLF
                           name={'notes'}
                           autoFocus
                           onChange={handleChange}
                           onKeyDown={handleKeydown}
                           value={getValue('notes')}
                           maxRows={4}
                           minRows={1}
                           multiline
                        />
                        <Grid container justifyContent={'space-between'}>
                           <Grid item>
                              <ButtonLF
                                 labelKey={'save.label'}
                                 onClickCapture={handleSave}
                                 onClick={handleSave}
                                 onMouseDown={handleSave}
                                 type={'submit'}
                                 className={classes.buttonStyle}
                              />
                              <ButtonLF
                                 labelKey={'cancel.button'}
                                 onClickCapture={handleClose}
                                 onClick={handleClose}
                                 onMouseDown={handleClose}
                                 className={classes.buttonStyle}
                              />
                           </Grid>
                           <Grid item>
                              <ButtonLF
                                 labelKey={'delete.button'}
                                 onClickCapture={handleDelete}
                                 onClick={handleDelete}
                                 onMouseDown={handleDelete}
                                 disabled={!getValue('notes')}
                                 className={classes.buttonStyle}
                              />
                           </Grid>
                        </Grid>
                     </Form>
                  </Grid>
               ) : (
                  getValue('notes')
               )}
            </Popover>
         )}
      </div>
   );
}

NoteCell.propTypes = {
   cellKey: PropTypes.any,
   selected: PropTypes.bool,
   editNote: PropTypes.bool,
   notes: PropTypes.any,
};

/**
 * The table component that handles searching (filtering) and selection.
 *
 * Reviewed:
 *
 * @param titleKey The message key for the title.
 * @param onSelect Callback when an item is selected.
 * @param stickyHeader Indicates if the header of the table is sticky.
 * @return {*}
 * @constructor
 */
export default function TableContainerNewUiFHG({
   name,
   rows,
   prepareRow,
   headerGroups,
   footerGroups,
   getTableProps,
   onSelect,
   selectId,
   allowCellSelection = false,
   stickyHeader = true,
   stickyLeftColumn = false,
   classes: classesProp,
   emptyTableMessageKey,
   hasFooter,
   hasBorder = false,
   onChangeNotes,
   onScroll,
   getCellProps,
   onDoubleClick,
   onContextMenu,
   stickyExternal,
   noHeader,
   isSortable = true,
}) {
   const theme = useTheme();
   const classes = {...useStyles(), ...(classesProp || {})};
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const [cellSelected, setCellSelected] = useRecoilState(selectedCellState);
   const isEditNote = useRecoilValue(noteEditStatus);

   const selectRef = useRef();
   const selectCellRef = useRef();

   useEffect(() => {
      if (selectId && rows?.length > 0) {
         const index = findIndex(rows, (row) => row?.original?.key === selectId);

         if (index !== selectedIndex) {
            setSelectedIndex(index);
         }
      }
   }, [selectId, rows]);

   /**
    * Select the row on click.
    * @param row The row clicked to be selected.
    * @return {function(...[*]=)}
    */
   const handleRowClick = useCallback(
      (row) => () => {
         if (!allowCellSelection && !isEditNote) {
            setSelectedIndex(row.index);
            onSelect && onSelect(row.original);
         }
      },
      [allowCellSelection, isEditNote, onSelect],
   );

   const handleSelectCell = React.useCallback(
      (cellKey, rowIndex, columnIndex, cell) => () => {
         if (allowCellSelection && !isEditNote) {
            setCellSelected({tableName: name, rowIndex, columnIndex});

            onSelect?.(undefined, cellKey, rowIndex, columnIndex, cell);
         }
      },
      [allowCellSelection, isEditNote, name, onSelect, setCellSelected],
   );

   return (
      <TableContainer
         name={name + 'Container'}
         className={`table-container ${stickyLeftColumn ? classes.stickyFrame : stickyExternal ? classes.stickyExternal : undefined}`}
         onScroll={onScroll}
         style={{
            minWidth: '100%',
            width: '100%',
         }}
      >
         <MaUTable
            {...getTableProps({style: {borderCollapse: stickyHeader ? 'separate' : 'collapse'}})}
            stickyHeader={stickyHeader}
         >
            {!noHeader && (
               <TableHead classes={{root: classes.tableHeadRoot}}>
                  {headerGroups.map((headerGroup) => (
                     <TableRow {...headerGroup.getHeaderGroupProps({className: classes.tableHeadStyle})}>
                        {headerGroup.headers.map((column, index) => (
                           <TableCell
                              {...(column.id === 'selection'
                                 ? column.getHeaderProps({className: classes.headerStyle})
                                 : column.getHeaderProps(
                                      column.getSortByToggleProps({className: classes.headerStyle}),
                                   ))}
                              style={{
                                 fontWeight: !column.depth ? 600 : 400,
                                 borderTopLeftRadius: index === 0 && column.depth === 0 ? BORDER_RADIUS : 0,
                                 borderTopRightRadius:
                                    index === headerGroup.headers?.length - 1 && column.depth === 0 ? BORDER_RADIUS : 0,
                                 textAlign: column.headerTextAlign,
                                 // minWidth: column?.minWidth || undefined,
                                 // maxWidth: column?.maxWidth || undefined,

                                 borderRight: !hasBorder
                                    ? index < headerGroup.headers?.length - 1
                                       ? `1px solid ${theme.palette.divider}`
                                       : undefined
                                    : !column.depth || index % 2 === 0
                                      ? `2px solid ${theme.palette.divider}`
                                      : `1px solid ${theme.palette.divider}`,
                              }}
                           >
                              {/*<div>{column?.canFilter ? column?.render('Filter') : null}</div>*/}
                              {isSortable && column.id !== 'selection' ? (
                                 <TableSortLabel
                                    active={column.isSorted}
                                    // react-table has an unsorted state which is not treated here
                                    direction={column.isSortedDesc ? 'desc' : 'asc'}
                                 >
                                    {column.render('Header')}
                                 </TableSortLabel>
                              ) : (
                                 column.render('Header')
                              )}
                           </TableCell>
                        ))}
                     </TableRow>
                  ))}
               </TableHead>
            )}
            <TableBody className={classes.rowStyle}>
               {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                     <TableRow
                        {...row.getRowProps()}
                        onClick={!isEditNote ? handleRowClick(row) : undefined}
                        hover={!allowCellSelection}
                        onDoubleClick={(event) => onDoubleClick?.(event, row)}
                        onContextMenu={(event) => onContextMenu?.(event, row)}
                        selected={!allowCellSelection && i === selectedIndex}
                        ref={i === selectedIndex ? selectRef : undefined}
                     >
                        {row.cells.map((cell, index) => {
                           const notes =
                              cell.column.field === 'actual'
                                 ? cell.row.original[cell.column?.parent?.id]?.noteActual
                                 : cell.row.original[cell.column?.parent?.id]?.noteExpected;
                           const cellProps = cell.getCellProps();
                           const isSelected =
                              cellSelected?.tableName === name &&
                              cellSelected?.rowIndex === i &&
                              cellSelected?.columnIndex === cell.column?.___index;
                           const isEditable = resultOf(cell.column.isEditable, cell);
                           return (
                              <TableCell
                                 {...cellProps}
                                 {...cell.column.tableCellProps}
                                 className={`${classes.cellStyle} ${isSelected ? classes.selected : ''} ${
                                    isEditable ? 'editable' : ''
                                 }`}
                                 ref={isSelected ? selectCellRef : undefined}
                                 style={{
                                    borderRight: !hasBorder
                                       ? index < row.cells.length - 1
                                          ? `1px solid ${theme.palette.divider}`
                                          : undefined
                                       : !cell.column.depth || index % 2 === 0
                                         ? `2px solid ${theme.palette.divider}`
                                         : `1px solid ${theme.palette.divider}`,
                                    fontWeight: cell.column.bold ? 'bold' : undefined,
                                    minWidth: cell.column.minWidth || undefined,
                                    maxWidth: cell.column.maxWidth || undefined,
                                    ...(cell.column.style || {}),
                                    ...getCellProps(cell),
                                 }}
                                 onClick={
                                    !isEditNote
                                       ? handleSelectCell(cellProps.key, i, cell.column?.___index, cell)
                                       : undefined
                                 }
                              >
                                 {(notes || isEditNote) && (
                                    <NoteCell
                                       key={'popover' + cellProps.key}
                                       cellKey={cellProps.key}
                                       selected={isSelected}
                                       anchorRef={selectCellRef}
                                       notes={notes}
                                       onChange={onChangeNotes}
                                    />
                                 )}
                                 {cell.render('Cell')}
                              </TableCell>
                           );
                        })}
                     </TableRow>
                  );
               })}
            </TableBody>

            {hasFooter && (
               <TableFooter>
                  {footerGroups?.map((group, groupIndex) => {
                     if (groupIndex <= 0) {
                        return (
                           <Fragment key={'frag ' + groupIndex}>
                              <TableRow
                                 {...group.getFooterGroupProps()}
                                 key={'footer row ' + groupIndex + ' ' + group.getFooterGroupProps()?.key}
                              >
                                 {group.headers.map((column, index) => {
                                    if (column.Footer) {
                                       return (
                                          <TableCell
                                             {...column.getFooterProps()}
                                             {...resultOf(column.tableCellProps, undefined, {})}
                                             className={classes.cellFooterStyle}
                                             style={{
                                                fontWeight: column.bold ? 'bold' : undefined,
                                                borderBottomLeftRadius: index === 0 ? BORDER_RADIUS : undefined,
                                                borderBottomRightRadius:
                                                   index === group.headers?.length - 1 ? BORDER_RADIUS : undefined,

                                                borderRight: !hasBorder
                                                   ? index < group.headers.length - 1
                                                      ? `1px solid ${theme.palette.divider}`
                                                      : undefined
                                                   : index % 2 === 0
                                                     ? `2px solid ${theme.palette.divider}`
                                                     : `1px solid ${theme.palette.divider}`,
                                             }}
                                          >
                                             {column.render('Footer')}
                                          </TableCell>
                                       );
                                    } else {
                                       return null;
                                    }
                                 })}
                              </TableRow>
                              <TableRow
                                 {...group.getFooterGroupProps()}
                                 key={'footer2 row ' + groupIndex + ' ' + group.getFooterGroupProps()?.key}
                              >
                                 {group.headers.map((column, columnIndex) => {
                                    if (column.Footer2) {
                                       return (
                                          <TableCell
                                             {...column.getFooterProps()}
                                             {...resultOf(column.tableCellProps, undefined, {})}
                                             className={classes.cellFooterStyle}
                                             style={{
                                                fontWeight: column.bold ? 'bold' : undefined,
                                                borderRight:
                                                   hasBorder && columnIndex % 2 === 0
                                                      ? `2px solid ${theme.palette.divider}`
                                                      : `1px solid ${theme.palette.divider}`,
                                             }}
                                          >
                                             {column.render('Footer2')}
                                          </TableCell>
                                       );
                                    } else {
                                       return null;
                                    }
                                 })}
                              </TableRow>
                              <TableRow
                                 {...group.getFooterGroupProps()}
                                 key={'footer3 row ' + groupIndex + ' ' + group.getFooterGroupProps()?.key}
                              >
                                 {group.headers.map((column, columnIndex) => {
                                    if (column.Footer3) {
                                       return (
                                          <TableCell
                                             {...column.getFooterProps()}
                                             {...resultOf(column.tableCellProps, undefined, {})}
                                             className={classes.cellFooterStyle}
                                             style={{
                                                fontWeight: column.bold ? 'bold' : undefined,
                                                borderRight:
                                                   hasBorder && columnIndex % 2 === 0
                                                      ? `2px solid ${theme.palette.divider}`
                                                      : `1px solid ${theme.palette.divider}`,
                                             }}
                                          >
                                             {column.render('Footer3')}
                                          </TableCell>
                                       );
                                    } else {
                                       return null;
                                    }
                                 })}
                              </TableRow>
                           </Fragment>
                        );
                     } else {
                        return null;
                     }
                  })}
               </TableFooter>
            )}
         </MaUTable>
         {!(rows?.length > 0) && emptyTableMessageKey && (
            <Grid container justifyContent={'center'} style={{margin: theme.spacing(2)}}>
               <TypographyFHG id={emptyTableMessageKey} color='text.primary' />
            </Grid>
         )}
      </TableContainer>
   );
}
