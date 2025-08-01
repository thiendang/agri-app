import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import {reduce} from 'lodash';
import {delay} from 'lodash';
import moment from 'moment';
import {useCallback} from 'react';
import {useState} from 'react';
import React from 'react';
import {useEffect} from 'react';
import {useSetRecoilState} from 'recoil';
import {useNavigate, useOutlet} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useRecoilState} from 'recoil';
import {validate} from 'uuid';
import Empty from '../../../components/Empty';
import ExportPdfChoiceButton from '../../../components/ExportPdfChoiceButton';
import Header from '../../../components/Header';
import {DARK_MODE_COLORS, SCALE_APP} from '../../../Constants';
import {ACCOUNTABILITY_CHART_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import {EDIT_PATH} from '../../../Constants';
import {SEAT_DRAWER_WIDTH} from '../../../Constants';
import {ACCOUNTABILITY_CHART_INDEX} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {SEAT_EDIT} from '../../../Constants';
import {ADMIN_DRAWER} from '../../../Constants';
import {SEAT_DELETE} from '../../../data/QueriesGL';
import {SEAT_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {SEAT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {getSeatCacheQueries} from '../../../data/QueriesGL';
import Grid from '../../../fhg/components/Grid';
import {expandedState} from '../../../fhg/components/tree/TreeItemFHG';
import {seatsState} from '../../../fhg/components/tree/TreeItemFHG';
import {moveState} from '../../../fhg/components/tree/TreeItemFHG';
import TreeViewFHG from '../../../fhg/components/tree/TreeViewFHG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {entityState} from '../../admin/EntityListDropDown';
import {userRoleState} from '../../Main';
import SeatCard from './SeatCard';
import useGetRoot from './useGetRoot';
import EditDrawer from '../../../components/EditDrawer';
import {useTheme} from '@mui/styles';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         display: 'flex',
         height: '100%',
         position: 'relative',
         flexDirection: 'column',
      },
      drawerStyle: {
         // width: drawerWidth,
         flexShrink: 0,
      },
      contentStyle: {
         position: 'relative',
         padding: theme.spacing(6, 3),
         [theme.breakpoints.down('md')]: {
            padding: `${theme.spacing(2)} 3px`,
         },
         overflow: 'auto',
         maxHeight: '100%',
      },
      contentStyle2: {
         position: 'relative',
         overflow: 'auto',
      },
      innerGridStyle: {
         width: `calc(100% + ${ADMIN_DRAWER}px)`,
         paddingLeft: ADMIN_DRAWER,
      },
      cardStyle: {
         fontSize: 20 * SCALE_APP,
         backgroundColor: '#F9F9E6',
         width: 280 * SCALE_APP,
         minHeight: 80 * SCALE_APP,
         borderRadius: 8,
         margin: theme.spacing(1.5),
      },
      cardTitleStyle: {
         fontWeight: 600,
         borderRadius: 8,
         textAlign: 'center',
      },
      exportButtonStyle: {
         zIndex: theme.zIndex.drawer,
         left: 0,
         right: 0,
         '& .title-page-margin': {
            marginBottom: theme.spacing(0.5),
         },
         '& .title-page': {
            background: theme.palette.background.default,
         },
         overflow: 'visible',
      },
   }),
   {name: 'ClientSetupStyles'},
);

let isSavingRoot = false;

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed:
 */
