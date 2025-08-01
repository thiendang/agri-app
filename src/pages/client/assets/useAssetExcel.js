// noinspection ES6CheckImport
import {map} from 'lodash';
import filter from 'lodash/filter';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';
import {useCallback} from 'react';
import {DATE_DB_FORMAT} from '../../../Constants';
import {ASSETS_ENTITY_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import {getAssetDetails} from './AsssetUtil';
import useAssetsExcelExport from './useAssetsExcelExport';

/**
 * Asset export to Excel hook to export all the current user Assets.
 *
 * Reviewed:
 */
export default function useAssetExcel(orientation, entityId, historyDate) {
   const exportToExcel = useAssetsExcelExport('Assets', orientation);
   const [assetsQuery] = useLazyQueryFHG(ASSETS_ENTITY_QUERY);
   return useCallback(
      async (workbook, entityName = '', assetProps) => {
         const reportDate = moment(historyDate).format(DATE_DB_FORMAT);
         async function getAssets() {
            const assetData = assetProps || (await assetsQuery({variables: {entityId, historyDate: reportDate}}));
            const useAssets = filter(assetData?.data?.assets || [], {isRemoved: false});

            const tableAssets = map(useAssets, (asset) => ({
               ...asset,
               collateralString: asset.isCollateral ? 'Yes' : 'No',
               details: getAssetDetails(asset),
            }));
            return sortBy(tableAssets, ['assetCategory.name']);
         }

         const assets = await getAssets();
         const assetGroups = groupBy(assets, 'assetCategory.term');
         const totalCurrent = assetGroups?.current
            ? sumBy(filter(assetGroups?.current, {isRemoved: false}), 'amount')
            : 0;
         const totalIntermediate = assetGroups?.intermediate
            ? sumBy(filter(assetGroups?.intermediate, {isRemoved: false}), 'amount')
            : 0;
         const totalLong = assetGroups?.long ? sumBy(filter(assetGroups?.long, {isRemoved: false}), 'amount') : 0;

         if (assets?.length > 0) {
            return exportToExcel(workbook, assets, totalCurrent, totalIntermediate, totalLong, entityName, reportDate);
         }
      },
      [assetsQuery, entityId, exportToExcel, historyDate]
   );
}
