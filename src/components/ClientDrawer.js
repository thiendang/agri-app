import {Person} from '@mui/icons-material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {Box} from '@mui/material';
import {Avatar, Collapse, FormControl, MenuItem, Popover, Switch} from '@mui/material';
import {Stack} from '@mui/material';
import {ListItemButton} from '@mui/material';
import {Divider, Badge} from '@mui/material';
import {List, ListItemText} from '@mui/material';
import Button from '@mui/material/Button';
import {lighten} from '@mui/material/styles';
import {useTheme} from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import {sortBy} from 'lodash';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {useMatch} from 'react-router-dom';
import {Link} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {atom} from 'recoil';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {FRANCHISE_INVITE} from '../Constants';
import {FRANCHISE_EDIT} from '../Constants';
import {SCHEDULE_LINK} from '../Constants';
import {SETTINGS_FULL_PATH} from '../Constants';
import {LOGOUT_ICON, MOON_ICON, PROFIT_LOSS_PATH, USER_ICON} from '../Constants';
import {CLIENT_DASHBOARD_PATH, REVIEW_ICON, LOGO_DARK} from '../Constants';
import {ADMIN_FRANCHISES_PATH, INTERCOM_APP_ID, SETTINGS_PROFILE_FULL_PATH} from '../Constants';
import {ADMIN_MEMBERSHIP_PATH} from '../Constants';
import {SETTINGS_PATH} from '../Constants';
import {FEEDBACK_PATH} from '../Constants';
import {FEEDBACK_ICON} from '../Constants';
import {KNOWLEDGE_ICON} from '../Constants';
import {ADMIN_ICON} from '../Constants';
import {MY_BUSINESS_ICON} from '../Constants';
import {YEAR_FORMAT} from '../Constants';
import {CHAT_PATH} from '../Constants';
import {COMMUNITY_PATH} from '../Constants';
import {KNOWLEDGE_LIBRARY_PATH} from '../Constants';
import {BORDER_RADIUS_10} from '../Constants';
import {SCALE_APP} from '../Constants';
import {ADMIN_FULL_PATH} from '../Constants';
import {TOOL_FULL_PATH} from '../Constants';
import {CLIENT_EDIT} from '../Constants';
import {ADMIN_SETUP_PATH} from '../Constants';
import {ADMIN_USER_PATH} from '../Constants';
import {FOLDERS_PATH} from '../Constants';
import {ADMIN_PATH} from '../Constants';
import {MONTH_FORMAT} from '../Constants';
import {TOOL_PATH} from '../Constants';
import {TOOLS_RESOURCES} from '../Constants';
import {PRIMARY_COLOR} from '../Constants';
import {BUSINESS_FULL_PATH, BUSINESS_PATH, GAME_PLAN_PATH} from '../Constants';
import {CLIENT_ENTITY_PATH} from '../Constants';
import {LOGO} from '../Constants';
import {TAXABLE_INCOME_PATH} from '../Constants';
import {ACCOUNTABILITY_CLIENT_ENTITY_PATH} from '../Constants';
import {FILES_PATH} from '../Constants';
import {CLIENT_TASK_NOTES_PATH} from '../Constants';
import {
   ENTITY_ASSET_PATH,
   LIABILITIES_PATH,
   LOAN_ANALYSIS_PATH,
   BALANCE_SHEET_PATH,
   CASH_FLOW_PATH,
   LOAN_AMORTIZATION_PATH,
   CONTRACT_PATH,
} from '../Constants';
import {USER_CLIENT_QUERY} from '../data/QueriesGL';
import {CLIENT_BY_ID_QUERY} from '../data/QueriesGL';
import {CLIENT_ACTIVATE_FREE_TRIAL} from '../data/QueriesGL';
import {TASK_CURRENT_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import DatePickerFHG2 from '../fhg/components/DatePickerFHG2';
import Grid from '../fhg/components/Grid';
import {MAIN} from '../fhg/components/ListItemButtonFHG';
import ListItemButtonFHG from '../fhg/components/ListItemButtonFHG';
import ListItemButtonPlainFHG from '../fhg/components/ListItemButtonPlainFHG';
import ResponsiveMobileDrawer, {drawerIsOpenStatus} from '../fhg/components/ResponsiveMobileDrawer';
import TypographyFHG from '../fhg/components/Typography';
import useLazyQueryFHG from '../fhg/hooks/data/useLazyQueryFHG';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';

import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useEffectOnceConditional from '../fhg/hooks/useEffectOnceConditional';
import useWidthRule from '../fhg/hooks/useWidthRule';
import ClientListDropDown from '../pages/admin/ClientListDropDown';
import EntityListDropDown from '../pages/admin/EntityListDropDown';
import FranchiseListDropDown from '../pages/admin/FranchiseListDropDown';
import {userRoleState} from '../pages/Main';
import {FIELD_METRICS_VIEW} from './permission/PermissionAllow';
import {ASSETS_VIEW} from './permission/PermissionAllow';
import {BALANCE_SHEET_VIEW} from './permission/PermissionAllow';
import {BUSINESS_PLAN_VIEW} from './permission/PermissionAllow';
import {CONTRACTS_VIEW} from './permission/PermissionAllow';
import {TOOLS_VIEW} from './permission/PermissionAllow';
import {ACCOUNTABILITY_CHART_VIEW} from './permission/PermissionAllow';
import {ENTITIES_VIEW} from './permission/PermissionAllow';
import {CASH_FLOW_VIEW} from './permission/PermissionAllow';
import {LOAN_ANALYSIS_VIEW} from './permission/PermissionAllow';
import SearchField from '../fhg/components/SearchField';
import {authenticationDataStatus, userStatus} from '../fhg/components/security/AuthenticatedUser';
import {Auth} from 'aws-amplify';
import PermissionAllowPopover from './permission/PermissionAllowPopover';
import {ProvideFeedbackModal} from './ProvideFeedbackModal';
import ModalDialog from '../fhg/components/dialog/ModalDialog';
import {useNavigate} from 'react-router-dom';
import {darkModeAtom} from '../pages/client/settings/Appearance';
import {Link as MuiLink} from '@mui/material';
import delay from 'lodash/delay';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(1.25, 0, 2, 2),
      },
      linkPadding: {
         paddingRight: 0,
      },
      primaryLinkStyle: {
         position: 'sticky',
         top: 0,
         zIndex: 100,
         width: '100%',
         paddingLeft: theme.spacing(1),
         paddingRight: theme.spacing(1),
         height: 48 * SCALE_APP,
         backgroundColor: theme.palette.background.default,
         '&.selected': {
            backgroundColor: PRIMARY_COLOR,
            color: 'white',
            borderRadius: BORDER_RADIUS_10,
         },
      },
      badgeStyle: {
         '& .MuiBadge-dot': {
            top: theme.spacing(1),
            right: theme.spacing(-0.5),
         },
      },
      profileStyle: {
         width: '100%',
         paddingLeft: theme.spacing(1),
         paddingRight: theme.spacing(1),
         backgroundColor: theme.palette.background.default,
      },
      imageColor: {
         filter: theme.palette.mode === 'dark' ? 'invert(100%)' : '#2e2e2e',
         '&.selected': {
            filter: 'invert(100%)',
         },
         marginRight: theme.spacing(1.25),
      },
      colorWhite: {
         color: '#FFFFFF',
         marginRight: theme.spacing(1.25),
      },
      imageStyle: {
         display: 'block',
         height: 'calc(3vw + 18px)',
         maxHeight: 64 * SCALE_APP,
         minHeight: 50 * SCALE_APP,
      },
      closeIcon: {
         fontSize: 25 * SCALE_APP,
         marginRight: theme.spacing(1),
         position: 'absolute',
         right: theme.spacing(1),
         top: theme.spacing(1),
         // right: '4.96%',
         // top: '0.89%',
         cursor: 'pointer',

         color: '#769548',
      },
      menuItemText: {
         fontWeight: 500,
         textShadow: '0.5px 0',
         fontSize: 18 * SCALE_APP,
         color: theme.palette.text.primary,
         '&.selected': {
            color: 'white',
         },
      },
      collapseItem: {
         marginLeft: 0,
      },
      selectStyle: {
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
      },
      paper: {
         padding: theme.spacing(1),
         backgroundColor: theme.palette.background.popover,
         width: `${SCALE_APP * 300}px`,
      },
      linkStyle: {
         '&.MuiLink-root': {
            color: `${theme.palette.error.main} !important`,
         },
      },
      activateButton: {
         '&:hover': {
            backgroundColor: theme.palette.background.lightGreen,
         },
      },
   }),
   {name: 'ClientDrawerStyles'},
);

