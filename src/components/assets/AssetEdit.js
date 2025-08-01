import {Delete} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {Box, Collapse, IconButton} from '@mui/material';
import {lighten} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {indexOf} from 'lodash';
import {map} from 'lodash';
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
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import {DATE_TIME_FORMAT} from '../../Constants';
import {DATE_DB_FORMAT} from '../../Constants';
import {MONTH_FORMAT} from '../../Constants';
import {ASSET_DELETE} from '../../data/QueriesGL';
import {BANK_ALL_WHERE_QUERY} from '../../data/QueriesGL';
import {BANK_DELETE} from '../../data/QueriesGL';
import {getBanksRefetchQueries} from '../../data/QueriesGL';
import {UNIT_TYPE_CREATE_UPDATE} from '../../data/QueriesGL';
import {getUnitTypeCacheQueries} from '../../data/QueriesGL';
import {getAssetRefetchQueries} from '../../data/QueriesGL';
import {ASSET_CREATE_UPDATE} from '../../data/QueriesGL';
import {ASSET_CATEGORY_QUERY} from '../../data/QueriesGL';
import {ASSET_QUERY} from '../../data/QueriesGL';
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
import {cacheUpdate} from '../../fhg/utils/DataUtil';
import {assign} from '../../fhg/utils/DataUtil';
import {TERM_TO_DISPLAY} from '../../pages/client/assets/Assets';
import ButtonLF from '../ButtonLF';
import TextFieldLF from '../TextFieldLF';
import AssetBreederLivestockEdit from './AssetBreederLivestockEdit';
import AssetLivestockEdit from './AssetLivestockEdit';
import AssetQuantityEdit from './AssetQuantityEdit';
import AssetYearEdit from './AssetYearEdit';
import ConfirmDialog from '../../fhg/components/dialog/ConfirmDialog';

export const LIVESTOCK_CATEGORY_NAME = 'Market Livestock';
export const BREEDER_LIVESTOCK_CATEGORY_NAME = 'Breeder Livestock';
export const QUANTITY_CATEGORY1 = 'Crop & Feed Inventory';
export const QUANTITY_CATEGORY2 = 'Prepaid Expenses';
export const QUANTITY_CATEGORY_NAME = 'Quantity Category';
export const REAL_ESTATE_CATEGORY_NAME = 'Real Estate';
export const ACRES_CATEGORY_NAME = 'Investment in Crops';
export const DEFAULT_CATEGORY_NAME = 'Default';
export const YEAR_CATEGORY1 = 'Machinery & Equipment';
export const YEAR_CATEGORY2 = 'Vehicles';
export const YEAR_CATEGORY3 = 'Real Estate';
export const YEAR_CATEGORIES = [YEAR_CATEGORY1, YEAR_CATEGORY2, YEAR_CATEGORY3];

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         flex: '1 1',
         overflow: 'hidden',
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
         height: '100%',
         overflow: 'hidden',
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
   {name: 'AssetEditStyles'},
);

