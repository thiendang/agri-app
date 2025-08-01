import {Delete} from '@mui/icons-material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import {ClickAwayListener} from '@mui/material';
import {Popover} from '@mui/material';
import {Box, FormControlLabel, Stack, Switch} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {makeStyles, useTheme} from '@mui/styles';
import find from 'lodash/find';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {reportDateProperties} from '../../../components/ClientDrawer';
import Empty from '../../../components/Empty';
import PermissionAllow from '../../../components/permission/PermissionAllow';
import {FIELD_METRICS_EDIT} from '../../../components/permission/PermissionAllow';
import usePermission from '../../../components/permission/usePermission';
import {EDIT_ICON} from '../../../Constants';
import {ROLLING_CYCLE_MAX_MONTHS} from '../../../Constants';
import {BORDER_RADIUS_16} from '../../../Constants';
import {
   BORDER_RADIUS_10,
   CURRENCY_FULL_FORMAT,
   DARK_MODE_COLORS,
   DATE_DB_FORMAT,
   EDIT_PATH,
   FIELD_METRICS_INDEX,
   MONTH_FORMAT,
   NOTE_EDIT_IMG,
   NUMBER_FULL_FORMAT,
   SCALE_APP,
} from '../../../Constants';
import Header from '../../../components/Header';
import {FIELD_REMOVE} from '../../../data/QueriesGL';
import {CROP_TYPE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {CROP_TYPE_ALL_QUERY} from '../../../data/QueriesGL';
import {
   CROP_COST_CREATE_UPDATE,
   CROP_COST_TYPE_CREATE,
   CROP_COST_TYPE_CREATE_UPDATE,
   CROP_COST_UPDATE,
   CROP_TYPE_TEMPLATE_LIST_QUERY,
   FIELD_CREATE_UPDATE,
   FIELD_METRICS_BY_CROP_QUERY,
   FIELD_METRICS_BY_FIELD_QUERY,
   FIELD_METRICS_CREATE_UPDATE,
   FIELD_UPDATE,
   getFieldMetricsCropRefetchQueries,
} from '../../../data/QueriesGL';
import ConfirmButton from '../../../fhg/components/ConfirmButton';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import ScrollStack from '../../../fhg/ScrollStack';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import TypographyFHG from '../../../fhg/components/Typography';
import TableNewUiFHG, {selectedCellState} from '../../../fhg/components/table/TableNewUiFHG';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import useScalePanel from '../../../fhg/hooks/useScalePanel';
import {validateUuid} from '../../../fhg/utils/Utils';
import TextEdit from './TextEdit';
import {sortBy, sum} from 'lodash';
import TableStickyContainerFrame from '../../../fhg/components/table/TableStickyContainerFrame';
import sumBy from 'lodash/sumBy';
import CropSummary from './CropSummary';
import ExportChoiceButton from '../../../components/ExportChoiceButton';
import ButtonLF from '../../../components/ButtonLF';
import {useSetRecoilState} from 'recoil';
import {formatMessage} from '../../../fhg/utils/Utils';
import {useIntl} from 'react-intl';
import {entityState} from '../../admin/EntityListDropDown';

const PROFIT_LOSS = 'profit and loss';
const TOTAL_REVENUE = 'total revenue';
const CATEGORIES = 'categories';
const TOTAL_EXPENSE = 'total expense';
const TOTAL_PROFIT_LOST = 'total profit and loss';
const BREAKEVEN_YIELD = 'breakeven yield';
const BREAKEVEN_PRICE = 'breakeven price';

const useStyles = makeStyles(
   (theme) => ({
      headerTextStyle: {
         fontWeight: 400,
         fontSize: 18 * SCALE_APP,
      },
      tableStyle: {
         cursor: 'pointer',
         borderRadius: BORDER_RADIUS_10,
         '& .searchBarTitleStyle': {
            position: 'sticky',
            left: 20,
            zIndex: 4,
         },
         '& .searchStyle': {
            position: 'sticky',
            right: 10,
         },
         '& tbody tr td p': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& tbody tr td div': {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
         },
         '& .MuiToolbar-root': {
            backgroundColor: '#FAFAFA',
            width: '100%',
            position: 'sticky',
            // if 0 some of the table data will show, but -1 hides other data underneath.
            top: -1,
            zIndex: 4,
         },
         totalFooter: {
            position: 'sticky',
            right: 10,
         },
         '& .MuiTableCell-stickyHeader': {
            top: 0,
         },
      },
      totalFooter: {
         position: 'sticky',
         right: 10,
      },
      date: {
         '& > .MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeEnd.MuiIconButton-sizeMedium': {
            marginRight: '0px',
            color: theme.palette.primary.main,
         },
      },
      root: {
         backgroundColor: theme.palette.background.default,
         // paddingTop: '20px',
         display: 'flex',
      },
      reportDate: {
         backgroundColor: theme.palette.background.default,
         boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)',
         borderRadius: BORDER_RADIUS_10,
         borderWidth: '0px',
         width: 250 * SCALE_APP,
         marginLeft: theme.spacing(0.75),
         color: 'theme.palette.text.darkGrey',
         fontWeight: 400,
         fontSize: 16 * SCALE_APP,
         margin: theme.spacing(0.125),
      },
      headerStyle: {
         textAlign: 'center',
         fontWeight: '700',
         backgroundColor: '#EDF1EA',
         border: '1px solid rgba(224, 224, 224, 1)',
         borderLeft: '0px',
         borderBottom: '0px',
      },
      headerBoldTextStyle: {
         fontWeight: '700',
         fontSize: 20 * SCALE_APP,
      },
      footerTextStyle: {
         fontWeight: 400,
         fontSize: 20 * SCALE_APP,
      },
   }),
   {name: 'FieldMetricsStyle'},
);

