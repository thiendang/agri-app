// noinspection ES6CheckImport
import {sum} from 'lodash';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import {useCallback} from 'react';
import {
   CROP_TYPE_TEMPLATE_LIST_QUERY,
   FIELD_METRICS_BY_CROP_QUERY,
   FIELD_METRICS_BY_FIELD_QUERY,
} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useFieldMetricsExcelExport from './useFieldMetricsExcelExport';
import {CURRENCY_FULL_FORMAT, MONTH_FORMAT, NUMBER_FULL_FORMAT} from '../../../Constants';
import moment from 'moment';
import numberFormatter from 'number-formatter';
/**
 * Asset export to Excel hook to export all the current user Assets.
 *
 * Reviewed:
 */
export default function useFieldMetricsExcel(orientation, entityId, clientId, reportDate, showByField, isPerAcre) {
   const exportToExcel = useFieldMetricsExcelExport('Field Metrics', orientation, showByField, isPerAcre);
   const [getCostData] = useLazyQueryFHG(CROP_TYPE_TEMPLATE_LIST_QUERY, {fetchPolicy: 'no-cache'});
   const [getCropData] = useLazyQueryFHG(FIELD_METRICS_BY_CROP_QUERY, {fetchPolicy: 'no-cache'});
   const [getFieldData] = useLazyQueryFHG(FIELD_METRICS_BY_FIELD_QUERY, {fetchPolicy: 'no-cache'});
   return useCallback(
      async (workbook, entityName = '', assetProps) => {
         const entities = (Array.isArray(entityId) ? [...entityId] : [entityId]).filter(Boolean);
         const costData = await getCostData({variables: {entityId: entities, showByField: true}});
         const cropCostTypeTemplateList = costData?.data?.cropCostTypeTemplateList ?? [];
         const dataCropMetrics = await getCropData({
            variables: {
               entityId: entities,
               year: moment(reportDate, MONTH_FORMAT).startOf('month').year(),
               splitByField: false,
            },
         });
         const dataFieldMetrics = await getFieldData({
            variables: {
               entityId: entities,
               year: moment(reportDate, MONTH_FORMAT).startOf('month').year(),
            },
         });
         const cropsData = dataCropMetrics?.data?.fieldMetricsByCrop ?? {};
         const {fieldMetricsGroup: fieldMetricsCrop, fieldMetricsGroupTotals: fieldMetricsCropTotals} = cropsData ?? {};
         const fieldData = dataFieldMetrics?.data?.fieldMetricsByField;
         const {fieldMetricsGroup: fieldMetricsField, fieldMetricsGroupTotals: fieldMetricsFieldTotals} =
            fieldData ?? {};

         const fieldsList =
            fieldMetricsField?.map((item) => ({
               id: item?.id,
               name: item?.fieldName ? `${item.fieldName} - ${item.cropType}` : item?.cropType,
               acres: item?.acres ?? 0,
               acp: item?.projectedAcp ?? 0,
               profitAndLossPerAcre: item?.projectedProfitAndLossPerAcre ?? 0,
               breakeven: item?.projectedBreakevenYield || item?.actualBreakevenYield || 0,
               profitAndLoss: item?.projectedProfitAndLoss ?? 0,
            })) ?? [];

         const cropsList =
            fieldMetricsCrop?.map((item) => ({
               id: item?.id,
               name: item?.cropType,
               acres: item?.acres ?? 0,
               acp: item?.projectedAcp ?? 0,
               profitAndLossPerAcre: item?.projectedProfitAndLossPerAcre ?? 0,
               breakeven: item?.actualBreakevenYield || item?.projectedBreakevenYield || 0,
               profitAndLoss: item?.projectedProfitAndLoss ?? 0,
            })) ?? [];

         const totalProfitLoss = !showByField
            ? fieldMetricsCropTotals?.projectedProfitAndLoss ?? 0
            : fieldMetricsFieldTotals?.projectedProfitAndLoss ?? 0;

         const fieldMetricsFieldSort = sortBy(fieldMetricsField, ['fieldName']);

         const fieldMetricsCropData = (() => {
            const list = fieldMetricsFieldSort;
            const fields = ['Field', 'Crop', 'Yield', 'Expected Price', 'Acres', 'Production'];
            const data = [];
            fields.forEach((field) => {
               const item = {crop: field};
               item.total = 0;
               item.format = CURRENCY_FULL_FORMAT;
               item.isNumber = true;
               list?.forEach((fieldMetric, index) => {
                  switch (field) {
                     case 'Yield':
                        item[`value-${index}`] = fieldMetric?.actualYield ?? 0;
                        item.total += fieldMetric?.actualYield ?? 0;
                        item.isEditable = true;
                        item.id = fieldMetric?.fieldId;
                        item.type = 'actualYield';
                        item[`id-${index}`] = fieldMetric?.fieldId;
                        item.format = NUMBER_FULL_FORMAT;
                        item.cropTypeId = fieldMetric?.cropTypeId;
                        item.fieldId = fieldMetric?.fieldId;
                        item[`fieldName-${index}`] = fieldMetric?.fieldName;
                        item[`cropName-${index}`] = fieldMetric?.cropType;
                        break;
                     case 'Acres':
                        item[`value-${index}`] = fieldMetric?.acres ?? 0;
                        item.total += fieldMetric?.acres ?? 0;
                        item.isEditable = true;
                        item.id = fieldMetric?.fieldId;
                        item.type = 'acres';
                        item[`id-${index}`] = fieldMetric?.fieldId;
                        item.format = NUMBER_FULL_FORMAT;
                        item.cropTypeId = fieldMetric?.cropTypeId;
                        item.fieldId = fieldMetric?.fieldId;
                        item[`fieldName-${index}`] = fieldMetric?.fieldName;
                        item[`cropName-${index}`] = fieldMetric?.cropType;

                        break;
                     case 'Production':
                        item[`value-${index}`] = (fieldMetric?.actualYield ?? 0) * (fieldMetric?.acres ?? 0);
                        item.total += (fieldMetric?.actualYield ?? 0) * (fieldMetric?.acres ?? 0);
                        item.isEditable = false;
                        item.id = fieldMetric?.fieldId;
                        item.type = 'production';
                        item[`id-${index}`] = fieldMetric?.fieldId;
                        item.format = NUMBER_FULL_FORMAT;
                        item.cropTypeId = fieldMetric?.cropTypeId;
                        item.fieldId = fieldMetric?.fieldId;
                        item[`fieldName-${index}`] = fieldMetric?.fieldName;
                        item[`cropName-${index}`] = fieldMetric?.cropType;

                        break;
                     case 'Expected Price':
                        item[`value-${index}`] = fieldMetric?.projectedAcp ?? 0;
                        item.total += fieldMetric?.projectedAcp ?? 0;
                        item.isEditable = true;
                        item.id = fieldMetric?.fieldId;
                        item.type = 'projectedAcp';
                        item[`id-${index}`] = fieldMetric?.fieldId;
                        item.cropTypeId = fieldMetric?.cropTypeId;
                        item.fieldId = fieldMetric?.fieldId;
                        item[`fieldName-${index}`] = fieldMetric?.fieldName;
                        item[`cropName-${index}`] = fieldMetric?.cropType;

                        break;
                     case 'Field':
                        item[`value-${index}`] = fieldMetric?.fieldName || '';
                        item.isEditable = true;
                        item.id = fieldMetric?.fieldId;
                        item.fieldId = fieldMetric?.fieldId;
                        item.type = 'field';
                        item[`id-${index}`] = fieldMetric?.fieldId;
                        item.format = null;
                        item.isNumber = false;
                        item.field = true;
                        item.cropTypeId = fieldMetric?.cropTypeId;
                        item[`fieldName-${index}`] = fieldMetric?.fieldName;
                        item[`cropName-${index}`] = fieldMetric?.cropType;

                        break;
                     case 'Crop':
                        item[`value-${index}`] = fieldMetric?.cropType || '';
                        item.isEditable = true;
                        item.id = fieldMetric?.cropTypeId;
                        item.fieldId = fieldMetric?.fieldId;
                        item.type = 'crop';
                        item[`id-${index}`] = fieldMetric?.cropTypeId;
                        item.format = null;
                        item.isNumber = false;
                        item.field = true;
                        item.cropTypeId = fieldMetric?.cropTypeId;
                        item[`fieldName-${index}`] = fieldMetric?.fieldName;
                        item[`cropName-${index}`] = fieldMetric?.cropType;

                        break;
                     default:
                        console.log('The field type is not recognized.', field);
                        break;
                  }
               });
               data.push(item);
            });
            return data;
         })();

         const acresData = fieldMetricsCropData?.find((item) => item.crop === 'Acres');

         const fieldMetricsCategoryDataPerAcre = (() => {
            const data = [];
            cropCostTypeTemplateList.forEach((field) => {
               const cropCosts = field?.cropCosts ?? [];
               const item = {name: field?.name};
               item.cropCostTypeId = field?.id;
               item.total = 0;
               item.format = CURRENCY_FULL_FORMAT;
               item.isEditable = true;
               item.isBold = false;
               item.isNumber = true;
               fieldMetricsFieldSort.forEach((fieldMetric, index) => {
                  item[`cropTypeId-${index}`] = fieldMetric?.cropTypeId;
                  const cropCost = cropCosts.find((cost) => cost?.field?.id === fieldMetric?.fieldId);
                  if (cropCost) {
                     item[`value-${index}`] =
                        acresData?.[`value-${index}`] === 0 ? 0 : cropCost.costPerAcre / acresData?.[`value-${index}`];
                     item.total +=
                        acresData?.[`value-${index}`] === 0 ? 0 : cropCost.costPerAcre / acresData?.[`value-${index}`];
                     item[`cropCostId-${index}`] = cropCost.id;
                  }
               });
               data.push(item);
            });
            return data;
         })();

         const fieldMetricsCategoryData = (() => {
            const data = [];
            cropCostTypeTemplateList.forEach((field) => {
               const cropCosts = field?.cropCosts ?? [];
               const item = {name: field?.name};
               item.cropCostTypeId = field?.id;
               item.total = 0;
               item.format = CURRENCY_FULL_FORMAT;
               item.isEditable = true;
               item.isBold = false;
               item.isNumber = true;
               fieldMetricsFieldSort.forEach((fieldMetric, index) => {
                  item[`cropTypeId-${index}`] = fieldMetric?.cropTypeId;
                  item[`field-${index}`] = fieldMetric?.fieldId;
                  const cropCost = cropCosts.find((cost) => cost?.field?.id === fieldMetric.fieldId);
                  if (cropCost) {
                     item[`value-${index}`] = cropCost.costPerAcre;
                     item.total += cropCost.costPerAcre;
                     item[`cropCostId-${index}`] = cropCost.id;
                     item[`cropTypeId-${index}`] = cropCost.cropTypeId;
                     item[`field-${index}`] = cropCost.field?.id;
                     item[`note-${index}`] = cropCost.note;
                     item[`cost-${index}`] = cropCost;
                  }
               });
               data.push(item);
            });
            return data;
         })();

         const fieldMetricsCropTotalsData = (() => {
            const totals = [];
            fieldMetricsFieldSort?.forEach((fieldMetric) => {
               const item = {crop: fieldMetric.cropType};
               item.id = fieldMetric.fieldId;
               item.value =
                  (fieldMetric?.actualYield ?? 0) * (fieldMetric?.acres ?? 0) * (fieldMetric?.projectedAcp ?? 0);
               totals.push(item);
            });
            return totals;
         })();

         const dataTotalRevenuePdfPerAcre = fieldMetricsCropTotalsData?.map((fieldMetric, index) => {
            return numberFormatter(
               CURRENCY_FULL_FORMAT,
               acresData?.[`value-${index}`] === 0 ? 0 : fieldMetric?.value / acresData?.[`value-${index}`],
            );
         });

         const dataTotalRevenuePdf = fieldMetricsCropTotalsData?.map((fieldMetric, index) => {
            return numberFormatter(CURRENCY_FULL_FORMAT, fieldMetric?.value);
         });

         const totalAcresData = (() => {
            let total = 0;
            fieldMetricsCropTotalsData.forEach((fieldMetric, index) => {
               total += acresData?.[`value-${index}`] || 0;
            });
            return total;
         })();

         const totalCostDataPerAcre = (() => {
            const totals = [];
            if (fieldMetricsFieldSort?.length > 0 && cropCostTypeTemplateList?.length > 0) {
               fieldMetricsFieldSort?.forEach((fieldMetric, index) => {
                  let sum = 0;
                  cropCostTypeTemplateList.forEach((cost) => {
                     const cropCost = cost?.cropCosts?.find((cost) => cost?.field?.id === fieldMetric.id);
                     if (acresData?.[`value-${index}`] === 0) {
                        sum += 0;
                     } else {
                        sum += (cropCost?.costPerAcre ?? 0) / acresData?.[`value-${index}`];
                     }
                  });
                  totals.push(sum);
               });
            }
            return totals;
         })();

         const totalCostData = (() => {
            const totals = [];
            fieldMetricsCropTotalsData?.forEach((fieldMetric) => {
               let sum = 0;
               cropCostTypeTemplateList.forEach((cost) => {
                  const cropCost = cost?.cropCosts?.find((cost) => cost?.field?.id === fieldMetric?.id);
                  sum += cropCost?.costPerAcre ?? 0;
               });
               totals.push(sum);
            });
            return totals;
         })();

         const costPerUnitData = (() => {
            const totals = [];
            if (totalCostData?.length > 0) {
               totalCostData?.forEach((sum, index) => {
                  const obj = fieldMetricsCropData.find((item) => item.crop === 'Production');
                  let total = (sum || 0) / (obj?.[`value-${index}`] || 1);
                  if (isPerAcre) {
                     const acresObject = fieldMetricsCropData.find((item) => item.crop === 'Acres');
                     total = total / acresObject?.[`value-${index}`] || 1;
                  }

                  if (obj?.[`value-${index}`] === 0) {
                     total = 0;
                  }
                  totals.push(total);
               });
            }
            return totals;
         })();

         const profitAndLossData = (() => {
            return fieldMetricsFieldSort?.map((item) => {
               if (isPerAcre) {
                  return item.projectedProfitAndLoss / item.acres;
               }
               return item.projectedProfitAndLoss;
            });
         })();

         const breakevenYieldData = (() => {
            const totals = [];
            const fields = fieldMetricsFieldSort;

            totalCostData.forEach((sum, index) => {
               let total = !fields[index]?.projectedAcp ? 0 : sum / fields[index]?.projectedAcp;
               if (isPerAcre) {
                  const acresObject = fieldMetricsCropData.find((item) => item.crop === 'Acres');
                  total = total / acresObject?.[`value-${index}`] || 1;
               }
               totals.push(total);
            });
            return totals;
         })();

         const breakevenPriceData = (() => {
            const totals = [];
            totalCostData?.forEach((sum, index) => {
               const obj = fieldMetricsCropData.find((item) => item.crop === 'Yield');
               let total = (sum || 0) / (obj?.[`value-${index}`] || 1);
               if (obj?.[`value-${index}`] === 0) {
                  total = 0;
               }
               if (isPerAcre && total > 0) {
                  const acresObject = fieldMetricsCropData.find((item) => item.crop === 'Acres');
                  total = total / acresObject?.[`value-${index}`] || 1;
               }
               totals.push(total);
            });
            return totals;
         })();

         // data
         const cropSummaryData = showByField ? fieldsList : cropsList;
         const totalCrop = totalProfitLoss;
         const historyDate = reportDate;
         const fields = fieldMetricsFieldSort;
         const fieldMetricsCropDataUsing = fieldMetricsCropData;
         const fieldMetricsCategoryDataUsing = isPerAcre ? fieldMetricsCategoryDataPerAcre : fieldMetricsCategoryData;
         const dataTotalRevenueData = isPerAcre ? dataTotalRevenuePdfPerAcre : dataTotalRevenuePdf;
         const totalRevenueSum = numberFormatter(
            CURRENCY_FULL_FORMAT,
            isPerAcre
               ? totalAcresData === 0
                  ? 0
                  : sumBy(fieldMetricsCropTotalsData, 'value') / totalAcresData
               : sumBy(fieldMetricsCropTotalsData, 'value'),
         );
         const totalCostDataList = isPerAcre ? totalCostDataPerAcre : totalCostData;
         const totalCost = sum(isPerAcre ? totalCostDataPerAcre : totalCostData);
         const costPerUnitDataUsing = costPerUnitData;
         const costPerUnitTotalData = sum(costPerUnitData);
         const profitAndLossDataUsing = profitAndLossData;
         const profitAndLossTotalData = sum(profitAndLossData);
         const breakevenYieldDataUsing = breakevenYieldData;
         const breakevenYieldTotalData = sum(breakevenYieldData);
         const breakevenPriceDataUsing = breakevenPriceData;
         const breakevenPriceTotalData = sum(breakevenPriceData);
         // end data
         return exportToExcel(
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
         );
      },
      [entityId, exportToExcel, getCostData, getCropData, getFieldData, isPerAcre, reportDate, showByField],
   );
}
