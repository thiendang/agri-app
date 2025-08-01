import {StorageImage} from '@aws-amplify/ui-react-storage';
import {TextField} from '@mui/material';
import {Chip} from '@mui/material';
import {Autocomplete} from '@mui/material';
import {StyledEngineProvider} from '@mui/material';
import {Stack} from '@mui/material';
import {Box} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import {Storage} from 'aws-amplify';
import {join} from 'lodash';
import {startsWith} from 'lodash';
import map from 'lodash/map';
import split from 'lodash/split';
import {useEffect} from 'react';
import {useCallback} from 'react';
import {useState} from 'react';
import React from 'react';
import {useSetRecoilState} from 'recoil';
import {validate} from 'uuid';
import {v4 as uuid} from 'uuid';
import TextFieldLF from '../../../components/TextFieldLF';
import ThemeProvider from '../../../components/ThemeProvider';
import {IMAGE_ACCEPT_COURSE} from '../../../Constants';
import {NEW_EDIT} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';
import {MEMBERSHIP_ALL_QUERY} from '../../../data/QueriesGL';
import {COURSE_ACTIVE_WHERE_QUERY} from '../../../data/QueriesGL';
import {COURSE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {COURSE_BY_ID_QUERY} from '../../../data/QueriesGL';
import CheckboxFHG from '../../../fhg/components/CheckboxFHG';
import ModalDialog from '../../../fhg/components/dialog/ModalDialog';
import AutocompleteMatchLXData from '../../../fhg/components/edit/AutocompleteMatchLXData';
import useEditData from '../../../fhg/components/edit/useEditData';
import Loading from '../../../fhg/components/Loading';
import StyledDropZone from '../../../fhg/components/StyledDropZone';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationLxFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import {removeEmptyItem} from '../../../fhg/utils/Utils';
import {errorState} from '../../Main';
import {S3_URL} from './AddNewCourse';

const SCALE = 1;

const useStyles = makeStyles(
   (theme) => {
      return {
         container: {
            width: '100%',
            height: 439,
            border: `1px ${theme.palette.text.green} solid`,
            borderRadius: 20,
         },
         icon: {
            width: 24,
            height: 24,
            marginRight: 12,
         },
         center: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
         },
         modalContainer: {
            display: 'flex',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
         },
         modalContent: {
            width: 555,
            backgroundColor: 'white',
            padding: 19,
            borderRadius: 5,
         },
         header: {
            display: 'flex',
            justifyContent: 'space-between',
         },

         select: {
            width: '100%',
         },
         addImage: {
            width: 238,
            height: 134,
            backgroundColor: '#E1E1E1',
            borderRadius: BORDER_RADIUS_10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
         },
         image: {
            width: 238,
            height: 134,
            objectFit: 'cover',
            borderRadius: BORDER_RADIUS_10,
         },
         addButton: {
            display: 'flex',
            alignItems: 'center',
         },
         submitView: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
         },
      };
   },
   {name: 'CourseEditStyles'},
);

/**
 * Component to edit or add a course.
 * @param open Indicates if the dialog should be open.
 * @param keywordsList The list of keywords used across all courses.
 * @param closeUrl The URL to use to close the modal.
 * @return {Element}
 * @constructor
 */
