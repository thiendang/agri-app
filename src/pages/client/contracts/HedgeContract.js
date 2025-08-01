import moment from 'moment';
import {useEffect} from 'react';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../../components/TextFieldLF';
import {CONTRACT_EDIT_DRAWER_WIDTH, DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {getHedgeContractRefetchQueries} from '../../../data/QueriesGL';
import {HEDGE_CONTRACT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {HEDGE_CONTRACT_DELETE} from '../../../data/QueriesGL';
import {HEDGE_CONTRACT_CREATE_UPDATE} from '../../../data/QueriesGL';
import DatePickerFHG2 from '../../../fhg/components/DatePickerFHG2';
import useEditData from '../../../fhg/components/edit/useEditData';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {assign} from '../../../fhg/utils/DataUtil';
import ContractEdit from './ContractEdit';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import EditDrawer from '../../../components/EditDrawer';

/**
 * Component to edit hedges contracts.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function HedgeContract() {
   const [{entityId, reportDate}] = useCustomSearchParams();
   const location = useLocation();

   // reportDate
   const historyDate = useMemo(
      () => moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT),
      [reportDate],
   );
   const contractId = location?.state?.id;
   const isNew = !contractId;

   const [contractCreateUpdate] = useMutationFHG(HEDGE_CONTRACT_CREATE_UPDATE);
   const [contractDelete] = useMutationFHG(HEDGE_CONTRACT_DELETE);

   const editData = useEditData();
   const [, /*unused*/ handleChange, {resetValues, getValue, defaultValues, handleDateChange}] = editData;

   const [isDisabled, setIsDisabled] = useState(false);

   const [contractData] = useQueryFHG(
      HEDGE_CONTRACT_BY_ID_QUERY,
      {
         variables: {contractId, historyDate},
         skip: !contractId,
      },
      'contract.type',
      false,
   );
   const contract = contractData?.contract;

   // The new and cache item initial values.
   const cacheEditItem = useMemo(
      () => ({
         id: 0,
         bushels: 0,
         contractId: uuid(),
         contractNumber: '',
         crop: '',
         currentMarketValue: 0,
         date: moment(),
         description: '',
         entityId,
         historyDate,
         isDeleted: false,
         isHistorical: false,
         isRemoved: false,
         month: moment().month(),
         note: undefined,
         removedDate: undefined,
         snapshotDate: null,
         startDate: historyDate,
         strikeCost: 0,
         strikePrice: 0,
         year: moment().year(),
      }),
      [entityId, historyDate],
   );

   /**
    * Listen for a new hedges contract to reset to the new values.
    */
   useEffect(() => {
      if (isNew) {
         resetValues({...cacheEditItem});
      }
   }, [cacheEditItem, entityId, isNew, resetValues, historyDate]);

   /**
    * Listen for a change to the contract and reset the default values for that contract.
    */
   useEffect(() => {
      if (contract) {
         resetValues({
            ...contract,
            monthYear:
               contract?.month && contract?.year ? moment(`${contract?.month}-${contract?.year}`, 'MM-YYYY') : moment(),
            historyDate,
         });
      }
   }, [contract, historyDate, resetValues]);

   /**
    * Submit the hedges contract changes to the server.
    *
    * NOTE: The generic fields are handled by ContractEdit.
    *
    * @param variables The generic fields updated by ContractEdit.
    * @returns {Promise<void>}
    */
   const handleSubmit = async (variables) => {
      try {
         setIsDisabled(true);

         if (variables?.monthYear) {
            const momentDate = moment(variables?.monthYear, MONTH_FORMAT);
            variables.month = momentDate.month() + 1;
            variables.year = momentDate.year();
         } else if (isNew) {
            // month is zero based.
            variables.month = moment().month() + 1;
            variables.year = moment().year();
         }

         // Create the hedges contract for the cache.
         const contract = assign(
            {id: defaultValues?.id, __typename: 'HedgesContract'},
            variables,
            defaultValues,
            cacheEditItem,
         );

         await contractCreateUpdate({
            variables,
            optimisticResponse: {__typename: 'Mutation', hedgeContract: contract},
            update: cacheUpdate(getHedgeContractRefetchQueries(entityId, historyDate), contract?.id, 'hedgeContract'),
         });
      } catch (e) {
         console.log(e);
         setIsDisabled(false);
      }
   };

   /**
    * Delete the hedges contract.
    * @returns {Promise<void>}
    */
   const handleDelete = async () => {
      try {
         setIsDisabled(true);

         await contractDelete({
            variables: {contractId},
            optimisticResponse: {hedgesContract_Delete: 1},
            update: cacheDelete(getHedgeContractRefetchQueries(entityId, historyDate), contract?.id),
         });
      } catch (e) {
         console.log(e);
      } finally {
         setIsDisabled(false);
      }
   };

   return (
      <EditDrawer open={true} width={CONTRACT_EDIT_DRAWER_WIDTH}>
         <ContractEdit
            titleId={'contract.hedge.label'}
            editData={editData}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
         >
            <ProgressIndicator isGlobal={false} />
            <TextFieldLF
               name={'crop'}
               labelTemplate={'contract.crop.label'}
               onChange={handleChange}
               value={getValue('crop')}
               disabled={isDisabled}
               autoFocus
               required
            />
            <TextFieldLF
               name={'bushels'}
               isFormattedNumber
               labelTemplate={'contract.bushels.label'}
               onChange={handleChange}
               value={getValue('bushels')}
               disabled={isDisabled}
               required
            />
            <TextFieldLF
               name={'strikePrice'}
               isFormattedNumber
               labelTemplate={'contract.{name}.label'}
               onChange={handleChange}
               getValue={getValue}
               inputProps={{prefix: '$'}}
               disabled={isDisabled}
               required
            />
            <TextFieldLF
               name={'strikeCost'}
               isFormattedNumber
               labelTemplate={'contract.{name}.label'}
               onChange={handleChange}
               getValue={getValue}
               inputProps={{prefix: '$'}}
               disabled={isDisabled}
               required
            />
            <DatePickerFHG2
               key={'monthYear' + defaultValues.id}
               name={'monthYear'}
               openTo='month'
               views={['year', 'month']}
               format={MONTH_FORMAT}
               labelKey={'contract.monthYear.label'}
               value={getValue('monthYear')}
               onChange={handleDateChange}
               disabled={isDisabled}
               required
            />
            <TextFieldLF
               name={'currentMarketValue'}
               isFormattedNumber
               labelTemplate={'contract.{name}.label'}
               onChange={handleChange}
               getValue={getValue}
               inputProps={{prefix: '$'}}
               disabled={isDisabled}
               required
            />
            <TextFieldLF
               name={'contractNumber'}
               inputProps={{type: 'number'}}
               labelTemplate={'contract.contractNumber.label'}
               onChange={handleChange}
               value={getValue('contractNumber')}
               disabled={isDisabled}
               required
            />
         </ContractEdit>
      </EditDrawer>
   );
}
