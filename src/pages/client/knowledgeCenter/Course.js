import {StorageImage} from '@aws-amplify/ui-react-storage';
import {Link} from '@mui/material';
import {Stack} from '@mui/material';
import {Box, Card} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {makeStyles, useTheme} from '@mui/styles';
import split from 'lodash/split';
import {useMemo} from 'react';
import {memo} from 'react';
import React, {useState} from 'react';
import {useRecoilValue} from 'recoil';
import ProgressBar from '../../../components/ProgressBar';
import {BORDER_RADIUS_10} from '../../../Constants';
import {COURSE_PATH} from '../../../Constants';
import {EDIT_PATH} from '../../../Constants';
import {DELETE_ICON} from '../../../Constants';
import {COURSE_DELETE} from '../../../data/QueriesGL';
import ConfirmIconButton from '../../../fhg/components/ConfirmIconButton';
import LinkFHG from '../../../fhg/components/LinkFHG';
import Loading from '../../../fhg/components/Loading';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import {userRoleState} from '../../Main';
import EditIcon from '../gamePlan/EditIcon';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         display: 'flex',
         flexDirection: 'column',
         height: '100%',
         flex: '1 1',
         paddingTop: 20,
         paddingBottom: 20,
         paddingLeft: 18,
         paddingRight: 18,
         cursor: 'pointer',
         '&:hover': {
            border: '1px solid #85AC5B',
         },
      },
      wrapperImage: {
         width: '100%',
         height: 272.51,
         borderRadius: 10,
         backgroundColor: '#D0D0D0',
         display: 'flex',
         alignSelf: 'center',
         overflow: 'hidden',
      },
      image: {
         width: '100%',
         height: 272.51,
         objectFit: 'cover',
      },
      imageNoneStyle: {
         borderRadius: BORDER_RADIUS_10,
         height: 272.51,
         backgroundColor: '#D0D0D0',
         width: 272.51,
      },
      title: {
         color: theme.palette.text.black,
      },
      progress: {
         paddingTop: 18,
         paddingBottom: 18,
      },
      titleView: {
         paddingTop: 30,
         paddingBottom: 12,
      },
      dragItemStyle: {
         height: '100%',
      },
   };
});

/**
 * Course component
 *
 * @param data
 * @returns {JSX.Element}
 */
function CourseComponent({data}) {
   const [, setSearch] = useCustomSearchParams(true);
   const classes = useStyles();

   const navigate = useNavigateSearch();
   const theme = useTheme();
   const {isSuperAdmin} = useRecoilValue(userRoleState);
   const [isSaving, setIsSaving] = useState(false);

   const [courseDelete] = useMutationFHG(COURSE_DELETE);

   const keywords = useMemo(() => {
      return data?.keywords?.length > 0 ? split(data?.keywords, ', ') : null;
   }, [data?.keywords]);

   /**
    * Delete the course.
    * @param event The event triggering delete.
    */
   const handleDelete = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }

      setIsSaving(true);
      (async () => {
         try {
            await courseDelete({variables: {id: data.id}});
         } finally {
            setIsSaving(false);
         }
      })();
   };

   return (
      <Card
         className={classes.container}
         style={{backgroundColor: data?.isActive ? undefined : theme.palette.background.selectedRow}}
         onClick={() => {
            navigate(COURSE_PATH, undefined, {courseId: data?.id});
         }}
      >
         <Loading isLoading={isSaving} />
         <Box className={classes.wrapperImage}>
            {data?.imageName ? (
               <StorageImage
                  className={classes.image}
                  accessLevel={'public'}
                  imgKey={data?.imageName ? `lms/course/${data.id}/${data.imageName}` : undefined}
                  alt={data?.imageName}
               />
            ) : (
               <Box className={classes.imageNoneStyle} />
            )}
         </Box>
         <Box className={classes.titleView}>
            <TypographyFHG variant='fs24700' component={'span'}>
               {data?.name}
            </TypographyFHG>
            {isSuperAdmin && (
               <Stack
                  sx={{ml: 1}}
                  flexDirection={'row'}
                  alignItems={'center'}
                  width={'fit-content'}
                  display={'inline-flex'}
               >
                  <IconButton
                     size={'small'}
                     component={LinkFHG}
                     onClick={(event) => event.stopPropagation()}
                     to={EDIT_PATH}
                     search={{courseId: data?.id}}
                  >
                     <EditIcon marginLeft={0} />
                  </IconButton>
                  <ConfirmIconButton
                     className={classes.buttonStyle}
                     color={theme.palette.error.dark}
                     messageKey={'confirmRemoveValue.message'}
                     onConfirm={handleDelete}
                     values={{type: 'course', name: data?.name}}
                     size='small'
                     style={{marginLeft: 'auto', marginRight: theme.spacing(4)}}
                     submitStyle={classes.deleteColorStyle}
                     buttonTypographyProps={{variant: 'inherit'}}
                     // disabled={isSaving || isNew}
                  >
                     <img alt='Delete' src={DELETE_ICON} />
                  </ConfirmIconButton>
               </Stack>
            )}
         </Box>
         <Stack flexDirection={'column'}>
            <TypographyFHG variant='fs18400'>{data?.description?.slice(0, 100)}</TypographyFHG>
            {data?.userCompletionPercentBySection > 0 && data?.userCompletionPercentBySection < 100 && (
               <ProgressBar
                  theme={theme}
                  bgcolor='#769548'
                  progress={data?.userCompletionPercentBySection / 100}
                  type={2}
                  sx={{mt: 1}}
               />
            )}
            {data?.userCompletionPercentBySection === 100 && (
               <Box display='flex' alignItems='center' mt={1}>
                  <Box
                     sx={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '7px',
                        backgroundColor: 'primary.green',
                        marginRight: '4px',
                     }}
                  />
                  <TypographyFHG id='knowledgeCenter.complete' variant='fs14400' />
               </Box>
            )}
            <Stack flexDirection={'row'} alignItems={'center'} marginTop={1}>
               {keywords?.map((keyword, index) => (
                  <Box key={'link ' + index}>
                     <Link
                        href='#'
                        underline='always'
                        color={'text.gray'}
                        style={{fontWeight: 600}}
                        onClick={(event) => {
                           event.stopPropagation();
                           event.preventDefault();
                           setSearch((search) => ({...search, search: keyword}));
                        }}
                     >
                        {keyword}
                     </Link>
                     {index + 1 < keywords?.length && <span>,&nbsp;</span>}
                  </Box>
               ))}
            </Stack>
         </Stack>
      </Card>
   );
}

const Course = memo(CourseComponent);
export default Course;
