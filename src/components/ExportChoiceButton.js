import {LaunchOutlined} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {Menu} from '@mui/material';
import {MenuItem} from '@mui/material';
import {useRef} from 'react';
import {useState} from 'react';
import React from 'react';
import ButtonFHG from '../fhg/components/ButtonFHG';
import useMessage from '../fhg/hooks/useMessage';
import ExportExcelChoicePanel from './ExportExcelChoicePanel';
import ExportPdfChoicePanel from './ExportPdfChoicePanel';
import {useTheme} from '@mui/styles';

/**
 * Component to choose the PDF file types to export into a single document.
 *
 * @param titleKey The localization key for the title.
 * @param selectedIndex The default selection.
 * @param disabled Indicates if the button should be disabled.
 * @return {JSX.Element}
 * @constructor
 */
export default function ExportChoiceButton({selectedIndex, disabled, ...props}) {
   const [open, setOpen] = useState(false);
   const anchorRef = useRef(null);
   const [excelOpen, setExcelOpen] = useState(false);
   const [pdfOpen, setPdfOpen] = useState(false);
   const excelLabel = useMessage('asset.exportExcel.button');
   const pdfLabel = useMessage('asset.exportPdf.button');

   /**
    * Toggle showing the PDF document selection popover.
    */
   const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
   };

   /**
    * Close the PDF document selection popover.
    * @param event The click event.
    */
   const handleClose = (event) => {
      if (event?.target && anchorRef.current && anchorRef.current.contains(event.target)) {
         return;
      }
      setOpen(false);
      setExcelOpen(false);
      setPdfOpen(false);
   };

   const handleExportExcel = () => {
      setExcelOpen(true);
   };

   const handleExportPdf = () => {
      setPdfOpen(true);
   };

   const theme = useTheme();

   return (
      <Stack minWidth={'auto'}>
         <ButtonFHG
            variant='contained'
            color='primary'
            size='large'
            className={'button-title'}
            startIcon={<LaunchOutlined />}
            {...props}
            ref={anchorRef}
            labelKey={'export.label.button'}
            disabled={disabled}
            onClick={handleToggle}
            sx={{
               '&.Mui-disabled': {
                  color: theme.palette.text.disabled,
                  opacity: 0.8,
               },
            }}
         />
         <Menu
            id='basic-menu'
            anchorEl={anchorRef.current}
            open={open}
            onClose={handleClose}
            MenuListProps={{
               'aria-labelledby': 'basic-button',
            }}
         >
            <MenuItem onClick={handleExportExcel}>{excelLabel}</MenuItem>
            <MenuItem onClick={handleExportPdf}>{pdfLabel}</MenuItem>
         </Menu>
         <ExportExcelChoicePanel
            open={excelOpen}
            anchorRef={anchorRef}
            onClose={handleClose}
            selectedIndex={selectedIndex}
         />
         <ExportPdfChoicePanel
            open={pdfOpen}
            anchorRef={anchorRef}
            onClose={handleClose}
            selectedIndex={selectedIndex}
         />
      </Stack>
   );
}
