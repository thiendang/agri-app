import {Stack} from '@mui/material';
import {List} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Add} from '@mui/icons-material';
import {sortBy} from 'lodash';
import filter from 'lodash/filter';
import {useMemo} from 'react';
import React from 'react';
import {Outlet} from 'react-router-dom';
import {useParams} from 'react-router-dom';
import Header from '../../../components/Header';
import {MODULE_PATH} from '../../../Constants';
import {USER_EDIT} from '../../../Constants';
import {MODULES_ALL_QUERY} from '../../../data/QueriesGL';
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
   {name: 'ModulesStyles'},
);

export default function Modules() {
   const [{search}] = useCustomSearchParams();
   const classes = useStyles();
   const navigate = useNavigateSearch();
   const {userId} = useParams();

   const [moduleData] = useQueryFHG(MODULES_ALL_QUERY, undefined, 'module.type');
   usePageTitle({titleKey: 'module.title'});

   const sortedModules = useMemo(() => {
      let modules = [];

      if (moduleData?.modules) {
         const sortedModules = sortBy(moduleData?.modules, 'name');
         if (search) {
            modules = filter(sortedModules, (user) => user.contactName?.includes(search));
         } else {
            modules = sortedModules;
         }
      }
      return modules;
   }, [search, moduleData?.modules]);

   const handleNew = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      navigate(USER_EDIT, {replace: true}, {id: undefined});
   };

   return (
      <Stack direction={'row'} wrap={'nowrap'} height={'100%'}>
         <Stack className={classes.listStyle} direction={'column'}>
            <Stack direction={'row'} spacing={2}>
               <Header idTitle={'module.title'}>
                  <ButtonFHG labelKey='module.new.button' startIcon={<Add />} onClick={handleNew} />
               </Header>
            </Stack>
            <ScrollStack className={classes.root}>
               <List dense>
                  {sortedModules.map((module) => (
                     <ListItemButtonFHG
                        key={module?.id}
                        search={{moduleId: module.id}}
                        to={`./${MODULE_PATH}`}
                        selected={userId === module.id}
                        primary={module.name}
                     />
                  ))}
               </List>
            </ScrollStack>
         </Stack>
         <Outlet />
      </Stack>
   );
}