export default function AccountabilityChart() {
   const [{clientId: clientIdProp, entityId, search}, , searchAsString] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const classes = useStyles();
   const navigate = useNavigate();
   const pollInterval = useRecoilValue(pollState);
   const [move, setMove] = useRecoilState(moveState);
   const [seatData] = useQueryFHG(SEAT_ALL_WHERE_QUERY, {
      variables: {entityId},
      skip: !validate(entityId),
      pollInterval,
   });
   const getRoot = useGetRoot();
   const [seatDelete] = useMutationFHG(SEAT_DELETE);
   const [seatCreateUpdate, result] = useMutationFHG(SEAT_CREATE_UPDATE);
   const outletElement = useOutlet();

   const [root, setRoot] = useState();
   const [expandedDefault, setExpandedDefault] = useRecoilState(expandedState);
   const setEntityStatus = useSetRecoilState(entityState);

   const setSeats = useSetRecoilState(seatsState);

   const theme = useTheme();

   usePageTitle({titleKey: 'accountability.title.label'});
   const {scaleStyle, buttonPanel} = useScalePanel({
      top: 0,
      backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_2 : 'white',
      opacity: 1,
      position: 'relative',

      propertyKey: 'accountabilityChart',
   });

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   /**
    * Remove the seats list when the chart is removed from the DOM.
    */
   useEffect(() => {
      return () => {
         setSeats([]);
      };
   }, [setSeats]);

   const handleSubmitSeatRoot = useCallback(
      async (root) => {
         async function submitNode(root, parentId) {
            if (!root?.__typename) {
               await submit(root, parentId);
               for (const seat of root?.seats || []) {
                  await submitNode(seat, root.id);
               }
            }
         }
         async function submit(node, parentId) {
            try {
               let variables = {...node, seatId: parentId};
               await seatCreateUpdate({
                  variables,
                  optimisticResponse: {
                     __typename: 'Mutation',
                     seat: {
                        __typename: 'Seat',
                        ...variables,
                        entityId,
                        seatId: parentId || '',
                        isDeleted: false,
                        createdDateTime: moment().format(DATE_DB_FORMAT),
                        order: 0,
                     },
                  },
                  update: cacheUpdate(getSeatCacheQueries(entityId), variables.id, 'seat'),
               });
            } catch (e) {
               console.log(e);
            }
         }
         await submitNode(root);
      },
      [seatCreateUpdate, entityId],
   );

   /**
    * Submit the order changes to the server.
    * @type {(function(*, *): void)|*}
    */
   const handleSubmitOrder = useCallback(
      (item, order) => {
         if (item && order !== undefined) {
            let variables = {id: item.id, order};
            seatCreateUpdate({
               variables,
               optimisticResponse: {
                  __typename: 'Mutation',
                  seat: {
                     __typename: 'Seat',
                     ...item,
                     ...variables,
                     entityId,
                     isDeleted: false,
                  },
               },
            });
         }
      },
      [entityId, seatCreateUpdate],
   );

   useEffect(() => {
      delay(() => {
         if (move?.length > 0) {
            for (const moveItem of move) {
               handleSubmitOrder(moveItem.seat, moveItem.order);
            }
            setMove([]);
         }
      }, 900);
   }, [handleSubmitOrder, move, setMove]);

   useEffect(() => {
      async function calculateRoots() {
         const root = getRoot(entityId, seatData?.seats);

         if (!isSavingRoot && !result?.loading) {
            if (!(seatData?.seats?.length > 0)) {
               isSavingRoot = true;
               try {
                  await handleSubmitSeatRoot(root?.[0]);
               } catch (e) {
                  //intentionally left blank
               } finally {
                  isSavingRoot = false;
               }
            } else {
               setRoot(root?.[0]);
               setSeats(root?.[0]);
            }
         }
      }
      if (seatData) {
         calculateRoots();
      }
   }, [entityId, getRoot, handleSubmitSeatRoot, result?.loading, seatData, seatData?.seats, setSeats]);

   const handleAdd = (seat) => {
      navigate(
         {pathname: EDIT_PATH, search: searchAsString},
         {replace: true, state: {edit: SEAT_EDIT, parentSeatId: seat?.id, id: undefined}},
      );
   };

   const handleEdit = (seat) => {
      navigate({pathname: EDIT_PATH, search: searchAsString}, {replace: true, state: {edit: SEAT_EDIT, id: seat?.id}});
   };

   const handleDelete = async (seat) => {
      if (seat) {
         await seatDelete({
            variables: {id: seat?.id},
            optimisticResponse: {seat_Delete: 1},
            update: cacheDelete(getSeatCacheQueries(entityId), seat.id),
         });
      } else {
         console.log('Cannot delete seat', seat);
      }
   };

   /**
    * Move the item in the parent left one position.
    *
    * @param item The item to move left.
    * @param parent The parent containing the list if items.
    * @return {(function(): void)|*}
    */
   const handleMoveLeft = (item, parent) => () => {
      const array = parent?.seats || [];
      const tempItem = array[item?.order - 1];
      handleSubmitOrder(tempItem, item?.order);
      handleSubmitOrder(item, item?.order - 1);
   };

   /**
    * Move the item in the parent right one position.
    *
    * @param item The item to move right.
    * @param parent The parent containing the list if items.
    * @return {(function(): void)|*}
    */
   const handleMoveRight = (item, parent) => () => {
      const array = parent?.seats || [];
      const tempItem = array[item?.order + 1];
      handleSubmitOrder(tempItem, item?.order);
      handleSubmitOrder(item, item?.order + 1);
   };

   const handleMoveX = (move) => {
      if (move?.length > 0) {
         for (const moveItem of move) {
            handleSubmitOrder(moveItem.seat, moveItem.order);
         }
      }
   };

   const handleMove = async (droppedItem, parentItem) => {
      let highestOrder = reduce(parentItem?.seats, (highest, value) => Math.max(value.order, highest), 0);

      try {
         let variables = {id: droppedItem?.id, seatId: parentItem?.id, order: highestOrder + 1};
         await seatCreateUpdate({
            variables,
            optimisticResponse: {
               __typename: 'Mutation',
               seat: {
                  __typename: 'Seat',
                  ...droppedItem,
                  ...variables,
                  isDeleted: false,
               },
            },
         });
         setExpandedDefault((expanded) => {
            return [...(expanded || []), parentItem?.id];
         });
      } catch (e) {
         //Intentionally left blank
      }
   };
   const historyDate = moment().startOf('month').format(DATE_DB_FORMAT);
   const hasPermission = usePermission(ACCOUNTABILITY_CHART_EDIT);

   if (!clientId) {
      return (
         <Empty
            titleMessageKey={'empty.noInfo.message'}
            messageKey={
               !clientId
                  ? !entityId
                     ? 'empty.selectClientAndEntity.message'
                     : 'empty.selectClient.message'
                  : !entityId
                    ? 'empty.selectEntity.message'
                    : undefined
            }
            sx={{mt: 4}}
         />
      );
   }

   return (
      <Grid container className={classes.root} fullHeight>
         <Box name={'HeaderFrame'} className={classes.exportButtonStyle}>
            <Header
               idTitle='accountability.title.label'
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
               }}
            >
               <Box flex={1} display='flex' flexDirection='row' alignItems='center' justifyContent='flex-end'>
                  {buttonPanel}
                  <ExportPdfChoiceButton
                     clientId={clientId}
                     selectedIndex={ACCOUNTABILITY_CHART_INDEX}
                     entityIds={entityId}
                     historyDate={historyDate}
                  />
               </Box>
            </Header>
            {outletElement && (
               <EditDrawer open={true} width={SEAT_DRAWER_WIDTH}>
                  {outletElement}
               </EditDrawer>
            )}
         </Box>
         <Grid name='Accountability Chart Grid' container item resizable className={classes.contentStyle}>
            {root && (
               <Box
                  name='ScaleFrame'
                  // height={'100%'}
                  width={'100%'}
                  position={'relative'}
                  overflow={'hidden'}
                  flex={'1 1 0%'}
                  display={'flex'}
               >
                  <Box name='Scale Grid' overflow={'auto'} width={'100%'} display={'flex'}>
                     <Box name='Scale Contents' marginLeft='auto' marginRight='auto' style={{...scaleStyle}}>
                        <TreeViewFHG
                           key={'TreeView' + entityId + ' ' + root?.id}
                           expandLevels={expandedDefault?.length > 0 ? undefined : 2}
                           ContentComponent={SeatCard}
                           confirmRemoveTitleKey={'seat.confirmRemoveValue.title'}
                           confirmRemoveMessageKey={'seat.confirmRemoveValue.message'}
                           item={root}
                           labelKey={'name'}
                           itemsKey={'seats'}
                           parentKey={'seatId'}
                           onEdit={hasPermission && handleEdit}
                           onAdd={hasPermission && handleAdd}
                           onDelete={hasPermission && handleDelete}
                           onMove={hasPermission && handleMove}
                           onMoveX={hasPermission && handleMoveX}
                           onMoveLeft={hasPermission && handleMoveLeft}
                           onMoveRight={hasPermission && handleMoveRight}
                           search={search}
                        />
                     </Box>
                  </Box>
               </Box>
            )}
         </Grid>
      </Grid>
   );
}
