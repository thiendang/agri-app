import {Menu, Tooltip} from '@mui/material';
import {Divider} from '@mui/material';
import {CardHeader} from '@mui/material';
import {CardActions} from '@mui/material';
import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import {styled} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import {lighten} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {ArrowForward} from '@mui/icons-material';
import {ArrowBack} from '@mui/icons-material';
import {AddCircle} from '@mui/icons-material';
import {Delete} from '@mui/icons-material';
import {MoreVert} from '@mui/icons-material';
import {Edit} from '@mui/icons-material';
import {ExpandMore as ExpandMoreIcon} from '@mui/icons-material';
import {startsWith} from 'lodash';
import {indexOf} from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import {useCallback} from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import {useLayoutEffect} from 'react';
import {useRef} from 'react';
import React from 'react';
import {useRecoilState} from 'recoil';
import {atom} from 'recoil';
import {DARK_MODE_COLORS, SCALE_APP} from '../../../Constants';
import {PASSIVE_ROOT_ID} from '../../../Constants';
import {ACTIVE_ROOT_ID} from '../../../Constants';
import {PRIMARY_COLOR} from '../../../Constants';
import {MoveIcon} from '../../../Icons';
import useMoveSeats from '../../hooks/useMoveSeats';
import {removeOne} from '../../utils/Utils';
import ConfirmMenuItem from '../ConfirmMenuItem';
import Grid from '../Grid';
import Collapse from '../transitions/Collapse';
import MoveSeatDialog from './MoveSeatDialog';
import TreeGroupFHG from './TreeGroupFHG';
import {useDrag} from 'react-dnd';
import {useDrop} from 'react-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import update from 'immutability-helper';
import {useTheme} from '@mui/styles';

const COLLAPSE_TIMEOUT = 500;
const SCROLL_TIMEOUT = 300;

export const moveState = atom({
   key: 'moveState',
   default: [],
});

export const seatsState = atom({
   key: 'seatsState',
   default: undefined,
});

export const expandedState = atom({
   key: 'expandedState',
   default: undefined,
});

export const ExpandMore = styled((props) => {
   const {expand, ...other} = props;
   return <IconButton {...other} size='small' />;
})(({theme, expand}) => ({
   transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
   marginLeft: 'auto',
   color: expand ? theme.palette.primary.light : undefined,
   transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
   }),
}));

