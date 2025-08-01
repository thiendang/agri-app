import {CloudQueue} from '@mui/icons-material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {ExpandMore} from '@mui/icons-material';
import {ExpandLess} from '@mui/icons-material';
import {ListItemText} from '@mui/material';
import {ListItemButton} from '@mui/material';
import {Stack} from '@mui/material';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import makeStyles from '@mui/styles/makeStyles';
import {Storage} from 'aws-amplify';
import {difference} from 'lodash';
import {lastIndexOf} from 'lodash';
import {remove} from 'lodash';
import isEqual from 'lodash/isEqual';
import {useRef} from 'react';
import {useState} from 'react';
import {useCallback} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import Header from '../../../components/Header';
import TextFieldLF from '../../../components/TextFieldLF';
import {VIDEO_ACCEPT_KNOWLEDGE_CENTER} from '../../../Constants';
import {SECTION_PANEL_MAX_WIDTH} from '../../../Constants';
import {NEW_EDIT} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {DELETE_ICON} from '../../../Constants';
import {SECTION_CREATE_UPDATE} from '../../../data/QueriesGL';
import {SECTION_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import CircularProgressWithLabel from '../../../fhg/components/CircularProgressWithLabel';
import Form from '../../../fhg/components/edit/Form';
import Editor from '../../../fhg/components/edit/HTMLEditor/Editor';
import useEditData from '../../../fhg/components/edit/useEditData';
import {MAIN} from '../../../fhg/components/ListItemButtonFHG';
import ListItemButtonPlainFHG from '../../../fhg/components/ListItemButtonPlainFHG';
import LoadingValue from '../../../fhg/components/LoadingValue';
import ProgressButton from '../../../fhg/components/ProgressButton';
import StyledDropZone from '../../../fhg/components/StyledDropZone';
import TypographyFHG from '../../../fhg/components/Typography';
import VideoFHG from '../../../fhg/components/VideoFHG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePromptFHG from '../../../fhg/hooks/usePromptFHG';
import ScrollStack from '../../../fhg/ScrollStack';
import {errorState} from '../../Main';
import {v4 as uuid} from 'uuid';

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         overflow: 'hidden',
         // minHeight: 320,
         width: SECTION_PANEL_MAX_WIDTH,
         display: 'flex',
         flexDirection: 'column',
      },
      textAreaEditor: {
         borderColor: 'rgba(0, 0, 0, 0.23)',
         border: '0.5px solid',
         borderRadius: '6px',
      },
      editorLabelStyle: {
         marginLeft: 2,
         marginRight: 2,
         '& .MuiFormControlLabel-label': {
            marginRight: 'auto',
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing(0.5),
            paddingRight: theme.spacing(1),
            transform: `translate(2px, ${theme.spacing(1.2)}) scale(0.75)`,
            zIndex: 10,
            backgroundColor: 'transparent',
         },
      },
      primaryLinkStyle: {
         position: 'sticky',
         top: 0,
         zIndex: 100,
         paddingLeft: theme.spacing(1),
         height: 48 * SCALE_APP,
         backgroundColor: theme.palette.background.default,
         '&.selected': {
            backgroundColor:
               theme.palette.mode === 'dark'
                  ? theme.palette.background.selectedCell
                  : theme.palette.background.lightGreen,
            color: 'black',
            borderRadius: BORDER_RADIUS_10,
            marginRight: theme.spacing(0.5),
            marginLeft: theme.spacing(0.5),
         },
      },
      menuItemText: {
         fontWeight: 500,
         textShadow: '0.5px 0',
         fontSize: 18 * SCALE_APP,
      },
      collapseItem: {
         marginLeft: theme.spacing(2.5),
         marginRight: theme.spacing(2.5),
      },
      fileStyle: {
         opacity: '1 !important',
      },
   }),
   {name: 'SectionStyles'},
);

SectionEdit.propTypes = {};

