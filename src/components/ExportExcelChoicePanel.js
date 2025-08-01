import {Popover} from '@mui/material';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import ExcelJS from 'exceljs';
import {filter} from 'lodash';
import {map} from 'lodash';
import {join} from 'lodash';
import {some} from 'lodash';
import {fill} from 'lodash';
import find from 'lodash/find';
import moment from 'moment/moment';
import {useState} from 'react';
import {useEffect} from 'react';
import {useMemo, Fragment} from 'react';
import React from 'react';
import {useIntl} from 'react-intl';
import {useSetRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {FIELD_METRICS_INDEX, PDF_COUNT} from '../Constants';
// import {TAXABLE_INCOME_INDEX} from '../Constants';
import {CONTRACTS_INDEX} from '../Constants';
import {CASH_FLOW_INDEX} from '../Constants';
import {BALANCE_SHEET_INDEX} from '../Constants';
import {LOAN_ANALYSIS_INDEX} from '../Constants';
import {LIABILITY_INDEX} from '../Constants';
import {ASSET_INDEX} from '../Constants';
import {DATE_FORMAT_KEYBOARD} from '../Constants';
import {CLIENT_BY_ID_REPORT_QUERY} from '../data/QueriesGL';
import {ENTITY_CLIENT_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import CheckboxFHG from '../fhg/components/CheckboxFHG';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import usePromptFHG from '../fhg/hooks/usePromptFHG';
import {formatMessage} from '../fhg/utils/Utils';
import {entityState} from '../pages/admin/EntityListDropDown';
import useMultipleExcel from '../pages/client/useMultipleExcel';
import {errorState} from '../pages/Main';
import {userRoleState} from '../pages/Main';
import ButtonLF from './ButtonLF';
import {saveAs} from 'file-saver';

/**
 * Component to choose the Excel file types to export into a single document.
 *
 * @param titleKey The localization key for the title.
 * @param clientId The client ID for the document.
 * @param selectedIndex The default selection.
 * @return {JSX.Element}
 * @constructor
 */
export default function ExportExcelChoicePanel({
   open,
   anchorRef,
   onClose,
   titleKey = 'export.excel.message',
   selectedIndex,
}) {
   const [{clientId: clientIdProp, reportDate}] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const {entities: entityIdList} = useRecoilValue(entityState);

   const intl = useIntl();
   const [selectedNames, setSelectedNames] = useState(Array(PDF_COUNT));
   const [isProgress, setIsProgress] = useState(false);
   const exportExcel = useMultipleExcel(intl, 'landscape', clientId, entityIdList, reportDate);
   const setErrorState = useSetRecoilState(errorState);

   const [entityData] = useQueryFHG(
      ENTITY_CLIENT_QUERY,
      {variables: {clientId}, skip: !validate(clientId)},
      'entity.type',
   );

   const entityNames = useMemo(() => {
      const entities = filter(entityData?.entities, (entity) =>
         find(entityIdList, (entityId) => entityId === entity.id),
      );
      return join(map(entities, 'name'), ', ');
   }, [entityData?.entities, entityIdList]);

   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_REPORT_QUERY,
      {fetchPolicy: 'network-only', variables: {clientId}, skip: !validate(clientId)},
      'client.type',
   );

   const messageKey = 'excel.leave.error';

   /**
    * Names to be displayed for the user to select.
    */
   const names = useMemo(() => {
      const names = [];

      names[LOAN_ANALYSIS_INDEX] = formatMessage(intl, 'export.loanAnalysis.title');
      names[ASSET_INDEX] = formatMessage(intl, 'export.asset.title');
      names[LIABILITY_INDEX] = formatMessage(intl, 'export.liability.title');
      names[BALANCE_SHEET_INDEX] = formatMessage(intl, 'export.balanceSheet.title');
      names[CASH_FLOW_INDEX] = formatMessage(intl, 'export.cashFlow.title');
      names[CONTRACTS_INDEX] = formatMessage(intl, 'export.contracts.title');
      names[FIELD_METRICS_INDEX] = formatMessage(intl, 'fieldMetrics.title');

      // if (isAdmin) {
      //    names[TAXABLE_INCOME_INDEX] = formatMessage(intl, 'export.taxableIncome.title');
      // }

      return names;
   }, [intl]);

   /**
    * Select the Excel document at selected index.
    */
   useEffect(() => {
      if (selectedIndex !== undefined) {
         selectedNames[selectedIndex] = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedIndex]);
   // }, [selectedIndex, selectedNames]);

   /**
    * Callback for when the Excel document is selected.
    * @param index The index of the Excel document.
    * @return {(function(): void)|*}
    */
   const handleClickCheckbox = (index) => () => {
      const selected = [...selectedNames];
      selected[index] = !selected[index];
      setSelectedNames(selected);
   };

   /**
    * Close the Excel document selection popover.
    * @param event The click event.
    */
   const handleClose = (event) => {
      if (event?.target && anchorRef.current && anchorRef.current.contains(event.target)) {
         return;
      }

      onClose?.();
   };

   /**
    * Callback when the export button is selected.
    * @return {Promise<void>}
    */
   const handleExport = async () => {
      onClose?.();
      setIsProgress(true);
      const title = `${entityNames}_${moment().format(DATE_FORMAT_KEYBOARD)}`;
      const workbook = new ExcelJS.Workbook();
      await exportExcel(workbook, selectedNames, title, entityNames, clientData?.client);

      if (workbook._worksheets?.length > 0) {
         const buf = await workbook.xlsx.writeBuffer();

         saveAs(new Blob([buf]), `${title}.xlsx`);
      } else {
         setErrorState({errorKey: 'save.excel.error'});
      }
      setIsProgress(false);
   };

   /**
    * Select all the Excel documents.
    */
   const handleSelectAll = () => {
      const selected = [...selectedNames];
      fill(selected, true);
      setSelectedNames(selected);
   };

   /**
    * Clear all the selected Excel documents.
    */
   const handleClear = () => {
      const selected = [...selectedNames];
      fill(selected, false);
      setSelectedNames(selected);
   };

   usePromptFHG(isProgress, messageKey);

   return (
      <Fragment>
         <Popover
            open={open}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'center',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'center',
            }}
            anchorEl={anchorRef.current}
         >
            <Paper>
               <ClickAwayListener onClickAway={handleClose}>
                  <Box display={'flex'} flexDirection={'column'} padding={1}>
                     <TypographyFHG variant={'body2'} id={titleKey} />
                     <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <ButtonLF labelKey={'export.selectAll.button'} onClick={handleSelectAll} />
                        <ButtonLF labelKey={'export.clear.button'} onClick={handleClear} />
                     </Box>
                     {names.map((name, index) => (
                        <Box
                           key={name + '' + selectedNames[index]}
                           sx={{
                              display: 'flex',
                              flexDirection: 'row',
                           }}
                        >
                           <CheckboxFHG
                              name={name}
                              checked={selectedNames[index]}
                              onChange={handleClickCheckbox(index)}
                              color={'default'}
                              label={name}
                              marginTop={0}
                              marginLeft={0}
                           />
                        </Box>
                     ))}
                     <Box>
                        <ButtonFHG
                           size='small'
                           variant='contained'
                           color='primary'
                           style={{width: 'max-content', margin: '16px 8px 16px 8px'}}
                           labelKey={'export.label.button'}
                           disabled={!some(selectedNames)}
                           onClick={handleExport}
                        />
                        <ButtonLF labelKey={'cancel.button'} onClick={handleClose} />
                     </Box>
                  </Box>
               </ClickAwayListener>
            </Paper>
         </Popover>
      </Fragment>
   );
}
