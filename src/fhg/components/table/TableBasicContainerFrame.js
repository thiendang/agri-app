import React from 'react';
import TableBasic from './TableBasic';
import './TableBasicContainerFrame.css';
import TableContainerFrame from './TableContainerFrame';

export default function TableBasicContainerFrame({title, titleKey, stickyTitle = false, ...props}) {
   return (
      <TableContainerFrame title={title} titleKey={titleKey} stickyTitle={stickyTitle}>
         <TableBasic {...props} />
      </TableContainerFrame>
   );
}
