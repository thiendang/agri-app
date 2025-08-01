import {CURRENCY_FULL_EXCEL, CURRENCY_FULL_FORMAT, NUMBER_FULL_FORMAT} from '../../../Constants';
import {LOGO_LARGE} from '../../../Constants';
import {createTable} from '../../../fhg/utils/DataUtil';
import {getCellLocation} from '../../../fhg/utils/excelUtils';
import {getBase64FromUrl} from '../../../fhg/utils/Utils';
import numberFormatter from 'number-formatter';

/**
 * The hook to export assets to excel.
 *
 * @return {JSX.Element}
 * @constructor
 */
export default function useFieldMetricsExcelExport(titleWorksheet, orientation, showByField, isPerAcre) {
   /**
    * Set the columns and the data for the table.
    * @return {{columns: [{name: string, width: number, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, style: {font: {size: number, color: {argb: string}, name: string}}}, {name: string, totalsRowLabel: string, style: {font: {size: number, color: {argb: string}, name: string}}}, null], assetList}}
    */
   let setupTableData = function () {
      return [
         {
            name: showByField ? 'Field' : 'Crop',
            accessor: 'name',
            width: 32,
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Acres',
            accessor: 'acres',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Breakeven',
            accessor: 'breakeven',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Avg Cash Price',
            accessor: 'acp',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'P/L Per Acre',
            accessor: 'profitAndLossPerAcre',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
         {
            name: 'Total P/L',
            accessor: 'profitAndLoss',
            style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
         },
      ];
   };

   /**
    * Set the column widths for all columns.
    *
    * @param worksheet The worksheet containing the table.
    */
   let setColumnWidths = function (worksheet) {
      let columnIndex = 1;
      worksheet.getColumn(columnIndex++).width = 2; // Margin
      worksheet.getColumn(columnIndex++).width = 31;
      worksheet.getColumn(columnIndex++).width = 31;
      worksheet.getColumn(columnIndex++).width = 31;
      worksheet.getColumn(columnIndex++).width = 31;
      worksheet.getColumn(columnIndex++).width = 31;
      worksheet.getColumn(columnIndex++).width = 31;
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
      entityName,
      historyDate,
      cropSummaryData,
      fields,
      fieldMetricsCropDataUsing,
      dataTotalRevenueData,
      totalRevenueSum,
      fieldMetricsCategoryDataUsing,
      totalCrop,
      totalCostDataList,
      totalCost,
      costPerUnitDataUsing,
      costPerUnitTotalData,
      profitAndLossDataUsing,
      profitAndLossTotalData,
      breakevenYieldDataUsing,
      breakevenYieldTotalData,
      breakevenPriceDataUsing,
      breakevenPriceTotalData,
   ) => {
      const tableStartingRow = 10;
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
      worksheet.pageSetup.printArea = `A1:F${tableStartingRow + 2 + cropSummaryData.length}`;
      worksheet.properties.defaultColWidth = 12;

      // Add the title at top left.
      worksheet.mergeCells('B2:C4');
      let titleCell = worksheet.getCell('B2');
      titleCell.value = 'Field Metrics';
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
      titleCell.value = historyDate;
      titleCell.font = {name: 'Tahoma', size: 12};

      worksheet.getColumn('C').numFmt = NUMBER_FULL_FORMAT;
      worksheet.getColumn('D').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('E').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('F').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('G').numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getColumn('F').alignment = {vertical: 'middle', horizontal: 'right'};
      setColumnWidths(worksheet);
      const columns = setupTableData(cropSummaryData);

      setTableStyles(worksheet, tableStartingRow, cropSummaryData?.length);

      createTable(
         'Crop Summary Table',
         worksheet,
         columns,
         cropSummaryData,
         `B${tableStartingRow}`,
         true,
         undefined,
         undefined,
         true,
         false,
         true,
      );

      let cell = getCellLocation(2, 10 + cropSummaryData?.length + 2);
      let cell2 = getCellLocation(6, 10 + cropSummaryData?.length + 2);
      let cell3 = getCellLocation(7, 10 + cropSummaryData?.length + 2);
      titleCell = worksheet.getCell(cell);
      worksheet.mergeCells(`${cell}:${cell2}`);
      titleCell.value = `Total`;
      titleCell.font = {name: 'Tahoma', bold: true, color: {argb: '006b9241'}, size: 14};
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         left: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };
      titleCell = worksheet.getCell(cell3);
      titleCell.value = totalCrop;
      titleCell.font = {
         name: 'Tahoma',
         bold: true,
         color: {argb: titleCell.value < 0 ? '00AA0B06' : '006b9241'},
         size: 14,
      };
      titleCell.border = {
         top: {style: 'thin', color: {argb: '006b9241'}},
         right: {style: 'thin', color: {argb: '006b9241'}},
         bottom: {style: 'thin', color: {argb: '006b9241'}},
      };

      let next = 9 + cropSummaryData?.length + 5;
      let setColumnWidths1 = function (worksheet) {
         let columnIndex = 1;
         worksheet.getColumn(columnIndex++).width = 2; // Margin
         for (let index = 0; index < fields.length + 2; index++) {
            worksheet.getColumn(columnIndex++).width = 31;
         }
      };

      let setupTablePL = function () {
         return [
            {
               name: ' ',
               accessor: 'crop',
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            },
            ...fields?.map((field, index) => ({
               name: showByField ? field.fieldName : field.cropType,
               accessor: `value-${index}`,
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            })),
            {
               name: 'Total',
               accessor: 'total',
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            },
         ];
      };

      worksheet.getRow(next + 4).numFmt = NUMBER_FULL_FORMAT;
      worksheet.getRow(next + 1).numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getRow(next + 2).numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getRow(next + 3).numFmt = CURRENCY_FULL_EXCEL;
      worksheet.getRow(next + 5).numFmt = CURRENCY_FULL_EXCEL;

      setColumnWidths1(worksheet);
      const columns1 = setupTablePL(fieldMetricsCropDataUsing);

      setTableStyles(worksheet, next, fieldMetricsCropDataUsing?.length);

      createTable(
         'PL Table',
         worksheet,
         columns1,
         fieldMetricsCropDataUsing,
         `B${next}`,
         true,
         undefined,
         undefined,
         true,
         false,
         true,
      );

      for (let index = 0; index <= fields.length + 1; index++) {
         titleCell = worksheet.getCell(getCellLocation(index + 2, next + fieldMetricsCropDataUsing.length + 2));
         titleCell.value = 'Total Revenue';
         titleCell.font = {
            name: 'Tahoma',
            bold: true,
            color: {argb: '006b9241'},
            size: 14,
         };
         if (index === 0) {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '006b9241'}},
               left: {style: 'thin', color: {argb: '006b9241'}},
               bottom: {style: 'thin', color: {argb: '006b9241'}},
               right: {style: 'thin', color: {argb: '006b9241'}},
            };
         } else {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '006b9241'}},
               right: {style: 'thin', color: {argb: '006b9241'}},
               bottom: {style: 'thin', color: {argb: '006b9241'}},
            };
            titleCell.alignment = {horizontal: 'right'};
            titleCell.value = dataTotalRevenueData[index - 1];
            if (index === fields.length + 1) {
               titleCell.value = totalRevenueSum;
            }
         }
      }

      next = next + fieldMetricsCropDataUsing.length + 4;
      let setupTableCategory = function () {
         return [
            {
               name: ' ',
               accessor: 'name',
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            },
            ...fields?.map((field, index) => ({
               name: showByField ? field.fieldName : field.cropType,
               accessor: `value-${index}`,
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            })),
            {
               name: 'Total',
               accessor: 'total',
               style: {font: {name: 'Tahoma', size: 12, color: {argb: '00707070'}}},
            },
         ];
      };
      for (let index = next; index < next + fieldMetricsCategoryDataUsing.length; index++) {
         worksheet.getRow(index + 1).numFmt = CURRENCY_FULL_EXCEL;
      }
      setColumnWidths1(worksheet);
      const columns2 = setupTableCategory(fieldMetricsCategoryDataUsing);

      setTableStyles(worksheet, next, fieldMetricsCategoryDataUsing?.length);

      createTable(
         'PL Category Table',
         worksheet,
         columns2,
         fieldMetricsCategoryDataUsing,
         `B${next}`,
         true,
         undefined,
         undefined,
         true,
         false,
         true,
      );

      for (let index = 0; index <= fields.length + 1; index++) {
         titleCell = worksheet.getCell(getCellLocation(index + 2, next + fieldMetricsCategoryDataUsing.length + 2));
         titleCell.value = 'Total Expense';
         titleCell.font = {
            name: 'Tahoma',
            bold: true,
            color: {argb: '006b9241'},
            size: 14,
         };
         if (index === 0) {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '006b9241'}},
               left: {style: 'thin', color: {argb: '006b9241'}},
               bottom: {style: 'thin', color: {argb: '006b9241'}},
               right: {style: 'thin', color: {argb: '006b9241'}},
            };
         } else {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '006b9241'}},
               right: {style: 'thin', color: {argb: '006b9241'}},
               bottom: {style: 'thin', color: {argb: '006b9241'}},
            };
            titleCell.alignment = {horizontal: 'right'};
            titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, totalCostDataList[index - 1]);
            if (index === fields.length + 1) {
               titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, totalCost);
            }
         }
      }

      // cost per unit
      for (let index = 0; index <= fields.length + 1; index++) {
         titleCell = worksheet.getCell(getCellLocation(index + 2, next + fieldMetricsCategoryDataUsing.length + 4));
         titleCell.value = 'Cost Per Unit';
         titleCell.font = {
            name: 'Tahoma',
            bold: false,
            color: {argb: '00707070'},
            size: 14,
         };
         if (index === 0) {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '00707070'}},
               left: {style: 'thin', color: {argb: '00707070'}},
               bottom: {style: 'thin', color: {argb: '00707070'}},
               right: {style: 'thin', color: {argb: '00707070'}},
            };
         } else {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '00707070'}},
               right: {style: 'thin', color: {argb: '00707070'}},
               bottom: {style: 'thin', color: {argb: '00707070'}},
            };
            titleCell.alignment = {horizontal: 'right'};
            titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, costPerUnitDataUsing[index - 1]);
            if (index === fields.length + 1) {
               titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, costPerUnitTotalData);
            }
         }
      }

      // profit loss
      for (let index = 0; index <= fields.length + 1; index++) {
         titleCell = worksheet.getCell(getCellLocation(index + 2, next + fieldMetricsCategoryDataUsing.length + 6));
         titleCell.value = 'Profit/Loss';
         titleCell.font = {
            name: 'Tahoma',
            bold: true,
            color: {argb: '006b9241'},
            size: 14,
         };
         if (index === 0) {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '006b9241'}},
               left: {style: 'thin', color: {argb: '006b9241'}},
               bottom: {style: 'thin', color: {argb: '006b9241'}},
               right: {style: 'thin', color: {argb: '006b9241'}},
            };
         } else {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '006b9241'}},
               right: {style: 'thin', color: {argb: '006b9241'}},
               bottom: {style: 'thin', color: {argb: '006b9241'}},
            };
            titleCell.alignment = {horizontal: 'right'};
            titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, profitAndLossDataUsing[index - 1]);
            if (index === fields.length + 1) {
               titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, profitAndLossTotalData);
            }
         }
      }

      // break even
      for (let index = 0; index <= fields.length + 1; index++) {
         titleCell = worksheet.getCell(getCellLocation(index + 2, next + fieldMetricsCategoryDataUsing.length + 8));
         titleCell.value = 'Breakeven Yield';
         titleCell.font = {
            name: 'Tahoma',
            bold: false,
            color: {argb: '00707070'},
            size: 14,
         };
         if (index === 0) {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '00707070'}},
               left: {style: 'thin', color: {argb: '00707070'}},
               bottom: {style: 'thin', color: {argb: '00707070'}},
               right: {style: 'thin', color: {argb: '00707070'}},
            };
         } else {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '00707070'}},
               right: {style: 'thin', color: {argb: '00707070'}},
               bottom: {style: 'thin', color: {argb: '00707070'}},
            };
            titleCell.alignment = {horizontal: 'right'};
            titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, breakevenYieldDataUsing[index - 1]);
            if (index === fields.length + 1) {
               titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, breakevenYieldTotalData);
            }
         }
      }

      // break even price
      for (let index = 0; index <= fields.length + 1; index++) {
         titleCell = worksheet.getCell(getCellLocation(index + 2, next + fieldMetricsCategoryDataUsing.length + 10));
         titleCell.value = 'Breakeven Price';
         titleCell.font = {
            name: 'Tahoma',
            bold: false,
            color: {argb: '00707070'},
            size: 14,
         };
         if (index === 0) {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '00707070'}},
               left: {style: 'thin', color: {argb: '00707070'}},
               bottom: {style: 'thin', color: {argb: '00707070'}},
               right: {style: 'thin', color: {argb: '00707070'}},
            };
         } else {
            titleCell.border = {
               top: {style: 'thin', color: {argb: '00707070'}},
               right: {style: 'thin', color: {argb: '00707070'}},
               bottom: {style: 'thin', color: {argb: '00707070'}},
            };
            titleCell.alignment = {horizontal: 'right'};
            titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, breakevenPriceDataUsing[index - 1]);
            if (index === fields.length + 1) {
               titleCell.value = numberFormatter(CURRENCY_FULL_FORMAT, breakevenPriceTotalData);
            }
         }
      }
   };
}