export default function AssetEdit() {
   const [{entityId, reportDate, clientId}, , searchAsString] = useCustomSearchParams();
   const classes = useStyles();
   const navigate = useNavigate();
   const location = useLocation();
   const historyDate = moment(reportDate, MONTH_FORMAT).startOf('month').format(DATE_DB_FORMAT);
   const assetId = location?.state?.id;
   const isNew = !assetId;

   const [bankData] = useQueryFHG(BANK_ALL_WHERE_QUERY, {variables: {clientId}});
   const banks = useMemo(() => sortBy(bankData?.banks || [], 'name'), [bankData]);

   const editItem = useMemo(
      () => ({
         id: 0,
         entityId,
         amount: undefined,
         assetCategoryId: location?.state?.category?.id,
         description: '',
         isCollateral: true,
         isRemoved: false,
         year: moment().get('year'),
         acres: undefined,
         price: undefined,
         weight: undefined,
         head: undefined,
         quantity: undefined,
         removedDate: undefined,
         startDate: historyDate,
         isDeleted: false,
         loanToValue: undefined,
      }),
      [entityId, historyDate, location?.state],
   );

   const cacheEditItem = useMemo(
      () => ({
         amount: '',
         description: '',
         isCollateral: false,
         unitTypeId: 0,
         assetId: uuid(),
         isRemoved: false,
         year: moment().get('year'),
         acres: '',
         price: '',
         weight: '',
         head: '',
         quantity: '',
         removedDate: '',
         startDate: moment().format(DATE_DB_FORMAT),
         isDeleted: false,
         loanToValue: '',
      }),
      [],
   );

   const [assetCategoryData] = useQueryFHG(ASSET_CATEGORY_QUERY);
   const assetCategories = useMemo(
      () =>
         sortBy(
            map(assetCategoryData?.assetCategories || [], (category) => ({
               ...category,
               label: TERM_TO_DISPLAY[category.term],
            })),
            ['term', 'name'],
         ),
      [assetCategoryData],
   );

   const [assetCreateUpdate] = useMutationFHG(ASSET_CREATE_UPDATE);
   const [assetDelete] = useMutationFHG(ASSET_DELETE);
   const [unitTypeCreateUpdate] = useMutationFHG(UNIT_TYPE_CREATE_UPDATE);

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
         setEditValues,
         handleInputChange,
         handleDateChange,
         setDefaultValue,
      },
   ] = useEditData(isNew ? editItem : undefined, !isNew && ['entityId', 'assetCategoryId']);

   const [assetData] = useQueryFHG(ASSET_QUERY, {
      variables: {assetId, historyDate: editValues?.historyDate || historyDate},
      skip: !assetId || assetId === 'new',
   });
   const asset = useMemo(() => assetData?.asset || editItem, [assetData, editItem]);

   const assetGroup = useMemo(() => {
      const assetCategoryId = getValue('assetCategoryId', asset?.assetCategoryId);
      const category = find(assetCategories, {id: assetCategoryId});

      switch (category?.name) {
         case LIVESTOCK_CATEGORY_NAME:
            return LIVESTOCK_CATEGORY_NAME;
         case BREEDER_LIVESTOCK_CATEGORY_NAME:
            return BREEDER_LIVESTOCK_CATEGORY_NAME;
         case REAL_ESTATE_CATEGORY_NAME:
         case ACRES_CATEGORY_NAME:
            return ACRES_CATEGORY_NAME;
         case QUANTITY_CATEGORY1:
         case QUANTITY_CATEGORY2:
            return QUANTITY_CATEGORY_NAME;
         default:
            return indexOf(YEAR_CATEGORIES, category?.name) >= 0 ? YEAR_CATEGORIES : DEFAULT_CATEGORY_NAME;
      }
   }, [asset, getValue, assetCategories]);

   const [isPickerOpen, setIsPickerOpen] = useState(false);

   useEffect(() => {
      if (asset) {
         resetValues({...asset, bank: null});
      }
   }, [asset, resetValues]);

   /**
    * When isRemoved is changed to false, set removedDate to null.
    */
   useEffect(() => {
      if (asset) {
         if (editValues.isRemoved === false) {
            setValue('removedDate', null);
         } else if (editValues.isRemoved === true) setValue('removedDate', moment());
      }
      // setValue would cause an infinite loop.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [asset, editValues.isRemoved]);

   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         navigate({pathname: '..', search: searchAsString});
      });
   }, [setIsChanged, location, navigate, searchAsString]);

   const handleShowDates = () => {
      setShowDates((showDates) => !showDates);
   };

   const calculateAmount = () => {
      if (editValues.price || editValues.head || editValues.weight || editValues.quantity || editValues.acres) {
         switch (assetGroup) {
            case LIVESTOCK_CATEGORY_NAME:
               return getValue('head', 0) * getValue('weight', 0) * getValue('price');
            case BREEDER_LIVESTOCK_CATEGORY_NAME:
               return getValue('head', 0) * getValue('price');
            case ACRES_CATEGORY_NAME:
               return getValue('acres', 0) * getValue('price', 0);
            case QUANTITY_CATEGORY_NAME:
               return getValue('quantity', 0) * getValue('price', 0);
            default:
               return editValues.amount;
         }
      } else if (editValues.amount) {
         return editValues.amount;
      }
      return undefined;
   };

   const handleDelete = async () => {
      if (asset?.isRemoved) {
         await assetDelete({
            variables: {id: assetId},
            optimisticResponse: {asset_Delete: 1},
            refetchQueries: () => getAssetRefetchQueries(entityId, assetId, historyDate, clientId),
         });
      } else {
         try {
            await handleAssetCreateUpdate(true);
         } catch (error) {
            console.log(error);
         }
      }
      handleClose();
   };

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = async () => {
      if (isChanged) {
         try {
            setIsSaving(true);
            await handleAssetCreateUpdate();
         } catch (error) {
            console.log(error);
         } finally {
            setIsSaving(false);
         }
      }
      handleClose();
   };

   const handleAssetCreateUpdate = async (isRemove = false) => {
      const removedDate = isRemove ? moment() : moment(getValue('removedDate'));

      let useHistoryDate = editValues.historyDate ? editValues.historyDate : moment(historyDate, DATE_DB_FORMAT);

      if (useHistoryDate.isBefore(getValue('startDate'))) {
         useHistoryDate = moment(getValue('startDate'));
      } else if (useHistoryDate.isAfter(removedDate)) {
         useHistoryDate = removedDate;
      }

      const variables = {
         historyDate: useHistoryDate.startOf('month').format(DATE_DB_FORMAT),
         removedDate,
         ...editValues,
         id: assetData?.asset?.assetId || uuid(),
      };
      if (editValues.year) {
         variables.year = typeof editValues.year === 'object' ? editValues.year.get('year') : +editValues.year;
      }
      variables.amount = calculateAmount();

      if (editValues.unit) {
         const unitVariables = {id: uuid(), name: editValues.unit};
         await unitTypeCreateUpdate({
            variables: unitVariables,
            optimisticResponse: {
               __typename: 'Mutation',
               unitType: {
                  __typename: 'UnitType',
                  ...unitVariables,
                  isDeleted: false,
               },
            },
            update: cacheUpdate(getUnitTypeCacheQueries()),
         });
         variables.unitTypeId = unitVariables.id;
         delete variables.unit;
      }
      if (isRemove) {
         variables.isRemoved = true;
      }
      const asset = assign(variables, defaultValues, cacheEditItem, {__typename: 'Asset', isDeleted: false});

      await assetCreateUpdate({
         variables,
         optimisticResponse: {__typename: 'Mutation', asset},
         refetchQueries: () => getAssetRefetchQueries(entityId, variables?.id, historyDate, clientId),
      });
   };

   const [deleteBank] = useMutationFHG(BANK_DELETE);

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
            setIsPickerOpen(false);
            setOpen(false);
         } catch (error) {}
      },
      [clientId, deleteBank, setDefaultValue, setValue],
   );

   const handleLocalChange = useCallback(
      (event, value, reason, newValue, name) => {
         if (reason === 'clear') {
            setValue(name, null, true);
         } else {
            handleChange(event, value, reason, newValue, name);
         }
         setIsPickerOpen(false);
      },
      [handleChange, setValue],
   );

   useKeyDown(handleClose);
   usePromptFHG(isChanged);

   return (
      <Stack width={'100%'} height={'100%'} className={classes.frameStyle} flexDirection={'column'} overflow={'hidden'}>
         <ProgressIndicator isGlobal={false} />
         <Stack
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            px={2}
            wrap={'nowrap'}
            flex={'0 0'}
         >
            <TypographyFHG variant={'h5'} id={'asset.title.label'} color={'textSecondary'} gutterBottom />
            {!isNew && (
               <ConfirmIconButton
                  className={`${classes.deleteButtonStyle}`}
                  onConfirm={handleDelete}
                  values={{type: 'asset'}}
                  titleKey={asset?.isRemoved ? 'confirmRemove.title' : 'confirmActualRemove.title'}
                  messageKey={asset?.isRemoved ? 'confirmPermanentDelete.message' : 'confirmActualRemove.message'}
                  buttonLabelKey={asset?.isRemoved ? 'delete.button' : 'remove.button'}
                  size={'small'}
                  submitStyle={classes.deleteColorStyle}
               >
                  <Delete fontSize={'small'} />
               </ConfirmIconButton>
            )}
         </Stack>
         <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
            <Stack
               name={'Asset Edit Root'}
               width={'100%'}
               flexDirection={'column'}
               px={2}
               alignItems={'flex-start'}
               flex={'1 1'}
               overflow={'hidden auto'}
            >
               <ButtonLF
                  labelKey={!showDates ? 'asset.showDates.label' : 'asset.hideDates.label'}
                  onClick={handleShowDates}
               />
               <Collapse id='datesId' in={showDates} timeout='auto' unmountOnExit style={{width: '100%'}}>
                  <DatePickerFHG2
                     key={'startDate' + defaultValues.id}
                     name={'startDate'}
                     openTo='month'
                     views={['year', 'month']}
                     format={DATE_FORMAT_KEYBOARD}
                     labelKey={'asset.addedDate.label'}
                     maxDate={getValue('removedDate') || moment()}
                     defaultValue={defaultValues.startDate || null}
                     value={editValues.startDate}
                     onChange={handleDateChange}
                     disabled={isSaving}
                     required
                  />

                  {getValue('isRemoved') && (
                     <DatePickerFHG2
                        key={'removedDate' + defaultValues.id}
                        name={'removedDate'}
                        openTo='month'
                        views={['year', 'month']}
                        format={DATE_FORMAT_KEYBOARD}
                        minDate={getValue('startDate')}
                        labelKey={'asset.removedDate.label'}
                        defaultValue={defaultValues.removedDate || null}
                        value={editValues.removedDate}
                        onChange={handleDateChange}
                        disabled={isSaving}
                     />
                  )}
               </Collapse>
               <AutocompleteMatchLXData
                  key={`'assetCategoryId ${defaultValues?.id}`}
                  name={'assetCategoryId'}
                  groupBy={(option) => TERM_TO_DISPLAY[option.term]}
                  disableClearable
                  autoHighlight
                  autoComplete={false}
                  defaultValue={defaultValues?.categoryId || null}
                  textFieldName={'assetCategory'}
                  options={assetCategories}
                  labelKey={'asset.category.label'}
                  onChange={handleChange}
                  onBlur={() => setIsPickerOpen(false)}
                  onFocus={() => setIsPickerOpen(true)}
                  value={getValue('assetCategoryId')}
                  matchSorterProps={{keys: ['term', 'name']}}
                  required
                  fullWidth
               />
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
               <AutocompleteMatchLXData
                  key={`bankId ${defaultValues?.id}`}
                  name={'bankId'}
                  textFieldName={'bank'}
                  editName={'bank'}
                  autoHighlight
                  labelKey={'asset.bank.label'}
                  value={getValue('bankId', null)}
                  valueInput={getValue('bank', null)}
                  autoFocus={false}
                  options={banks}
                  disableClearable={false}
                  onChange={handleLocalChange}
                  onInputChange={handleInputChange('bank')}
                  onBlur={() => setIsPickerOpen(false)}
                  onFocus={() => setIsPickerOpen(true)}
                  matchSorterProps={{keys: ['_default', 'name']}}
                  defaultValue={defaultValues?.bankId || null}
                  fullWidth
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
               <CheckboxFHG
                  key={'isCollateral'}
                  name={'isCollateral'}
                  onChange={handleChange}
                  color={'default'}
                  labelKey={'asset.isCollateral.label'}
                  value={'isCollateral'}
                  defaultChecked={defaultValues.isCollateral}
                  checked={editValues.isCollateral}
                  disabled={isSaving}
                  marginTop={0}
                  fullWidth
               />
               <TextFieldLF
                  key={'loanToValue' + defaultValues?.id}
                  name={'loanToValue'}
                  isFormattedNumber
                  labelTemplate={'loanAnalysis.borrowing.loanToValue'}
                  onChange={handleChange}
                  value={getValue('loanToValue')}
                  disabled={isSaving || !getValue('isCollateral')}
                  inputProps={{suffix: '%'}}
               />
               {
                  {
                     [DEFAULT_CATEGORY_NAME]: (
                        <TextFieldLF
                           key={'amount' + defaultValues?.id}
                           internalKey={'amount' + defaultValues?.id}
                           isFormattedNumber
                           name={'amount'}
                           labelTemplate={'asset.{name}.label'}
                           onChange={handleChange}
                           value={getValue('amount')}
                           disabled={isSaving}
                           inputProps={{prefix: '$'}}
                           required
                        />
                     ),
                     [BREEDER_LIVESTOCK_CATEGORY_NAME]: (
                        <AssetBreederLivestockEdit
                           open={true}
                           defaultValues={defaultValues}
                           onChange={handleChange}
                           isSaving={isSaving}
                           getValue={getValue}
                           setEditValues={setEditValues}
                        />
                     ),
                     [LIVESTOCK_CATEGORY_NAME]: (
                        <AssetLivestockEdit
                           open={true}
                           defaultValues={defaultValues}
                           onChange={handleChange}
                           isSaving={isSaving}
                           getValue={getValue}
                           setEditValues={setEditValues}
                        />
                     ),
                     [ACRES_CATEGORY_NAME]: (
                        <AssetQuantityEdit
                           open={true}
                           defaultValues={defaultValues}
                           onChange={handleChange}
                           isSaving={isSaving}
                           getValue={getValue}
                           setEditValues={setEditValues}
                           editValues={editValues}
                        />
                     ),
                     [QUANTITY_CATEGORY_NAME]: (
                        <AssetQuantityEdit
                           open={true}
                           defaultValues={defaultValues}
                           onChange={handleChange}
                           isSaving={isSaving}
                           getValue={getValue}
                           setEditValues={setEditValues}
                           labelKey={'asset.units.label'}
                           valueKey={'quantity'}
                        />
                     ),
                     [YEAR_CATEGORIES]: (
                        <AssetYearEdit
                           key={defaultValues?.id + getValue('assetCategoryId')}
                           open={true}
                           defaultValues={defaultValues}
                           onChange={handleChange}
                           isSaving={isSaving}
                           getValue={getValue}
                           editValues={editValues}
                        />
                     ),
                  }[assetGroup]
               }
            </Stack>
            <Box width={'100%'} m={2}>
               <TypographyFHG>
                  Last updated: {moment(assetData?.asset?.amountUpdatedDateTime).format(DATE_TIME_FORMAT)}
               </TypographyFHG>
            </Box>
            <Stack flexDirection={'row'} width={'100%'} className={classes.buttonPanelStyle} overflow={'hidden'}>
               <ProgressButton
                  isProgress={isSaving}
                  variant='text'
                  color='primary'
                  type={'submit'}
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
            </Stack>
         </Form>
         <ConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={removeBank}
            titleKey='delete.bank'
            messageKey='delete.bank.message'
         />
      </Stack>
   );
}
