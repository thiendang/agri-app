import makeStyles from '@mui/styles/makeStyles';
import {lazy} from 'react';
import React from 'react';
import {Outlet} from 'react-router-dom';
import {Routes} from 'react-router-dom';
import {useMatch} from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {Route, useLocation} from 'react-router-dom';
import AssetEdit from '../../components/assets/AssetEdit';
import EditDrawer from '../../components/EditDrawer';
import EntityEdit from '../../components/EntityEdit';
import EntityFiles from '../../components/EntityFiles';
import LiabilityEdit from '../../components/liabilities/LiabilityEdit';
import {ASSETS_VIEW} from '../../components/permission/PermissionAllow';
import {ASSETS_EDIT} from '../../components/permission/PermissionAllow';
import {FIELD_METRICS_VIEW} from '../../components/permission/PermissionAllow';
import {FIELD_METRICS_EDIT} from '../../components/permission/PermissionAllow';
import {BALANCE_SHEET_VIEW} from '../../components/permission/PermissionAllow';
import {TOOLS_EDIT} from '../../components/permission/PermissionAllow';
import {LOAN_ANALYSIS_EDIT} from '../../components/permission/PermissionAllow';
import {CONTRACTS_EDIT} from '../../components/permission/PermissionAllow';
import {ENTITIES_EDIT} from '../../components/permission/PermissionAllow';
import {ACCOUNTABILITY_CHART_EDIT} from '../../components/permission/PermissionAllow';
import {TOOLS_VIEW} from '../../components/permission/PermissionAllow';
import {BUSINESS_PLAN_VIEW} from '../../components/permission/PermissionAllow';
import {CASH_FLOW_VIEW} from '../../components/permission/PermissionAllow';
import {CONTRACTS_VIEW} from '../../components/permission/PermissionAllow';
import {LOAN_ANALYSIS_VIEW} from '../../components/permission/PermissionAllow';
import {ENTITIES_VIEW} from '../../components/permission/PermissionAllow';
import {ACCOUNTABILITY_CHART_VIEW} from '../../components/permission/PermissionAllow';
import PermissionAllow from '../../components/permission/PermissionAllow';
import PermissionAllowOutlet from '../../components/permission/PermissionAllowOutlet';
import PermissionSuperAdmin from '../../components/permission/PermissionSuperAdmin';
import TaskEdit from '../../components/TaskEdit';
import {SETTINGS_BILLING_PATH} from '../../Constants';
import {SETTINGS_ACCOUNT_PATH} from '../../Constants';
import {
   CROP_SUMMARY_PATH,
   GAME_PLAN_PATH,
   KNOWLEDGE_LIBRARY_PATH,
   PROFIT_LOSS_PATH,
   SETTINGS_2FA_PATH,
   SETTINGS_APPEARANCE_PATH,
   SETTINGS_PATH,
   SETTINGS_PROFILE_PATH,
} from '../../Constants';
import {SECTION_PATH} from '../../Constants';
import {COURSE_PATH} from '../../Constants';
import {CLIENT_TASK_NOTES_OLD} from '../../Constants';
import {LOAN_AMORTIZATION_OLD} from '../../Constants';
import {FILES_OLD} from '../../Constants';
import {TAXABLE_INCOME_OLD} from '../../Constants';
import {CASH_FLOW_OLD} from '../../Constants';
import {BALANCE_SHEET_OLD} from '../../Constants';
import {LOAN_ANALYSIS_OLD} from '../../Constants';
import {CONTRACT_OLD} from '../../Constants';
import {LIABILITIES_OLD} from '../../Constants';
import {ENTITY_ASSET_OLD} from '../../Constants';
import {ACCOUNTABILITY_CLIENT_ENTITY_OLD} from '../../Constants';
import {CLIENT_ENTITY_DASHBOARD_OLD} from '../../Constants';
import {CLIENT_DASHBOARD_OLD} from '../../Constants';
import {HEDGE_EDIT_PATH} from '../../Constants';
import {FUTURE_EDIT_PATH} from '../../Constants';
import {CASH_EDIT_PATH} from '../../Constants';
import {BUSINESS_PATH} from '../../Constants';
import {TOOL_PATH} from '../../Constants';
import {EDIT_PATH} from '../../Constants';
import {TAXABLE_INCOME_PATH} from '../../Constants';
import {CONTRACT_PATH} from '../../Constants';
import {ACCOUNTABILITY_CLIENT_ENTITY_PATH} from '../../Constants';
import {CLIENT_TASK_NOTES_PATH} from '../../Constants';
import {ENTITY_EDIT} from '../../Constants';
import {CLIENT_ENTITY_DASHBOARD_PATH} from '../../Constants';
import {CLIENT_ENTITY_PATH} from '../../Constants';
import {
   ENTITY_ASSET_PATH,
   LIABILITIES_PATH,
   LOAN_ANALYSIS_PATH,
   BALANCE_SHEET_PATH,
   CASH_FLOW_PATH,
   LOAN_AMORTIZATION_PATH,
   FILES_PATH,
} from '../../Constants';
import NotImplemented from '../../fhg/components/NotImplemented';
import Redirect from '../../fhg/components/Redirect';
import AdminAccess from '../../fhg/components/security/AdminAccess';
import SeatEdit from './accountability/SeatEdit';
import Assets from './assets/Assets';
import BalanceSheet from './balanceSheet/BalanceSheet';
import CashFlow from './cashFlow/CashFlow';
import ClientEntities from './entity/ClientEntities';
import Liabilities from './Liabilities';
import LoanAmortization from './LoanAmortization';
import AccountEdit from './settings/AccountEdit';
import SettingLayout from './settings/SettingLayout';
import {ProfileEditView} from './settings/Settings';
import TasksAndNotes from './TasksAndNotes';
import LoanAnalysis from './loanAnalysis/LoanAnalysis';
import {KnowledgeCenter} from './knowledgeCenter/KnowledgeCenter';
import CourseDetail from './knowledgeCenter/CourseDetail';
import {Settings2FA} from './settings/Settings2FA';
import ProfitLoss from './profitLoss/ProfitAndLoss';
import AddCrop from './profitLoss/AddCrop';
import CropSummary from './profitLoss/CropSummary';
import Appearance from './settings/Appearance';

