import React, {Fragment} from 'react';
import {View, StyleSheet} from '@react-pdf/renderer';
import Table from './Table';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableDataCell from './TableDataCell';
import TableFooter from './TableFooter';
import TableFooterCell from './TableFooterCell';
import TableHeader from './TableHeader';
import {registerInterFont} from '../../../utils/helpers';

registerInterFont();

const styles = StyleSheet.create({
   root: {
      fontFamily: 'Inter',
      fontSize: 9,
      flexDirection: 'row',
      display: 'flex',
   },
   headerCellStyle: {
      color: '#707070',
      opacity: 1,
      fontFamily: 'Inter',
      fontSize: 11,
      padding: '2 2',
      borderColor: '#e0e0e0',
   },
   footerCellStyle: {
      fontFamily: 'Inter',
      borderRightColor: '#e0e0e0',
      fontSize: 11,
      padding: '2 2',
      color: '#6b9241',
   },
   tableRowStyle: {
      '&:nth-of-type(odd)': {
         backgroundColor: '#f0f0f0',
      },
      borderLeftColor: '#e0e0e0',
      borderRightColor: '#e0e0e0',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
   },
   tableHeaderStyle: {
      minHeight: 20,
      color: '#707070',
   },
   tableFooterStyle: {
      tableRowStyle: {
         '&:nth-of-type(odd)': {
            backgroundColor: '#f0f0f0',
         },
         borderLeftWidth: 1,
         borderLeftColor: '#e0e0e0',
         borderRightWidth: 1,
         borderRightColor: '#e0e0e0',
         borderBottomWidth: 1,
         borderBottomColor: '#e0e0e0',
      },
      // paddingLeft: 4,
      // minHeight: 20,
      // color: '#707070',
   },
   cellStyle2: {
      fontFamily: 'Inter',
      borderRightColor: '#e0e0e0',
      fontSize: 9,
      padding: '2 2',
      color: '#000000',
   },
});

export default function TableToPdf({
   columns = [],
   data = [{}],
   hasFooter = false,
   tableStyle,
   headerBottomBorder = false,
   headerRightBorder = false,
   headerLeftBorder = false,
   headerTopBorder = false,
   hasFooter2 = false,
   hasFooter3 = false,
   extraFooter = 0,
   footerExtraIndexBold = [],
}) {
   return (
      <View style={[styles.root, tableStyle?.root]}>
         <Table>
            <TableHeader
               style={tableStyle?.tableHeaderStyle || styles.tableHeaderStyle}
               textAlign={'center'}
               hasLeftBorder={headerLeftBorder}
               hasBottomBorder={headerBottomBorder}
               hasRightBorder={headerRightBorder}
               hasTopBorder={headerTopBorder}
               fixed
               border={'1pt solid #e0e0e0'}
            >
               {columns.map((column, index) => (
                  <TableCell
                     key={'tableCell' + index}
                     weighting={column.weighting}
                     width={column.width}
                     textAlignment={'center'}
                     style={
                        {...tableStyle?.headerCellStyle, ...(index === columns.length - 1 ? {marginRight: 0} : {})} ||
                        column.headerStyle ||
                        styles.headerCellStyle
                     }
                  >
                     {column.Header}
                  </TableCell>
               ))}
            </TableHeader>
            <TableBody
               style={tableStyle?.tableRowStyle || styles.tableRowStyle}
               data={data}
               striped
               hasLeftBorder={false}
               hasBottomBorder={false}
               hasRightBorder={false}
               hasTopBorder={false}
            >
               {columns.map((column, index) => (
                  <TableDataCell
                     key={'dataCell' + index}
                     style={
                        column.style || {
                           ...tableStyle?.cellStyle2,
                           ...(index === columns.length - 1 ? {marginRight: 0} : {}),
                        } ||
                        styles.cellStyle2
                     }
                     column={column}
                  />
               ))}
            </TableBody>
            {hasFooter && (
               <Fragment>
                  <TableFooter
                     style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                     hasLeftBorder={false}
                     hasBottomBorder={false}
                     hasRightBorder={false}
                     hasTopBorder={false}
                  >
                     {columns.map((column, index) => (
                        <TableFooterCell
                           key={'tableCellFooter' + index}
                           dataProp={data}
                           style={column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle}
                           column={column}
                        />
                     ))}
                  </TableFooter>
                  {extraFooter > 0 &&
                     Array.from({length: extraFooter}).map((item, index) => {
                        return (
                           <TableFooter
                              style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                              hasLeftBorder={false}
                              hasBottomBorder={false}
                              hasRightBorder={false}
                              hasTopBorder={false}
                           >
                              {columns.map((column, idx) => (
                                 <TableFooterCell
                                    key={'tableCellFooter' + idx}
                                    data={data}
                                    field={`Footer${index + 2}`}
                                    style={
                                       !footerExtraIndexBold.includes(index)
                                          ? tableStyle?.cellStyle2
                                          : column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle
                                    }
                                    column={column}
                                 />
                              ))}
                           </TableFooter>
                        );
                     })}
                  {hasFooter2 && (
                     <Fragment>
                        <TableFooter
                           style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                           hasLeftBorder={false}
                           hasBottomBorder={false}
                           hasRightBorder={false}
                           hasTopBorder={false}
                        >
                           {columns.map((column, index) => (
                              <TableFooterCell
                                 key={'tableCellFooter' + index}
                                 data={data}
                                 field={'Footer2'}
                                 style={column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle}
                                 column={column}
                              />
                           ))}
                        </TableFooter>
                        {hasFooter3 && (
                           <TableFooter
                              style={tableStyle?.tableFooterStyle || styles.tableFooterStyle}
                              hasLeftBorder={false}
                              hasBottomBorder={false}
                              hasRightBorder={false}
                              hasTopBorder={false}
                           >
                              {columns.map((column, index) => (
                                 <TableFooterCell
                                    key={'tableCellFooter' + index}
                                    field={'Footer3'}
                                    style={column?.footerStyle || tableStyle?.footerCellStyle || styles.footerCellStyle}
                                    column={column}
                                 />
                              ))}
                           </TableFooter>
                        )}
                     </Fragment>
                  )}
               </Fragment>
            )}
         </Table>
      </View>
   );
}
