import {Close} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import TextFieldLF from '../../../components/TextFieldLF';
import {MODULE_CREATE_UPDATE} from '../../../data/QueriesGL';
import Form from '../../../fhg/components/edit/Form';
import ProgressButton from '../../../fhg/components/ProgressButton';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useKeyDown from '../../../fhg/hooks/useKeyDown';
import {v4 as uuid} from 'uuid';

/**
 * Component to edit the knowledge center module.
 *
 * @param module The module to edit. If a new module, the module needs to be initialized to the proper values.
 * @param onClose Callback when the module edit is closed.
 * @return {Element}
 * @constructor
 */
export default function ModuleEdit({module, refetchCourse, onClose}) {
   const [name, setName] = useState();
   const [isSaving, setIsSaving] = useState(false);
   const [isChanged, setIsChanged] = useState(false);

   const [moduleCreateUpdate] = useMutationFHG(MODULE_CREATE_UPDATE);

   /**
    * Initialize the name based on the module passed in.
    */
   useEffect(() => {
      setName(module?.name ?? '');
   }, [module]);

   // Close on the global escape key
   useKeyDown(onClose);

   /**
    * Submit the changes to the name to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = async (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      if (isChanged) {
         try {
            setIsSaving(true);
            const isNew = !module?.id;
            const variables = {id: uuid(), ...module, name};
            await moduleCreateUpdate(
               {variables},
               {courseId: module?.courseId, sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]},
               isNew,
            );
            refetchCourse?.();
            setIsSaving(false);
         } catch (e) {
            setIsSaving(false);
         }
      }
      onClose?.();
   };

   /**
    * Callback to handle changing the name.
    * @param event The event to change the name.
    */
   const handleChange = (event) => {
      if (event.target.value !== name) {
         setName(event.target.value);
         setIsChanged(true);
      }
   };

   return (
      <Form id={'ModuleEditForm'} onSubmit={handleSubmit}>
         <Stack flexDirection={'row'} flex={'1 1'} width={'100%'} alignItems={'center'}>
            <TextFieldLF
               key={module?.name || 'name'}
               name='name'
               labelKey={'knowledgeCenter.moduleName.label'}
               defaultValue={module?.name ?? ''}
               onFocus={({target}) => target.select()}
               autoFocus
               sx={{mr: 1}}
               onChange={handleChange}
               size='small'
               required={true}
            />
            <ProgressButton
               isProgress={isSaving}
               type={'submit'}
               labelKey={'ok.button'}
               size={'small'}
               variant={'contained'}
               color={'primary'}
               sx={{mr: 1, mt: 1.2}}
            />
            <IconButton size={'small'} onClick={onClose} sx={{mt: 1.2}}>
               <Close style={{fontSize: 16}} />
            </IconButton>
         </Stack>
      </Form>
   );
}
