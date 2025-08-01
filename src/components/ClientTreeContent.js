import Box from '@mui/material/Box';
import find from 'lodash/find';
import * as PropTypes from 'prop-types';
import React from 'react';
import {CLIENT_EDIT} from '../Constants';
import {CITY_STATE_QUERY} from '../data/QueriesGL';
import TypographyFHG from '../fhg/components/Typography';
import useQueryFHG from '../fhg/hooks/data/useQueryFHG';
import useNavigateSearch from '../fhg/hooks/useNavigateSearch';

ClientTreeContent.propTypes = {
   classes: PropTypes.any,
   client: PropTypes.any,
};

export function ClientTreeContent({client, classes}) {
   const navigate = useNavigateSearch();

   const [cityStateData] = useQueryFHG(CITY_STATE_QUERY, undefined, 'options.type');
   const selectedState = find(cityStateData?.states, {id: client?.stateId});
   const selectedCity = find(cityStateData?.cities, {id: client?.cityId});

   const handleEditClient = (event) => {
      if (event) {
         event.stopPropagation();
         event.preventDefault();
      }
      navigate(CLIENT_EDIT, {replace: true, state: {isNew: false}});
   };

   return (
      <Box className={`${classes.fadeArea} ${classes.treeLabelStyle}`} onClick={handleEditClient}>
         <TypographyFHG variant='subtitle1' color={'text.primary'}>
            {client?.name}
         </TypographyFHG>
         <TypographyFHG variant='body2' color={'text.primary'}>
            {client?.addressLineOne || ''}
         </TypographyFHG>
         <TypographyFHG variant='body2' color={'text.primary'}>
            {client?.addressLineTwo || ''}
         </TypographyFHG>
         {(selectedCity || selectedState) && (
            <TypographyFHG variant='body2' color={'text.primary'} gutterBottom>
               {`${selectedCity?.name || ''}, ${selectedState?.abbreviation || ''} ${client?.zipCode || ''}`}
            </TypographyFHG>
         )}
         <TypographyFHG variant='body2' color={'text.primary'}>
            {client?.phone || ''}
         </TypographyFHG>
         <TypographyFHG variant='body2' color={'text.primary'}>
            {client?.email || ''}
         </TypographyFHG>
      </Box>
   );
}
