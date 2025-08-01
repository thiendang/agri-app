import {Stack} from '@mui/material';
import {FormGroup} from '@mui/material';
import {FormLabel} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import makeStyles from '@mui/styles/makeStyles';
import {remove} from 'lodash';
import indexOf from 'lodash/indexOf';
import isEqual from 'lodash/isEqual';
import {useMemo} from 'react';
import {useState} from 'react';
import React from 'react';
import {HUBSPOT_SUBMIT_FORM} from '../data/QueriesGL';
import {HUB_SPOT_FORMS_ALL_QUERY} from '../data/QueriesGL';
import CheckboxFHG from '../fhg/components/CheckboxFHG';
import ModalDialog from '../fhg/components/dialog/ModalDialog';
import AutocompleteMatchLX from '../fhg/components/edit/AutocompleteMatchLX';
import PhoneNumberFieldFHG from '../fhg/components/edit/PhoneNumberFieldFHG';
import useEditData from '../fhg/components/edit/useEditData';
import useMutationFHG from '../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import TextFieldFHG from './TextField';
import isArray from 'lodash/isArray';

const useStyles = makeStyles(
   (theme) => ({
      titleTypography: {
         textAlign: 'center',
         width: '100%',
         color: theme.palette.primary.main,
      },
      container: {
         height: '100%',
         backgroundColor: theme.palette.background.default,
      },
      dialogStyle: {
         '& .MuiDialog-paper': {
            overflow: 'hidden',
            height: '100%',
         },
      },
   }),
   {name: 'HubspotContactFormStyles'},
);

