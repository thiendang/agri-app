import {Stack} from '@mui/material';
import * as PropTypes from 'prop-types';
import React from 'react';
import TableNewUiFHG from '../../../fhg/components/table/TableNewUiFHG';

export default function LoanAnalysisTable({name, classes, data, columns, onSelect, ...props}) {
   const tableData = data || [{}];
   return (
      <Stack name={name + ' table'} {...props}>
         <TableNewUiFHG
            name={'Borrowing Power ' + name}
            data={tableData}
            columns={columns}
            classes={{
               root: classes.root,
               tableHeadRoot: classes.tableHeadRoot,
               tableHeadStyle: classes.tableHeadStyle,
               headerStyle: classes.headerStyle,
            }}
            stickyHeader={false}
            totalPath={undefined}
            stickyExternal={false}
            onSelect={onSelect}
            hasBorder={false}
         />
      </Stack>
   );
}

LoanAnalysisTable.propTypes = {
   className: PropTypes.any,
   data: PropTypes.any,
   columns: PropTypes.any,
   root: PropTypes.any,
   tableHeadStyle: PropTypes.any,
   headerStyle: PropTypes.any,
   onSelect: PropTypes.any,
};
