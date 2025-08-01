import {AddCircleOutline} from '@mui/icons-material';
import {KeyboardArrowRight} from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {Switch} from '@mui/material';
import {FormControlLabel} from '@mui/material';
import {Box, Card} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import makeStyles from '@mui/styles/makeStyles';
import {Storage} from 'aws-amplify';
import update from 'immutability-helper';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import {useRef} from 'react';
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {useOutlet} from 'react-router-dom';
import {useRecoilState} from 'recoil';
import {atom} from 'recoil';
import {useRecoilValue} from 'recoil';
import {validate} from 'uuid';
import DeleteEditButtons from '../../../components/DeleteEditButtons';
import Header from '../../../components/Header';
import {SECTION_PANEL_MIN_WIDTH} from '../../../Constants';
import {BORDER_RADIUS_10} from '../../../Constants';
import {NEW_EDIT} from '../../../Constants';
import {SECTION_PATH} from '../../../Constants';
import {SECTION_PANEL_MAX_WIDTH} from '../../../Constants';
import {SCALE_APP} from '../../../Constants';
import {SECTION_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {COURSE_SHORT_BY_ID_QUERY} from '../../../data/QueriesGL';
import {MODULES_ALL_WHERE_QUERY} from '../../../data/QueriesGL';
import {SECTION_CREATE_UPDATE} from '../../../data/QueriesGL';
import {MODULE_CREATE_UPDATE} from '../../../data/QueriesGL';
import {SECTION_DELETE} from '../../../data/QueriesGL';
import {MODULE_DELETE} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import DragItem from '../../../fhg/components/list/DragItem';
import Loading from '../../../fhg/components/Loading';
import TypographyFHG from '../../../fhg/components/Typography';
import useMutationFHG from '../../../fhg/hooks/data/useMutationFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import {userRoleState} from '../../Main';
import ModuleEdit from './ModuleEdit';

export const autoplayState = atom({
   key: 'autoplayState',
   default: {isAutoplay: localStorage.autoplayModule === 'true', isPlaying: false, autoplayNext: () => {}},
});

const SECTION_ITEM = 'section';
const MODULE_ITEM = 'module';

const useStyles = makeStyles(
   (theme) => ({
      infoRootStyle: {
         color: 'black !important',
      },
      listRoot: {
         width: '100%',
         maxHeight: `calc(100% - ${theme.spacing(5)})`,
         overflowY: 'auto',
         display: 'flex',
         flexDirection: 'column',
         padding: 4,
      },
      listRootHeading: {
         fontWeight: '500',
         fontSize: '20px',
         color: 'black !important',
         backgroundColor: theme.palette.background.default,
         paddingLeft: '0',
         paddingRight: 0,
      },
      nestedListHeading: {
         color: `${theme.palette.secondary.tertiary} !important`,
         fontWeight: '500 !important',
         paddingLeft: theme.spacing(5),
         width: '90%',
         borderRadius: ' 0 20px 20px 0',
         paddingTop: '3px',
         '&:hover': {
            background: 'rgba(249,234,162,0.3)',
         },
         '& .MuiListItemText-root': {
            maxWidth: 'calc(100% - 51px)',
         },
      },
      selectedSection: {
         background: 'rgba(249,234,162,0.7)',
      },
      nested: {
         paddingLeft: theme.spacing(8),
      },
      infoInnerSidebarStyle: {
         height: 'fit-content',
         maxWidth: '33%',
      },
      infoInnerVideoStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)})`,
         margin: theme.spacing(2, 0),
         height: '99vh',
         overflowY: 'auto',
         width: '70%',
      },
      maindiv: {
         padding: theme.spacing(0, 2),
      },
      pdfCursor: {
         color: 'rgb(62 81 200) !important',
         cursor: 'pointer',
         wordBreak: 'break-all',
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      hoverSection: {
         background: '#f9eaa2',
         width: '90%',
         color: 'black !important',
         borderRadius: '0 20px 20px 0',
         paddingTop: '3px',
      },
      buttonBack: {
         display: 'flex',
         alignItems: 'center',
         cursor: 'pointer',
      },
      iconBack: {
         width: 24,
         height: 20,
         marginRight: 12,
      },
      module: {
         display: 'flex',
         alignItems: 'center',
         padding: `${25 * SCALE_APP}px`,
         justifyContent: 'space-between',
         overflow: 'hidden',
      },
      buttonMark: {
         borderRadius: BORDER_RADIUS_10,
         borderWidth: 2,
      },
      fadeArea: {
         width: '100%',
         cursor: 'default',
         overflow: 'hidden',
         '&:hover $fadeIn': {
            opacity: 1,
            transition: '1s',
            transitionDelay: '0.2s',
         },
      },
      fadeIn: {
         opacity: 0,
         marginTop: 'auto',
         marginBottom: 'auto',
      },
      cardStyle: {
         filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
      },
   }),
   {name: 'CourseDetailStyle'},
);

/**
 * Course detail component
 *
 * @returns {JSX.Element}
 */

export default function CourseDetail() {
   const [{courseId, sectionId, moduleId}, setSearch] = useCustomSearchParams(true);

   const classes = useStyles();
   const navigate = useNavigateSearch(true);
   const outletElement = useOutlet();
   const {isSuperAdmin} = useRecoilValue(userRoleState);
   const [refresh, setRefresh] = useState(Date.now());
   const [refreshSection, setRefreshSection] = useState(Date.now());
   const [{isAutoplay}, setIsAutoplay] = useRecoilState(autoplayState);

   const [moduleCreateUpdate] = useMutationFHG(MODULE_CREATE_UPDATE, undefined, undefined, undefined, true);
   const [moduleDelete] = useMutationFHG(MODULE_DELETE);
   const [sectionCreateUpdate] = useMutationFHG(SECTION_CREATE_UPDATE);
   const [sectionDelete] = useMutationFHG(SECTION_DELETE);
   const isCollapsingModuleRef = useRef(false);

   const [{course} = {}] = useQueryFHG(
      COURSE_SHORT_BY_ID_QUERY,
      {variables: {courseId}, skip: !courseId || courseId === 'undefined'},
      'lms.type',
   );
   const [{modules: moduleList} = {}] = useQueryFHG(
      MODULES_ALL_WHERE_QUERY,
      {
         variables: {courseId, sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]},
         skip: !courseId || courseId === 'undefined',
         fetchPolicy: 'cache-and-network',
      },
      'module.type',
   );
   const [sectionData] = useQueryFHG(
      SECTION_ALL_WHERE_QUERY,
      {
         variables: {moduleId, sortOrder: {direction: 'ASC', fieldName: 'orderIndex'}},
         skip: !validate(moduleId),
         fetchPolicy: 'cache-and-network',
      },
      'section.type',
   );

   const [loading, setLoading] = React.useState(false);
   const [moduleReordered, setModuleReordered] = useState(false);
   const [sectionReordered, setSectionReordered] = useState(false);

   const sortedModulesRef = useRef();
   const sectionsRef = useRef();

   const [isSaving, setIsSaving] = useState(false);
   const [isEditingModule, setIsEditingModule] = useState();
   const [moduleSelected, setModuleSelected] = useState();
   const [sectionIndex, setSectionIndex] = useState();

   usePageTitle({titleKey: 'lms.title2.label', values: {name: course?.name}});

   /**
    * If autoplay is on, play the next section.
    * @type {(function(*): void)|*}
    */
   const autoplayNext = useCallback(
      (section) => {
         if (isAutoplay && section) {
            const currentIndex = findIndex(sectionsRef.current, {id: section.id});
            if (currentIndex >= 0) {
               if (
                  currentIndex + 1 < sectionsRef.current?.length &&
                  !sectionsRef.current?.[currentIndex + 1]?.readByUser
               ) {
                  setSectionIndex(currentIndex + 1);
                  setSearch((search) => {
                     return {...(search || {}), sectionId: sectionsRef.current?.[currentIndex + 1]?.id};
                  });
               }
            }
         }
      },
      [isAutoplay, setSearch],
   );

   /**
    * Set/Unset the autoplayNext function for this component.
    */
   useEffect(() => {
      setIsAutoplay((autoplayState) => ({...autoplayState, autoplayNext}));

      return () => {
         setIsAutoplay((autoplayState) => ({...autoplayState, autoplayNext: () => {}}));
      };
   }, [autoplayNext, setIsAutoplay]);

   // Set the sections list for dragging. Prevent updating during the reordering (dragging) because the sections are
   // actively being changed during drag. Also moves to the next section if the autoplay.
   useEffect(() => {
      if (!sectionReordered) {
         sectionsRef.current = [...(sectionData?.sections || [])];
         setRefreshSection(Date.now());
      }
   }, [sectionData?.sections, sectionReordered, sectionIndex]);

   // Select the module clicked. Add moduleId to the search params and remove the sectionId from the previous module.
   const handleClick = useCallback(
      (module) => {
         const useModuleId = moduleId === module.id ? null : module.id;
         setModuleSelected(module);
         isCollapsingModuleRef.current = true;
         setSectionReordered(false);
         setSectionIndex(undefined);
         setSearch((params) => ({
            ...params,
            sectionId: null,
            moduleId: useModuleId,
         }));
      },
      [setSearch, moduleId],
   );

   // After the list of modules has been set, turn of loading.
   useEffect(() => {
      if (sortedModulesRef?.current) {
         setLoading(false);
      }
   }, [sortedModulesRef?.current]);

   //If a module and section are selected, but the moduleId is not in the list of modules, then the course has changed
   // and remove the module and section search params.
   useEffect(() => {
      if (sectionId && moduleId && sortedModulesRef?.current?.length > 0) {
         const idxModule = sortedModulesRef.current.findIndex((item) => item.id === moduleId);

         if (idxModule === -1) {
            setSectionIndex(undefined);
            setSearch((params) => ({...params, sectionId: null, moduleId: null}));
         }
      }
   }, [moduleId, sectionId, setSearch]);

   //Set up the list of modules for dragging and the selected module.
   useEffect(() => {
      setLoading(true);
      // If there is a module list and hasn't be dragge, set the selected module and copy the module list.
      if (moduleList && !moduleReordered) {
         if (!moduleId && isEditingModule === undefined) {
            setModuleSelected(null);
         } else {
            if (!moduleSelected || moduleSelected.id !== moduleId) {
               const useModule = find(moduleList, {id: moduleId});
               setModuleSelected(useModule);
            }
         }
         sortedModulesRef.current = moduleList;
         setLoading(false);
         // If the user has dragged the module list, we
      } else if (moduleReordered) {
         setLoading(false);
      } else if (!moduleList && !moduleReordered && sortedModulesRef.current?.length > 0) {
         sortedModulesRef.current = [];
         setLoading(false);
      } else if (moduleSelected) {
         setLoading(false);
      }
   }, [moduleReordered, moduleList, moduleId, moduleSelected, isEditingModule]);

   /**
    * Get the list of modules to be displayed. Add the module selected if a new module is being edited.
    * @type {*[]}
    */
   const modules = useMemo(() => {
      //Force refresh since updating with a ref doesn't force the update.
      setRefresh(Date.now());
      // If editing a module and the module is new (i.e. no ID).
      return isEditingModule === undefined || moduleSelected?.id !== undefined
         ? sortedModulesRef.current
         : // Add in the new module.
           [...sortedModulesRef.current, moduleSelected];

      // the memo needs to update when sortedModulesRef changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sortedModulesRef.current, moduleSelected, isEditingModule]);

   // If not module is selected, select the first unread module. Don't set to the next module for super admin because
   // they won't be able to drag modules and sections.
   useEffect(() => {
      // Only redirect to the first unread module when the user isn't collapsing the modules.
      if (!isCollapsingModuleRef.current) {
         if (modules?.length > 0 && !moduleId && !isSuperAdmin) {
            const firstUnreadModule = find(modules, (module) => !module.readByUser);
            let firstModuleId = firstUnreadModule ? firstUnreadModule?.id : modules?.[0]?.id;
            setSectionIndex(undefined);
            setSearch((search) => ({...(search || {}), moduleId: firstModuleId, sectionId: null}));
         }
      } else {
         isCollapsingModuleRef.current = false;
      }
   }, [isSuperAdmin, moduleId, modules, setSearch]);

   // If a section isn't selected, select the first unread section.
   useEffect(() => {
      if (sectionData?.sections?.length > 0) {
         if (!sectionId) {
            const firstUnreadSectionIndex = findIndex(sectionData?.sections, (section) => !section.readByUser);

            const sectionIndex = firstUnreadSectionIndex >= 0 ? firstUnreadSectionIndex : 0;
            let firstSectionId = sectionData?.sections[sectionIndex]?.id;
            setSectionIndex(sectionIndex);
            setSearch((search) => ({...(search || {}), sectionId: firstSectionId}));
         } else {
            const sectionIndex = findIndex(sectionData?.sections, {id: sectionId});

            if (sectionIndex >= 0) {
               setSectionIndex(sectionIndex);
            } else if (sectionId !== NEW_EDIT) {
               setSearch((search) => ({...(search || {}), sectionId: null}));
            }
         }
      }
   }, [sectionData?.sections, sectionId, setSearch]);

   /**
    * Deletes a module.
    * @param module The module to delete.
    * @return {(function(): Promise<void>)|*}
    */
   const handleModuleDelete = (module) => async () => {
      setModuleReordered(false);
      if (module?.id) {
         await moduleDelete(
            {variables: {id: module?.id}},
            {courseId, sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]},
         );
      } else {
         setIsEditingModule(undefined);
      }
      setSearch((params) => ({...params, moduleId: null, sectionId: null}));
      setLoading(false);
   };

   /**
    * Edit the module.
    *
    * @param module the module to edit.
    * @param index the index of the module
    * @return {(function(): Promise<void>)|*}
    */
   const handleEditModule = (module, index) => async (event) => {
      event.stopPropagation();
      event.preventDefault();

      setIsEditingModule(index);
      setModuleSelected(module);
      setSearch((search) => ({...search, moduleId: module?.id}), {replace: true});
      setModuleReordered(false);
   };

   /**
    * Delete a section.
    *
    * @param section The section to delete.
    * @return {(function(): Promise<void>)|*}
    */
   const handleSectionDelete = (section) => async () => {
      if (section) {
         if (section.video) {
            await Storage.remove(`lms/${section.id}/video/${section.video}`, {level: 'public'});
         }
         await sectionDelete({variables: {id: section.id}}, {moduleId});
         setSearch((params) => ({...params, sectionId: null}));
         setSectionReordered(false);
      }
   };

   /**
    * Edit a section.
    * @param section The section to edit.
    * @return {(function(*): Promise<void>)|*}
    */
   const handleSectionEdit = (section) => async (event) => {
      event?.stopPropagation();
      event?.preventDefault();
      setSectionReordered(false);

      await navigate(SECTION_PATH, {replace: true, state: {isEdit: true}}, {sectionId: section?.id});
   };

   /**
    * Move the module to a new position in the list of modules.
    * @param dragIndex - the location where the module started.
    * @param hoverIndex - the location where the module has been moved to.
    * @type {function(*, *): undefined}
    */
   const move = useCallback(
      (dragIndex, hoverIndex) => {
         const modules = [...(sortedModulesRef.current || [])];
         sortedModulesRef.current = update(modules, {
            $splice: [
               [dragIndex, 1],
               [hoverIndex, 0, modules[dragIndex]],
            ],
         });
         setRefresh(Date.now());
         setModuleReordered(true);

         return sortedModulesRef.current;
      },
      // the callback needs to update when sortedModulesRef changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sortedModulesRef.current],
   );

   /**
    * Move the section to a new position in the list of sections.
    * @param dragIndex - the location where the section started.
    * @param hoverIndex - the location where the section has been moved to.
    * @type {function(*, *): undefined}
    */
   const moveSection = useCallback(
      (dragIndex, hoverIndex) => {
         const sections = [...(sectionsRef.current || [])];
         sectionsRef.current = update(sections, {
            $splice: [
               [dragIndex, 1],
               [hoverIndex, 0, sections[dragIndex]],
            ],
         });
         setSectionReordered(true);
         setRefreshSection(Date.now());

         return sectionsRef.current;
      },
      // the callback needs to update when sectionsRec changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sectionsRef.current],
   );

   /**
    * Create a new module.
    */
   const handleNewModule = () => {
      setIsEditingModule(modules?.length);
      setModuleSelected({name: '', courseId, sections: [], orderIndex: modules?.length});
      setSearch((search) => ({...(search || {}), moduleId: null, sectionId: null}));
   };

   /**
    * Create a new section.
    * @param module The module the section is being created in.
    * @return {(function(): void)|*}
    */
   const handleAddSection = (module) => () => {
      navigate(SECTION_PATH, {replace: true, state: {isEdit: true}}, {moduleId: module.id, sectionId: NEW_EDIT});
   };

   /**
    * Close the module edit.
    */
   const handleCloseModuleEdit = (event) => {
      event?.stopPropagation?.();
      event?.preventDefault?.();
      setIsEditingModule(undefined);
   };

   /**
    * Submit the section changes to the server from a drag.
    * @param section The section with the changed location (i.e. index).
    * @param index The original index of the section.
    * @param orderIndex The new index of the section.
    */
   const handleSectionSubmit = ({dropItem: section, index}, orderIndex) => {
      (async () => {
         try {
            setIsSaving(true);
            await sectionCreateUpdate({variables: {id: section.id, orderIndex}});
         } finally {
            setIsSaving(false);
         }
      })();
   };

   /**
    * Submit the module changes to the server from a drag.
    *
    * @param module the module with the changed location (i.e. index).
    * @param index the original index of the module.
    * @param orderIndex the new index of the module.
    */
   const handleModuleSubmit = ({dropItem: module, index}, orderIndex) => {
      (async () => {
         try {
            setIsSaving(true);
            await moduleCreateUpdate(
               {variables: {id: module.id, orderIndex: orderIndex}},
               {courseId, sortOrder: [{direction: 'ASC', fieldName: 'orderIndex'}]},
            );
         } finally {
            setIsSaving(false);
         }
      })();
   };

   /**
    * Change the autoplay setting.
    *
    * NOTE: the setting is saved in localStorage.
    *
    * @param event The even that changed autoplay.
    */
   const handleAutoplayChange = (event) => {
      setIsAutoplay((autoplayState) => ({...autoplayState, isAutoplay: event.target.checked}));
      localStorage.autoplayModule = event.target.checked ? 'true' : 'false';
   };

   return (
      <Stack
         name={'Knowledge center'}
         // height={'100%'}
         maxWidth={'100%'}
         width={{lg: isSuperAdmin ? 1264 : 1216, md: '100%'}}
         sx={{mx: 'auto', p: 1}}
         flexDirection={'column'}
         overflow={'hidden'}
      >
         <Box
            className={classes.buttonBack}
            onClick={() =>
               navigate(`..`, undefined, undefined, undefined, undefined, ['courseId', 'sectionId', 'moduleId'])
            }
            mb={2}
            width={'100%'}
         >
            <img src='/images/ic-back.png' alt='back button' className={classes.iconBack} />
            <TypographyFHG id='knowledgeCenter.back' color='text.green' variant='fs16700' />
         </Box>
         <Header title={course?.name} width={'max-content'} />
         <Loading isLoading={isSaving} />
         <Stack
            name={'Knowledge center'}
            gap={{lg: 3, md: 2, xs: 1}}
            width='100%'
            height='100%'
            flexDirection={'row'}
            overflow={'auto'}
         >
            <Box
               maxWidth={SECTION_PANEL_MAX_WIDTH}
               minWidth={SECTION_PANEL_MIN_WIDTH}
               sx={{p: 0.5, pl: '4px !important'}}
               height={'fit-content'}
            >
               {outletElement}
            </Box>
            <Box
               name={'Knowledge center'}
               className={classes.infoInnerSidebarStyle}
               overflow={'auto'}
               minWidth={290}
               // style={{width: isSuperAdmin ? 440 : 417}}
            >
               {!loading && modules !== null ? (
                  <List component='nav' aria-labelledby='nested-list-subheader' className={classes.listRoot}>
                     <Card key={refresh} className={classes.cardStyle} sx={{p: 4}}>
                        <Stack
                           flexDirection={'row'}
                           alignItems={'center'}
                           sx={{mb: 4}}
                           width={'100%'}
                           justifyContent={'space-between'}
                           flexWrap={'wrap'}
                        >
                           <Stack flexDirection={'row'} gap={1} mr={2}>
                              <TypographyFHG id='knowledgeCenter.modules' variant='fs28700' />
                              {isSuperAdmin && (
                                 <ButtonFHG
                                    name={'New Module'}
                                    labelKey='knowledgeCenter.newModule.button'
                                    variant={'contained'}
                                    startIcon={<AddCircleOutline />}
                                    onClick={handleNewModule}
                                    sx={{ml: 2}}
                                 />
                              )}
                           </Stack>
                           <FormControlLabel
                              control={
                                 <Switch
                                    checked={isAutoplay}
                                    onChange={handleAutoplayChange}
                                    name='autoplay'
                                    color='primary'
                                 />
                              }
                              label='Autoplay'
                              fullWidth={false}
                              className={classes.controlLabel}
                           />
                        </Stack>
                        {modules?.map((module, index) => (
                           <DragItem
                              key={'Module ' + module?.id}
                              index={index}
                              className={classes.fadeArea}
                              move={move}
                              onDrop={handleModuleSubmit}
                              dropItem={module}
                              showDragIndicator={isSuperAdmin && !moduleId}
                              disable={isEditingModule !== undefined || !isSuperAdmin}
                              itemType={MODULE_ITEM}
                           >
                              <Box key={'frame ' + index + module?.id} width={'100%'} overflow={'hidden'} px={0.5}>
                                 <Card
                                    sx={{mb: 1, cursor: 'pointer'}}
                                    onClick={
                                       isEditingModule !== index
                                          ? (event) => {
                                               event?.stopPropogation?.();
                                               event?.preventDefault?.();
                                               handleClick(module);
                                            }
                                          : undefined
                                    }
                                 >
                                    <Box className={classes.module}>
                                       {isEditingModule === index ? (
                                          <ModuleEdit
                                             key={'moduleEdit ' + index}
                                             module={moduleSelected}
                                             onClose={handleCloseModuleEdit}
                                          />
                                       ) : (
                                          <Stack
                                             flexDirection={'row'}
                                             alignItems={'center'}
                                             justifyContent={'space-between'}
                                             width={'100%'}
                                          >
                                             <Stack
                                                flexDirection={'row'}
                                                alignItems={'center'}
                                                gap={1}
                                                overflow={'hidden'}
                                             >
                                                <Box
                                                   width={14}
                                                   height={14}
                                                   borderRadius={'50%'}
                                                   minWidth={14}
                                                   backgroundColor={
                                                      module?.readByUser
                                                         ? 'background.brightGreen'
                                                         : 'background.lightGreen'
                                                   }
                                                />
                                                <TypographyFHG
                                                   variant='fs18400'
                                                   style={{textOverflow: 'ellipsis', overflow: 'hidden'}}
                                                >
                                                   {module?.name}
                                                </TypographyFHG>
                                                <DeleteEditButtons
                                                   onDelete={handleModuleDelete(module)}
                                                   onEdit={handleEditModule(module, index)}
                                                   type={'module'}
                                                   name={module?.name}
                                                />
                                             </Stack>
                                             {module?.id === moduleId ? (
                                                <KeyboardArrowDownIcon />
                                             ) : (
                                                <KeyboardArrowRight />
                                             )}
                                          </Stack>
                                       )}
                                    </Box>
                                 </Card>
                                 <Collapse
                                    key={refreshSection}
                                    in={module?.id === moduleId}
                                    timeout='auto'
                                    unmountOnExit
                                 >
                                    <List key={refreshSection} component='div' disablePadding sx={{cursor: 'pointer'}}>
                                       {sectionsRef.current?.length > 0 ? (
                                          sectionsRef.current.map((section, sectionIdx) => (
                                             <DragItem
                                                key={'Section ' + section?.id + ' ' + index}
                                                index={sectionIdx}
                                                className={classes.fadeArea}
                                                move={moveSection}
                                                onDrop={handleSectionSubmit}
                                                dropItem={section}
                                                showDragIndicator={isSuperAdmin}
                                                disable={!isSuperAdmin}
                                                itemType={SECTION_ITEM}
                                             >
                                                <ListItem
                                                   key={'sectionId ' + section?.id}
                                                   onClick={() => {
                                                      setModuleSelected(module);
                                                      setSectionIndex(sectionIdx);
                                                      setSearch((prev) => ({
                                                         ...prev,
                                                         sectionId: section?.id,
                                                         moduleId: module?.id,
                                                      }));
                                                   }}
                                                   className={[
                                                      classes.nestedListHeading,
                                                      section?.id === sectionId ? classes.selectedSection : '',
                                                   ]}
                                                >
                                                   <Box
                                                      width={10}
                                                      height={10}
                                                      borderRadius={'50%'}
                                                      minWidth={10}
                                                      backgroundColor={
                                                         section?.readByUser
                                                            ? 'background.brightGreen'
                                                            : 'background.lightGreen'
                                                      }
                                                      marginRight={1}
                                                   />

                                                   <ListItemText
                                                      primary={section.name}
                                                      sx={{
                                                         width: 'max-content',
                                                         overflow: 'hidden',
                                                         maxWidth: '98%',
                                                         p: 0.5,
                                                         flex: '0 0 auto',
                                                      }}
                                                      primaryTypographyProps={{
                                                         style: {textOverflow: 'ellipsis', overflow: 'hidden'},
                                                      }}
                                                   />
                                                   <DeleteEditButtons
                                                      onDelete={handleSectionDelete(section)}
                                                      onEdit={handleSectionEdit(section, index)}
                                                      name={section.name}
                                                      type={'section'}
                                                   />
                                                </ListItem>
                                             </DragItem>
                                          ))
                                       ) : (
                                          <TypographyFHG
                                             className={classes.nestedListHeading}
                                             id='knowledgeCenter.nodata'
                                          />
                                       )}
                                       {isSuperAdmin && (
                                          <ButtonFHG
                                             onClick={handleAddSection(module)}
                                             startIcon={<AddCircleOutline />}
                                             sx={{ml: 2, mr: 0.5, color: '#A3A3A3'}}
                                             labelKey={'knowledgeCenter.newSection.button'}
                                          />
                                       )}
                                    </List>
                                 </Collapse>
                              </Box>
                           </DragItem>
                        ))}
                     </Card>
                  </List>
               ) : (
                  <Loading isLoading={!outletElement} />
               )}
            </Box>
         </Stack>
      </Stack>
   );
}
