import {ChevronRight} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {Paper} from '@mui/material';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import {delay} from 'lodash';
import {useMemo} from 'react';
import {useCallback} from 'react';
import React, {useRef, useState} from 'react';
import {EDIT_ICON} from '../../../Constants';
import {DELETE_ICON} from '../../../Constants';
import useEffect from '../../hooks/useEffect';
import {getScrollParent} from '../../utils/Utils';
import ButtonFHG from '../ButtonFHG';
import ConfirmButton from '../ConfirmButton';
import * as PropTypes from 'prop-types';
import {InputCell} from './InputCell';
import makeStyles from '@mui/styles/makeStyles';
import {SCALE_APP} from '../../../Constants';

const CATEGORY_ENTER = 900;
const CATEGORY_EXIT = 400;

const useStyles = makeStyles(
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
         zIndex: 1,
      },
      root: {
         zIndex: `${theme.zIndex.drawer + 2} !important`,
      },
      popperStyle: {
         '&.MuiPopper-root': {
            zIndex: theme.zIndex.modal - 1,
         },
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

export default function CategoryCellV8(data) {
   const {onChange, onDelete, row, cell, tableName, isSelected, disabled} = data;
   const category = cell.row.original;
   const classes = useStyles();

   const [showToolbar, setShowToolbar] = useState(false);
   const showToolbarRef = useRef(false);
   const inToolbarRef = useRef(false);

   const scrollInitialized = useRef();
   const anchorRef = useRef();
   const popperRef = useRef();
   const timerRef = useRef();
   const openConfirmRef = useRef(false);

   const showPopper = useMemo(
      () => !disabled && showToolbar && !!anchorRef.current && category?.typeName,
      [disabled, showToolbar, category?.typeName],
   );

   const setShowPopper = useCallback((delayTime = CATEGORY_ENTER) => {
      showToolbarRef.current = true;
      if (delayTime > 0) {
         delay(() => {
            if (showToolbarRef.current) {
               setShowToolbar(true);
            }
         }, delayTime);
      } else {
         setShowToolbar(true);
      }
   }, []);

   const hidePopper = useCallback((delayTime = CATEGORY_EXIT) => {
      showToolbarRef.current = false;
      if (delayTime > 0) {
         delay(() => {
            if (!showToolbarRef.current && !inToolbarRef.current) {
               setShowToolbar(false);
            }
         }, delayTime);
      } else {
         setShowToolbar(false);
      }
   }, []);

   /**
    * Add the scroll and mouse move listeners, so that the toolbar is shown when hovering over cell.
    */
   useEffect(() => {
      function handleScroll() {
         hidePopper(0);
      }

      if (anchorRef && showPopper) {
         if (!scrollInitialized.current) {
            scrollInitialized.current = getScrollParent(anchorRef.current);
            scrollInitialized.current.addEventListener('scroll', handleScroll);
         }
      } else if (scrollInitialized.current) {
         scrollInitialized.current.removeEventListener('scroll', handleScroll);
         scrollInitialized.current = null;
      }
      return () => {
         if (scrollInitialized.current) {
            scrollInitialized.current.removeEventListener('scroll', handleScroll);
            scrollInitialized.current = null;
         }
      };
   }, [anchorRef, showPopper, hidePopper]);

   /**
    * When the new note button is clicked, turn on note editing.
    * @return {Promise<void>}
    */
   const handleAdd = useCallback(async () => {
      onChange?.(row, tableName);
      setShowToolbar(false);
   }, [onChange, row, tableName]);

   const handleClose = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setShowToolbar(false);
   };

   /**
    * Callback when the outer box has a keydown.
    * Close the toolbar whenever a key is pressed.
    */
   function handleBoxKeydown() {
      hidePopper();
   }

   const handleDelete = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      openConfirmRef.current = false;
      handleClose();
      onDelete?.(cell, tableName);
   };

   /**
    * Callback to stop showing the toolbar.
    */
   function handleEndShowToolbar() {
      hidePopper();
   }

   const startTimer = useCallback(() => {
      timerRef.current = delay(() => {
         if (!inToolbarRef.current) {
            hidePopper();
         } else {
            startTimer();
         }
      }, 4000);
   }, [hidePopper]);

   /**
    * Callback to start showing the toolbar.
    */
   const handleStartShowToolbar = useCallback(
      (event, delayTime = CATEGORY_ENTER) => {
         if (!isSelected) {
            if (!showToolbar || !timerRef.current) {
               setShowPopper(delayTime);
            }
         } else if (!showToolbar) {
            setShowPopper(delayTime);
         }
      },
      [showToolbar, isSelected, setShowPopper],
   );

   /**
    * Indicates if the cell is an entity category as opposed to a shared category.
    * @return {boolean} True if the category has an entity.
    */
   const isEntityCategory = () => {
      return cell?.row?.original.entityId;
   };

   const canExpand = row?.getCanExpand();
   return (
      <Stack
         key={'categoryCell ' + cell?.id}
         ref={anchorRef}
         style={{width: '100%', position: 'relative', height: '100%'}}
         flexDirection={'row'}
         gap={1}
         alignItems={'center'}
         width={'100%'}
         onKeyDown={handleBoxKeydown}
         onMouseEnter={handleStartShowToolbar}
         onMouseLeave={handleEndShowToolbar}
      >
         {canExpand ? (
            <ChevronRight
               onClick={row.getToggleExpandedHandler()}
               style={{
                  transform: row.getIsExpanded() ? 'rotate(90deg)' : 'rotate(0deg)',
                  cursor: 'pointer',
               }}
            />
         ) : null}
         {showPopper && (
            <Popper
               open={true}
               anchorEl={anchorRef.current}
               placement={'top-start'}
               className={classes.popperStyle}
               modifiers={[
                  {
                     name: 'offset',
                     options: {
                        offset: [anchorRef.current.clientWidth / 2 - (popperRef.current?.clientWidth || 188) / 2, 10],
                     },
                  },
               ]}
            >
               <Paper
                  ref={popperRef}
                  sx={{
                     p: 1,
                     bgcolor: 'background.default',
                     display: 'flex',
                     flex: '0 0',
                     flexDirection: 'row',
                     flexWrap: 'nowrap',
                  }}
                  spacing={1}
                  elevation={2}
                  onMouseEnter={() => (inToolbarRef.current = true)}
                  onMouseLeave={() => (inToolbarRef.current = false)}
               >
                  <ConfirmButton
                     edge='start'
                     color='error'
                     buttonLabelKey={'cashFlow.deleteCategory.label'}
                     messageKey={
                        canExpand ? 'cashFlow.confirmRemoveSubCategory.message' : 'cashFlow.confirmRemoveValue.message'
                     }
                     className={classes.deleteButtonStyle}
                     startIcon={<img alt='delete' src={DELETE_ICON} />}
                     onClickCapture={() => {
                        openConfirmRef.current = true;
                        if (timerRef.current) {
                           clearTimeout(timerRef.current);
                           timerRef.current = null;
                        }
                     }}
                     onCancel={() => {
                        openConfirmRef.current = false;
                        hidePopper();
                     }}
                     onConfirm={handleDelete}
                     values={{type: 'category', name: category?.typeName}}
                     size={'small'}
                     sx={{mr: 1}}
                     disabled={!isEntityCategory()}
                  />
                  {row.depth === 0 &&
                     !row.getCanExpand() &&
                     !(row.original.annual.actual > 0) &&
                     !(row.original.annual.expected > 0) && (
                        <ButtonFHG
                           edge='end'
                           labelKey={'subcategory.add.label'}
                           color='primary'
                           onClick={handleAdd}
                           startIcon={<img alt='edit' src={EDIT_ICON} />}
                           size={'small'}
                        />
                     )}
                  {row.depth === 0 &&
                     !row.getCanExpand() &&
                     (row.original.annual.actual > 0 || row.original.annual.expected > 0) && (
                        <ConfirmButton
                           edge='end'
                           titleKey={'cashFlow.addSubCategory.title'}
                           buttonLabelKey={'subcategory.add.label'}
                           messageKey={'cashFlow.confirmAddSubCategory.message'}
                           startIcon={<img alt='edit' src={EDIT_ICON} />}
                           onClickCapture={() => {
                              openConfirmRef.current = true;
                              if (timerRef.current) {
                                 clearTimeout(timerRef.current);
                                 timerRef.current = null;
                              }
                           }}
                           onCancel={() => {
                              openConfirmRef.current = false;
                              hidePopper();
                           }}
                           onConfirm={handleAdd}
                           size={'small'}
                           sx={{mr: 1}}
                        />
                     )}
               </Paper>
            </Popper>
         )}
         <Box ml={row.depth * 4} width={`calc(100% - ${row.depth * 4}px)`}>
            <InputCell {...data} />
         </Box>
      </Stack>
   );
}

CategoryCellV8.propTypes = {
   cellKey: PropTypes.any,
   selected: PropTypes.bool,
   editNote: PropTypes.bool,
   notes: PropTypes.any,
};
