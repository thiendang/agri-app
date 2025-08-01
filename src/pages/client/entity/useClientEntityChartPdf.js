import {StyleSheet} from '@react-pdf/renderer';
import {Page} from '@react-pdf/renderer';

// noinspection ES6CheckImport
import {useCallback} from 'react';
import React from 'react';
import Footer from '../../../components/pdf/Footer';
import {ENTITY_CLIENT_QUERY, USER_CLIENT_QUERY} from '../../../data/QueriesGL';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';
import useGetPageSize from './useGetPageSize';
import useGetRoot from './useGetRoot';
import {HeaderPdf} from '../../../fhg/components/pdf/Header';
import {registerInterFont} from '../../../utils/helpers';
import ClientEntityTreePdfContent from './ClientEntityTreePdfContent';

registerInterFont();

const styles = StyleSheet.create({
   generalInformation1: {
      fontFamily: 'Inter',
      paddingLeft: 20,
      paddingTop: 20,
      paddingBottom: 50,
      paddingRight: 20,
      fontSize: 11,
      flexDirection: 'column',
      display: 'flex',
      backgroundColor: '#FAFAFA',
      width: '100%',
   },
});

/**
 * Hook to return the pages for the Accountability Chart PDF document. All the data is queried.
 *
 * Reviewed:
 */
export default function useClientEntityChartPdf(intl, orientation = 'landscape', clientId, entityId, date, itemsKey) {
   const [entitiesQuery] = useLazyQueryFHG(ENTITY_CLIENT_QUERY, undefined, 'entities.type');
   const [userQuery] = useLazyQueryFHG(USER_CLIENT_QUERY, undefined, 'user.type');

   const getRoot = useGetRoot();
   const getPageSizes = useGetPageSize();

   return useCallback(
      async (entityNames = '') => {
         const entityData = await entitiesQuery({variables: {clientId}});
         const users = await userQuery({variables: {clientId, includeNonCognito: true}});
         const roots = getRoot(entityId, entityData?.data?.entities);
         const pageSizes = getPageSizes(roots, itemsKey);

         return (
            <>
               {roots?.map((root, index) => (
                  <Page
                     key={'ClientEntityTreePdf' + index}
                     size={pageSizes[index]}
                     orientation={orientation}
                     style={styles.generalInformation1}
                     wrap={false}
                  >
                     <HeaderPdf entityNames={entityNames} reportDate={date} title='Business Structure' />
                     <Footer />
                     <ClientEntityTreePdfContent
                        root={root}
                        labelKey={'name'}
                        itemsKey={itemsKey}
                        users={users?.data?.users}
                     />
                  </Page>
               ))}
            </>
         );
      },
      [clientId, date, entityId, getPageSizes, getRoot, itemsKey, orientation, entitiesQuery, userQuery],
   );
}
