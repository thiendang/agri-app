import {Stack} from '@mui/material';
import {List} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Add} from '@mui/icons-material';
import {sortBy} from 'lodash';
import filter from 'lodash/filter';
import {useMemo} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import Header from '../../../components/Header';
import {NEW_EDIT} from '../../../Constants';
import {SECTION_ALL_QUERY} from '../../../data/QueriesGL';
import ButtonFHG from '../../../fhg/components/ButtonFHG';
import ListItemButtonFHG from '../../../fhg/components/ListItemButtonFHG';
import useQueryFHG from '../../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../../fhg/hooks/usePageTitle';
import ScrollStack from '../../../fhg/ScrollStack';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(0, 2),
      },
      listStyle: {
         borderRight: '1px solid lightgray',
      },
   }),
   {name: 'SectionsStyles'},
);

export default function Sections() {
   const [{search, moduleId, sectionId}] = useCustomSearchParams();
   const classes = useStyles();
   const navigate = useNavigateSearch();
   const location = useLocation();

   const [sectionData] = useQueryFHG(SECTION_ALL_QUERY, {moduleId}, 'section.type');
   usePageTitle({titleKey: 'section.title'});

   const sortedSections = useMemo(() => {
      let sections = [];

      if (sectionData?.sections) {
         const sortedSections = sortBy(sectionData?.sections, 'name');
         if (search) {
            sections = filter(sortedSections, (user) => user.contactName?.includes(search));
         } else {
            sections = sortedSections;
         }
      }
      return sections;
   }, [search, sectionData?.sections]);

   const handleNew = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      navigate('./', {replace: true, state: {sectionId: NEW_EDIT}});
   };

   return (
      <Stack direction={'row'} wrap={'nowrap'} height={'100%'}>
         <Stack className={classes.listStyle} direction={'column'}>
            <Stack direction={'row'} spacing={2}>
               <Header idTitle={'section.title'}>
                  <ButtonFHG labelKey='section.new.button' startIcon={<Add />} onClick={handleNew} />
               </Header>
            </Stack>
            <ScrollStack className={classes.root}>
               <List dense>
                  {sortedSections.map((section) => (
                     <ListItemButtonFHG
                        key={section?.id}
                        search={{moduleId: section.moduleId}}
                        state={{sectionId: section.id}}
                        to={'./'}
                        selected={sectionId === section.id}
                        primary={section.name}
                     />
                  ))}
               </List>
            </ScrollStack>
         </Stack>
         <Outlet />
      </Stack>
   );
}