const AccountabilityChart = lazy(() => import('./accountability/AccountabilityChart'));
const TaxableIncome = lazy(() => import('./tableIncome/TaxableIncome'));
const GamePlan = lazy(() => import('./gamePlan/GamePlan'));
const Contracts = lazy(() => import('./contracts/Contracts'));
const CashContract = lazy(() => import('./contracts/CashContract'));
const FutureContract = lazy(() => import('./contracts/FutureContract'));
const HedgeContract = lazy(() => import('./contracts/HedgeContract'));
const CourseEdit = lazy(() => import('./knowledgeCenter/CourseEdit'));
const SectionPanel = lazy(() => import('./knowledgeCenter/SectionPanel'));
const SectionEdit = lazy(() => import('./knowledgeCenter/SectionEdit'));

const useStyles = makeStyles(
   {
      root: {
         display: 'flex',
         height: '100%',
      },
      drawerStyle: {
         flexShrink: 0,
      },
   },
   {name: 'ClientMainStyles'},
);

/**
 * Main component for clients, accessible only if the user has been authenticated. Contains the routing for the client
 * paths.
 *
 * Reviewed: 5/28/21
 */
export default function ClientMain() {
   const classes = useStyles();
   const navigate = useNavigate();
   const location = useLocation();
   const routeMatch = useMatch({path: CLIENT_ENTITY_DASHBOARD_PATH, end: false, caseSensitive: true});

   /**
    * Close the edit drawer. The edit is information is removed from the location.state.
    */
   const handleClose = () => {
      navigate(location, {replace: true, state: {}});
   };

   return (
      <div className={classes.root}>
         <Routes>
            <Route path={BUSINESS_PATH} element={<Outlet />}>
               <Route
                  path={ACCOUNTABILITY_CLIENT_ENTITY_PATH}
                  element={
                     <PermissionAllow permissionName={ACCOUNTABILITY_CHART_VIEW}>
                        <AccountabilityChart />
                     </PermissionAllow>
                  }
               >
                  <Route
                     path={EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={ACCOUNTABILITY_CHART_EDIT}>
                           <SeatEdit />
                        </PermissionAllow>
                     }
                  />
               </Route>
               <Route
                  path={CLIENT_ENTITY_PATH}
                  element={
                     <PermissionAllow permissionName={ENTITIES_VIEW}>
                        <ClientEntities />
                     </PermissionAllow>
                  }
               >
                  <Route
                     path={EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={ENTITIES_EDIT}>
                           <EntityEdit />
                        </PermissionAllow>
                     }
                  />
               </Route>
               <Route
                  path={ENTITY_ASSET_PATH}
                  element={
                     <PermissionAllow permissionName={ASSETS_VIEW}>
                        <Assets />
                     </PermissionAllow>
                  }
               >
                  <Route
                     path={EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={ASSETS_EDIT}>
                           <EditDrawer open={true}>
                              <AssetEdit />
                           </EditDrawer>
                        </PermissionAllow>
                     }
                  />
               </Route>
               <Route
                  path={LIABILITIES_PATH}
                  element={
                     <PermissionAllow permissionName={ASSETS_VIEW}>
                        <Liabilities />
                     </PermissionAllow>
                  }
               >
                  <Route
                     path={EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={ASSETS_EDIT}>
                           <EditDrawer open={true}>
                              <LiabilityEdit />
                           </EditDrawer>
                        </PermissionAllow>
                     }
                  />
               </Route>
               <Route
                  path={`${CONTRACT_PATH}/*`}
                  element={
                     <PermissionAllow permissionName={CONTRACTS_VIEW}>
                        <Contracts />
                     </PermissionAllow>
                  }
               >
                  <Route
                     exact
                     path={CASH_EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={CONTRACTS_EDIT}>
                           <CashContract />
                        </PermissionAllow>
                     }
                  />
                  <Route
                     exact
                     path={FUTURE_EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={CONTRACTS_EDIT}>
                           <FutureContract />
                        </PermissionAllow>
                     }
                  />
                  <Route
                     exact
                     path={HEDGE_EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={CONTRACTS_EDIT}>
                           <HedgeContract />
                        </PermissionAllow>
                     }
                  />
               </Route>
               <Route
                  exact
                  path={PROFIT_LOSS_PATH}
                  element={
                     <PermissionAllow permissionName={FIELD_METRICS_VIEW}>
                        <ProfitLoss />
                     </PermissionAllow>
                  }
               >
                  <Route
                     path={EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={FIELD_METRICS_EDIT}>
                           <EditDrawer open={true}>
                              <AddCrop />
                           </EditDrawer>
                        </PermissionAllow>
                     }
                  />
               </Route>
               <Route exact path={CROP_SUMMARY_PATH} element={<CropSummary />} />
               <Route
                  exact
                  path={LOAN_ANALYSIS_PATH}
                  element={
                     <PermissionAllow permissionName={LOAN_ANALYSIS_VIEW}>
                        <LoanAnalysis />
                     </PermissionAllow>
                  }
               />
               <Route
                  exact
                  path={BALANCE_SHEET_PATH}
                  element={
                     <PermissionAllow permissionName={BALANCE_SHEET_VIEW}>
                        <BalanceSheet />
                     </PermissionAllow>
                  }
               />
               <Route
                  exact
                  path={CASH_FLOW_PATH}
                  element={
                     <PermissionAllow permissionName={CASH_FLOW_VIEW}>
                        <CashFlow key={`client${routeMatch?.params?.clientId} entity${routeMatch?.params?.entityId}`} />
                     </PermissionAllow>
                  }
               />
               <Route
                  exact
                  path={GAME_PLAN_PATH}
                  element={
                     <PermissionAllow permissionName={BUSINESS_PLAN_VIEW}>
                        <GamePlan />
                     </PermissionAllow>
                  }
               />
            </Route>
            <Route path={TOOL_PATH} element={<PermissionAllowOutlet permissionName={TOOLS_VIEW} />}>
               <Route exact path={LOAN_AMORTIZATION_PATH} element={<LoanAmortization />} />
               <Route
                  path={TAXABLE_INCOME_PATH}
                  element={
                     <AdminAccess>
                        <TaxableIncome
                           key={`client${routeMatch?.params?.clientId} entity${routeMatch?.params?.entityId}`}
                        />
                     </AdminAccess>
                  }
               />
               <Route exact path={KNOWLEDGE_LIBRARY_PATH} element={<KnowledgeCenter />}>
                  <Route
                     exact
                     path={EDIT_PATH}
                     element={
                        <PermissionSuperAdmin>
                           <CourseEdit open />
                        </PermissionSuperAdmin>
                     }
                  />
                  <Route exact path={COURSE_PATH} element={<CourseDetail />}>
                     <Route
                        exact
                        path={SECTION_PATH}
                        element={
                           <PermissionSuperAdmin>
                              <SectionEdit />
                           </PermissionSuperAdmin>
                        }
                     />
                     <Route index element={<SectionPanel />} />
                  </Route>
               </Route>
               <Route exact path={FILES_PATH} element={<EntityFiles />} />
               <Route
                  exact
                  path={CLIENT_TASK_NOTES_PATH}
                  element={
                     <PermissionAllow permissionName={TOOLS_VIEW}>
                        <TasksAndNotes />
                     </PermissionAllow>
                  }
               >
                  <Route
                     path={EDIT_PATH}
                     element={
                        <PermissionAllow permissionName={TOOLS_EDIT}>
                           <EditDrawer open={true} onClose={location?.state?.edit === ENTITY_EDIT && handleClose}>
                              <TaskEdit />,
                           </EditDrawer>
                        </PermissionAllow>
                     }
                  />
               </Route>
            </Route>
            {/*<Route path={COMMUNITY_PATH} element={<Outlet />}>*/}
            {/*   <Route exact path={CHAT_PATH} element={<Chat />} />*/}
            {/*</Route>*/}
            <Route exact path={SETTINGS_PATH} element={<SettingLayout />}>
               <Route exact path={SETTINGS_PROFILE_PATH} element={<ProfileEditView />} />
               <Route exact path={SETTINGS_ACCOUNT_PATH} element={<AccountEdit />} />
               <Route exact path={SETTINGS_BILLING_PATH} element={<NotImplemented title={'Billing'} />} />
               <Route exact path={SETTINGS_APPEARANCE_PATH} element={<Appearance />} />
               <Route exact path={SETTINGS_2FA_PATH} element={<Settings2FA />} />
            </Route>
            {/* Old Routes to be redirected to the new paths. */}
            <Route
               exact
               path={CLIENT_DASHBOARD_OLD}
               element={<Redirect to={`../${BUSINESS_PATH}/${CLIENT_ENTITY_PATH}`} />}
            />
            <Route
               exact
               path={CLIENT_ENTITY_DASHBOARD_OLD}
               element={<Redirect to={`../${BUSINESS_PATH}/${CLIENT_ENTITY_PATH}`} />}
            />
            <Route
               exact
               path={ACCOUNTABILITY_CLIENT_ENTITY_OLD}
               element={<Redirect to={`../${BUSINESS_PATH}/${ACCOUNTABILITY_CLIENT_ENTITY_PATH}`} />}
            />
            <Route
               exact
               path={ENTITY_ASSET_OLD}
               element={<Redirect to={`../${BUSINESS_PATH}/${ENTITY_ASSET_PATH}`} />}
            />
            <Route exact path={LIABILITIES_OLD} element={<Redirect to={`../${BUSINESS_PATH}/${LIABILITIES_PATH}`} />} />
            <Route exact path={CONTRACT_OLD} element={<Redirect to={`../${BUSINESS_PATH}/${CONTRACT_PATH}`} />} />
            <Route
               exact
               path={LOAN_ANALYSIS_OLD}
               element={<Redirect to={`../${BUSINESS_PATH}/${LOAN_ANALYSIS_PATH}`} />}
            />
            <Route
               exact
               path={BALANCE_SHEET_OLD}
               element={<Redirect to={`../${BUSINESS_PATH}/${BALANCE_SHEET_PATH}`} />}
            />
            <Route exact path={CASH_FLOW_OLD} element={<Redirect to={`../${BUSINESS_PATH}/${CASH_FLOW_PATH}`} />} />
            <Route
               exact
               path={TAXABLE_INCOME_OLD}
               element={<Redirect to={`../${TOOL_PATH}/${TAXABLE_INCOME_PATH}`} />}
            />
            <Route exact path={FILES_OLD} element={<Redirect to={`../${TOOL_PATH}/${FILES_PATH}`} />} />
            <Route
               exact
               path={LOAN_AMORTIZATION_OLD}
               element={<Redirect to={`../${TOOL_PATH}/${LOAN_AMORTIZATION_PATH}`} />}
            />
            <Route
               exact
               path={CLIENT_TASK_NOTES_OLD}
               element={<Redirect to={`../${TOOL_PATH}/${CLIENT_TASK_NOTES_PATH}`} />}
            />
         </Routes>
      </div>
   );
}