export default function HubspotContactForm() {
   const classes = useStyles();
   const [isOpen, setIsOpen] = useState(true);
   const [refresh, setRefresh] = useState(Date.now());

   const [data] = useQueryFHG(HUB_SPOT_FORMS_ALL_QUERY);
   const [editValues, handleChange, {handleAutocompleteChange, setValue}] = useEditData();

   const formInformation = useMemo(() => {
      if (data?.hubSpotForms?.[data?.hubSpotForms.length - 1]?.responseData) {
         return JSON.parse(data?.hubSpotForms?.[data?.hubSpotForms.length - 1]?.responseData);
      }
      return undefined;
   }, [data]);

   const [hubSpotSubmitForm] = useMutationFHG(HUBSPOT_SUBMIT_FORM);

   /**
    * Callback when checkbox inputs change for a single field.
    * @param field The field for the checkboxes.
    * @param event The event that changed a checkbox.
    * @return {(function(*, *, *, *, *): void)|*}
    */
   const handleCheckboxChange = (field) => (event) => {
      const list = editValues[field.name] || [];

      if (event.target.checked) {
         list.push(event.target.value);
      } else if (list.length > 0) {
         remove(list, (item) => isEqual(item, event.target.value));
      }
      setValue(field.name, list, true);
      setRefresh(Date.now());
   };

   /**
    * Submit the changes to all the fields to the server.
    */
   const handleSubmit = async () => {
      setIsOpen(false);
      const fields = [];
      for (const formField of formInformation?.formFieldGroups) {
         for (const field of formField.fields) {
            let value = editValues[field.name];
            let multiValue;

            if (typeof value === 'object') {
               if (isArray(value)) {
                  multiValue = value;
                  value = undefined;
               } else {
                  value = value?.value;
               }
            } else {
               value += '';
            }
            fields.push({
               name: field.name,
               objectTypeId: field.objectTypeId,
               value,
               multiValue,
            });
         }
      }
      try {
         await hubSpotSubmitForm({
            variables: {formId: data?.hubSpotForms?.[data?.hubSpotForms.length - 1]?.id, cookie: '', fields},
         });

         window.fbq('track', 'SubmitApplication', {
            event: 'Submits the HubSpot form'
         });
      } catch (error) {
         console.log(error);
      }
   };

   if (isOpen) {
      return (
         <ModalDialog
            key={'Hubspot Modal '}
            open={isOpen}
            title={'Complete Account Creation'}
            titleVariant={'h5'}
            onSubmit={handleSubmit}
            submitKey={'hubspot.submit.button'}
            maxWidth={'sm'}
            fullWidth={true}
            isForm
            classes={{titleTypography: classes.titleTypography, container: classes.container}}
            fullHeight
            slotProps={{submitButton: {size: 'large', style: {fontWeight: 'bold'}}}}
            className={classes.dialogStyle}
         >
            <Stack flexDirection={'column'} height={'100%'} overflow={'auto'}>
               {formInformation?.formFieldGroups?.map((fields) => {
                  return fields?.fields?.map((field, index) => {
                     return !field.hidden
                        ? {
                             phonenumber: (
                                <PhoneNumberFieldFHG
                                   key={field.name + index}
                                   name={field.name}
                                   label={field?.label}
                                   placeholderKey={field?.description || 'phone.placeholder'}
                                   disabled={!field?.enabled}
                                   onChange={handleChange}
                                   defaultValue={field.defaultValue}
                                   value={editValues[field.name]}
                                   size={'small'}
                                   margin='normal'
                                   fullWidth
                                   required
                                />
                             ),

                             text: (
                                <TextFieldFHG
                                   key={field.name + index}
                                   name={field.name}
                                   label={field.label}
                                   placeholder={field.placeholder || field.description}
                                   disabled={!field?.enabled}
                                   onChange={handleChange}
                                   defaultValue={field.defaultValue}
                                   value={editValues[field.name]}
                                   required
                                />
                             ),
                             textarea: (
                                <TextFieldFHG
                                   key={field.name + index}
                                   name={field.name}
                                   label={field.label}
                                   placeholder={field.placeholder || field.description}
                                   disabled={!field?.enabled}
                                   maxRows={4}
                                   minRows={1}
                                   multiline
                                   onChange={handleChange}
                                   defaultValue={field.defaultValue}
                                   value={editValues[field.name]}
                                   required
                                />
                             ),
                             number: (
                                <TextFieldFHG
                                   key={field.name + index}
                                   type='number'
                                   name={field.name}
                                   label={field.label}
                                   placeholder={field.placeholder || field.description}
                                   disabled={!field?.enabled}
                                   onChange={handleChange}
                                   defaultValue={field.defaultValue}
                                   value={editValues[field.name]}
                                   required
                                />
                             ),
                             checkbox: field.fieldType === 'checkbox' && refresh && (
                                <>
                                   <FormControl>
                                      <FormLabel id='demo-customized-radios'>{field.label}</FormLabel>
                                      <FormGroup key={refresh} name={field.name}>
                                         {field?.options?.map((option1) => (
                                            <CheckboxFHG
                                               key={option1.value + index}
                                               name={option1.value + index}
                                               onChange={handleCheckboxChange(field)}
                                               color={'default'}
                                               label={option1.label}
                                               value={option1.value}
                                               // defaultChecked={defaultValues.repeatTask}
                                               checked={indexOf(editValues[field.name], option1.value) >= 0}
                                               marginTop={0}
                                               fullWidth
                                            />
                                         ))}
                                      </FormGroup>
                                   </FormControl>
                                </>
                             ),
                             select: (
                                <AutocompleteMatchLX
                                   name={field.name}
                                   options={field.options}
                                   optionLabelKey={'label'}
                                   optionValueKey={'value'}
                                   // matchSorterProps={{keys: ['name']}}
                                   label={field.label}
                                   onChange={handleAutocompleteChange(field.name)}
                                   defaultValue={field.defaultValue}
                                   placeholder={field.placeholder || field.description}
                                   value={editValues[field.name]}
                                   required
                                />
                             ),
                          }[field.fieldType]
                        : null;
                  });
               })}
            </Stack>
         </ModalDialog>
      );
   } else {
      return null;
   }
}
