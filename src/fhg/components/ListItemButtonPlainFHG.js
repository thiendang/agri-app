import {ListItemIcon} from '@mui/material';
import {ListItemButton} from '@mui/material';
import {ListItemText} from '@mui/material';
import * as React from 'react';
import {Link} from 'react-router-dom';

import {makeStyles} from '@mui/styles';
import useMessage from '../hooks/useMessage';

export const MAIN = 'main';
export const SECOND = 'second';

const useStyles = makeStyles(
   (theme) => ({
      linkPadding: {
         paddingRight: 0,
      },
      primaryStyle: {
         // textTransform: 'uppercase',
         // opacity: '0.65',
      },
   }),
   {name: 'LinkFhgStyles'},
);

export default function ListItemButtonPlainFHG({
   primary,
   secondary,
   primaryKey,
   secondaryKey,
   variant = SECOND,
   startIcon,
   children,
   ...props
}) {
   const classes = useStyles();
   const primaryLabel = useMessage(primaryKey, primary);
   const secondaryLabel = useMessage(secondaryKey, secondary);

   if (variant === MAIN) {
      return (
         <ListItemButton component={Link} className={classes.linkPadding} {...props}>
            {startIcon && <ListItemIcon sx={{minWidth: 30}}>{startIcon}</ListItemIcon>}
            <ListItemText
               primary={primaryLabel}
               secondary={secondaryLabel}
               classes={{primary: classes.primaryStyle}}
               primaryTypographyProps={{variant: 'subtitle1'}}
            />
            {children}
         </ListItemButton>
      );
   } else if (variant === SECOND) {
      return (
         <ListItemButton component={Link} className={classes.linkPadding} {...props}>
            {startIcon && <ListItemIcon>{startIcon}</ListItemIcon>}
            <ListItemText
               primary={primaryLabel}
               secondary={secondaryLabel}
               style={{'& .MuiListItemText-root': {flex: 'unset'}}}
               sx={{width: 'fit-content', mr: 1}}
               primaryTypographyProps={{variant: 'subtitle2', color: 'secondary'}}
            />
            {children}
         </ListItemButton>
      );
   } else {
      console.log('variant invalid', variant);
      return null;
   }
}