const useTableStyles = makeStyles(
   (theme) => ({
      headerStyle: {
         backgroundColor: `${theme.palette.background.paper4} !important`,
         whiteSpace: 'nowrap',
         textAlign: 'end',
         width: '210px !important',
         minWidth: '210px !important',
         maxWidth: '210px !important',
         position: 'sticky',
         left: 0,
         top: '0px !important',

         '& .MuiTypography-root': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
         },
      },
      tableRoot: {
         margin: 0,
         backgroundColor: theme.palette.background.paper4,
         borderRadius: '10px',
         width: '100%',
         minWidth: '100%',
         overflow: 'hidden',
      },
      totalTableRoot: {
         margin: 0,
         backgroundColor: theme.palette.background.paper4,
         width: '100%',
         minWidth: '100%',
         overflow: 'hidden',
      },
      headerStyleNoHeader: {
         display: 'none',
      },
      cellStyle2: {
         padding: '0px',
         paddingRight: '4px !important',
         paddingLeft: '16px !important',
         paddingTop: '2px !important',
         paddingBottom: '2px !important',
         color: theme.palette.text.primary,
         width: '210px !important',
         minWidth: '210px !important',
         maxWidth: '210px !important',
      },
      stickyFrame: {
         overflowX: 'auto',
         '& td:first-child': {
            position: 'sticky',
            left: 0,
            zIndex: 2,
            backgroundColor: 'inherit',
         },
         '& th:first-child': {
            zIndex: 2,
         },
         '& thead': {
            backgroundColor: 'inherit',
         },
      },
   }),
   {name: 'tableStyles'},
);

