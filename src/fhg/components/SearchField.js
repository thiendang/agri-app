import {Close} from '@mui/icons-material';
import {InputAdornment} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import SearchIcon from '@mui/icons-material/Search';
import {delay} from 'lodash';
import {omit} from 'lodash';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {useRef} from 'react';
import {useCallback} from 'react';
import React from 'react';
import {useCustomSearchParams} from '../hooks/useCustomSearchParams';
import useMessage from '../hooks/useMessage';
import TextFieldFHG from '../../components/TextField';
import {DARK_MODE_COLORS} from '../../Constants';

const useStyles = makeStyles(
   (theme) => ({
      '::placeholder': {
         color: '#1796a4 !important',
      },
      textFieldStyle: {
         marginTop: theme.spacing(1),
         marginBottom: 0,
         // border: '1px red solid',
         // borderRadius: '8px',
         // borderColor: DARK_MODE_COLORS.Card_2_Stroke,
         '& input': {
            transition: theme.transitions.create('width'),
            [theme.breakpoints.up('sm')]: {
               width: 180,
               '&:focus': {
                  width: 200,
               },
            },
            // padding: 8,
         },
         '& .MuiInput-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiOutlinedInput-root': {
            color: theme.palette.text.primary,
         },
      },
   }),
   {name: 'searchFilterStyles'},
);

/**
 * The search field to be in a header or table.
 *
 * Reviewed: 3/26/20
 *
 * @param placeholder The placeholder text for the search.
 * @param placeholderKey The placeholder key for the text for the search.
 * @return {*}
 * @constructor
 */
export default function SearchField({placeholder, placeholderKey = 'search.placeholder'}) {
   const classes = useStyles();
   const [{search}, setSearchParams] = useCustomSearchParams();

   const usePlaceholder = useMessage(placeholderKey, placeholder);
   const [isHover, setIsHover] = useState(false);
   const [isSaving, setIsSaving] = useState(false);

   /**
    * Handle the changes to the search TextField.
    * @param e The change event.
    */
   const handleChange = (e) => {
      handleSearchDebounced(e?.target?.value || undefined, setSearchParams);
   };

   const setSearchParamsNow = useCallback((search, setSearchParams) => {
      try {
         setIsSaving(true);
         setSearchParams((searchParams) => {
            if (search) {
               return {...searchParams, search};
            }
            return omit(searchParams, 'search');
         });
         delay(() => {
            document.getElementById('search')?.focus();
            setIsSaving(false);
         }, 100);
      } catch {
         setIsSaving(false);
      }
   }, []);

   // Debounce the search.
   const handleSearchDebounced = useRef(debounce(setSearchParamsNow, 750)).current;

   const handleCancel = () => {
      setSearchParams((searchParams) => omit(searchParams, 'search'));
   };

   const handleHover = () => {
      setIsHover(true);
   };
   const useSearch = search ? (search === 'undefined' || search === 'null' ? null : search) : null;

   return (
      <TextFieldFHG
         id={'search'}
         key={search}
         name={'search'}
         margin={'normal'}
         defaultValue={useSearch || ''}
         className={classes.textFieldStyle}
         onChange={handleChange}
         placeholder={usePlaceholder}
         onMouseEnter={handleHover}
         onMouseLeave={() => setIsHover(false)}
         InputProps={{
            startAdornment: (
               <InputAdornment position='start' style={{cursor: 'pointer'}}>
                  {isHover && search && !isSaving ? <Close onClick={handleCancel} /> : <SearchIcon />}
               </InputAdornment>
            ),
         }}
      />
   );
}

SearchField.propTypes = {
   searchText: PropTypes.string,
   placeholder: PropTypes.string,
};