export default function SectionEdit() {
   const [searchObject] = useCustomSearchParams();
   const {moduleId, sectionId} = searchObject;
   const classes = useStyles();
   const navigate = useNavigateSearch(true);
   const location = useLocation();
   const isNew = sectionId === NEW_EDIT;
   const [isSaving, setIsSaving] = useState(false);
   const [files, setResourceFiles] = useState([]);
   const [filesExisting, setResourceFilesExisting] = useState();
   const [filesOriginal, setResourceFilesOriginal] = useState();
   const [isVideoLoading, setIsVideoLoading] = useState(false);
   const [isResourceLoading, setIsResourceLoading] = useState(false);
   const [progressPercent, setProgressPercent] = useState();
   const [progressPercentTotal, setProgressPercentTotal] = useState();

   const setErrorState = useSetRecoilState(errorState);

   const [open, setOpen] = useState(false);
   const [video, setVideo] = useState();
   const [videoUrl, setVideoUrl] = useState();
   const existingVideoRef = useRef();

   const [sectionCreateUpdate] = useMutationFHG(SECTION_CREATE_UPDATE);

   const [editValues, handleChange, {isChanged, setIsChanged, defaultValues, resetValues, getValue}] = useEditData(
      undefined,
      ['id', 'moduleId'],
   );
   usePromptFHG(isChanged);

   const [data] = useQueryFHG(SECTION_ALL_WHERE_QUERY, {
      variables: {sectionId, moduleId},
      skip: isNew || !validate(sectionId),
   });

   useEffect(() => {
      if (!location?.state?.isEdit) {
         navigate('..', {replace: true, state: null}, {sectionId: null}, false);
      }
   }, [location?.state?.isEdit, navigate]);

   useEffect(() => {
      return () => {
         if (videoUrl) {
            return () => URL.revokeObjectURL(videoUrl);
         }
      };
   }, [videoUrl]);

   useEffect(() => {
      existingVideoRef.current = undefined;
      setResourceFilesExisting(undefined);
   }, [sectionId]);

   useEffect(() => {
      if (data?.sections?.[0]) {
         resetValues(data?.sections?.[0]);
      } else {
         resetValues({id: uuid(), moduleId});
         setVideo(undefined);
         existingVideoRef.current = undefined;
      }
   }, [data, moduleId, resetValues]);

   useEffect(() => {
      if (
         data?.sections &&
         sectionId !== '' &&
         sectionId !== NEW_EDIT &&
         !isVideoLoading &&
         existingVideoRef.current === undefined
      ) {
         setIsVideoLoading(true);
         (async () => {
            try {
               let key;

               if (!data.sections?.[0]?.video) {
                  const videoResults = await Storage.list(`lms/${sectionId}/video`, {
                     level: 'public',
                  });
                  key = videoResults.results[0].key;
               } else {
                  key = `lms/${sectionId}/video/${data.sections?.[0]?.video}`;
               }
               if (key) {
                  const url = await Storage.get(key, {
                     level: 'public',
                     cacheControl: 'no-cache',
                     validateObjectExistence: true,
                  });
                  existingVideoRef.current = {key, url};
               } else {
                  existingVideoRef.current = null;
               }
            } catch (e) {
               console.log('Error loading video.', e);
               existingVideoRef.current = null;
            } finally {
               setIsVideoLoading(false);
            }
         })();
      }
      // missing sectionId
   }, [data, isVideoLoading, resetValues, sectionId]);

   useEffect(() => {
      if (sectionId !== '' && sectionId !== NEW_EDIT && !isResourceLoading && filesExisting === undefined) {
         setIsResourceLoading(true);
         (async () => {
            const allResourceUrls = [];
            try {
               const resourceResults = await Storage.list(`lms/${sectionId}/resource`, {
                  level: 'public',
               });

               if (resourceResults?.results?.length > 0) {
                  for (const resourceResult of resourceResults.results) {
                     const url = await Storage.get(resourceResult.key, {
                        level: 'public',
                        cacheControl: 'no-cache',
                        expires: 1800,
                     });
                     const name = resourceResult.key.substring(lastIndexOf(resourceResult.key, '/') + 1);
                     allResourceUrls.push({name, url, key: resourceResult.key});
                  }
                  setResourceFilesExisting(allResourceUrls);
                  setResourceFilesOriginal([...allResourceUrls]);
               } else {
                  setResourceFilesExisting([]);
                  setResourceFilesOriginal([]);
               }
            } finally {
               setIsResourceLoading(false);
            }
         })();
      }
      // missing isResourceLoading
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filesExisting, sectionId]);

   const handleClose = useCallback(
      (newSectionId = undefined) => {
         setVideo(undefined);
         setVideoUrl(undefined);
         existingVideoRef.current = undefined;
         setResourceFilesExisting(undefined);
         setResourceFilesOriginal(undefined);
         setResourceFiles(undefined);
         setProgressPercent(undefined);
         setProgressPercentTotal(undefined);
         setIsSaving(false);
         let newSearchObject;
         if (newSectionId) {
            newSearchObject = {...searchObject, sectionId: newSectionId};
         } else {
            newSearchObject = searchObject;
         }
         navigate('..', {replace: true}, newSearchObject, false, true);
      },
      [navigate, searchObject],
   );

   /**
    * Callback when the files are added by dropping them on the drop zone.
    * @param newFiles The new attachment files added.
    * @return {Promise<unknown>}
    */
   const handleVideoChange = (newFiles = []) => {
      return new Promise((resolve) => {
         if (newFiles?.length > 1) {
            console.log('Too many videos allowed', newFiles);
         }
         const newFile = newFiles?.[0];
         if (newFile) {
            setVideoUrl(URL.createObjectURL(newFile));
            setVideo(newFile);
         }
         resolve();
      });
   };
   /**
    * Callback when the files are added by dropping them on the drop zone.
    * @param newFiles The new attachment files added.
    * @return {Promise<unknown>}
    */
   const handleResourceChange = (newFiles = []) => {
      return new Promise((resolve) => {
         newFiles.map((file) =>
            Object.assign(file, {
               blob: URL.createObjectURL(file),
            }),
         );
         setResourceFiles((existing) => [...newFiles, ...(existing || [])]);
         setOpen(true);
         resolve();
      });
   };

   /**
    * Submit the section to the server.
    * @return {Promise<void>}
    */
   const handleSubmit = useCallback(async () => {
      if (isChanged || video || files?.length > 0) {
         let videoFileLocation;

         try {
            setIsSaving(true);
            let totalPercent = isChanged ? 100 : 0;
            totalPercent += video ? (existingVideoRef.current ? 600 : 500) : 0;
            totalPercent += (files?.length || 0) * 100;
            totalPercent +=
               filesExisting?.length < filesOriginal?.length ? (filesOriginal?.length - filesExisting?.length) * 50 : 0;
            let currentPercent = 0;
            setProgressPercent(0);
            setProgressPercentTotal(totalPercent);

            let result;

            if (isChanged || !!video) {
               const variables = {...editValues, fileLocation: '', video: video?.name || undefined};
               result = await sectionCreateUpdate({variables}, {moduleId}, isNew);
               currentPercent += 100;
               setProgressPercent((percent) => percent + 100);
            }
            const useSectionId = result?.data?.section?.id || sectionId;

            if (video) {
               if (existingVideoRef.current) {
                  await Storage.remove(existingVideoRef.current.key, {level: 'public'});
                  currentPercent += 100;
                  setProgressPercent(currentPercent);
               }

               videoFileLocation = `lms/${useSectionId}/video/${video.name}`;

               await Storage.put(videoFileLocation, video, {
                  level: 'public',
                  contentType: video.type,
                  progressCallback: (progress) => {
                     setProgressPercent(currentPercent + (progress.loaded / progress.total) * 500);
                  },
                  errorCallback: (error) => {
                     setErrorState({
                        error: error,
                        errorKey: 'save.error',
                        values: {message: error.message},
                     });
                  },
               });
               currentPercent += 500;
               setProgressPercent(currentPercent);
            }
            if (files?.length > 0 || filesExisting?.length < filesOriginal?.length) {
               const progressCallback = (progress) => {
                  console.log('file percent', currentPercent + (progress.loaded / progress.total) * 100);
                  setProgressPercent(currentPercent + (progress.loaded / progress.total) * 100);
               };

               for (const file of files) {
                  const fileKey = `lms/${useSectionId}/resource/${file.name}`;
                  await Storage.put(fileKey, file, {
                     level: 'public',
                     contentType: file.type,
                     progressCallback,
                     errorCallback: (error) => {
                        console.error('Error while uploading resources.', error);
                        setErrorState({
                           error: error,
                           errorKey: 'save.error',
                           values: {message: error.message},
                        });
                     },
                  });
                  currentPercent += 100;
                  setProgressPercent(currentPercent);
               }
               if (filesExisting?.length < filesOriginal?.length) {
                  const deletedFiles = difference(filesOriginal, filesExisting);
                  for (const deletedFile of deletedFiles) {
                     await Storage.remove(deletedFile.key, {level: 'public'});
                     currentPercent += 50;
                     setProgressPercent(currentPercent);
                  }
               }
            }

            setProgressPercent(totalPercent);

            handleClose(isNew ? editValues.id : undefined);
         } catch (e) {
            //Intentionally left blank
         } finally {
            setIsSaving(false);
         }
      } else {
         handleClose();
      }
   }, [
      isChanged,
      video,
      files,
      sectionId,
      handleClose,
      isNew,
      editValues,
      sectionCreateUpdate,
      setErrorState,
      filesExisting,
      filesOriginal,
      moduleId,
   ]);

   const handleDeleteFile = (fileToDelete) => () => {
      remove(files, (file) => isEqual(file, fileToDelete));
      setResourceFilesExisting([...(files || [])]);
   };

   const handleDeleteExistingFile = (fileToDelete) => () => {
      remove(filesExisting, (file) => isEqual(file, fileToDelete));
      setResourceFilesExisting([...(filesExisting || [])]);
      setIsChanged(true);
   };

   return (
      <Stack flexDirection={'row'} height={'100%'} overflow={'hidden'}>
         {sectionId && defaultValues && (
            <Form onSubmit={handleSubmit} className={classes.formStyle}>
               <Stack flexDirection={'column'} sx={{m: 3}} height={'100%'} overflow={'hidden'}>
                  <Header idTitle='section.single.title' width={'100%'} sx={{ml: 2}} />
                  <ScrollStack>
                     <TypographyFHG variant={'fs24500'} id={'lms.name.label'} />
                     <TextFieldLF
                        key={'name ' + defaultValues.name}
                        name={'name'}
                        autoFocus
                        labelKey={'lms.name.label'}
                        defaultValue={defaultValues?.name}
                        onChange={handleChange}
                        sx={{mb: 2}}
                        required
                     />
                     <TypographyFHG variant={'fs24500'} sx={{mt: 2}} id={'section.video.label'} />
                     <Stack display={'flex'} flexDirection={'column'}>
                        <LoadingValue
                           isLoading={isVideoLoading}
                           sx={{mb: 1, alignSelf: 'center'}}
                           thickness={3}
                           size={20}
                        >
                           {(video || existingVideoRef.current) && (
                              <VideoFHG
                                 id={'' + video?.lastModified + ' ' + existingVideoRef.current?.key}
                                 key={'' + video?.lastModified + ' ' + existingVideoRef.current?.key}
                                 style={{flex: '1 1', maxHeight: 300, borderRadius: BORDER_RADIUS_10}}
                                 url={videoUrl || existingVideoRef.current?.url}
                                 controls
                                 preload={false}
                              />
                           )}
                        </LoadingValue>
                        <StyledDropZone
                           onDrop={handleVideoChange}
                           maxFiles={1}
                           accept={VIDEO_ACCEPT_KNOWLEDGE_CENTER}
                           placeholderKey={'section.video.placeholder'}
                           label={'Video'}
                           sx={{flex: '0 0 auto', mt: video || existingVideoRef.current ? 2 : 0}}
                        />
                     </Stack>
                     <TypographyFHG variant={'fs24500'} sx={{mt: 2}} id={'section.description.label'} />
                     <FormControlLabel
                        labelPlacement={'top'}
                        className={classes.editorLabelStyle}
                        control={
                           <Editor
                              id='sectionEditId'
                              onChange={(value) => {
                                 handleChange(undefined, value, undefined, {description: value}, 'description');
                              }}
                              maxHeight={400}
                              minHeight={280}
                              value={getValue('description')}
                              hasEmojiTool={false}
                              hasImageTool={false}
                           />
                        }
                        label={'Description'}
                     />
                     <TypographyFHG variant={'fs24500'} sx={{mt: 2}} id={'section.resource.label'} />
                     <StyledDropZone
                        onDrop={handleResourceChange}
                        maxFiles={10}
                        placeholderKey={'section.resource.placeholder'}
                        label={'Resources'}
                     />
                     <LoadingValue
                        isLoading={isResourceLoading}
                        thickness={3}
                        size={20}
                        sx={{mb: 1, mt: 1, alignSelf: 'center'}}
                     >
                        {(files?.length > 0 || filesExisting?.length > 0) && (
                           <>
                              <List dense>
                                 <ListItemButton
                                    disableGutters
                                    className={`${classes.primaryLinkStyle} ${open ? 'selected' : ''}`}
                                    component={Button}
                                    variant={open ? 'contained' : undefined}
                                    onClick={() => setOpen((open) => !open)}
                                    style={{width: 'calc(100% - 8px)'}}
                                    color='secondary'
                                 >
                                    <ListItemText
                                       disableTypography
                                       primary={
                                          <Stack display={'flex'} flexDirection={'row'}>
                                             <TypographyFHG
                                                className={`${classes.menuItemText} ${open ? 'selected' : ''}`}
                                                color='secondary'
                                                variant={'h4'}
                                                id={'section.resource.label'}
                                             />
                                             {!open && (
                                                <TypographyFHG
                                                   id={'section.resourceCount.label'}
                                                   values={{
                                                      count: (files?.length || 0) + (filesExisting?.length || 0),
                                                   }}
                                                   sx={{ml: 1}}
                                                />
                                             )}
                                          </Stack>
                                       }
                                    />
                                    {open ? <ExpandLess /> : <ExpandMore />}
                                 </ListItemButton>
                                 <Collapse in={open} className={classes.collapseItem}>
                                    <ScrollStack maxHeight={160}>
                                       {files?.map((file, index) => (
                                          <Stack key={'file' + index} flexDirection={'row'} alignItems={'center'}>
                                             <ListItemButtonPlainFHG
                                                className={classes.fileStyle}
                                                startIcon={<CloudQueue />}
                                                variant={MAIN}
                                                primary={file.name}
                                                disabled={true}
                                                sx={{width: 'fit-content', flex: '0 0 auto'}}
                                                dense
                                             />
                                             <IconButton
                                                className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                onClick={handleDeleteFile(file)}
                                                size={'small'}
                                             >
                                                <img alt='Delete' src={DELETE_ICON} />
                                             </IconButton>
                                          </Stack>
                                       ))}
                                       {filesExisting?.map((resource, index) => (
                                          <Stack
                                             key={'existingFiles' + index}
                                             flexDirection={'row'}
                                             alignItems={'center'}
                                          >
                                             <ListItemButtonPlainFHG
                                                // className={classes.fileStyle}
                                                variant={MAIN}
                                                primary={resource.name}
                                                component='a'
                                                href={resource.url}
                                                target={'_blank'}
                                                rel='noreferrer'
                                                startIcon={<CloudDownloadIcon />}
                                                sx={{width: 'fit-content', flex: '0 0 auto'}}
                                                dense
                                             />
                                             <IconButton
                                                className={`${classes.fadeIn} ${classes.deleteButtonStyle}`}
                                                onClick={handleDeleteExistingFile(resource)}
                                                size={'small'}
                                             >
                                                <img alt='Delete' src={DELETE_ICON} />
                                             </IconButton>
                                          </Stack>
                                       ))}
                                    </ScrollStack>
                                 </Collapse>
                              </List>
                           </>
                        )}
                     </LoadingValue>
                     <TypographyFHG variant={'fs24500'} sx={{mt: 2}} id={'section.transcript.label'} />
                     <TextFieldLF
                        key={'transcript ' + defaultValues.transcript}
                        name={'transcript'}
                        labelKey={'section.transcript.label'}
                        defaultValue={defaultValues?.transcript}
                        onChange={handleChange}
                        sx={{mb: 2}}
                        multiline
                        maxRows={8}
                        minRows={4}
                        required
                     />
                  </ScrollStack>
                  <Stack flexDirection={'row'} width={'100%'} className={classes.buttonPanelStyle}>
                     <ProgressButton
                        isProgress={isSaving}
                        variant='text'
                        loadingIndicator={
                           <CircularProgressWithLabel
                              value={(progressPercent / progressPercentTotal) * 100}
                              size={25}
                              thickness={3}
                              width={64}
                           />
                        }
                        color='primary'
                        type={'submit'}
                        size='large'
                        labelKey='save.label'
                        disabled={isSaving}
                     />
                     {/*)}*/}
                     <ButtonFHG
                        variant='text'
                        size={'large'}
                        labelKey={'cancel.button'}
                        disabled={isSaving}
                        onClick={() => handleClose()}
                     />
                  </Stack>
               </Stack>
            </Form>
         )}
      </Stack>
   );
}
