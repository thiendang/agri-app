import {Alert} from '@mui/material';
import Stack from '@mui/material/Stack';
import makeStyles from '@mui/styles/makeStyles';
import {pull} from 'lodash';
import {concat} from 'lodash';
import {map} from 'lodash';
import {indexOf} from 'lodash';
import find from 'lodash/find';
import keys from 'lodash/keys';
import without from 'lodash/without';
import {useMemo} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {FIELD_METRICS_VIEW} from '../../../components/permission/PermissionAllow';
import {FIELD_METRICS_EDIT} from '../../../components/permission/PermissionAllow';
import useAllPermissionIdList from '../../../components/permission/useAllPermissions';
import {MEMBERSHIPS_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import Typography from '../../../fhg/components/Typography';
import {CardContent} from '@mui/material';
import {Card} from '@mui/material';
import uniq from 'lodash/uniq';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import useEffectOnceConditional from '../../../fhg/hooks/useEffectOnceConditional';
import {userRoleState} from '../../Main';
import {useTheme} from '@mui/styles';

const VIEW_PREFIX = 'view_';
const EDIT_PREFIX = 'edit_';
// const USE_PREFIX = 'use_';
const DEFAULT_PREFIX = [VIEW_PREFIX, EDIT_PREFIX];

const useStyles = makeStyles(
   (theme) => ({
      cardStyle: {
         width: '100%',
         margin: 2,
         boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
         transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),
      },
      disabledStyle: {
         opacity: '0.6',
      },
      root: {
         [theme.breakpoints.down('lg')]: {
            '& .MuiFormControlLabel-root': {
               marginLeft: 0,
               marginRight: theme.spacing(1),
            },
         },
         borderBottom: `1px solid #E0E0E0`,
      },
   }),
   {name: 'PermissionPanelStyles'},
);

function PermissionComponent({
   titleKey,
   title,
   subtitleKey,
   name,
   permission,
   allPermissions,
   defaultList,
   onChange,
   disabled = false,
   prefixes = DEFAULT_PREFIX,
}) {
   const [view, setView] = useState(false);
   const [edit, setEdit] = useState(false);
   // const [use, setUse] = useState(false);
   const classes = useStyles();

   const hasView = useMemo(() => indexOf(prefixes, VIEW_PREFIX) >= 0, [prefixes]);
   const hasEdit = useMemo(() => indexOf(prefixes, EDIT_PREFIX) >= 0, [prefixes]);
   // const hasUse = useMemo(() => indexOf(prefixes, USE_PREFIX) >= 0, [prefixes]);

   const viewPermission = useMemo(() => {
      return hasView ? find(allPermissions, {name: VIEW_PREFIX + permission}) : {};
   }, [hasView, allPermissions, permission]);

   const editPermission = useMemo(() => {
      return hasEdit ? find(allPermissions, {name: EDIT_PREFIX + permission}) : {};
   }, [hasEdit, allPermissions, permission]);

   // const usePermission = useMemo(() => {
   //    return hasUse ? find(allPermissions, {name: USE_PREFIX + permission}) : {};
   // }, [hasUse, allPermissions, permission]);

   useEffect(() => {
      if (permission && allPermissions?.length > 0 && defaultList) {
         if (hasView) {
            const viewIndex = indexOf(defaultList, viewPermission?.id);
            setView(viewIndex >= 0);
         }
         if (hasEdit) {
            const editIndex = indexOf(defaultList, editPermission?.id);
            setEdit(editIndex >= 0);
         }

         // if (hasUse) {
         //    const useIndex = indexOf(defaultList, usePermission?.id);
         //    setUse(useIndex >= 0);
         // }
      }
   }, [hasView, hasEdit, allPermissions, defaultList, permission, viewPermission, editPermission]);

   const handleChange = (prefix) => (event) => {
      let useId;

      if (prefix === VIEW_PREFIX) {
         useId = viewPermission?.id;
         setView(event.target.checked);

         if (!event.target.checked) {
            setEdit(false);
         }
      } else if (prefix === EDIT_PREFIX) {
         useId = editPermission?.id;
         setEdit(event.target.checked);
         // } else if (prefix === USE_PREFIX) {
         //    useId = usePermission?.id;
         //    setEdit(event.target.checked);
      }
      onChange?.(useId, event.target.checked);
   };

   return (
      <Stack
         key={'permission ' + name}
         name={name}
         className={classes.root}
         flexDirection={'row'}
         alignItems={'center'}
         display={'flex'}
         py={2}
      >
         {hasView && (
            <CheckboxFHG
               key={'view ' + name + ' ' + view}
               name={'view ' + name}
               labelKey={'user.permissionView.label'}
               checked={view}
               onChange={handleChange(VIEW_PREFIX)}
               disabled={disabled}
               marginLeft={0}
               marginTop={0}
            />
         )}
         <CheckboxFHG
            key={'edit ' + name + ' ' + edit}
            name={'edit ' + name}
            labelKey={'user.permissionEdit.label'}
            checked={edit}
            marginLeft={2}
            marginTop={0}
            onChange={handleChange(EDIT_PREFIX)}
            disabled={disabled || (hasView && !view) || !hasEdit}
         />
         {/*{hasUse && (*/}
         {/*   <CheckboxFHG*/}
         {/*      key={'use ' + name + ' ' + use}*/}
         {/*      name={'use ' + name}*/}
         {/*      labelKey={'user.permissionUse.label'}*/}
         {/*      checked={use}*/}
         {/*      marginLeft={15.2}*/}
         {/*      marginTop={0}*/}
         {/*      onChange={handleChange(USE_PREFIX)}*/}
         {/*   />*/}
         {/*)}*/}
         <Typography
            className={`subheading-small ${disabled ? classes.disabledStyle : ''}`}
            component={'span'}
            id={titleKey}
            color='text.primary'
         >
            {title}
         </Typography>
         {subtitleKey && (
            <Typography className={'subheading-smallest'} component={'span'} id={subtitleKey} color='text.primary' />
         )}
      </Stack>
   );
}

