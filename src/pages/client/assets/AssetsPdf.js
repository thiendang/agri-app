// noinspection ES6CheckImport
import {Document} from '@react-pdf/renderer';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {formatMessage} from '../../../fhg/utils/Utils';
import AssetsPdfTable from './AssetsPdfTable';
import {registerInterFont} from '../../../utils/helpers';

registerInterFont();

/**
 * Asset List component to display  all the current user Assets.
 *
 * Reviewed:
 */
export default function AssetsPdf({
   intl,
   assets = [],
   totalCurrent = 0,
   totalIntermediate = 0,
   totalLong = 0,
   entityName = '',
}) {
   // Create the columns for the asset table in the PDF file.
   const columns = useMemo(() => {
      return [
         {
            id: 'name',
            Header: formatMessage(intl, 'assets.category.column'),
            weighting: 130,
            accessor: 'assetCategory.name',
         },
         {
            id: 'description',
            Header: formatMessage(intl, 'assets.description.column'),
            accessor: 'description',
            weighting: 150,
         },
         {
            id: 'details',
            Header: formatMessage(intl, 'assets.details.column'),
            accessor: 'details',
            weighting: 150,
         },
         {
            id: 'collateralString',
            Header: formatMessage(intl, 'asset.collateral.column'),
            accessor: 'collateralString',
            weighting: 45,
         },
         {
            id: 'amount',
            Header: formatMessage(intl, 'assets.amount.column'),
            accessor: 'amount',
            weighting: 60,
            align: 'right',
            format: (value) => numberFormatter(CURRENCY_FULL_FORMAT, value),
         },
      ];
   }, [intl]);

   // If everything needed is loaded create the document.
   if (assets?.length > 0 && columns?.length > 0) {
      return (
         <Document title={`${entityName}-Assets_${moment().format(DATE_DB_FORMAT)}`}>
            <AssetsPdfTable
               assets={assets}
               columns={columns}
               totalCurrent={totalCurrent}
               totalIntermediate={totalIntermediate}
               totalLong={totalLong}
               entityName={entityName}
            />
         </Document>
      );
   } else {
      return null;
   }
}
