import map from 'lodash/map';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {PERCENT_FORMAT} from '../../Constants';
import {CURRENCY_FULL_EXCEL} from '../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {LOGO_LARGE} from '../../Constants';
import {createTableLx} from '../../fhg/utils/DataUtil';
import {getBase64FromUrl} from '../../fhg/utils/Utils';

/**
 * The hook to export liabilities to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useLiabilitiesExcelExport(titleWorksheet, orientation) {
   /**
    * Set the columns and the data for the table.
    * @param liabilities The liabilities contained in the table.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size: number, color: {argb: string}, name: string}}}, null], liabilityList}}
    */
   let setupTableData = function (liabilities) {
      const columns = [
         {
            name: 'Category',
            accessor: 'category',
            width: 32,
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Last Updated',
            accessor: 'updatedDateTime',
            value: (data) => moment(data).format(DATE_FORMAT_KEYBOARD),
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Bank',
            accessor: 'bank',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Description',
            accessor: 'description',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Interest Rate',
            accessor: 'interestRate',
            value: (item) => item.interestRate / 100,
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {name: 'Payment', accessor: 'payment', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {
            name: 'Payment Due Date',
            accessor: 'paymentDueDate',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Payment Maturity Date',
            accessor: 'paymentMaturityDate',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Bank Debt',
            accessor: 'collateralString',
            totalsRowLabel: 'Total',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Amount',
            accessor: 'amount',
            totalsRowFunction: 'sum',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
      ];

      const liabilityList = map(liabilities, (liability) => ({
         category: liability?.liabilityCategory?.name,
         bank: liability?.bank?.name,
         description: liability?.description,
         updatedDateTime: liability?.updatedDateTime,
         interestRate: liability?.interestRate,
         payment: liability?.payment,
         paymentDueDate: liability?.paymentDueDate,
         paymentMaturityDate: liability?.paymentMaturityDate,
         collateralString: liability?.collateralString,
         amount: liability?.amount,
      }));
      return {columns, liabilityList};
   };

   /**
    * Set the column widths for all columns.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      let columnIndex = 1;
      worksheet.getColumn(columnIndex++).width = 1; // Margin - A
      worksheet.getColumn(columnIndex++).width = 22; // Category - B
      worksheet.getColumn(columnIndex++).width = 16; // LastUpdated - E
      worksheet.getColumn(columnIndex++).width = 18; // Bank - C
      worksheet.getColumn(columnIndex++).width = 26; // Description - D

      const interestRateCell = worksheet.getColumn(columnIndex++); // Interest Rate - F
      interestRateCell.width = 10; // Interest Rate - E
      interestRateCell.numFmt = PERCENT_FORMAT; // Interest Rate - F

      const paymentCell = worksheet.getColumn(columnIndex++); // Payment - G
      paymentCell.width = 11; // Payment
      paymentCell.numFmt = '"$"#,##0'; // Payment
      worksheet.getColumn(columnIndex++).width = 10; // Payment Due Date - H
      worksheet.getColumn(columnIndex++).width = 20; // Payment Maturity Date - I
      worksheet.getColumn(columnIndex++).width = 11; // Collateral - J
      const amountCell = worksheet.getColumn(columnIndex++); // Amount - K
      amountCell.width = 19; // Amount
      amountCell.numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn(columnIndex++).width = 1; // Margin - L
   };

   /**
    * Set the table styles. Stripe the rows, set alignment and set cell font.
    *
    * @param worksheet The worksheet containing the table.
    * @param startingRow The row index of the starting row of the table.
    * @param rowCount The number of rows in the table.
    */
   let setTableStyles = function (worksheet, startingRow, rowCount) {
      worksheet.getRows(startingRow, rowCount + 1).forEach((row) => {
         row.height = 20;
         row.alignment = {vertical: 'middle', wrapText: true};
      });
      //Header row
      worksheet.getRow(startingRow).height = 30;
      worksheet.getRow(startingRow + rowCount + 1).font = {
         name: 'Tahoma',
         size: 12,
         bold: true,
         color: {argb: '00707070'},
      };

      const totalRow = worksheet.getRow(startingRow + rowCount + 1);
      totalRow.height = 20;
      totalRow.alignment = {vertical: 'middle'};
      totalRow.font = {name: 'Tahoma', size: 12, bold: true, color: {argb: '00707070'}};

      worksheet.getColumn('H').alignment = {vertical: 'middle', horizontal: 'right'};
   };

   return async (workbook, liabilities = [], total = 0, entityName = '') => {
      const tableStartingRow = 11;
      const worksheet = workbook.addWorksheet(titleWorksheet, {
         views: [{showGridLines: false}],
         pageSetup: {
            orientation,
            margins: {
               left: 0.1,
               right: 0.1,
               top: 0.75,
               bottom: 0.75,
               header: 0.3,
               footer: 0.3,
            },
         },
      });
      //Add the table header and footer rows.
      worksheet.pageSetup.printArea = `A1:K${tableStartingRow + 2 + liabilities.length}`;
      worksheet.properties.defaultColWidth = 12;

      // Add the title at top left.
      worksheet.mergeCells('B2:C4');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Schedule of Liabilities';
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 20, bold: true};
      titleCell.alignment = {vertical: 'middle', horizontal: 'left'};

      // Add the logo in the upper right
      const myBase64Image = await getBase64FromUrl(LOGO_LARGE);
      const imageId2 = workbook.addImage({
         base64: myBase64Image,
         extension: 'png',
      });
      worksheet.addImage(imageId2, 'E2:H4');

      // Add the entity name and date
      titleCell = worksheet.getCell('B6');
      titleCell.value = entityName || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B7');
      titleCell.value = moment().format('MMMM D, YYYY');
      titleCell.font = {name: 'Tahoma', size: 12};

      // Add the totals section
      worksheet.mergeCells('B9:E9');
      titleCell = worksheet.getCell('B9');
      titleCell.value = `Total Liabilities ${numberFormatter(CURRENCY_FULL_FORMAT, total)}`;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      setColumnWidths(worksheet);
      const {columns, liabilityList} = setupTableData(liabilities);
      setTableStyles(worksheet, tableStartingRow, liabilityList.length);
      // createTable('Liabilities', worksheet, columns, liabilityList, `B${tableStartingRow}`);
      createTableLx({
         name: 'Liabilities',
         worksheet,
         columns,
         data: liabilityList,
         ref: `B${tableStartingRow}`,
         totalsRow: true,
      });
   };
}
