import Stack from '@mui/material/Stack';
import {makeStyles} from '@mui/styles';
import update from 'immutability-helper';
import localForage from 'localforage';
import {maxBy} from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {matchSorter} from 'match-sorter';
import {useEffect} from 'react';
import {useState} from 'react';
import {useRef} from 'react';
import {useCallback} from 'react';
import React from 'react';
import {COURSE_HEIGHT} from '../../../Constants';
import {COURSE_WIDTH} from '../../../Constants';
import {COURSE_MOVE} from '../../../data/QueriesGL';
import {COURSE_ACTIVE_WHERE_QUERY} from '../../../data/QueriesGL';
import {GRID_LAYOUT} from '../../../fhg/components/list/DragItem';
import DragItem from '../../../fhg/components/list/DragItem';
import Loading from '../../../fhg/components/Loading';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {AddNewCourse} from './AddNewCourse';
import Course from './Course';
import {useRecoilValue} from 'recoil';
import {userRoleState} from '../../Main';
import {useDndScrolling} from 'react-dnd-scrolling';

const useStyles = makeStyles((theme) => {
   return {
      container: {
         display: 'flex',
         flexDirection: 'column',
      },
      title: {
         color: theme.palette.text.black,
      },
      list: {
         display: 'flex',
      },
      fadeArea: {
         '&:hover': {
            opacity: 1,
            transition: '0.3s',
            transitionDelay: '0.1s',
         },
         width: 'fit-content',
      },
      fadeIn: {
         opacity: 0,
      },
      dragItemStyle: {
         width: COURSE_WIDTH,
         height: COURSE_HEIGHT,
         maxWidth: COURSE_WIDTH,
         minWidth: COURSE_WIDTH,
      },
   };
});
/**
 * List my courses component
 *
 * @returns {JSX.Element}
 */
export const MyCourses = () => {
   const [{search}] = useCustomSearchParams();
   const classes = useStyles();
   const {isSuperAdmin} = useRecoilValue(userRoleState);

   const [refresh, setRefresh] = useState(Date.now());
   const [isMoved, setIsMoved] = useState(false);

   const coursesRef = useRef([]);
   const coursesOrderIndexRef = useRef();
   const coursesScrollingRef = useRef();
   useDndScrolling(coursesScrollingRef);

   const variables = isSuperAdmin
      ? {sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]}
      : {isActive: true, sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]};
   const [courseData = {}, {loading}] = useQueryFHG(COURSE_ACTIVE_WHERE_QUERY, {
      variables,
      fetchPolicy: 'cache-and-network',
   });

   const [courseMove] = useMutationFHG(COURSE_MOVE, undefined, undefined, false);

   useEffect(() => {
      return () => {
         (async () => {
            await localForage.clear();
         })();
      };
   }, []);

   useEffect(() => {
      // During the move this effect is sometimes triggered resetting the order of the courses. Wait for all refreshes before listening again.
      if (!isMoved) {
         coursesRef.current = cloneDeep(courseData?.courses || []);

         if (search) {
            coursesRef.current = matchSorter(coursesRef.current, search, {
               keys: ['name', 'keywords', 'description'],
            });
         }
         coursesOrderIndexRef.current =
            maxBy(coursesRef.current, (course) => {
               return course?.orderIndex || 0;
            })?.orderIndex + 1;
         setRefresh(Date.now());
      }
   }, [courseData, isMoved, search]);

   const move = useCallback((dragIndex, hoverIndex) => {
      const courses = [...(coursesRef.current || [])];

      coursesRef.current = update(courses, {
         $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, courses[dragIndex]],
         ],
      });

      setRefresh(Date.now());
      setIsMoved(true);

      return coursesRef.current;
   }, []);

   const handleSubmit = ({dropItem: course, index}, orderIndex) => {
      course.orderIndex = orderIndex;
      (async () => {
         await courseMove({variables: {id: course.id, orderIndex}});
      })();
   };

   usePageTitle({titleKey: 'lms.title', type: 'lms'});
   return (
      <Stack flexDirection={'column'} flex={'1 1'} overflow={'auto'}>
         {loading ? (
            <Loading isLoading={loading} />
         ) : (
            <Stack
               ref={coursesScrollingRef}
               key={refresh}
               dispay={'flex'}
               flexWrap={'wrap'}
               flexDirection={'row'}
               columnGap={{xs: 2, sm: 4, md: 7}}
               rowGap={{xs: 3, sm: 5, md: 7, lg: 9}}
            >
               {coursesRef.current?.map((course, index) => (
                  <DragItem
                     key={'dragItem ' + course?.id}
                     index={index}
                     className={classes.dragItemStyle}
                     move={move}
                     dropItem={course}
                     onDrop={handleSubmit}
                     showDragIndicator={isSuperAdmin && move}
                     disable={!isSuperAdmin || !move}
                     layout={GRID_LAYOUT}
                  >
                     <Course data={course} />
                  </DragItem>
               ))}
               {isSuperAdmin && <AddNewCourse orderIndex={coursesOrderIndexRef.current} />}
            </Stack>
         )}
      </Stack>
   );
};
