import {StorageImage} from '@aws-amplify/ui-react-storage';
import {Card} from '@mui/material';
import {Stack} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import {Storage} from 'aws-amplify';
import {lastIndexOf} from 'lodash';
import {useRef} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import React from 'react';
import {useRecoilState} from 'recoil';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import {SECTION_PANEL_MAX_WIDTH} from '../../../Constants';
import {FILE_ICON} from '../../../Constants';
import {PRIMARY_COLOR} from '../../../Constants';
import {SECTION_PATH} from '../../../Constants';
import {ADMIN_PANEL_MAX_WIDTH_NEW_UI} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {COURSE_BY_ID_QUERY} from '../../../data/QueriesGL';
import {getSectionAllCacheQueries} from '../../../data/QueriesGL';
import {SECTIONS_UNMARK_AS_READ} from '../../../data/QueriesGL';
import {SECTIONS_MARK_AS_READ} from '../../../data/QueriesGL';
import {SECTION_BY_ID_QUERY} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import LinkFHG from '../../../fhg/components/LinkFHG';
import {MAIN} from '../../../fhg/components/ListItemButtonFHG';
import ListItemButtonPlainFHG from '../../../fhg/components/ListItemButtonPlainFHG';
import {userStatus} from '../../../fhg/components/security/AuthenticatedUser';
import TypographyFHG from '../../../fhg/components/Typography';
import VideoFHG from '../../../fhg/components/VideoFHG';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import useScrollTrigger from '../../../fhg/hooks/useScrollTrigger';
import ScrollStack from '../../../fhg/ScrollStack';
import {userRoleState} from '../../Main';
import EditIcon from '../gamePlan/EditIcon';
import {autoplayState} from './CourseDetail';

