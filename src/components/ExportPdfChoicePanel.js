import {Popover} from '@mui/material';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
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
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {BUSINESS_STRUCTURE_INDEX, FIELD_METRICS_INDEX, GAME_PLAN_INDEX, PDF_COUNT} from '../Constants';
// import {TAXABLE_INCOME_INDEX} from '../Constants';
import {ACCOUNTABILITY_CHART_INDEX} from '../Constants';
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
import Prompt from '../fhg/components/edit/Prompt';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import {formatMessage} from '../fhg/utils/Utils';
import {entityState} from '../pages/admin/EntityListDropDown';
import useMultiplePdf from '../pages/client/useMultiplePdf';
import {userRoleState} from '../pages/Main';
import ButtonLF from './ButtonLF';
import {saveAs} from 'file-saver';
import {pdf} from '@react-pdf/renderer';

/**
 * Component to choose the PDF file types to export into a single document.
 *
 * @param open Indicates if the panel should be open.
 * @param anchorRef The component ref that indicates where the panel should be anchored.
 * @param onClose The callback when the panel is closed.
 * @param titleKey The localization key for the title.
 * @param selectedIndex The default selection.
 * @param years The list of years for cash flow.
 * @return {JSX.Element}
 * @constructor
 */
export default function ExportPdfChoicePanel({
   open,
   anchorRef,
   onClose,
   titleKey = 'export.pdf.message',
   selectedIndex,
   itemsKey = 'seats',
}) {
   const [{clientId: clientIdProp}] = useCustomSearchParams();
   const {clientId: userClientId} = useRecoilValue(userRoleState);
   const clientId = userClientId || clientIdProp;
   const {entities: entityIdList} = useRecoilValue(entityState);

   const intl = useIntl();
   const [selectedNames, setSelectedNames] = useState(Array(PDF_COUNT));
   const [isProgress, setIsProgress] = useState(false);

   const exportPdf = useMultiplePdf(intl, 'landscape', clientId, itemsKey);
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

   const messageKey = 'pdf.leave.error';

   /**
    * Names to be displayed for the user to select.
    */
   const names = useMemo(() => {
      const names = [];

      names[ACCOUNTABILITY_CHART_INDEX] = formatMessage(intl, 'export.accountabilityChart.title');
      names[LOAN_ANALYSIS_INDEX] = formatMessage(intl, 'export.loanAnalysis.title');
      names[ASSET_INDEX] = formatMessage(intl, 'export.asset.title');
      names[LIABILITY_INDEX] = formatMessage(intl, 'export.liability.title');
      names[BALANCE_SHEET_INDEX] = formatMessage(intl, 'export.balanceSheet.title');
      names[CASH_FLOW_INDEX] = formatMessage(intl, 'export.cashFlow.title');
      names[CONTRACTS_INDEX] = formatMessage(intl, 'export.contracts.title');
      names[GAME_PLAN_INDEX] = formatMessage(intl, 'gamePlan.title');
      names[FIELD_METRICS_INDEX] = formatMessage(intl, 'fieldMetrics.title');
      names[BUSINESS_STRUCTURE_INDEX] = formatMessage(intl, 'export.businessStructure.title');

      // if (isAdmin) {
      //    names[TAXABLE_INCOME_INDEX] = formatMessage(intl, 'export.taxableIncome.title');
      // }
      //
      return names;
   }, [intl]);

   /**
    * Select the PDF document at selected index.
    */
   useEffect(() => {
      if (selectedIndex !== undefined) {
         selectedNames[selectedIndex] = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedIndex]);
   // }, [selectedIndex, selectedNames]);

   /**
    * Callback for when the PDF document is selected.
    * @param index The index of the PDF document.
    * @return {(function(): void)|*}
    */
   const handleClickCheckbox = (index) => () => {
      const selected = [...selectedNames];
      selected[index] = !selected[index];
      setSelectedNames(selected);
   };

   /**
    * Close the PDF document selection popover.
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
      const pdfDocument = await exportPdf(selectedNames, title, entityNames, clientData?.client);
      const blob = await pdf(pdfDocument).toBlob();
      saveAs(blob, title + '.pdf');
      setIsProgress(false);
   };

   /**
    * Select all the PDF documents.
    */
   const handleSelectAll = () => {
      const selected = [...selectedNames];
      fill(selected, true);
      setSelectedNames(selected);
   };

   /**
    * Clear all the selected PDF documents.
    */
   const handleClear = () => {
      const selected = [...selectedNames];
      fill(selected, false);
      setSelectedNames(selected);
   };

   return (
      <Fragment>
         <Prompt when={isProgress} messageKey={messageKey} />
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
                              alignItems: 'center',
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