export default function CourseEdit({open, closeUrl = '..'}) {
   const [{courseId: courseIdParam, orderIndex}] = useCustomSearchParams();
   const courseId = courseIdParam === NEW_EDIT ? undefined : courseIdParam;
   const classes = useStyles();

   const [courseListData = {}] = useQueryFHG(COURSE_ACTIVE_WHERE_QUERY);
   const [{memberships = []} = {}] = useQueryFHG(MEMBERSHIP_ALL_QUERY);
   const [editValues, handleChange, {handleAutocompleteChange, resetValues, isChanged, defaultValues, currentValues}] =
      useEditData();
   const setErrorState = useSetRecoilState(errorState);

   const [keywords, setKeywords] = useState([]);

   const [keywordsList, setKeywordsList] = useState([]);

   const [preview, setPreview] = useState();
   const [loading, setLoading] = useState(true);
   const [file, setFile] = useState(null);
   const [existingFile, setExistingFile] = useState(null);
   const [width, setWidth] = useState();
   const [height, setHeight] = useState();
   const [progressPercent, setProgressPercent] = useState();

   const navigate = useNavigateSearch(true);
   const skipFetch = !courseId || courseId === 'undefined' || courseId === 'new' || !validate(courseId);

   const [courseData] = useQueryFHG(
      COURSE_BY_ID_QUERY,
      {
         variables: {courseId: courseId},
         skip: skipFetch,
      }, //!courseId || courseId === 'undefined' || !validate(courseId)}},
      'lms.type',
   );
   const [createUpdateCourse] = useMutationLxFHG(COURSE_CREATE_UPDATE, undefined, undefined, undefined, true);

   useEffect(() => {
      if (courseListData.courses) {
         let keywordItems = map(courseListData.courses, 'keywords');
         keywordItems = removeEmptyItem(keywordItems);

         const splitKeywords = join(keywordItems, ', ');
         setKeywordsList(split(splitKeywords, ', '));
      }
   }, [courseListData]);

   useEffect(() => {
      // free memory when ever this component is unmounted
      return () => URL.revokeObjectURL(preview);
   }, [preview]);

   useEffect(() => {
      if (courseData) {
         resetValues(courseData?.course);

         if (courseData?.course?.keywords) {
            setKeywords(split(courseData?.course?.keywords, ', '));
         }

         setExistingFile(courseData?.course?.imageName);
         setLoading(false);
      } else if (skipFetch) {
         setLoading(false);
      }
   }, [courseData, courseId, resetValues]);

   const handleClose = useCallback(() => {
      navigate(closeUrl, {replace: true}, {courseId: null, orderIndex: null});
   }, [closeUrl, navigate]);

   const handleImageUpload = async (newFiles = []) => {
      const image = newFiles[0];
      if (!image) return;

      const imageObject = new Image();
      imageObject.onload = function () {
         setHeight(imageObject.height);
         setWidth(imageObject.width);
      };
      setFile(image);
      const url = URL.createObjectURL(image);
      imageObject.src = url;
      setPreview(url);
   };

   const handleUploadFile = useCallback(
      async (file, courseId) => {
         if (!file) return {};
         let upload = null;
         try {
            if (typeof file !== 'undefined' && file) {
               if (courseData?.course && !startsWith(courseData?.course?.imagePath, S3_URL)) {
                  await Storage.remove(courseData.course.imagePath, {level: 'public'});
               }
               const insertKey = `lms/course/${courseId}/${file.name}`;
               await Storage.put(insertKey, file, {
                  level: 'public',
                  contentType: file.type,
                  progressCallback: (progress) => {
                     setProgressPercent(progress.loaded / progress.total);
                  },
                  completeCallback: (event) => {
                     setProgressPercent(100);
                  },
                  errorCallback: (error) => {
                     setErrorState({
                        error,
                        errorKey: 'save.error',
                        values: {message: error.message},
                     });
                  },
               });
               return {imageUrl: insertKey, fileName: file.name};
            }
         } catch (err) {
            Storage.cancel(upload);
            return {imageUrl: null, fileName: null};
         }
      },
      [courseData?.course, setErrorState],
   );

   const handleSubmit = useCallback(async () => {
      if (!isChanged && !file) return;
      setLoading(true);
      try {
         const isNew = !courseId || courseId === NEW_EDIT;
         const useCourseId = isNew ? uuid() : courseId;
         const {fileName: imageName} = await handleUploadFile(file, useCourseId);

         if (editValues.membershipIdList === null) {
            editValues.membershipIdList = [];
         }
         const variables = {id: useCourseId, ...editValues, orderIndex, imageName};
         // Default to isActive if not set.
         if (isNew && editValues?.isActive !== undefined) {
            variables.isActive = true;
         }

         if (currentValues?.keywords?.length > 0) {
            variables.keywords = join(editValues?.keywords, ', ');
         } else {
            variables.keywords = '';
         }

         await createUpdateCourse({variables}, undefined, isNew);
         handleClose();
      } catch (error) {
         console.log('CourseEdit could not save', error);
      } finally {
         setLoading(false);
      }
   }, [
      isChanged,
      courseId,
      handleUploadFile,
      file,
      createUpdateCourse,
      editValues,
      defaultValues?.keywords,
      orderIndex,
      handleClose,
   ]);

   return (
      <StyledEngineProvider injectFirst>
         <ThemeProvider scale={SCALE}>
            <ModalDialog
               open={open}
               onClose={handleClose}
               titleKey={courseId ? 'lms.edit.course' : 'knowledgeCenter.addNewCourse'}
               submitKey={'save.label'}
               maxWidth={'sm'}
               fullWidth={true}
               onSubmit={handleSubmit}
               isEnabled={(isChanged || !!file) && !loading}
               isForm
               buttons={
                  <Box marginLeft={1} marginRight={'auto'}>
                     <CheckboxFHG
                        key={'isActive' + defaultValues?.id}
                        name={'isActive'}
                        checked={currentValues?.isActive}
                        onChange={handleChange}
                        color={'default'}
                        label={'Active'}
                        marginTop={0}
                        marginLeft={0}
                        sx={{mr: 'auto'}}
                     />
                  </Box>
               }
               progressPercent={progressPercent}
            >
               <Loading isLoading={loading} />
               <Grid container rowGap={1} margin={'1px'}>
                  <TextFieldLF
                     key={'name' + defaultValues?.id}
                     name={'name'}
                     labelKey={'course.name.label'}
                     defaultValue={defaultValues.name}
                     onChange={handleChange}
                     className={classes.input2}
                     placeholderKey='knowledgeCenter.courseName'
                     fullWidth
                     scale={SCALE}
                     autoFocus
                     required
                  />
                  <TextFieldLF
                     key={'description' + defaultValues?.id}
                     name={'description'}
                     labelKey={'course.description.label'}
                     defaultValue={defaultValues.description}
                     onChange={handleChange}
                     placeholderKey='knowledgeCenter.courseDescription'
                     multiline
                     maxRows={8}
                     minRows={4}
                     required
                     fullWidth
                     scale={SCALE}
                  />
                  <Autocomplete
                     key={'keywords' + defaultValues?.id}
                     name={'keywords'}
                     multiple
                     options={keywordsList}
                     onChange={handleAutocompleteChange('keywords')}
                     defaultValue={keywords}
                     freeSolo
                     fullWidth
                     renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                           <Chip color='primary' variant='filled' label={option} {...getTagProps({index})} />
                        ))
                     }
                     renderInput={(params) => (
                        <TextField
                           name={'keywords'}
                           {...params}
                           variant='outlined'
                           label='Keywords'
                           placeholder='Keywords'
                        />
                     )}
                  />

                  <AutocompleteMatchLXData
                     key={'membershipIdList'}
                     name={'membershipIdList'}
                     defaultValue={defaultValues.membershipIdList}
                     options={memberships}
                     disableClearable={false}
                     onChange={handleChange}
                     matchSorterProps={{keys: ['name']}}
                     labelKey={'knowledgeCenter.select.label'}
                     layout={{xs: 12}}
                     required
                     multiple
                  />
                  <Stack display='flex' flexDirection='row' sx={{mt: 2}} width={'100%'}>
                     {preview ? (
                        <Box className={classes.addImage}>
                           <img alt='preview' src={preview} className={classes.image} />
                        </Box>
                     ) : courseData?.course?.imageName ? (
                        <StorageImage
                           className={classes.image}
                           accessLevel={'public'}
                           imgKey={
                              courseData?.course?.imageName
                                 ? `lms/course/${courseData?.course.id}/${courseData?.course.imageName}`
                                 : undefined
                           }
                           alt={courseData?.course?.imageName}
                        />
                     ) : (
                        <StyledDropZone
                           onDrop={handleImageUpload}
                           maxFiles={1}
                           placeholderKey={'knowledgeCenter.addPhoto'}
                           label={'Photo'}
                           accept={IMAGE_ACCEPT_COURSE}
                        />
                     )}
                     <Box display='flex' flexDirection='column' sx={{ml: 2}}>
                        <TypographyFHG variant='fs18400' color='text.black'>
                           {file?.name || existingFile || ''}
                        </TypographyFHG>
                        {width && height && (
                           <TypographyFHG variant='fs16400' color='text.primary'>
                              {`${width} X ${height}`}
                           </TypographyFHG>
                        )}
                        {preview ||
                           (courseData?.course?.imageName && (
                              <StyledDropZone
                                 onDrop={handleImageUpload}
                                 maxFiles={1}
                                 placeholderKey={'knowledgeCenter.changePhoto'}
                                 label={'Photo'}
                                 sx={{mt: 1, width: 168}}
                                 accept={IMAGE_ACCEPT_COURSE}
                              />
                           ))}
                     </Box>
                  </Stack>
               </Grid>
            </ModalDialog>
         </ThemeProvider>
      </StyledEngineProvider>
   );
}
