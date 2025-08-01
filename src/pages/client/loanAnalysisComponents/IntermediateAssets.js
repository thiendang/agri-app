import {useTheme} from '@mui/material/styles';
import numberFormatter from 'number-formatter';
import React, {useMemo} from 'react';
import {PERCENT_SHORT_FORMAT} from '../../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../../Constants';

import TypographyFHG from '../../../fhg/components/Typography';
import LoanAnalysisTable from './LoanAnalysisTable';
import {Box} from '@mui/material';
import InfoPopup from '../../../fhg/components/InfoPopup';
import {getOS} from '../../../fhg/utils/Utils';

export default function IntermediateAssets({classes, data, onRowSelect, ...props}) {
   const theme = useTheme();
   const os = getOS();
   const isMobile = os === 'iOS' || os === 'Android';
   /**
    * Create the asset columns for the table.
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
                  id={'loan.intermediateLoanValue.column'}
               />
            ),
            Cell: ({row}) => <div style={{width: '200px'}}>{row.values?.categoryName}</div>,
         },
         {
            Header: isMobile ? (
               <Box display={'flex'} alignItems={'center'} className={classes.help}>
                  <TypographyFHG id={'loan.marketValue.mobile.column'} />
                  <InfoPopup labelKey='loan.marketValue.column' />
               </Box>
            ) : (
               <TypographyFHG id={'loan.marketValue.column'} />
            ),
            accessor: 'marketValue',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>{numberFormatter(CURRENCY_FULL_FORMAT, row.values?.marketValue)}</div>
            ),
            Footer: (
               <div
                  className={classes.footerStyle}
                  style={{
                     textAlign: 'right',
                     fontWeight: 'bold',
                     color: (data?.marketValue || 0) >= 0 ? undefined : theme.palette.error.main,
                  }}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, data?.marketValue || 0)}
               </div>
            ),
         },
         {
            Header: isMobile ? (
               <Box display={'flex'} alignItems={'center'} className={classes.help}>
                  <TypographyFHG id={'loan.loanToValue.mobile.column'} />
                  <InfoPopup labelKey='loan.loanToValue.column' />
               </Box>
            ) : (
               <TypographyFHG id={'loan.loanToValue.column'} />
            ),
            accessor: 'loanToValue',
            Cell: ({row}) => <div style={{textAlign: 'right'}}>{numberFormatter('#0#%', row.values?.loanToValue)}</div>,
            Footer: (
               <div
                  className={classes.footerStyle}
                  style={{
                     textAlign: 'right',
                     fontWeight: 'bold',
                     color: (data?.loanToValue || 0) >= 0 ? undefined : theme.palette.error.main,
                  }}
               >
                  {numberFormatter(PERCENT_SHORT_FORMAT, data?.loanToValue || 0)}
               </div>
            ),
         },
         {
            Header: isMobile ? (
               <Box display={'flex'} alignItems={'center'} className={classes.help}>
                  <TypographyFHG id={'loan.bankLoanValue.mobile.column'} />
                  <InfoPopup labelKey='loan.bankLoanValue.column' />
               </Box>
            ) : (
               <TypographyFHG id={'loan.bankLoanValue.column'} />
            ),
            accessor: 'bankLoanValue',
            Cell: ({row}) => (
               <div style={{textAlign: 'right'}}>
                  {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.bankLoanValue)}
               </div>
            ),
            Footer: (
               <div
                  className={classes.footerStyle}
                  style={{
                     textAlign: 'right',
                     fontWeight: 'bold',
                     color: (data?.bankLoanValue || 0) >= 0 ? undefined : theme.palette.error.main,
                  }}
               >
                  {numberFormatter(CURRENCY_FULL_FORMAT, data?.bankLoanValue || 0)}
               </div>
            ),
         },
      ];
   }, [data, classes.footerStyle, theme.palette.error.main]);

   return (
      <LoanAnalysisTable
         name={'Intermediate Assets'}
         classes={classes}
         data={data?.categories}
         columns={columns}
         onSelect={onRowSelect}
         {...props}
      />
   );
}
