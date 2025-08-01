import {lighten} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import defer from 'lodash/defer';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {FIELD_METRIC_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {CROP_TYPE_TEMPLATE_LIST} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import Form from '../../../fhg/components/edit/Form';
import useEditData from '../../../fhg/components/edit/useEditData';
import Grid from '../../../fhg/components/Grid';
import ProgressButton from '../../../fhg/components/ProgressButton';
import ProgressIndicator from '../../../fhg/components/ProgressIndicator';
import TypographyFHG from '../../../fhg/components/Typography';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useKeyDown from '../../../fhg/hooks/useKeyDown';
import usePromptFHG from '../../../fhg/hooks/usePromptFHG';
import TextFieldLF from '../../../components/TextFieldLF';
import {
   CROP_TYPE_ALL_QUERY,
   CROP_TYPE_CREATE_UPDATE,
   FIELD_ALL_QUERY,
   FIELD_CREATE_UPDATE,
   FIELD_DELETE,
   FIELD_METRICS_CREATE_UPDATE,
   getFieldMetricsCropRefetchQueries,
} from '../../../data/QueriesGL';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import moment from 'moment';
import {DATE_DB_FORMAT, MONTH_FORMAT} from '../../../Constants';
import {Box, IconButton} from '@mui/material';
import ConfirmDialog from '../../../fhg/components/dialog/ConfirmDialog';
import useLazyQueryFHG from '../../../fhg/hooks/data/useLazyQueryFHG';

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
      progressStyle: {
         position: 'absolute',
         top: '10%',
         left: 'calc(50% - 20px)',
         zIndex: 5000,
      },
   }),
   {name: 'AssetEditStyles'},
);

