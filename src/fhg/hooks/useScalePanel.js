import {useReactiveVar} from '@apollo/client';
import {useApolloClient} from '@apollo/client';
import {UndoRounded} from '@mui/icons-material';
import {RedoRounded} from '@mui/icons-material';
import {Tooltip} from '@mui/material';
import {ButtonGroup} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {HighlightOff} from '@mui/icons-material';
import {ZoomOut} from '@mui/icons-material';
import {ZoomIn} from '@mui/icons-material';
import {delay} from 'lodash';
import isArray from 'lodash/isArray';
import {useEffect} from 'react';
import {useCallback} from 'react';
import {useState} from 'react';
import React from 'react';
import {useMemo} from 'react';
import {useMatch} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {CASH_FLOW_FULL_PATH} from '../../Constants';
import {CASH_FLOW_QUERY} from '../../data/QueriesGL';
import {ENTITY_CASH_FLOW_ALL_WHERE_QUERY} from '../../data/QueriesGL';
import {REDO_MOST_RECENT_CHECK} from '../../data/QueriesGL';
import {UNDO_MOST_RECENT_CHECK} from '../../data/QueriesGL';
import {REDO_MOST_RECENT} from '../../data/QueriesGL';
import {UNDO_MOST_RECENT} from '../../data/QueriesGL';
import {useLocation} from 'react-router-dom';
import {undoRedoRefreshVar} from '../../index';
import {userRoleState} from '../../pages/Main';
import {validateUuid} from '../utils/Utils';
import useQueryFHG from './data/useQueryFHG';
import {useCustomSearchParams} from './useCustomSearchParams';
import useMutationFHG from './data/useMutationFHG';
import useDebounce from './useDebounce';

const useStyles = makeStyles(
   () => ({
      fadeArea: {
         '&:hover $fadeIn': {
            opacity: 1,
         },
      },
      fadeIn: (props) => ({
         opacity: props.opacity || 0.5,
      }),
   }),
   {name: 'ScalePanelStyles'},
);

/**
 * Component to show the buttons to zoom in, zoom out and rest the zoom.
 *
 * @param onZoomIn Callback when the zoom in button is pressed.
 * @param onZoomOut Callback when the zoom out button is pressed.
 * @param onZoomReset Callback when the reset button is pressed.
 * @param scale The current scale value. Used to disable zoom out.
 * @param disableZoomOut Indicates if the panel should allow zoom out beyond 100% (scale 1).
 * @param styleProps The style props for the zoom button panel.
 * @returns {JSX.Element}
 * @constructor
 */