const useStyles = makeStyles(
   (theme) => ({
      root: {
         width: 320 * SCALE_APP,
         height: 310 * SCALE_APP,
         display: 'flex',
         flexDirection: 'column',
         marginLeft: 'auto',
         marginRight: 'auto',
         marginBottom: 'auto,',
         overflow: 'hidden',
      },
      contentRoot: {
         // flex: '1 1 100%',
         paddingTop: 0,
         paddingBottom: theme.spacing(0.5),
         flex: '1 1 auto',
         height: '100%',
         overflow: 'auto',
         borderBottom: `1px solid ${theme.palette.divider}`,
      },
      titleStyle: {
         fontWeight: 500,
         fontSize: 16 * SCALE_APP,
         color: theme.palette.text.primary,
      },
      listItemStyle: {
         color: theme.palette.text.primary,
         fontSize: 14 * SCALE_APP,
      },
      buttonStyle: {
         '&:hover': {
            color: `#91B867`,
         },
         color: theme.palette.text.primary,
      },
      moveStyle: {
         marginLeft: theme.spacing(1),
         marginRight: theme.spacing(1),
      },
      maskStyle: {
         filter: 'invert(43%) sepia(12%) saturate(0%) hue-rotate(223deg) brightness(95%) contrast(103%)',
         // filter: 'invert(43%) sepia(18%) saturate(0%) hue-rotate(284deg) brightness(96%) contrast(81%)',
         '&:hover': {
            filter: 'invert(63%) sepia(39%) saturate(454%) hue-rotate(46deg) brightness(94%) contrast(86%)',
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.dark, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.dark, 0.6),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      moveTypeStyle: {
         transition: 'transform 800ms ease-in-out  100ms',
         willChange: 'transform',
         userSelect: 'none',
      },
   }),
   {name: 'TreeCardViewStyles'},
);
export const ITEM_DRAG_TYPE = 'item';

// noinspection JSUnusedLocalSymbols
const TreeItemFHG = React.forwardRef(function TreeItemFHG(
   {
      ContentComponent,
      expandAll,
      expandLevels,
      height,
      width,
      first,
      last,
      siblingCount,
      onMoveX,
      index,
      onMove,
      onAdd,
      onEdit,
      onDelete,
      confirmRemoveTitleKey,
      confirmRemoveMessageKey,
      item,
      itemsKey = 'items',
      parentKey,
      labelKey,
      parent,
      onHoverX,
      onUpdateMoveX,
      onMoveLeft,
      onMoveRight,
      level,
      search,
   },
   ref,
) {
   const classes = useStyles();
   const groupRef = useRef();
   const itemRef = useRef();
   const myRef = useRef();

   const [expandedDefault, setExpandedDefault] = useRecoilState(expandedState);
   const [isMoveHorizontal, setIsMoveHorizontal] = useState(false);

   //Need duplicate tracking to access changes inside the drag and drop callbacks. Can't use useCallback because they don't update properly.
   const refChild = useRef({
      childItems: [],
      isMoveHorizontal: false,
   });
   const [childItems, setChildItems] = useState();

   useEffect(() => {
      const array = cloneDeep(item?.[itemsKey]);

      if (array?.length > 0) {
         for (let i = 0; i < array.length; i++) {
            if (array[i].order !== i) {
               array[i].order = i;
            }
         }
      }
      refChild.current.childItems = array;
      setChildItems(array);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [item?.[itemsKey]]);

   const handleUpdateMoveX = useCallback(
      (dragItem, monitor) => {
         if (!!onMoveX) {
            if (monitor?.didDrop()) {
               let useMove = [];
               const updatedItems = refChild.current.childItems || [];

               for (let i = 0; i < updatedItems.length; i++) {
                  const item = updatedItems[i];

                  if (i !== item.order) {
                     useMove.push({seat: item, order: i});
                  }
               }

               onMoveX(useMove);
            } else {
               revertMoveX();
            }
         }
      },
      [isMoveHorizontal, onMoveX],
   );

   const [, drag, dragPreview] = useDrag(
      () => ({
         type: ITEM_DRAG_TYPE,
         end: onUpdateMoveX,
         item,
         canDrag: () => !!onMove && item?.isEditable !== false && parent,
         collect: (monitor) => ({
            isDragging: monitor.isDragging(),
         }),
      }),
      [item, onUpdateMoveX],
   );

   const aDrop = useCallback(
      (droppedItem) => {
         if (!refChild.current.isMoveHorizontal) {
            setRefresh(new Date());
            onMove?.(droppedItem, item);
         }
      },
      [item, onMove],
   );

   const revertMoveX = () => {
      refChild.current.childItems = item[itemsKey] || [];
      setChildItems(item[itemsKey] || []);
      refChild.current.isMoveHorizontal = false;
      setRefresh(new Date());
   };

   const [{isOver, canDrop, dragItem}, drop] = useDrop({
      accept: ITEM_DRAG_TYPE,
      drop: aDrop,
      canDrop: (dropItem) => {
         // Is the dropItem being dropped on a node that doesn't allow children to be added.
         if (item?.hasAdd === false) {
            return undefined;
         }
         // Is the dropItem being dropped on itself?
         if (dropItem?.id === item?.id) {
            return undefined;
         }
         // Is the dropItem being dropped on its own parent? If so the dropItem is already a child of the parent.
         if (dropItem?.[parentKey] === item?.id) {
            return undefined;
         }
         if (!dropItem?.[parentKey]) {
            if (
               (dropItem?.isActive && item?.id === ACTIVE_ROOT_ID) ||
               (!dropItem?.isActive && item?.id === PASSIVE_ROOT_ID)
            ) {
               return undefined;
            }
         }
         return dropItem;
      },
      hover(hoverItem, monitor) {
         if (!!onMoveX) {
            if (!myRef.current) {
               revertMoveX();
               return;
            }
            // Don't replace items with themselves
            if (hoverItem.id === item.id) {
               return;
            }

            // Don't move horizontally if the parents of the two items aren't the same.
            if (hoverItem?.[parentKey] !== item?.[parentKey]) {
               revertMoveX();
               return;
            }
            // Original index where the item was before the drag.
            const dragIndex = hoverItem.order;
            // New index that the item is dragged and is hovering over.
            const hoverIndex = index;

            // Determine rectangle on screen
            const hoverBoundingRect = myRef.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverFourths = hoverBoundingRect.width / 4;
            const hoverThreeForths = hoverFourths * 3;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the left
            const hoverClientX = clientOffset.x - hoverBoundingRect.left;

            // Dragging right, but is the hover in the right 1/4 of the item
            if (dragIndex < hoverIndex && hoverClientX < hoverThreeForths) {
               refChild.current.isMoveHorizontal = false;
               setIsMoveHorizontal(false);
               return;
            }

            // Dragging left, but is the hover in the left 1/4 of the item
            if (dragIndex > hoverIndex && hoverClientX > hoverFourths) {
               refChild.current.isMoveHorizontal = false;
               setIsMoveHorizontal(false);
               return;
            }
            onHoverX?.(dragIndex, hoverIndex);
            setRefresh(new Date());
            refChild.current.isMoveHorizontal = hoverItem.id;
            setIsMoveHorizontal(hoverItem.id);
         }
      },
      collect: (monitor) => ({
         isOver: monitor.isOver(),
         canDrop: monitor.canDrop(),
         dragItem: monitor.getItem(),
      }),
   });
   const [expanded, setExpanded] = React.useState(expandAll || (expandLevels && expandLevels >= level));
   const [showMoveDialog, setShowMoveDialog] = useState(false);

   const [showExpanded, setShowExpanded] = React.useState(expandAll || (expandLevels && expandLevels >= level));
   const [refresh, setRefresh] = useState(Date.now());

   const [anchorEl, setAnchorEl] = React.useState(null);
   const moveSeats = useMoveSeats(item, parent, !!onMove);

   // When the item is dragged horizontally only show the drop target as active if the item is in the middle half of the item.
   const isActive = isOver && canDrop && !refChild.current.isMoveHorizontal;
   const isSelected = startsWith(item?.[labelKey], search);

   useEffect(() => {
      if (expandedDefault?.length > 0 && !expanded && item) {
         const foundIndex = indexOf(expandedDefault, item?.id);

         if (foundIndex >= 0) {
            const tempExpandedDefault = [...expandedDefault];
            handleExpand();
            removeOne(tempExpandedDefault, foundIndex);
            setExpandedDefault(tempExpandedDefault);
         }
      }
   }, [expanded, expandedDefault, item, setExpandedDefault]);

   useEffect(() => {
      if (isSelected) {
         setTimeout(() => {
            itemRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
         }, SCROLL_TIMEOUT);
      }
   }, [isSelected]);

   useLayoutEffect(() => {
      if (expanded) {
         setTimeout(() => {
            groupRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
         }, SCROLL_TIMEOUT);
      } else {
         setTimeout(() => {
            itemRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
         }, SCROLL_TIMEOUT);
      }
   }, [expanded, itemRef, groupRef]);

   const handleHoverX = useCallback(
      (dragIndex, hoverIndex) => {
         if (dragIndex !== undefined && hoverIndex !== undefined) {
            const array = item?.[itemsKey] || [];
            const test = update(array, {
               $splice: [
                  [dragIndex, 1],
                  [hoverIndex, 0, array[dragIndex]],
               ],
            });
            refChild.current.childItems = test;
            setChildItems(test);
            setRefresh(new Date());
         }
      },
      [item, itemsKey],
   );

   const handleExpand = () => {
      setShowExpanded(true);
      setTimeout(() => {
         setExpanded(true);
      }, 10);
   };

   const handleCollapse = () => {
      setExpanded(false);
      setTimeout(() => {
         setShowExpanded(false);
      }, COLLAPSE_TIMEOUT);
   };

   const handleExpandClick = () => {
      const newExpanded = !expanded;

      if (newExpanded) {
         handleExpand();
      } else {
         handleCollapse();
      }
   };

   const handleAdd = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      onAdd?.(item);
      handleExpand();
   };

   const handleEdit = (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      onEdit?.(item);
   };

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleDelete = async (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      handleClose();
      await onDelete?.(item);
      const index = findIndex(item[itemsKey], {id: item.id});
      removeOne(item[itemsKey], index);
      setRefresh(new Date());
   };

   const theme = useTheme();

   drag(drop(myRef));
   return (
      <Grid
         id={'Tree' + item?.id}
         key={'TreeItemRoot' + item?.id}
         ref={dragPreview}
         name={'Tree Item Root'}
         container
         item
         direction={'column'}
         alignContent={'center'}
         resizable={false}
         // overflow={'auto'}
         fullWidth={false}
         style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            opacity: dragItem?.id && dragItem?.id === item?.id ? 0.3 : 1,
         }}
      >
         {onMove && showMoveDialog && moveSeats?.length > 0 && (
            <MoveSeatDialog
               seat={item}
               parent={parent}
               onSubmit={(seat, newParent) => {
                  setShowMoveDialog(false);
                  onMove(seat, newParent);
               }}
               onClose={() => setShowMoveDialog(false)}
            />
         )}
         <Grid ref={myRef} item style={{marginLeft: 'auto', marginRight: 'auto'}}>
            <Card
               className={classes.root}
               style={{
                  height: item?.height || height,
                  width: item?.width || width,
                  margin: 2,
                  backgroundColor: isActive
                     ? '#F0F6EA'
                     : theme.palette.mode === 'dark'
                       ? DARK_MODE_COLORS.Card_1
                       : '#fff',
                  border: isSelected ? `2px solid ${PRIMARY_COLOR}` : undefined,
               }}
               ref={itemRef}
               elevation={2}
            >
               <CardHeader
                  sx={{p: 2}}
                  title={
                     <Box alignItems={'center'} display={'flex'}>
                        {!!onMove && item?.isEditable !== false && parent && (
                           <DragIndicatorIcon
                              className={classes.buttonStyle}
                              style={{color: theme.palette.mode === 'dark' ? '#fff' : '#707070'}}
                           />
                        )}
                        {item?.[labelKey] || 'Untitled'}
                     </Box>
                  }
                  titleTypographyProps={{variant: 'subtitle1', className: classes.titleStyle}}
                  action={
                     <React.Fragment>
                        {item?.isEditable !== false && onEdit && (
                           <IconButton size={'small'} onClick={handleEdit} className={classes.buttonStyle}>
                              <Edit sx={{fontSize: 24 * SCALE_APP}} style={{color: theme.palette.text.primary}} />
                           </IconButton>
                        )}
                        {item?.isEditable !== false && onDelete && (
                           <React.Fragment>
                              <IconButton size={'small'} onClick={handleClick} className={classes.buttonStyle}>
                                 <MoreVert
                                    sx={{fontSize: 24 * SCALE_APP}}
                                    style={{color: theme.palette.text.primary}}
                                 />
                              </IconButton>
                              <Menu
                                 anchorEl={anchorEl}
                                 keepMounted
                                 open={Boolean(anchorEl)}
                                 onClose={handleClose}
                                 anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                 }}
                                 transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                 }}
                              >
                                 <ConfirmMenuItem
                                    className={classes.buttonStyle}
                                    titleKey={confirmRemoveTitleKey}
                                    messageKey={confirmRemoveMessageKey}
                                    color={'error'}
                                    onConfirm={handleDelete}
                                    values={{type: 'entity', name: item?.name}}
                                    size='small'
                                    submitStyle={classes.deleteColorStyle}
                                    startIcon={Delete}
                                    buttonTypographyProps={{variant: 'inherit'}}
                                    // disabled={isSaving || isNew}
                                 />
                              </Menu>
                           </React.Fragment>
                        )}
                     </React.Fragment>
                  }
               />
               <CardContent classes={{root: classes.contentRoot}} sx={{px: 2}}>
                  {item && (
                     <Box
                        height={'100%'}
                        // minHeight={100 * SCALE_APP}
                     >
                        {ContentComponent && <ContentComponent item={item} />}
                     </Box>
                  )}
               </CardContent>
               <CardActions sx={{p: 1}}>
                  <Grid container justifyContent={'space-between'}>
                     {/*Left actions*/}
                     <Grid item flex={'1 1 33%'}>
                        {item?.hasAdd !== false && onAdd && (
                           <IconButton size={'small'} onClick={handleAdd}>
                              <AddCircle
                                 sx={{fontSize: 24 * SCALE_APP}}
                                 className={classes.buttonStyle}
                                 style={{color: theme.palette.text.primary}}
                              />
                           </IconButton>
                        )}
                     </Grid>
                     {/*Center actions*/}
                     <Grid
                        container
                        item
                        alignItems={'center'}
                        justifyContent={'center'}
                        fullWidth={false}
                        flex={'1 1 33%'}
                     >
                        {item?.[itemsKey]?.length > 0 && (
                           <ExpandMore
                              expand={expanded}
                              onClick={handleExpandClick}
                              size={'small'}
                              fontSize={24 * SCALE_APP}
                              style={{marginRight: 'auto'}}
                              className={classes.buttonStyle}
                           >
                              <ExpandMoreIcon />
                           </ExpandMore>
                        )}
                     </Grid>
                     {/*Right Actions*/}
                     <Grid item flex={'1 1 33%'} style={{display: 'flex', justifyContent: 'flex-end'}}>
                        {!!onMoveLeft && siblingCount > 1 && !first && (
                           <Tooltip title={'Move Left'}>
                              <IconButton size={'small'} onClick={onMoveLeft(item, parent)}>
                                 <ArrowBack sx={{fontSize: 24 * SCALE_APP}} className={classes.buttonStyle} />
                              </IconButton>
                           </Tooltip>
                        )}
                        {onMove && moveSeats?.length > 0 && (
                           <Tooltip title={'Move Seat'}>
                              <IconButton size={'small'} onClick={() => setShowMoveDialog(true)}>
                                 <MoveIcon style={{transform: 'scale(0.85)'}} className={classes.buttonStyle} />
                              </IconButton>
                           </Tooltip>
                        )}
                        {onMoveRight && siblingCount > 1 && !last && (
                           <Tooltip title={'Move Right'}>
                              <IconButton size={'small'} onClick={onMoveRight(item, parent)}>
                                 <ArrowForward sx={{fontSize: 24 * SCALE_APP}} className={classes.buttonStyle} />
                              </IconButton>
                           </Tooltip>
                        )}
                     </Grid>
                  </Grid>
               </CardActions>
            </Card>
         </Grid>
         <Box name={'Expanding Grid'} ref={groupRef} display={'flex'} overflow={'hidden'} flex={'0 0 auto'}>
            {showExpanded && item?.[itemsKey]?.length > 0 && (
               <>
                  <Collapse in={expanded} style={{display: 'flex'}}>
                     <Box
                        key={'TreeItemExpanding' + item?.id}
                        name={'Expanding Grid'}
                        display={'flex'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                        flex={'0 0 auto'}
                        overflow={'hidden'}
                     >
                        <Divider
                           orientation={'vertical'}
                           flexItem
                           style={{
                              height: 20 * SCALE_APP,
                              marginRight: 'auto',
                              marginLeft: 'auto',
                              backgroundColor: PRIMARY_COLOR,
                              width: 2,
                           }}
                        />
                        <TreeGroupFHG key={'ExpandedTreeItem' + item?.id + refresh}>
                           {childItems?.map((child, index) => (
                              <TreeItemFHG
                                 key={'child' + child?.order + '' + child?.id}
                                 level={level + 1}
                                 expandLevels={expandLevels}
                                 ContentComponent={ContentComponent}
                                 onMoveX={onMoveX}
                                 first={index === 0}
                                 last={childItems?.length - 1 === index}
                                 siblingCount={childItems?.length || 0}
                                 onHoverX={handleHoverX}
                                 confirmRemoveTitleKey={confirmRemoveTitleKey}
                                 confirmRemoveMessageKey={confirmRemoveMessageKey}
                                 item={child}
                                 parent={item}
                                 index={index}
                                 itemsKey={itemsKey}
                                 expandAll={expandAll}
                                 labelKey={labelKey}
                                 parentKey={parentKey}
                                 height={height}
                                 width={width}
                                 onMove={onMove}
                                 onEdit={onEdit}
                                 onAdd={onAdd}
                                 onDelete={onDelete}
                                 onMoveLeft={onMoveLeft}
                                 onMoveRight={onMoveRight}
                                 onUpdateMoveX={handleUpdateMoveX}
                                 search={search}
                              />
                           ))}
                        </TreeGroupFHG>
                     </Box>
                  </Collapse>
               </>
            )}
         </Box>
      </Grid>
   );
});

export default TreeItemFHG;
