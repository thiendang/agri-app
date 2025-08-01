import {Delete} from '@mui/icons-material';
import {Box} from '@mui/material';
import {Collapse} from '@mui/material';
import {IconButton} from '@mui/material';
import {lighten} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {indexOf} from 'lodash';
import defer from 'lodash/defer';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import {useMemo, useRef} from 'react';
import React, {useState, useCallback} from 'react';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import {DATE_DB_FORMAT} from '../../Constants';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {DATE_TIME_FORMAT} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {BANK_ALL_WHERE_QUERY} from '../../data/QueriesGL';
import {BANK_DELETE} from '../../data/QueriesGL';
import {LIABILITY_DELETE} from '../../data/QueriesGL';
import {getLiabilityRefetchQueries} from '../../data/QueriesGL';
import {LIABILITY_CREATE_UPDATE} from '../../data/QueriesGL';
import {LIABILITY_CATEGORY_QUERY} from '../../data/QueriesGL';
import {LIABILITY_QUERY} from '../../data/QueriesGL';
import {getBanksRefetchQueries} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import CheckboxFHG from '../../fhg/components/CheckboxFHG';
import ConfirmIconButton from '../../fhg/components/ConfirmIconButton';
import DatePickerFHG2 from '../../fhg/components/DatePickerFHG2';
import AutocompleteMatchLXData from '../../fhg/components/edit/AutocompleteMatchLXData';
import Form from '../../fhg/components/edit/Form';
import useEditData from '../../fhg/components/edit/useEditData';
import Grid from '../../fhg/components/Grid';
import ProgressButton from '../../fhg/components/ProgressButton';
import ProgressIndicator from '../../fhg/components/ProgressIndicator';
import TypographyFHG from '../../fhg/components/Typography';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import useKeyDown from '../../fhg/hooks/useKeyDown';
import usePromptFHG from '../../fhg/hooks/usePromptFHG';
import {assign} from '../../fhg/utils/DataUtil';
import {TERM_TO_DISPLAY} from '../../pages/client/assets/Assets';
import ButtonLF from '../ButtonLF';
import TextFieldLF from '../TextFieldLF';
import ConfirmDialog from '../../fhg/components/dialog/ConfirmDialog';

