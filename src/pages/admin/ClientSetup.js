import {AddCircleOutline} from '@mui/icons-material';
import Box from '@mui/material/Box';
import {useLocation} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import Stack from '@mui/material/Stack';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import {Outlet} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import AdminDrawer from '../../components/AdminDrawer';
import Empty from '../../components/Empty';
import {CLIENT_EDIT} from '../../Constants';
import {SCALE_APP} from '../../Constants';
import {ADMIN_FRANCHISES_PATH} from '../../Constants';
import {FRANCHISE_EDIT} from '../../Constants';
import {ADMIN_PATH} from '../../Constants';
import {ADMIN_DRAWER} from '../../Constants';
import {CLIENT_COUNT} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import {userRoleState} from '../Main';
import './ReactSplitPane.css';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         display: 'flex',
         position: 'relative',
      },
      contentStyle: {
         position: 'relative',
         padding: theme.spacing(4, 3),
         [theme.breakpoints.up('md')]: {
            padding: `${theme.spacing(0, 0.375)}`,
         },
         overflow: 'hidden',
         maxHeight: '100%',
      },
      buttonStyle: {
         height: 42 * SCALE_APP,
         marginTop: theme.spacing(2),
         zIndex: 1000,
      },
   }),
   {name: 'ClientSetupStyles'},
);

/**
 * Main component accessible only if the user has been authenticated. Contains the routing for the application.
 *
 * Reviewed:
 */
export default function ClientSetup() {
   const classes = useStyles();
   const [{franchiseId: franchiseIdProp, clientId: clientIdProp}] = useCustomSearchParams();
   const {franchiseId: franchiseIdState, clientId: clientIdState} = useRecoilValue(userRoleState);
   const clientId = clientIdProp || clientIdState;
   const useFranchiseId = franchiseIdProp || franchiseIdState;

   const location = useLocation();
   const isNew = location?.state?.isNew;

   const navigate = useNavigateSearch();

   const [data] = useQueryFHG(CLIENT_COUNT, {skip: !!clientId});
   usePageTitle({titleKey: 'client.title.label'});

   const handleNew = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      if (!useFranchiseId) {
         navigate(`/${ADMIN_PATH}/${ADMIN_FRANCHISES_PATH}/${FRANCHISE_EDIT}`, {replace: true});
      } else {
         navigate(`./${CLIENT_EDIT}`, {replace: true, state: {isNew: true}});
      }
   };

   return (
      <Stack flexDirection={'column'} className={classes.root} height={'100%'} width='100%' overflow={'hidden'}>
         {clientId && !isNew ? (
            <SplitPane
               split={'vertical'}
               maxSize={ADMIN_DRAWER * 1.25}
               minSize={ADMIN_DRAWER * 0.75}
               defaultSize={ADMIN_DRAWER + 4}
               pane1Style={{overflow: 'hidden'}}
            >
               <AdminDrawer />
               <Outlet />
            </SplitPane>
         ) : isNew ? (
            <Outlet />
         ) : (
            <Box
               display={'flex'}
               flexDirection={'column'}
               alignItems={'center'}
               justifyContent={'center'}
               width={'100%'}
            >
               <Empty
                  titleMessageKey={
                     !useFranchiseId
                        ? 'empty.noFranchise.message'
                        : data?.clientCount > 0
                          ? 'empty.noInfo.message'
                          : 'empty.nothing.message'
                  }
                  messageKey={
                     !useFranchiseId
                        ? 'empty.selectFranchise.message'
                        : data?.clientCount > 0
                          ? 'empty.selectClientOrAdd.message'
                          : 'empty.addClient.message'
                  }
               />
               <ButtonFHG
                  startIcon={<AddCircleOutline />}
                  variant={'contained'}
                  onClick={handleNew}
                  labelKey={!useFranchiseId ? 'franchise.new.button' : 'client.new.button'}
                  className={classes.buttonStyle}
               />
            </Box>
         )}
      </Stack>
   );
}
