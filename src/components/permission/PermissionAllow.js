import CloseIcon from '@mui/icons-material/Close';
import {Link} from '@mui/material';
import {Alert} from '@mui/material';
import {Snackbar} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import {useState} from 'react';
import {useMemo} from 'react';
import React from 'react';
import {SCHEDULE_LINK} from '../../Constants';
import TypographyFHG from '../../fhg/components/Typography';
import usePermission from './usePermission';

export const LOAN_ANALYSIS_VIEW = 'view_LoanAnalysis';
export const LOAN_ANALYSIS_EDIT = 'edit_LoanAnalysis';
export const ASSETS_VIEW = 'view_Assets';
export const ASSETS_EDIT = 'edit_Assets';
export const BALANCE_SHEET_VIEW = 'view_BalanceSheet';
export const CASH_FLOW_VIEW = 'view_CashFlow';
export const CASH_FLOW_EDIT = 'edit_CashFlow';
export const ENTITIES_VIEW = 'view_Entities';
export const ENTITIES_EDIT = 'edit_Entities';
export const ACCOUNTABILITY_CHART_VIEW = 'view_AccountabilityChart';
export const ACCOUNTABILITY_CHART_EDIT = 'edit_AccountabilityChart';
export const CONTRACTS_VIEW = 'view_Contracts';
export const CONTRACTS_EDIT = 'edit_Contracts';
export const BUSINESS_PLAN_VIEW = 'view_BusinessGamePlan';
export const BUSINESS_PLAN_EDIT = 'edit_BusinessGamePlan';
export const FIELD_METRICS_VIEW = 'view_FieldMetrics';
export const FIELD_METRICS_EDIT = 'edit_FieldMetrics';
export const TOOLS_VIEW = 'view_Files';
export const TOOLS_EDIT = 'edit_Files';

const useStyles = makeStyles(
   () => ({
      closeButtonStyle: {
         position: 'absolute',
         right: 0,
         top: 0,
         marginLeft: 'auto',
         zIndex: 1001,
      },
   }),
   {name: 'PermissionAllowStyles'},
);

/**
 * Component to require a permission before showing the children components.
 * @param permissionName The name of the permission to require.
 * @param showUpgradeMessage Indicates if the upgrade snackbar should be shown to the user.
 * @param children The children to display if user has permission.
 * @return {*|null} The children if the user has permission or null otherwise.
 * @constructor
 */
export default function PermissionAllow({permissionName, showUpgradeMessage = false, children}) {
   const classes = useStyles();
   const hasPermission = usePermission(permissionName);

   const [isOpen, setIsOpen] = useState(true);

   const handleClose = () => {
      setIsOpen(false);
   };
   const upgradeSnackbar = useMemo(() => {
      if (showUpgradeMessage) {
         return (
            <Snackbar
               open={isOpen}
               onClose={handleClose}
               action={[
                  <React.Fragment>
                     <IconButton
                        key='close'
                        aria-label='Close'
                        color='inherit'
                        size={'small'}
                        className={classes.closeButtonStyle}
                        onClick={handleClose}
                     >
                        <CloseIcon fontSize='inherit' />
                     </IconButton>
                  </React.Fragment>,
               ]}
            >
               <Alert severity='info'>
                  <TypographyFHG variant={'subtitle1'} hasLineBreaks id={'noPermission.2.message'} />
                  <Link href={SCHEDULE_LINK} target='_blank' rel='noreferrer' />
               </Alert>
            </Snackbar>
         );
      } else {
         return null;
      }
   }, [classes.closeButtonStyle, isOpen, showUpgradeMessage]);

   return hasPermission ? children : upgradeSnackbar;
}
