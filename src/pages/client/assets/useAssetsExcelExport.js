import map from 'lodash/map';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {DATE_FORMAT_KEYBOARD} from '../../../Constants';
import {CURRENCY_FULL_EXCEL} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {LOGO_LARGE} from '../../../Constants';
import {createTableLx} from '../../../fhg/utils/DataUtil';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';

/**
 * The hook to export assets to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useAssetsExcelExport(titleWorksheet, orientation) {
   /**
    * Set the columns and the data for the table.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size: number, color: {argb: string}, name: string}}}, null], assetList}}
    */
   let setupTableData = function (assets) {
      const columns = [
         {
            name: 'Category',
            accessor: 'category',
            width: 32,
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         // {name: 'Type', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {
            name: 'Last Updated',
            accessor: 'updatedDateTime',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Description',
            accessor: 'description',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {name: 'Details', accessor: 'details', style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}}},
         {
            name: 'Collateral',
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

      const assetList = map(assets, (asset) => ({
         category: asset?.assetCategory?.name,
         description: asset?.description,
         updatedDateTime: moment(asset?.updatedDateTime).format(DATE_FORMAT_KEYBOARD),
         details: asset?.details,
         collateralString: asset?.collateralString,
         amount: asset?.amount,
      }));
      return {columns, assetList};
   };

   /**
    * Set the column widths for all columns.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      let columnIndex = 1;
      worksheet.getColumn(columnIndex++).width = 2; // Margin
      worksheet.getColumn(columnIndex++).width = 31; // Category
      worksheet.getColumn(columnIndex++).width = 16; // Last Updated
      worksheet.getColumn(columnIndex++).width = 35; // Description
      worksheet.getColumn(columnIndex++).width = 35; // Details
      worksheet.getColumn(columnIndex++).width = 11; // Collateral
      worksheet.getColumn(columnIndex++).width = 19; // Amount
   };

   /**
    * Set the table styles. Stripe the rows, set alignment and set cell font.
    *
    * @param worksheet The worksheet containing the table.
    * @param startingRow The row index of the starting row of the table.
    * @param rowCount The number of rows in the table.
    */
   const setTableStyles = function (worksheet, startingRow, rowCount) {
      worksheet.getRows(startingRow, rowCount + 1).forEach((row) => {
         row.height = 20;
         row.alignment = {vertical: 'middle'};
      });
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
   };

   return async (
      workbook,
      assets = [],
      totalCurrent = 0,
      totalIntermediate = 0,
      totalLong = 0,
      entityName = '',
      reportDate,
   ) => {
      const tableStartingRow = 14;
      const worksheet = workbook.addWorksheet(titleWorksheet, {
         views: [{showGridLines: false}],
         pageSetup: {
            orientation,
            margins: {
               left: 0.15,
               right: 0.1,
               top: 0.75,
               bottom: 0.75,
               header: 0.3,
               footer: 0.3,
            },
         },
      });
      //Add the table header and footer rows.
      worksheet.pageSetup.printArea = `A1:G${tableStartingRow + 2 + assets.length}`;
      worksheet.properties.defaultColWidth = 12;

      // Add the title at top left.
      worksheet.mergeCells('B2:C4');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Schedule of Assets';
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 20, bold: true};
      titleCell.alignment = {vertical: 'middle', horizontal: 'left'};

      // Add the logo in the upper right
      worksheet.getCell('D2').alignment = {vertical: 'top', horizontal: 'right'};
      const myBase64Image = await getBase64FromUrl(LOGO_LARGE);
      const imageId2 = workbook.addImage({
         base64: myBase64Image,
         extension: 'png',
      });
      worksheet.addImage(imageId2, {
         tl: {col: 3.5, row: 2},
         ext: {width: 400, height: 70},
      });

      // Add the entity name and date
      titleCell = worksheet.getCell('B6');
      titleCell.value = entityName || '';
      titleCell.font = {name: 'Tahoma', size: 12};
      titleCell = worksheet.getCell('B7');
      titleCell.value = moment(reportDate).format('MMMM YYYY');
      titleCell.font = {name: 'Tahoma', size: 12};

      // Add the totals section
      worksheet.mergeCells('B9:E9');
      titleCell = worksheet.getCell('B9');
      titleCell.value = `Total Current Assets ${numberFormatter(CURRENCY_FULL_FORMAT, totalCurrent)}`;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 12};

      worksheet.mergeCells('B10:E10');
      titleCell = worksheet.getCell('B10');
      titleCell.value = `Total Intermediate Assets ${numberFormatter(CURRENCY_FULL_FORMAT, totalIntermediate)}`;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 12};

      worksheet.mergeCells('B11:E11');
      titleCell = worksheet.getCell('B11');
      titleCell.value = `Total Long Term Assets ${numberFormatter(CURRENCY_FULL_FORMAT, totalLong)}`;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: '00707070'}, size: 12};

      worksheet.mergeCells('B12:E12');
      titleCell = worksheet.getCell('B12');
      titleCell.value = `Total Assets ${numberFormatter(
         CURRENCY_FULL_FORMAT,
         totalLong + totalIntermediate + totalCurrent,
      )}`;
      titleCell.numFmt = CURRENCY_FULL_EXCEL;
      titleCell.font = {name: 'Tahoma', color: {argb: '006b9241'}, size: 14};

      worksheet.getColumn('F').numFmt = CURRENCY_FULL_EXCEL; // Amount
      worksheet.getColumn('F').alignment = {vertical: 'middle', horizontal: 'right'};
      setColumnWidths(worksheet);
      const {columns, assetList} = setupTableData(assets);

      setTableStyles(worksheet, tableStartingRow, assets?.length);

      createTableLx({
         name: 'AssetTable',
         worksheet,
         columns,
         data: assetList,
         ref: `B${tableStartingRow}`,
         totalsRow: true,
      });
   };
}
