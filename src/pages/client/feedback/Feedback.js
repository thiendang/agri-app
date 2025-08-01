import React, {useMemo} from 'react';
import Header from '../../../components/Header';
import TypographyFHG from '../../../fhg/components/Typography';
import {Stack} from '@mui/material';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {FEEDBACK_ALL_QUERY} from '../../../data/QueriesGL';
import TableNewUiFHG from '../../../fhg/components/table/TableNewUiFHG';
import moment from 'moment';
import {DATE_TIME_FORMAT} from '../../../Constants';
import TypographyWithHover from '../../../fhg/components/table/TypographyWithHover';

export const Feedback = () => {
   const [data] = useQueryFHG(FEEDBACK_ALL_QUERY, {
      variables: {
         limit: null,
         offset: null,
         includeDeleted: false,
      },
   });

   const columns = useMemo(() => {
      let columnIndex = 0;

      return [
         {
            Header: <TypographyFHG id={'feedback.subject'} />,
            index: columnIndex++,
            accessor: 'subject',
            Cell: (row) => {
               return (
                  <TypographyWithHover
                     style={{
                        cursor: 'pointer',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                     }}
                  >
                     {row.value}
                  </TypographyWithHover>
               );
            },
         },
         {
            Header: <TypographyFHG id={'feedback.text'} />,
            index: columnIndex++,
            accessor: 'text',
            Cell: (row) => {
               return (
                  <TypographyWithHover
                     style={{
                        cursor: 'pointer',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                     }}
                  >
                     {row.value}
                  </TypographyWithHover>
               );
            },
         },
         {
            Header: <TypographyFHG id={'feedback.createdby'} />,
            index: columnIndex++,
            accessor: 'createdByUser.username',
         },
         {
            Header: <TypographyFHG id={'feedback.time'} />,
            index: columnIndex++,
            accessor: 'createdDateTime',
            Cell: (row) => {
               return moment(row.value).format(DATE_TIME_FORMAT);
            },
         },
      ];
   }, []);

   return (
      <Stack flexDirection={'column'} overflow='hidden' width={'100%'} height={'100%'} mb={2}>
         <Header idTitle='feedback.title' />

         <TableNewUiFHG
            columns={columns}
            data={data?.feedback_All || [{}]}
            stickyExternal={false}
            sx={{
               mt: 1,
               pt: '16px !important',
               height: 'calc(100% - 42px)',
               '& .MuiTableContainer-root': {borderRadius: 1.85},
            }}
         />
      </Stack>
   );
};