export default function ProfitLoss() {
   const [
      {entityId, reportDate, clientId, showByField: showByFieldQuery, isPerAcre: isPerAcreQuery},
      setSearchAsObject,
      searchAsString,
   ] = useCustomSearchParams();

   const pollInterval = useRecoilValue(pollState);
   const hasEdit = usePermission(FIELD_METRICS_EDIT, false);
   const theme = useTheme();
   const intl = useIntl();

   const date = reportDate ? reportDate : moment().format(MONTH_FORMAT);
   const month = moment(date, MONTH_FORMAT)?.format('MMMM');
   const year = moment(date, MONTH_FORMAT)?.year();
   const [anchorEl, setAnchorEl] = useState();
   const setReportDateProperties = useSetRecoilState(reportDateProperties);

   usePageTitle({titleKey: 'fieldMetrics.title', values: {month, year}});

   const [dataCropType] = useQueryFHG(CROP_TYPE_ALL_QUERY, {
      variables: {
         includeDeleted: false,
      },
      pollInterval,
   });
   const cropTypes = dataCropType?.cropType_All ?? [];

   const [createFieldMetrics] = useMutationLxFHG(FIELD_METRICS_CREATE_UPDATE);
   const [createUpdateCropCost] = useMutationLxFHG(CROP_COST_CREATE_UPDATE);
   const [createUpdateCropCostType] = useMutationLxFHG(CROP_COST_TYPE_CREATE_UPDATE);
   const [createCropCostType] = useMutationLxFHG(CROP_COST_TYPE_CREATE);
   const [updateField] = useMutationLxFHG(FIELD_UPDATE);
   const [createField] = useMutationLxFHG(FIELD_CREATE_UPDATE);
   const [createCrop] = useMutationLxFHG(CROP_TYPE_CREATE_UPDATE);
   const [deleteField] = useMutationLxFHG(FIELD_REMOVE);

   const [updateCropCost] = useMutationLxFHG(CROP_COST_UPDATE);

   const setEntityStatus = useSetRecoilState(entityState);

   const cellSelectedRef = useRef(null);
   const [selectedForDelete, setSelectedForDelete] = useState();

   const [showByField, setShowByField] = useState(!!showByFieldQuery);

   const [isPerAcre, setIsPerAcre] = React.useState(!!isPerAcreQuery);

   useEffect(() => {
      const endDate = moment().add(ROLLING_CYCLE_MAX_MONTHS, 'months').endOf('year');
      setReportDateProperties({disableFuture: false, endDate});
      return () => {
         setReportDateProperties({disableFuture: true, endDate: undefined});
      };
   }, [setReportDateProperties]);

   useEffect(() => {
      setEntityStatus((state) => ({...state, useSingleEntity: true}));
   }, [setEntityStatus]);

   useEffect(() => {
      if (showByFieldQuery !== showByField || isPerAcreQuery !== isPerAcre) {
         setSearchAsObject((prev) => ({
            ...prev,
            showByField,
            isPerAcre,
         }));
      }
   }, [isPerAcre, setSearchAsObject, showByField, isPerAcreQuery, showByFieldQuery]);

   const tableClasses = useTableStyles();

   const entities = useMemo(() => (Array.isArray(entityId) ? [...entityId] : [entityId]).filter(Boolean), [entityId]);

   const [costData, {refetch: refetchCropTypeTemplate}] = useQueryFHG(CROP_TYPE_TEMPLATE_LIST_QUERY, {
      variables: {
         entityId: entities,
         showByField: true,
      },
      pollInterval,
      fetchPolicy: 'network-only',
      skip: !validateUuid(entities),
   });

   useEffect(() => {
      (async () => {
         if (validateUuid(entities)) {
            await refetchCropTypeTemplate({
               entityId: entities,
               showByField: true,
            });
         }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [entities]);

   const cropCostTypeTemplateList = useMemo(() => sortBy(costData?.cropCostTypeTemplateList, 'name'), [costData]);

   const [dataCropMetrics, {refetch}] = useQueryFHG(FIELD_METRICS_BY_CROP_QUERY, {
      variables: {
         entityId: entities,
         year: Number(year),
         splitByField: false,
      },
      skip: entities?.length === 0 || !validateUuid(entities),
      pollInterval,
      fetchPolicy: 'network-only',
   });

   const [dataFieldMetrics, {refetch: refetchField}] = useQueryFHG(FIELD_METRICS_BY_FIELD_QUERY, {
      variables: {
         entityId: entities,
         year: Number(year),
      },
      skip: entities?.length === 0 || !validateUuid(entities),
      pollInterval,
      fetchPolicy: 'network-only',
   });

   const cropsData = dataCropMetrics?.fieldMetricsByCrop ?? {};
   const fieldData = dataFieldMetrics?.fieldMetricsByField;
   const {fieldMetricsGroup: fieldMetricsField = []} = fieldData ?? {};

   // We don't allow sorting.
   const fieldMetricsFieldSort = fieldMetricsField;

   const profitAndLossData = useMemo(() => {
      return fieldMetricsFieldSort?.map((item) => {
         if (isPerAcre && item?.acres > 0) {
            return item.projectedProfitAndLoss / item.acres;
         }
         return item.projectedProfitAndLoss;
      });
   }, [fieldMetricsFieldSort, isPerAcre]);

   const classes = useStyles();

   const {buttonPanel, scaleStyle, scale} = useScalePanel(
      {
         position: 'relative',
         top: 'unset',
         right: 'unset',
         backgroundColor: theme.palette.mode === 'dark' ? DARK_MODE_COLORS.Background_2 : 'white',
         opacity: 1,
      },
      false,
   );

   const navigate = useNavigate();

   const handleAddCrop = useCallback(() => {
      navigate({pathname: EDIT_PATH, search: searchAsString}, {state: {id: -1}});
   }, [navigate, searchAsString]);

   const fieldMetricsCropTotalsData = useMemo(() => {
      const totals = [];
      fieldMetricsFieldSort?.forEach((fieldMetric) => {
         const item = {crop: fieldMetric.cropType};
         item.id = fieldMetric.fieldId;
         item.value = (fieldMetric?.actualYield ?? 0) * (fieldMetric?.acres ?? 0) * (fieldMetric?.projectedAcp ?? 0);
         totals.push(item);
      });
      return totals;
   }, [fieldMetricsFieldSort]);

   const columnsTotalRevenue = useMemo(() => {
      const cells =
         fieldMetricsCropTotalsData?.map((fieldMetric, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, fieldMetric?.value)}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => (
               <TypographyFHG id={'total.revenue'} color='primary.green' className={classes.headerBoldTextStyle} />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: ({row}) => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, sumBy(fieldMetricsCropTotalsData, 'value'))}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [classes.headerBoldTextStyle, fieldMetricsCropTotalsData]);

   const fieldMetricsCropData = useMemo(() => {
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
                  item.isEditable = hasEdit;
                  item.id = fieldMetric?.fieldId;
                  item.type = 'actualYield';
                  item[`fieldId-${index}`] = fieldMetric?.fieldId;
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
                  item.isEditable = hasEdit;
                  item.id = fieldMetric?.fieldId;
                  item.type = 'acres';
                  item[`fieldId-${index}`] = fieldMetric?.fieldId;
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
                  item[`fieldId-${index}`] = fieldMetric?.fieldId;
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
                  item.isEditable = hasEdit;
                  item.id = fieldMetric?.fieldId;
                  item.type = 'projectedAcp';
                  item[`fieldId-${index}`] = fieldMetric?.fieldId;
                  item[`id-${index}`] = fieldMetric?.fieldId;
                  item.cropTypeId = fieldMetric?.cropTypeId;
                  item.fieldId = fieldMetric?.fieldId;
                  item[`fieldName-${index}`] = fieldMetric?.fieldName;
                  item[`cropName-${index}`] = fieldMetric?.cropType;

                  break;
               case 'Field':
                  item[`value-${index}`] = fieldMetric?.fieldName || '';
                  item.isEditable = hasEdit;
                  item.total = ' ';
                  item.id = fieldMetric?.fieldId;
                  item.fieldId = fieldMetric?.fieldId;
                  item.type = 'field';
                  item[`fieldId-${index}`] = fieldMetric?.fieldId;
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
                  item.isEditable = hasEdit;
                  item.id = fieldMetric?.cropTypeId;
                  item.total = ' ';
                  item.fieldId = fieldMetric?.fieldId;
                  item.type = 'crop';
                  item[`fieldId-${index}`] = fieldMetric?.fieldId;
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
   }, [fieldMetricsFieldSort, hasEdit]);

   const acresData = useMemo(() => fieldMetricsCropData?.find((item) => item.crop === 'Acres'), [fieldMetricsCropData]);

   const totalCostData = useMemo(() => {
      const totals = [];
      fieldMetricsCropTotalsData?.forEach((fieldMetric, index) => {
         let sum = 0;
         cropCostTypeTemplateList.forEach((cost) => {
            const cropCost = cost?.cropCosts?.find((cost) => cost?.field?.id === fieldMetric?.id);
            if (acresData?.[`value-${index}`] === 0) {
               sum += 0;
            } else {
               sum += (cropCost?.costPerAcre ?? 0) * acresData?.[`value-${index}`];
            }
         });
         totals.push(sum);
      });
      return totals;
   }, [acresData, cropCostTypeTemplateList, fieldMetricsCropTotalsData]);

   const totalCostDataPerAcre = useMemo(() => {
      const totals = [];
      if (fieldMetricsFieldSort?.length > 0 && cropCostTypeTemplateList?.length > 0) {
         fieldMetricsFieldSort?.forEach((fieldMetric) => {
            let sum = 0;
            cropCostTypeTemplateList.forEach((cost) => {
               const cropCost = cost?.cropCosts?.find((cost) => cost.field?.id === fieldMetric?.fieldId);
               sum += cropCost?.costPerAcre ?? 0;
            });
            totals.push(sum);
         });
      }
      return totals;
   }, [cropCostTypeTemplateList, fieldMetricsFieldSort]);

   const totalAcresData = useMemo(() => {
      let total = 0;
      fieldMetricsCropTotalsData.forEach((fieldMetric, index) => {
         total += acresData?.[`value-${index}`] || 0;
      });
      return total;
   }, [acresData, fieldMetricsCropTotalsData]);

   const columnsTotalRevenuePerAcre = useMemo(() => {
      const cells =
         fieldMetricsCropTotalsData?.map((fieldMetric, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                        {numberFormatter(
                           CURRENCY_FULL_FORMAT,
                           acresData?.[`value-${index}`] === 0 ? 0 : fieldMetric?.value / acresData?.[`value-${index}`],
                        )}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: () => (
               <TypographyFHG id={'total.revenue'} color='primary.green' className={classes.headerBoldTextStyle} />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: () => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                     {numberFormatter(
                        CURRENCY_FULL_FORMAT,
                        totalAcresData === 0 ? 0 : sumBy(fieldMetricsCropTotalsData, 'value') / totalAcresData,
                     )}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [acresData, classes.headerBoldTextStyle, fieldMetricsCropTotalsData, totalAcresData]);

   const breakevenYieldData = useMemo(() => {
      const totals = [];
      const fields = fieldMetricsFieldSort;
      totalCostData.forEach((sum, index) => {
         let total = !fields[index]?.projectedAcp ? 0 : sum / fields[index]?.projectedAcp;
         const acresObject = fieldMetricsCropData.find((item) => item.crop === 'Acres');
         total = total / acresObject?.[`value-${index}`] || 0;
         totals.push(total);
      });
      return totals;
   }, [fieldMetricsFieldSort, totalCostData, fieldMetricsCropData]);

   const breakevenPriceData = useMemo(() => {
      const totals = [];
      totalCostData?.forEach((sum, index) => {
         const obj = fieldMetricsCropData.find((item) => item.crop === 'Yield');
         let total = (sum || 0) / (obj?.[`value-${index}`] || 1);

         if (obj?.[`value-${index}`] === 0) {
            total = 0;
         }

         if (total > 0) {
            const acresObject = fieldMetricsCropData.find((item) => item.crop === 'Acres');
            total = total / acresObject?.[`value-${index}`] || 1;
         }
         totals.push(total);
      });
      return totals;
   }, [totalCostData, fieldMetricsCropData]);

   const columnsTotalCost = useMemo(() => {
      const cells =
         totalCostData?.map((sum, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, sum)}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => (
               <TypographyFHG id={'total.expense'} color='primary.green' className={classes.headerBoldTextStyle} />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: ({row}) => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, sum(totalCostData))}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [classes.headerBoldTextStyle, totalCostData]);

   const columnsTotalCostPerAcre = useMemo(() => {
      const cells =
         totalCostData?.map((sum, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                        {numberFormatter(
                           CURRENCY_FULL_FORMAT,
                           acresData?.[`value-${index}`] === 0 ? 0 : sum / acresData?.[`value-${index}`],
                        )}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => (
               <TypographyFHG id={'total.expense'} color='primary.green' className={classes.headerBoldTextStyle} />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: ({row}) => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, sum(totalCostDataPerAcre))}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [acresData, classes.headerBoldTextStyle, totalCostData, totalCostDataPerAcre]);

   const columnsTotalPL = useMemo(() => {
      const cells =
         profitAndLossData?.map((value, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, value)}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => (
               <TypographyFHG
                  id={'fieldMetrics.profitLoss.row'}
                  color='primary.green'
                  className={classes.headerBoldTextStyle}
               />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: ({row}) => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='primary.green' className={classes.headerBoldTextStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, sum(profitAndLossData))}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [classes.headerBoldTextStyle, profitAndLossData]);

   const columnsBreakevenYield = useMemo(() => {
      const cells =
         breakevenYieldData?.map((value, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='text.secondary' className={classes.footerTextStyle}>
                        {numberFormatter(NUMBER_FULL_FORMAT, value)}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => (
               <TypographyFHG
                  id={'column.breakeven.yield'}
                  color='text.secondary'
                  className={classes.footerTextStyle}
               />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: ({row}) => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='text.secondary' className={classes.footerTextStyle}>
                     {numberFormatter(NUMBER_FULL_FORMAT, sum(breakevenYieldData))}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [breakevenYieldData, classes.footerTextStyle]);

   const columnsBreakevenPrice = useMemo(() => {
      const cells =
         breakevenPriceData?.map((value, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: () => (
                  <Box
                     sx={{
                        height: '31px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                     }}
                  >
                     <TypographyFHG color='text.secondary' className={classes.footerTextStyle}>
                        {numberFormatter(CURRENCY_FULL_FORMAT, value)}
                     </TypographyFHG>
                  </Box>
               ),
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => (
               <TypographyFHG id={'breakeven.price'} color='text.secondary' className={classes.footerTextStyle} />
            ),
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: () => null,
            accessor: 'total',
            Cell: ({row}) => (
               <Box
                  sx={{
                     height: '31px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                  }}
               >
                  <TypographyFHG color='text.secondary' className={classes.footerTextStyle}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, sum(breakevenPriceData))}
                  </TypographyFHG>
               </Box>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [breakevenPriceData, classes.footerTextStyle]);

   const handleEditCrop = useCallback(
      (fieldMetric) => () => {
         navigate({pathname: EDIT_PATH, search: searchAsString}, {replace: true, state: {id: fieldMetric.fieldId}});
      },
      [navigate, searchAsString],
   );

   const columns = useMemo(() => {
      const cells =
         fieldMetricsFieldSort?.map((fieldMetric, index) => {
            return {
               Header: () => (
                  <Stack flexDirection={'row'} alignItems={'center'} gap={1}>
                     <IconButton onClick={handleEditCrop(fieldMetric)}>
                        <img alt='edit' src={EDIT_ICON} />
                     </IconButton>

                     <TypographyFHG className={classes.headerBoldTextStyle}>
                        {fieldMetric.fieldName
                           ? `${fieldMetric.fieldName} - ${fieldMetric.cropType}`
                           : fieldMetric.cropType}
                     </TypographyFHG>
                  </Stack>
               ),
               accessor: `value-${index}`,
               Cell: ({row, updateMyData}) => {
                  if (row.original?.isEditable) {
                     return (
                        <TextEdit
                           itemId={
                              (row?.original?.crop === 'Field' || row?.original?.crop === 'Crop') && fieldMetric.fieldId
                           }
                           onUpdate={(value) =>
                              updateMyData(row.original[`id-${index}`], row.original.type, value, {
                                 ...row.original,
                                 fieldId: fieldMetric.fieldId,
                                 cropTypeId: fieldMetric.cropTypeId,
                              })
                           }
                           onFocus={() => {
                              setSelectedForDelete({item: row.original, index});
                           }}
                           value={row.values?.[`value-${index}`]}
                           isNumber={row.original?.isNumber}
                           format={row.original?.format}
                           row={row}
                        />
                     );
                  } else if (!row.original?.isNumber && !row.original.format) {
                     return (
                        <Box
                           sx={{
                              height: '31px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                           }}
                           onClick={() => {
                              setSelectedForDelete({item: row.original, index});
                           }}
                        >
                           <TypographyFHG
                              color='text.secondary'
                              style={{
                                 textAlign: 'right',
                              }}
                           >
                              {row.values?.[`value-${index}`]}
                           </TypographyFHG>
                        </Box>
                     );
                  } else {
                     return (
                        <Box
                           sx={{
                              height: '31px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                           }}
                        >
                           <TypographyFHG
                              color='text.secondary'
                              variant='fs18400'
                              style={{
                                 textAlign: 'right',
                              }}
                           >
                              {numberFormatter(
                                 row.original?.isNumber ? NUMBER_FULL_FORMAT : CURRENCY_FULL_FORMAT,
                                 row.values?.[`value-${index}`],
                              )}
                           </TypographyFHG>
                        </Box>
                     );
                  }
               },
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'crop',
            Cell: ({row}) => {
               const isEditable = row.original?.isEditable;
               return (
                  <Box style={{textAlign: 'left'}}>
                     <TypographyFHG variant={'fs18400'} color={isEditable ? 'text.primary' : 'text.secondary'}>
                        {row.values?.crop}
                     </TypographyFHG>
                  </Box>
               );
            },
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: <TypographyFHG id={'total'} className={classes.headerBoldTextStyle} />,
            accessor: 'total',
            Cell: ({row}) => {
               if (row?.index !== 0) {
                  const isEditable = row.original?.isEditable;
                  return (
                     <div
                        style={{
                           textAlign: 'right',
                        }}
                     >
                        <TypographyFHG variant='fs18400' color={isEditable ? 'text.primary' : 'text.secondary'}>
                           {numberFormatter(row.original?.format || NUMBER_FULL_FORMAT, row.values?.total)}
                        </TypographyFHG>
                     </div>
                  );
               }
            },
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [classes.headerBoldTextStyle, fieldMetricsFieldSort, handleEditCrop]);

   const updateNote = useCallback(
      (row) => async (newNote) => {
         try {
            if (!row) return;
            if (!row?.field?.id && !row?.cropCostTypeId) {
               console.log('missing both fieldId and cropCostTypeId');
            }
            await createUpdateCropCost({
               variables: {
                  cropCost: {
                     entityId,
                     note: newNote,
                     cropCostTypeId: row?.cropCostTypeId,
                     fieldId: row?.field?.id,
                     date: moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT),
                     cropTypeId: row?.cropType?.id,
                  },
               },
            });
            await refetchCropTypeTemplate();
         } catch (error) {
            console.log('updateNote error', error);
         }
      },
      [createUpdateCropCost, entityId, refetchCropTypeTemplate, reportDate],
   );

   const columnsCategory = useMemo(() => {
      const cells =
         fieldMetricsFieldSort?.map((fieldMetric, index) => {
            return {
               Header: () => null,
               accessor: `value-${index}`,
               Cell: ({row, updateMyData, cell}) => {
                  if (row.original?.isEditable && !row.original?.last) {
                     const id = `${cell.row.id}-${cell.column.id}`;
                     return (
                        <TextEdit
                           key={id}
                           id={id}
                           onUpdate={(value) =>
                              updateMyData(
                                 row.original.cropCostTypeId,
                                 row.original?.[`cropCostId-${index}`],
                                 row.original?.[`cropTypeId-${index}`],
                                 'value',
                                 value,
                                 row.original,
                                 row.values?.[`value-${index}`],
                                 index,
                              )
                           }
                           value={row.values?.[`value-${index}`]}
                           onCanEdit={(event) => {
                              const field = fieldMetricsFieldSort?.[index];
                              let result;

                              if (field) {
                                 result = field.actualYield && field.acres > 0 && field.projectedAcp > 0;
                                 if (!(result > 0)) {
                                    setAnchorEl(event.currentTarget);
                                 }
                              }
                              return result;
                           }}
                           format={row.original?.format}
                           isNumber={row.original?.isNumber}
                           notes={row.original?.[`note-${index}`]}
                           onFocus={() => {
                              if (row?.original[`cost-${index}`]) {
                                 setShowEditNote(true);
                                 setEditNote(!!row.original?.[`note-${index}`]);
                                 cellSelectedRef.current = id;
                              } else {
                                 setShowEditNote(false);
                                 setEditNote(false);
                              }
                           }}
                           hasNote
                           cost={row?.original[`cost-${index}`]}
                           updateNote={updateNote}
                        />
                     );
                  } else {
                     return (
                        <Box
                           sx={{
                              height: '31px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                           }}
                        >
                           <TypographyFHG
                              color='text.primary'
                              style={{
                                 textAlign: 'right',
                              }}
                           >
                              {numberFormatter(
                                 row.original?.isNumber ? NUMBER_FULL_FORMAT : CURRENCY_FULL_FORMAT,
                                 row.values?.[`value-${index}`],
                              )}
                           </TypographyFHG>
                        </Box>
                     );
                  }
               },
               minWidth: 200,
               maxWidth: 200,
            };
         }) ?? [];
      return [
         {
            Header: () => null,
            accessor: 'name',
            Cell: ({row, updateMyData}) => {
               if (row.original?.isEditable) {
                  return (
                     <TextEdit
                        value={row.values?.name}
                        isNumber={false}
                        row={row}
                        alignLeft
                        onUpdate={(value) => {
                           updateMyData(row.original.cropCostTypeId, null, null, 'name', value, row.original);
                        }}
                        placeholder='Add an expense'
                        alwaysEdit={row.original?.last}
                     />
                  );
               }
               return (
                  <TypographyFHG
                     color='text.primary'
                     style={{
                        textAlign: 'end',
                     }}
                     className={classes.headerTextStyle}
                  >
                     {row.values?.name}
                  </TypographyFHG>
               );
            },
            minWidth: 180,
            maxWidth: 180,
         },
         ...cells,
         {
            Header: <TypographyFHG id={'total'} className={classes.headerBoldTextStyle} />,
            accessor: 'total',
            Cell: ({row}) => (
               <div
                  style={{
                     textAlign: 'right',
                  }}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.total)}
               </div>
            ),
            minWidth: 200,
            maxWidth: 200,
         },
      ];
   }, [classes.headerBoldTextStyle, classes.headerTextStyle, fieldMetricsFieldSort, updateNote]);

   const fieldMetricsCategoryDataField = useMemo(() => {
      const data = [];
      cropCostTypeTemplateList.forEach((field) => {
         const cropCosts = field?.cropCosts ?? [];
         const item = {name: field?.name};
         item.cropCostTypeId = field?.id;
         item.total = 0;
         item.format = CURRENCY_FULL_FORMAT;
         item.isEditable = hasEdit;
         item.isBold = false;
         item.isNumber = true;
         fieldMetricsFieldSort.forEach((fieldMetric, index) => {
            item[`cropTypeId-${index}`] = fieldMetric?.cropTypeId;
            item[`field-${index}`] = fieldMetric?.fieldId;
            const cropCost = cropCosts.find((cost) => cost.field?.id === fieldMetric.fieldId);
            if (cropCost) {
               item[`value-${index}`] = !acresData?.[`value-${index}`]
                  ? 0
                  : cropCost.costPerAcre * acresData?.[`value-${index}`];
               item.total += !acresData?.[`value-${index}`] ? 0 : cropCost.costPerAcre * acresData?.[`value-${index}`];
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
   }, [acresData, cropCostTypeTemplateList, fieldMetricsFieldSort, hasEdit]);

   const fieldMetricsCategoryDataPerAcre = useMemo(() => {
      const data = [];
      cropCostTypeTemplateList.forEach((field) => {
         const cropCosts = field?.cropCosts ?? [];
         const item = {name: field?.name};
         item.cropCostTypeId = field?.id;
         item.total = 0;
         item.format = CURRENCY_FULL_FORMAT;
         item.isEditable = hasEdit;
         item.isBold = false;
         item.isNumber = true;
         fieldMetricsFieldSort.forEach((fieldMetric, index) => {
            item[`cropTypeId-${index}`] = fieldMetric?.cropTypeId;
            item[`field-${index}`] = fieldMetric?.fieldId;
            const cropCost = cropCosts.find((cost) => cost?.field?.id === fieldMetric?.fieldId);
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
   }, [cropCostTypeTemplateList, fieldMetricsFieldSort, hasEdit]);

   const handleUpdate = async (id, type, value, rest) => {
      let cropTypeId;

      try {
         if (type === 'crop') {
            const found = find(cropTypes, {name: value});
            if (found) {
               cropTypeId = found.id;
            } else {
               const cropType = await createCrop({
                  variables: {
                     cropType: {
                        name: value,
                        clientId: clientId,
                     },
                  },
               });
               cropTypeId = cropType.data.cropType_Create.id;
            }
         } else {
            cropTypeId = rest?.cropTypeId;
         }
         if (rest.field) {
            if (rest.fieldId) {
               await updateField({
                  variables: {
                     field: {
                        entityId,
                        name: type !== 'crop' ? value : undefined,
                        cropTypeId: cropTypeId,
                     },
                     fieldId: rest.fieldId,
                  },
               });
            } else {
               await createField({
                  variables: {
                     field: {
                        entityId,
                        name: value,
                        cropTypeId: cropTypeId,
                        startDate: reportDate,
                     },
                  },
               });
            }
         } else {
            const variables = {
               fieldMetrics: {
                  entityId,
                  date: moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT),
                  [type]: +parseFloat(value).toFixed(2),
                  fieldId: rest.fieldId,
                  cropTypeId: cropTypeId,
               },
            };
            // The actualYield is used on some calculation and projectedYield in others. Until we handle projected
            // values we need to set both.
            if (type === 'actualYield') {
               variables.fieldMetrics.projectedYield = +parseFloat(value).toFixed(2);
            }
            await createFieldMetrics({
               variables,
               refetchQueries: () =>
                  getFieldMetricsCropRefetchQueries(
                     entities,
                     Number(moment(reportDate, MONTH_FORMAT).startOf('month').year()),
                  ),
            });
         }
         await refetch();
         await refetchField();
      } catch (error) {}
   };

   const handleUpdateCost = async (cropCostTypeId, cropCostId, cropTypeId, type, value, row, oldValue, index) => {
      try {
         if (oldValue === value) return;
         if (type === 'name') {
            const cropCostType = {
               entityId,
            };
            cropCostType.name = value;
            if (row.last) {
               await createCropCostType({
                  variables: {
                     cropCostType,
                  },
               });
            } else {
               cropCostType.id = cropCostTypeId;
               await createUpdateCropCostType({
                  variables: {
                     cropCostType,
                  },
               });
            }
         } else {
            const costValue = parseFloat(value);
            const cropCost = {
               entityId,
               cropTypeId,
               cropCostTypeId,
               costPerAcre: isPerAcre
                  ? costValue
                  : fieldMetricsFieldSort?.[index].acres
                    ? costValue / fieldMetricsFieldSort?.[index].acres
                    : 0,
               date: moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT),
            };
            cropCost.fieldId = row[`field-${index}`];
            delete cropCost.cropTypeId;
            if (cropCostId) {
               await updateCropCost({
                  variables: {
                     cropCostId,
                     cropCost,
                  },
               });
            } else {
               await createUpdateCropCost({
                  variables: {
                     cropCost,
                  },
               });
            }
         }
         await refetchCropTypeTemplate();
         await refetchField();
         await refetch();
      } catch (error) {
         console.log('error', error);
      }
   };

   const handleTableScroll = useCallback((event) => {
      const profitLossTableContainer = document.getElementsByName(PROFIT_LOSS + 'Container')?.[0];
      const totalRevenueTableContainer = document.getElementsByName(TOTAL_REVENUE + 'Container')?.[0];
      const categoriesTableContainer = document.getElementsByName(CATEGORIES + 'Container')?.[0];
      const totalExpenseTableContainer = document.getElementsByName(TOTAL_EXPENSE + 'Container')?.[0];
      const totalProfitLostTableContainer = document.getElementsByName(TOTAL_PROFIT_LOST + 'Container')?.[0];
      const breakevenYieldTableContainer = document.getElementsByName(BREAKEVEN_YIELD + 'Container')?.[0];
      const breakevenPriceTableContainer = document.getElementsByName(BREAKEVEN_PRICE + 'Container')?.[0];

      profitLossTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
      totalRevenueTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
      categoriesTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
      totalExpenseTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
      totalProfitLostTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
      breakevenYieldTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
      breakevenPriceTableContainer.scroll(event?.currentTarget.scrollLeft, 0);
   }, []);

   const setCellSelected = useSetRecoilState(selectedCellState);

   useEffect(() => {
      setCellSelected(null);
   }, [setCellSelected]);

   const handleAddNote = () => {
      setCellSelected(cellSelectedRef.current);
   };

   const handleDeleteCrop = async () => {
      const {item, index} = selectedForDelete;
      await deleteField({variables: {fieldId: item?.[`fieldId-${index}`], reportDate: moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT),}});
      await refetch();
      await refetchField();
   };
   const [editNote, setEditNote] = useState(false);
   const [showEditNote, setShowEditNote] = useState(false);
   let deleteName = selectedForDelete?.item[`fieldName-${selectedForDelete?.index}`]
      ? `${selectedForDelete?.item[`fieldName-${selectedForDelete?.index}`]} - ${selectedForDelete?.item[`cropName-${selectedForDelete?.index}`]}`
      : selectedForDelete?.item[`cropName-${selectedForDelete?.index}`];

   return (
      <Stack
         name='Field Metrics'
         width={'100%'}
         height={'100%'}
         direction={'column'}
         flexWrap={'nowrap'}
         display={'flex'}
         overflow={'hidden'}
      >
         <Popover
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            transformOrigin={{vertical: 'top', horizontal: 'center'}}
         >
            <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
               <TypographyFHG sx={{p: 2}} id={'fieldMetric.cannotEditField.message'} />
            </ClickAwayListener>
         </Popover>
         <Header idTitle='fieldMetrics.title'>
            <Box sx={{ml: 'auto !important'}}>{buttonPanel}</Box>
            <ExportChoiceButton selectedIndex={FIELD_METRICS_INDEX} />
         </Header>
         {!clientId || !entityId || entityId === 'undefined' ? (
            <Empty
               titleMessageKey={'empty.noInfo.message'}
               messageKey={
                  !clientId
                     ? !entityId || entityId === 'undefined'
                        ? 'empty.selectClientAndEntity.message'
                        : 'empty.selectClient.message'
                     : !entityId || entityId === 'undefined'
                       ? 'empty.selectEntity.message'
                       : undefined
               }
               sx={{mt: 4}}
            />
         ) : (
            <ScrollStack flexDirection={'column'} height={'100%'} overflow={'hidden auto'}>
               <Stack flexDirection={'column'} height={'fit-content'} width={'100%'}>
                  <CropSummary
                     showByField={showByField}
                     setShowByField={setShowByField}
                     cropsData={cropsData}
                     fieldData={fieldData}
                     scaleStyle={scaleStyle}
                     scale={scale}
                  />
               </Stack>

               <Stack
                  name={'profit and loss table outer'}
                  sx={{
                     '&.MuiStack-root': {
                        borderRadius: '10px',
                     },
                     my: 4,
                  }}
                  height={'100%'}
                  width={'100%'}
                  direction={'column'}
                  style={{height: `${100 / scale}%`}}
               >
                  <TableStickyContainerFrame
                     stickyTitle
                     style={{width: '100%', height: 'fit-content'}}
                     titleStyle={{
                        paddingLeft: '10px',
                        width: '100%',
                        left: '8px !important',
                     }}
                     headerStyle={{
                        borderRadius: BORDER_RADIUS_16,
                     }}
                     top={-1}
                     left={8}
                     titleHeader={
                        <Stack
                           sx={{
                              alignItems: 'center',
                              width: '100%',
                              justifyContent: {xs: 'flex-start', sm: 'flex-end'},
                              flexDirection: 'row',
                           }}
                           flexWrap={'wrap'}
                           gap={1}
                        >
                           <TypographyFHG
                              variant='h5'
                              id={'profit.and.loss'}
                              sx={{pl: 1, pr: 4, py: 2, flex: '0 0 auto', fontWeight: '600', color: 'text.primary'}}
                           />
                           <Stack
                              sx={{
                                 alignItems: 'center',
                                 width: '100%',
                                 justifyContent: {xs: 'flex-start', sm: 'flex-end'},
                                 flexDirection: 'row',
                              }}
                              flex={'1 1'}
                           >
                              <PermissionAllow permissionName={FIELD_METRICS_EDIT}>
                                 <ButtonLF
                                    sx={{ml: 0, mr: 2}}
                                    disabled={!showEditNote}
                                    startIcon={<img alt='' className={classes.imageStyle} src={NOTE_EDIT_IMG} />}
                                    labelKey={editNote ? 'cashFlow.editNote.label' : 'cashFlow.addNote.label'}
                                    onClick={handleAddNote}
                                 />
                                 <ConfirmButton
                                    className={`${classes.deleteButtonStyle} ${classes.dialogRoot}`}
                                    onConfirm={handleDeleteCrop}
                                    titleKey={'fieldMetrics.deleteCrop.label'}
                                    messageKey={'fieldMetrics.deleteCrop.message'}
                                    buttonLabelKey={'fieldMetrics.deleteCrop.label'}
                                    values={{name: deleteName}}
                                    color='primary'
                                    size='large'
                                    submitStyle={classes.deleteColorStyle}
                                    startIcon={<Delete />}
                                    buttonTypographyProps={{variant: 'inherit'}}
                                    disabled={!selectedForDelete}
                                 />
                              </PermissionAllow>
                           </Stack>
                           <FormControlLabel
                              key={'isPerAcre'}
                              sx={{mx: 0.5, bgcolor: 'background.background2'}}
                              style={{
                                 borderRadius: '8px',
                                 boxShadow: theme.palette.mode !== 'dark' && '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                 border: theme.palette.mode === 'dark' && `2px solid ${theme.palette.primary.stroke}`,
                                 paddingRight: '14px',
                                 paddingLeft: '2px',
                                 height: '38px',
                                 color: theme.palette.text.primary,
                                 minWidth: '150px',
                              }}
                              control={
                                 <Switch
                                    checked={isPerAcre}
                                    onChange={(e) => {
                                       setIsPerAcre(e.target.checked);
                                    }}
                                    name='isPerAcre'
                                    color='primary'
                                 />
                              }
                              label={formatMessage(intl, 'per.acre')}
                           />
                           <PermissionAllow permissionName={FIELD_METRICS_EDIT}>
                              <ButtonFHG
                                 variant='contained'
                                 color='primary'
                                 size='large'
                                 className={'button-title'}
                                 startIcon={<AddCircleOutlineOutlinedIcon />}
                                 labelKey={'crop.addField.button'}
                                 onClick={handleAddCrop}
                              />
                           </PermissionAllow>
                        </Stack>
                     }
                     isDisabledSpacer
                  >
                     <Stack
                        name={'profit and loss table'}
                        sx={{
                           '&.MuiStack-root': {
                              marginTop: '-15px',
                           },
                           p: 3,
                           backgroundColor: theme.palette.background.paper3,
                        }}
                        // flex={'1 1'}
                        height={'100%'}
                        width={'100%'}
                        direction={'column'}
                        style={{height: `${100 / scale}%`}}
                     >
                        <Stack
                           flexDirection={'column'}
                           width={'100%'}
                           bgcolor={'background.paper3'}
                           alignItems={'stretch'}
                        >
                           <TableNewUiFHG
                              name={PROFIT_LOSS}
                              className={'no-scrollbar'}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={fieldMetricsCropData}
                              columns={columns}
                              updateMyData={handleUpdate}
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                           />
                           {/* Total revenue */}
                           <Box height='10px' />
                           <TableNewUiFHG
                              name={TOTAL_REVENUE}
                              className={'no-scrollbar'}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={[fieldMetricsCropData[0]]}
                              columns={isPerAcre ? columnsTotalRevenuePerAcre : columnsTotalRevenue}
                              noHeader
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                           />
                           <Box height='10px' />
                           {/* Categories */}
                           <TableNewUiFHG
                              name={CATEGORIES}
                              key={isPerAcre ? 'perAcre' : 'total'}
                              className={'no-scrollbar'}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyleNoHeader,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={[
                                 ...(isPerAcre ? fieldMetricsCategoryDataPerAcre : fieldMetricsCategoryDataField),
                                 {isEditable: hasEdit, last: true},
                              ]}
                              columns={columnsCategory}
                              updateMyData={handleUpdateCost}
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                           />
                           {/* Total expense */}
                           <Box height='10px' />
                           <TableNewUiFHG
                              name={TOTAL_EXPENSE}
                              className={'no-scrollbar'}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={[fieldMetricsCropData[0]]}
                              columns={isPerAcre ? columnsTotalCostPerAcre : columnsTotalCost}
                              noHeader
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                           />
                           <Box height='10px' />
                           {/* Total profit.loss */}
                           <TableNewUiFHG
                              name={TOTAL_PROFIT_LOST}
                              className={'no-scrollbar'}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={[fieldMetricsCropData[0]]}
                              columns={columnsTotalPL}
                              noHeader
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                              sx={{position: 'sticky', bottom: 72, zIndex: 3}}
                           />
                           <Box height='10px' />
                           {/* column.breakeven.yield */}
                           <TableNewUiFHG
                              name={BREAKEVEN_YIELD}
                              className={'no-scrollbar'}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={[fieldMetricsCropData[0]]}
                              columns={columnsBreakevenYield}
                              noHeader
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                              sx={{position: 'sticky', bottom: 36, zIndex: 3}}
                           />
                           <Box height='10px' />
                           {/* breakeven.price */}
                           <TableNewUiFHG
                              name={BREAKEVEN_PRICE}
                              classes={{
                                 root: tableClasses.totalTableRoot,
                                 headerStyle: tableClasses.headerStyle,
                                 tableStyle: tableClasses.tableStyle,
                                 totalFooter: tableClasses.totalFooter,
                                 stickyFrame: tableClasses.stickyFrame,
                                 cellStyle: tableClasses.cellStyle2,
                              }}
                              data={[fieldMetricsCropData[0]]}
                              columns={columnsBreakevenPrice}
                              noHeader
                              onScroll={handleTableScroll}
                              stickyLeftColumn
                              isSortable={false}
                              sx={{position: 'sticky', bottom: 0, zIndex: 3}}
                           />
                           <Box height='10px' />
                        </Stack>
                     </Stack>
                  </TableStickyContainerFrame>
               </Stack>
            </ScrollStack>
         )}
         <Outlet />
      </Stack>
   );
}
