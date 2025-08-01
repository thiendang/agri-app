import moment from 'moment';
import {useEffect} from 'react';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {v4 as uuid} from 'uuid';
import EditDrawer from '../../../components/EditDrawer';
import TextFieldLF from '../../../components/TextFieldLF';
import {CONTRACT_EDIT_DRAWER_WIDTH} from '../../../Constants';
import {DATE_DB_FORMAT} from '../../../Constants';
import {MONTH_FORMAT} from '../../../Constants';
import {CASH_CONTRACT_CREATE_UPDATE} from '../../../data/QueriesGL';
import {CASH_CONTRACT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {CASH_CONTRACT_DELETE} from '../../../data/QueriesGL';
import {getCashContractRefetchQueries} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import useEditData from '../../../fhg/components/edit/useEditData';
import MonthPicker from '../../../fhg/components/MonthPicker';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {pollState} from '../../../fhg/hooks/useSubscriptionPath';
import {cacheUpdate} from '../../../fhg/utils/DataUtil';
import {cacheDelete} from '../../../fhg/utils/DataUtil';
import {assign} from '../../../fhg/utils/DataUtil';
import ContractEdit from './ContractEdit';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';

/**
 * Component to edit cash contracts.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function CashContract() {
   const [{entityId, reportDate}] = useCustomSearchParams();
   const pollInterval = useRecoilValue(pollState);

   const location = useLocation();
   const historyDate = useMemo(
      () => moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT),
      [reportDate],
   );

   const contractId = location?.state?.id;
   const isNew = !contractId;

   const [contractCreateUpdate] = useMutationFHG(CASH_CONTRACT_CREATE_UPDATE);
   const [contractDelete] = useMutationFHG(CASH_CONTRACT_DELETE);

   const editData = useEditData(undefined, ['contractId']);
   const [editValues, handleChange, {resetValues, getValue, defaultValues, handleDateChange}] = editData;

   const [isDisabled, setIsDisabled] = useState(false);

   const [contractData] = useQueryFHG(
      CASH_CONTRACT_BY_ID_QUERY,
      {
         variables: {contractId, historyDate},
         skip: !contractId,
         pollInterval,
      },
      'contract.type',
      false,
   );
   const contract = contractData?.contract;

   // A new cashContract or defaults for updating the cache for fields not entered.
   const cacheEditItem = useMemo(
      () => ({
         id: 0,
         contractId: uuid(),
         bushelsSold: 0,
         contractNumber: '',
         crop: '',
         date: moment(),
         deliveryLocation: '',
         deliveryMonth: moment(),
         description: '',
         entityId,
         historyDate,
         isDeleted: false,
         isDelivered: false,
         isHistorical: false,
         isNew: false,
         isRemoved: false,
         price: 0,
         removedDate: undefined,
         snapshotDate: null,
         startDate: historyDate,
      }),
      [entityId, historyDate],
   );

   /**
    * Listen for a new cash contract to reset to the new values.
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
            deliveryMonth: moment(contract?.deliveryMonth, 'M'),
            historyDate,
         });
      }
   }, [contract, historyDate, resetValues]);

   /**
    * Submit the cash contract changes to the server.
    *
    * NOTE: The generic fields are handled by ContractEdit.
    *
    * @param variables The generic fields updated by ContractEdit.
    * @returns {Promise<void>}
    */
   const handleSubmit = async (variables) => {
      try {
         setIsDisabled(true);

         if (variables?.deliveryMonth) {
            variables.deliveryMonth = +moment(variables?.deliveryMonth, 'MMMM').format('M');
         } else if (isNew) {
            variables.deliveryMonth = +moment().format('M');
         }

         // Create the cash contract for the cache.
         const contract = assign(
            {id: defaultValues?.id, __typename: 'CashContract'},
            variables,
            defaultValues,
            cacheEditItem,
         );

         await contractCreateUpdate({
            variables,
            optimisticResponse: {__typename: 'Mutation', cashContract: contract},
            update: cacheUpdate(getCashContractRefetchQueries(entityId, historyDate), contract?.id, 'cashContract'),
         });
      } catch (e) {
         console.log(e);
         setIsDisabled(false);
      }
   };

   /**
    * Delete the cash contract.
    * @returns {Promise<void>}
    */
   const handleDelete = async () => {
      try {
         setIsDisabled(true);

         await contractDelete({
            variables: {contractId},
            optimisticResponse: {cashContract_Delete: 1},
            update: cacheDelete(getCashContractRefetchQueries(entityId, historyDate), contract?.id),
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
            titleId={'contract.cash.label'}
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
            <CheckboxFHG
               name={'isNew'}
               onChange={handleChange}
               color={'default'}
               labelKey={'contract.isNew.label'}
               value={'isNew'}
               defaultChecked={defaultValues.isNew}
               checked={editValues.isNew}
               disabled={isDisabled}
               marginTop={0}
               fullWidth
            />
            <TextFieldLF
               name={'bushelsSold'}
               isFormattedNumber
               labelTemplate={'contract.bushelsSold.label'}
               onChange={handleChange}
               value={getValue('bushelsSold')}
               disabled={isDisabled}
               required
            />
            <TextFieldLF
               name={'price'}
               isFormattedNumber
               labelTemplate={'contract.price.label'}
               onChange={handleChange}
               value={getValue('price')}
               inputProps={{prefix: '$'}}
               disabled={isDisabled}
               required
            />
            <MonthPicker
               key={'deliveryMonth' + defaultValues.id}
               name={'deliveryMonth'}
               format={'MMMM'}
               labelKey={'contract.deliveryMonth.label'}
               defaultValue={defaultValues.deliveryMonth}
               value={editValues.deliveryMonth}
               onChange={handleDateChange}
               disabled={isDisabled}
               required
            />
            <TextFieldLF
               name={'deliveryLocation'}
               labelTemplate={'contract.deliveryLocation.label'}
               onChange={handleChange}
               value={getValue('deliveryLocation')}
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
            <CheckboxFHG
               name={'isDelivered'}
               onChange={handleChange}
               color={'default'}
               labelKey={'contract.isDelivered.label'}
               value={'isDelivered'}
               defaultChecked={defaultValues.isDelivered}
               checked={editValues.isDelivered}
               disabled={isDisabled}
               marginTop={0}
               fullWidth
            />
         </ContractEdit>
      </EditDrawer>
   );
}
