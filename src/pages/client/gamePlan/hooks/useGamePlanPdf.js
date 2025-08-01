import {useCallback} from 'react';
import {GamePlanPdf} from '../GamePlanPdf';
import {
   CLIENT_BY_ID_QUERY,
   CORE_VALUE_GET,
   ENTITY_BY_ID_QUERY,
   GOAL_GET,
   TARGET_GROUP_GET,
} from '../../../../data/QueriesGL';
import useLazyQueryFHG from '../../../../fhg/hooks/data/useLazyQueryFHG';
import {sortBy} from 'lodash';

export const useGamePlanPdf = (intl, entityId, clientId, historyDate) => {
   const [getDataCoreValues] = useLazyQueryFHG(CORE_VALUE_GET, {fetchPolicy: 'no-cache'});
   const [getDataGoals] = useLazyQueryFHG(GOAL_GET, {fetchPolicy: 'no-cache'});
   const [getDataRocks] = useLazyQueryFHG(TARGET_GROUP_GET, {fetchPolicy: 'no-cache'});
   const [getEntityData] = useLazyQueryFHG(ENTITY_BY_ID_QUERY, {fetchPolicy: 'no-cache'});
   const [getDataClient] = useLazyQueryFHG(CLIENT_BY_ID_QUERY, {fetchPolicy: 'no-cache'});

   return useCallback(
      async (entityNames) => {
         const dataClient = await getDataClient({variables: {clientId}});
         const entityData = await getEntityData({variables: {entityId}});
         const dataCoreValues = await getDataCoreValues({variables: {coreValueSearch: {entityId}}});
         const dataGoals = await getDataGoals({variables: {goalSearch: {entityId}}});
         const dataRocks = await getDataRocks({variables: {targetGroupSearch: {entityId}}});
         const clientData = dataClient?.data?.client ?? {};
         const {ourWhyText, whoWeServe} = entityData?.data?.entity ?? {};

         const coreValues = sortBy([...(dataCoreValues?.data?.coreValue_AllWhere || [])], 'orderIndex');

         return (
            <GamePlanPdf
               entityNames={entityNames}
               intl={intl}
               coreValues={coreValues}
               ourWhyText={ourWhyText}
               whoWeServe={whoWeServe}
               goals={dataGoals?.data?.goal_AllWhere || []}
               rocks={dataRocks?.data?.targetGroup_AllWhere || []}
               clientData={clientData}
               entityData={entityData?.data?.entity ?? {}}
               reportDate={historyDate}
            />
         );
      },
      [
         clientId,
         entityId,
         getDataClient,
         getDataCoreValues,
         getDataGoals,
         getDataRocks,
         getEntityData,
         intl,
         historyDate,
      ]
   );
};