const TYPE_CATEGORIES = ['Accounts Payable', 'Outstanding Drafts/Checks', 'Income Taxes Payable'];

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         overflow: 'visible',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)})`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      buttonPanelStyle: {
         // marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2, 0),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(3, 0),
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      innerStyle: {
         paddingLeft: theme.spacing(2),
         paddingRight: theme.spacing(2),
      },
      headerStyle: {
         paddingLeft: theme.spacing(2),
         paddingRight: theme.spacing(2),
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.dark, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.dark, 0.6),
         },
      },
   }),
   {name: 'LiabilityEditStyles'},
);

export default function LiabilityEdit() {
   const classes = useStyles();
   const [{entityId, clientId, reportDate}, , searchAsString] = useCustomSearchParams();
   const navigate = useNavigate();
   const location = useLocation();
   const historyDate = moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const liabilityId = location?.state?.id;
   const dataInit = location?.state?.data;

   const [deleteBank] = useMutationFHG(BANK_DELETE);
   const isNew = !liabilityId;

   const editItem = useMemo(
      () => ({
         id: 0,
         entityId,
         amount: undefined,
         description: '',
         liabilityCategoryId: location?.state?.category?.id,
         bankId: undefined,
         isCollateral: true,
         isRemoved: false,
         removedDate: undefined,
         startDate: historyDate,
         isDeleted: false,
         note: '',
         createdDateTime: new Date().toLocaleString(),
      }),
      [entityId, historyDate, location?.state?.category?.id],
   );

   const [liabilityCategoryData] = useQueryFHG(LIABILITY_CATEGORY_QUERY);
   const liabilityCategories = useMemo(
      () =>
         sortBy(liabilityCategoryData?.liabilityCategories || [], ['name'])?.map((item) => ({
            ...item,
            label: item.name,
         })),
      [liabilityCategoryData],
   );

   const [bankData] = useQueryFHG(BANK_ALL_WHERE_QUERY, {variables: {clientId}});
   const banks = useMemo(
      () => sortBy(bankData?.banks || [], 'name')?.map((item) => ({...item, label: item.name})),
      [bankData],
   );

   const [liabilityDelete] = useMutationFHG(LIABILITY_DELETE);

   const [isSaving, setIsSaving] = useState(false);
   const [showDates, setShowDates] = useState(false);

   const [
      editValues,
      handleChange,
      {
         isChanged = false,
         setIsChanged,
         defaultValues,
         resetValues,
         getValue,
         setValue,
         handleInputChange,
         handleDateChange,
         setDefaultValue,
      },
   ] = useEditData(isNew ? editItem : undefined, !isNew && ['entityId']);

   const [liabilityData] = useQueryFHG(LIABILITY_QUERY, {
      variables: {liabilityId, historyDate: editValues?.historyDate || historyDate},
      skip: !liabilityId || liabilityId === 'new',
   });
   const liability = useMemo(
      () => liabilityData?.liability || dataInit || editItem,
      [liabilityData?.liability, dataInit, editItem],
   );

   const [liabilityCreateUpdate] = useMutationFHG(LIABILITY_CREATE_UPDATE, {historyDate}, true);
   const [isPickerOpen, setIsPickerOpen] = useState(false);

   const isTypeCategory = useMemo(() => {
      const categoryId = getValue('liabilityCategoryId');
      const selectedCategory = find(liabilityCategories, {id: categoryId});

      if (selectedCategory) {
         return selectedCategory ? indexOf(TYPE_CATEGORIES, selectedCategory.name) >= 0 : false;
      }
   }, [liabilityCategories, getValue]);

   useEffect(() => {
      if (liability) {
         resetValues({...liability, bank: null});
      }
   }, [liability, resetValues]);

   /**
    * When isRemoved is changed to false, set removedDate to null.
    */
   useEffect(() => {
      if (liability) {
         if (editValues.isRemoved === false) {
            setValue('removedDate', null);
         } else if (editValues.isRemoved === true) {
            setValue('removedDate', moment());
         }
      }
      // setValue causes endless loops.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [liability, editValues.isRemoved]);

   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         navigate({pathname: '..', search: searchAsString});
      });
   }, [setIsChanged, location, navigate, searchAsString]);

   useKeyDown(handleClose);

   const handleShowDates = () => {
      setShowDates((showDates) => !showDates);
   };

   const handleLiabilityCreateUpdate = async (isRemove = false) => {
      const removedDate = isRemove ? moment() : moment(getValue('removedDate'));
      let useHistoryDate = editValues.historyDate ? editValues.historyDate : moment(historyDate, DATE_DB_FORMAT);

      if (useHistoryDate.isBefore(getValue('startDate'))) {
         useHistoryDate = moment(getValue('startDate'));
      } else if (useHistoryDate.isAfter(removedDate)) {
         useHistoryDate = removedDate;
      }

      const variables = {
         historyDate: moment(useHistoryDate).startOf('month').format(DATE_DB_FORMAT),
         ...editValues,
         paymentMaturityDate: getValue('paymentMaturityDate')
            ? getValue('paymentMaturityDate').format(DATE_DB_FORMAT)
            : null,
         removedDate: removedDate,
         id: liability?.liabilityId || uuid(),
      };
      if (isTypeCategory) {
         variables.bank = null;
         variables.bankId = null;
      }

      const liabilityUpdate = assign(
         {
            bank:
               typeof getValue('bank') === 'string'
                  ? {id: uuid(), name: getValue('bank'), __typename: 'Bank'}
                  : find(banks, {id: getValue('bankId')}),
            isDeleted: false,
         },
         variables,
         defaultValues,
         editItem,
         {
            __typename: 'Liability',
            liabilityCategory: find(liabilityCategories, getValue('liabilityCategoryId')),
            liabilityId: liability?.liabilityId || variables?.id,
            isDeleted: false,
         },
      );

      await liabilityCreateUpdate({
         variables,
         optimisticResponse: {__typename: 'Mutation', liability: liabilityUpdate},
         refetchQueries: () => getLiabilityRefetchQueries(entityId, variables?.id, historyDate, clientId),
      });
   };

   const handleDelete = async () => {
      if (liability?.isRemoved) {
         await liabilityDelete({
            variables: {id: liabilityId},
            optimisticResponse: {liability_Delete: 1},
            refetchQueries: () => getLiabilityRefetchQueries(entityId, liabilityId, historyDate, clientId),
         });
      } else {
         await handleLiabilityCreateUpdate(true);
      }
      handleClose();
   };

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         setIsSaving(true);
         try {
            await handleLiabilityCreateUpdate();
            setIsChanged(false);
            handleClose();
         } catch (e) {
            console.log(e);
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      isChanged,
      getValue,
      editValues,
      historyDate,
      liability?.liabilityId,
      isTypeCategory,
      banks,
      defaultValues,
      editItem,
      liabilityCategories,
      liabilityCreateUpdate,
      setIsChanged,
      handleClose,
      entityId,
      clientId,
   ]);
   usePromptFHG(isChanged);

   const bankNeedRemove = useRef(null);

   const [open, setOpen] = useState(false);

   const showModalDeleteBank = useCallback(
      (bank) => () => {
         bankNeedRemove.current = bank;
         setOpen(true);
      },
      [],
   );

   const removeBank = useCallback(
      async (e) => {
         e.preventDefault();
         e.stopPropagation();
         const option = bankNeedRemove.current;
         try {
            await deleteBank({
               variables: {
                  bankId: option.id,
                  clientId,
               },
               refetchQueries: () => getBanksRefetchQueries(clientId),
            });
            setValue('bankId', null, true);
            setValue('bank', null, true);
            setDefaultValue('bankId', null);
            setDefaultValue('bank', null);
            setOpen(false);
         } catch (error) {}
      },
      [clientId, deleteBank, setDefaultValue, setValue],
   );

   return (
      <Grid
         container
         fullWidth
         fullHeight
         className={classes.frameStyle}
         direction={'column'}
         overflow={'visible'}
         wrap={'nowrap'}
      >
         <ProgressIndicator isGlobal={false} />
         <Form onSubmit={!isPickerOpen ? handleSubmit : undefined} className={classes.formStyle}>
            <Grid
               item
               container
               direction={'row'}
               alignItems={'center'}
               justifyContent={'space-between'}
               resizable={false}
               className={classes.headerStyle}
               wrap={'nowrap'}
            >
               <Grid item>
                  <TypographyFHG variant={'h5'} id={'liability.title.label'} color={'textSecondary'} gutterBottom />
               </Grid>
               {!isNew && (
                  <Grid container overflow={'visible'} direction={'row'} fullWidth={false} alignItems={'center'}>
                     <Grid item>
                        <ConfirmIconButton
                           className={`${classes.deleteButtonStyle}`}
                           onConfirm={handleDelete}
                           values={{type: 'liability'}}
                           titleKey={liability?.isRemoved ? 'confirmRemove.title' : 'confirmActualRemove.title'}
                           messageKey={
                              liability?.isRemoved ? 'confirmPermanentDelete.message' : 'confirmActualRemove.message'
                           }
                           buttonLabelKey={liability?.isRemoved ? 'delete.button' : 'remove.button'}
                           size={'small'}
                           submitStyle={classes.deleteColorStyle}
                        >
                           <Delete fontSize={'small'} />
                        </ConfirmIconButton>
                     </Grid>
                  </Grid>
               )}
            </Grid>
            <Grid item container resizable>
               <Grid name={'Liability Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid
                     name={'Liability Edit Inner'}
                     container
                     item
                     fullWidth
                     overflow={'visible'}
                     className={classes.innerStyle}
                  >
                     <Grid item>
                        <ButtonLF
                           labelKey={!showDates ? 'liability.showDates.label' : 'liability.hideDates.label'}
                           onClick={handleShowDates}
                        />
                     </Grid>
                     <Collapse id='datesId' in={showDates} timeout='auto' unmountOnExit style={{width: '100%'}}>
                        <DatePickerFHG2
                           key={'startDate' + defaultValues.id}
                           name={'startDate'}
                           openTo='month'
                           views={['year', 'month']}
                           format={DATE_FORMAT_KEYBOARD}
                           labelKey={'liability.addedDate.label'}
                           maxDate={getValue('removedDate') || moment()}
                           value={getValue('startDate')}
                           onChange={handleDateChange}
                           disabled={isSaving}
                           required
                           defaultValue={defaultValues?.startDate || null}
                        />
                        {getValue('isRemoved') && (
                           <DatePickerFHG2
                              key={'removedDate' + defaultValues.id}
                              name={'removedDate'}
                              openTo='month'
                              views={['year', 'month']}
                              format={DATE_FORMAT_KEYBOARD}
                              minDate={getValue('startDate')}
                              labelKey={'liability.removedDate.label'}
                              value={getValue('removedDate')}
                              onChange={handleDateChange}
                              disabled={isSaving}
                              defaultValue={defaultValues?.removedDate || null}
                           />
                        )}
                     </Collapse>
                     <AutocompleteMatchLXData
                        key={`'liabilityCategoryId ${defaultValues?.id}`}
                        name={'liabilityCategoryId'}
                        groupBy={(option) => TERM_TO_DISPLAY[option.term]}
                        textFieldName={'liabilityCategory'}
                        freeSolo={false}
                        autoHighlight
                        editName={'liabilityCategory'}
                        options={liabilityCategories}
                        labelKey={'liability.category.label'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        value={getValue('liabilityCategoryId')}
                        required
                        fullWidth
                        matchSorterProps={{keys: ['term', 'name']}}
                        defaultValue={defaultValues?.liabilityCategoryId || null}
                        disableClearable
                     />
                     <Collapse in={!isTypeCategory} style={{width: '100%'}}>
                        {banks?.length === 0 ? (
                           <TextFieldLF
                              key={`bank ${defaultValues?.id}`}
                              name={'bank'}
                              labelKey={'liability.bank.label'}
                              onChange={handleChange}
                              defaultValue={defaultValues.bank}
                              value={editValues.bank}
                              disabled={isSaving}
                           />
                        ) : (
                           <AutocompleteMatchLXData
                              key={`bankId ${defaultValues?.id}`}
                              name={'bankId'}
                              textFieldName={'bank'}
                              editName={'bank'}
                              autoHighlight
                              options={banks}
                              labelKey={'liability.bank.label'}
                              onChange={handleChange}
                              onInputChange={handleInputChange('bank')}
                              onBlur={() => setIsPickerOpen(false)}
                              onFocus={() => setIsPickerOpen(true)}
                              value={getValue('bankId')}
                              valueInput={getValue('bank')}
                              fullWidth
                              defaultValue={defaultValues?.bankId || null}
                              freeSolo
                              renderOption={(props, option) => (
                                 <Box {...props}>
                                    <Box sx={{flexGrow: 1}}>
                                       <TypographyFHG>{option.name}</TypographyFHG>
                                    </Box>
                                    <IconButton onClick={showModalDeleteBank(option)}>
                                       <img src={'/images/delete.png'} alt='delete bank' />
                                    </IconButton>
                                 </Box>
                              )}
                           />
                        )}
                     </Collapse>
                     <TextFieldLF
                        key={'description' + defaultValues?.id}
                        name={'description'}
                        labelTemplate={'task.{name}.label'}
                        onChange={handleChange}
                        defaultValue={defaultValues.description}
                        value={editValues.description}
                        multiline
                        rows={2}
                        disabled={isSaving}
                     />
                     <TextFieldLF
                        key={'interestRate' + defaultValues?.id}
                        type={'number'}
                        name={'interestRate'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        // defaultValue={defaultValues.interestRate}
                        value={getValue('interestRate')}
                        disabled={isSaving}
                        inputProps={{
                           min: 0,
                           max: 99.99,
                           step: 0.01,
                        }}
                     />
                     <TextFieldLF
                        key={'payment' + defaultValues?.id}
                        internalKey={'payment' + defaultValues?.id}
                        isFormattedNumber
                        name={'payment'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        value={getValue('payment')}
                        disabled={isSaving}
                        inputProps={{prefix: '$', allowNegative: false}}
                     />
                     <TextFieldLF
                        key={'paymentDueDate' + defaultValues?.id}
                        name={'paymentDueDate'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        value={getValue('paymentDueDate')}
                        disabled={isSaving}
                     />
                     <DatePickerFHG2
                        key={'paymentMaturityDate' + defaultValues.id}
                        name={'paymentMaturityDate'}
                        format={DATE_FORMAT_KEYBOARD}
                        labelKey={'liability.paymentMaturityDate.label'}
                        value={getValue('paymentMaturityDate', null)}
                        defaultValue={defaultValues?.paymentMaturityDate || null}
                        onChange={handleDateChange}
                        disabled={isSaving}
                     />
                     <CheckboxFHG
                        key={'isCollateral'}
                        name={'isCollateral'}
                        onChange={handleChange}
                        color={'default'}
                        labelKey={'liability.isCollateral.label'}
                        value={'isCollateral'}
                        defaultChecked={defaultValues.isCollateral}
                        checked={editValues.isCollateral}
                        disabled={isSaving}
                        marginTop={0}
                        fullWidth
                     />
                     <TextFieldLF
                        key={'amount' + defaultValues?.id}
                        internalKey={'amount' + defaultValues?.id}
                        isFormattedNumber
                        name={'amount'}
                        labelTemplate={'liability.{name}.label'}
                        onChange={handleChange}
                        value={getValue('amount')}
                        disabled={isSaving}
                        inputProps={{prefix: '$', allowNegative: true}}
                        required
                     />
                  </Grid>
               </Grid>
               <Grid
                  item
                  fullWidth
                  style={{
                     margin: 8,
                  }}
               >
                  <TypographyFHG>
                     Last updated: {moment(liabilityData?.liability?.amountUpdatedDateTime).format(DATE_TIME_FORMAT)}
                  </TypographyFHG>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  overflow={'visible'}
                  justifyContent={'space-between'}
                  resizable={false}
               >
                  <Grid item>
                     <ProgressButton
                        isProgress={isSaving}
                        variant='text'
                        color='primary'
                        type='submit'
                        size='large'
                        labelKey='save.label'
                        disabled={isSaving}
                     />
                     <ButtonFHG
                        variant='text'
                        size={'large'}
                        labelKey={'cancel.button'}
                        disabled={isSaving}
                        onClick={() => handleClose()}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </Form>
         <ConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={removeBank}
            titleKey='delete.bank'
            messageKey='delete.bank.message'
         />
      </Grid>
   );
}