export default function AddCrop() {
   const [{entityId, reportDate, clientId}, , searchAsString] = useCustomSearchParams();
   const classes = useStyles();
   const navigate = useNavigate();
   const location = useLocation();
   const id = location?.state?.id;

   const [loadFieldData, {data}] = useLazyQueryFHG(FIELD_ALL_QUERY, {
      fetchPolicy: 'cache-and-network',
   });

   const fields = data?.field_AllWhere ?? [];
   const [cropTypes, setCropTypes] = useState([]);

   const [dataCropType] = useQueryFHG(CROP_TYPE_TEMPLATE_LIST, {
      variables: {clientId},
      onCompleted: (result) => {
         const {cropTypeTemplate} = result;
         const cropTypeList = [];
         for (const cropTypeTemplateElement of cropTypeTemplate) {
            for (const type of cropTypeTemplateElement.types) {
               cropTypeList.push({groupName: cropTypeTemplateElement.groupName, ...type});
            }
         }
         setCropTypes(cropTypeList);
      },
   });

   // const cropTypes = [...(dataCropType?.cropType_All ?? [])];

   const [isSaving, setIsSaving] = useState(false);

   const [createFieldMetrics] = useMutationLxFHG(FIELD_METRICS_CREATE_UPDATE);

   const [
      editValues,
      handleChange,
      {
         isChanged = false,
         setIsChanged,
         defaultValues,
         resetValues,
         setValue,
         handleInputChange,
         setDefaultValue,
         currentValues,
      },
   ] = useEditData({
      fieldId: null,
      cropTypeId: null,
      yield: 0,
      acp: 0,
      description: '',
   });

   useQueryFHG(
      FIELD_METRIC_ALL_WHERE_QUERY,
      {
         variables: {fieldId: id},
         skip: !id || id < 0,
         onCompleted: (result) => {
            resetValues(result?.fieldMetrics?.[0]);
         },
      },
      undefined,
      false,
   );

   useEffect(() => {
      if (currentValues?.cropTypeId) {
         loadFieldData({
            variables: {
               fieldSearch: {
                  cropTypeId: currentValues.cropTypeId,
               },
               includeDeleted: false,
            },
         });
      }
   }, [currentValues?.cropTypeId, loadFieldData]);

   const [isPickerOpen, setIsPickerOpen] = useState(false);

   const handleClose = useCallback(() => {
      setIsChanged(false);
      defer(() => {
         location.state = undefined;
         navigate({pathname: '..', search: searchAsString});
      });
   }, [setIsChanged, location, navigate, searchAsString]);

   // Close the drawer if no id has been selected. This should only occur when refreshing or bookmarking the drawer.
   useEffect(() => {
      if (!id) {
         handleClose();
      }
   }, [id]);

   /**
    * Submit the task.
    * @return {Promise<void>}
    */
   const handleSubmit = async () => {
      if (isChanged) {
         try {
            setIsSaving(true);
            await handleCreateCrop();
         } catch (error) {
            console.log(error);
         } finally {
            setIsSaving(false);
         }
      }
      handleClose();
   };

   const entities = Array.isArray(entityId) ? [...entityId] : [entityId];

   const [createCrop] = useMutationLxFHG(CROP_TYPE_CREATE_UPDATE);

   const [createField] = useMutationLxFHG(FIELD_CREATE_UPDATE);

   const fieldNeedRemove = useRef(null);

   const [open, setOpen] = useState(false);

   const showModalDeleteField = useCallback(
      (bank) => () => {
         fieldNeedRemove.current = bank;
         setOpen(true);
      },
      [],
   );

   const [deleteField] = useMutationLxFHG(FIELD_DELETE);

   const removeField = useCallback(
      async (e) => {
         e.preventDefault();
         e.stopPropagation();
         const option = fieldNeedRemove.current;
         try {
            await deleteField({
               variables: {
                  fieldId: option.id,
               },
            });
            await loadFieldData({
               variables: {
                  fieldSearch: {
                     cropTypeId: editValues.cropTypeId,
                  },
                  includeDeleted: false,
               },
            });
            setValue('fieldId', null, true);
            setDefaultValue('fieldId', null);
            setValue('fieldName', null, true);
            setDefaultValue('fieldName', null);
            setOpen(false);
         } catch (error) {}
      },
      [deleteField, editValues.cropTypeId, loadFieldData, setDefaultValue, setValue],
   );

   const handleCreateCrop = async () => {
      let currentField = {...currentValues};
      if (!editValues.cropTypeId && editValues.cropTypeName) {
         // create crop type
         const cropType = await createCrop({
            variables: {
               cropType: {
                  name: editValues.cropTypeName,
                  clientId: clientId,
               },
            },
         });
         currentField.cropTypeId = cropType.data?.cropType_Create?.id;
      }
      if (!editValues.fieldId && editValues.fieldName) {
         // create field
         const field = await createField({
            variables: {
               field: {
                  name: editValues.fieldName,
                  entityId,
                  cropTypeId: currentField.cropTypeId,
               },
            },
         });
         currentField.fieldId = field.data?.field_Create?.id;
      }
      await createFieldMetrics({
         variables: {
            fieldMetrics: {
               entityId: entityId,
               fieldId: currentField.fieldId,
               cropTypeId: currentField.cropTypeId,
               actualYield: currentField.yield,
               projectedAcp: currentField.acp,
               description: currentField.description,
               date: moment().format(DATE_DB_FORMAT),
            },
         },
         refetchQueries: () =>
            getFieldMetricsCropRefetchQueries(entities, moment(reportDate, MONTH_FORMAT).startOf('month').year()),
      });
   };

   useKeyDown(handleClose);
   usePromptFHG(isChanged);

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
         <ProgressIndicator isGlobal={false} classes={{progressStyle: classes.progressStyle}} />
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
               <TypographyFHG
                  variant={'h5'}
                  id={id && id !== -1 ? 'crop.edit.label' : 'crop.add.button'}
                  color={'textSecondary'}
                  gutterBottom
               />
            </Grid>
         </Grid>
         <Grid item container resizable>
            <Form onSubmit={(!isPickerOpen && handleSubmit) || undefined} className={classes.formStyle}>
               <Grid name={'Asset Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid
                     name={'Asset Edit Inner'}
                     container
                     item
                     fullWidth
                     overflow={'visible'}
                     className={classes.innerStyle}
                  >
                     <AutocompleteMatchLXData
                        key={'cropTypeId' + defaultValues?.id}
                        name={'cropTypeId'}
                        groupBy={(option) => option.groupName}
                        disableClearable
                        autoHighlight
                        autoComplete={false}
                        defaultValue={defaultValues?.cropTypeId || null}
                        textFieldName={'cropTypeName'}
                        editName={'cropTypeName'}
                        valueInput={currentValues?.cropTypeName || null}
                        onInputChange={handleInputChange('cropTypeName')}
                        options={cropTypes}
                        labelKey={'crop.type'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        value={currentValues?.cropTypeId}
                        fullWidth
                        disabled={isSaving}
                        matchSorterProps={{keys: ['groupName', 'name']}}
                        required
                        freeSolo
                     />
                     <AutocompleteMatchLXData
                        key={'fieldId' + defaultValues?.id}
                        name={'fieldId'}
                        disableClearable
                        autoHighlight
                        autoComplete={false}
                        defaultValue={defaultValues?.fieldId || null}
                        options={fields}
                        labelKey={'field'}
                        onChange={handleChange}
                        onBlur={() => setIsPickerOpen(false)}
                        onFocus={() => setIsPickerOpen(true)}
                        value={currentValues?.fieldId}
                        fullWidth
                        disabled={isSaving}
                        matchSorterProps={{keys: ['name']}}
                        textFieldName={'fieldName'}
                        editName={'fieldName'}
                        valueInput={currentValues?.fieldName || null}
                        onInputChange={handleInputChange('fieldName')}
                        freeSolo
                        renderOption={(props, option) => (
                           <Box {...props}>
                              <Box sx={{flexGrow: 1}}>
                                 <TypographyFHG>{option.name}</TypographyFHG>
                              </Box>
                              <IconButton onClick={showModalDeleteField(option)}>
                                 <img src={'/images/delete.png'} alt='delete bank' />
                              </IconButton>
                           </Box>
                        )}
                     />
                     <TextFieldLF
                        name={'description'}
                        labelTemplate={'do'}
                        onChange={handleChange}
                        defaultValue={defaultValues.description}
                        value={editValues.description}
                        multiline
                        rows={2}
                        disabled={isSaving}
                     />
                  </Grid>
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
                  </Grid>
               </Grid>
            </Form>
            <ConfirmDialog
               open={open}
               onClose={() => setOpen(false)}
               onConfirm={removeField}
               titleKey='delete.field'
               messageKey='delete.field.message'
            />
         </Grid>
      </Grid>
   );
}