export const reportDateProperties = atom({
   key: 'reportDateProperties',
   default: {disableFuture: true, endDate: undefined},
});

const BUSINESS = 'business';
const TOOL_RESOURCES = 'toolResources';
const KNOWLEDGE_RESOURCES = 'knowledge';
const ADMIN = 'admin';
const COMMUNITY = 'community';

export default function ClientDrawer() {
   const [{clientId: clientIdProp, reportDate}, setSearchParams] = useCustomSearchParams();
   const classes = useStyles();
   const theme = useTheme();
   const location = useLocation();
   const [userRole, setUserRole] = useRecoilState(userRoleState);

   const {
      isAdmin,
      clientId: userClientId,
      isExecutive,
      isSuperAdmin,
      freeTrialExpires,
      freeTrialActive: freeTrialActiveForUser,
      isClientSignup,
   } = userRole;
   const {disableFuture, endDate} = useRecoilValue(reportDateProperties);
   const clientId = userClientId || clientIdProp;
   const setIsDrawerOpen = useSetRecoilState(drawerIsOpenStatus);
   const [open, setOpen] = useState(BUSINESS);
   const darkMode = useRecoilValue(darkModeAtom);
   const user = useRecoilValue(userStatus);

   const isSmallWidth = useWidthRule('down', 'sm');
   const [freeTrialExpiresDays, setFreeTrialExpiresDays] = useState();
   const [freeTrialActive, setFreeTrialActive] = useState(freeTrialActiveForUser);

   const setFreeTrialInfo = useCallback(
      (client) => {
         if (client?.freeTrialExpires) {
            const freeTrialExpiresDate = moment(client.freeTrialExpires);
            const freeTrialExpiresHours = freeTrialExpiresDate.diff(moment(), 'hours');
            const freeTrialExpiresDays = Math.round(freeTrialExpiresHours / 24);
            setFreeTrialExpiresDays(freeTrialExpiresDays);
            setFreeTrialActive(client.freeTrialActive);
         } else if (!!freeTrialExpires) {
            setUserRole((userRole) => ({...userRole, freeTrialExpires: null}));
         }
      },
      [freeTrialExpires],
   );

   const [data, {refetch}] = useQueryFHG(
      CLIENT_BY_ID_QUERY,
      {
         variables: {clientId},
         skip: !clientId,
         //  86400 seconds in a day converted to milliseconds and check twice a day
         pollInterval: freeTrialExpires ? (86400 * 1000) / 2 : 0,
      },
      'client.type',
   );
   let [fetchUserData] = useLazyQueryFHG(
      USER_CLIENT_QUERY,
      {variables: {cognitoSub: user?.cognitoSub}, fetchPolicy: 'network-only'},
      'user.type',
   );

   const [isTaskOverDue, setIsTaskOverDue] = useState(false);
   const messageColor = freeTrialExpiresDays >= 4 ? 'primary' : 'error';

   const [taskData] = useQueryFHG(
      TASK_CURRENT_QUERY,
      {variables: {clientId, completedDays: 0}, skip: !validate(clientId)},
      'task.type',
      false,
   );

   const [activate] = useMutationFHG(CLIENT_ACTIVATE_FREE_TRIAL);

   const isCashFlow = useMemo(
      () => location.pathname.includes(CASH_FLOW_PATH) || location.pathname.includes(PROFIT_LOSS_PATH),
      [location.pathname],
   );

   useEffect(() => {
      if (data?.client) {
         setFreeTrialInfo(data?.client);
      }
   }, [data?.client]);

   const handleDateChange = useCallback(
      (date) => {
         if (!location?.pathname?.includes(CHAT_PATH)) {
            if (isCashFlow === true) {
               const newDate = reportDate
                  ? moment(reportDate, MONTH_FORMAT).set({year: date})
                  : moment(date, MONTH_FORMAT);
               setSearchParams((searchParams) => ({...searchParams, reportDate: newDate.format(MONTH_FORMAT)}));
            } else {
               setSearchParams((searchParams) => ({...searchParams, reportDate: date}), {state: location?.state});
            }
         }
      },
      [isCashFlow, location?.pathname, location?.state, reportDate, setSearchParams],
   );

   useEffect(() => {
      if (!reportDate) {
         handleDateChange(moment().format(MONTH_FORMAT));
      }
   }, [handleDateChange, reportDate]);

   useEffectOnceConditional(() => {
      const matchBusiness = location.pathname.includes(BUSINESS_PATH);
      const matchToolsAndResources = location.pathname.includes(TOOL_PATH);
      const matchAdmin = location.pathname.includes(ADMIN_PATH);
      const matchCommunity = location.pathname.includes(COMMUNITY_PATH);
      const settingCommunity = location.pathname.includes(SETTINGS_PATH);

      if (matchBusiness) {
         setOpen(BUSINESS);
      } else if (matchToolsAndResources) {
         setOpen(TOOL_RESOURCES);
      } else if (matchAdmin) {
         setOpen(ADMIN);
      } else if (matchCommunity) {
         setOpen(COMMUNITY);
      } else if (settingCommunity) {
         setOpen(SETTINGS_PATH);
      }
      return true;
   }, []);

   useEffect(() => {
      if (disableFuture && moment(reportDate, MONTH_FORMAT).isAfter(moment(), 'month')) {
         setSearchParams((searchParams) => ({...searchParams, reportDate: moment().format(MONTH_FORMAT)}), {
            state: location?.state,
         });
      }
   }, [reportDate, disableFuture, location?.pathname, setSearchParams, location?.state]);

   useEffect(() => {
      if (taskData) {
         const tasksByDueDate = sortBy(taskData.tasks, 'dueDate');
         const lastDueDate = tasksByDueDate[0];
         setIsTaskOverDue(moment(lastDueDate?.dueDate).isBefore(moment(), 'day'));
      }
   }, [taskData]);

   const onDrawerClose = () => {
      if (isSmallWidth) {
         setIsDrawerOpen(false);
      }
   };

   const closeDrawer = () => {
      setIsDrawerOpen(false);
   };

   /**
    * Toggle the menu specified.
    * @param menu The menu to toggle.
    * @return {(function(): void)|*}
    */
   const toggleMenu = (menu) => () => {
      if (open === menu) {
         setOpen(undefined);
      } else {
         setOpen(menu);
      }
   };

   const handleDisableDate = (day) => {
      if (day && !disableFuture && endDate) {
         return !moment(day).isBefore(endDate, 'day');
      }
      return false;
   };

   const [openModal, setOpenModal] = React.useState(false);
   const [openModal2, setOpenModal2] = React.useState(false);

   const handleClick = () => {
      setOpenModal(true);
   };

   const handleClose = () => {
      setOpenModal(false);
   };

   const handleClick2 = () => {
      setOpenModal2(true);
   };

   const handleClose2 = () => {
      setOpenModal2(null);
   };

   const handleActivateFreeTrial = useCallback(
      async (event) => {
         event?.stopPropagation();
         event?.preventDefault();

         await activate({variables: {clientId}});
         const {data} = await refetch();
         setFreeTrialInfo(data?.client);
         //Fetch the user data to update the permissions after activiting free trial.
         fetchUserData();
      },
      [clientId, activate, refetch, setFreeTrialInfo],
   );

   return (
      <ResponsiveMobileDrawer>
         <Stack direction={'row'} display={'flex'} justifyContent={'center'} sx={{mt: 4}} alignContent={'flex-start'}>
            <img alt='' className={classes.imageStyle} src={darkMode ? LOGO_DARK : LOGO} />
            {location?.pathname !== '/' &&
               location?.pathname !== `/${CLIENT_DASHBOARD_PATH}/` &&
               location?.pathname !== `/${BUSINESS_FULL_PATH}/` && (
                  <CloseIcon className={classes.closeIcon} onClick={closeDrawer} />
               )}
         </Stack>
         {isClientSignup && !freeTrialActive && freeTrialExpires === null && (
            <ButtonFHG
               size='large'
               variant='contained'
               labelKey={'free.activate.button'}
               className={classes.activateButton}
               sx={{
                  alignSelf: 'center',
                  width: '80%',
                  fontWeight: 'bold',
                  fontSize: 14,
                  mt: 2,
                  color: theme.palette.mode === 'dark' ? PRIMARY_COLOR : lighten(theme.palette.primary.light, 0.3),
                  backgroundColor: theme.palette.mode === 'dark' ? 'white' : '#303030',
               }}
               onClick={handleActivateFreeTrial}
            />
         )}
         {isClientSignup && freeTrialExpires !== null && !freeTrialActive && (
            <Stack flexDirection={'column'} sx={{p: 2}} alignItems={'center'}>
               <TypographyFHG
                  id={'free.expired.label'}
                  color={messageColor}
                  variant={'h6'}
                  values={{freeTrialExpiresDays}}
               />
               <MuiLink href={SCHEDULE_LINK} className={classes.linkStyle} target='_blank' rel='noreferrer'>
                  Schedule a Call to Upgrade
               </MuiLink>
            </Stack>
         )}
         {isClientSignup && freeTrialActive && freeTrialExpiresDays > 0 && (
            <TypographyFHG
               id={'free.expires.label'}
               sx={{alignSelf: 'center'}}
               color={messageColor}
               variant={'h6'}
               values={{freeTrialExpiresDays}}
            />
         )}
         <Stack
            overflow={'auto'}
            flexDirection='column'
            className={classes.root}
            style={{padding: '0 16px 0 10px'}}
            flex={'1 1'}
         >
            <FranchiseListDropDown />
            <ClientListDropDown />
            <EntityListDropDown />
            <DatePickerFHG2
               className={classes.date}
               key={'reportDate ' + disableFuture}
               name={'reportDate'}
               openTo={isCashFlow ? 'year' : 'month'}
               views={isCashFlow ? ['year'] : ['year', 'month']}
               format={isCashFlow ? YEAR_FORMAT : MONTH_FORMAT}
               disableFuture={disableFuture}
               shouldDisableDate={!disableFuture && endDate ? handleDisableDate : undefined}
               value={isCashFlow && reportDate ? moment(reportDate, MONTH_FORMAT).format(YEAR_FORMAT) : reportDate}
               labelKey={'balance.reportDate.label'}
               onChange={handleDateChange}
               minDate={moment().subtract(8, 'year')}
               maxDate={!disableFuture && endDate ? endDate : moment().add(7, 'year')}
            />
            <SearchField />
            <List dense>
               <ListItemButton
                  disableGutters
                  className={`${classes.primaryLinkStyle} ${open === BUSINESS ? 'selected' : ''}`}
                  component={Button}
                  variant={open === BUSINESS ? 'contained' : undefined}
                  onClick={toggleMenu(BUSINESS)}
                  color='secondary'
               >
                  <img
                     src={MY_BUSINESS_ICON}
                     alt='business icon'
                     width={24 * SCALE_APP}
                     height={23 * SCALE_APP}
                     className={`${classes.imageColor} ${open === BUSINESS ? 'selected' : ''}`}
                  ></img>

                  <ListItemText
                     disableTypography
                     primary={
                        <TypographyFHG
                           className={`${classes.menuItemText} ${open === BUSINESS ? 'selected' : ''}`}
                           variant={'h4'}
                           id={'business.title'}
                        />
                     }
                  />
                  {open === BUSINESS ? <ExpandLess /> : <ExpandMore />}
               </ListItemButton>
               <Collapse in={open === BUSINESS} className={classes.collapseItem}>
                  <PermissionAllowPopover permissionName={LOAN_ANALYSIS_VIEW}>
                     <ListItemButtonFHG
                        primary={'Borrowing Power'}
                        to={`${BUSINESS_FULL_PATH}/${LOAN_ANALYSIS_PATH}`}
                        searchParamsAllowed={['franchiseId', 'clientId', 'entityId', 'reportDate']}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={LOAN_ANALYSIS_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={ASSETS_VIEW}>
                     <ListItemButtonFHG
                        primary={'Assets'}
                        to={`${BUSINESS_FULL_PATH}/${ENTITY_ASSET_PATH}`}
                        searchParamsAllowed={['franchiseId', 'clientId', 'entityId', 'reportDate']}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={ASSETS_VIEW}
                     />
                     <ListItemButtonFHG
                        primary={'Liabilities'}
                        to={`${BUSINESS_FULL_PATH}/${LIABILITIES_PATH}`}
                        searchParamsAllowed={['franchiseId', 'clientId', 'entityId', 'reportDate']}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={ASSETS_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={BALANCE_SHEET_VIEW}>
                     <ListItemButtonFHG
                        primary={'Balance Sheet'}
                        to={`${BUSINESS_FULL_PATH}/${BALANCE_SHEET_PATH}`}
                        searchParamsAllowed={['franchiseId', 'clientId', 'entityId', 'reportDate']}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={BALANCE_SHEET_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={CASH_FLOW_VIEW}>
                     <ListItemButtonFHG
                        primary={'Cash Flow'}
                        to={`${BUSINESS_FULL_PATH}/${CASH_FLOW_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={CASH_FLOW_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={FIELD_METRICS_VIEW}>
                     <ListItemButtonFHG
                        primary={'Field Metrics'}
                        to={`${BUSINESS_FULL_PATH}/${PROFIT_LOSS_PATH}`}
                        searchParamsAllowed={['franchiseId', 'clientId', 'entityId', 'reportDate']}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={FIELD_METRICS_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={CONTRACTS_VIEW}>
                     <ListItemButtonFHG
                        primary={'Contracts'}
                        to={`${BUSINESS_FULL_PATH}/${CONTRACT_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={CONTRACTS_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={ENTITIES_VIEW}>
                     <ListItemButtonFHG
                        primary={'Business Structure'}
                        to={`${BUSINESS_FULL_PATH}/${CLIENT_ENTITY_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={ENTITIES_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={ACCOUNTABILITY_CHART_VIEW}>
                     <ListItemButtonFHG
                        primary={'Team Chart'}
                        to={`${BUSINESS_FULL_PATH}/${ACCOUNTABILITY_CLIENT_ENTITY_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={ACCOUNTABILITY_CHART_VIEW}
                     />
                  </PermissionAllowPopover>
                  <PermissionAllowPopover permissionName={BUSINESS_PLAN_VIEW}>
                     <ListItemButtonFHG
                        primary={'Business Game Plan'}
                        to={`${BUSINESS_FULL_PATH}/${GAME_PLAN_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={BUSINESS_PLAN_VIEW}
                     />
                  </PermissionAllowPopover>
               </Collapse>
               <PermissionAllowPopover permissionName={TOOLS_VIEW}>
                  <ListItemButtonFHG
                     disableGutters
                     component={Link}
                     className={`${classes.primaryLinkStyle} ${open === KNOWLEDGE_RESOURCES ? 'selected' : ''}`}
                     onClick={toggleMenu(KNOWLEDGE_RESOURCES)}
                     variant={MAIN}
                     hasSearch={true}
                     color='secondary'
                     to={`${TOOL_FULL_PATH}/${KNOWLEDGE_LIBRARY_PATH}`}
                  >
                     <img
                        src={KNOWLEDGE_ICON}
                        alt='knowledge icon'
                        width={24 * SCALE_APP}
                        className={`${classes.imageColor} ${open === KNOWLEDGE_RESOURCES ? 'selected' : ''}`}
                     />
                     <ListItemText
                        disableTypography
                        primary={
                           <TypographyFHG
                              className={`${classes.menuItemText} ${open === KNOWLEDGE_RESOURCES ? 'selected' : ''}`}
                              variant={'h4'}
                           >
                              Knowledge Center
                           </TypographyFHG>
                        }
                     />
                  </ListItemButtonFHG>
                  <ListItemButton
                     disableGutters
                     className={`${classes.primaryLinkStyle} ${open === TOOL_RESOURCES ? 'selected' : ''}`}
                     component={Button}
                     onClick={toggleMenu(TOOL_RESOURCES)}
                     variant={open === TOOL_RESOURCES ? 'contained' : undefined}
                     color='secondary'
                  >
                     <img
                        src={TOOLS_RESOURCES}
                        alt='tools icon'
                        width={24 * SCALE_APP}
                        className={`${classes.imageColor} ${open === TOOL_RESOURCES ? 'selected' : ''}`}
                     ></img>

                     <ListItemText
                        disableTypography
                        primary={
                           <TypographyFHG
                              className={`${classes.menuItemText} ${open === TOOL_RESOURCES ? 'selected' : ''}`}
                              variant={'h4'}
                              id={'tools.resources.title'}
                           />
                        }
                     />
                     {open === TOOL_RESOURCES ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={open === TOOL_RESOURCES} className={classes.collapseItem}>
                     <ListItemButtonFHG
                        primary={'Loan Calculator'}
                        to={`${TOOL_FULL_PATH}/${LOAN_AMORTIZATION_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={TOOLS_VIEW}
                     />
                     {/*TODO Taxable Income is partly converted to the new UI. Finish it after release. This will be enabled when Taxable Income is ready*/}
                     {isAdmin && localStorage.showTaxableIncome === 'true' && (
                        <ListItemButtonFHG
                           primary={'Taxable Income'}
                           to={`${TOOL_FULL_PATH}/${TAXABLE_INCOME_PATH}`}
                           hasSearch={true}
                           onClick={onDrawerClose}
                           permission={TOOLS_VIEW}
                        />
                     )}
                     <ListItemButtonFHG
                        primary={
                           <Badge
                              classes={{root: classes.badgeStyle}}
                              color='error'
                              invisible={!isTaskOverDue}
                              variant='dot'
                           >
                              Tasks & Notes
                           </Badge>
                        }
                        to={`${TOOL_FULL_PATH}/${CLIENT_TASK_NOTES_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={TOOLS_VIEW}
                     />
                     <ListItemButtonFHG
                        primary='Files'
                        to={`${TOOL_FULL_PATH}/${FILES_PATH}`}
                        hasSearch={true}
                        onClick={onDrawerClose}
                        permission={TOOLS_VIEW}
                     />
                  </Collapse>
                  {/*<ListItemButton*/}
                  {/*   disableGutters*/}
                  {/*   className={`${classes.primaryLinkStyle} ${open === COMMUNITY ? 'selected' : ''}`}*/}
                  {/*   component={Button}*/}
                  {/*   onClick={toggleMenu(COMMUNITY)}*/}
                  {/*   variant={open === COMMUNITY ? 'contained' : undefined}*/}
                  {/*   style={{width: 'calc(100% - 8px)'}}*/}
                  {/*   color='secondary'*/}
                  {/*>*/}
                  {/*   <img*/}
                  {/*      src={COMMUNITY_ICON}*/}
                  {/*      alt='tools icon'*/}
                  {/*      width={24 * SCALE_APP}*/}
                  {/*      className={`${classes.imageColor} ${open === COMMUNITY ? 'selected' : ''}`}*/}
                  {/*   ></img>*/}

                  {/*   <ListItemText*/}
                  {/*      disableTypography*/}
                  {/*      primary={*/}
                  {/*         <TypographyFHG*/}
                  {/*            className={`${classes.menuItemText} ${open === COMMUNITY ? 'selected' : ''}`}*/}
                  {/*            color='secondary'*/}
                  {/*            variant={'h4'}*/}
                  {/*            id={'community.title'}*/}
                  {/*         />*/}
                  {/*      }*/}
                  {/*   />*/}
                  {/*   {open === COMMUNITY ? <ExpandLess /> : <ExpandMore />}*/}
                  {/*</ListItemButton>*/}
                  {/*<Collapse in={open === COMMUNITY} className={classes.collapseItem}>*/}
                  {/*   <ListItemButtonFHG*/}
                  {/*      primary={'Chat'}*/}
                  {/*      to={`${COMMUNITY_FULL_PATH}/${CHAT_PATH}`}*/}
                  {/*      hasSearch={false}*/}
                  {/*      onClick={onDrawerClose}*/}
                  {/*   />*/}
                  {/*</Collapse>*/}
               </PermissionAllowPopover>

               {isAdmin && (
                  <>
                     <ListItemButton
                        disableGutters
                        className={`${classes.primaryLinkStyle} ${open === ADMIN ? 'selected' : ''}`}
                        component={Button}
                        variant={open === ADMIN ? 'contained' : undefined}
                        onClick={toggleMenu(ADMIN)}
                        color='secondary'
                     >
                        <img
                           src={ADMIN_ICON}
                           alt='admins icon'
                           width={24 * SCALE_APP}
                           className={`${classes.imageColor} ${open === ADMIN ? 'selected' : ''}`}
                        ></img>

                        <ListItemText
                           disableTypography
                           primary={
                              <TypographyFHG
                                 className={`${classes.menuItemText} ${open === ADMIN ? 'selected' : ''}`}
                                 variant={'h4'}
                                 id={'admin.title'}
                              />
                           }
                        />
                        {open === ADMIN ? <ExpandLess /> : <ExpandMore />}
                     </ListItemButton>
                     <Collapse in={open === ADMIN} className={classes.collapseItem}>
                        {isExecutive && (
                           <ListItemButtonFHG
                              primary={'Users'}
                              to={`../${ADMIN_FULL_PATH}/${ADMIN_USER_PATH}`}
                              hasSearch={true}
                              onClick={onDrawerClose}
                           />
                        )}
                        {isSuperAdmin && (
                           <ListItemButtonFHG
                              primary={'Licensees'}
                              to={`../${ADMIN_FULL_PATH}/${ADMIN_FRANCHISES_PATH}/${FRANCHISE_EDIT}`}
                              hasSearch={true}
                              onClick={onDrawerClose}
                           />
                        )}
                        {isSuperAdmin && (
                           <ListItemButtonFHG
                              primary={'Memberships'}
                              to={`../${ADMIN_FULL_PATH}/${ADMIN_MEMBERSHIP_PATH}`}
                              hasSearch={true}
                              onClick={onDrawerClose}
                           />
                        )}
                        <ListItemButtonFHG
                           primary={'Clients'}
                           to={`../${ADMIN_FULL_PATH}/${ADMIN_SETUP_PATH}/${CLIENT_EDIT}`}
                           toSelect={`../${ADMIN_FULL_PATH}/${ADMIN_SETUP_PATH}`}
                           state={{isNew: false}}
                           hasSearch={true}
                           onClick={onDrawerClose}
                        />
                        <ListItemButtonFHG
                           primary={'Invitations'}
                           to={`../${ADMIN_FULL_PATH}/${FRANCHISE_INVITE}`}
                           state={{isNew: false}}
                           hasSearch={true}
                           onClick={onDrawerClose}
                           sx={{ml: 2}}
                        />
                        {isSuperAdmin && (
                           <ListItemButtonFHG
                              primary={'Template Folders'}
                              to={`../${ADMIN_FULL_PATH}/${FOLDERS_PATH}`}
                              hasSearch={true}
                              onClick={onDrawerClose}
                           />
                        )}
                        {isSuperAdmin && (
                           <ListItemButtonFHG
                              primary={'Feedback'}
                              to={`/${ADMIN_FULL_PATH}/${FEEDBACK_PATH}`}
                              hasSearch={true}
                              onClick={onDrawerClose}
                           />
                        )}
                     </Collapse>
                  </>
               )}
            </List>
         </Stack>
         <Stack
            display='flex'
            justifyContent={'flex-end'}
            flex={'0 0'}
            minHeight={'min-content'}
            mx={3.5}
            mt={1.5}
            mb={2}
         >
            <Divider />
            <List dense>
               {/* <ListItemButton
                     disableGutters
                     className={classes.primaryLinkStyle}
                     component={Button}
                     style={{width: 'calc(100% - 8px)', opacity: 1, color: theme.palette.secondary.main}}
                     color='secondary'
                  >
                     <img
                        src={REFER_ICON}
                        alt='tools icon'
                        width={24 * SCALE_APP}
                        className={`${classes.imageColor} `}
                     ></img>
                     <ListItemText
                        disableTypography
                        primary={
                           <TypographyFHG
                              className={`${classes.menuItemText}`}
                              color='secondary'
                              // variant={'h4'}
                              id={'refer.label'}
                           />
                        }
                     />
                  </ListItemButton> */}
               {/*<ListItemButton*/}
               {/*   disableGutters*/}
               {/*   className={classes.primaryLinkStyle}*/}
               {/*   component={Button}*/}
               {/*   style={{width: 'calc(100% - 8px)', opacity: 1, color: theme.palette.secondary.main}}*/}
               {/*   color='secondary'*/}
               {/*   href={KNOWLEDGE_LIBRARY_PATH}*/}
               {/*   target='_blank'*/}
               {/*>*/}
               {/*   <img*/}
               {/*      src={HELP_CENTER_ICON}*/}
               {/*      alt='tools icon'*/}
               {/*      width={24 * SCALE_APP}*/}
               {/*      className={`${classes.imageColor} `}*/}
               {/*   ></img>*/}
               {/*   <ListItemText*/}
               {/*      disableTypography*/}
               {/*      primary={*/}
               {/*         <TypographyFHG*/}
               {/*            className={`${classes.menuItemText}`}*/}
               {/*            color='secondary'*/}
               {/*            // variant={'h4'}*/}
               {/*            id={'helpCenter.label'}*/}
               {/*         />*/}
               {/*      }*/}
               {/*   />*/}
               {/*</ListItemButton>*/}
               <ListItemButton
                  disableGutters
                  className={classes.primaryLinkStyle}
                  component={Link}
                  style={{opacity: 1, color: theme.palette.secondary.main}}
                  color='secondary'
                  to='https://senja.io/p/farmermetrics/r/oV8wPb'
                  target='_blank'
               >
                  <img
                     src={REVIEW_ICON}
                     alt='review icon'
                     width={24 * SCALE_APP}
                     className={`${classes.imageColor} `}
                  ></img>
                  <ListItemText
                     disableTypography
                     primary={<TypographyFHG className={`${classes.menuItemText}`} id={'nav.review.label'} />}
                  />
               </ListItemButton>
               <ListItemButton
                  disableGutters
                  className={classes.primaryLinkStyle}
                  component={Button}
                  style={{opacity: 1, color: theme.palette.secondary.main}}
                  color='secondary'
                  onClick={handleClick}
               >
                  <img
                     src={FEEDBACK_ICON}
                     alt='feedback icon'
                     width={24 * SCALE_APP}
                     className={`${classes.imageColor} `}
                  ></img>
                  <ListItemText
                     disableTypography
                     primary={
                        <TypographyFHG
                           className={`${classes.menuItemText}`}
                           // variant={'h4'}
                           id={'nav.provideFeedBack.label'}
                        />
                     }
                  />
               </ListItemButton>
               <ProvideFeedbackModal handleClose={handleClose} open={openModal} onSuccess={handleClick2} />
               <ModalDialog
                  open={openModal2}
                  onClose={handleClose2}
                  messageKey='feedback.sent'
                  submitKey='close.button'
                  onSubmit={handleClose2}
                  cancelKey=''
               />
               {/* <ListItemButton
                     disableGutters
                     className={`${classes.primaryLinkStyle} ${open === SETTINGS_PATH ? 'selected' : ''}`}
                     component={Button}
                     style={{width: 'calc(100% - 8px)', opacity: 1, color: theme.palette.secondary.main}}
                     color='secondary'
                     to={`/client/${SETTINGS_PATH}`}
                     onClick={toggleMenu(SETTINGS_PATH)}
                     variant={open === SETTINGS_PATH ? 'contained' : undefined}
                  >
                     <img
                        src={SETTING_ICON}
                        alt='tools icon'
                        width={24 * SCALE_APP}
                        className={`${classes.imageColor} ${open === SETTINGS_PATH ? 'selected' : ''}`}
                     ></img>
                     <ListItemText
                        disableTypography
                        primary={
                           <TypographyFHG
                              className={`${classes.menuItemText} ${open === SETTINGS_PATH ? 'selected' : ''}`}
                              color='secondary'
                              // variant={'h4'}
                              id={'setting.label'}
                           />
                        }
                     />
                  </ListItemButton> */}
            </List>
            <SettingsPopup />
         </Stack>
      </ResponsiveMobileDrawer>
   );
}

ClientDrawer.propTypes = {
   replaceValue: PropTypes.any,
   location: PropTypes.any,
   onClick: PropTypes.func,
};

function SettingsPopup() {
   const classes = useStyles();
   const [anchorEl, setAnchorEl] = useState(null);
   const openOption = Boolean(anchorEl);
   const user = useRecoilValue(userStatus);
   const [darkMode, setDarkMode] = useRecoilState(darkModeAtom);
   const setAuthStateData = useSetRecoilState(authenticationDataStatus);

   let match = useMatch({path: SETTINGS_FULL_PATH + '/*'});

   const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handlePopoverClose = () => {
      setAnchorEl(null);
   };

   return (
      <>
         <ListItemButtonFHG
            component={Button}
            className={`${classes.primaryLinkStyle} ${!!match || openOption ? 'selected' : ''}`}
            selected={!!match || openOption}
            hasSearch={false}
            startIcon={
               user?.profilePic?.imageS3 ? (
                  <Avatar alt='Avatar' src={user.profilePic.imageS3} sx={{width: 20, height: 20, mr: 1}} />
               ) : (
                  <Person fontSize={'large'} color={'secondary'} sx={{mr: 1}} />
               )
            }
            primary={user?.contactName || user?.username}
            onClick={handlePopoverOpen}
         >
            <ExpandMore />
         </ListItemButtonFHG>

         <Popover
            id='mouse-over-popover'
            classes={{
               paper: classes.paper,
            }}
            open={openOption}
            anchorEl={anchorEl}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'right',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'left',
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
         >
            <Stack flexDirection='column' justifyContent='center' alignItems='center' mt={2} mx={2}>
               <Avatar
                  src={user?.profilePic?.imageS3}
                  style={{
                     width: SCALE_APP * 100,
                     height: SCALE_APP * 100,
                  }}
               />
               <TypographyFHG mt={2} color={'text.primary'} variant='fs28700'>
                  {user?.contactName || user?.username}
               </TypographyFHG>
               <TypographyFHG mt={0.5} color={'text.primary'} variant='fs18400'>
                  {user?.email}
               </TypographyFHG>
            </Stack>
            <Divider sx={{my: 2}} />
            <ListItemButtonPlainFHG
               startIcon={
                  <img
                     src={MOON_ICON}
                     alt='dark mode icon'
                     width={20 * SCALE_APP}
                     className={`${classes.imageColor} `}
                  />
               }
               onClick={() => {
                  setDarkMode((isDarkMode) => !isDarkMode);
                  delay(() => {
                     handlePopoverClose();
                     localStorage.setItem('darkMode', localStorage.darkMode !== 'true');
                  }, 500);
               }}
               disableRipple
               variant={MAIN}
               primaryKey={'dark.mode'}
               sx={{'&:hover': {backgroundColor: 'unset'}, cursor: 'default'}}
               dense
            >
               <Switch checked={darkMode} sx={{pointerEvents: 'auto', cursor: 'pointer'}} size={'small'} />
            </ListItemButtonPlainFHG>
            <Divider sx={{my: 2}} />
            <ListItemButtonPlainFHG
               className={classes.fileStyle}
               startIcon={
                  <img src={USER_ICON} alt='user icon' width={20 * SCALE_APP} className={`${classes.imageColor} `} />
               }
               variant={MAIN}
               component={Link}
               to={SETTINGS_PROFILE_FULL_PATH}
               onClick={() => {
                  handlePopoverClose();
               }}
               primaryKey={'settings.userSetting.label'}
               dense
            />

            <Divider sx={{my: 2}} />
            <ListItemButtonPlainFHG
               className={classes.fileStyle}
               startIcon={
                  <img
                     src={LOGOUT_ICON}
                     alt='billing icon'
                     width={24 * SCALE_APP}
                     className={`${classes.imageColor} `}
                  />
               }
               variant={MAIN}
               component={Button}
               fullWidth
               onClick={() => {
                  Auth.signOut();
                  setAuthStateData({});
                  window.Intercom('shutdown');
                  window.Intercom('boot', {
                     app_id: INTERCOM_APP_ID,
                  });
               }}
               primaryKey={'path.logout'}
               dense
            />
         </Popover>
      </>
   );
}
