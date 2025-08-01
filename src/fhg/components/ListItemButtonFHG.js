import {ListItemIcon} from '@mui/material';
import {ListItemButton} from '@mui/material';
import {ListItemText} from '@mui/material';
import {pick} from 'lodash';
import {stringify} from 'query-string';
import {useMemo} from 'react';
import * as React from 'react';
import {Link, useMatch, useResolvedPath} from 'react-router-dom';

import {makeStyles, useTheme} from '@mui/styles';
import usePermission from '../../components/permission/usePermission';
import {allowNavigate} from '../hooks/useBlocker';
import {useCustomSearchParams} from '../hooks/useCustomSearchParams';
import useWidthRule from '../hooks/useWidthRule';
import {useSetRecoilState} from 'recoil';
import {drawerIsOpenStatus} from './ResponsiveMobileDrawer';
import LockIcon from '@mui/icons-material/Lock';

export const MAIN = 'main';
export const SECOND = 'second';

const useStyles = makeStyles(
   (theme) => ({
      linkPadding: {
         paddingRight: 0,
         borderRadius: '8px',
      },
      primaryStyle: {
         textTransform: 'uppercase',
         opacity: '0.65',
      },
      secondaryStyle: {
         paddingLeft: theme.spacing(1),
      },
      root: {
         color: theme.palette.text.primary,
         '&.MuiButtonBase-root.MuiListItemButton-root.Mui-selected': {
            backgroundColor: 'unset',
            color: theme.palette.primary.main,
         },
      },
   }),
   {name: 'LinkFhgStyles'},
);

export default function ListItemButtonFHG({
   primary,
   secondary,
   disabled,
   variant = SECOND,
   children,
   to = '',
   search,
   hasSearch = true,
   searchParamsAllowed,
   onClick,
   toSelect = '',
   exact = false,
   startIcon,
   permission,
   ...props
}) {
   const classes = useStyles();
   const theme = useTheme();
   const [searchParams] = useCustomSearchParams();
   let resolved = useResolvedPath(toSelect || to);
   let match = useMatch({path: resolved.pathname, end: true});
   let match2 = useMatch({path: resolved.pathname + '/*'});
   const useSearchParams = searchParamsAllowed?.length > 0 ? pick(searchParams, searchParamsAllowed) : searchParams;
   const searchString = typeof search === 'string' ? search : stringify({...useSearchParams, ...search});
   const useTo =
      to || search || hasSearch || searchParamsAllowed
         ? typeof to === 'string'
            ? {pathname: to, search: searchString}
            : {...to, search: searchString}
         : to;
   const setIsDrawerOpen = useSetRecoilState(drawerIsOpenStatus);
   const isSmallWidth = useWidthRule('down', 'md');
   const testOnClick = (event) => {
      if (!allowNavigate()) {
         event?.preventDefault();
      } else {
         onClick?.(event);
      }
      if (isSmallWidth) {
         setIsDrawerOpen(false);
      }
   };
   const hasPermission = usePermission(permission, true);

   const isSelected = useMemo(() => {
      if (props?.selected !== undefined) {
         return props.selected;
      }
      return !!match || (!exact && !!match2);
   }, [props?.selected, match, match2, exact]);

   if (variant === MAIN) {
      return (
         <ListItemButton
            component={Link}
            className={`${classes.linkPadding} ${classes.root}`}
            to={useTo}
            selected={isSelected}
            onClick={testOnClick}
            disabled={disabled}
            {...props}
         >
            {startIcon && <ListItemIcon sx={{minWidth: 30}}>{startIcon}</ListItemIcon>}
            {(primary || secondary) && (
               <ListItemText
                  primary={primary}
                  secondary={secondary}
                  classes={{primary: classes.primaryStyle}}
               disableTypography={typeof primary !== 'string'}
               primaryTypographyProps={
                  typeof primary === 'string' ? {variant: 'subtitle2', color: 'text.primary'} : undefined
               }
               />
            )}
            {!hasPermission && (
               <ListItemIcon>
                  <LockIcon />
               </ListItemIcon>
            )}
            {children}
         </ListItemButton>
      );
   } else if (variant === SECOND) {
      return (
         <ListItemButton
            component={Link}
            className={`${classes.linkPadding} ${classes.root}`}
            to={useTo}
            selected={isSelected}
            onClick={testOnClick}
            disabled={disabled}
            style={{
               backgroundColor: isSelected ? (theme.palette.mode === 'dark' ? '#4C5343' : '#dfebd1') : 'transparent',
            }}
            {...props}
         >
            {startIcon && <ListItemIcon sx={{minWidth: 30}}>{startIcon}</ListItemIcon>}{' '}
            <ListItemText
               primary={primary}
               secondary={secondary}
               disableTypography={typeof primary !== 'string'}
               primaryTypographyProps={
                  typeof primary === 'string'
                     ? {
                          variant: isSelected ? 'fs18700' : 'subtitle1',
                          color: 'text.primary',
                          style: {
                             textDecorationStyle: 'solid',
                          },
                       }
                     : undefined
               }
            />
            {!hasPermission && (
               <ListItemIcon>
                  <LockIcon />
               </ListItemIcon>
            )}
            {children}
         </ListItemButton>
      );
   }
}
