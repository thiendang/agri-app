import {AddCircleOutline} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {List} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {toLower} from 'lodash';
import {sortBy} from 'lodash';
import filter from 'lodash/filter';
import {useMemo} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {FOLDER_EDIT} from '../../Constants';
import {FOLDERS_DRAWER} from '../../Constants';
import {FOLDER_QUERY} from '../../data/QueriesGL';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import ListItemButtonFHG from '../../fhg/components/ListItemButtonFHG';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../../fhg/hooks/useNavigateSearch';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import ScrollStack from '../../fhg/ScrollStack';
import Header from '../Header';

const useStyles = makeStyles(
   (theme) => ({
      root: {
         margin: theme.spacing(0, 2),
      },
      listStyle: {
         borderRight: '1px solid lightgray',
         overflow: 'hidden',
         height: '100%',
      },
   }),
   {name: 'FoldersStyles'}
);

/**
 * Component to show the list of template folders.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Folders() {
   const classes = useStyles();
   const navigate = useNavigateSearch();
   const [{search}] = useCustomSearchParams();
   const location = useLocation();
   const folderId = location?.state?.folderId;
   const [folderData] = useQueryFHG(FOLDER_QUERY, undefined, 'folder.type');
   usePageTitle({titleKey: 'folder.title2.label'});

   /**
    * Sort the list of template folders.
    * @type {unknown}
    */
   const sortedFolders = useMemo(() => {
      let filteredFolders = [];

      if (folderData?.folders) {
         const sortedFolders = sortBy(folderData?.folders, 'name');

         if (search) {
            const lowerSearch = toLower(search);
            filteredFolders = filter(sortedFolders, (folder) => toLower(folder?.name)?.includes(lowerSearch));
         } else {
            filteredFolders = sortedFolders;
         }
      }
      return filteredFolders;
   }, [folderData?.folders, search]);

   /**
    * Create a new template folder.
    * @param event The event for creating the new folder.
    */
   const handleNewFolder = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      navigate(FOLDER_EDIT, {state: {folderId: 'new'}});
   };

   return (
      <SplitPane
         split={'vertical'}
         maxSize={FOLDERS_DRAWER * 1.25}
         minSize={FOLDERS_DRAWER * 0.75}
         defaultSize={FOLDERS_DRAWER}
         pane1Style={{overflow: 'hidden'}}
      >
         <Stack className={classes.listStyle} direction={'column'}>
            <Header idTitle={'folder.title.label'} width={'100%'} spacing={1} sx={{ml: 2}}>
               <ButtonFHG labelKey='folder.new.button' startIcon={<AddCircleOutline />} onClick={handleNewFolder} />
            </Header>
            <ScrollStack className={classes.root}>
               <List dense sx={{mb: 3}}>
                  {sortedFolders.map((folder) => (
                     <ListItemButtonFHG
                        key={folder?.id}
                        state={{folderId: folder.id}}
                        to={FOLDER_EDIT}
                        selected={folderId === folder.id}
                        primary={folder.name}
                        secondary={folder.description}
                     />
                  ))}
               </List>
            </ScrollStack>
         </Stack>
         <Outlet />
      </SplitPane>
   );
}
