import {AddCircleOutline} from '@mui/icons-material';
import {Stack} from '@mui/material';
import {List} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {sortBy} from 'lodash';
import {matchSorter} from 'match-sorter';
import {useMemo} from 'react';
import React from 'react';
import {useLocation} from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {ADMIN_PANEL_MAX_WIDTH} from '../Constants';
import {MEMBERSHIP_ALL_QUERY} from '../data/QueriesGL';
import ButtonFHG from '../fhg/components/ButtonFHG';
import {MEMBERSHIP_EDIT} from '../Constants';
import ListItemButtonFHG from '../fhg/components/ListItemButtonFHG';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import {useCustomSearchParams} from '../fhg/hooks/useCustomSearchParams';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';
import usePageTitle from '../fhg/hooks/usePageTitle';
import ScrollStack from '../fhg/ScrollStack';
import Header from './Header';

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
   {name: 'MembershipsStyles'},
);

/**
 * Component to show the list of template memberships.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Memberships() {
   const classes = useStyles();
   const navigate = useNavigateSearch();
   const [{search}] = useCustomSearchParams();
   const location = useLocation();
   const membershipId = location?.state?.membershipId;
   const [data] = useQueryFHG(MEMBERSHIP_ALL_QUERY, undefined, 'membership.type');
   usePageTitle({titleKey: 'membership.title2.label'});

   /**
    * Sort the list of memberships.
    * @type {unknown}
    */
   const sortedMemberships = useMemo(() => {
      let sortedMemberships = [];

      if (data?.memberships) {
         if (search) {
            sortedMemberships = matchSorter(data?.memberships, search, {
               keys: ['name', 'description', 'stripeProductId'],
            });
         } else {
            sortedMemberships = sortBy(data?.memberships, 'name');
         }
      }
      return sortedMemberships;
   }, [data?.memberships, search]);

   /**
    * Create a new membership.
    * @param event The event for creating the new membership.
    */
   const handleNew = (event) => {
      event?.stopPropagation();
      event?.preventDefault();

      navigate(MEMBERSHIP_EDIT, {state: {membershipId: 'new'}});
   };

   return (
      <SplitPane
         split={'vertical'}
         maxSize={ADMIN_PANEL_MAX_WIDTH * 1.25}
         minSize={ADMIN_PANEL_MAX_WIDTH * 0.85}
         defaultSize={ADMIN_PANEL_MAX_WIDTH}
         pane1Style={{overflow: 'hidden'}}
      >
         <Stack className={classes.listStyle} direction={'column'}>
            <Header idTitle={'membership.title2.label'} width={'100%'} spacing={1} sx={{ml: 2}}>
               <ButtonFHG labelKey='membership.new.button' startIcon={<AddCircleOutline />} onClick={handleNew} />
            </Header>
            <ScrollStack className={classes.root}>
               <List dense sx={{mb: 3}}>
                  {sortedMemberships.map((membership) => (
                     <ListItemButtonFHG
                        key={membership?.id}
                        state={{membershipId: membership.id}}
                        to={MEMBERSHIP_EDIT}
                        selected={membershipId === membership.id}
                        primary={membership.name}
                        secondary={membership.description}
                     />
                  ))}
               </List>
            </ScrollStack>
         </Stack>
         <Outlet />
      </SplitPane>
   );
}