export default function PermissionPanel({
   defaultValues: defaultValuesProp,
   onChange,
   disabled: isDisabled,
   membershipIdList,
   isNew,
}) {
   const classes = useStyles();

   const [{memberships} = {}, {loading}] = useQueryFHG(MEMBERSHIPS_ALL_WHERE_QUERY, {
      variables: {membershipIdList},
      skip: !membershipIdList || !isNew,
   });
   const [editPermissionList, setEditPermissionList] = useState([]);
   const [allPermissionIdList, allPermissionList] = useAllPermissionIdList();
   const [forceEnable, setForceEnable] = useState(false);
   const {isSuperAdmin} = useRecoilValue(userRoleState);

   const membershipPermissionIdList = useMemo(() => {
      if (memberships?.length > 0) {
         let permissionIdList = [];
         for (const membership of memberships) {
            permissionIdList = concat(permissionIdList, membership.permissionIdList);
         }
         return permissionIdList;
      } else {
         return [];
      }
   }, [memberships]);

   const editFieldMetrics = useMemo(() => {
      if (allPermissionList?.length > 0) {
         return find(allPermissionList, {name: FIELD_METRICS_EDIT});
      }
      return {};
   }, [allPermissionList]);

   const viewFieldMetrics = useMemo(() => {
      if (allPermissionList?.length > 0) {
         return find(allPermissionList, {name: FIELD_METRICS_VIEW});
      }
      return {};
   }, [allPermissionList]);

   useEffectOnceConditional(() => {
      if (keys(defaultValuesProp)?.length > 0 && allPermissionIdList?.length > 0 && !loading) {
         let useList;
         if (defaultValuesProp.jointPermissions?.length > 0) {
            useList = map(defaultValuesProp.jointPermissions, 'id');
         } else if (!(defaultValuesProp.permissionIdList?.length > 0)) {
            if (membershipPermissionIdList?.length > 0) {
               useList = membershipPermissionIdList;
            } else {
               useList = membershipPermissionIdList?.length > 0 ? membershipPermissionIdList : allPermissionIdList;
            }
            onChange?.(useList);
         } else {
            useList = defaultValuesProp?.permissionIdList;
         }
         setEditPermissionList(useList);

         return true;
      }
      return false;
   }, [allPermissionIdList, defaultValuesProp, onChange]);

   const handleChange = (permissionId, value) => {
      let updatedList = [];

      if (value) {
         setEditPermissionList((list) => {
            updatedList = uniq([...list, permissionId]);
            return updatedList;
         });
      } else {
         setEditPermissionList((list) => {
            updatedList = without(list, permissionId);
            return updatedList;
         });
      }
      onChange?.(updatedList);
   };

   /**
    * Callback to enable the permissions for super admins.
    * @param event the click event.
    */
   const handleClick = (event) => {
      if (event.shiftKey && isSuperAdmin) {
         setForceEnable((enable) => !enable);
      }
   };
   const theme = useTheme();

   return (
      <Card className={classes.cardStyle} overflow={'hidden'} square={false}>
         <CardContent
            sx={{
               height: '100%',
               py: 4,
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
               alignContent: 'center',
               overflow: 'auto',
            }}
         >
            <Typography
               className={'subtitle'}
               component={'span'}
               variant='h5'
               id={'user.permission.label'}
               sx={{mb: 2}}
               color='text.primary'
            />
            {isDisabled && (
               <Alert
                  severity={forceEnable ? 'warning' : 'info'}
                  onClick={handleClick}
                  sx={{
                     backgroundColor: !forceEnable ? '#FFD700' : '#87CEFA',
                     '& .MuiSvgIcon-root': {
                        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                     },
                  }}
               >
                  <Typography
                     className={'subheading-small'}
                     component={'span'}
                     variant='subtitle2'
                     id={forceEnable ? 'user.allPermission.message' : 'user.permission.message'}
                     sx={{mb: 2}}
                     color='black'
                  />
               </Alert>
            )}
            <PermissionComponent
               key={'LoanAnalysis ' + allPermissionIdList?.length + ' ' + editPermissionList?.length}
               titleKey={'user.loanAnalysisPermission.label'}
               name={'LoanAnalysis'}
               permission={'LoanAnalysis'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               key={'Asset ' + allPermissionIdList?.length + ' ' + editPermissionList?.length}
               titleKey={'user.assetLiabilityPermission.label'}
               name={'Assets'}
               permission={'Assets'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               key={'BalanceSheet ' + allPermissionIdList?.length + ' ' + editPermissionList?.length}
               titleKey={'user.balanceSheet.label'}
               name={'BalanceSheet'}
               permission={'BalanceSheet'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               prefixes={[VIEW_PREFIX]}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               key={'CashFlow ' + allPermissionIdList?.length + ' ' + editPermissionList?.length}
               titleKey={'user.cashFlowPermission.label'}
               name={'CashFlow'}
               permission={'CashFlow'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               key={'Entities ' + allPermissionIdList?.length + ' ' + editPermissionList?.length}
               titleKey={'user.entityPermission.label'}
               name={'Entities'}
               permission={'Entities'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               titleKey={'user.accountabilityPermission.label'}
               name={'AccountabilityChart'}
               permission={'AccountabilityChart'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               titleKey={'user.contractPermission.label'}
               name={'Contracts'}
               permission={'Contracts'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               titleKey={'user.fieldMetrics.label'}
               name={'fieldMetrics'}
               permission={'FieldMetrics'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               titleKey={'user.businessPlanPermission.label'}
               name={'BusinessGamePlan'}
               permission={'BusinessGamePlan'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               titleKey={'user.toolsPermission.label'}
               name={'tools'}
               permission={'Files'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            <PermissionComponent
               titleKey={'user.chatPermission.label'}
               name={'chat'}
               permission={'Chat'}
               allPermissions={allPermissionList}
               defaultList={editPermissionList}
               onChange={handleChange}
               disabled={isDisabled && !forceEnable}
            />
            {/*<PermissionComponent*/}
            {/*   titleKey={'user.exportPermission.label'}*/}
            {/*   name={'export'}*/}
            {/*   permission={'Exports'}*/}
            {/*   prefixes={[USE_PREFIX]}*/}
            {/*   allPermissions={allPermissionList}*/}
            {/*   defaultList={editPermissionList}*/}
            {/*   onChange={handleChange}*/}
            {/*   disabled={isDisabled && !forceEnable}*/}
            {/*/>*/}
         </CardContent>
      </Card>
   );
}

/**
 * [
 *     {
 *         "__typename": "Permission",
 *         "id": "e10117ce-f673-4341-996d-67f47bc3c249",
 *         "name": "view_Entities"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "b891ad6c-ff72-4dba-82ef-267d17f8dfd4",
 *         "name": "edit_Entities"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "0833c031-ed24-4316-9b4f-bd0abd05c19b",
 *         "name": "view_AccountabilityChart"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "6367d862-0dfb-47fd-9834-f17d69437193",
 *         "name": "edit_AccountabilityChart"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "34ba1a26-c4da-4b15-9de3-5a0f7827ef21",
 *         "name": "view_LoanAnalysis"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "299233e0-669a-48ba-bfdd-fbff58a3c9dc",
 *         "name": "edit_LoanAnalysis"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "b715ad22-25fd-42d3-9ed7-c419f4523ada",
 *         "name": "view_Assets"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "350b5d74-3c1d-41ff-aa10-1383084c4324",
 *         "name": "edit_Assets"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "ed8c3e67-5beb-47de-9bb4-a9acb4d644ff",
 *         "name": "view_Liabilities"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "6bca361a-483c-4c07-be86-d69fa39baa3c",
 *         "name": "edit_Liabilities"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "bfab055b-b8ac-42e1-91ac-b600a6896ed7",
 *         "name": "view_BalanceSheet"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "c6113452-3f22-4dda-bb29-c55ac228b846",
 *         "name": "edit_BalanceSheet"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "f11fbc57-f18f-4c00-b906-a2d0e7c16fa3",
 *         "name": "view_CashFlow"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "7a520473-a693-4ea4-a89e-8778102109c3",
 *         "name": "edit_CashFlow"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "56205771-2491-4a58-874d-08aa6a004853",
 *         "name": "view_Contracts"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "2a9124c6-09fe-4c74-bc29-2bec2724367d",
 *         "name": "edit_Contracts"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "7020bd70-677b-4db9-8060-72ca09b2eec6",
 *         "name": "view_BusinessGamePlan"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "49d4f808-c40f-426b-b69f-a4b6ab29da9d",
 *         "name": "edit_BusinessGamePlan"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "9e4ee1a6-0841-4e76-b39e-b3b28b6516a9",
 *         "name": "view_LoanAmortization"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "4c168c2d-30ae-42d8-9160-5780e8e89dcc",
 *         "name": "edit_LoanAmortization"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "4e013217-1f0c-4098-95be-d3c628147609",
 *         "name": "view_TaxableIncome"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "66cc6c67-688c-4b5e-b758-e3a35f7aeea8",
 *         "name": "edit_TaxableIncome"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "577a05b6-8806-4d9f-8434-3a3a53fc9070",
 *         "name": "view_TasksNotes"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "5829b613-4efb-4914-b1d8-da6668d72a6b",
 *         "name": "edit_TasksNotes"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "f88f1430-b5d8-4f93-b80e-f549d27adb16",
 *         "name": "view_Files"
 *     },
 *     {
 *         "__typename": "Permission",
 *         "id": "fd635764-3124-4616-9736-cc030d1c908f",
 *         "name": "edit_Files"
 *     }
 * ]
 */
