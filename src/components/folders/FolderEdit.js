import {lighten, useTheme} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {Delete} from '@mui/icons-material';
import React, {useState, useCallback} from 'react';
import {v4 as uuid} from 'uuid';
import {ADMIN_PANEL_MAX_WIDTH} from '../../Constants';
import {FOLDER_UNDELETE} from '../../data/QueriesGL';
import {FOLDER_BY_ID_QUERY} from '../../data/QueriesGL';
import {FOLDER_DELETE} from '../../data/QueriesGL';
import {getFolderCacheQueries} from '../../data/QueriesGL';
import {FOLDER_CREATE_UPDATE} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import ConfirmButton from '../../fhg/components/ConfirmButton';
import Form from '../../fhg/components/edit/Form';
import useEditData from '../../fhg/components/edit/useEditData';
import Grid from '../../fhg/components/Grid';
import Loading from '../../fhg/components/Loading';
import ProgressButton from '../../fhg/components/ProgressButton';
import TypographyFHG from '../../fhg/components/Typography';
import useMutationFHG from '../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useEffect} from 'react';
import useKeyDown from '../../fhg/hooks/useKeyDown';
import useNavigateSearch from '../../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../../fhg/hooks/usePromptFHG';
import {cacheDelete} from '../../fhg/utils/DataUtil';
import {cacheUpdate} from '../../fhg/utils/DataUtil';
import TextFieldLF from '../TextFieldLF';
import {useLocation} from 'react-router-dom';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         // overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)})`,
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
      },
      buttonPanelStyle: {
         marginLeft: -8,
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
      buttonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.6),
         },
      },
   }),
   {name: 'FolderEditStyles'},
);

/**
 * Edit a Template Folder.
 * @returns {JSX.Element}
 * @constructor
 */
export default function FolderEdit() {
   const classes = useStyles();
   const theme = useTheme();
   const location = useLocation();
   const folderId = location?.state?.folderId;
   const navigate = useNavigateSearch();
   const editItem = {
      name: '',
      isDeleted: false,
   };

   const isNew = folderId === 'new';

   const [folderData, {loading: folderLoading}] = useQueryFHG(
      FOLDER_BY_ID_QUERY,
      {variables: {folderId}, skip: isNew || !folderId},
      'folder.type',
   );
   const [folderCreateUpdate, {loading}] = useMutationFHG(FOLDER_CREATE_UPDATE);
   const [folderDelete] = useMutationFHG(FOLDER_DELETE);
   const [folderUndelete] = useMutationFHG(FOLDER_UNDELETE);

   const [isSaving, setIsSaving] = useState(false);
   const [editValues, handleChange, {isChanged = false, defaultValues, setDefaultValues, resetValues, getValue}] =
      useEditData(isNew ? editItem : undefined);

   /**
    * Reset the edit values when changing to new.
    */
   useEffect(() => {
      if (isNew) {
         resetValues();
      }
   }, [isNew, resetValues]);

   useEffect(() => {
      if (!folderId) {
         handleClose();
      }
   }, [folderId]);

   /**
    * Reset the edit values when editing an existing folder.
    */
   useEffect(() => {
      if (folderData?.folder) {
         resetValues(folderData.folder);
      }
   }, [folderData, setDefaultValues, resetValues]);

   /**
    * Handle closing the edit component
    * @type {(function(): void)|*}
    */
   const handleClose = useCallback(() => {
      navigate('..', {replace: true, state: {}}, undefined, false);
   }, [navigate]);

   /**
    * Add keydown listener to close for the escape key.
    */
   useKeyDown(handleClose);

   /**
    * Submit the folder.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged) {
         try {
            setIsSaving(true);

            await folderCreateUpdate({
               variables: {id: uuid(), ...editValues},
               optimisticResponse: {
                  __typename: 'Mutation',
                  folderTemplate: {
                     __typename: 'FolderTemplate',
                     ...defaultValues,
                     ...editValues,
                     isDeleted: false,
                  },
               },
               update: cacheUpdate(getFolderCacheQueries(), editValues.id, 'folder'),
            });
            setIsSaving(false);
            handleClose();
         } catch (e) {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [folderCreateUpdate, handleClose, isChanged, defaultValues, editValues]);

   /**
    * Delete the template folder
    * @param event The delete event.
    * @returns {Promise<void>}
    */
   const handleDelete = async (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      setIsSaving(true);

      await folderDelete({
         variables: {id: folderId},
         optimisticResponse: {folder_Delete: 1},
         update: cacheDelete(getFolderCacheQueries(), folderId),
      });
      setIsSaving(false);

      handleClose();
   };

   /**
    * Callback when the folder is undeleted. Call the server to undelete the folder.
    * @return {Promise<void>}
    */
   const handleUnDeleteFolder = useCallback(
      async (id) => {
         if (id) {
            await folderUndelete({
               variables: {id},
               refetchQueries: getFolderCacheQueries(),
            });
         }
      },
      [folderUndelete],
   );

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
         style={{maxWidth: ADMIN_PANEL_MAX_WIDTH}}
      >
         <Loading isLoading={loading || folderLoading} />
         <Grid item resizable={false} className={classes.infoInnerStyle}>
            <TypographyFHG variant={'h5'} id={'folder.title.label'} color={'textSecondary'} gutterBottom />
         </Grid>
         <Grid item container resizable>
            <Form onSubmit={handleSubmit} className={classes.formStyle}>
               <Grid name={'Folder Edit Root'} item fullWidth className={classes.infoRootStyle}>
                  <Grid name={'Folder Edit Inner'} container item fullWidth className={classes.infoInnerStyle}>
                     <TextFieldLF
                        key={'name' + defaultValues.id}
                        name={'name'}
                        autoFocus
                        labelTemplate={'folder.{name}.label'}
                        onChange={handleChange}
                        value={getValue('name')}
                        required
                     />
                     <TextFieldLF
                        key={'description' + defaultValues.id}
                        name={'description'}
                        labelTemplate={'folder.{name}.label'}
                        onChange={handleChange}
                        value={getValue('description')}
                     />
                  </Grid>
               </Grid>
               <Grid
                  container
                  item
                  direction={'row'}
                  fullWidth
                  className={classes.buttonPanelStyle}
                  justifyContent={'space-between'}
                  overflow={'visible'}
                  resizable={false}
                  alignItems={'center'}
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

                  <Grid item>
                     <ConfirmButton
                        className={classes.buttonStyle}
                        color={theme.palette.error.dark}
                        onConfirm={handleDelete}
                        onUndo={handleUnDeleteFolder}
                        undoId={folderId}
                        values={{
                           type: 'folder',
                           name: getValue('name'),
                        }}
                        size='large'
                        submitStyle={classes.deleteColorStyle}
                        startIcon={<Delete />}
                        buttonTypographyProps={{variant: 'inherit'}}
                        disabled={isSaving || isNew}
                     />
                  </Grid>
               </Grid>
            </Form>
         </Grid>
      </Grid>
   );
}