const useStyles = makeStyles(
   (theme) => ({
      fileStyle: {
         '& .MuiTypography-subtitle1': {
            fontSize: `${16 * SCALE_APP}px !important`,
            fontWeight: 700,
         },
         color: theme.palette.primary.main,
         textDecoration: 'underline',
      },
      formStyle: {
         maxHeight: '100%',
         overflow: 'hidden',
         // minHeight: 320,
         width: ADMIN_PANEL_MAX_WIDTH_NEW_UI,
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
            backgroundColor: 'white',
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
            backgroundColor: theme.palette.background.lightGreen,
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
      headerFrameStyle: {
         transition: '0.2s padding ease-out, font-size 0.2s ease-out',
      },
      contentStyle: {
         marginLeft: theme.spacing(6),
         marginRight: theme.spacing(6),
      },
      sectionStyle: {
         borderRadius: BORDER_RADIUS_10,
         backgroundColor: theme.palette.background.paper,
         filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
      },
      imageStyle: {
         borderRadius: BORDER_RADIUS_10,
      },
   }),
   {name: 'SectionStyles'},
);

SectionPanel.propTypes = {};

/**
 * Component for viewing a section.
 * @return {JSX.Element}
 * @constructor
 */
export default function SectionPanel() {
   const [searchObject] = useCustomSearchParams();
   const {sectionId, moduleId, courseId} = searchObject;
   const [filesExisting, setResourceFilesExisting] = useState();
   const [isVideoLoading, setIsVideoLoading] = useState(false);
   const [isResourceLoading, setIsResourceLoading] = useState(false);
   const {isAdmin} = useRecoilValue(userRoleState);
   const classes = useStyles();
   const scrollRef = useRef();
   const trigger = useScrollTrigger({target: scrollRef.current});
   const user = useRecoilValue(userStatus);
   const [{isAutoplay, autoplayNext, isPlaying}, setAutoplayState] = useRecoilState(autoplayState);
   const navigate = useNavigateSearch();

   const [existingVideo, setExistingVideo] = useState();

   const [markAsRead] = useMutationFHG(SECTIONS_MARK_AS_READ, undefined, undefined, false);
   const [unmarkAsRead] = useMutationFHG(SECTIONS_UNMARK_AS_READ, undefined, undefined, false);

   const [data] = useQueryFHG(SECTION_BY_ID_QUERY, {
      variables: {sectionId},
      skip: !validate(sectionId),
   });
   const [{course} = {}] = useQueryFHG(
      COURSE_BY_ID_QUERY,
      {variables: {courseId}, skip: !courseId || courseId === 'undefined'},
      'lms.type',
   );

   useEffect(() => {
      setExistingVideo(undefined);
      setResourceFilesExisting(undefined);
   }, [sectionId]);

   useEffect(() => {
      if (!data?.section) {
         setExistingVideo(undefined);
      }
   }, [data]);

   useEffect(() => {
      if (sectionId && !isVideoLoading && existingVideo === undefined && data) {
         setIsVideoLoading(true);
         (async () => {
            try {
               let key;

               if (data?.section?.video) {
                  key = `lms/${sectionId}/video/${data?.section?.video}`;
               } else {
                  const videoResults = await Storage.list(`lms/${sectionId}/video`, {level: 'public'});
                  key = videoResults?.results?.[0]?.key;
               }

               if (key) {
                  const url = await Storage.get(key, {
                     level: 'public',
                     cacheControl: 'no-cache',
                     validateObjectExistence: true,
                  });
                  setExistingVideo({key, url});
               } else {
                  setExistingVideo(null);
               }
            } catch (e) {
               console.log('Error getting video', e);
               setExistingVideo(null);
            } finally {
               setIsVideoLoading(false);
            }
         })();
      }
   }, [data, existingVideo, isVideoLoading, sectionId]);

   useEffect(() => {
      if (sectionId && !isResourceLoading && filesExisting === undefined) {
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
               } else {
                  setResourceFilesExisting([]);
               }
            } finally {
               setIsResourceLoading(false);
            }
         })();
      }
   }, [data, filesExisting, isResourceLoading, sectionId]);

   /**
    * Toggle mark the section as read or unread by the current user.
    * @return {Promise<void>}
    */
   const handleToggleMarkAsRead = async () => {
      try {
         if (!data?.section?.readByUser) {
            await markAsRead({
               variables: {userId: user?.id, sectionId},
               optimisticResponse: {section_MarkAsRead: true},
               refetchQueries: getSectionAllCacheQueries({moduleId, courseId}),
            });
         } else {
            await unmarkAsRead({
               variables: {userId: user?.id, sectionId},
               optimisticResponse: {section_UnMarkAsRead: true},
               refetchQueries: getSectionAllCacheQueries({moduleId, courseId}),
            });
         }
      } catch (e) {
         console.log(e);
      }
   };

   /**
    * Toggle mark the section as read or unread by the current user.
    * @return {Promise<void>}
    */
   const handleMarkAsRead = async () => {
      try {
         const originallyReadByUser = data?.section?.readByUser;
         if (!originallyReadByUser) {
            await markAsRead({
               variables: {userId: user?.id, sectionId},
               optimisticResponse: {section_MarkAsRead: true},
               refetchQueries: getSectionAllCacheQueries({moduleId}),
            });

            if (isAutoplay && !originallyReadByUser) {
               autoplayNext?.(data?.section);
            }
         } else {
            setAutoplayState((autoPlayState) => ({...autoPlayState, isPlaying: false}));
         }
      } catch (e) {
         console.log(e);
      }
   };

   /**
    * Callack when the user plays the video.
    */
   const handleStartPlaying = () => {
      setAutoplayState((autoPlayState) => ({...autoPlayState, isPlaying: true}));
   };

   if (sectionId && sectionId !== 'new') {
      return (
         <Stack
            className={classes.sectionStyle}
            flexDirection={'column'}
            sx={{width: '100%', maxWidth: SECTION_PANEL_MAX_WIDTH}}
         >
            <VideoFHG
               id={existingVideo?.key}
               key={existingVideo?.key}
               style={{flex: '1 1', maxHeight: 515, borderRadius: BORDER_RADIUS_10}}
               url={existingVideo?.url}
               controls
               onPlay={handleStartPlaying}
               autoplay={isAutoplay && isPlaying && !data?.section?.readByUser}
               onEnded={handleMarkAsRead}
            />
            <ScrollStack innerStackProps={{className: classes.contentStyle, ref: scrollRef}}>
               <Stack
                  flexDirection={'row'}
                  className={classes.headerFrameStyle}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  sx={{pt: trigger ? 2 : 6, position: 'sticky', top: 0, zIndex: 2}}
               >
                  <Stack flexDirection={'row'} gap={2} alignItems={'center'} overflow={'hidden'}>
                     <TypographyFHG
                        variant={trigger ? 'fs24400' : 'fs32400'}
                        style={{textOverflow: 'ellipsis', overflow: 'hidden'}}
                     >
                        {data?.section?.name}
                     </TypographyFHG>
                     {isAdmin && (
                        <IconButton
                           size={trigger ? 'small' : 'large'}
                           component={LinkFHG}
                           to={SECTION_PATH}
                           search={{...searchObject, sectionId}}
                           state={{isEdit: true}}
                        >
                           <EditIcon marginLeft={0} />
                        </IconButton>
                     )}
                  </Stack>
                  <ButtonFHG
                     labelKey={data?.section?.readByUser ? 'section.undone.button' : 'section.done.button'}
                     variant={'outlined'}
                     onClick={handleToggleMarkAsRead}
                  />
               </Stack>
               <TypographyFHG variant={'fs16700'} sx={{ml: 8, mt: 4}}>
                  {/*{data?.section?.description}*/}
                  <p dangerouslySetInnerHTML={{__html: data?.section?.description}} />
               </TypographyFHG>
               {filesExisting?.length > 0 && (
                  <>
                     <TypographyFHG
                        variant={'fs20700'}
                        sx={{ml: 0, mt: 3, position: 'sticky', top: 40, zIndex: 1}}
                        id={'knowledgeCenter.resources'}
                     />
                     {filesExisting?.map((resource, index) => (
                        <Stack key={'existingFiles' + index} flexDirection={'row'} alignItems={'center'}>
                           <ListItemButtonPlainFHG
                              variant={MAIN}
                              className={classes.fileStyle}
                              primary={resource.name}
                              component='a'
                              href={resource.url}
                              target={'_blank'}
                              rel='noreferrer'
                              startIcon={<img alt={'file'} src={FILE_ICON} height={24 * SCALE_APP} />}
                              sx={{width: 'fit-content', flex: '0 0 auto'}}
                              dense
                           />
                        </Stack>
                     ))}
                  </>
               )}
               <TypographyFHG
                  variant={'fs20700'}
                  sx={{mt: 3, position: 'sticky', top: 40, zIndex: 1}}
                  id={'section.transcript.label'}
               />
               <TypographyFHG variant={'fs18400'} sx={{ml: 2, mt: 1, mb: 2}}>
                  {data?.section?.transcript}
               </TypographyFHG>
            </ScrollStack>
         </Stack>
      );
   } else {
      return (
         <Stack flexDirection={'column'} sx={{width: '100%', maxWidth: SECTION_PANEL_MAX_WIDTH}} height={'100%'}>
            {course && (
               <Card
                  className={classes.sectionStyle}
                  // style={{backgroundColor: data?.isActive ? undefined : theme.palette.background.paper}}
               >
                  <StorageImage
                     className={classes.imageStyle}
                     accessLevel={'public'}
                     imgKey={course.imageName ? `lms/course/${courseId}/${course.imageName}` : undefined}
                     alt={course.imageName}
                     style={{width: '100%'}}
                  />
                  <TypographyFHG variant={'h6'} sx={{m: 3}}>
                     {course?.description}
                  </TypographyFHG>
               </Card>
            )}
         </Stack>
      );
   }
}
