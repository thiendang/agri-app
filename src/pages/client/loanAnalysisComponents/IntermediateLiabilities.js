import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';

import TypographyFHG from '../../../fhg/components/Typography';
import LoanAnalysisTable from './LoanAnalysisTable';

export default function IntermediateLiabilities({classes, data, onRowSelect, ...props}) {
   /**
    * Create the liability columns for the table.
    */
   const columns = useMemo(() => {
      return [
         {
            Header: <TypographyFHG id={'loan.intermediate.column'} />,
            accessor: 'categoryName',
            Footer: (
               <TypographyFHG
                  className={classes.footerStyle}
                  style={{fontWeight: 'bold'}}
                  color={'primary'}
                  id={'loan.intermediateLiabilities.label'}
               />
            ),
            Cell: ({row}) => <div style={{width: '200px'}}>{row.values?.categoryName}</div>,
         },
         {
            Header: <TypographyFHG id={'loan.balance.column'} />,
            accessor: 'currentBalance',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.currentBalance)}
               </div>
            ),
            Footer: (
               <div className={classes.footerStyle} style={{textAlign: 'right', fontWeight: 'bold'}}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, data?.subtotalLiabilities || 0)}
               </div>
            ),
         },
      ];
   }, [data, classes.footerStyle]);

   return (
      <LoanAnalysisTable
         name={'Intermediate Liabilities'}
         classes={classes}
         data={data?.categories}
         columns={columns}
         onSelect={onRowSelect}
         {...props}
      />
   );
}