function ScaleButtonPanel({onZoomIn, onZoomOut, onZoomReset, scale, disableZoomOut = false, ...styleProps}) {
   const classes = useStyles(styleProps);
   const theme = useTheme();
   const {franchiseId, clientId} = useRecoilValue(userRoleState);
   const [{entityId}] = useCustomSearchParams();
   const undoRedoRefresh = useReactiveVar(undoRedoRefreshVar);
   const client = useApolloClient();
   const undoMatch = useMatch({path: CASH_FLOW_FULL_PATH + '/*'});

   const location = useLocation();

   const [undoCheckData, {loading: loadingUndoCheck, error: errorUndoCheck, refetch: refetchUndoCheck}] = useQueryFHG(
      UNDO_MOST_RECENT_CHECK,
      {
         variables: {path: location.pathname, franchiseId, clientId, entityId},
         skip: !franchiseId || !clientId || isArray(entityId) || !validateUuid(entityId),
      },
   );
   const [undoMostRecent, {loading, error}] = useMutationFHG(UNDO_MOST_RECENT, {
      onCompleted: () => {
         (async () => {
            await client.refetchQueries({
               include: ['getCashFlowQuery', 'getClientAllWhere', 'undoMostRecentCheck', 'redoMostRecentCheck'],
            });
         })();
      },
   });

   const [redoCheckData, {loading: loadingRedoCheck, error: errorRedoCheck, refetch: refetchRedoCheck}] = useQueryFHG(
      REDO_MOST_RECENT_CHECK,
      {
         variables: {path: location.pathname, franchiseId, clientId, entityId},
         skip: !franchiseId || !clientId || isArray(entityId) || !validateUuid(entityId),
      },
   );
   const refetchDebounced = useDebounce(() => {
      if (undoMatch) {
         delay(() => {
            (async () => {
               const resultUndoCheck = await refetchUndoCheck();
               const resultRedoCheck = await refetchRedoCheck();
            })();
         }, 500);
      }
   }, 1000);

   const [redoMostRecent, {loading: loadingRedo, error: errorRedo}] = useMutationFHG(REDO_MOST_RECENT, {
      onCompleted: () => {
         (async () => {
            await client.refetchQueries({
               include: ['getCashFlowQuery', 'getClientAllWhere', 'undoMostRecentCheck', 'redoMostRecentCheck'],
            });
         })();
      },
   });

   const handleUndo = useCallback(() => {
      undoMostRecent({variables: {path: location.pathname, franchiseId, clientId, entityId}});
   }, [clientId, entityId, franchiseId, location.pathname, undoMostRecent]);

   const handleRedo = useCallback(() => {
      redoMostRecent({variables: {path: location.pathname, franchiseId, clientId, entityId}});
   }, [clientId, entityId, franchiseId, location.pathname, redoMostRecent]);

   const buttonGroupStyle = {
      position: styleProps?.position || 'absolute',
      top: styleProps?.top ?? theme.spacing(2),
      right: styleProps?.right ?? theme.spacing(2),
      zIndex: styleProps?.zIndex ?? theme.zIndex.drawer,
   };

   useEffect(() => {
      refetchDebounced?.();
   }, [undoRedoRefresh]);

   return (
      <Box name='Button Group Box' className={classes.fadeArea} style={buttonGroupStyle}>
         <ButtonGroup
            sx={{mr: 1, display: !!undoMatch ? undefined : 'none'}}
            style={{backgroundColor: styleProps?.backgroundColor ?? theme.palette.background.paper3}}
         >
            <Button
               onClick={handleUndo}
               disabled={!undoCheckData || !(undoCheckData?.undoHistory?.length > 0)}
               sx={{height: 38}}
            >
               <Tooltip title={'Undo'} enterDelay={200}>
                  <UndoRounded />
               </Tooltip>
            </Button>

            <Button
               onClick={handleRedo}
               disabled={!redoCheckData || !(redoCheckData?.undoHistory?.length > 0)}
               sx={{height: 38}}
            >
               <Tooltip title={'Redo'} enterDelay={200}>
                  <RedoRounded />
               </Tooltip>
            </Button>
         </ButtonGroup>
         <ButtonGroup
            color='primary'
            className={classes.fadeIn}
            style={{backgroundColor: styleProps?.backgroundColor ?? theme.palette.background.paper3}}
         >
            <Button
               onClick={onZoomIn}
               style={{
                  height: '38px',
               }}
            >
               <Tooltip title={'Make Larger'} enterDelay={200}>
                  <ZoomIn />
               </Tooltip>
            </Button>
            <Button
               onClick={onZoomOut}
               disabled={disableZoomOut && scale <= 1}
               style={{
                  height: '38px',
               }}
            >
               <Tooltip title={'Make Smaller'} enterDelay={200}>
                  <ZoomOut />
               </Tooltip>
            </Button>
            <Button
               onClick={onZoomReset}
               disabled={disableZoomOut && scale === 1}
               style={{
                  height: '38px',
               }}
            >
               <Tooltip title={'Normal Size'} enterDelay={200}>
                  <HighlightOff />
               </Tooltip>
            </Button>
         </ButtonGroup>
      </Box>
   );
}

// Amount to change scale when "zooming".
const SCALE_DELTA = 0.08;

/**
 * Hook to scale the contents inside the panel. A zoom button panel scale, and style.
 * @param styleProps Style props for the button panel
 * @param [disableZoomOut=false] Indicates if the panel should allow zoom out beyond 100% (scale 1).
 * @returns {{buttonPanel: unknown, scale: number, scaleStyle: {transform: string, transformOrigin: string}}}
 */
export default function useScalePanel(styleProps, disableZoomOut = false) {
   const [scale, setScale] = useState(1);

   const handleZoomIn = () => {
      setScale((scale) => (scale || 1) + SCALE_DELTA);
   };

   const handleZoomOut = () => {
      setScale((scale) => (scale || 1) - SCALE_DELTA);
   };

   const handleZoomReset = () => {
      setScale(1);
   };

   const scaleStyle = useMemo(() => {
      return scale !== 1
         ? {
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
           }
         : {};
   }, [scale]);

   const buttonPanel = useMemo(
      () => (
         <ScaleButtonPanel
            {...styleProps}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            scale={scale}
            disableZoomOut={disableZoomOut}
         />
      ),
      [disableZoomOut, scale, styleProps],
   );

   return {scaleStyle, buttonPanel, scale};
}
